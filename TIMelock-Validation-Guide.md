# Timelock Validation Guide

This guide walks through the local validation flow for the role-based timelock admin module added to this Scaffold-ETH 2 project.

Follow the steps in order. Do not skip ahead. Each section includes:

- what to run
- what you should see
- what that proves

## 1. Prerequisites

Before testing, confirm:

- Node.js is installed
- Yarn is installed
- project dependencies are already installed
- you are in the project root

Project root:

```bash
cd /Users/lido/Workplace/scaffold-eth-2
```

## 2. Open Three Terminals

You will use three terminals:

- Terminal A: local blockchain
- Terminal B: contract deployment
- Terminal C: frontend

Keep all three running during the test.

## 3. Start the Local Blockchain

In Terminal A run:

```bash
yarn chain
```

What you should see:

- Hardhat local node starts
- several funded test accounts are printed
- the RPC server runs at `http://127.0.0.1:8545`

What this proves:

- your local Ethereum chain is running
- the frontend and deployment script will have a chain to connect to

Do not close this terminal.

## 4. Deploy the Contracts

In Terminal B run:

```bash
yarn deploy
```

What you should see:

- `YourContract` deployed
- `TimelockedAdminTarget` deployed
- `TimelockController` deployed
- log lines for:
  - timelock delay
  - timelocked target owner
  - timelock address
  - target address
  - bootstrap admin renounced

Expected examples:

- `Timelock delay: 3600 seconds`
- `Bootstrap admin renounced: true`

What this proves:

- the timelock module is deployed correctly
- the target contract owner has been transferred to the timelock
- the deployer no longer keeps a default admin backdoor

Do not close this terminal until deployment finishes successfully.

## 5. Start the Frontend

In Terminal C run:

```bash
yarn start
```

What you should see:

- Next.js dev server starts
- a local URL appears, usually:

```text
http://localhost:3000
```

If port `3000` is busy, Next.js may use `3001` or another port. Use the exact port shown in Terminal C.

What this proves:

- the frontend is running

## 6. Open the Timelock Page

Open this in your browser:

```text
http://localhost:3000/timelock
```

If Terminal C shows a different port, use that instead.

What you should see:

- a page titled `Timelock Admin Workflow`
- a `Timelock Controller` card
- a `Managed Target` card
- current values for:
  - treasury
  - fee bps
  - feature flag

What this proves:

- the new route exists
- the frontend can read deployed contract data

## 7. Verify Deployment State on the Page

On `/timelock`, check these items:

### 7.1 Timelock Controller

You should see:

- a non-empty contract address
- `Minimum delay: 3600 seconds`

### 7.2 Managed Target

You should see:

- a non-empty contract address
- the page loads current managed values

### 7.3 Target Owner

In the `Connected Wallet Access` area, the `Target owner` should match the `Timelock Controller` address.

What this proves:

- the protected contract is actually owned by the timelock
- admin changes must go through the timelock flow

## 8. Import the Local Deployer Wallet into MetaMask

The deployment script gives the deployer these roles:

- proposer
- executor
- canceller

To test those permissions through the frontend, import the deployer account into MetaMask.

Run this in a separate terminal:

```bash
yarn account:reveal-pk
```

Copy the private key for account `#0` and import it into MetaMask.

Then connect MetaMask to:

- network: Hardhat / localhost
- RPC URL: `http://127.0.0.1:8545`
- chain ID: `31337`

Refresh `/timelock`.

What you should see:

- `Proposer` badge active
- `Executor` badge active
- `Canceller` badge active

What this proves:

- you are connected as the authorized timelock operator

## 9. Verify Direct Admin Calls Are Blocked

Open:

```text
http://localhost:3000/debug
```

Select `TimelockedAdminTarget`.

Try calling one of these functions directly:

- `setTreasury`
- `setFeeBps`
- `setFeatureEnabled`

Expected result:

- the transaction fails
- the error should indicate unauthorized owner access

What this proves:

- an EOA cannot directly perform protected admin actions
- the timelock now controls those functions

## 10. Verify Schedule Works

Go back to:

```text
/timelock
```

Use this example:

- Action: `setFeeBps(uint256)`
- Fee basis points: `300`
- Delay: `3600`
- Salt label: `fee-update-1`
- Predecessor: leave as the default zero hash

Click:

