import { onchainTable } from "ponder";

export const greetingChange = onchainTable("greeting_change", (t) => ({
  id: t.text().primaryKey(),
  greetingSetter: t.hex().notNull(),
  newGreeting: t.text().notNull(),
  premium: t.boolean().notNull(),
  value: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
  blockNumber: t.bigint().notNull(),
}));
