# We Ran 40 Evaluations on Our Agent Skills. Iteration 2 Almost Made Us Think They Were Useless.

We've been building agent skills for Scaffold-ETH 2 for a while now. These are markdown files that teach Claude how to integrate specific libraries into an SE-2 project: Drizzle ORM with Neon PostgreSQL, Ponder for event indexing, x402 for payment-gated APIs, EIP-5792 for batch transactions. They encode the patterns, the API versions, the SE-2-specific conventions that Claude wouldn't know from training alone.

At some point we had to actually answer the question: do these help? We had good vibes from using them, but vibes aren't numbers. So we set up a benchmark. Give Claude a task prompt like "add a PostgreSQL database to my SE-2 dApp," run it with and without the skill file, then check 10 specific assertions about what it built. Things like whether it set up the tri-driver pattern for database connections, or whether it used the right version of the x402 API. Concrete stuff you can look at in the code and say yes or no.

That benchmark ended up taking three iterations to get right, and honestly the most useful thing we learned wasn't even about the skills.

## First pass: encouraging but too small

We ran one round per configuration. 4 skills, each tested with and without the skill file. 8 total runs. An independent grader agent checked the outputs.

| Skill | with_skill | without_skill |
|-------|-----------|--------------|
| drizzle | 10/10 | 0/10 |
| x402 | 10/10 | 5/10 |
| ponder | 10/10 | 5/10 |
| eip-5792 | 10/10 | 6/10 |

100% with skills, 40% without. The failures were pretty telling. Without the drizzle skill, Claude built a perfectly functional Drizzle ORM setup, but it missed every SE-2-specific convention we care about. No tri-driver pattern for auto-detecting which Postgres driver to use. No lazy proxy to defer the database connection. Used `.env.local` instead of `.env.development`. It didn't know about these patterns because we designed them for SE-2, and they're not in any documentation Claude was trained on.

The x402 failures were different. Claude actually hallucinated API shapes that don't exist. It reached for `x402-fetch` and `x402-next` (v1-style unscoped packages) when the real API uses `@x402/core`, `@x402/evm`, `@x402/next`. The library is new enough that Claude's training data has the wrong version, so without the skill file it just confidently makes stuff up.

Good results, but n=1 per config. We needed more runs before we could trust any of this.

## Iteration 2: we broke everything by trying to be efficient

We scaled to 3 runs per configuration. 24 total runs. And to save time, we made what felt like a reasonable decision: let the executor agent grade its own work. Show it the 10 assertions, have it implement the solution, then have it check its own output. One agent, one pass. Why not?

The with_skill results came back at 100% across all 12 runs. Fine, expected.

Then the without_skill results came back at 100% across all 8 new runs too.

We went from drizzle scoring 0/10 without skills to 10/10. From x402 at 5/10 to 10/10. Every skill, every run, perfect scores. According to this data, the skills made zero difference. We'd spent weeks building them for nothing.

Except we still had the run-1 data from iteration 1, which used independent grading. Here's what the numbers looked like side by side:

| Skill (without_skill) | Run-1 (independent grader) | Run-2 (self-graded) | Run-3 (self-graded) |
|-------|-------------------|-------------------|-------------------|
| x402 | 5/10 | 10/10 | 10/10 |
| drizzle | 0/10 | 10/10 | 10/10 |
| ponder | 5/10 | 10/10 | 10/10 |
| eip-5792 | 6/10 | 10/10 | 10/10 |

A 60 percentage point jump, and the only difference was the grading method. That's not variance. Something was wrong with the evaluation itself.

## Two things went wrong at once

We spent some time digging into the transcripts and figured out two problems that were compounding each other.

The first one was that the agent was teaching itself to the test. When the executor sees an assertion like "Uses CAIP-2 network format (eip155:84532) not legacy names" before it starts writing code, it just... does that. The assertion tells it exactly what to write. It doesn't matter whether Claude "knows" about CAIP-2 from training. The assertions were functioning as a requirements document, not as evaluation criteria. Without seeing them, Claude defaults to whatever API surface it remembers, which for newer libraries is often outdated or wrong. With them, it has a cheat sheet.

The second problem was that self-grading is generous. An agent that wrote `const NETWORK = process.env.X402_NETWORK || 'eip155:84532'` is going to mark itself as PASS on the CAIP-2 assertion. It intended to satisfy it. An independent grader that just reads the code might find the value is used differently elsewhere, or that the implementation is only superficially correct. The executor gives itself the benefit of the doubt because it has full context on what it was trying to do. A separate grader doesn't have that context, so it's more honest.

There was also a subtler thing we didn't catch until later. Our `AGENTS.md` file (always in context, checked into the repo) had a Skills & Agents Index section listing all the skill names and what they do. So even the `without_skill` agents could see "`x402` - HTTP 402 payment-gated routes, micropayments, API monetization" and "`drizzle-neon` - Drizzle ORM, Neon PostgreSQL, database integration" sitting right there. That's not the same as reading the skill file, but it's a hint. Enough to nudge the model in the right direction on some assertions.

The time and token data from iteration 2 was still useful though, since those metrics aren't affected by grading bias. With skills, runs averaged 158 seconds and 39k tokens. Without skills, 214 seconds and 44k tokens. So even with inflated pass rates, the efficiency difference was real: skills made the model 26% faster and 10% cheaper.

## Fixing the methodology

For iteration 3, we split execution and grading into two completely separate phases.

