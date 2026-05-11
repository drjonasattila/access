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
- A Platform Philosophy & Architecture endpoint at `app/api/platform/route.js`
- A Batch 17 connected tri-axial headache / TGN / metabolic rhythm endpoint at `app/api/headache-triaxial/route.js`
- A Batch 18 Treatment Cluster / 7-functional-axis routing endpoint at `app/api/treatment-cluster/route.js`
- A Batch 19 Biophysical Substrate endpoint at `app/api/biophysical-substrate/route.js`
- A Batch 20 Cranial REZ / Dural Continuum endpoint at `app/api/cranial-rez-dural/route.js`
- The migrated rule engine in `lib/avicenna/engine.cjs`
- The Batch 6 headache engine in `lib/avicenna/headacheEngine.cjs`
- The Batch 10 pharyngeal arch engine in `lib/avicenna/pharyngealArchEngine.cjs`
- The Batch 11 vertical-axis and post-surgical integration engine in `lib/avicenna/postSurgicalIntegrationEngine.cjs`
- The Batch 12 spinal and neuro-meningeal failure mode engine in `lib/avicenna/spinalFailureModeEngine.cjs`
- The Batch 13 Shaoyin-Taiyang dissociation meta-pattern engine in `lib/avicenna/shaoyinTaiyangDissociationEngine.cjs`
- The Batch 14 Taiyang posterior-shell terrain module in `lib/avicenna/taiyangModule.cjs`
- The Batch 15 Transition Engine routing layer in `lib/avicenna/transitionEngine.cjs`
- The Batch 16 platform philosophy, three-question UX, instability classifier, and case-quality architecture in `lib/avicenna/platformArchitecture.cjs`
- The Batch 17 Headache Tri-Axial, Trigeminal Neuralgia, and Metabolic Rhythm modules in `lib/avicenna/headacheTriAxialEngine.cjs`
- The Batch 18 Treatment Cluster Engine in `lib/avicenna/treatmentClusterEngine.cjs`
- The Batch 19 Biophysical Substrate Engine in `lib/avicenna/biophysicalSubstrateEngine.cjs`
- The Batch 20 Cranial REZ / Dural Engine in `lib/avicenna/cranialRezDuralEngine.cjs`
- An immersive Damp-Cold terrain module in `app/components/AvicennaApp.js`; it embeds the externally hosted YouTube terrain film at `https://youtu.be/ImpMLWzXdIM` and does not store video media in Git.
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
- Batch 16 platform data in `lib/avicenna/data/platform/platformPhilosophy.v1.json`, `lib/avicenna/data/libraries/sixCompartmentCommunicationMap.json`, `lib/avicenna/data/libraries/threeSystemIntegrationModel.json`, `lib/avicenna/data/libraries/instabilityClassifier.v1.json`, and `lib/avicenna/data/caseLibrary/dataQualityArchitecture.v1.json`
- Batch 17 data in `lib/avicenna/data/engines/headacheTriAxialEngine.v1.json`, `lib/avicenna/data/engines/trigeminalNeuralgiaModule.v1.json`, `lib/avicenna/data/engines/metabolicRhythmModule.v1.json`, `lib/avicenna/data/libraries/headacheGridStates.json`, and `lib/avicenna/data/libraries/fasciaNerveVesselUnit.json`
- Batch 18 data in `lib/avicenna/data/engines/treatmentClusterEngine.v1.json`, `lib/avicenna/data/libraries/sevenFunctionalAxes.v1.json`, and `lib/avicenna/data/libraries/clusterRoutingRules.v1.json`
- Batch 19 data in `lib/avicenna/data/engines/biophysicalSubstrateEngine.v1.json`, `lib/avicenna/data/engines/ezOscillatorModel.v1.json`, `lib/avicenna/data/engines/fasciaNerveDualChannel.v1.json`, `lib/avicenna/data/engines/cervicalPrevertebralPattern.v1.json`, and `lib/avicenna/data/libraries/internalBackendTranslationMap.batch19.json`
- Batch 20 data in `lib/avicenna/data/engines/cranialRezDuralEngine.v1.json`, `lib/avicenna/data/engines/PPPUniversalArchitecture.v1.json`, `lib/avicenna/data/engines/posteriorFossaResonance.v1.json`, `lib/avicenna/data/engines/duralContinuum.v1.json`, `lib/avicenna/data/engines/steroidResponseDecisionModel.v1.json`, `lib/avicenna/data/libraries/cranialNervePPPMap.v1.json`, and `lib/avicenna/data/libraries/internalBackendTranslationMap.batch20.json`
- Batch 9, Batch 10, Batch 11, Batch 12, Batch 13, Batch 14, Batch 15, Batch 16, Batch 17, Batch 18, Batch 19, and Batch 20 herb, cranial nerve, gate organ, developmental model, reflexology, vertical-axis, spinal, neuro-meningeal, Shaoyin sink, Taiyang-Shaoyin, Taiyang laser eligibility, transition map, treatment cluster, platform, tri-axial headache, functional axes, internal translation, cranial PPP, and field medicine concept libraries in `lib/avicenna/data/libraries/`
- A neutral supplement compatibility layer in `lib/avicenna/brandSanitizer.cjs`; active UI and engine outputs use generic support categories rather than named proprietary product recommendations.
- Engine regression checks in `scripts/test-engine.cjs`
- Headache engine checks in `scripts/test-headache-engine.cjs`
- Pharyngeal arch engine checks in `scripts/test-pharyngeal-arch-engine.cjs`
- Vertical-axis integration checks in `scripts/test-post-surgical-integration-engine.cjs`
- Spinal failure mode checks in `scripts/test-spinal-failure-mode-engine.cjs`
- Shaoyin-Taiyang meta-pattern checks in `scripts/test-shaoyin-taiyang-engine.cjs`
- Taiyang posterior-shell module checks in `scripts/test-taiyang-module.cjs`
- Transition Engine routing checks in `scripts/test-transition-engine.cjs`
- Platform architecture checks in `scripts/test-platform-architecture.cjs`
- Batch 17 tri-axial/TGN/metabolic checks in `scripts/test-headache-triaxial-engine.cjs`
- Batch 18 treatment cluster routing checks in `scripts/test-treatment-cluster-engine.cjs`
- Batch 19 biophysical substrate checks in `scripts/test-biophysical-substrate-engine.cjs`
- Batch 20 cranial REZ / dural checks in `scripts/test-cranial-rez-dural-engine.cjs`
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
npm run test:platform
npm run test:triaxial
npm run test:clusters
npm run test:biophysical
npm run test:cranial
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
