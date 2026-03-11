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
    transactionHash: t.hex().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    greetingSetterIdx: index().on(table.greetingSetter),
    timestampIdx: index().on(table.timestamp),
  }),
);
