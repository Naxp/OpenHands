# Windows quickstart (PowerShell)

This doc contains **Windows-specific** command syntax for running RAN OpenHands.

For the main install options and overall context, see [README.md](./README.md).

## Option 1: From Source (the port's default route)

**Prerequisites**: Node.js 24 or later (as declared by `engines.node` in `package.json`), `npm`, `uv` (for running the agent server via `uvx`)

```powershell
git clone https://github.com/Naxp/OpenHands.git
Set-Location OpenHands
npm install
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

> [!WARNING]
> This runs the agent-server directly on this machine — the agent will have full access to your filesystem.

## Option 2: With a Docker Sandbox (Windows)

> [!NOTE]
> The published container image (`ghcr.io/openhands/agent-canvas`) is an **upstream OpenHands artifact** and contains upstream Agent Canvas, not this port. To build a container from this port's source, use [`docker/Dockerfile`](./docker/Dockerfile) locally.

**Prerequisites**:

- Docker Desktop for Windows
- A host directory for `PROJECTS_PATH` containing the project folders you want the agent to access (create it before starting the container)

```powershell
docker pull ghcr.io/openhands/agent-canvas:1.20.0 # x-release-please-version

$env:PROJECTS_PATH = Join-Path $HOME "projects"  # directory containing your project folders
New-Item -ItemType Directory -Force -Path $env:PROJECTS_PATH, (Join-Path $env:USERPROFILE ".openhands") | Out-Null

docker run -it --rm `
  -p 8000:8000 `
  -v "$($env:USERPROFILE)\.openhands:/home/openhands/.openhands" `
  -v "$($env:PROJECTS_PATH):/projects" `
  ghcr.io/openhands/agent-canvas:1.20.0 # x-release-please-version
```

Open [http://localhost:8000/canvas](http://localhost:8000/canvas) in your browser.

The agent will be able to access any project under `PROJECTS_PATH`.

Upstream attribution and license terms for this port are in [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
