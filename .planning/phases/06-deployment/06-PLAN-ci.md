---
plan: "6.1"
phase: 6
wave: 1
title: "GitHub Actions CI Configuration"
depends_on: ["5.2"]
requirements_addressed: [CI-01]
files_modified:
  - .github/workflows/ci.yml
autonomous: true
---

# Plan 6.1 — GitHub Actions CI Configuration

## Objective

Set up continuous integration via GitHub Actions to ensure code quality on every push and pull request before deployment.

## Tasks

<task id="6.1.1">
<title>Create CI workflow file</title>
<read_first>
</read_first>
<action>
Create `.github/workflows/ci.yml` to define the CI pipeline.
The workflow should:
1. Run on push to main and pull requests to main.
2. Setup Node.js.
3. Install dependencies using `npm ci`.
4. Run ESLint.
5. Run TypeScript type checking.
6. Run Next.js production build.

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Type check
      run: npx tsc --noEmit
      
    - name: Build Next.js app
      run: npm run build
      env:
        NEXT_TELEMETRY_DISABLED: 1
```
</action>
<acceptance_criteria>
- `.github/workflows/ci.yml` is created.
- The pipeline correctly runs linting, type-checking, and the Next.js build.
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - Workflow file is valid YAML.
  - All critical checks (lint, tsc, build) are included.
```
