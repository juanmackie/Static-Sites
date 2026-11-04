---
title: "DeepSeek Harness on TrueNAS as a Development Machine"
description: "How a DeepSeek Harness instance was deployed as a TrueNAS SCALE Custom App, the issues encountered during setup, and how it became the sole development environment."
category: ai-ops
date: 2026-11-04
updated: 2026-11-04
curated: false
draft: false
platform: site
---

DeepSeek Harness (DSH) runs as a TrueNAS SCALE Custom App on a Z640 host. The container image is `node:24-bookworm`. Inside the container, DSH installs itself at runtime via `npx -y @deepseek-ai/dsh@latest` and serves a web UI on port 3080. A small Python reverse proxy on port 8449 handles authentication token injection and is the port exposed to the tailnet. The data volume at `/mnt/tank/apps/deepseek-harness` is mounted to `/data` inside the container, which holds the DSH profile, credentials, project files, and logs.

The harness is the primary development environment. Project directories such as `General/` and `Voice_MVP/` live in the data volume, and git is configured with a credential helper that reads a token from a file. Development happens inside the container through the web UI, with SSH access to the host for container lifecycle tasks.

## Architecture

The app is defined as a Docker Compose service in TrueNAS Custom App form:

- Image: `node:24-bookworm`
- Command: `sh /data/entrypoint.sh`
- Ports: `127.0.0.1:3080` and `127.0.0.1:8449` (localhost only, not bound to all interfaces)
- Volume: `/mnt/tank/apps/deepseek-harness` mounted to `/data`
- Resource limits: 4 CPUs, 10 GB memory
- Healthcheck: `wget -qO- http://127.0.0.1:8449/` every 30 seconds, 5 retries, 300 second start period
- Security: `no-new-privileges:true`
- Timezone: Australia/Brisbane
- Restart policy: `unless-stopped`

The container's hostname resolves to its own IP, so DSH binds to `127.0.0.1` inside the container and the published ports map to localhost on the host. Tailnet access to port 8448 routes to the proxy port 8449.

## Entrypoint Flow

The entrypoint script does three things in sequence:

1. Starts `dsh_wrapper.py` in the background. This script runs the DSH CLI via npx, captures the single-use startup token from the log output using a regex (`token=([^\\s]+)`), and writes it to `/data/dsh_token.txt`.
2. Waits up to 120 seconds for the token file to appear, polling every 2 seconds.
3. Starts `dsh_proxy.py` in the background on port 8449. This proxy forwards all HTTP and WebSocket traffic to DSH on port 3080.

The wrapper then blocks on the DSH process, so if DSH exits, the wrapper exits, and the container restarts under the `unless-stopped` policy.

## Authentication

DSH uses a single-use startup token. On every container start, DSH generates a new token and prints it in the log as a URL parameter. The wrapper captures this token and stores it in `/data/dsh_token.txt`.

The proxy handles token injection automatically. When a request arrives without a session cookie, the proxy reads the token from the file and appends it as a `token=` query parameter before forwarding to DSH. DSH then sets a session cookie in the response. Subsequent requests carry the cookie, so the token is no longer needed.

The token changes on every restart. To get a new token, restart the app. To access DSH manually, grep for `token=` in the container logs or read `/data/dsh_token.txt`.

## Issues Encountered and Resolved

### Plugin Version Mismatch

The `image-offload` plugin at version `0.2.0-rc.1` declared peer dependencies on `@deepseek-ai/dsh-agent`, `@deepseek-ai/dsh-compaction`, `@deepseek-ai/dsh-llm`, and `@deepseek-ai/dsh-session` at exactly `0.2.0-rc.1`. The installed DSH runtime is `0.2.1-rc.5`. DSH detects this incompatibility at startup and disables the plugin row, logging a warning each time. The plugin does not load, and image offload features are unavailable. This does not block other functionality.

Resolution: accepted the plugin being disabled. The plugin row remains in the profile config but is skipped. To re-enable it, either install a compatible version or grant an exact-version exemption with `dsh plugin allow-version`.

### DeepSeek API Key Failure

