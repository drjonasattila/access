# Next.js Migration Guide
## For Codex / Developer Handoff

---

## Target Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (or CSS Modules if preferred)
- **Package manager**: npm or pnpm

---

## Recommended Project Structure

```
avicenna-nextjs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          ← main wellness page
│   └── api/
│       └── protocol/
│           └── route.ts                  ← POST endpoint for protocol generation
│
├── components/
│   ├── InputForm/
│   │   ├── InputForm.tsx
│   │   ├── FieldGroup.tsx
│   │   ├── SymptomSelector.tsx
│   │   └── SafetyFlagSelector.tsx
│   └── OutputProtocol/
│       ├── OutputProtocol.tsx
│       ├── IngredientList.tsx
│       ├── TagList.tsx
│       ├── SafetyNotes.tsx
│       └── FollowUpQuestions.tsx
│
├── lib/
│   └── avicenna/
│       ├── engine.ts                     ← main generateProtocol() function
│       ├── patterns.ts                   ← identifyPattern(), inferDominant()
│       ├── modifiers.ts                  ← applyModifiers()
│       ├── safety.ts                     ← applySafetyFlags()
│       ├── dedup.ts                      ← dedup(), cap()
│       └── data/
│           ├── protocols.ts              ← typed protocol library
│           ├── safetyRules.ts            ← typed safety rules
│           ├── modifierRules.ts          ← typed modifier rules
│           └── patternMappings.ts        ← typed pattern mappings
│
├── types/
│   └── avicenna.ts                       ← all TypeScript interfaces
│
├── __tests__/
│   └── engine.test.ts                    ← Jest tests from testCases.json
│
└── public/
```

---

## TypeScript Interfaces

Create `types/avicenna.ts`:

```typescript
// Input
export interface AvicennaInput {
  thermal:               "cold" | "heat" | "neutral";
  moisture:              "damp" | "dry" | "neutral";
  energy_state:          "undercharged" | "overcharged" | "neutral";
  frailty:               boolean;
  digestive_sensitivity: "low" | "medium" | "high";
  symptom_intensity:     "mild" | "moderate" | "strong";
  symptoms:              SymptomKey[];
  safety_flags:          SafetyFlagKey[];
}

// Symptom keys
export type SymptomKey =
  | "bloating"
  | "brain_fog"
  | "cold_hands_feet"
  | "dry_mouth"
  | "irritability"
  | "loose_stool"
  | "constipation_dry"
  | "palpitations";

// Safety flag keys
// NOTE: "palpitations" in symptoms = formula-level modifier (Step 11)
// NOTE: "palpitations_flag" in safety_flags = safety-level restriction (Step 12)
// These are independent and may both be active simultaneously.
export type SafetyFlagKey =
  | "pregnancy"
  | "gastritis"
  | "hypertension"
  | "palpitations_flag"
  | "anticoagulants"
  | "none";

// Pattern keys
export type PatternKey =
  | "damp_cold"
  | "damp_heat"
  | "dry_heat"
  | "dry_cold"
  | "undercharged"
  | "overcharged"
  | "neutral_baseline"
  | "mixed_pattern";

// Formula strength
export type FormulaStrength =
  | "light"
  | "medium"
  | "strong"
  | "baseline"
  | "minimal (frailty)"
  | "frailty_floor";

// Ingredient
export interface Ingredient {
  name:   string;
  amount: string;
  role:   string;
}

// Output
export interface AvicennaOutput {
  primary_pattern:        PatternKey;
  secondary_pattern:      "undercharged" | "overcharged" | null;
  formula_strength:       string;
  ingredients:            Ingredient[];
  preparation:            string;
  timing:                 string;
  modifications_applied:  string[];
  avoid:                  string[];
  field_effects:          string[];
  follow_up_questions:    string[];
  safety_notes:           string[];
  debug_trace:            string[];
}

// Protocol entry in the library
export interface ProtocolEntry {
  principle:    string;
  field_effects: string[];
  light:        Ingredient[];
  medium:       Ingredient[];
  strong:       Ingredient[];
}

export type ProtocolLibrary = Record<string, ProtocolEntry>;
```

---

## API Route

Create `app/api/protocol/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateProtocol } from "@/lib/avicenna/engine";
import type { AvicennaInput, AvicennaOutput } from "@/types/avicenna";

export async function POST(req: NextRequest) {
  try {
    const body: AvicennaInput = await req.json();

    // Basic validation
    const required = ["thermal", "moisture", "energy_state",
                      "symptom_intensity", "digestive_sensitivity"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const protocol: AvicennaOutput = generateProtocol(body);
    return NextResponse.json(protocol);

  } catch (error) {
    return NextResponse.json(
      { error: "Protocol generation failed" },
      { status: 500 }
    );
  }
}
```

