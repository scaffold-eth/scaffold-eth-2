# Eval Summary: ponder-event-indexing (with_skill)

**Pass Rate: 100% (10/10)**

## Assertions

| # | Assertion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | ponder.config.ts reads deployedContracts from SE-2 nextjs package | PASSED | Imports deployedContracts from '../nextjs/contracts/deployedContracts' and dynamically builds contract config from it |
| 2 | ponder.config.ts reads scaffoldConfig for network detection | PASSED | Imports scaffoldConfig from '../nextjs/scaffold.config' and uses targetNetworks[0] for chain config |
| 3 | Package named @se-2/ponder following SE-2 workspace convention | PASSED | package.json name: '@se-2/ponder' |
| 4 | Uses Ponder virtual module imports (ponder:registry, ponder:schema, ponder:api) | PASSED | Handler: import from 'ponder:registry' and 'ponder:schema'. API: import from 'ponder:api' and 'ponder:schema' |
| 5 | Schema uses onchainTable (not older createSchema API) | PASSED | import { onchainTable } from 'ponder' -- correct v0.7+ API |
| 6 | Handler uses 'ContractName:EventName' format | PASSED | ponder.on('YourContract:GreetingChange', ...) -- correct format |
| 7 | Uses context.db.insert(table).values({}) for writes | PASSED | context.db.insert(greetingChange).values({...}) -- correct current API |
| 8 | Hono-based API setup for GraphQL (not old express-style) | PASSED | const app = new Hono(); app.use('/graphql', graphql({ db, schema })) -- correct v0.7+ Hono pattern |
| 9 | Root package.json has ponder proxy scripts | PASSED | Root has ponder:dev, ponder:start, ponder:codegen and other proxy scripts |
| 10 | ponder-env.d.ts type declaration file exists | PASSED | packages/ponder/ponder-env.d.ts created for virtual module type support |
