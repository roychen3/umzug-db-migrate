import { Database } from 'better-sqlite3';

export async function up(db: Database) {
  const createTable = db.transaction(() => {
    db.exec(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `
    );
  });

  createTable();
}

export async function down(db: Database) {
  const dropTable = db.transaction(() => {
    db.prepare(`DROP TABLE IF EXISTS users`).run();
  });

  dropTable();
}
