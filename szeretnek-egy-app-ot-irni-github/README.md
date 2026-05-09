# Avicenna Clinical Engine

Next.js wrapper for the Claude-exported Avicenna wellness rule engine.

## What is included

- A Next.js App Router interface in `app/`
- A server-side protocol endpoint at `app/api/protocol/route.js`
- A dedicated headache/migraine pattern endpoint at `app/api/headache/route.js`
- A top-level Cranio-Visceral Developmental Gates endpoint at `app/api/pharyngeal-arch/route.js`
- A Vertical Axis & Post-Surgical Integration endpoint at `app/api/vertical-axis/route.js`
- A Spinal & Neuro-Meningeal Failure Mode endpoint at `app/api/spinal-failure/route.js`
- A Shaoyin-Taiyang Dissociation meta-pattern endpoint at `app/api/shaoyin-taiyang/route.js`
- The migrated rule engine in `lib/avicenna/engine.cjs`
- The Batch 6 headache engine in `lib/avicenna/headacheEngine.cjs`
- The Batch 10 pharyngeal arch engine in `lib/avicenna/pharyngealArchEngine.cjs`
- The Batch 11 vertical-axis and post-surgical integration engine in `lib/avicenna/postSurgicalIntegrationEngine.cjs`
- The Batch 12 spinal and neuro-meningeal failure mode engine in `lib/avicenna/spinalFailureModeEngine.cjs`
- The Batch 13 Shaoyin-Taiyang dissociation meta-pattern engine in `lib/avicenna/shaoyinTaiyangDissociationEngine.cjs`
- Claude-exported data files in `lib/avicenna/data/`
- Batch 6 structured source data in `lib/avicenna/data/engines/headacheEngine.batch6.json`
- Batch 7 headache/pain extension data in `lib/avicenna/data/engines/avicenna_engine_batch7.json`
- Batch 8 GI-migraine-neck, CGRP support, medication-capacity, and mixed joint phase data in `lib/avicenna/data/engines/avicenna_engine_batch8.json`
- Batch 9 neuropathy, joint, pelvic/Shaoyin, claudication, back-pain data in `lib/avicenna/data/engines/avicenna_engine_batch9.json`
- Batch 10 Cranio-Visceral Developmental Gates / Pharyngeal Arch data in `lib/avicenna/data/engines/avicenna_engine_batch10.json` and `lib/avicenna/data/engines/pharyngealArchEngine.json`
- Batch 11 Vertical Axis & Post-Surgical Integration data in `lib/avicenna/data/engines/avicenna_engine_batch11.json` and `lib/avicenna/data/engines/postSurgicalIntegrationEngine.json`
- Batch 12 Spinal & Neuro-Meningeal Failure Mode data in `lib/avicenna/data/engines/avicenna_engine_batch12.json` and `lib/avicenna/data/engines/spinalFailureModeEngine.json`
- Batch 13 Shaoyin-Taiyang Dissociation data in `lib/avicenna/data/engines/avicenna_engine_batch13.json` and `lib/avicenna/data/engines/shaoyinTaiyangDissociationEngine.json`
- Batch 9, Batch 10, Batch 11, Batch 12, and Batch 13 herb, cranial nerve, gate organ, developmental model, reflexology, vertical-axis, spinal, neuro-meningeal, Shaoyin sink, Taiyang-Shaoyin, and field medicine concept libraries in `lib/avicenna/data/libraries/`
- Engine regression checks in `scripts/test-engine.cjs`
- Headache engine checks in `scripts/test-headache-engine.cjs`
- Pharyngeal arch engine checks in `scripts/test-pharyngeal-arch-engine.cjs`
- Vertical-axis integration checks in `scripts/test-post-surgical-integration-engine.cjs`
- Spinal failure mode checks in `scripts/test-spinal-failure-mode-engine.cjs`
- Shaoyin-Taiyang meta-pattern checks in `scripts/test-shaoyin-taiyang-engine.cjs`
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
npm run test:vertical
npm run test:spinal
npm run test:shaoyin
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
