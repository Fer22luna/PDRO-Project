# IA Developent guide

## Purpose
- This file documents how agentic coding assistants should operate in this repository: build, lint, test commands, code style, naming, imports, error handling, testing conventions, and project-specific rules (Copilot instructions).

## Quick commands
- Install dependencies: `pnpm install` (or `npm install` / `pnpm i`) if using pnpm.
- Development server: `pnpm dev` -> runs `next dev`.
- Build: `pnpm build` -> runs `next build`.
- Start (production): `pnpm start` -> runs `next start`.
- Lint: `pnpm lint` -> runs `eslint .` (project contains an ESLint config implied by `package.json` script).

## Tests
- This repo uses Next.js' experimental Playwright test integration (Next 16 includes Playwright support).
- Run all Playwright tests (via Next): `npx next test` or `pnpm exec next test`.
- Run Playwright directly if configured: `npx playwright test`.
- Run a single Playwright test file: `npx playwright test path/to/test.spec.ts` or with Next wrapper `npx next test path/to/test.spec.ts`.
- Playwright config (default) will match `*.spec.{ts,js}` under `app/` and `pages/`.
- If a test runner is not present, prefer running `next test` because Next.js will warn about missing deps and provide guidance.

## Editor/Formatting
- TypeScript + React (app router). Use `tsconfig.json` (`strict: true` enabled).
- Formatting: follow Prettier defaults where available. 
If a Prettier config is added, adhere to it.

### otherwise use a commonly accepted baseline:
  - 2-space indentation
  - Single-quoted strings (unless codebase uses double quotes consistently)
  - Trailing commas in multiline constructs
  - Semi-colons optional but be consistent with existing files (current files use semicolons).

- Run auto-format in PRs where possible. Agents should avoid making purely stylistic massive rewrites unless requested.

## Imports
- Use absolute imports alias `@/*` for top-level workspace paths (configured in `tsconfig.json`). Prefer:
  - `import { something } from '@/lib/utils'` over long relative paths when referring to project root modules.
- Group imports with this order: 1) Node / built-in modules (rare in Next frontend code), 2) external packages, 3) absolute `@/` imports, 4) relative `../` / `./` imports.
- Keep imports sorted alphabetically within groups when practical.
- Avoid deep relative import chains like `../../../some/thing` when an alias exists.
- All information regarding what is being done and what has already been completed as part of the task must be communicated to the developer in Spanish. This includes decisions made, changes implemented, pending items, and any relevant technical or business context related to the task.

## UI/UX
- If it is necessary to use a component, first use one already created in shadcn
- The UI/UX must be created with shadcn.
- The icons should be of lucide.dev

## Types
- This is a TypeScript project. `tsconfig.json` sets `strict: true` — treat all new code as `--strict`.
- Prefer precise types over `any`. Use `unknown` when appropriate and narrow before use.
- Use React types from `@types/react` where necessary: `React.ReactNode`, component prop types: `({ children }: { children: React.ReactNode })`.
- For component props, prefer inline prop types for simple components and exported interfaces/types for complex props reused across files.

## Naming conventions
- Files and components:
  - React components: `PascalCase` filenames and component names (e.g., `Button`, `GoogleHeatmap`). Files often use `kebab` or `camel` in this codebase but prefer consistency with existing files (most UI components use `kebab` filenames with `camel` internals). When adding new components prefer `kebab` filenames matching existing `components/ui/*.tsx` (e.g., `input.tsx`) unless the directory is component-per-file named after the component.
  - Next.js pages and route files should follow Next conventions (file names as route segments).
- Variables and functions: `camelCase`.
- Types and interfaces: `PascalCase` with `I` prefix avoided (prefer `User`, `TaskProps` not `IUser`).
- Constants: `UPPER_SNAKE_CASE` for compile-time constants; prefer `const defaultTimeoutMs = 5000` for JS values unless truly global constants.

