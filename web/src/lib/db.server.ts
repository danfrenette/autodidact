import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pgPool = new Pool({
  connectionString: databaseUrl,
  // Ensure Better Auth uses the auth schema for its tables
  // while still having access to public schema for any shared data
  options: "-c search_path=auth,public",
});
