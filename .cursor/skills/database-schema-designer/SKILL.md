---
name: "database-schema-designer"
description: "Use when the user asks to create ERD diagrams, normalize database schemas, design table relationships, or plan schema migrations."
---

# Database Schema Designer

Design relational schemas, migrations, types, RLS, indexes, seed data, ERDs.

## When to use

New tables, normalization review, multi-tenancy, migration planning, type generation from schema.

## Design process

### 1. Requirements → entities
Extract nouns from requirements; identify junction tables for M:N.

### 2. Relationships
Map 1:1, 1:N, M:N; name FK columns `{entity}_id`.

### 3. Cross-cutting (apply per brief)
- Multi-tenant: `organization_id` on scoped tables
- Soft delete: `deleted_at TIMESTAMPTZ`
- Audit: `created_at`, `updated_at`, `created_by`, `updated_by`
- Optimistic lock: `version INTEGER`

## Deliverables

| Output | Tools |
|--------|-------|
| ERD | Mermaid `erDiagram` in plan/doc |
| Migration | Drizzle, Prisma, TypeORM, Alembic — match repo ORM |
| Types | TS interfaces or Pydantic from schema |
| RLS | Postgres policies per tenant role |
| Indexes | FK columns indexed; partial `WHERE deleted_at IS NULL` |
| Seed | Realistic faker/mock data script |

## RLS pattern (Postgres multi-tenant)

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_org ON tasks FOR ALL TO app_user
  USING (organization_id = current_setting('app.tenant_id')::uuid);
-- Set per request: SELECT set_config('app.tenant_id', $1, true);
```

Test RLS with non-superuser role.

## Pitfalls

- Soft delete without partial index → full table scans
- Missing composite index on `(org_id, status)` filter pairs
- Email/slug as PK — use UUID/CUID
- NOT NULL column on existing table without default/migration plan
- RLS only in app code — enforce at DB for tenancy

## Best practices

Timestamps on every table; index every FK; UUID/CUID PKs; audit log for regulated domains; prefer RLS over app-only tenant filters.

## Subagent delegation

- **Before Design process Step 1:** Launch `schema-reviewer` to inventory existing ORM models and migration patterns.