## Error handling
- API routes (app/api/*) should return `NextResponse` with appropriate HTTP status and consistent JSON shape for errors: `{ error: string }`.
- Prefer guarding inputs early and returning `400` for client errors, `404` for not found, `500` for unexpected server errors.
- Log internally to server logs when catching unexpected errors, but avoid leaking stack traces to API responses in production.
- For external calls (e.g. Supabase), check returned `error` values and map to meaningful messages/status codes. Follow existing patterns in `app/api/*` routes.

## React / Next.js patterns
- Prefer server components for page-level layout and data fetching (Next app router). Use `async` server components to fetch data where appropriate.
- Client components must include `'use client'` at the top. Keep client components minimal and move data fetching to server components when possible.
- Keep components small and single responsibility. Extract repeated UI bits to `components/`.
- Use `Link` from `next/link` for client-side navigation.

## State & Forms
- Prefer `react-hook-form` for complex forms (already in dependencies). Use zod for validation (`zod` is present).
- Keep local UI state inside client components; derive app state from props when possible.

## Security
- Never hardcode secrets in the repo. Use environment variables and `process.env.*` for sensitive values.
- For database queries, always use parameterized queries or library helpers (Supabase client used in the repo). Do not interpolate untrusted input into SQL.

## Testing guidelines
- Tests should be deterministic and isolated. Use Playwright for E2E and visual tests according to Next's default setup.
- For unit tests, if introduced, prefer a fast runner (Vitest/Jest) and keep snapshots minimal.
- Label long or flaky tests with `test.skip` or clear comments; prefer fixing flakiness over skipping permanently.

## Performance
- Keep bundle size in mind: avoid importing large server-only libraries into client components.
- Lazy-load maps, large charts or heavy UI (e.g., `react-leaflet` or `recharts`) where possible using dynamic imports with `ssr: false` if needed.

## Commit & PR guidance for agents
- Agents should not create commits automatically unless explicitly asked by the human operator. If asked to commit, create a concise commit message summarizing the why: one-line subject + optional short body.
- Run `pnpm lint` and basic build (`pnpm build`) before proposing or making PRs when possible.
- Update `README.md` or relevant docs when changing public APIs or migrations. For DB changes, create `.sql` migration files in `/scripts` following the repo's naming convention: `YYYYMMDD_HHMM_[type]_[brief].sql` and include author + ticket reference at top of file. See `/scripts` samples.

## Copilot and Cursor rules
- This repo includes Copilot instructions in `.github/copilot-instructions.md`; agents must follow its rules, notably:
  - Run the Post-Task checklist: update unit tests, follow SOLID, update README.md if business logic changed, verify DB migrations when applicable.
  - Database scripts must live in `/scripts` and be `.sql` files with a `BEGIN TRANSACTION`/`COMMIT` block and an initial comment with author and ticket reference.
- There are no `.cursor` or `.cursorrules` files detected. If such files are added later, treat them as higher-precedence local agent rules and follow them when editing files within their directory scope.

## Editing rules for agents
- Use minimal, focused changes. Don't reformat entire files unless necessary to fix style or linter failures.
- For every file modified, abide by any AGENTS.md rules in a parent directory (if present). More specific AGENTS.md files in subdirectories override root rules.
- Read a file before editing it (tooling constraint) and make edits using precise replacements; avoid blind global renames without human confirmation.

## Post-Task Protocol (Mandatory Checklist)
Whenever you finish a task or the user confirms that the code is ready, verify the following:
- Have the unit tests been updated accordingly?
- Does the code comply with SOLID principles?
- Documentation: Update `README.md` if there were changes to the business logic.
- Database Scripts: Check whether the change requires a migration.

## Database Script Logic
- When to create a script: Always create a script when a table is added, a column is modified, an index is added, or master data (seeds) is inserted.
- Location: All scripts must be stored exclusively in `/scripts`.
- File format: Only `.sql` files are allowed.
- All scripts must strictly follow this format: `YYYYMMDD_HHMM_[type]_[short_description].sql`
-  Example: `20260115_1430_create_users_table.sql`
- Allowed types: `create`, `alter`, `drop`, `insert`.
- Internal Script Structure: Each script must include the following elements: An initial comment specifying the author and the related ticket reference. `BEGIN TRANSACTION` and `COMMIT` blocks (or `ROLLBACK` in case of an error).

## What to include in PRs or messages to humans
- When presenting changes, include:
  - What was changed and why (1-2 lines).
  - Files modified.
  - Any manual steps the human must run (migrations, env vars, test commands).
  - If tests were added or updated, how to run them and how to run a single test file.

## Appendix: Useful file references
- `package.json` — scripts and deps (root): `package.json:1`.
- `tsconfig.json` — TypeScript config and path alias `@/*`: `tsconfig.json:1`.
- Copilot instructions: `.github/copilot-instructions.md:1`.

If anything in this file is unclear or you need finer-grained conventions (formatting rules, ESLint/Prettier config), ask for clarification before making sweeping changes.
