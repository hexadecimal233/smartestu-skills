#!/usr/bin/env node
// smartestu.cn API client.
// Credentials come from the environment or a credentials file; writes require --allow-write.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const DEFAULT_BASE = 'https://smartestu.cn'
const DEFAULT_CREDS = join(homedir(), '.config', 'smartestu', 'creds.json')

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function usage() {
  process.stderr.write(`usage: smartestu-api.mjs <command> [options]

commands
  session                              GET  /api/auth/session, refresh tokens
  courses                              POST /api/homework/student/course/query
  homeworks                            POST /api/homework/student/mark/queryHomeworks
  pending                              every unfinished homework, soonest deadline first
  homework <id>                        POST /api/homework/student/mark/queryExercisesByHomeworkId
  portal                               POST /api/homework/student/portal-summary
  get <path>                           arbitrary GET, query string goes in the path
  write <METHOD> <path> [json|@file]   arbitrary mutating call, needs --allow-write

options
  --creds <path>   credentials file, default ${DEFAULT_CREDS}
  --base <url>     server, default ${DEFAULT_BASE}
  --refresh <v>    __Host-auth_refresh_v1 cookie, overrides file
  --cookie <v>     access cookie, overrides file
  --csrf <v>       csrf token, overrides file
  --context <v>    session context, overrides file
  --scene <s>      homework | online_exam, for \`homeworks\`
  --page <n>       page number, default 1
  --size <n>       page size, default 20
  --course <id>    repeatable course filter, for \`homeworks\`
  --allow-write    required for POST/PUT/PATCH/DELETE through \`write\`
  --raw            print the response body untouched

credentials file: {"refreshCookie": "__Host-auth_refresh_v1=...", "accessCookie": "", "csrfToken": "", "sessionContext": ""}
environment: SMARTESTU_REFRESH_COOKIE, SMARTESTU_COOKIE, SMARTESTU_CSRF, SMARTESTU_SESSION_CONTEXT
`)
}

function parseArgs(argv) {
  const out = { _: [], courses: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { out._.push(a); continue }
    const key = a.slice(2)
    if (key === 'allow-write' || key === 'raw') { out[key === 'raw' ? 'raw' : 'allowWrite'] = true; continue }
    const val = argv[++i]
    if (val === undefined) throw new Error(`missing value for --${key}`)
    if (key === 'course') { out.courses.push(Number(val)); continue }
    out[key] = val
  }
  return out
}

function loadCreds(args) {
  const path = args.creds || DEFAULT_CREDS
  let file = {}
  if (existsSync(path)) {
    try { file = JSON.parse(readFileSync(path, 'utf8')) } catch (e) { throw new Error(`credentials file ${path} is not valid JSON`) }
  }
  const pick = (arg, env, fromFile) => arg || process.env[env] || fromFile || ''
  const creds = {
    refreshCookie: pick(args.refresh, 'SMARTESTU_REFRESH_COOKIE', file.refreshCookie),
    accessCookie: pick(args.cookie, 'SMARTESTU_COOKIE', file.accessCookie || file.cookie),
    csrfToken: pick(args.csrf, 'SMARTESTU_CSRF', file.csrfToken),
    sessionContext: pick(args.context, 'SMARTESTU_SESSION_CONTEXT', file.sessionContext),
  }
  return { creds, path }
}

function saveCreds(path, creds) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  writeFileSync(path, JSON.stringify(creds, null, 2), { mode: 0o600 })
}

function cookieHeader(creds) {
  return [creds.accessCookie, creds.refreshCookie].filter(Boolean).join('; ')
}

function buildHeaders(creds, hasBody) {
  const h = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'x-auth-protocol': 'cookie-v1',
    origin: api.base,
    referer: `${api.base}/assignment`,
    'user-agent': 'smartestu-api/1.0',
  }
  const cookie = cookieHeader(creds)
  if (cookie) h.cookie = cookie
  if (creds.csrfToken) h['x-csrf-token'] = creds.csrfToken
  if (creds.sessionContext) h['x-session-context'] = creds.sessionContext
  if (hasBody) h['content-type'] = 'application/json'
  return h
}

const api = { base: DEFAULT_BASE, creds: null, credsPath: DEFAULT_CREDS }

