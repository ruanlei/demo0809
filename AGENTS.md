# AGENTS.md — Text-to-Game

> Repository-wide instructions for coding agents (Devin, Codex, Claude Code, and similar tools).
> **Status:** Project plan / pre-implementation. Do not assume any proposed file or feature already exists.
> **Primary goal:** Ship a small, playable, testable browser game before expanding into an AI game platform.

## 1. Product brief

**Text-to-Game** is an experiment in turning natural-language interactions into a playable 3D game. The long-term vision is a game that players can influence through messages, with AI characters that speak naturally, remember relevant events, and react consistently to game state. An external messaging interface such as Poke is a **future integration**, not a Day 1 dependency.

The first demonstrable experience must be intentionally small:

- One browser-based 3D room.
- One interactable NPC (placeholder geometry first; VRM later).
- One collectible key and one locked door.
- One complete puzzle loop: collect the key, then unlock the door.
- A dialogue panel, initially with fixed text, later backed by an LLM.
- Automated tests, reproducible setup, and a deployable demo.

**Success means a stranger can open a URL, understand the interaction, and finish the puzzle.** Do not equate a generated codebase or impressive architecture with a shipped product.

## 2. Scope and priority

Implement work in this order:

1. **Playable deterministic vertical slice** — render, interaction, inventory, puzzle, tests.
2. **Character presentation** — load an existing VRM avatar, use readily available animations, and keep placeholder fallback.
3. **AI dialogue** — server-side LLM calls with structured outputs, timeouts, and a local mock.
4. **Persistent memory** — session history, rolling summaries, selected long-term memories.
5. **Decision-model experiment** — compare a Kev-assisted pipeline with an LLM-only baseline.
6. **Messaging integration** — only after the game is functional and an authorized, documented API is available.

### Explicit non-goals for the first vertical slice

- No custom rendering engine, bespoke physics engine, or procedural generation platform.
- No training or fine-tuning models.
- No Unreal Engine, Unity, native iOS, or native Android implementation.
- No multiplayer, payments, complex inventory, or large open world.
- No real-time voice, speech recognition, or audio-to-face pipeline.
- No Supabase, LLM, Kev, Docker deployment, or external messaging dependency on Day 1.
- No speculative refactors or extra services unrelated to the current acceptance criteria.

If the user requests a change to these priorities, follow that explicit request and update the plan; do not silently expand scope.

## 3. Preferred technology choices

| Concern | Preferred choice | Guidance |
| --- | --- | --- |
| Web app | Next.js App Router + TypeScript | Prefer strict typing; keep 3D canvas in a client-only boundary. |
| 3D rendering | Three.js + React Three Fiber (`@react-three/fiber`) | Reuse primitives and existing glTF assets. |
| Camera / helpers | `@react-three/drei` | Use established utilities rather than reimplementing controls. |
| Character avatar | `@pixiv/three-vrm` | Introduce after the primitive NPC works; preserve fallback. |
| Local state | Zustand | Authoritative deterministic game state, with pure action/rule functions. |
| Backend | Next.js route handlers | Keep API keys server-side; add services only when necessary. |
| Persistent memory | Supabase PostgreSQL + pgvector | Later phase; enforce session/user isolation. |
| Dialogue | Configurable LLM API | Keep provider behind an adapter and provide mock responses. |
| Optional decision model | Kev (through a replaceable adapter) | Experimental until measured. Do not assume its precise API, hosting cost, or superiority. |
| UI and E2E tests | Playwright | Exercise the playable puzzle in a browser. |
| Logic tests | Vitest or existing repo test runner | Prioritize pure game rules and state transitions. |
| Deployment | Vercel + Supabase (when needed) | Local development must not depend on paid infrastructure. |

**Use the tools and package manager already present if this repository is initialized.** If starting from scratch, use `npm` so documented commands are reproducible. Never overwrite a working project merely to match this table.

## 4. Architecture rules

### 4.1 Deterministic game state owns the truth

The rendering layer displays state; it must not be the source of business rules. Centralize the following concepts:

- `inventory`: whether the player has collected the key.
- `door`: locked/unlocked state.
- `dialogue`: whether the NPC conversation panel is open.
- `sessionId`: stable identifier when persistence is introduced.
- `events`: small typed state transitions, suitable for tests.

Provide typed actions such as `collectKey`, `interactWithNpc`, `tryOpenDoor`, and `closeDialogue`. The door **must not unlock** without a key. Invalid actions should produce a clear, non-destructive UI message. Avoid duplicate collectibles and inconsistent state transitions.

### 4.2 AI proposes; validated code decides

LLM or Kev output must **never directly mutate authoritative game state**. Use this flow when AI is introduced:

`player text -> input validation -> intent/decision adapter -> typed action proposal -> deterministic rules + precondition checks -> state transition -> renderer + dialogue`