The LLM provider for `llm-deepseek-api-key` attempts to list models from `https://api.deepseek.com/models` on startup. This call returns HTTP 401, so DSH falls back to its bundled model catalog. The bundled catalog provides the model definitions without needing a live API call, so development continues with the statically known models.

Resolution: no change needed. The fallback is built into DSH. The 401 indicates the configured API key is missing or invalid. If live model listing is needed, update the key in the DSH provider settings.

### Token Capture Race

On initial attempts, the wrapper polled for the token file but DSH took longer than expected to start because npx had to download the package. The healthcheck start period of 300 seconds accommodates this. The wrapper polls for 120 iterations at 2 seconds each, giving 240 seconds for token capture, which is usually sufficient.

Resolution: the 300 second healthcheck start period and 240 second wrapper timeout align. If npx is slow on a cold start, the container may report unhealthy until DSH finishes starting, then recover.

### Localhost-Only Binding

DSH binds to `127.0.0.1` inside the container. Docker publishes the ports on `127.0.0.1` on the host as well. This means the harness is not reachable from other machines on the LAN directly. Tailnet access is provided through port 8448, which routes to the proxy on 8449.

Resolution: this is by design for security. The proxy on 8449 is the single entry point. Direct access to port 3080 is only possible from the host itself or via exec into the container.

### WebSocket Forwarding

DSH uses WebSockets for real-time communication between the browser and the server. A standard HTTP proxy does not forward WebSocket upgrade requests. The proxy includes explicit WebSocket handling: it detects the `Upgrade: websocket` header, opens a raw TCP connection to DSH, forwards the upgrade handshake, and then runs two forwarding threads to relay data in both directions.

Resolution: the `_handle_websocket` method in `dsh_proxy.py` handles this. Without it, the web UI would load but interactive features would fail.

### Git Credentials for Development

The container needs git access to push and pull from GitHub repositories. The data volume contains a `.gitconfig` with user name and email, and a `git-credential-token.sh` script that echoes a stored token. The `.git-credentials` file holds the token in plain text. The `.agents` directory in the data volume holds agent configuration that DSH uses.

Resolution: git is configured with `credential.helper = store`, and the token file provides authentication. The `safe.directory = *` setting avoids ownership warnings since files are owned by UID 10000 (the container user) but accessed as root on the host.

### Healthcheck on Cold Start

The healthcheck tests port 8449, which is the proxy. If DSH is still starting (npx download in progress), the proxy returns 502 and the healthcheck fails. TrueNAS marks the app as unhealthy during this window.

Resolution: the 300 second start period gives enough time for a cold start. The app typically becomes healthy within 2 to 3 minutes. No action is needed beyond waiting.

## Using as Sole Development Machine

The harness serves as the primary development environment. Key characteristics:

- Project files live in `/data` on the container, backed by the ZFS tank dataset on the host. This persists across container restarts.
- The web UI at the tailnet URL provides a browser-based IDE and terminal.
- Git operations work through the configured credential helper.
- Node.js 24 is available in the container image.
- Python 3 is available for scripting and the proxy.
- The `.dsh` directory holds DSH's own configuration, including OpenAI Codex authentication, credentials, and workspace state.

## Access

- Tailnet URL: `https://truenas-admin.tailc4690.ts.net:8448/`
- Token file on host: `/mnt/tank/apps/deepseek-harness/dsh_token.txt`
- Container logs: `docker logs deepseek-harness`
- Restart to regenerate token: TrueNAS app restart or `midclt call app.restart deepseek-harness`

## Resource Notes

- The container is limited to 4 CPUs and 10 GB RAM. The Z640 host has an Intel Xeon E5-2620 v4 (8 cores, 16 threads) and 32 GB RAM, so the harness uses roughly half the available memory when at limit.
- A Quadro P4000 GPU is present on the host but is not passed through to this container. GPU workloads run in separate containers.
- ZFS tank mirror provides the backing storage for the data volume.
path">
/opt/data/_staging/website-sweep-20261104/juanmackie.com/astro-site/src/content/writing/deepseek-harness-truenas-dev-machine.md