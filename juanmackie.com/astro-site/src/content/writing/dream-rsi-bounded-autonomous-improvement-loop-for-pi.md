---
title: "Dream-RSI: a bounded autonomous improvement loop for pi"
description: "A pi extension that assesses a local project, ranks measurable levers, and runs a verifier-driven improvement loop with durable hard budgets."
category: ai-ops
date: 2026-11-04
updated: 2026-11-04
curated: false
draft: false
platform: site
---

Dream-RSI is a pi extension. It assesses a local project, ranks measurable levers, and runs a verifier-driven improvement loop with durable hard budgets. Continuous continuation is opt-in, plateau-bounded, paced by a minimum interval between campaign starts, and resumes only on an explicit operator action. A durable project card and a conservative magnitude estimate order the search toward larger bets. They never replace the evaluator, gates, or independent post-apply check.

## What it does

The extension has two entry points. `/dream-rsi assess [goal]` reads project signals and ranks improvement opportunities without running project commands. `/dream-rsi loop [goal]` prepares the loop in the current chat after trusted-local consent: the agent reads the project, proposes an evaluator, scope, and gates, then calls the guarded engine with complete settings. No config file is required.

In a non-interactive session, pass `--consent` to accept consent in the command.

## Five-minute example

The repository ships a deterministic verified-loop example under `examples/verified-loop/`. It is a small Node project with a declared benchmark and an exact-output test. Copy it to a disposable Git repository, run its checks, and start Dream-RSI with one goal command. The baseline and deterministic fixture-agent acceptance test make the workflow reproducible. The fixture test verifies the measurement, correctness and review, independent post-apply check, and local branch commit path.

If a new runtime-optimization session has no measurement harness, authorize setup before experiments with `--setup-harness --no-auto-commit`. Setup creates a pinned measurement script and correctness check in `.dream-rsi-harness/`, then qualifies them before search. In Git projects, setup cannot run in the same contract as auto-commit.

## What it can and cannot promise

Dream-RSI can find large gains when a repository has a measurable bottleneck, a valid evaluator, and enough approved budget. Results depend on those conditions. It cannot promise a magnitude of improvement for an arbitrary repository, and it may stop without a win when the workload, metric, correctness oracle, or search space is not suitable. A qualified evaluator and passing checks are evidence for a specific change, not proof that every user requirement is covered.

The Dream-RSI paper reports results for its own tasks and algorithm. Those are not benchmarks for this extension. This project uses bounded search configurations and deterministic replay rather than executable policies from the paper. See `docs/method.md` for the differences.

## Consent and cost

Consent means project code and declared commands run on the host with the host user's access. This is not containment for hostile repositories. Use the loop only on projects you would run by hand. Editable scope limits candidate changes and planned setup writes. Existing evaluators, fixtures, and correctness gates may be read or run outside that scope without gaining write permission.

Default durable limits are 6 campaigns, 72 agent starts, 200 evaluator runs, and 120 minutes. A campaign can use at most 18 agent starts, 48 evaluator runs, and 60 minutes from the remaining budget. Agent runs may incur model costs. A real-model run requires an explicit user request.

## Commands

- `/dream-rsi assess [goal]` reads project signals and ranks improvement opportunities.
- `/dream-rsi loop [goal] [--consent] [--no-logs] [--setup-harness] [--commit-policy <mode>] [--auto-commit|--no-auto-commit] [--replace-contract] [--config <file>]` prepares a natural-language goal in chat, then starts the guarded loop. Explicit config or setup commands start directly. Without a goal, the command retains saved-setup reuse or declared-workload discovery.
- `/dream-rsi evolve [goal] [same flags as loop]` runs the same guarded loop with continuous continuation switched on. It adds no new budget, consent, gate, or commit behavior. The durable caps, no-win plateau, start interval, and explicit stop and resume rules still apply.
- `/dream-rsi status` shows the saved objective, durable budget, latest blocker, and campaign state, including before a campaign exists. `watch`, `stop`, and `resume` inspect or control campaigns.

