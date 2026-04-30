# Avicenna Wellness Layer — Patch History

---

## Patch 1.1 — Applied to Build 1.0

All 9 patches applied in a single integration pass.

---

### PATCH 1.1.1 — Mixed Pattern Fallback
**Problem**: mixed_pattern had no protocol assigned.
**Fix**: When mixed_pattern detected, infer dominant axis from symptoms and signals.
Select closest single-pattern protocol. Force formula_strength = "light".
Generate 1 clarification question.
**Rule**: "mixed signals detected — closest pattern selected, light formula applied"

---

### PATCH 1.1.2 — Secondary Pattern Integration Rule
**Problem**: How secondary pattern herbs integrate was undefined. Conflict not detected.
**Fix**: Secondary pattern adds maximum 1–2 herbs. Herbs in PRIMARY_CONFLICTS[primary_pattern]
are excluded. Omissions documented. If secondary herb conflicts with primary direction, it is
omitted and noted.

---

### PATCH 1.1.3 — Frailty Floor
**Problem**: No floor defined below "light" when frailty=true.
**Fix**: frailty_floor state added: light formula at reduced quantity, maximum 3 ingredients.
Documented in output.

---

### PATCH 1.1.4 — Overcharged + Cold Resolution
**Problem**: Overcharged + cold conflict had no resolution. Engine would apply damp-cold
warming herbs despite overcharged state.
**Fix**: When energy_state=overcharged AND thermal=cold: replace entire herb list with
aromatic movers only (cardamom, coriander, anise, mint).
Rule: "overcharged-cold conflict — aromatic movers only, heating suppressed"

---

### PATCH 1.1.5 — High Digestive Sensitivity Fallback
**Problem**: Removing strong spices from high-sensitivity cases could leave <2 herbs.
**Fix**: After removing pepper/mustard/clove/ginger, if <2 herbs remain: add fennel seed
as gentle fallback. If damp_cold: also add anise.

---

### PATCH 1.1.6 — Modifier Cap
**Problem**: No limit on simultaneous modifiers. Formula could grow unbounded.
**Fix**: Maximum 2 modifiers per pass (frailty: 1). Modifiers sorted by priority (1=highest).
Excess deferred to follow_up_questions.
Modifier priorities: palpitations=1, brain_fog=1, bloating=1, irritability=2,
dry_mouth=2, cold_hands_feet=2, constipation_dry=2, loose_stool=3.

---

### PATCH 1.1.7 — Contradictory Symptom Detection
**Problem**: "loose_stool" and "constipation_dry" could both be selected, creating
contradictory modifiers.
**Fix**: If both present: apply neither modifier. Generate follow-up question:
"which tendency is more frequent?" Document: "contradictory bowel signals — modifier deferred"

---

### PATCH 1.1.8 — Safety Flag Inputs
**Problem**: Safety boundaries (pregnancy, gastritis, etc.) were advisory text only,
not wired to input fields.
**Fix**: Added safety_flags: string[] to input schema.
Values: "pregnancy" | "gastritis" | "hypertension" | "palpitations_flag" | "anticoagulants" | "none"
Applied to final herb list at Step 12 (after all formula generation).

NOTE: "palpitations" in symptoms[] = symptom modifier (Step 11).
"palpitations_flag" in safety_flags[] = safety restriction (Step 12).
These are independent. Both may be active simultaneously.

---

### PATCH 1.1.9 — Follow-Up Question Trigger Rules
**Problem**: "ask 1–3 follow-up questions only if necessary" was undefined.
**Fix**: Formal trigger rules added:
- mixed_pattern detected
- contradictory symptoms detected
- modifiers deferred due to cap
- formula < 2 herbs after restrictions
Maximum 3 follow-up questions per pass.

---

## Input Schema Addition (Patch 1.1.8)

New field added to input schema:
```json
"safety_flags": ["pregnancy", "gastritis", "hypertension", "palpitations_flag", "anticoagulants", "none"]
```

Previous schema did not include safety_flags.

---

## Consistency Fix — Patch 1.1 Final

Applied after testing:

### palpitations vs palpitations_flag Clarification
Confirmed distinct roles, documented in schema comment and safety rules:
- "palpitations" in symptoms[] → Step 11 modifier (formula-level)
- "palpitations_flag" in safety_flags[] → Step 12 safety (ingredient-level block)
- Independent; may both be active simultaneously
- TC08, TC09, TC10 test cases added to confirm

This distinction is documented in:
- src/engine/engine.js (inline comment on palpitations case)
- src/data/safetyRules.json (palpitations_flag entry with distinctFrom note)
- src/data/modifierRules.json (palpitations entry with type: symptom_modifier note)
- docs/ENGINE_SPEC.md (IMPORTANT DISTINCTION at top of Input Schema)
