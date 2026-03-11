import { ponder } from "ponder:registry";
import { greetingChange } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  await context.db.insert(greetingChange).values({
    id: event.id,
    greetingSetter: event.args.greetingSetter,
    newGreeting: event.args.newGreeting,
    premium: event.args.premium,
    value: event.args.value,
    timestamp: Number(event.block.timestamp),
    blockNumber: event.block.number,
  });
});
