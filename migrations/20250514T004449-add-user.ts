import { Database } from 'better-sqlite3';

export async function up(db: Database) {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `
  ).run();
}

export async function down(db: Database) {
  db.prepare(`DROP TABLE IF EXISTS users`).run();
}
