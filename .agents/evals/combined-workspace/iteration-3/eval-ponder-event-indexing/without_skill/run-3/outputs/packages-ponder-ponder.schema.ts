import { index, onchainTable } from "ponder";

export const greetingChange = onchainTable(
  "greeting_change",
  (t) => ({
    id: t.text().primaryKey(),
    greetingSetter: t.hex().notNull(),
    newGreeting: t.text().notNull(),
    premium: t.boolean().notNull(),
    value: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    transactionHash: t.hex().notNull(),
  }),
  (table) => ({
    greetingSetterIdx: index().on(table.greetingSetter),
    timestampIdx: index().on(table.timestamp),
  }),
);

export const greetingSender = onchainTable("greeting_sender", (t) => ({
  address: t.hex().primaryKey(),
  greetingCount: t.integer().notNull(),
  lastGreeting: t.text().notNull(),
  lastTimestamp: t.bigint().notNull(),
  totalValue: t.bigint().notNull(),
}));
