import { Umzug } from 'umzug';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { db } from './db.js';

import type { Database } from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BetterSqliteStorage {
  constructor(private db: Database) {
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
      )
      .run();
  }

  async logMigration({ name }: { name: string }) {
    this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
  }

  async unlogMigration({ name }: { name: string }) {
    this.db.prepare('DELETE FROM migrations WHERE name = ?').run(name);
  }

  async executed(): Promise<string[]> {
    const rows = this.db
      .prepare('SELECT name FROM migrations ORDER BY run_at')
      .all();
    return rows.map((row: any) => row.name);
  }
}

const run = async () => {
  const umzug = new Umzug({
    migrations: {
      glob: [
        'migrations/*.js',
        {
          cwd: path.join(__dirname, '..'),
        },
      ],
      resolve: (options) => {
        return {
          name: options.name,
          up: async ({ context }) => {
            const mod = await import(pathToFileURL(options.path!).href);
            return mod.up(context);
          },
          down: async ({ context }) => {
            const mod = await import(pathToFileURL(options.path!).href);
            return mod.down(context);
          },
        };
      },
    },
    context: db,
    storage: new BetterSqliteStorage(db),
    logger: console,
  });

  await umzug.up();
};

run();
