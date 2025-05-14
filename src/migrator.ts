import { Umzug } from 'umzug';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { BetterSqliteStorage } from './BetterSqliteStorage.js';

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createMigrator = async (filename = 'app.db'): Promise<Umzug<DatabaseType>> => {
  const db = new Database(filename)
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

  return umzug;
};
