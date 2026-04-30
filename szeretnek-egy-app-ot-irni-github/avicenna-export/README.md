# Avicenna 2 — Wellness Layer
## Consumer-Facing Terrain Protocol Engine
### Build 1.0 — Migration Package

---

## What This App Does

Avicenna is a modular integrative medicine application named after Ibn Sina (Avicenna),
the 10th-century Persian physician. This package contains the **Consumer Wellness Layer
(Layer 1)** — a simple, adaptive herbal/spice protocol generator based on terrain analysis.

The user answers questions about their current physical state across five axes:
- **Thermal**: cold / heat / neutral
- **Moisture**: damp / dry / neutral
- **Energy state**: undercharged / overcharged / neutral
- **Frailty**: boolean (low resilience)
- **Digestive sensitivity**: low / medium / high
- **Symptom intensity**: mild / moderate / strong

The engine identifies a **primary terrain pattern**, selects a **base formula**, applies
**symptom modifiers**, checks **safety flags**, and returns a minimal herbal tea protocol
with preparation instructions.

---

## How the Decision Engine Works

The engine (`src/engine/engine.js`) runs a deterministic 15-step processing pipeline:

```
Step 1  — Safety flag check (highest priority — gates entire engine)
Step 2  — Contradictory symptom detection
Step 3  — Pattern identification (thermal + moisture + energy → pattern key)
Step 4  — Neutral-state fallback (returns baseline if all axes neutral)
Step 5  — Mixed pattern fallback + dominant axis inference
Step 6  — Intensity resolution + frailty floor (cap reduction)
Step 7  — Base formula selection from protocol library
Step 8  — Digestive sensitivity restriction (removes strong spices)
Step 9  — Overcharged + cold conflict resolution (aromatic movers only)
Step 10 — Secondary pattern integration (max 1–2 herbs, conflict-checked)
Step 11 — Modifier application (max 2; frailty max 1; priority-ordered)
Step 12 — Safety flags applied to final herb list
Step 13 — Deduplication + formula cap (5 default, 3 frailty)
Step 14 — Follow-up question triggers
Step 15 — Output assembly
```

### Pattern Mapping

| Thermal | Moisture | Energy | Pattern |
|---------|----------|--------|---------|
| cold | damp | any | damp_cold |
| heat | damp | any | damp_heat |
| heat | dry | any | dry_heat |
| cold | dry | any | dry_cold |
| neutral | neutral | undercharged | undercharged |
| neutral | neutral | overcharged | overcharged |
| neutral | neutral | neutral | neutral_baseline |
| mixed | mixed | mixed | mixed_pattern → inferred |

### Formula Cap Rules
- Default maximum: **5 ingredients**
- Frailty active: **3 ingredients**
- Secondary pattern adds **1–2 herbs maximum**
- Modifiers capped at **2** (frailty: **1**)

### Key Safety Rules
- `palpitations` in **symptoms** → formula-level modifier (removes stimulants, adds rose)
- `palpitations_flag` in **safety_flags** → safety-level restriction (blocks pepper/mustard/clove)
- These two fields are **independent** and may both fire simultaneously
- `pregnancy` blocks mustard seed, clove, he shou wu, black pepper
- `anticoagulants` generates a clinician-check note (no herbs blocked)

---

## File Structure

