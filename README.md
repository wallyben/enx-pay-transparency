# Euronext Pay Transparency Control Tower

Internal multi-country pay transparency compliance platform for Euronext.

## Setup

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## Development

```bash
docker compose -f infra/docker/docker-compose.dev.yml up
```

## Governance

- Active slice and build status: [.claude/SLICE_QUEUE.md](.claude/SLICE_QUEUE.md)
- Project plan: [.claude/PROJECT_PLAN.md](.claude/PROJECT_PLAN.md)
- Architecture decisions: [docs/adr/](docs/adr/)
