import path from "node:path";
import { pool } from "../core/db.js";
import { readdir, readFile } from "node:fs/promises";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

async function main() {
  await pool.query(`
    create table if not exists schema_migrations (
      name  text primary key,
      applied_at  timestamptz not null default now()
    )`);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query<{ name: string }>(
    "SELECT name FROM schema_migrations",
  );
  const applied = new Set(rows.map((r) => r.name));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        file,
      ]);

      await client.query("COMMIT");
      console.log(`applied ${file}`);
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`FAILED ${file}, rolled back`);
      throw err;
    } finally {
      client.release();
    }
  }

  if (count === 0) console.log("nothing to do");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
