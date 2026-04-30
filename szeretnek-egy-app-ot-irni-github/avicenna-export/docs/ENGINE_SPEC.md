# Avicenna Wellness Layer — Engine Specification
## Build 1.0 — Final with Patch 1.1

---

## Input Schema

```
{
  thermal:               "cold" | "heat" | "neutral"
  moisture:              "damp" | "dry" | "neutral"
  energy_state:          "undercharged" | "overcharged" | "neutral"
  frailty:               boolean
  digestive_sensitivity: "low" | "medium" | "high"
  symptom_intensity:     "mild" | "moderate" | "strong"
  symptoms:              SymptomKey[]
  safety_flags:          SafetyFlagKey[]
}

SymptomKey:
  "bloating" | "brain_fog" | "cold_hands_feet" | "dry_mouth" |
  "irritability" | "loose_stool" | "constipation_dry" | "palpitations"

SafetyFlagKey:
  "pregnancy" | "gastritis" | "hypertension" |
  "palpitations_flag" | "anticoagulants" | "none"

IMPORTANT DISTINCTION:
  "palpitations" in symptoms[] = symptom modifier (Step 11)
    → formula-level: removes stimulants, adds rose petals
    → does NOT block herbs at safety level
  "palpitations_flag" in safety_flags[] = safety restriction (Step 12)
    → blocks black pepper, mustard seed, clove
    → generates safety note
    → independent from palpitations symptom modifier
    → both may be active simultaneously
```

---

## Output Schema

```
{
  primary_pattern:        string
  secondary_pattern:      string | null
  formula_strength:       string
  ingredients:            { name, amount, role }[]
  preparation:            string
  timing:                 string
  modifications_applied:  string[]
  avoid:                  string[]
  field_effects:          string[]
  follow_up_questions:    string[]
  safety_notes:           string[]
  debug_trace:            string[]
}
```

---

## Processing Pipeline (15 Steps)

### Step 1 — Safety Flag Check (Highest Priority)
Applied conceptually first (gates entire formula), physically applied at Step 12.
Safety restrictions always override formula logic.

### Step 2 — Contradictory Symptom Detection
If symptoms contains BOTH "loose_stool" AND "constipation_dry":
→ apply neither modifier
→ generate follow-up question
→ document: "contradictory bowel signals — modifier deferred"

### Step 3 — Pattern Identification
```
thermal=cold  + moisture=damp → damp_cold
thermal=heat  + moisture=damp → damp_heat
thermal=heat  + moisture=dry  → dry_heat
thermal=cold  + moisture=dry  → dry_cold
thermal=neutral + energy_state=undercharged → undercharged
thermal=neutral + energy_state=overcharged  → overcharged
thermal=neutral + moisture=neutral          → neutral_baseline
otherwise                                   → mixed_pattern
```

### Step 4 — Neutral-State Fallback
IF pattern = neutral_baseline:
→ return gentle baseline protocol (cardamom, coriander, honey)
→ generate clarification question
→ skip remaining steps

### Step 5 — Mixed Pattern Fallback
IF pattern = mixed_pattern:
→ infer dominant from symptoms and signals
→ select closest single pattern
→ force formula_strength = "light"
→ generate 1 clarification question

Mixed pattern inference priority:
1. overcharged / irritability / palpitations signals → cooling patterns
2. damp / bloating / brain_fog signals → damp patterns
3. dry signals → dry patterns
4. fallback → damp_cold

### Step 6 — Intensity Resolution + Frailty Floor
```
mild     → light
moderate → medium
strong   → strong

IF frailty:
  strong   → medium
  medium   → light
  light    → frailty_floor (light formula, max 3 herbs, document)

IF mixed_pattern: force light regardless
```

### Step 7 — Base Formula Selection
Select from PROTOCOLS[primary_pattern][formula_strength]
(frailty_floor uses "light" base)

### Step 8 — Digestive Sensitivity Restriction
IF digestive_sensitivity = "high":
→ remove: black pepper, mustard seed, clove, ginger
→ if <2 herbs remain: add fennel seed (+ anise if damp_cold)
→ document: "digestive sensitivity high — strong spices removed"

