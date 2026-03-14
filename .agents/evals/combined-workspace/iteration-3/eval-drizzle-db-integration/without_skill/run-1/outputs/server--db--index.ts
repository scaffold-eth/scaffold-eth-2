import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please add it to your .env.local file.");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
