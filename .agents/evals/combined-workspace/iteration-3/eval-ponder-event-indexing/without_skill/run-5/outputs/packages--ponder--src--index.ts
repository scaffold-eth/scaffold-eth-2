import { ponder } from "ponder:registry";
import { greetingChange } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  await context.db.insert(greetingChange).values({
    id: `${event.block.number}_${event.log.logIndex}`,
    greetingSetter: event.args.greetingSetter,
    newGreeting: event.args.newGreeting,
    premium: event.args.premium,
    value: event.args.value,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
});
