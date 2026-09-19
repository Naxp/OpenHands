# RAN OpenHands port notes

**Status:** current port conventions for the RAN ecosystem port of OpenHands Agent Canvas.

## What this port is

`ran-openhands` is the RAN (Robotic AI Ninja) ecosystem port of OpenHands Agent Canvas, published privately at `https://github.com/Naxp/ran-openhands`.

- The application code is upstream OpenHands Agent Canvas, carried at upstream `main`.
- RAN-authored material is limited to port branding, port packaging, and port documentation.
- Upstream's MIT license and copyright notice are retained in full (`LICENSE`); upstream attribution is recorded in `NOTICE`.
- The port base commit at first push was upstream `main` = `a07364828c8f202e7745c6bce3dcef3915ae7ac1` (2026-09-18).

## What was rebranded

| File | RAN-authored change |
|---|---|
| `README.md` | Retitled to RAN OpenHands; RAN framing, port scope, port-first quickstart, upstream/license section, repository-boundary table extended with the port row. |
| `README.windows.md` | Retitled scope to RAN OpenHands; adds the from-source Windows route; labels the published container image as upstream. |
| `docs/README.md` | Docs index title/entry point for the port. |
| `LICENSE` | Upstream MIT text and copyright retained verbatim; RAN port notice appended below it. |
| `NOTICE` | New. Upstream attribution, port base commit, and the list of upstream identifiers intentionally left unchanged. |

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
| `origin` | `https://github.com/OpenHands/OpenHands.git` | **Read/fetch only** — this is upstream. Never push port commits here. |
| `ran` | `https://github.com/Naxp/ran-openhands.git` | Port write path. Push port commits here through the `Naxp` GitHub identity. |

Do not replace, repurpose, or push through upstream `origin`. Port commits go to `ran`.

## Syncing with upstream

The rebranded files are also upstream trackers, so they are the **expected and only** conflict surface when syncing. Everything else fast-forwards cleanly.

```sh
git fetch origin                       # upstream main
git rebase origin/main                 # replays port commits on top of upstream
# conflicts, if any, appear in: README.md, README.windows.md, docs/README.md, LICENSE
```

On a conflict, keep upstream's technical content changes and re-apply the RAN branding framing on top — the rebrand is additive (title, port scope, attribution), so upstream's substantive edits should win inside each section, while the RAN title/attribution/port sections are preserved.

After any sync, re-verify that `LICENSE` still carries the upstream MIT notice verbatim before pushing.

## Local checkouts

- Workstation checkout: `C:\Projects\OpenHands` (Windows). Directory name is historical; the repository identity is `ran-openhands`.

## Deployment

This port is not currently deployed as a RAN site. When it is deployed, use the owning RAN deployment route (BigDog site deployment) and record the runtime in `ComputerWork` — do not treat this repository as self-deploying.
