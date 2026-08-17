import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { hashPassword } from '../src/auth.js'

const processes: ChildProcess[] = []
const directories: string[] = []
afterEach(async () => {
  for (const child of processes.splice(0)) child.kill()
  await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

describe('mobile BFF authentication', () => {
  it('supports bearer and web sessions concurrently', async () => {
    const port = await freePort()
    const state = await mkdtemp(join(tmpdir(), 'rhophi-bff-'))
    const web = await mkdtemp(join(tmpdir(), 'rhophi-web-'))
    directories.push(state, web)
    await writeFile(join(web, 'index.html'), '<html></html>')
    const origin = `http://127.0.0.1:${port}`
    const child = spawn(process.execPath, [join(process.cwd(), 'node_modules/tsx/dist/cli.mjs'), 'packages/webui-bff/src/main.ts'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        WEBUI_BIND: '127.0.0.1',
        WEBUI_PORT: String(port),
        WEBUI_PUBLIC_ORIGIN: origin,
        MOBILE_ALLOWED_ORIGINS: 'https://localhost',
        WEBUI_ROOT: web,
        WEBUI_ADMIN_USERNAME: 'admin',
        WEBUI_ADMIN_PASSWORD_HASH: await hashPassword('integration-password'),
        WEBUI_STATE_DIR: state,
        MQTT_URL: 'mqtt://127.0.0.1:65534',
        MQTT_USERNAME: 'test',
        MQTT_PASSWORD: 'test',
        LOG_LEVEL: 'silent',
      },
      stdio: 'ignore',
    })
    processes.push(child)
    await waitUntilReady(origin)

    const webLogin = await fetch(`${origin}/api/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'integration-password' }),
    })
    expect(webLogin.status).toBe(200)
    const cookie = webLogin.headers.get('set-cookie')?.split(';')[0]
    expect(cookie).toMatch(/^__Host-sid=/)

    const mobileLogin = await fetch(`${origin}/api/mobile/login`, {
      method: 'POST',
      headers: { Origin: 'https://localhost', 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'integration-password' }),
    })
    expect(mobileLogin.status).toBe(200)
    expect(mobileLogin.headers.get('access-control-allow-origin')).toBe('https://localhost')
    const mobile = await mobileLogin.json() as { token: string; csrf_token?: string }
    expect(mobile.token).toHaveLength(43)
    expect(mobile.csrf_token).toBeUndefined()

    const mobileSession = await fetch(`${origin}/api/session`, {
      headers: { Origin: 'https://localhost', Authorization: `Bearer ${mobile.token}` },
    })
    expect(mobileSession.status).toBe(200)
    const webSession = await fetch(`${origin}/api/session`, { headers: { Cookie: cookie ?? '' } })
    expect(webSession.status).toBe(200)

    const webLogoutWithoutCsrf = await fetch(`${origin}/api/logout`, {
      method: 'POST',
      headers: { Origin: origin, Cookie: cookie ?? '' },
    })
    expect(webLogoutWithoutCsrf.status).toBe(403)

    expect((await fetch(`${origin}/api/logout`, {
      method: 'POST',
      headers: { Origin: 'https://localhost', Authorization: `Bearer ${mobile.token}` },
    })).status).toBe(204)
    expect((await fetch(`${origin}/api/session`, {
      headers: { Origin: 'https://localhost', Authorization: `Bearer ${mobile.token}` },
    })).status).toBe(401)
  }, 15_000)
})

async function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') return reject(new Error('Unable to reserve port'))
      server.close(() => resolve(address.port))
    })
  })
}

async function waitUntilReady(origin: string) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(`${origin}/api/health`)).ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('BFF did not start')
}
