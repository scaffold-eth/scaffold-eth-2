import { ponder } from "ponder:registry";
import { greetingChange, greetingSender } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  const { greetingSetter, newGreeting, premium, value } = event.args;

  // Create a unique ID using the transaction hash and log index
  const id = `${event.log.transactionHash}-${event.log.logIndex}`;

  // Insert the greeting change event record
  await context.db
    .insert(greetingChange)
    .values({
      id,
      greetingSetter,
      newGreeting,
      premium,
      value,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.log.transactionHash,
    });

  // Upsert the greeting sender aggregate record
  await context.db
    .insert(greetingSender)
    .values({
      address: greetingSetter,
      greetingCount: 1,
      lastGreeting: newGreeting,
      lastTimestamp: event.block.timestamp,
      totalValue: value,
    })
    .onConflictDoUpdate((row) => ({
      greetingCount: row.greetingCount + 1,
      lastGreeting: newGreeting,
      lastTimestamp: event.block.timestamp,
      totalValue: row.totalValue + value,
    }));
});
