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

DeepSeek Harness (DSH) runs as a TrueNAS SCALE Custom App on a self-hosted machine. The container image is a standard Node.js base. Inside the container, DSH installs itself at runtime via npx and serves a web UI. A small Python reverse proxy handles authentication token injection and is the port exposed to the tailnet. The data volume is mounted from the host's storage dataset, which holds the DSH profile, credentials, project files, and logs.

The harness is the primary development environment. Project directories live in the data volume, and git is configured with a credential helper that reads a token from a file. Development happens inside the container through the web UI, with SSH access to the host for container lifecycle tasks.

## Architecture

The app is defined as a Docker Compose service in TrueNAS Custom App form:

- Standard Node.js container image
- Entrypoint script orchestrates DSH startup and the auth proxy
- Two ports: one for DSH itself, one for the proxy (both localhost-only)
- Data volume mounted from the host's storage dataset
- Resource limits set to a fraction of host capacity
- Healthcheck with a long start period to accommodate npx package download
- Security hardening: no-new-privileges
- Timezone set to local
- Restart policy: unless-stopped

The container binds to localhost internally. Docker publishes the ports on localhost on the host as well. Tailnet access routes through the proxy port, not the DSH port directly.

## Entrypoint Flow

The entrypoint script does three things in sequence:

1. Starts a wrapper script in the background. This runs the DSH CLI via npx, captures the single-use startup token from the log output, and writes it to a token file.
2. Waits up to two minutes for the token file to appear, polling every two seconds.
3. Starts a proxy script in the background. This proxy forwards all HTTP and WebSocket traffic to DSH.

The wrapper then blocks on the DSH process, so if DSH exits, the wrapper exits, and the container restarts under the unless-stopped policy.

## Authentication

DSH uses a single-use startup token. On every container start, DSH generates a new token and prints it in the log as a URL parameter. The wrapper captures this token and stores it in a file.

The proxy handles token injection automatically. When a request arrives without a session cookie, the proxy reads the token from the file and appends it as a query parameter before forwarding to DSH. DSH then sets a session cookie in the response. Subsequent requests carry the cookie, so the token is no longer needed.

The token changes on every restart. To get a new token, restart the app. To access DSH manually, grep for the token pattern in the container logs or read the token file directly.

## Issues Encountered and Resolved

### Plugin Version Mismatch

An image-offload plugin declared peer dependencies on specific versions of DSH's internal packages. The installed DSH runtime was a newer release candidate. DSH detects this incompatibility at startup and disables the plugin row, logging a warning each time. The plugin does not load, and image offload features are unavailable. This does not block other functionality.

Resolution: accepted the plugin being disabled. The plugin row remains in the profile config but is skipped. To re-enable it, either install a compatible version or grant an exact-version exemption through the DSH plugin manager.

### DeepSeek API Key Failure

The LLM provider attempts to list models from the DeepSeek API on startup. This call returns HTTP 401, so DSH falls back to its bundled model catalog. The bundled catalog provides the model definitions without needing a live API call, so development continues with the statically known models.

Resolution: no change needed. The fallback is built into DSH. The 401 indicates the configured API key is missing or invalid. If live model listing is needed, update the key in the DSH provider settings.

### Token Capture Race

On initial attempts, the wrapper polled for the token file but DSH took longer than expected to start because npx had to download the package. The healthcheck start period accommodates this. The wrapper polls for 120 iterations at two seconds each, giving 240 seconds for token capture, which is usually sufficient.

Resolution: the healthcheck start period and wrapper timeout align. If npx is slow on a cold start, the container may report unhealthy until DSH finishes starting, then recover.

### Localhost-Only Binding

DSH binds to localhost inside the container. Docker publishes the ports on localhost on the host as well. This means the harness is not reachable from other machines on the LAN directly. Tailnet access is provided through the proxy port.

Resolution: this is by design for security. The proxy is the single entry point. Direct access to the DSH port is only possible from the host itself or via exec into the container.

### WebSocket Forwarding

DSH uses WebSockets for real-time communication between the browser and the server. A standard HTTP proxy does not forward WebSocket upgrade requests. The proxy includes explicit WebSocket handling: it detects the upgrade header, opens a raw TCP connection to DSH, forwards the upgrade handshake, and then runs two forwarding threads to relay data in both directions.

Resolution: a dedicated WebSocket handler method in the proxy handles this. Without it, the web UI would load but interactive features would fail.

### Git Credentials for Development

The container needs git access to push and pull from GitHub repositories. The data volume contains a git config with user name and email, and a credential helper script that echoes a stored token. A credentials file holds the token in plain text. An agents directory in the data volume holds agent configuration that DSH uses.

Resolution: git is configured with a credential store helper, and the token file provides authentication. A safe-directory setting avoids ownership warnings since files are owned by the container user but accessed as root on the host.

### Healthcheck on Cold Start

The healthcheck tests the proxy port. If DSH is still starting (npx download in progress), the proxy returns an error and the healthcheck fails. TrueNAS marks the app as unhealthy during this window.

Resolution: the start period gives enough time for a cold start. The app typically becomes healthy within two to three minutes. No action is needed beyond waiting.

## Using as Sole Development Machine

The harness serves as the primary development environment. Key characteristics:

- Project files live in the container's data directory, backed by the host's storage dataset. This persists across container restarts.
- The web UI provides a browser-based IDE and terminal.
- Git operations work through the configured credential helper.
- Node.js is available in the container image.
- Python is available for scripting and the proxy.
- The DSH directory holds its own configuration, including model provider authentication, credentials, and workspace state.

## Access

- Access is through the tailnet (not published here for security)
- Token file location: on the host's data volume
- Container logs: via docker logs on the host
- Restart to regenerate token: TrueNAS app restart or the host's app management command

## Resource Notes

- The container is limited to a fraction of host CPU and memory.
- A GPU is present on the host but is not passed through to this container. GPU workloads run in separate containers.
- The host's storage mirror provides the backing storage for the data volume.