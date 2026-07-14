import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://customs:customs-local@localhost:5432/customsdb'
export const pool = new Pool({ connectionString, max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 })
export const db = drizzle(pool, { schema })
export async function checkDatabase(){ const result=await pool.query('select now() as now'); return result.rows[0]?.now as Date }
