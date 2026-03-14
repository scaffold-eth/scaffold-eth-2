import { ponder } from "ponder:registry";
import { greetingChange } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  const { greetingSetter, newGreeting, premium, value } = event.args;

  await context.db.insert(greetingChange).values({
    id: `${event.log.blockNumber}-${event.log.logIndex}`,
    greetingSetter,
    newGreeting,
    premium,
    value,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
});
