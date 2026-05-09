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
- A Taiyang posterior-shell terrain endpoint at `app/api/taiyang/route.js`
- A high-level Transition Engine routing endpoint at `app/api/transition/route.js`
- The migrated rule engine in `lib/avicenna/engine.cjs`
- The Batch 6 headache engine in `lib/avicenna/headacheEngine.cjs`
- The Batch 10 pharyngeal arch engine in `lib/avicenna/pharyngealArchEngine.cjs`
- The Batch 11 vertical-axis and post-surgical integration engine in `lib/avicenna/postSurgicalIntegrationEngine.cjs`
- The Batch 12 spinal and neuro-meningeal failure mode engine in `lib/avicenna/spinalFailureModeEngine.cjs`
- The Batch 13 Shaoyin-Taiyang dissociation meta-pattern engine in `lib/avicenna/shaoyinTaiyangDissociationEngine.cjs`
- The Batch 14 Taiyang posterior-shell terrain module in `lib/avicenna/taiyangModule.cjs`
- The Batch 15 Transition Engine routing layer in `lib/avicenna/transitionEngine.cjs`
- Claude-exported data files in `lib/avicenna/data/`
- Batch 6 structured source data in `lib/avicenna/data/engines/headacheEngine.batch6.json`
- Batch 7 headache/pain extension data in `lib/avicenna/data/engines/avicenna_engine_batch7.json`
- Batch 8 GI-migraine-neck, CGRP support, medication-capacity, and mixed joint phase data in `lib/avicenna/data/engines/avicenna_engine_batch8.json`
- Batch 9 neuropathy, joint, pelvic/Shaoyin, claudication, back-pain data in `lib/avicenna/data/engines/avicenna_engine_batch9.json`
- Batch 10 Cranio-Visceral Developmental Gates / Pharyngeal Arch data in `lib/avicenna/data/engines/avicenna_engine_batch10.json` and `lib/avicenna/data/engines/pharyngealArchEngine.json`
- Batch 11 Vertical Axis & Post-Surgical Integration data in `lib/avicenna/data/engines/avicenna_engine_batch11.json` and `lib/avicenna/data/engines/postSurgicalIntegrationEngine.json`
- Batch 12 Spinal & Neuro-Meningeal Failure Mode data in `lib/avicenna/data/engines/avicenna_engine_batch12.json` and `lib/avicenna/data/engines/spinalFailureModeEngine.json`
- Batch 13 Shaoyin-Taiyang Dissociation data in `lib/avicenna/data/engines/avicenna_engine_batch13.json` and `lib/avicenna/data/engines/shaoyinTaiyangDissociationEngine.json`
- Batch 14 Taiyang module data in `lib/avicenna/data/engines/avicenna_engine_batch14.json`, `lib/avicenna/data/terrainModules/taiyangModule.v1.json`, and `lib/avicenna/data/libraries/laserEligibility.taiyang.json`
- Batch 15 Transition Engine data in `lib/avicenna/data/engines/avicenna_engine_batch15.json`, `lib/avicenna/data/engines/transitionEngine.v1.json`, `lib/avicenna/data/engines/tthModule.v1.json`, `lib/avicenna/data/libraries/unifiedTransitionMap.json`, and `lib/avicenna/data/libraries/treatmentClusters.v1.json`
- Batch 9, Batch 10, Batch 11, Batch 12, Batch 13, Batch 14, and Batch 15 herb, cranial nerve, gate organ, developmental model, reflexology, vertical-axis, spinal, neuro-meningeal, Shaoyin sink, Taiyang-Shaoyin, Taiyang laser eligibility, transition map, treatment cluster, and field medicine concept libraries in `lib/avicenna/data/libraries/`
- Engine regression checks in `scripts/test-engine.cjs`
- Headache engine checks in `scripts/test-headache-engine.cjs`
- Pharyngeal arch engine checks in `scripts/test-pharyngeal-arch-engine.cjs`
- Vertical-axis integration checks in `scripts/test-post-surgical-integration-engine.cjs`
- Spinal failure mode checks in `scripts/test-spinal-failure-mode-engine.cjs`
- Shaoyin-Taiyang meta-pattern checks in `scripts/test-shaoyin-taiyang-engine.cjs`
- Taiyang posterior-shell module checks in `scripts/test-taiyang-module.cjs`
- Transition Engine routing checks in `scripts/test-transition-engine.cjs`
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
npm run test:taiyang
npm run test:transition
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
