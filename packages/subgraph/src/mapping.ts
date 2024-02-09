import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  YourContract,
  GreetingChange,
} from "../generated/YourContract/YourContract";
import { Greeting, Sender } from "../generated/schema";

export function handleGreetingChange(event: GreetingChange): void {
  let senderString = event.params.greetingSetter.toHexString();

  let sender = Sender.load(senderString);

  if (sender === null) {
    sender = new Sender(senderString);
    sender.address = event.params.greetingSetter;
    sender.createdAt = event.block.timestamp;
    sender.greetingCount = BigInt.fromI32(1);
  } else {
    sender.greetingCount = sender.greetingCount.plus(BigInt.fromI32(1));
  }

  let greeting = new Greeting(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  greeting.greeting = event.params.newGreeting;
  greeting.sender = senderString;
  greeting.premium = event.params.premium;
  greeting.value = event.params.value;
  greeting.createdAt = event.block.timestamp;
  greeting.transactionHash = event.transaction.hash.toHex();

  greeting.save();
  sender.save();
}
