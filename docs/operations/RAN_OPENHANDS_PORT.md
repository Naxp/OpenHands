# RAN OpenHands engine-fork notes

**Repository:** `Naxp/OpenHands`  
**Role:** RAN-maintained Agent Canvas engine fork  
**Product/master authority:** `Naxp/ran-openhands`  
**Upstream:** `OpenHands/OpenHands`

## What this repository is

`Naxp/OpenHands` is the RAN-maintained fork of OpenHands Agent Canvas.

It is **not** the `ran-openhands` product/master repository and it does not own the `oh.ranstudio.site` deployment composition.

The repository split is intentional:

- `Naxp/OpenHands` — Agent Canvas engine fork and only those compatibility changes that must live inside the engine.
- `Naxp/ran-openhands` — RAN OpenHands website/BFF, RAN integrations, architecture, deployment contract, release/work state and product authority.
- `OpenHands/OpenHands` — upstream source tracked by this fork.

The product master contract is `Naxp/ran-openhands/docs/architecture/MASTER_PLAN.md`. The exact engine requirements are `Naxp/ran-openhands/docs/architecture/ENGINE_FORK_CONTRACT.md`.

## Upstream baseline

- Fork date: **2026-09-19**.
- Recorded upstream base for the first RAN port commits: `a07364828c8f202e7745c6bce3dcef3915ae7ac1`.
- Upstream release ancestry at fork: Agent Canvas 1.20.0 plus subsequent upstream `main` commits through the recorded base.

The fork should continue tracking upstream rather than becoming a permanently pinned snapshot.


## P1 managed-host compatibility seam

P1 is source-complete in this engine fork. The compatibility surface is intentionally narrow and generic:

- `src/api/managed-host-config.ts` parses the versioned, browser-visible `window.__AGENT_CANVAS_MANAGED_HOST__` contract. It carries bounded identifiers/presentation context only and must never contain private service credentials.
- `scripts/static-server.mjs --managed-host-config <json>` injects that contract before application code and marks managed-host index responses `no-store`.
- managed mode creates one host-owned browser backend using the existing local Agent Server protocol with `authMode: "managed"`, an empty browser API key, and same-origin by default; the BFF remains responsible for private downstream authentication.
- backend registry storage and in-memory selection are host-authoritative in managed mode. Standalone backend state is left intact so normal Agent Canvas behavior returns when managed mode is absent.
- first-run onboarding, API-key entry, backend recovery mutation UI, and Add/Manage backend controls are bypassed or hidden for managed hosts. Standalone/local/cloud behavior remains unchanged outside managed mode.
- `AgentCanvasHostProvider` and `AgentServerUIProviders.host` expose bounded host context plus generic navigation and lifecycle callbacks. The public library surface exports the managed-host context types/getters and host bridge types.
- prebuilt managed hosting also emits generic `agent-canvas:host-navigation` and `agent-canvas:host-lifecycle` DOM events, so a host does not need RAN URLs or service clients compiled into Agent Canvas.
- evidence-backed lifecycle observations cover conversation creation, ready, running, stopped, error, and backend degradation/recovery. Candidate-change availability is intentionally not emitted until Canvas has a reliable source for that fact. Workspace close/archive event/action types are available for host-owned UI to invoke without inventing an engine-side business workflow.
- managed prebuilt hosting disables Agent Canvas telemetry by default through the existing telemetry provider configuration. Library hosts retain the existing explicit `analytics` configuration surface.
- Event Gateway publication, durable outbox/retry/signing, RAN Identity, Command, CommitCrow, Krypton routing, and deployment authority remain outside this fork in `Naxp/ran-openhands`.

This is a source contract only. Runtime behavior still requires a later light acceptance pass in the owning product/deployment phase.

## RAN changes allowed here

Prefer the smallest practical compatibility surface.

Appropriate changes include:

- managed-host/runtime configuration needed by the RAN shell;
- same-origin/private backend transport support;
- host-provided launch/project context;
- host navigation and lifecycle hooks;
- library/embed seams required by the RAN website;
- configuration to hide upstream cloud/onboarding surfaces that do not apply in RAN mode;
- telemetry/privacy controls that cannot be supplied cleanly by the host;
- narrowly scoped engine fixes required for RAN compatibility.

RAN-specific business logic does **not** belong here when it can live in `Naxp/ran-openhands`.

Do not implement here:

- RAN Identity verification;
- Command catalog/project clients;
- ComputerWork/RAN Central context retrieval;
- AI Hub service credential storage;
- Event Gateway source signing/outbox persistence;
- Realtime service credentials;
- CommitCrow/Security workflow policy;
- RCommand deployment execution;
- BigDog deployment configuration.

## Functional upstream identifiers

Keep functional upstream identifiers unchanged unless a real compatibility defect requires a change:

- npm packages `@openhands/agent-canvas`, `@openhands/typescript-client`, `@openhands/extensions`;
- `.openhands` / `~/.openhands` state directories;
- `OH_*` environment variables;
- `agent-canvas` CLI name;
- canonical Agent Server request/response fields;
- upstream service/package references required by the build.

This keeps the fork buildable and reduces upstream-sync conflict.

## Remotes and push path

Recommended local remotes:

| Remote | URL | Use |
|---|---|---|
| `origin` | `https://github.com/Naxp/OpenHands.git` | RAN engine-fork write path. |
| `upstream` | `https://github.com/OpenHands/OpenHands.git` | Read/fetch only. Never push RAN commits here. |

RAN fork commits must never be pushed to upstream.

## Syncing with upstream

Before synchronization, record the current fork head and inspect upstream movement.

Preferred shape:

```sh
git fetch origin
git fetch upstream
git checkout main
git pull --ff-only origin main
git rebase upstream/main
```

Resolve conflicts by preserving upstream technical changes first, then re-applying the smallest RAN compatibility delta.

Files intentionally carrying RAN fork framing such as `README.md`, `README.windows.md`, `docs/README.md`, `LICENSE`, `NOTICE`, and this file are expected conflict candidates.

After synchronization:

- retain the upstream MIT notice required for upstream software;
- preserve the RAN modifications/additions notice where applicable;
- update the recorded upstream base in the fork notes/work state;
- independently re-read the landed remote SHA.

## Local checkout

Known workstation checkout:

`C:\\Projects\\OpenHands`

The directory name matches the engine fork and should not be renamed merely to match the product repository.

## Product/deployment boundary

The `oh.ranstudio.site` product is commissioned from `Naxp/ran-openhands`.

This engine fork may produce source/build artifacts consumed by that product, but:

- a fork commit is not a site deployment;
- the engine repository is not the canonical deployment runbook;
- Command/RCommand retain their normal deployment-topology/execution authority;
- BigDog production agent execution must not default to unrestricted host filesystem access.

## Licensing

The upstream OpenHands code remains under its upstream MIT license and required notice.

RAN-authored modifications/additions after the fork are covered by the RAN notice currently carried in this fork's `LICENSE` and `NOTICE`.

Repository role and licensing are separate concerns: describing this repo as the engine fork does not change the applicable upstream or RAN-authored license scope.
