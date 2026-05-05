const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for migration.");
  }

  const migrationPath = path.join(__dirname, "migrations", "0001_init.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query("COMMIT");
    console.log("Migration applied: 0001_init.sql");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});

