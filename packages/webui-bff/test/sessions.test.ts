import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SessionStore } from '../src/sessions.js'

const dirs: string[] = []
afterEach(() => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

async function store(max = 5) {
  const dir = await mkdtemp(join(tmpdir(), 'bff-'))
  dirs.push(dir)
  const sessions = new SessionStore(dir, 10_000, 10_000, max)
  await sessions.load()
  return { dir, sessions }
}

describe('sessions', () => {
  it('persists only token digests and revokes sessions', async () => {
    const { dir, sessions } = await store()
    const created = await sessions.create('admin', 'mobile')
    const persisted = await readFile(join(dir, 'sessions.json'), 'utf8')

    expect(persisted).not.toContain(created.sid)
    const reloaded = new SessionStore(dir, 10_000, 10_000)
    await reloaded.load()
    expect(reloaded.get(created.sid, 'mobile')?.username).toBe('admin')
    await reloaded.revoke(created.sid)
    expect(reloaded.get(created.sid)).toBeUndefined()
  })

  it('keeps web and mobile sessions concurrently', async () => {
    const { sessions } = await store()
    const web = await sessions.create('admin', 'web')
    const mobile = await sessions.create('admin', 'mobile')

    expect(sessions.get(web.sid, 'web')).toBeDefined()
    expect(sessions.get(mobile.sid, 'mobile')).toBeDefined()
    expect(sessions.get(web.sid, 'mobile')).toBeUndefined()
  })

  it('limits sessions per user and kind without evicting other kinds', async () => {
    const { sessions } = await store(2)
    const web = await sessions.create('admin', 'web')
    const first = await sessions.create('admin', 'mobile')
    const second = await sessions.create('admin', 'mobile')
    const third = await sessions.create('admin', 'mobile')

    expect(sessions.get(first.sid)).toBeUndefined()
    expect(sessions.get(second.sid, 'mobile')).toBeDefined()
    expect(sessions.get(third.sid, 'mobile')).toBeDefined()
    expect(sessions.get(web.sid, 'web')).toBeDefined()
  })
})
