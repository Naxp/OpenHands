# RAN OpenHands port notes

**Status:** current port conventions for the RAN ecosystem port of OpenHands Agent Canvas.

## What this port is

`ran-openhands` is the RAN (Robotic AI Ninja) ecosystem port of OpenHands Agent Canvas, published at `https://github.com/Naxp/OpenHands` (a fork of `OpenHands/OpenHands`, set to private).

- The application code is upstream OpenHands Agent Canvas, carried at upstream `main`.
- RAN-authored material is limited to port branding, port packaging, port documentation, and RAN source changes made after the fork date.
- Licensing is split, and both parts are in `LICENSE`: RAN modifications and additions after the fork date are **proprietary** (Copyright © 2026 RAN, all rights reserved); upstream OpenHands Agent Canvas is **MIT** (Copyright © 2025 OpenHands contributors) with its notice retained verbatim. Upstream attribution is recorded in `NOTICE`.
- Port fork date: **2026-09-19**. Port base commit: upstream `main` = `a07364828c8f202e7745c6bce3dcef3915ae7ac1` (2026-09-18).

## What was rebranded

| File | RAN-authored change |
|---|---|
| `README.md` | Retitled to RAN OpenHands; RAN framing, port scope, port-first quickstart, split-license section, repository-boundary table extended with the port row. |
| `README.windows.md` | Retitled scope to RAN OpenHands; adds the from-source Windows route; labels the published container image as upstream. |
| `docs/README.md` | Docs index title/entry point for the port. |
| `LICENSE` | Part 1 RAN proprietary notice above Part 2 upstream MIT; the upstream MIT text and copyright notice are retained verbatim as required. |
| `NOTICE` | New. Upstream attribution, port base commit and fork date, licensing split, and the list of upstream identifiers intentionally left unchanged. |

## What was deliberately NOT rebranded

Upstream identifiers that the build, runtime, and upstream sync depend on stay as-is:

- npm packages `@openhands/agent-canvas`, `@openhands/typescript-client`, `@openhands/extensions`
- container image `ghcr.io/openhands/agent-canvas`
- `.openhands` / `~/.openhands` state directories and `/home/openhands/.openhands`
- `OH_*` environment variables
- the `agent-canvas` CLI/binary name
- `docs.openhands.dev` / `go.openhands.dev` upstream documentation and community links
- `src/` product strings and i18n resources (1,400+ upstream references) — a full source-level rename is a separate, much larger change and would break upstream sync

## Remotes and push path

| Remote | URL | Use |
|---|---|---|
| `origin` | `https://github.com/Naxp/OpenHands.git` | Port write path (RAN fork). Push port commits here through the `Naxp` GitHub identity. |
| `upstream` | `https://github.com/OpenHands/OpenHands.git` | **Read/fetch only** — upstream. Never push port commits here. |

Port commits must never be pushed to `upstream`.

## Syncing with upstream

The rebranded files are also upstream trackers, so they are the **expected and only** conflict surface when syncing. Everything else fast-forwards cleanly.

```sh
git fetch upstream                     # upstream main
git rebase upstream/main               # replays port commits on top of upstream
# conflicts, if any, appear in: README.md, README.windows.md, docs/README.md, LICENSE
```

On a conflict, keep upstream's technical content changes and re-apply the RAN branding framing on top — the rebrand is additive (title, port scope, attribution, license split), so upstream's substantive edits should win inside each section, while the RAN title, port sections, and license parts are preserved.

After any sync, re-verify that `LICENSE` Part 2 still carries the upstream MIT notice verbatim before pushing.

## Local checkouts

- Workstation checkout: `C:\Projects\OpenHands` (Windows). Directory name is historical; the repository identity is `ran-openhands`.

## Deployment

This port is not currently deployed as a RAN site. When it is deployed, use the owning RAN deployment route (BigDog site deployment) and record the runtime in `ComputerWork` — do not treat this repository as self-deploying.
