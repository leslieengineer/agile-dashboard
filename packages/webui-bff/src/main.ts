import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { CommandInputSchema, MobileLoginRequestSchema, LoginRequestSchema, MAX_PAYLOAD_BYTES } from '@agile/contracts'
import {
  EncryptedFileDeviceProvisioningRegistry,
  FileProvisioningTransactionStore,
  FileThreadDatasetProvider,
  ProvisioningService,
  ProvisioningServiceError,
} from '@agile/provisioning'
import pino from 'pino'
import { hashPassword, verifyPassword } from './auth.js'
import { loadConfig } from './config.js'
import { MqttBridge } from './bridge.js'
import { SessionStore, type Session } from './sessions.js'
import { ControllerManagementClient } from './controllerManagementClient.js'
import { ProvisioningCoordinator } from './provisioningCoordinator.js'
import { handleProvisioningRoute } from './provisioningRoutes.js'

if (process.argv[2] === 'hash-password') {
  let password = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', chunk => password += chunk)
  process.stdin.on('end', async () => console.log(await hashPassword(password.trimEnd())))
} else {
  void start()
}

async function start() {
  const config = loadConfig()
  const log = pino({
    level: config.LOG_LEVEL,
    redact: [
      'password', '*.password', 'req.headers.authorization', 'req.headers.cookie',
      'grant', '*.grant', 'challenge', '*.challenge', 'proof', '*.proof',
      'thread_operational_dataset', '*.thread_operational_dataset', 'setup_passcode', '*.setup_passcode',
    ],
  })
  const sessions = new SessionStore(
    config.WEBUI_STATE_DIR,
    config.WEBUI_SESSION_TTL_S * 1000,
    config.WEBUI_SESSION_IDLE_S * 1000,
  )
  await sessions.load()
  const bridge = new MqttBridge(config.MQTT_URL, config.MQTT_USERNAME, config.MQTT_PASSWORD)
  const streams = new Map<ServerResponse, Session>()
  const mobileOrigins = new Set(config.MOBILE_ALLOWED_ORIGINS.split(',').map(value => value.trim()).filter(Boolean))
  let eventId = 0
  const publishEvent = (value: unknown) => {
    const data = `id: ${++eventId}\nevent: message\ndata: ${JSON.stringify(value)}\n\n`
    for (const [response] of streams) {
      if (!response.write(data)) response.destroy()
    }
  }
  bridge.listeners.add(publishEvent)

  const provisioning = config.PROVISIONING_ENABLED
    ? new ProvisioningCoordinator(
        new ProvisioningService(
          new EncryptedFileDeviceProvisioningRegistry(
            config.PROVISIONING_REGISTRY_PATH,
            config.PROVISIONING_REGISTRY_KEY_FILE,
          ),
          new FileThreadDatasetProvider(config.THREAD_DATASET_PATH),
          { transactionStore: new FileProvisioningTransactionStore(config.PROVISIONING_TRANSACTION_PATH) },
        ),
        new ControllerManagementClient(config.MATTER_SOCKET_PATH),
      )
    : undefined
  provisioning?.listeners.add(publishEvent)

  setInterval(() => {
    for (const [response, session] of streams) {
      if (!sessions.hasHash(session.hash)) {
        response.end()
        streams.delete(response)
        continue
      }
      response.write(': ping\n\n')
    }
  }, 15_000).unref()

  const failures = new Map<string, { count: number; until: number }>()
  const server = createServer(async (request, response) => {
    try {
      securityHeaders(response)
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
      if (url.pathname.startsWith('/api/')) {
        const mobileOrigin = applyMobileCors(request, response, mobileOrigins)
        if (request.method === 'OPTIONS') {
          return mobileOrigin
            ? json(response, 204, undefined)
            : json(response, 403, { error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin rejected' } })
        }

        if (request.method === 'POST' && url.pathname === '/api/login') {
          if (!webOriginOk(request, config.WEBUI_PUBLIC_ORIGIN)) {
            return json(response, 403, { error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin rejected' } })
          }
          const input = LoginRequestSchema.parse(await readBody(request))
          const created = await authenticate(input, request, failures, config, sessions, 'web', response)
          if (!created) return
          response.setHeader('Set-Cookie', `__Host-sid=${created.sid}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${config.WEBUI_SESSION_TTL_S}`)
          return json(response, 200, webSessionInfo(created.session, sessions))
        }

        if (request.method === 'POST' && url.pathname === '/api/mobile/login') {
          if (!mobileOrigin) {
            return json(response, 403, { error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin rejected' } })
          }
          const input = MobileLoginRequestSchema.parse(await readBody(request))
          const created = await authenticate(input, request, failures, config, sessions, 'mobile', response)
          if (!created) return
          return json(response, 200, {
            token: created.sid,
            ...mobileSessionInfo(created.session, sessions),
          })
        }

        const token = bearerToken(request)
        const sid = cookie(request, '__Host-sid')
        const session = token ? sessions.get(token, 'mobile') : sessions.get(sid, 'web')
        const bearerAuthenticated = Boolean(token && session)

        if (request.method === 'GET' && url.pathname === '/api/session') {
          if (!session) return json(response, 401, { error: { code: 'UNAUTHENTICATED', message: 'Login required' } })
          return json(response, 200, bearerAuthenticated
            ? mobileSessionInfo(session, sessions)
            : webSessionInfo(session, sessions))
        }
        if (request.method === 'GET' && url.pathname === '/api/health') {
          return json(response, 200, { ok: true, mqtt_connected: bridge.connected, sse_clients: streams.size })
        }
        if (!session) {
          return json(response, 401, { error: { code: 'UNAUTHENTICATED', message: 'Login required' } })
        }
        if (request.method !== 'GET') {
          const originAccepted = bearerAuthenticated ? mobileOrigin : webOriginOk(request, config.WEBUI_PUBLIC_ORIGIN)
          if (!originAccepted) {
            return json(response, 403, { error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin rejected' } })
          }
          if (!bearerAuthenticated && !sessions.csrfValid(session, header(request, 'x-csrf-token'))) {
            return json(response, 403, { error: { code: 'CSRF_INVALID', message: 'CSRF rejected' } })
          }
        }

        if (provisioning && (url.pathname.startsWith('/api/commissioning/') || url.pathname === '/api/devices' || url.pathname.startsWith('/api/devices/'))) {
          const route = await handleProvisioningRoute(
            provisioning,
            request.method ?? 'GET',
            url.pathname,
            request.method === 'POST' ? await readBody(request) : undefined,
          )
          if (route) return json(response, route.status, route.body)
        }

        if (request.method === 'POST' && url.pathname === '/api/logout') {
          await sessions.revoke(bearerAuthenticated ? token : sid)
          if (!bearerAuthenticated) {
            response.setHeader('Set-Cookie', '__Host-sid=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
          }
          return json(response, 204, undefined)
        }
        if (request.method === 'POST' && url.pathname === '/api/command') {
          const input = CommandInputSchema.parse(await readBody(request))
          return json(response, 200, await bridge.send(input))
        }
        if (request.method === 'GET' && url.pathname === '/api/events') {
          response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
          })
          response.write('retry: 3000\n\n')
          streams.set(response, session)
          request.on('close', () => streams.delete(response))
          return
        }
        return json(response, 404, { error: { code: 'BAD_REQUEST', message: 'Not found' } })
      }
      await staticFile(config.WEBUI_ROOT, url.pathname, response)
    } catch (error) {
      log.warn({ err: error }, 'request failed')
      if (error instanceof ProvisioningServiceError) {
        const statusByCode: Record<string, number> = {
          TRANSACTION_NOT_FOUND: 404,
          TRANSACTION_CONFLICT: 409,
          CLAIM_EXPIRED: 410,
          CLAIM_RATE_LIMITED: 429,
          INVALID_DEVICE: 422,
          CLAIM_INVALID: 422,
          CLAIM_REPLAYED: 422,
          TRANSACTION_STATE_INVALID: 422,
          BBB_COMMISSION_FAILED: 502,
          SUBSCRIPTION_FAILED: 502,
        }
        return json(response, statusByCode[error.code] ?? 500, {
          error: { code: error.code, message: error.message, retryable: error.retryable },
        })
      }
      json(response, 400, {
        error: { code: 'BAD_REQUEST', message: error instanceof Error ? error.message : 'Request failed' },
      })
    }
  })

  server.listen(config.WEBUI_PORT, config.WEBUI_BIND, () => {
    log.info({ bind: config.WEBUI_BIND, port: config.WEBUI_PORT }, 'webui-bff ready')
  })
  const stop = async () => {
    for (const [response] of streams) response.end()
    server.close()
    await bridge.close()
  }
  process.once('SIGTERM', () => void stop())
  process.once('SIGINT', () => void stop())
}

async function authenticate(
  input: { username: string; password: string },
  request: IncomingMessage,
  failures: Map<string, { count: number; until: number }>,
  config: ReturnType<typeof loadConfig>,
  sessions: SessionStore,
  kind: 'web' | 'mobile',
  response: ServerResponse,
) {
  const ip = request.socket.remoteAddress ?? 'unknown'
  const failure = failures.get(ip)
  if (failure && failure.until > Date.now()) {
    json(response, 429, { error: { code: 'RATE_LIMITED', message: 'Try later' } })
    return
  }
  const valid = input.username === config.WEBUI_ADMIN_USERNAME
    && await verifyPassword(input.password, config.WEBUI_ADMIN_PASSWORD_HASH)
  if (!valid) {
    const count = (failure?.count ?? 0) + 1
    failures.set(ip, { count, until: count >= 5 ? Date.now() + 900_000 : 0 })
    json(response, 401, { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } })
    return
  }
  failures.delete(ip)
  return sessions.create(input.username, kind)
}

function webSessionInfo(session: Session, store: SessionStore) {
  return {
    authenticated: true as const,
    username: session.username,
    csrf_token: session.csrf,
    expires_at: store.expiresAt(session),
  }
}

function mobileSessionInfo(session: Session, store: SessionStore) {
  return {
    authenticated: true as const,
    username: session.username,
    expires_at: store.expiresAt(session),
  }
}

function bearerToken(request: IncomingMessage) {
  const value = header(request, 'authorization')
  const match = /^Bearer ([A-Za-z0-9_-]{43,128})$/.exec(value ?? '')
  return match?.[1]
}

function header(request: IncomingMessage, name: string) {
  const value = request.headers[name]
  return Array.isArray(value) ? value[0] : value
}

function cookie(request: IncomingMessage, name: string) {
  for (const part of (request.headers.cookie ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
}

function webOriginOk(request: IncomingMessage, origin: string) {
  return request.headers.origin === origin && request.headers.host === new URL(origin).host
}

function applyMobileCors(request: IncomingMessage, response: ServerResponse, allowed: Set<string>) {
  const origin = request.headers.origin
  if (!origin || !allowed.has(origin)) return false
  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Last-Event-ID')
  response.setHeader('Access-Control-Max-Age', '600')
  response.setHeader('Vary', 'Origin')
  return true
}

async function readBody(request: IncomingMessage) {
  let value = ''
  for await (const chunk of request) {
    value += chunk
    if (Buffer.byteLength(value) > MAX_PAYLOAD_BYTES) throw new Error('Payload too large')
  }
  return JSON.parse(value)
}

function json(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  if (value === undefined) return response.end()
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(value))
}

function securityHeaders(response: ServerResponse) {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
}

async function staticFile(root: string, path: string, response: ServerResponse) {
  const base = resolve(root)
  const candidate = resolve(base, `.${normalize(path)}`)
  if (candidate !== base && !candidate.startsWith(base + sep)) {
    return json(response, 403, { error: 'Forbidden' })
  }
  let file = path === '/' || !extname(candidate) ? join(base, 'index.html') : candidate
  try {
    await readFile(file)
  } catch {
    if (extname(path)) return json(response, 404, { error: 'Asset not found' })
    file = join(base, 'index.html')
  }
  response.setHeader('Cache-Control', file.includes(`${sep}assets${sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-store')
  response.setHeader('Content-Type', mime(extname(file)))
  createReadStream(file).pipe(response)
}

function mime(extension: string) {
  return extension === '.html'
    ? 'text/html; charset=utf-8'
    : extension === '.js'
      ? 'text/javascript'
      : extension === '.css'
        ? 'text/css'
        : 'application/octet-stream'
}