async function request(method, path, body) {
  const url = path.startsWith('http') ? path : `${api.base}${path}`
  const hasBody = body !== undefined
  const res = await fetch(url, {
    method,
    headers: buildHeaders(api.creds, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  const text = await res.text()
  let parsed
  try { parsed = text ? JSON.parse(text) : null } catch { parsed = undefined }
  return { status: res.status, text, parsed }
}

function envelopeFailure(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  if ('code' in parsed && parsed.code !== 200 && parsed.code !== 0) {
    return `code=${parsed.code} msg=${parsed.msg ?? parsed.message ?? ''}`
  }
  return null
}

function output(parsed, text, raw) {
  process.stdout.write(raw || parsed === undefined ? `${text}\n` : `${JSON.stringify(parsed, null, 2)}\n`)
}

async function call(method, path, body, { raw } = {}) {
  let { status, text, parsed } = await request(method, path, body)
  // Access cookie lives 15 minutes. A 401 rejects before execution, so one re-mint is safe.
  if ((status === 401 || status === 403) && api.creds.refreshCookie && !path.startsWith('/api/auth/')) {
    await mintAccess()
    ;({ status, text, parsed } = await request(method, path, body))
  }
  if (status === 401 || status === 403) {
    process.stderr.write(`${method} ${path} -> HTTP ${status}; refresh cookie rejected, copy a new one from the browser\n`)
    output(parsed, text, raw)
    process.exit(3)
  }
  if (status >= 400) {
    process.stderr.write(`${method} ${path} -> HTTP ${status}\n`)
    output(parsed, text, raw)
    process.exit(1)
  }
  const fail = envelopeFailure(parsed)
  if (fail) {
    process.stderr.write(`${method} ${path} -> ${fail}\n`)
    output(parsed, text, raw)
    process.exit(1)
  }
  output(parsed, text, raw)
  return parsed
}

// queryHomeworks returns nothing unless courseIds is populated, so resolve them from the course list.
async function resolveCourseIds(courseIds) {
  if (Array.isArray(courseIds) && courseIds.length > 0) return courseIds
  const { status, parsed } = await request("POST", "/api/homework/student/course/query", {})
  if (status !== 200 || parsed?.code !== 200) {
    process.stderr.write(`course list -> HTTP ${status} code=${parsed?.code}\n`)
    process.exit(status === 401 || status === 403 ? 3 : 1)
  }
  return (parsed.data ?? []).map((c) => c.id)
}

// Walks every page of both scene queries and flattens course groups into one row per homework.
async function collectHomework({ courseIds, pageSize }) {
  const rows = []
  for (const scene of ['homework', 'online_exam']) {
    let pageNo = 1
    let pageTotal = 1
    while (pageNo <= pageTotal) {
      const { status, parsed } = await request('POST', '/api/homework/student/mark/queryHomeworks', { courseIds, scene, pageSize, pageNo })
      if (status !== 200 || parsed?.code !== 200) {
        process.stderr.write(`queryHomeworks scene=${scene} page=${pageNo} -> HTTP ${status} code=${parsed?.code}\n`)
        process.exit(status === 401 || status === 403 ? 3 : 1)
      }
      const data = parsed.data ?? {}
      for (const group of data.courseHomeworkDTOList ?? []) {
        for (const hw of group.studentCourseHomeworkDTOList ?? []) {
          const end = hw.endTime ? new Date(hw.endTime) : null
          const serverNow = hw.examServerNow ? new Date(hw.examServerNow) : new Date()
          rows.push({
            id: hw.id,
            name: hw.name,
            courseId: group.courseId,
            courseName: group.courseName,
            scene: hw.scene ?? scene,
            endTime: hw.endTime ?? '',
            submission_status: hw.submission_status ?? 'unknown',
            allowLateSubmission: Boolean(hw.allowLateSubmission),
            lateSubmissionScoreRatio: hw.lateSubmissionScoreRatio,
            score: hw.score,
            exercise_status: hw.exercise_status ?? { total: 0, submitted: 0, graded: 0 },
            overdue: Boolean(end && end < serverNow),
          })
        }
      }
      pageTotal = Number(data.pageTotal ?? 1) || 1
      pageNo++
    }
  }
  const seen = new Set()
  return rows.filter((r) => (seen.has(`${r.scene}:${r.id}`) ? false : (seen.add(`${r.scene}:${r.id}`), true)))
}

const ACCESS_COOKIE = "__Host-auth_access_v1"

// The refresh cookie buys a 15 minute access cookie; the server returns it in set-cookie.
async function mintAccess() {
  if (!api.creds.refreshCookie) {
    process.stderr.write("no refresh cookie: set SMARTESTU_REFRESH_COOKIE or write refreshCookie into the credentials file\n")
    process.exit(2)
  }
  const res = await fetch(`${api.base}/api/auth/session`, {
    headers: {
      accept: "application/json, text/plain, */*",
      "x-auth-protocol": "cookie-v1",
      cookie: api.creds.refreshCookie,
      origin: api.base,
      referer: `${api.base}/assignment`,
    },
  })
  const text = await res.text()
  let parsed
  try { parsed = text ? JSON.parse(text) : null } catch { parsed = undefined }
  const jar = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : []
  const access = jar.map((c) => c.split(";")[0]).find((c) => c.startsWith(`${ACCESS_COOKIE}=`))
  if (res.status !== 200 || !access) {
    process.stderr.write(`cannot mint access cookie: HTTP ${res.status} ${text.slice(0, 160)}\n`)
    process.exit(3)
  }
  api.creds.accessCookie = access
  if (parsed?.csrfToken) api.creds.csrfToken = parsed.csrfToken
  if (parsed?.sessionContext) api.creds.sessionContext = parsed.sessionContext
  saveCreds(api.credsPath, api.creds)
  return parsed
}

async function ensureSession() {
  if (!api.creds.refreshCookie && !api.creds.accessCookie) {
    process.stderr.write("no credentials: set SMARTESTU_REFRESH_COOKIE or pass --creds <file>\n")
    process.exit(2)
  }
  if (api.creds.refreshCookie) {
    await mintAccess()
    return
  }
  if (api.creds.csrfToken && api.creds.sessionContext) return
  const { status, parsed } = await request("GET", "/api/auth/session")
  if (status !== 200 || !parsed?.csrfToken) {
    process.stderr.write(`cannot obtain tokens: GET /api/auth/session -> HTTP ${status}\n`)
    process.exit(3)
  }
  api.creds.csrfToken = parsed.csrfToken
  api.creds.sessionContext = parsed.sessionContext
  saveCreds(api.credsPath, api.creds)
}

async function main() {
  const argv = process.argv.slice(2)
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') { usage(); process.exit(argv.length ? 0 : 2) }
  const args = parseArgs(argv)
  const command = args._[0]
  api.base = (args.base || DEFAULT_BASE).replace(/\/$/, '')
  const loaded = loadCreds(args)
  api.creds = loaded.creds
  api.credsPath = loaded.path

  const opts = { raw: Boolean(args.raw) }

  if (command === 'session') {
    if (api.creds.refreshCookie) {
      const parsed = await mintAccess()
      output(parsed, JSON.stringify(parsed), opts.raw)
      return
    }
    const { status, text, parsed } = await request('GET', '/api/auth/session')
    if (status === 200 && parsed?.csrfToken) {
      api.creds.csrfToken = parsed.csrfToken
      api.creds.sessionContext = parsed.sessionContext
      saveCreds(api.credsPath, api.creds)
    }
    output(parsed, text, opts.raw)
    return
  }

  if (command === 'get') {
    const path = args._[1]
    if (!path) { usage(); process.exit(2) }
    await call('GET', path, undefined, opts)
    return
  }

  if (command === 'write') {
    const method = (args._[1] || '').toUpperCase()
    const path = args._[2]
    if (!WRITE_METHODS.has(method) || !path) { usage(); process.exit(2) }
    if (!args.allowWrite) {
      process.stderr.write(`${method} ${path} changes the student record; rerun with --allow-write once the user asked for it\n`)
      process.exit(2)
    }
    let body
    const raw = args._[3]
    if (raw !== undefined) {
      body = raw.startsWith('@') ? JSON.parse(readFileSync(raw.slice(1), 'utf8')) : JSON.parse(raw)
    }
    await ensureSession()
    process.stderr.write(`sending ${method} ${path}${body === undefined ? '' : ` ${JSON.stringify(body)}`}\n`)
    await call(method, path, body, opts)
    return
  }

  await ensureSession()

  if (command === 'courses') {
    await call('POST', '/api/homework/student/course/query', {}, opts)
    return
  }

  if (command === 'portal') {
    await call('POST', '/api/homework/student/portal-summary', {}, opts)
    return
  }

  if (command === 'homeworks') {
    const body = {
      courseIds: await resolveCourseIds(args.courses),
      scene: args.scene || 'homework',
      pageSize: Number(args.size || 20),
      pageNo: Number(args.page || 1),
    }
    await call('POST', '/api/homework/student/mark/queryHomeworks', body, opts)
    return
  }

  if (command === 'pending') {
    const jobs = await collectHomework({ courseIds: await resolveCourseIds(args.courses), pageSize: Number(args.size || 20) })
    const open = jobs.filter((j) => j.submission_status !== 'completed')
    open.sort((a, b) => a.endTime.localeCompare(b.endTime))
    if (args.raw) { process.stdout.write(`${JSON.stringify(open, null, 2)}\n`); return }
    if (open.length === 0) { process.stdout.write('no open homework\n'); return }
    process.stdout.write('due                 scene        state          done  name / course\n')
    for (const j of open) {
      const due = j.endTime.slice(0, 16).replace('T', ' ')
      const late = j.overdue ? (j.allowLateSubmission ? 'late-ok' : 'late-no') : ''
      const done = `${j.exercise_status.submitted}/${j.exercise_status.total}`
      process.stdout.write(
        `${due}  ${j.scene.padEnd(11)} ${(j.submission_status + ' ' + late).padEnd(14)} ${done.padStart(5)}  ${j.name} / ${j.courseName}\n`,
      )
    }
    return
  }

  if (command === 'homework') {
    const id = Number(args._[1])
    if (!Number.isSafeInteger(id) || id <= 0) {
      process.stderr.write('homework needs a numeric homework id\n')
      process.exit(2)
    }
    await call('POST', '/api/homework/student/mark/queryExercisesByHomeworkId', { homeworkId: id }, opts)
    return
  }

  usage()
  process.exit(2)
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`)
  process.exit(1)
})
