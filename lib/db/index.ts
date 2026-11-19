import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL_POOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

const isRemoteDb = Boolean(
  connectionString &&
  !connectionString.includes("localhost") &&
  !connectionString.includes("127.0.0.1")
);

// Support connectionString (Vercel / Prisma Postgres / Neon / Supabase) or discrete local variables
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      host: process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.PGPORT) || 5433,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "Pass@2Word",
      database: process.env.PGDATABASE || "talent_matcher",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

export const db = drizzle(pool, { schema });
export { pool };
