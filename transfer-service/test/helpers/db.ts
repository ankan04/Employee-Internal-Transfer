import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export const TEST_DB_URL =
  process.env.DATABASE_URL ?? 'postgres://postgres:t360test@localhost:55432/transfer360';

export function newPool(): Pool {
  return new Pool({ connectionString: TEST_DB_URL, max: 10 });
}

/** Applies every migration in migrations/ in filename order. */
export async function migrate(pool: Pool): Promise<void> {
  const dir = join(__dirname, '..', '..', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    await pool.query(readFileSync(join(dir, f), 'utf8'));
  }
}

export async function resetSchema(pool: Pool): Promise<void> {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
}

export const SUBJECT_A = 'emp-ref-aaaa1111';
export const SUBJECT_B = 'emp-ref-bbbb2222';
