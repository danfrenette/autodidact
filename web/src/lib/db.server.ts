import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const pgPool = new Pool({
  connectionString: databaseUrl,
  options: '-c search_path=auth,public',
})