### Step 9 — Overcharged + Cold Conflict
IF energy_state = "overcharged" AND thermal = "cold":
→ replace entire herb list with aromatic movers:
  - Cardamom 8 pods
  - Coriander seed 1 tsp
  - Anise ½ tsp
  - Mint small handful
→ document: "overcharged-cold conflict — aromatic movers only, heating suppressed"

### Step 10 — Secondary Pattern Integration
IF energy_state ≠ "neutral" AND energy_state ≠ primary_pattern:
  secondary_pattern = energy_state
  add up to 2 herbs from SECONDARY_HERBS[energy_state]
  EXCLUDE herbs that conflict with PRIMARY_CONFLICTS[primary_pattern]
  document omissions and additions

PRIMARY_CONFLICTS:
  dry_heat:    ["ginger", "cinnamon", "mustard seed", "black pepper", "cumin"]
  dry_cold:    ["mustard seed", "black pepper"]
  overcharged: ["ginger", "cinnamon", "mustard seed", "black pepper", "cumin", "ginseng"]

### Step 11 — Modifier Application
Sort active symptoms by MODIFIER_PRIORITY (ascending):
  palpitations: 1, irritability: 2, brain_fog: 1, bloating: 1
  dry_mouth: 2, cold_hands_feet: 2, loose_stool: 3, constipation_dry: 2

Cap: frailty → 1 modifier max; default → 2 modifiers max
Defer excess to follow_up_questions.

Modifier actions:
  palpitations:     remove ginseng/mustard/pepper/clove; add rose petals; add to avoid
  irritability:     remove pepper/mustard; add rose petals
  brain_fog:        add cardamom (if absent)
  bloating:         add cardamom (if absent)
  dry_mouth:        remove pepper/mustard/clove; add honey (if absent)
  cold_hands_feet:  add ginger (or cinnamon if ginger present); skip if overcharged
  loose_stool:      remove chia/basil seed
  constipation_dry: add soaked chia seed (if absent)

### Step 12 — Safety Flags Applied to Final Herb List
BLOCKED HERBS by flag:
  pregnancy:          mustard seed, clove, he shou wu, black pepper
  gastritis:          black pepper, mustard seed, clove
  hypertension:       black pepper, mustard seed, clove
  palpitations_flag:  black pepper, mustard seed, clove
  anticoagulants:     none blocked; generates clinician note only

Multiple flags: merge all blocked sets.
Always generate safety_notes for active flags.

### Step 13 — Deduplication + Formula Cap
Deduplication: merge herbs with same name, concatenate roles.
Cap: frailty=true → 3 herbs max; default → 5 herbs max.

### Step 14 — Follow-Up Question Triggers
Generate follow-up when:
  - mixed_pattern detected (Step 5)
  - contradictory bowel symptoms (Step 2)
  - modifiers deferred due to cap (Step 11)
  - formula < 2 herbs after all restrictions
Maximum 3 follow-up questions per output.

### Step 15 — Output Assembly
Return complete output object with all fields.
debug_trace always populated (15 step entries minimum).

---

## Formula Caps Summary

| Context | Max Ingredients |
|---------|----------------|
| Default | 5 |
| Frailty active | 3 |
| Secondary pattern addition | +1 or +2 (counts toward cap) |
| Neutral baseline | 3 (after safety + frailty) |

---

## Preparation Logic

| Condition | Preparation |
|-----------|-------------|
| Contains mint or rose petals | Simmer hard ingredients 10 min; infuse delicate herbs 3 min at end |
| Contains chia seed | Standard simmer + soak chia 10 min before adding |
| dry_heat or dry_cold pattern | Steep in warm (not boiling) water 8–10 min; do not over-boil |
| Default | Simmer 10–15 min; strain; drink warm |

---

## Timing Logic

| Pattern | Timing |
|---------|--------|
| undercharged or damp_cold | Morning or early afternoon. Not late evening. |
| All others | Morning or afternoon. |

---

## Avoid List Population

| Trigger | Added to avoid[] |
|---------|-----------------|
| energy_state = overcharged | "strong heating spices (cinnamon, ginger, pepper, mustard)" + "excess ginger or ginseng" |
| safety_flags includes pregnancy | "he shou wu" |
| safety_flags includes anticoagulants | "high-dose turmeric or ginger without clinician guidance" |
| palpitations modifier active | "strong stimulants (ginseng, pepper, mustard)" |
