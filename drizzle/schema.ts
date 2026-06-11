import { int, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull(),
  name:         text('name'),
  baseCurrency: text('base_currency').notNull().default('TND'),
  language:     text('language').notNull().default('fr'),
  synced:       integer('synced', { mode: 'boolean' }).notNull().default(false),
  updatedAt:    text('updated_at').notNull(),
});

export const accounts = sqliteTable('accounts', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id),
  name:       text('name').notNull(),
  type:       text('type', { enum: ['CASH', 'BANK', 'MOBILE_WALLET'] }).notNull(),
  balance:    real('balance').notNull().default(0),
  currency:   text('currency').notNull().default('TND'),
  color:      text('color').notNull().default('#C8F135'),
  icon:       text('icon').notNull().default('wallet'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  synced:     integer('synced', { mode: 'boolean' }).notNull().default(false),
  updatedAt:  text('updated_at').notNull(),
  createdAt:  text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id:     text('id').primaryKey(),
  userId: text('user_id'),
  name:   text('name').notNull(),
  icon:   text('icon').notNull(),
  color:  text('color').notNull(),
  type:   text('type', { enum: ['INCOME', 'EXPENSE', 'BOTH'] }).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => users.id),
  accountId:   text('account_id').notNull().references(() => accounts.id),
  categoryId:  text('category_id').notNull().references(() => categories.id),
  type:        text('type', { enum: ['INCOME', 'EXPENSE', 'TRANSFER'] }).notNull(),
  amount:      real('amount').notNull(),
  currency:    text('currency').notNull().default('TND'),
  note:        text('note'),
  date:        text('date').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  receiptUri:  text('receipt_uri'),
  synced:      integer('synced', { mode: 'boolean' }).notNull().default(false),
  updatedAt:   text('updated_at').notNull(),
  createdAt:   text('created_at').notNull(),
});

export const budgets = sqliteTable('budgets', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id),
  categoryId:   text('category_id').notNull().references(() => categories.id),
  amount:       real('amount').notNull(),
  currency:     text('currency').notNull().default('TND'),
  month:        integer('month').notNull(),
  year:         integer('year').notNull(),
  rollover:     integer('rollover', { mode: 'boolean' }).notNull().default(false),
  alertSent80:  integer('alert_sent_80', { mode: 'boolean' }).notNull().default(false),
  alertSent100: integer('alert_sent_100', { mode: 'boolean' }).notNull().default(false),
  synced:       integer('synced', { mode: 'boolean' }).notNull().default(false),
  updatedAt:    text('updated_at').notNull(),
});

export const goals = sqliteTable('goals', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id),
  name:         text('name').notNull(),
  emoji:        text('emoji').notNull(),
  targetAmount: real('target_amount').notNull(),
  savedAmount:  real('saved_amount').notNull().default(0),
  currency:     text('currency').notNull().default('TND'),
  deadline:     text('deadline'),
  synced:       integer('synced', { mode: 'boolean' }).notNull().default(false),
  updatedAt:    text('updated_at').notNull(),
  createdAt:    text('created_at').notNull(),
});

export const exchangeRates = sqliteTable('exchange_rates', {
  currency:  text('currency').primaryKey(),
  rate:      real('rate').notNull(),
  fetchedAt: text('fetched_at').notNull(),
});

export const syncQueue = sqliteTable('sync_queue', {
  id:        integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  table:     text('table').notNull(),
  operation: text('operation', { enum: ['INSERT', 'UPDATE', 'DELETE'] }).notNull(),
  payload:   text('payload').notNull(),
  retries:   integer('retries').notNull().default(0),
  synced:    integer('synced', { mode: 'boolean' }).notNull().default(false),
  error:     integer('error', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export type User         = typeof users.$inferSelect;
export type Account      = typeof accounts.$inferSelect;
export type Category     = typeof categories.$inferSelect;
export type Transaction  = typeof transactions.$inferSelect;
export type Budget       = typeof budgets.$inferSelect;
export type Goal         = typeof goals.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type SyncQueueRow = typeof syncQueue.$inferSelect;
