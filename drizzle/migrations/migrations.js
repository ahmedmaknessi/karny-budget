// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo
// SQL inlined as strings to avoid Metro needing a custom .sql transformer.

import journal from './meta/_journal.json';

const m0000 = `CREATE TABLE \`accounts\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`user_id\` text NOT NULL,
\t\`name\` text NOT NULL,
\t\`type\` text NOT NULL,
\t\`balance\` real DEFAULT 0 NOT NULL,
\t\`currency\` text DEFAULT 'TND' NOT NULL,
\t\`color\` text DEFAULT '#C8F135' NOT NULL,
\t\`icon\` text DEFAULT 'wallet' NOT NULL,
\t\`is_archived\` integer DEFAULT false NOT NULL,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`updated_at\` text NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`budgets\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`user_id\` text NOT NULL,
\t\`category_id\` text NOT NULL,
\t\`amount\` real NOT NULL,
\t\`currency\` text DEFAULT 'TND' NOT NULL,
\t\`month\` integer NOT NULL,
\t\`year\` integer NOT NULL,
\t\`rollover\` integer DEFAULT false NOT NULL,
\t\`alert_sent_80\` integer DEFAULT false NOT NULL,
\t\`alert_sent_100\` integer DEFAULT false NOT NULL,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`updated_at\` text NOT NULL,
\tFOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`categories\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`user_id\` text,
\t\`name\` text NOT NULL,
\t\`icon\` text NOT NULL,
\t\`color\` text NOT NULL,
\t\`type\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`exchange_rates\` (
\t\`currency\` text PRIMARY KEY NOT NULL,
\t\`rate\` real NOT NULL,
\t\`fetched_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`goals\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`user_id\` text NOT NULL,
\t\`name\` text NOT NULL,
\t\`emoji\` text NOT NULL,
\t\`target_amount\` real NOT NULL,
\t\`saved_amount\` real DEFAULT 0 NOT NULL,
\t\`currency\` text DEFAULT 'TND' NOT NULL,
\t\`deadline\` text,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`updated_at\` text NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`sync_queue\` (
\t\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
\t\`table\` text NOT NULL,
\t\`operation\` text NOT NULL,
\t\`payload\` text NOT NULL,
\t\`retries\` integer DEFAULT 0 NOT NULL,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`error\` integer DEFAULT false NOT NULL,
\t\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`transactions\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`user_id\` text NOT NULL,
\t\`account_id\` text NOT NULL,
\t\`category_id\` text NOT NULL,
\t\`type\` text NOT NULL,
\t\`amount\` real NOT NULL,
\t\`currency\` text DEFAULT 'TND' NOT NULL,
\t\`note\` text,
\t\`date\` text NOT NULL,
\t\`is_recurring\` integer DEFAULT false NOT NULL,
\t\`receipt_uri\` text,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`updated_at\` text NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`users\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`email\` text NOT NULL,
\t\`name\` text,
\t\`base_currency\` text DEFAULT 'TND' NOT NULL,
\t\`language\` text DEFAULT 'fr' NOT NULL,
\t\`synced\` integer DEFAULT false NOT NULL,
\t\`updated_at\` text NOT NULL
);`;

export default {
  journal,
  migrations: {
    m0000,
  },
};
