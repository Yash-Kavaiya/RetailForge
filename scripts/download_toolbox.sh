#!/usr/bin/env bash
# Download the MCP Toolbox (genai-toolbox) binary into ./toolbox.
# Docs: https://googleapis.github.io/genai-toolbox/getting-started/introduction/
set -euo pipefail

VERSION="${TOOLBOX_VERSION:-0.18.0}"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
esac

URL="https://storage.googleapis.com/genai-toolbox/v${VERSION}/${OS}/${ARCH}/toolbox"
DEST="$(dirname "$0")/../toolbox/toolbox"

echo "Downloading MCP Toolbox v${VERSION} for ${OS}/${ARCH} ..."
curl -fsSL -o "$DEST" "$URL"
chmod +x "$DEST"
echo "Saved to $DEST"
echo "Run it with: cd toolbox && ./toolbox --tools-file tools.yaml"
