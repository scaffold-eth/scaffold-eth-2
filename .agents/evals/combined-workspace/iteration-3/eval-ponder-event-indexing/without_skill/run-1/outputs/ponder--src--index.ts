import { ponder } from "ponder:registry";
import { greetingChange } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  await context.db.insert(greetingChange).values({
    id: `${event.log.blockNumber}-${event.log.logIndex}`,
    greetingSetter: event.args.greetingSetter,
    newGreeting: event.args.newGreeting,
    premium: event.args.premium,
    value: event.args.value,
    blockNumber: event.log.blockNumber,
    transactionHash: event.log.transactionHash,
    timestamp: BigInt(event.block.timestamp),
  });
});