- Keep possible game actions in a small allowlist.
- Parse and validate model output against a schema (for example, Zod).
- Reject hallucinated action names, unknown targets, or missing preconditions.
- Treat the LLM as the dialogue generator, not the source of item ownership or puzzle truth.
- Record enough structured information to replay an action without re-querying a model.
- Provide a deterministic mock adapter so tests work offline.

### 4.3 Memory has separate layers

When memory is added, use three distinct concerns:

1. **Short-term context:** bounded recent dialogue turns.
2. **Long-term memory:** selected facts/events with embeddings and retrieval via pgvector; use a quality threshold and deduplication.
3. **Structured game state:** inventory, door, puzzle progress, NPC relationships; stored as typed data, never inferred from a summary.

Use session-scoped records, least-privilege database access, and appropriate row-level access controls. Never store raw tokens or secrets in memory. Set retention and deletion behavior before storing real player data.

### 4.4 Render and accessibility boundaries

- Use a Next.js client component for the R3F Canvas to avoid server-rendering issues.
- Keep game logic independent of React and Three.js objects.
- Provide a small accessible HTML action/status layer corresponding to the important 3D interactions; this also makes Playwright tests stable.
- Do not rely on brittle pixel-coordinate clicks as the only E2E testing method.
- Prefer graceful degradation over a blank screen if VRM assets or WebGL fail.
- Use a consistent desktop-first layout that remains usable on a phone browser.

## 5. Proposed repository layout

The following paths are a **target structure**, not a claim that these files already exist. Adapt to the repository you find.

```text
AGENTS.md
README.md
package.json
.env.example                      # only when configuration is introduced
src/
  app/
    page.tsx
    api/
      chat/route.ts                # later phase
      decide/route.ts              # later phase, if needed
  components/game/
    GameScene.tsx
    Room.tsx
    NPC.tsx
    GameUI.tsx
  lib/game/
    actions.ts
    rules.ts
    store.ts
  lib/ai/                        # later phase
    dialogue.ts
    intent.ts
  lib/memory/                    # later phase
    repository.ts
    retrieval.ts
  lib/decisions/                 # later phase
    adapter.ts
    llm.ts
    kev.ts
  types/
    game.ts
tests/
  game.spec.ts
  game-rules.test.ts
  decisions/                     # later phase
    fixtures.json
```

Keep naming idiomatic to the project; avoid adding every planned directory before there is code to place in it.

## 6. First task: Day 1 vertical slice

**Objective:** Produce a playable local browser demo: one room, one NPC, one key, and one door. No external credentials or model calls.

### Required work

1. Inspect the repository (`README`, `package.json`, lockfile, existing structure, git status) before changing anything. If empty, initialize a minimal Next.js + TypeScript app.
2. Add a client-rendered React Three Fiber scene containing a floor, four visible walls (with a view into the room), lighting, and orbit camera controls.
3. Add an NPC using simple geometry, one collectible key, and one locked door.
4. Implement typed deterministic game state and rule-checked actions.
5. Add a visible, accessible interaction/status UI (inventory, dialogue, door state, messages); clicking scene objects and corresponding UI controls must invoke the same actions.
6. Add unit tests for the transition rules and Playwright tests for the complete puzzle loop.
7. Document installation, start, test commands, interaction controls, and any remaining limitations in `README.md`.

### Day 1 acceptance criteria

