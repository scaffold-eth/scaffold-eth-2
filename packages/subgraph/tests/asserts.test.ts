import { describe, test, assert, beforeAll } from "matchstick-as";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Greeting, Sender } from "../generated/schema";

describe("Asserts", () => {
    beforeAll(() => {
        // Mocking the Sender
        let sender = new Sender("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        sender.address = Bytes.fromHexString(
            "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        );
        sender.createdAt = BigInt.fromI32(1709849870);
        sender.greetingCount = BigInt.fromI32(1);
        sender.save();

        // Mocking Greeting
        let greeting = new Greeting(
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6"
        );
        greeting.sender = sender.id; // Linking Greeting to Sender by ID
        greeting.createdAt = BigInt.fromI32(1709849870);
        greeting.greeting = "Building COOL Apps!";
        greeting.premium = false;
        greeting.transactionHash =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6";
        greeting.value = BigInt.fromI32(0);
        greeting.save();
    });

    test("Greeting and Sender entities", () => {
        // Testing proper entity creation and field assertion
        let id =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd7";
        let senderAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96046";
        let greetingText = "Building AWESOME Apps!";

        // Creating a new Sender entity for the Greeting
        let newSender = new Sender(senderAddress);
        newSender.address = Bytes.fromHexString(senderAddress);
        newSender.createdAt = BigInt.fromI32(1709859870); // A different timestamp
        newSender.greetingCount = BigInt.fromI32(2); // Updated greeting count
        newSender.save();

        // Creating a new Greeting entity
        let entity = new Greeting(id);
        entity.sender = newSender.id; // Linking to new Sender
        entity.greeting = greetingText;
        entity.createdAt = BigInt.fromI32(1709859870); // Make sure to have the correct time
        entity.premium = true; // Assuming a different scenario
        entity.transactionHash = id; // Mock transaction hash as the ID
        entity.value = BigInt.fromI32(100); // Some value
        entity.save();

        // Loading the Greeting entity and asserting its fields
        let loadedEntity = Greeting.load(id);
        assert.assertNotNull(
            loadedEntity,
            "Loaded Greeting entity should not be null"
        );
        assert.fieldEquals("Greeting", id, "sender", newSender.id);
        assert.fieldEquals("Greeting", id, "greeting", greetingText);
        assert.fieldEquals("Greeting", id, "premium", "true"); // Assuming premium is a boolean
        assert.fieldEquals("Greeting", id, "value", "100"); // Assuming value is stored as a BigInt

        // Corrected entity and field names according to the mock
        assert.entityCount("Sender", 2); // Assuming there are 2 Sender entities now
        assert.entityCount("Greeting", 2); // Assuming there are 2 Greeting entities now
    });
});
