import { pool } from "../core/db.js";

async function main() {
  const result = await pool.query("SELECT now()");
  console.log("Postgres says time is:", result.rows[0].now);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
