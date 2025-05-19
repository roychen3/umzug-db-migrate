// scripts/create-migration.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 等效於 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// migration 資料夾路徑
const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..','migrations');

// 取得 CLI 參數
const name = process.argv[2];

if (!name) {
  console.error(
    '❌ 請輸入 migration 名稱，例如：npm run create-migration add-users-table'
  );
  process.exit(1);
}

// 格式化 timestamp（20240513T123456）
function formatTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

const timestamp = formatTimestamp();
const filename = `${timestamp}-${name}.ts`;
const filepath = path.join(MIGRATIONS_DIR, filename);

// migration 檔案範本
const template = `import { Database } from 'better-sqlite3';

export async function up(db: Database) {
  // migration always run in a transaction
  const run = db.transaction(() => {
    // TODO: 實作 migration 邏輯
  });
  run();
}

export async function down(db: Database) {
  const run = db.transaction(() => {
    // migration always run in a transaction
    // TODO: 實作 rollback 邏輯
  });
  run();
}
`;

await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
await fs.writeFile(filepath, template);

console.log(`✅ 已建立 migration 檔案：migrations/${filename}`);
