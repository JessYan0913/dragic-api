import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: text('email'),
  password: text('password'),
  phone: text('phone'),
  name: text('name'),
  age: integer('age'),
});

export const userAuthIdentities = pgTable('UserAuthIdentity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  provider: text('provider').notNull(),
  providerUserId: text('provider_user_id').notNull(),
  unionId: text('union_id'),
  openId: text('open_id'),
  raw: text('raw'),
});

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
