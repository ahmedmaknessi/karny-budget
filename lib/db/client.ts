import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations/migrations';
import * as schema from '@/drizzle/schema';

const expo = openDatabaseSync('karny.db', { enableChangeListener: true });

export const db = drizzle(expo, { schema });

export async function runMigrations(): Promise<void> {
  await migrate(db, migrations);
}
