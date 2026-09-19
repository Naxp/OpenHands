<a name="readme-top"></a>

<div align="center">
  <h1 align="center" style="border-bottom: none">RAN OpenHands Engine Fork</h1>
  <p align="center">
    <strong>The RAN-maintained Agent Canvas engine fork used by the RAN OpenHands product.</strong>
  </p>
  <p align="center">
    Run OpenHands, Claude Code, Codex, Gemini, or any ACP-compatible agent across local, remote, and cloud backends.
  </p>
</div>
<div align="center">
  <a href="#quickstart">Quickstart</a> |
  <a href="./docs/README.md">Docs</a> |
  <a href="./docs/SELF_HOSTING.md">Self-Hosting</a> |
  <a href="./docs/operations/RAN_OPENHANDS_PORT.md">Port notes</a> |
  <a href="#upstream-and-license">Upstream &amp; license</a>
</div>
<hr>

**`Naxp/OpenHands`** is the RAN-maintained engine fork of [OpenHands Agent Canvas](https://github.com/OpenHands/OpenHands). The RAN product, website/BFF, integration authority, deployment contract, and master work state live separately in [`Naxp/ran-openhands`](https://github.com/Naxp/ran-openhands). This repository stays close to upstream and carries only compatibility changes that must live inside Agent Canvas.

It runs locally on your machine by default, but can connect to multiple “agent backends”, e.g. running agents in Docker containers, on VMs, or within your company infrastructure. You can optionally choose to run agents on OpenHands Cloud or OpenHands Enterprise infrastructure.

RAN OpenHands runs the open source OpenHands agent out-of-the-box, but can use any third-party agent like Claude Code and Codex.

| Feature                                                                                                              | What it gives you                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [**Self-host your way**](https://docs.openhands.dev/openhands/usage/agent-canvas/backend-setup/vm)                   | Run agents locally, in Docker, on VMs, or anywhere you can run an agent server backend                                                   |
| [**Switch between different backends**](https://docs.openhands.dev/openhands/usage/agent-canvas/backends)            | Switch between local, remote, and cloud agents without losing focus                                                                      |
| [**Create automations**](https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations)               | Create automations and workflows that integrate with Slack, GitHub, Linear, and more. Run on a schedule or in response to webhook events |
| [**Integrate with the tools you use**](https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations) | Connect your automations with third-party services like Slack, GitHub, Notion, and more to automate workflows                            |
| [**Bring your own model**](https://docs.openhands.dev/openhands/usage/settings/llm-settings#llm-profiles)            | Use with any LLM                                                                                                                         |
| [**Use with any agent**](https://docs.openhands.dev/openhands/usage/agent-canvas/acp-agents)                         | Use with OpenHands, Claude Code, Codex, Gemini, or any agent with Agent-Client Protocol (ACP).                                           |

Feature links above point at the [upstream OpenHands documentation](https://docs.openhands.dev); see [`docs/README.md`](./docs/README.md) for the documentation shipped with this port.

## Repository role

- This repository (`Naxp/OpenHands`) is the **RAN-maintained Agent Canvas engine fork**.
- Product/master authority is [`Naxp/ran-openhands`](https://github.com/Naxp/ran-openhands), which owns `oh.ranstudio.site`, the RAN BFF/control gateway, ecosystem integrations, deployment contracts, and durable work state.
- The engine code remains intentionally upstream-shaped. Put RAN-specific business logic in `ran-openhands` unless the behavior must live inside Agent Canvas to expose a clean host/compatibility seam.
- RAN-authored modifications and additions are proprietary; the upstream MIT license covering OpenHands Agent Canvas is retained in full. Both are in [LICENSE](./LICENSE), with attribution in [NOTICE](./NOTICE). See [Upstream and license](#upstream-and-license).
- Upstream sync and fork conventions are recorded in [`docs/operations/RAN_OPENHANDS_PORT.md`](./docs/operations/RAN_OPENHANDS_PORT.md).

## Quickstart

You can run this RAN engine fork on any development machine: on your laptop, on dedicated hardware, or on a server. The production RAN product is composed and commissioned from `Naxp/ran-openhands`.

The most powerful way to run it is on a server in the cloud. This allows your agents to continue running even when your laptop is shut, and makes it easier to trigger your agents through third-party services like Slack, GitHub, and Datadog. See [SELF_HOSTING.md](docs/SELF_HOSTING.md) for details, especially with respect to security hardening.

Notably, you can run the backend in _multiple different environments_, and switch between them from the same RAN OpenHands frontend. E.g. you can share an Agent Server with your team for agents doing code review and dependency updates, then have your personal agents running on your laptop.

### Option 1: From Source (the port's default route)

> [!WARNING]
> This runs the agent-server directly on the machine you're installing on — the agent will have full access to your filesystem!

**Prerequisites**: Node.js 24 or later (as declared by `engines.node` in `package.json`), `npm`, `uv` (for running the agent server via `uvx`)

```sh
git clone https://github.com/Naxp/OpenHands.git
cd OpenHands
npm install
npm run dev
```

The `npm run dev` stack starts the full local environment for this checkout. You can also split it when you want to run pieces separately via the `agent-canvas` CLI described in [`bin/agent-canvas.mjs`](./bin/agent-canvas.mjs).

### Option 2: With a Docker Sandbox

> [!NOTE]
> The published container image (`ghcr.io/openhands/agent-canvas`) is an **upstream OpenHands artifact** and contains upstream Agent Canvas, not this RAN engine fork. This fork currently ships from source unless a RAN-owned image is explicitly commissioned later.

**Prerequisites**:

- Docker: Docker Desktop on macOS/Windows, or Docker Engine/Docker Desktop on Linux.
- A host directory for `PROJECTS_PATH` containing the project folders you want the agent to access. Create it before starting the container.

**macOS / Linux:**

```sh
export PROJECTS_PATH="$HOME/projects"  # directory containing your project folders
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"

docker run -it --rm \
  -p 8000:8000 \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  ghcr.io/openhands/agent-canvas:1.20.0 # x-release-please-version
```

**Windows (PowerShell / Windows Terminal):** See [README.windows.md](./README.windows.md) for the equivalent commands.

The agent will be able to access any project under `PROJECTS_PATH`.

To build a container from this engine fork's source instead, use [`docker/Dockerfile`](./docker/Dockerfile) locally.

---

Access the UI at [http://localhost:8000](http://localhost:8000) for the source launcher, or [http://localhost:8000/canvas](http://localhost:8000/canvas) for the Docker image. You can add additional backends directly from the UI.

# Architecture

Agent Canvas in this engine fork is powered by the [OpenHands Agent Server](https://github.com/OpenHands/software-agent-sdk/tree/main/openhands-agent-server/openhands/agent_server), a REST API for running multiple agents on a single machine. The RAN production architecture places private Agent Server backends behind the `ran-openhands` control gateway rather than exposing reusable backend credentials to the public browser.

You can run an Agent Server anywhere:

- Directly on your laptop (be careful!)
- On a dedicated machine like a Mac Mini
- On a virtual machine in the cloud
- Inside OpenHands Cloud (the upstream commercial offering)

The Agent Server is often paired with an [Automation Server](https://github.com/OpenHands/automation), which lets you set up agents that run on a schedule or in response to events.

<img width="1456" height="1258" alt="image" src="https://github.com/user-attachments/assets/cb6de6f5-ac30-4d04-a76a-b5c259f0c163" />

### Repository boundaries

Agent Canvas is part of a multi-repository OpenHands system. In RAN, this checkout is the engine layer only — changes should go to the repository that owns the behavior:

| Repository | Responsibility |
|---|---|
| [`Naxp/ran-openhands`](https://github.com/Naxp/ran-openhands) | RAN OpenHands product authority: website/BFF, RAN integrations, deployment composition, architecture and work state. |
| [`Naxp/OpenHands`](https://github.com/Naxp/OpenHands) (this repo) | RAN-maintained Agent Canvas engine fork and narrow host-compatibility surface. |
| [`OpenHands/OpenHands`](https://github.com/OpenHands/OpenHands) (upstream) | Upstream source this fork tracks; general upstream product behavior belongs upstream. |
| [`OpenHands/software-agent-sdk`](https://github.com/OpenHands/software-agent-sdk) | Python SDK, Agent Server, agents, tools, conversations, workspaces, events, and the canonical server API. |
| [`OpenHands/typescript-client`](https://github.com/OpenHands/typescript-client) | Browser-compatible TypeScript client for the Agent Server API. |
| [`OpenHands/automation`](https://github.com/OpenHands/automation) | Automation definitions, scheduling, webhooks, run history, and dispatching. |

The Agent Server API is implemented by the SDK and consumed through the TypeScript client by Agent Canvas. The automation service decides when work runs and dispatches conversations to the Agent Server/SDK, which decides what runs. See [`AGENTS.md`](./AGENTS.md) for contributor-specific boundaries and the required custom code-review guide.

<a name="upstream-and-license"></a>

## Upstream and license

This RAN engine fork is based on [OpenHands Agent Canvas](https://github.com/OpenHands/OpenHands). Licensing is split, and both parts live in [LICENSE](./LICENSE):

- **RAN modifications and additions — proprietary.** Everything RAN authored after the 2026-09-19 fork date (port branding, port packaging, port documentation, and RAN source changes) is Copyright © 2026 RAN (Robotic AI Ninja), all rights reserved. Unauthorized copying, distribution, or modification of that new code is prohibited.
- **Upstream OpenHands Agent Canvas — MIT.** The upstream notice (Copyright © 2025 OpenHands contributors) and the MIT permission notice are retained in full, as the MIT License requires, and continue to govern the upstream software this port builds on.

Upstream attribution and third-party references are recorded in [NOTICE](./NOTICE).

Upstream product naming that appears in code, environment variables, container paths, and published artifacts — for example `@openhands/*` packages, `.openhands` directories, `OH_*` environment variables, and `ghcr.io/openhands/*` images — is functional upstream surface, not RAN branding, and is intentionally left intact so the port stays buildable and upstream-syncable.

## More documentation

- [Documentation index](./docs/README.md)
- [Engine-fork notes](./docs/operations/RAN_OPENHANDS_PORT.md)
- [Architecture overview](./docs/architecture.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Self-hosting guide](./docs/SELF_HOSTING.md)
