# Avicenna 2 — Full Architecture
## 5-Layer Modular Stack

---

## Overview

Avicenna 2 is an integrative medicine application named after Ibn Sina (980–1037),
the Persian polymath who synthesised Greek, Persian, and early Islamic medicine.

The system combines:
- Western medicine
- Traditional Chinese Medicine (TCM)
- Ayurveda
- Persian medicine

All layers share upstream terrain analysis. Outputs are always separated by systemMode.

---

## Layer Structure

```
┌─────────────────────────────────────────────────┐
│  Layer 4: Avicenna 2 Stack                      │
│  Pattern Confidence Module, Guardrails,         │
│  Objective Findings, Clinical Trajectory,       │
│  Adaptive Feedback, Functional Unit Export      │
└──────────────────┬──────────────────────────────┘
                   │ systemMode routing
        ┌──────────┼──────────────┐
        ▼          ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Layer 3  │ │ Layer 2  │ │  Layer 1     │
│ TCM /    │ │ Pack     │ │  Consumer    │
│ Drug-    │ │ Engine   │ │  Wellness    │
│ Terrain  │ │ (Integ.) │ │  Layer       │
│ Engine   │ │ Neutral  │ │  ← THIS PKG  │
└──────────┘ └──────────┘ └──────────────┘
        │          │              │
        └──────────┴──────────────┘
                   │
        ┌──────────▼──────────────┐
        │  Layer 5: Shared        │
        │  Correction-Vector      │
        │  Logic                  │
        │  (common backbone)      │
        └─────────────────────────┘
```

---

## Layer 1 — Consumer Wellness Layer (THIS PACKAGE)

**Status**: Built and tested  
**systemMode**: `"wellness"`  
**Output vocabulary**: Kitchen herbs and spices, simple tea protocols

- Takes 6 terrain axes as input
- Applies 15-step deterministic pipeline
- Returns minimal formula (5 herbs max, 3 if frailty)
- Simple language, wellness framing
- No medical claims

**Key files**: `src/engine/engine.js`, `src/data/protocols.json`

---

## Layer 2 — Pack Engine (Integrative-Neutral Mode)

**Status**: Fully specified, not yet built as code  
**systemMode**: `"integrative-neutral"`  
**Output vocabulary**: Modular intervention packs (Pack 1–5)

### Five Packs
| Pack | Function | Core Herbs |
|------|----------|------------|
| Pack 1 | Damp Resolver | Ginger, chamomile, poria, cardamom |
| Pack 2 | Dry/Structure Builder | Shatavari, spirulina, dang gui, astragalus |
| Pack 3 | Flow Restorer | Turmeric, frankincense, myrrh, dan shen |
| Pack 4 | Gate/Permeability | Nigella oil, quercetin, vitamin D |
| Pack 5 | Organising Force Builder | Astragalus, ginseng, ginger, cinnamon |

### Key Rules
- Drug burden vectors feed terrain from medication context
- `frailty: true` → complexity restriction (Pattern C equivalent)
- `organisingForce: overcharged` → Pack 5 blocked
- `permeability: high` → Pack 4 suppressed, routed to overcharged logic
- `stasisConfidence: "none" | "suspected" | "confirmed"` → governs Pack 3
- Overcharged + frail → stabilisation layer only (ginger + astragalus low dose)
- Multi-pack herb deduplication with role merging

### Frailty Modifier
- `frailty: boolean` — distinct from `organisingForce: undercharged`
- Four valid combinations: undercharged+frail, undercharged+not-frail, overcharged+frail, overcharged+not-frail
- Each has defined engine behaviour

---

## Layer 3 — TCM / Drug-Terrain Engine

**Status**: Fully specified, not yet built as code  
**systemMode**: `"TCM"`  
**Output vocabulary**: Named TCM formulas, herb names, doses

### Correction Vector Library

| Vector | Function | Core Herbs |
|--------|----------|------------|
| V1 | Drain Damp / Transform Phlegm | Ban Xia, Fu Ling, Chen Pi |
| V2 | Move / Release Stagnation | Chai Hu, Qing Pi, Chuan Lian Zi |
| V3 | Nourish / Protect Fluids | Mai Men Dong, Xuan Shen, Bai Shao Yao |
| V4 | Clear / Descend Heat | Huang Qin, Zhi Mu, Gou Teng |
| V5 | Warm / Mobilise Cold | Gui Zhi, Sheng Jiang |
| V6 | Anchor / Integrate | Suan Zao Ren, Fu Shen, Ye Jiao Teng |
| V7 | Support Organising Force | Huang Qi, Ren Shen / Tai Zi Shen, Shan Yao |

