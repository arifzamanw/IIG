import { NextResponse } from 'next/server'
import mariadb from 'mariadb'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL env variable is missing' })
  }

  const results: any = {
    dbUrlParsed: {},
    rawConnection: 'Not tested',
    poolConnection: 'Not tested',
  }

  let url: URL
  try {
    url = new URL(dbUrl)
    results.dbUrlParsed = {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || '3306',
      user: url.username,
      database: url.pathname.replace('/', ''),
      passwordLength: url.password.length,
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to parse DATABASE_URL: ' + err.message })
  }

  const connConfig = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    connectTimeout: 8000,
  }

  // Test 1: single non-pooled connection
  try {
    const conn = await mariadb.createConnection(connConfig)
    const rows = await conn.query('SELECT USER() as u, @@hostname as h, @@max_connections as mc')
    await conn.end()
    results.rawConnection = { status: 'SUCCESS', info: rows[0] }
  } catch (err: any) {
    results.rawConnection = {
      status: 'FAILED',
      message: err.message,
      code: err.code,
      errno: err.errno,
    }
  }

  // Test 2: pool connection (same as Prisma uses)
  let pool: any = null
  try {
    pool = mariadb.createPool({
      ...connConfig,
      connectionLimit: 1,
      minimumIdle: 0,
      acquireTimeout: 8000,
    })
    const conn = await pool.getConnection()
    const rows = await conn.query('SELECT 1 as ok')
    conn.release()
    results.poolConnection = { status: 'SUCCESS', result: rows[0] }
  } catch (err: any) {
    results.poolConnection = {
      status: 'FAILED',
      message: err.message,
      code: err.code,
      errno: err.errno,
    }
  } finally {
    if (pool) {
      try { await pool.end() } catch (_) {}
    }
  }

  return NextResponse.json(results)
}
