# RetailForge — developer commands
# Usage: `make <target>`.  Requires `uv` (https://docs.astral.sh/uv/) and Node 20+.

.DEFAULT_GOAL := help
SHELL := /bin/bash

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

install: ## Install Python + dev dependencies (uv)
	uv sync --extra dev

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

toolbox-download: ## Download the genai-toolbox binary into ./toolbox (Linux/macOS)
	bash scripts/download_toolbox.sh

seed: ## Seed MongoDB Atlas with sample data + build the vector index
	uv run python -m data.seed

toolbox: ## Run the MCP Toolbox server (reads toolbox/tools.yaml)
	cd toolbox && ./toolbox --tools-file tools.yaml --address 0.0.0.0 --port 5000

dev-web: ## Run the ADK dev UI (backend-only testing of agents)
	uv run adk web adk_apps

backend: ## Run the FastAPI AG-UI backend on :8000
	uv run uvicorn app.server:app --reload --host 0.0.0.0 --port 8000

frontend: ## Run the Next.js storefront on :3000
	cd frontend && npm run dev

read-api: ## Run the storefront read API (products/orders) on :8001
	uv run uvicorn app.read_api:app --reload --host 0.0.0.0 --port 8001

test: ## Run the Python test suite
	uv run pytest -q

lint: ## Lint with ruff
	uv run ruff check .

compose-up: ## Start toolbox + backend + read-api + frontend via docker-compose
	docker compose up --build

.PHONY: help install install-frontend toolbox-download seed toolbox dev-web backend frontend read-api test lint compose-up
