import Database from 'better-sqlite3';
import type { Database as BetterSqliteDatabase } from 'better-sqlite3';

export const db: BetterSqliteDatabase = new Database('app.db');
 