```text
Schedule
```

Expected result:

- wallet confirmation appears
- transaction succeeds
- an operation hash is shown
- operation state becomes `Waiting`
- a new `Scheduled` event appears

What this proves:

- an authorized proposer can schedule a timelocked action

## 11. Verify Execute Fails Before Delay

Without waiting for the delay, click:

```text
Execute
```

Expected result:

- the transaction fails
- the operation is not ready yet

What this proves:

- the minimum delay is actually enforced

## 12. Verify Cancel Works

Schedule another operation, for example:

- Action: `setFeatureEnabled(bool)`
- Value: `true`
- Delay: `3600`
- Salt label: `feature-enable-1`

After it enters `Waiting`, click:

```text
Cancel
```

Expected result:

- the transaction succeeds
- a `Cancelled` event appears
- the operation state returns to `Unset`

Then try:

```text
Execute
```

Expected result:

- execution fails

What this proves:

- pending operations can be cancelled
- cancelled operations cannot be executed later

## 13. Verify Execution After Delay

There are two ways to validate delayed execution.

### Option A: Use Automated Tests

Run:

```bash
yarn test
```

Expected result:

- all `TimelockModule` tests pass

What this proves:

- delayed execution, cancellation, and role checks work at contract level

This is the easiest method for your report.

### Option B: Manual Local Execution

If you want a full manual demo, you need to advance local chain time or wait through the delay.

After the delay is satisfied, click:

```text
Execute
```

Expected result:

- the transaction succeeds
- the target value changes
- the operation state becomes `Done`
- an `Executed` event appears

What this proves:

- the timelocked action can be executed only after the required wait

## 14. Verify Unauthorized Wallets Cannot Operate

Switch MetaMask to a different local account that was not used as deployer.

Try:

- `Schedule`
- `Cancel`
- `Execute`

Expected result:

- each protected action fails because the wallet lacks the required role

What this proves:

- access control is enforced correctly

## 15. Recommended Evidence for Your Report

Take screenshots of:

- `yarn deploy` output
- `/timelock` initial page
- role badges showing proposer / executor / canceller
- failed direct call on `/debug`
- successful `Schedule`
- failed early `Execute`
- successful `Cancel`
- `yarn test` output

If you also complete manual delayed execution, capture:

- successful `Execute`
- updated target state after execution

## 16. Quick Checklist

Use this checklist while testing:

- [ ] `yarn chain` started successfully
- [ ] `yarn deploy` completed successfully
- [ ] `yarn start` completed successfully
- [ ] `/timelock` page loads
- [ ] timelock address is shown
- [ ] managed target address is shown
- [ ] target owner equals timelock address
- [ ] deployer wallet shows proposer role
- [ ] deployer wallet shows executor role
- [ ] deployer wallet shows canceller role
- [ ] direct admin call on target fails
- [ ] schedule succeeds
- [ ] early execute fails
- [ ] cancel succeeds
- [ ] cancelled operation cannot execute
- [ ] unauthorized wallet cannot schedule
- [ ] unauthorized wallet cannot execute
- [ ] unauthorized wallet cannot cancel
- [ ] automated tests pass

## 17. Common Problems

### Problem: `localhost:3000` cannot be reached

Cause:

- frontend is not running

Fix:

```bash
yarn start
```

Then use the exact port shown in Terminal C.

### Problem: page loads but contracts are missing

Cause:

- contracts were not deployed

Fix:

```bash
yarn deploy
```

### Problem: page loads but wallet has no roles

Cause:

- wrong local account connected

Fix:

- import the deployer private key
- reconnect MetaMask
- refresh the page

### Problem: `Schedule` or `Execute` fails immediately

Cause:

- wrong account
- wrong network
- invalid form input

Fix:

- connect MetaMask to local Hardhat network
- use the deployer account
- check delay, salt, and target input values

## 18. Minimal Demo Flow

If you only need a short live demo, use this sequence:

1. run `yarn chain`
2. run `yarn deploy`
3. run `yarn start`
4. open `/timelock`
5. show timelock address and target owner
6. show proposer / executor / canceller badges
7. schedule `setFeeBps(300)`
8. show operation state becomes `Waiting`
9. try immediate execute and show failure
10. run `yarn test` and show the passing timelock tests

That is enough to demonstrate the core security behavior.
