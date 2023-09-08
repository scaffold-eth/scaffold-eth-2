import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  YourContract,
  GreetingChange
} from "../../generated/YourContract/YourContract";
import { Greeting, Sender, } from "../../generated/schema";

export function  handleGreetingChange(event: GreetingChange): void {
  let senderString = event.params.greetingSetter.toHexString();
  let greeting =  new Greeting(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  greeting.amount = event.params.value
  greeting.createdAt = event.block.timestamp;
  greeting.transactionHash = event.transaction.hash.toHex();

  greeting.save()

 
  // let sender = Sender.load(senderString);

  // if (sender === null) {
  //   sender = new Sender(senderString);
  //   sender.address = event.params.greetingSetter;
  //   sender.createdAt = event.block.timestamp;
  // } else {
  //   sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1));
  // }

  // purpose.save();
  // sender.save();
}
