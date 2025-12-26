import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  name: text('name'),
  age: integer('age'),
});

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
