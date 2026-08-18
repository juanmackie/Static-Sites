---
title: "Our Agent Memory Stack — How It Works"
description: "A two-loop architecture for durable, searchable, self-improving agent memory built around a local SQLite-backed system."
category: ai-ops
date: 2026-08-18
updated: 2026-08-18
curated: true
draft: false
platform: site
---

# Our Agent Memory Stack — How It Works

We run a **two-loop architecture** around a local SQLite-backed memory system called **Mnemosyne**. The outer loop is a set of scheduled maintenance jobs that audit, consolidate, and improve the memory. The inner loop is the agent itself, which reads and writes memory through tools on every turn.

The goal: **durable, searchable, self-improving memory** that survives context window resets, gets better over time, and never silently loses important facts.

---

## The Two Loops

| Loop | What it is | Frequency |
|---|---|---|
| **Outer** (self-improvement) | Audit + cleanup + consolidation + reflection | Hourly → daily → weekly |
| **Inner** (agent under test) | Skill application + memory read/write + graph traversal | Every turn |

The outer loop treats the agent as a *component under test* — it audits the agent's memory health, repairs graph integrity, promotes important facts to durable storage, and reflects on recent sessions to extract lessons.

## The Memory Layers

All in one SQLite DB (`mnemosyne.db`):

| Layer | Purpose | Lifetime |
|---|---|---|
| **working_memory** | Raw per-turn captures (`[USER]`/`[ASSISTANT]` rows) | Volatile; consolidated into episodic |
| **episodic_memory** | Compressed summaries of working memory | Long-term |
| **canonical_facts** | Single-source-of-truth identity/preferences | Permanent until superseded |
| **graph_edges** | Bidirectional semantic links between memories | Persistent |
| **triples** | Structured (subject, predicate, object) facts | Persistent, temporal |

Plus a 2.2k character injected block (`MEMORY.md` + `USER.md`) that's loaded into every turn's system prompt — compact, high-signal, human-readable.

## The Outer Loop — Cron Jobs

These run as `no_agent: true` scripts (deterministic, no LLM needed) or as agent jobs with skills loaded:

| Job | Script | Schedule | What it does |
|---|---|---|---|
| **Nightly Self-Care** | `nightly_selfcare.py` | Daily 13:00 UTC | Audits memory block age, skill inventory, auth file health, backup freshness. Stages (never deletes) expired artifacts. Reports warnings. |
| **Memory Maintain** | `memory_maintain.py` | Every 6h | Finds working-memory entries with no graph edges (orphans), back-links them via FTS5. Auto-promotes important user-stated memories to canonical_facts. |
| **Evening Batch** | `mnemosyne-evening-batch.sh` | Daily 21:00 | Runs episodic consolidation (`mnemosyne sleep`), seedmap freshness check, topic map update. |
| **Bridge Drain** | `mnemosyne-ingest-pending.sh` | Every hour | Ingests pending memories from the shared surface / external capture queue. |
| **Self-Reflection** | `self-reflection-memory` skill | Weekly Sunday 23:00 | Agent reviews last 7 days of sessions, extracts lessons (preferences, procedures, failures, environment quirks), stores them in Mnemosyne + canonical facts. |
| **Retrieval Eval** | `mnemosyne-retrieval-eval.sh` | Daily 03:45 | Regression gate — runs benchmark queries against Mnemosyne recall. Fails loudly if recall quality drops below baseline. |
| **Monthly Maintenance** | `mnemosyne_maintenance.py` | Monthly 1st 03:30 | Full integrity audit, vector search repair, stale canonical sweep. |
| **Daily Backup** | `daily-backup.py` | Daily 02:00 | Backs up the DB + memory blocks. Retains last 7 checkpoints. |

## Canonical Promotion — How Facts Become Durable

Working memory is volatile. Important facts need to graduate to `canonical_facts`. Two paths:

1. **Trigger** (`install_canonical_trigger.py`): A SQLite `AFTER INSERT` trigger auto-promotes working rows where `source IN ('user', 'fact')`, `veracity = 'stated'`, `importance >= 0.7`. Each working row owns one deterministic canonical lineage (`source = 'auto:<working_id>'`). A changed row closes its prior lineage before a replacement is considered.

2. **Backstop** (`memory_maintain.py::promote_important_memories`): Idempotent sweep for rows that predate the trigger. Same rules, same lineage scheme.

Canonical facts use `(owner_id, category, name)` as their key. A new body supersedes the old one (kept as history with `valid_until` stamped). Never deleted.

## The Graph

Memories are connected via `graph_edges` (bidirectional, weighted). The `memory_maintain.py` job finds orphans — working memories with zero edges — and wires them to semantically related existing memories using in-process FTS5 (no model load, no timeout, real edges).

Triples (`subject, predicate, object`) store structured relationships with temporal validity (`valid_from`, `valid_until`).

## Safety Guardrails

- **Single-writer lock** (`mnemosyne_lock.py`): Every writer acquires a non-blocking `flock`. If another writer holds the lock, skip (next run retries). Prevents concurrent writes from corrupting the DB.
- **Backup before write**: `nightly_selfcare.py` creates a timestamped DB checkpoint before any mutation. Retains last 7 checkpoints.
- **Never delete**: Stale rows get `valid_until` stamped, not removed. Expired files get staged to `cleanup-quarantine/`, not deleted.
- **Dry-run first**: All maintenance scripts support `--dry-run` / `--lint` for inspection without writes.
- **Regression gate**: `mnemosyne-retrieval-eval.sh` runs benchmark queries. If recall quality drops below baseline, the job fails and alerts.

## The Injected Block (2.2k)

`/opt/data/memories/MEMORY.md` and `USER.md` are loaded into every turn by the Hermes context system. This is the "at a glance" layer — compact, high-signal, human-readable. The `memory-block-migrate` cron job monitors its size and migrates entries to Mnemosyne if it approaches the char limit.

## How to Recreate This

1. **Install Mnemosyne** as your Hermes memory provider (`memory.provider: mnemosyne` in config).
2. **Create the canonical trigger** — run `install_canonical_trigger.py` against your DB.
3. **Set up the writer lock** — `mnemosyne_lock.py` (a small context manager using `flock`).
4. **Write the maintenance scripts** — `nightly_selfcare.py`, `memory_maintain.py`, `mnemosyne-sleep.sh`, `mnemosyne-evening-batch.sh`.
5. **Schedule them** as `no_agent: true` cron jobs (deterministic scripts don't need an LLM).
6. **Add the self-reflection skill** — an agent job that reviews recent sessions and extracts lessons.
7. **Add the retrieval eval** — a regression gate that fails if recall quality drops.
8. **Never delete anything** — stamp `valid_until`, stage files, keep backups.

The key insight: **the outer loop is what makes memory compound over time**. Without it, you just have a chat log. With it, you have a system that audits itself, repairs its own graph, promotes important facts, and gets slightly better every day.

---

That's the stack. No personal details included — just the architecture, the jobs, and the safety patterns.
