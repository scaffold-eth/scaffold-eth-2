# Eval Summary: ponder-event-indexing (without_skill)

**Pass Rate: 50% (5/10)**

## Assertions

| # | Assertion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | ponder.config.ts reads deployedContracts from SE-2 nextjs package | FAILED | Hardcodes ABI from local abis/YourContract.ts file. Hardcodes contract address as '0x5FbDB2315678afecb367f032d93F642f64180aa3'. No bridge to SE-2's deployedContracts.ts |
| 2 | ponder.config.ts reads scaffoldConfig for network detection | FAILED | Hardcodes chainId: 31337 and 'localhost' network name. No import from scaffoldConfig |
| 3 | Package named @se-2/ponder following SE-2 workspace convention | PASSED | package.json name: '@se-2/ponder' -- correct |
| 4 | Uses Ponder virtual module imports (ponder:registry, ponder:schema, ponder:api) | FAILED | Uses OLD import style: 'import { ponder } from "@/generated"' and 'import { greetingChange } from "../ponder.schema"'. Virtual modules not used |
| 5 | Schema uses onchainTable (not older createSchema API) | PASSED | Uses onchainTable from @ponder/core -- correct API (though from old package name) |
| 6 | Handler uses 'ContractName:EventName' format | PASSED | ponder.on('YourContract:GreetingChange', ...) -- correct format |
| 7 | Uses context.db.insert(table).values({}) for writes | PASSED | context.db.insert(greetingChange).values({...}) -- correct current API |
| 8 | Hono-based API setup for GraphQL (not old express-style) | FAILED | Uses OLD express-style: ponder.use('/graphql', graphql()) -- not Hono. No Hono import, no app creation |
| 9 | Root package.json has ponder proxy scripts | PASSED | Root has ponder:dev, ponder:start, ponder:codegen proxy scripts |
| 10 | ponder-env.d.ts type declaration file exists | FAILED | No ponder-env.d.ts file created. Virtual module types won't resolve |
