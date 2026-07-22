import { NextResponse } from 'next/server'
import mariadb from 'mariadb'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL env variable is missing' })
  }

  const results: any = {
    dbUrlParsed: {},
    mariadbConnection: 'Not tested',
    prismaConnection: 'Not tested',
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

  // Test raw mariadb connection
  try {
    const conn = await mariadb.createConnection({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
      connectTimeout: 5000, // 5s timeout
    })
    await conn.query('SELECT 1 as val')
    await conn.end()
    results.mariadbConnection = 'SUCCESS'
  } catch (err: any) {
    results.mariadbConnection = {
      status: 'FAILED',
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
    }
  }

  return NextResponse.json(results)
}
