<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Directory layout
- `src/routes/` holds file-based routes ONLY. No business logic, DB access, or large components.
- `src/features/<domain>/` holds all domain code (components, queries, server functions, server-only logic).
- `src/components/ui/` holds shared, domain-agnostic UI (shadcn).
- `src/lib/` holds shared utilities (auth, query client, helpers).
- `src/middleware/` holds `createMiddleware` definitions.
- `src/routeTree.gen.ts` is auto-generated. NEVER edit it by hand.

## File naming
- `*.functions.ts`: `createServerFn` wrappers. Safe to import from client code.
- `*.server.ts`: server-only code (DB, secrets, filesystem, third-party SDKs with keys). NEVER import from components or client code. Only import from `*.functions.ts`, loaders, or other `*.server.ts` files.
- `queries.ts`: TanStack Query `queryOptions` definitions, one per feature.
- Pathless layouts use the `_name.tsx` prefix (e.g. `_authed.tsx`).

## Routes
- A route file only declares: `createFileRoute`, `loader`, `validateSearch`, `head`, and the component composition.
- Loaders call feature server functions or `queryClient.ensureQueryData(queryOptions)`. They do not contain raw logic.
- Auth guards go in pathless layout routes (`beforeLoad`), never repeated per route.
- Extract any route component over ~80 lines into `features/<domain>/components/`.

## Server functions
- Always validate input with `.inputValidator()` (Zod).
- Return only the fields the client needs. Never return raw DB rows, config objects, or secrets.
- Put auth/logging in middleware, not inline in each function.
- Server functions call `*.server.ts` for the actual work.

## Data fetching
- Define `queryOptions` once in the feature's `queries.ts` and reuse in loaders (`ensureQueryData`) and components (`useSuspenseQuery`).
- Query keys are arrays, structured from general to specific: `['users', 'list', filters]`.

## Environment variables
- Only `VITE_`-prefixed vars may be read in client code.
- Secrets are unprefixed and read only in `*.server.ts` or server functions.

## General
- Co-locate by feature, not by type. Do not create top-level `hooks/`, `services/`, or `utils/` folders.
- Keep files focused: one responsibility per file.
- Match existing naming and structure before introducing a new pattern.