A different saved objective needs separate replacement approval. Interactive sessions offer a summary and full inspection. In headless use with reviewed config or setup settings, `--replace-contract` is explicit replacement authorization. Execution consent is still required. During goal preparation, that flag requests a replacement review rather than approving a proposal that does not yet exist. Omitted settings keep the saved scope, gates, and permissions, so use the tool to specify new boundaries when changing domains. Replacement preserves cumulative budgets and one previous approval. See `docs/autonomous-loop.md`.

## State and rollback

Invalid preparation settings can be corrected up to three times on the same handoff. No command or durable budget is started for those corrections. Recovery reports the blocker category and next action, with no blind automatic retries. Engine blockers keep their durable evidence and budget and do not silently restart.

State lives in `<project>/.dream-rsi/`. Recon writes `.dream-rsi/project-card.json`. Each completed run writes `loop/last-run.md` for operators and `loop/latest-report.json` for tools. A new Git-backed contract defaults to local commits for independently verified wins on `dream-rsi/improve`. The loop never pushes and never commits to a default branch. The loop continues through its approved campaign budget until a declared stop condition. See `docs/autonomous-loop.md` for the clean-tree requirement, opt-out, recovery, and verification details, and `docs/continuous-magnitude.md` for the project card, magnitude rules, and the scope of `evolve`.

## Method

Dream-RSI combines a fixed evaluator and keep-only-if-better hill climb with append-only attempt records, fresh agent processes, independent review, paired confirmation, and correctness gates. Usage signals help rank candidate levers. The loop qualifies its own metric before trusting it.

Each completed experiment is recorded as a world. A deterministic replay compares search configurations using only recorded branch and refinement nodes. For one world:

```
V = g - 0.02 * N + 0.01 * N / max(1, rounds)
```

`g` is normalized gain over baseline, `N` is the number of revealed attempts, and `rounds` is the number of search rounds. Each meta-improvement uses up to 12 distinct, previously unused completed worlds as probes. The default minimum is three probes; callers may raise it but cannot lower it. Replay coverage must be at least 0.6 for both challenger and incumbent on every probe, and the challenger must beat the incumbent by more than 0.01 on every probe. Probe IDs are flushed before the search configuration is promoted, so an ordinary process restart cannot reuse them. The incumbent is always included as a baseline. Agent output is bounded `SearchConfig` data and is never executed.

The improvement path stays fixed around that search-policy layer: qualify the metric and baseline first, keep candidate experiments bounded, promote only after paired confirmation, correctness gates, and adversarial review, then verify the applied patch independently. The dream step can change how later attempts are allocated. It cannot change the evaluator, safety gates, or acceptance rules.

Suite-failure metrics count reported failures from common Node and TAP and Jest, pytest, Cargo, Python unittest, and JUnit summaries. An unrecognized non-zero suite still counts as at least one failure, never as a clean run.

## Relation to the Dream-RSI paper

The Dream-RSI paper (arXiv:2609.14858, v2) uses completed discovery trees as replay simulators. Its exploration policy chooses branches, batches, and stopping points. A policy-development agent revises executable policy code, then the system replays candidates over prior worlds and redeploys the best-scoring policy. The base discovery agent and evaluator remain fixed in that method.

This project adopts the history-to-replay idea, but it is an adaptation, not a reproduction of the paper's algorithm or evaluation. Dream-RSI stores bounded `SearchConfig` data and never executes an agent-authored search policy. Deterministic replay uses the project's branch and refine actions and the local value function above. The compose gate requires coverage of at least 0.6 and a per-probe score margin above 0.01 across the configured number of fresh probes. The paper's budget-preference sweep and normalized quality-cost hypervolume objective are not implemented. This port uses a simpler gain, attempt-cost, and round-cost score. Its safeguards for code changes, qualified measurement, correctness gates, review, and independent post-apply verification, are product-specific additions, not claims about the paper.

The dream step changes how this system allocates later search attempts. It does not train or fine-tune the coding model, change the evaluator, or guarantee that the codebase improves. Published results in the paper are not results for this extension. Improvement size depends on the repository, measurable workload, evaluator quality, and available budget. No magnitude is promised for arbitrary projects.

Inspirations: autoresearch contributes the fixed metric and hill climb; RSI-Master contributes append-only records and adversarial review; Memento contributes fresh processes and inherited notes; MASS contributes a separate judge; usage-log funnels contribute lever evidence; Dream-RSI contributes world recording and replay.

