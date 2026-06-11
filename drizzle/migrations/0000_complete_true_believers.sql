CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'TND' NOT NULL,
	`color` text DEFAULT '#C8F135' NOT NULL,
	`icon` text DEFAULT 'wallet' NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`synced` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'TND' NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`rollover` integer DEFAULT false NOT NULL,
	`alert_sent_80` integer DEFAULT false NOT NULL,
	`alert_sent_100` integer DEFAULT false NOT NULL,
	`synced` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`currency` text PRIMARY KEY NOT NULL,
	`rate` real NOT NULL,
	`fetched_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`emoji` text NOT NULL,
	`target_amount` real NOT NULL,
	`saved_amount` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'TND' NOT NULL,
	`deadline` text,
	`synced` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`retries` integer DEFAULT 0 NOT NULL,
	`synced` integer DEFAULT false NOT NULL,
	`error` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`category_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'TND' NOT NULL,
	`note` text,
	`date` text NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`receipt_uri` text,
	`synced` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`base_currency` text DEFAULT 'TND' NOT NULL,
	`language` text DEFAULT 'fr' NOT NULL,
	`synced` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