### Mini-Formula Library (7 formulas)
1. Opioid / OIH (stagnation + damp + heat)
2. NSAID / Paracetamol / Triptan (constraint-heat)
3. Amitriptyline / Duloxetine / Benzo (dryness + disconnection)
4. Steroid (dryness + low OF)
5a. Gabapentin F5A (neuropathic heat — V6+V3+V4)
5b. Gabapentin F5B (cold-damp suppression — V6+V1+V5)
6. Methotrexate (toxic dry-heat + depletion)
7. Cold Pelvis (cold-damp stagnation)

### Drug-Terrain Pairing Engine
- Drug burden vectors shift terrain axes
- Combined terrain = baseline + drug burden (60/40 weighting, acute 70/30)
- Axis conflict rules, polypharmacy complexity cap (≥4 axes)
- Compounded dryness rule (2+ drugs at Dryness++ → reduce Gui Zhi/Chuan Xiong)

### Clinical Context Fields
```
emotionalConstraint: boolean  → He Huan Pi trigger
painCharacter: "fixed" | "moving" | "diffuse"  → stasis proxy, Dan Shen trigger
permeability: "low" | "high" | null  → Pack 4 or overcharged routing
frailty: boolean  → Pattern C minimum build
stasisConfidence: "none" | "suspected" | "confirmed"
```

---

## Layer 4 — Avicenna 2 Stack

**Status**: Partially specified  
**Components**:

### Pattern Confidence Module (PCM)
- `window._pcm.patternConfidence`: High / Medium / Low
- `window._pcm.pcScore`: numeric
- `window._pcm.signalStrength`: 0–1
- `window._pcm.conflictLoad`
- `window._pcm.dominanceClarity`

### Guardrail System
- `window._guardrails.state`: "monitor" | "caution" | "escalation_recommended"
- Escalation suppresses wellness and pack engine outputs

### Objective Findings Confidence Modifier
- Reads: physical exam, lab, imaging findings
- Outputs: Confidence modifier (+1 / 0 / -1 / defer)
- Does NOT modify pattern scoring or formula
- Adds "Objective Findings Review" section to output

### Clinical Trajectory
- `window._trajContext`
- Tracks pattern stability over time

### Adaptive Feedback (Session-Level)
- Observes session patterns
- Detects repeated unmatched terms, formula gaps
- Generates refinement suggestions (no auto-modification)
- Rolling lookback: last 20 cases

### Rule Trace / Debug
- `debugMode: boolean`
- `systemMode: "internal-audit"` forces trace on
- All engines generate `debug_trace` array

---

## Layer 5 — Shared Correction-Vector Logic

The common backbone across all output layers:

| Correction Direction | Layer 1 (Wellness) | Layer 2 (Pack) | Layer 3 (TCM) |
|---------------------|--------------------|----------------|----------------|
| Warm / mobilise cold | cinnamon, ginger, cardamom | Pack 1 warm, Pack 5 | V5: Gui Zhi, Sheng Jiang |
| Drain damp | cardamom, coriander, cumin | Pack 1 core | V1: Ban Xia, Fu Ling |
| Nourish / protect fluids | goji, shatavari, honey, chia | Pack 2 core | V3: Mai Men Dong, Xuan Shen |
| Clear / descend heat | mint, coriander, rose, burdock | Pack 1 damp-heat, OC tools | V4: Huang Qin, Zhi Mu |
| Move / release stagnation | coriander, anise (mild) | Pack 3 core | V2: Chai Hu, Chuan Lian Zi |
| Support organising force | astragalus, ginseng, ginger | Pack 5 core | V7: Huang Qi, Ren Shen |
| Anchor / integrate | not in Layer 1 | stabilisation layer | V6: Suan Zao Ren, Fu Shen |
| Open permeability | not in Layer 1 | Pack 4 | V2 optional |

---

## systemMode Routing

```javascript
switch (systemMode) {
  case "wellness":
    // → Layer 1: Consumer wellness engine
    // Input: mapClinicalContextToWellnessInput(window._clinicalContext)
    break;
  case "integrative-neutral":
    // → Layer 2: Pack engine
    break;
  case "TCM":
    // → Layer 3: TCM / Drug-terrain engine
    break;
  case "internal-audit":
    // → Any engine + debug_trace forced on
    break;
}
```

---

## Output Separation Rule

**Outputs are NEVER merged.**

Same upstream terrain → three independent output vocabularies.
- Consumer output (Layer 1): never contains TCM herb names
- Pack output (Layer 2): never contains pattern names or formula names
- TCM output (Layer 3): never contains pack names

Avicenna 2 (Layer 4) routes to ONE output mode at a time.