- `npm install` succeeds on a clean checkout (or use the repository's existing package manager).
- `npm run dev` serves the application without runtime errors.
- The room is visible, the camera can be controlled, and the objects are identifiable.
- Before collecting the key, trying the door does **not** unlock it and shows a locked message.
- Collecting the key updates inventory; the same key cannot be collected twice.
- Interacting with the NPC opens a dialogue panel; it can be closed.
- After collecting the key, opening the door succeeds and updates visible state.
- Tests cover happy path, denied action, and state transitions; `npm run test` and `npm run test:e2e` are documented and run successfully after the necessary test setup.
- The implementation is local-first and requires no paid APIs, secrets, model server, or database.

**Stop at this boundary.** Do not add VRM, Supabase, Kev, Poke, or LLM integration just because they appear elsewhere in the roadmap.

## 7. Delivery roadmap (planning targets)

These are targets, not claims of completed work. Prefer independently shippable increments over a rigid calendar.

| Stage | Target outcome | Gate |
| --- | --- | --- |
| Day 1 | Deterministic playable room, NPC, key, door | Browser E2E puzzle passes. |
| Day 2 | Existing VRM avatar loads, fallback remains available | Interaction and frame rate remain usable. |
| Day 3 | LLM dialogue behind provider adapter | Structured responses and offline mock tests work. |
| Day 4 | Memory prototype with bounded context and saved game state | Restart/resume behavior and data isolation tested. |
| Day 5 | Kev adapter spike and baseline benchmark harness | Comparisons are reproducible; no premature production dependency. |
| Week 2 | Improve gameplay, dialogue UX, save/load reliability | Small public-ready loop works. |
| Week 3 | Benchmark LLM-only vs. LLM + Kev; attempt optional Poke integration only if authorized | Evaluate accuracy, latency, and total cost. |
| Week 4 | Harden, document, deploy, gather feedback | Shareable URL, green tests, known limitations. |

If delivery slips, cut optional features before weakening the playable puzzle or tests.

## 8. Kev vs. LLM-only benchmark protocol

**Hypothesis to test, not assume:** A specialized decision model may improve action consistency or cost relative to using a general-purpose LLM for every game-state decision.

- Create a **versioned, labeled** fixture dataset of player inputs and game states; cover straightforward commands, ambiguous requests, missing items, invalid targets, adversarial instructions, and repeated actions.
- Keep separate development and held-out test sets. Do not tune prompts, thresholds, or action choices on held-out examples.
- Evaluate the same action vocabulary, game rules, input cases, and deployment conditions for both approaches.
- **Baseline A:** LLM-only structured action selection.
- **Candidate B:** Kev-assisted action selection, including explicit fallback behavior when confidence is low or output is invalid.
- Record **decision accuracy**, **invalid-action proposals**, **fallback rate**, **p50/p95 end-to-end latency**, and **total cost per correct action**.
- Include hosted Kev inference cost, idle/compute allocation, fallback LLM usage, tokens, errors, and retry rates; do not compare LLM API cost against a notionally free GPU.
- Track model versions, prompts, hardware, concurrency, sample size, and measurement methodology.
- Ensure a deterministic rules engine blocks illegal transitions for both approaches.
- Do not deploy Kev into the default game path unless measured gains justify added complexity without unacceptable quality loss.

Do not invent benchmark results. Report missing data as unknown.

## 9. Agent execution and token/credit budget

### Before modifying code

1. Read `AGENTS.md`, relevant docs, `git status`, and the files affected by the task.
2. State the smallest objective and acceptance checks for this iteration.
3. Identify existing components to reuse; avoid installing new packages without a concrete need.
4. Make focused edits. Preserve unrelated changes and avoid wide-formatting unrelated files.

### While implementing

- Work in small, reviewable increments; use checkpoints before risky refactors.
- Prefer stable upstream libraries over writing framework boilerplate or inventing infrastructure.
- Run cheap, targeted checks first; then relevant integration and E2E tests.
- Do not spam model calls, full dependency reinstalls, or repeated browser sessions without diagnostic progress.
- Do not start paid services, use production tokens, publish publicly, or push changes remotely without explicit user approval.

### When stuck (hard stop after two unproductive attempts)

If **two consecutive fixes to the same failure** do not improve the evidence:

1. Stop the retry loop; do not keep generating speculative patches.
2. Capture the exact reproduction command, error, browser console/stack trace, failing test, and recent diff.
3. Reduce a Three.js issue to a minimal scene (camera + one primitive); reintroduce assets, animation, and event handlers one by one.
4. Restore the last known good checkpoint if a change caused a regression.
5. Summarize tried approaches, likely causes, and **one** next experiment; ask the user for direction if a significant blocker remains.

Never hide an unresolved failure or claim tests passed when they were not run.

## 10. Testing and quality bar

- Prefer typed domain rules and unit tests for all state transitions.
- Use a Playwright browser test to exercise: blocked door -> collect key -> NPC interaction -> unlocked door.
- Give important UI elements accessible names and stable test IDs where appropriate.
- Use mock AI adapters in CI; no real LLM, Kev endpoint, Poke account, or paid infrastructure is required for the default test suite.
- Run lint, typecheck, unit tests, and E2E tests when scripts exist; when creating scripts, document them.
- Test bad inputs, missing assets, timeouts, and failed network calls when those features are introduced.
- Keep generated assets and model outputs out of source control unless intentionally licensed, documented, and necessary.

## 11. Security, privacy, and external integration

- Keep all credentials in server-side environment variables; commit only example keys/placeholders to `.env.example`.
- Never print, commit, or include secrets in prompts, logs, screenshots, or evaluation fixtures.
- Validate and constrain all model-proposed actions. Treat user text and model responses as untrusted input.
- Protect rate-limited routes, apply timeouts and bounded retries, and constrain context size.
- For persistent user memory, define access control, retention/deletion, and session boundaries before launch.
- Add Poke or any messaging connection only through a documented, authorized mechanism; never assume access to its backend or undocumented private API.
- Keep a usable offline/local mode if third-party services are unavailable.

## 12. How to report work back to the user

For each completed coding task, respond with:

1. **Implemented:** what actually changed and key file paths.
2. **Verified:** exact commands/tests run and their results.
3. **Not done / blockers:** gaps, limitations, costs, and unverified assumptions.
4. **Next smallest milestone:** a concrete task with acceptance criteria.

Be precise about the distinction between *planned*, *implemented*, *tested*, and *deployed*. Never describe a proposal as a shipped feature.

---

**Guiding principle:** *One room. One NPC. One puzzle. Make it run, make it testable, then make it intelligent.*

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
