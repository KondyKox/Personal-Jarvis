import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env");
}

export const pool = new Pool({ connectionString });

export async function checkDb(): Promise<boolean> {
  try {
    await pool.query("SELECT now()");
    return true;
  } catch (err) {
    console.error("DB check failed:", err);
    return false;
  }
}
