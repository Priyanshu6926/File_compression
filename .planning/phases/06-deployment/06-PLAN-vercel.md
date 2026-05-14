---
plan: "6.2"
phase: 6
wave: 2
title: "Vercel Configuration & Runtime Optimization"
depends_on: ["6.1"]
requirements_addressed: [DEPLOY-01, DEPLOY-02]
files_modified:
  - vercel.json
  - src/app/api/compress/route.ts
autonomous: true
---

# Plan 6.2 — Vercel Configuration & Runtime Optimization

## Objective

Ensure the Next.js API route runs properly on Vercel's Node.js Serverless runtime (not the Edge runtime), as `sharp` and `heic-convert` depend on Node APIs and native bindings. We will also configure Vercel settings like function timeouts for heavy operations.

## Tasks

<task id="6.2.1">
<title>Ensure API route uses Node.js runtime</title>
<read_first>
- src/app/api/compress/route.ts
</read_first>
<action>
The Next.js App Router defaults to Node.js for API routes unless specified otherwise. We should explicitly export the runtime config for clarity, although it is optional.
Update `src/app/api/compress/route.ts`:

```typescript
// Add to the top of the file:
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout (requires Pro plan on Vercel, but Next.js will cap it to 10s on Hobby)
```
</action>
<acceptance_criteria>
- The API route explicitly declares Node.js runtime and maxDuration.
</acceptance_criteria>
</task>

<task id="6.2.2">
<title>Add vercel.json configuration</title>
<read_first>
</read_first>
<action>
Create `vercel.json` at the root of the project to specify any custom Vercel settings. We can ensure the build command and Node version match.

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["iad1"]
}
```
</action>
<acceptance_criteria>
- `vercel.json` is created at the project root.
- The framework is set to nextjs.
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - `vercel.json` exists.
  - `route.ts` specifies the `nodejs` runtime explicitly.
```
