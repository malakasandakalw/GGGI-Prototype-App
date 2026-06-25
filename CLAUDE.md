@AGENTS.md

# Project Instructions — SaaS Prototype Mode

This is a **clickable prototype**, not a production app. Optimize for fast, visual, demonstrable workflows — not correctness, security, or scalability.

## Stack

- Next.js (App Router) + TypeScript
- Shadcn UI + Tailwind CSS
- No other libraries unless explicitly asked

## Hard Rules — Do NOT Do These

- No API routes, server actions, or backend services
- No database, ORM, or persistence layer
- No real authentication (no JWT/sessions/OAuth)
- No form validation libraries (zod, react-hook-form schemas, etc.)
- No error boundaries, retry logic, or exception handling
- No tests, CI/CD, env vars, or deployment config
- No state libraries (Redux, Zustand, etc.) — React state / context only

If a task implies any of the above, **simulate it instead**. See "Simulation Pattern" below.

## Always Do These

- Use static mock data from `src/data/mock-data.ts` (or feature-specific mock files)
- Use Shadcn UI components by default (Card, Table, Form, Tabs, Dialog, DropdownMenu, Button, Sidebar, etc.)
- Build full navigation: sidebar + header + routed pages, so the app feels click-through-able end to end
- Assume all inputs are valid and all actions succeed
- Keep components simple, readable, and not over-abstracted

## Simulation Pattern

Whenever a feature would normally hit a backend, fake the round-trip with local state:

```
User action (click/submit)
  -> update local React state
  -> show updated UI / success state
  -> navigate if relevant
```

Example — instead of `POST /api/project`, do:

```ts
const [projects, setProjects] = useState(mockProjects);
function handleCreate(newProject) {
  setProjects((prev) => [...prev, { id: Date.now(), ...newProject }]);
}
```

## Forms

- Include realistic fields (input, select, date, file-upload placeholder)
- On submit: skip validation, just show a success state and move on
- File uploads: show filename + a static preview placeholder, no real upload

## Auth (if requested)

Mock login only:

```
Enter email/password -> click Login -> redirect to /dashboard
```

No real session/user management.

## Dashboards

Use mock summary stats and "recent activity" lists. Numbers can be hardcoded.

## Tables/Lists

Include realistic sample rows, basic filter/search UI if relevant, and row actions that open dialogs or update local state — no backend calls.

## Folder Structure

```
src/
 ├── app/            # routed pages (dashboard, projects, settings, ...)
 ├── components/
 │    ├── ui/        # shadcn primitives
 │    ├── forms/
 │    └── tables/
 └── data/
      └── mock-data.ts
```

## Decision Filter

Before building any feature, ask: **"What would the user see and click?"** — not "how would this be implemented in production?"

✅ "Add a page where users can view, add, and manage projects via mock data."
❌ "Design the schema and API for project management."

## Definition of Done

A reviewer should be able to click through the app and understand what it does, who it's for, and how a user completes each core task — without needing any real backend, auth, or data layer.
