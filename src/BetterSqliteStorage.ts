import type { Database as DatabaseType } from 'better-sqlite3'
import { UmzugStorage } from 'umzug/lib/storage/index.js'

export class BetterSqliteStorage implements UmzugStorage {
  constructor(private db: DatabaseType) {
    this.db.exec(
      `
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    )
  }

  async logMigration({ name }: { name: string }) {
    this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name)
  }

  async unlogMigration({ name }: { name: string }) {
    this.db.prepare('DELETE FROM migrations WHERE name = ?').run(name)
  }

  async executed(): Promise<string[]> {
    const rows = this.db
      .prepare('SELECT name FROM migrations ORDER BY run_at')
      .all()
    return rows.map((row: any) => row.name)
  }
}
