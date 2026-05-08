# Avicenna Clinical Engine

Next.js wrapper for the Claude-exported Avicenna wellness rule engine.

## What is included

- A Next.js App Router interface in `app/`
- A server-side protocol endpoint at `app/api/protocol/route.js`
- A dedicated headache/migraine pattern endpoint at `app/api/headache/route.js`
- The migrated rule engine in `lib/avicenna/engine.cjs`
- The Batch 6 headache engine in `lib/avicenna/headacheEngine.cjs`
- Claude-exported data files in `lib/avicenna/data/`
- Batch 6 structured source data in `lib/avicenna/data/engines/headacheEngine.batch6.json`
- Batch 7 headache/pain extension data in `lib/avicenna/data/engines/avicenna_engine_batch7.json`
- Engine regression checks in `scripts/test-engine.cjs`
- Headache engine checks in `scripts/test-headache-engine.cjs`
- Original Claude export preserved in `avicenna-export/`

## Run locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test the rule engine

```bash
npm run test:engine
npm run test:headache
```

## GitHub setup

After confirming the app runs locally:

```bash
git init
git add .
git commit -m "Initial Avicenna Next.js app"
git branch -M main
git remote add origin https://github.com/drjonasattila/avicenna-clinical-engine.git
git push -u origin main
```

If the repository is private, make sure your local GitHub authentication is configured before pushing.