Phase 1: the executor gets only the task prompt. No assertions, no hints about what we're checking for. It implements the solution in an isolated git worktree. For `without_skill` runs, we also strip the Skills & Agents Index from AGENTS.md in the worktree so there's no indirect contamination.

Phase 2: a separate grader agent reads the output files and evaluates them against the assertions. It never sees the executor's transcript or self-assessment. It just looks at the code that was produced and checks whether each assertion holds.

We also bumped to 5 runs per configuration because 3 runs gives you pretty wide confidence intervals. 40 total runs, 80 agent invocations counting the graders.

## The actual numbers

| Skill | with_skill (5 runs) | without_skill (5 runs) | Delta |
|-------|-----------|--------------|-------|
| drizzle | 100% (10,10,10,10,10) | 10% (1,1,1,1,1) | +90pp |
| x402 | 100% (10,10,10,10,10) | 38% (4,3,2,6,4) | +62pp |
| eip-5792 | 88% (9,8,9,9,9) | 50% (5,5,5,5,5) | +38pp |
| ponder | 100% (10,10,10,10,10) | 68% (7,7,8,7,5) | +32pp |
| **Overall** | **97%** | **42%** | **+55pp** |

The consistency is what surprised us most. We expected variance across 5 runs. We barely got any. Drizzle without skills scored exactly 1/10 in all five runs. The same one assertion passes every time (files at the `services/database/` path, which is just a reasonable convention the model happens to follow) and the same nine fail. EIP-5792 without skills scored exactly 5/10 all five runs. The same five pass, the same five fail.

With skills, three of four skills hit 10/10 on every single run. EIP-5792 is the only one with any variance. It consistently misses `useShowCallsStatus`, which tells us the skill file could be clearer about that hook rather than that there's some randomness in the model's behavior.

The efficiency gap held up too. With skills, average run time was 217 seconds. Without, 365 seconds. That's 40% faster. Token usage was lower with skills as well (21k vs 27k), probably because the model isn't exploring dead ends or trying API patterns that don't exist when it has the skill file to reference.

## What fails without skills (and why it's systematic)

It's not that Claude can't do the task without skills. It always builds something that works. It creates an ERC20 contract, sets up Drizzle, configures a Ponder indexer. The code runs.

What it misses are things it can't know from training. For drizzle, that's SE-2-specific patterns like the tri-driver auto-detection, the lazy proxy, production safety guards with `PRODUCTION_DATABASE_HOSTNAME`, and that we use `.env.development` not `.env.local`. We designed these patterns for SE-2. They're not in any public docs.

For x402 and ponder, the issue is API versioning. Claude reaches for API shapes from its training data, which for rapidly evolving libraries means the wrong version. It imports from `@ponder/core` instead of `ponder` (the package name changed in v0.7), uses `createSchema` instead of `onchainTable`, hardcodes chain IDs instead of reading them from SE-2's `deployedContracts`. All reasonable choices based on older docs, all wrong for the current version.

The fact that these failures are systematic rather than random is actually what makes skills valuable. The model has consistent knowledge gaps for things outside its training data. A skill file fills those gaps once, and then they stay filled across every invocation. You're not fixing a coin flip, you're patching a known hole.

## What we actually learned

The iteration 2 disaster ended up being more interesting than the benchmark results themselves. If we'd stopped there and reported "skills show no significant improvement" based on self-graded data, we'd have been confidently wrong.

The thing we keep coming back to: if your evaluation lets the agent see the rubric before doing the work, you're not measuring what you think you're measuring. You're measuring whether the agent can follow instructions, which of course it can. That's its job. The assertions become requirements, not tests. We're guessing this applies to a lot of agent evaluations people are running right now where the model has access to the grading criteria during execution.

Self-grading felt efficient when we set it up. One agent, one pass, you get your numbers, move on. But the agent has every reason to judge its own work favorably. Not on purpose, just because it has the full context of what it was trying to do and it gives itself credit for intent. A separate grader that only reads the output files doesn't care about intent. It just checks the code.

The other thing we weren't expecting was how little variance there'd be once we fixed the methodology. We ran 5 rounds specifically to get error bars, and the error bars are basically zero on half the skills. The model's knowledge gaps aren't random, they're structural. It either knows the current Ponder API or it doesn't, and that doesn't change between runs. Which means these numbers would probably hold up across another 50 runs.

## If you're benchmarking agent skills

A few things we'd do differently if we were starting over:

Separate execution from grading from day one. The executor gets the task prompt and nothing else. A separate grader checks the output against assertions. It costs twice as many agent calls, but the data is actually trustworthy.

Clean your context. If your repo has any references to the skills you're testing (docs, indexes, config files), strip them for the baseline runs. We were leaking hints through AGENTS.md without realizing it.

Start with 5 runs. We tried 1, then 3, then 5. In hindsight, 5 is the right number. You get enough data to spot real variance vs noise, and the cost (about 2.2M tokens for our 40-run setup) is manageable.

Check which assertions actually discriminate. Some of our assertions pass with and without skills, which means they're not measuring anything useful. Others fail without skills every single time. Those are the ones that tell you what the skill is actually doing.

The final numbers: 97% pass rate with skills, 42% without, 55 percentage point improvement, 40% faster, 21% cheaper in tokens. You can look at the raw data and grading files in our `.agents/evals/combined-workspace/iteration-3/` directory if you want to dig into the specifics.