## Project card and magnitude

Recon writes a durable, versioned project card to `.dream-rsi/project-card.json`. One bounded, read-only scan records languages, package managers, declared test and benchmark commands, CI commands, entry points, import hotspots, cheap complexity signals, dependency declarations, and architecture smells. The card runs no project command, qualifies no instrument, and grants no edit scope. A corrupt card, or a card whose body no longer matches its digest, is treated as absent. The digest excludes the timestamp, so an unchanged tree keeps one identity.

The magnitude estimator reads structural signals in a lever's editable scope and names a campaign type: `local-hill`, `structural`, `dependency`, `systemic`, or `algorithmic`. It also records a coarse best-case multiplier and a confidence. Ranking multiplies the existing lever score by a bounded log-utility factor, so a high-multiplier, low-confidence algorithmic bet can outrank a small local gain. The factor changes order only. Metric qualification, correctness gates, review, the independent post-apply check, promotion thresholds, and budgets are unchanged. A lever from a recon result without a project directory keeps its original score and has no magnitude field.

The card and magnitude are advisory. A best-case multiplier is not a prediction. A campaign selected this way still has to pass the same measured confirmation and verification stack.

Campaign types and multipliers from the estimator:

- Nested loops: algorithmic, best case 6x, or 8x with a linear scan in the loop, confidence 0.35
- Linear scan in a loop: algorithmic, best case 3.5x, confidence 0.45
- Blocking I/O in a loop or serial awaits: systemic, best case 2.2x to 3.5x, confidence 0.5
- Dependency major lag: dependency, best case 1.5x to 2.5x, confidence 0.4
- God file, large file, or branch-heavy code: structural, best case 1.4x, confidence 0.55
- No signal: local-hill, best case 1.15x, confidence 0.7

The ordering utility is `log2(max(1, multiplier)) * clamp(confidence, 0, 1)`. A large uncertain bet can outrank a small confident one. That is a product decision. The multiplier is not a promise, and the estimator stays coarse on purpose.

## Continuous magnitude mode

`/dream-rsi evolve [goal]` with the same flags as `loop` is the same guarded loop with `continuous: true`. It uses the same consent dialog, preparation flow, durable budget, campaign caps, no-win plateau, minimum start interval, and rolling process limits. It does not enable auto-commit, renew an exhausted budget, or bypass any gate. A finished process does not restart itself. After a day or session boundary, use `resume` explicitly. The classic `/dream-rsi loop` path keeps its behavior and remains the primary surface.

This build does not include a separate long-running controller, a scheduler, automatic goal synthesis, multi-campaign queuing, plateau escalation to a higher campaign type, or an auto-PR policy engine. See `docs/continuous-magnitude.md` for the implemented slice, the review, and the deferred work.

## Safety invariants

The loop enforces these invariants:

- Trusted-local consent. `evolve` uses the same explicit consent path as `loop`.
- Fail-closed instrument qualification. The card and estimator never qualify an instrument.
- Isolated experiments. No experiment path changed by the magnitude slice.
- Conjunctive gates and independent post-apply verification. No gate or verification path changed.
- Data-only dream step. The estimator reads static files and does not execute agent code as policy.
- Immutable durable budgets. `evolve` adds no budget renewal. It sets only the existing `continuous` flag.
- Single-command stop, pause, revert. `stop`, `resume`, and Git recovery are unchanged.
- Auto-commit opt-in and policy-driven. No default changed. `evolve` does not enable auto-commit.

## Development

```
npm install
npm run typecheck
npm test
```

Requirements: Node 22.18 or later. TypeScript typecheck and the test suite run as `prepublishOnly`. The package is published publicly as `pi-dream-rsi` version 3.0.2 under the MIT license.

## References

- Repository: `https://github.com/juanmackie/pi-Dream-RSI`
- Paper: arXiv:2609.14858, v2
- Documentation: `docs/autonomous-loop.md`, `docs/continuous-magnitude.md`, `docs/method.md`, `docs/constitution.md`
- Glossary: `GLOSSARY.md`
