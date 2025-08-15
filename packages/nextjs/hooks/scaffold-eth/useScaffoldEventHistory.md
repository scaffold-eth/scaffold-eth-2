# useScaffoldEventHistory Hook

## ⚠️ Important Performance Warning

**This hook is deprecated for production use** due to performance concerns. It uses `getLogs` which can be very expensive on mainnet and L2s, especially for chains with short block times.

## When to Use This Hook

### ✅ Recommended Use Cases
- **Local Development**: Hardhat/Anvil chains
- **Testing Environments**: Testnets with low activity
- **Small Event Queries**: Limited block ranges on testnets
- **Prototyping**: Quick development iterations

### ❌ Not Recommended For
- **Production Applications**: High-traffic mainnet/L2 deployments
- **Large Block Ranges**: Querying many blocks at once
- **Frequent Polling**: Real-time event monitoring on mainnet
- **High-Volume Contracts**: Contracts with many events

## Production Alternatives

For production applications, consider using these indexing solutions:

### 1. [Ponder](https://ponder.sh/)
Open-source indexing framework for Ethereum data
```bash
npm install @ponder/core
```

### 2. [The Graph](https://thegraph.com/)
Decentralized indexing protocol
```bash
npm install @graphprotocol/graph-cli
```

### 3. [Covalent](https://www.covalenthq.com/)
Multi-chain data API
```bash
npm install covalent
```

## Usage Example

```typescript
const {
  data: events,
  isLoading,
  error,
} = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "GreetingChange",
  watch: true, // optional, if true, the hook will watch for new events
  fromBlock: 0n, // optional, start block
  toBlock: 1000n, // optional, end block
  filters: { // optional, event filters
    greetingSetter: "0x..."
  }
});
```

## Performance Considerations

- **Block Range**: Limit the `fromBlock` to `toBlock` range
- **Batch Size**: Use `blocksBatchSize` to control memory usage
- **Polling**: Avoid `watch: true` on mainnet
- **Filters**: Use event filters to reduce data volume

## Migration Guide

### From useScaffoldEventHistory to Ponder

1. **Install Ponder**:
```bash
npm install @ponder/core
```

2. **Create a Ponder config**:
```typescript
// ponder.config.ts
import { createConfig } from "@ponder/core";

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http("https://eth-mainnet.g.alchemy.com/v2/..."),
    },
  },
  contracts: {
    YourContract: {
      network: "mainnet",
      abi: "./abis/YourContract.json",
      startBlock: 12345678,
    },
  },
});
```

3. **Create a Ponder script**:
```typescript
// src/YourContract.ts
import { ponder } from "@/generated";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  await context.db.insert("greetings", {
    id: event.transaction.hash,
    greetingSetter: event.args.greetingSetter,
    newGreeting: event.args.newGreeting,
    blockNumber: event.block.number,
  });
});
```

4. **Query indexed data**:
```typescript
// Use Ponder's GraphQL API instead of getLogs
const { data } = await fetch("/api/greetings", {
  method: "POST",
  body: JSON.stringify({
    query: `
      query {
        greetings {
          id
          greetingSetter
          newGreeting
          blockNumber
        }
      }
    `
  })
});
```

## Best Practices

1. **Development**: Use this hook freely for local development
2. **Testing**: Use on testnets with reasonable block ranges
3. **Production**: Migrate to an indexing solution before deployment
4. **Monitoring**: Monitor RPC usage and costs
5. **Caching**: Implement caching strategies for repeated queries

## Related Hooks

- `useScaffoldWatchContractEvent`: For real-time event listening (also has similar limitations)
- `useScaffoldReadContract`: For reading contract state (recommended for production)
- `useScaffoldWriteContract`: For writing to contracts (recommended for production)