---

## Engine Migration (JS → TS)

The engine in `src/engine/engine.js` is pure logic with no DOM dependencies.
It can be converted to TypeScript by:

1. Renaming to `lib/avicenna/engine.ts`
2. Adding type annotations from `types/avicenna.ts`
3. Replacing the inline data with imports from `lib/avicenna/data/`
4. Changing `module.exports` to `export`

Key function signature:
```typescript
export function generateProtocol(input: AvicennaInput): AvicennaOutput
```

---

## Component Migration

### InputForm.tsx

```typescript
"use client";
import { useState } from "react";
import type { AvicennaInput, AvicennaOutput } from "@/types/avicenna";

interface InputFormProps {
  onProtocolGenerated: (output: AvicennaOutput) => void;
}

export function InputForm({ onProtocolGenerated }: InputFormProps) {
  const [formState, setFormState] = useState<Partial<AvicennaInput>>({
    frailty: false,
    symptoms: [],
    safety_flags: []
  });

  const handleSubmit = async () => {
    const response = await fetch("/api/protocol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState)
    });
    const output: AvicennaOutput = await response.json();
    onProtocolGenerated(output);
  };

  // ... render form fields
}
```

### OutputProtocol.tsx

```typescript
import type { AvicennaOutput } from "@/types/avicenna";

interface OutputProtocolProps {
  protocol: AvicennaOutput;
  onReset: () => void;
}

export function OutputProtocol({ protocol, onReset }: OutputProtocolProps) {
  // ... render output sections
}
```

---

## Test Setup

Install Jest and convert testCases.json to test file:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Create `__tests__/engine.test.ts`:

```typescript
import { generateProtocol } from "@/lib/avicenna/engine";
import testCases from "@/lib/avicenna/data/testCases.json";

describe("Avicenna Engine", () => {
  testCases.testCases.forEach(tc => {
    it(tc.description, () => {
      const output = generateProtocol(tc.input);
      const ings = output.ingredients.map(i => i.name.toLowerCase());

      if (tc.expected.primary_pattern)
        expect(output.primary_pattern).toBe(tc.expected.primary_pattern);
      if (tc.expected.max_ingredients)
        expect(output.ingredients.length).toBeLessThanOrEqual(tc.expected.max_ingredients);
      if (tc.expected.must_include)
        tc.expected.must_include.forEach(n =>
          expect(ings).toContain(n.toLowerCase())
        );
      if (tc.expected.must_not_include)
        tc.expected.must_not_include.forEach(n =>
          expect(ings).not.toContain(n.toLowerCase())
        );
      if (tc.expected.safety_note_min)
        expect(output.safety_notes.length).toBeGreaterThanOrEqual(tc.expected.safety_note_min);
      if (tc.expected.follow_up_min)
        expect(output.follow_up_questions.length).toBeGreaterThanOrEqual(tc.expected.follow_up_min);
    });
  });
});
```

---

## Future Modules (Not Yet Built)

These modules are specified in `docs/ARCHITECTURE.md` but not yet implemented.
They should be added as separate engine modules in `lib/avicenna/`:

1. **Pack engine** (`lib/avicenna/packEngine.ts`)
   - `systemMode: "integrative-neutral"` output
   - 5 intervention packs (Pack 1–5)
   - Drug-terrain pairing
   - Frailty + overcharged modifiers

2. **TCM formula engine** (`lib/avicenna/tcmEngine.ts`)
   - `systemMode: "TCM"` output
   - Correction vector library (V1–V7)
   - Named herb formulas with doses
   - Drug-terrain pairs

3. **Avicenna 2 stack** (`lib/avicenna/stack.ts`)
   - Pattern Confidence Module
   - Guardrail system
   - Objective findings modifier
   - Clinical trajectory
   - Adaptive feedback

4. **Acupuncture / device engine** (`lib/avicenna/deviceEngine.ts`)
   - Point selection logic
   - Device protocol generation
   - Not yet specified

---

## Environment Variables

No environment variables required for the wellness layer.
Future modules may need:

```env
# Future database connection
DATABASE_URL=

# Future auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Future analytics
AVICENNA_DEBUG_MODE=false
```

---

## Key Constraints to Preserve

1. **Engine is pure logic** — no DOM, no side effects, testable in isolation
2. **Safety first** — safety flags always override formula logic (Step 12 > Step 11)
3. **palpitations vs palpitations_flag** — these are independent; never merge them
4. **Formula caps** — 5 default, 3 frailty, never exceeded
5. **Output separation** — TCM, pack, and wellness outputs must never merge
6. **Debug trace** — always generated, hidden in UI unless debug mode active
