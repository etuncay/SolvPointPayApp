---
name: "mcp-server-builder"
description: "Design and ship production-ready MCP (Model Context Protocol) servers from OpenAPI contracts instead of hand-written tool wrappers. Python and TypeScript support, schema validation, safe evolution. Use when exposing an existing API as an MCP server, building tool integrations for Cursor or Codex or other agents, or scaffolding an MCP project from scratch."
---

# MCP Server Builder

Ship MCP servers from OpenAPI — not hand-written one-off wrappers.

## When to use

Expose REST API to agents; replace brittle browser automation; bootstrap from existing OpenAPI spec.

## Workflow

### 1. OpenAPI → MCP scaffold
1. Valid OpenAPI spec as source of truth
2. One operation → one tool; use `operationId` as tool name
3. Generate with official SDK: Python `mcp`/FastMCP, TypeScript `@modelcontextprotocol/sdk`
4. Add runtime logic per endpoint

### 2. Contract quality gates (validate before publish)

- Verb-first tool names; clear descriptions
- Required fields explicitly typed (ajv/jsonschema strict mode)
- Destructive ops need confirmation parameter
- Consistent error shape: `{code, message, details}`
- Never expose secrets in schemas; env for credentials
- Additive-only changes; new tool ID for breaking behavior

### 3. Runtime choice

- **Python** — data-heavy, fast iteration
- **TypeScript** — shared types with JS stack

### 4. Safety

Outbound host allowlist; rate-limit expensive tools; timeouts; redact auth from logs; structured 4xx/5xx for agent recovery.

### 5. Testing

Unit: OpenAPI→schema transform. Contract: snapshot manifest in PR. Integration: staging API. Resilience: upstream error shapes.

## Pitfalls

Raw path tool names; missing descriptions; mega-tools; opaque errors; renaming tools in-place.

## References

[MCP spec](https://modelcontextprotocol.io) · [Python SDK](https://github.com/modelcontextprotocol/python-sdk) · [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) · Inspector: `@modelcontextprotocol/inspector`
