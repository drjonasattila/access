# Avicenna Clinical Engine

Next.js wrapper for the Claude-exported Avicenna wellness rule engine.

## What is included

- A Next.js App Router interface in `app/`
- A server-side protocol endpoint at `app/api/protocol/route.js`
- A dedicated headache/migraine pattern endpoint at `app/api/headache/route.js`
- A top-level Cranio-Visceral Developmental Gates endpoint at `app/api/pharyngeal-arch/route.js`
- The migrated rule engine in `lib/avicenna/engine.cjs`
- The Batch 6 headache engine in `lib/avicenna/headacheEngine.cjs`
- The Batch 10 pharyngeal arch engine in `lib/avicenna/pharyngealArchEngine.cjs`
- Claude-exported data files in `lib/avicenna/data/`
- Batch 6 structured source data in `lib/avicenna/data/engines/headacheEngine.batch6.json`
- Batch 7 headache/pain extension data in `lib/avicenna/data/engines/avicenna_engine_batch7.json`
- Batch 8 GI-migraine-neck, CGRP support, medication-capacity, and mixed joint phase data in `lib/avicenna/data/engines/avicenna_engine_batch8.json`
- Batch 9 neuropathy, joint, pelvic/Shaoyin, claudication, back-pain data in `lib/avicenna/data/engines/avicenna_engine_batch9.json`
- Batch 10 Cranio-Visceral Developmental Gates / Pharyngeal Arch data in `lib/avicenna/data/engines/avicenna_engine_batch10.json` and `lib/avicenna/data/engines/pharyngealArchEngine.json`
- Batch 9 and Batch 10 herb, cranial nerve, gate organ, developmental model, and field medicine concept libraries in `lib/avicenna/data/libraries/`
- Engine regression checks in `scripts/test-engine.cjs`
- Headache engine checks in `scripts/test-headache-engine.cjs`
- Pharyngeal arch engine checks in `scripts/test-pharyngeal-arch-engine.cjs`
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
npm run test:arch
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