```
avicenna-export/
│
├── README.md                          ← this file
│
├── standalone/
│   └── index.html                     ← complete single-file working app
│                                         (open in browser, no build step)
│
├── src/
│   ├── engine/
│   │   ├── engine.js                  ← CORE: pure logic module (no DOM)
│   │   ├── patterns.js                ← pattern identification functions
│   │   ├── safety.js                  ← safety flag rules
│   │   └── modifiers.js               ← symptom modifier rules
│   │
│   ├── components/
│   │   ├── InputForm.js               ← form state + rendering
│   │   └── OutputProtocol.js          ← output display component
│   │
│   ├── data/
│   │   ├── protocols.json             ← base formula library (all patterns)
│   │   ├── secondaryHerbs.json        ← secondary pattern herb additions
│   │   ├── primaryConflicts.json      ← herb conflict rules per pattern
│   │   ├── neutralBaseline.json       ← neutral state baseline formula
│   │   ├── modifierRules.json         ← symptom modifier definitions
│   │   ├── safetyRules.json           ← safety flag definitions
│   │   └── testCases.json             ← 10 test cases with expected outputs
│   │
│   └── styles/
│       └── avicenna.css               ← all CSS (extracted from standalone)
│
└── docs/
    ├── ARCHITECTURE.md                ← full 5-layer Avicenna 2 stack
    ├── ENGINE_SPEC.md                 ← complete engine specification
    ├── INTEGRATION_NOTES.md           ← how to connect to Avicenna 2 stack
    ├── PATCH_HISTORY.md               ← all patches applied (Patch 1.1)
    └── NEXTJS_MIGRATION.md            ← guide for Codex / Next.js rebuild
```

---

## Core Logic Files

| File | Purpose |
|------|---------|
| `src/engine/engine.js` | Main `generateProtocol(input)` function — start here |
| `src/data/protocols.json` | All 6 terrain patterns × 3 intensity levels |
| `src/data/safetyRules.json` | Safety flag → blocked herbs + notes |
| `src/data/modifierRules.json` | Symptom → herb additions/removals |
| `src/data/testCases.json` | 10 test cases covering all major rule paths |

---

## How to Run / Test

### Standalone (no build step)
1. Open `standalone/index.html` in any browser
2. Fill in the form and click "Generate my protocol"
3. Open browser DevTools console and run `runTests()` to run all 10 test cases

### Node.js (engine only)
```js
const { generateProtocol } = require('./src/engine/engine.js');

const result = generateProtocol({
  thermal: "cold",
  moisture: "damp",
  energy_state: "undercharged",
  frailty: false,
  digestive_sensitivity: "medium",
  symptom_intensity: "moderate",
  symptoms: ["bloating", "brain_fog"],
  safety_flags: []
});

console.log(result);
```

---

## What Should Be Migrated Into Next.js

### Priority 1 — Core engine
- `src/engine/engine.js` → `lib/avicenna/engine.ts`
- `src/data/protocols.json` → `lib/avicenna/data/protocols.ts`
- `src/data/safetyRules.json` → `lib/avicenna/data/safetyRules.ts`
- `src/data/modifierRules.json` → `lib/avicenna/data/modifierRules.ts`

### Priority 2 — API route
- Create `app/api/protocol/route.ts`
- Accepts POST with input schema
- Returns protocol output JSON
- Engine runs server-side (pure logic, no browser dependencies)

### Priority 3 — UI components
- `src/components/InputForm.js` → `components/InputForm.tsx`
- `src/components/OutputProtocol.js` → `components/OutputProtocol.tsx`
- Convert to React with useState for form state

### Priority 4 — Types
- Create `types/avicenna.ts` with input/output schemas as TypeScript interfaces

### Priority 5 — Future modules (not yet built)
- Acupuncture / device protocol engine
- Pack engine (integrative-neutral mode)
- TCM formula engine
- Full Avicenna 2 stack (pattern confidence module, guardrails, etc.)

See `docs/NEXTJS_MIGRATION.md` for the complete migration guide.

---

## Avicenna 2 Stack Position

This package is **Layer 1** of a 5-layer stack:

```
Layer 4: Avicenna 2 (full diagnostic engine — future)
    ↓ systemMode: "wellness"
Layer 1: This app (consumer wellness layer) ← THIS PACKAGE
    ↓ shared upstream
Layer 5: Correction vector logic (thermal, fluid, flow, OF, permeability)
```

Layer 2 (Pack engine) and Layer 3 (TCM engine) are fully specified but not
included in this package. See `docs/ARCHITECTURE.md` for the complete stack.
