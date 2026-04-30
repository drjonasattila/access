# Avicenna Wellness Layer — Integration Notes
## Connecting to Avicenna 2 Stack (window._clinicalContext + systemMode)

---

## Current Status

This package (Layer 1) currently runs as a **standalone app**.
It collects input via its own form and generates output independently.

When Avicenna 2 is ready, this layer connects via:
1. `systemMode: "wellness"` routing
2. `mapClinicalContextToWellnessInput()` translation function
3. Guardrail check before wellness output is rendered

---

## systemMode Router Addition

In the Avicenna 2 output router, add:

```javascript
switch (systemMode) {
  case "TCM":
    // → Drug-Terrain / TCM formula engine (Layer 3)
    break;
  case "integrative-neutral":
    // → Pack engine (Layer 2)
    break;

  // ── ADD THIS ──
  case "wellness":
    // Check guardrail first
    if (window._guardrails && window._guardrails.state === "escalation_recommended") {
      renderEscalationNotice();
      return;
    }
    const wellnessInput = mapClinicalContextToWellnessInput(window._clinicalContext);
    if (!wellnessInput) { renderEscalationNotice(); return; }
    const protocol = window.AvicennaEngine.generateProtocol(wellnessInput);
    window.AvicennaOutput.render(protocol);
    break;

  case "internal-audit":
    // → Any engine + rule trace forced on
    break;
}
```

---

## Clinical Context Mapping Function

```javascript
/**
 * mapClinicalContextToWellnessInput
 * Translates window._clinicalContext into wellness layer input schema.
 * Returns null if escalation is active.
 */
function mapClinicalContextToWellnessInput(ctx) {

  // Guardrail check
  if (window._guardrails && window._guardrails.state === "escalation_recommended") {
    return null;
  }

  // ── Thermal axis ──────────────────────────────────────────────────────
  // window._clinicalContext.thermalAxis: "cold" | "heat" | "neutral"
  const thermal = ctx.thermalAxis || "neutral";

  // ── Moisture / fluid axis ─────────────────────────────────────────────
  // window._clinicalContext.fluidAxis: "damp" | "dry" | "mixed" | "neutral"
  // "mixed" → "neutral" in consumer layer (handled as mixed_pattern internally)
  let moisture = "neutral";
  if (ctx.fluidAxis === "damp")  moisture = "damp";
  if (ctx.fluidAxis === "dry")   moisture = "dry";
  // "mixed" stays "neutral" — engine will detect mixed_pattern

  // ── Energy / organising force ─────────────────────────────────────────
  // window._clinicalContext.organisingForce: "undercharged" | "overcharged" | "neutral"
  const energy_state = ctx.organisingForce || "neutral";

  // ── Frailty ───────────────────────────────────────────────────────────
  // window._clinicalContext.frailty: boolean
  const frailty = ctx.frailty === true;

  // ── Symptom intensity ─────────────────────────────────────────────────
  // window._pcm.signalStrength: 0–1
  let symptom_intensity = "mild";
  const sig = window._pcm ? window._pcm.signalStrength : 0;
  if (sig >= 0.7) symptom_intensity = "strong";
  else if (sig >= 0.4) symptom_intensity = "moderate";

  // ── Digestive sensitivity ─────────────────────────────────────────────
  // Not currently in _clinicalContext. Default: "medium"
  // TODO: add digestiveSensitivity field to _clinicalContext schema
  const digestive_sensitivity = ctx.digestiveSensitivity || "medium";

  // ── Symptom mapping ───────────────────────────────────────────────────
  const SYMPTOM_MAP = {
    "abdominal bloating":   "bloating",
    "bloating":             "bloating",
    "cognitive slowing":    "brain_fog",
    "brain fog":            "brain_fog",
    "foggy head":           "brain_fog",
    "cold extremities":     "cold_hands_feet",
    "cold hands":           "cold_hands_feet",
    "cold feet":            "cold_hands_feet",
    "dry mouth":            "dry_mouth",
    "irritability":         "irritability",
    "frustration":          "irritability",
    "loose stool":          "loose_stool",
    "diarrhoea":            "loose_stool",
    "constipation":         "constipation_dry",
    "dry constipation":     "constipation_dry",
    "palpitations":         "palpitations",
    "anxiety":              "palpitations"
  };
  const symptoms = [];
  (ctx.symptomList || []).forEach(s => {
    const mapped = SYMPTOM_MAP[s.toLowerCase()];
    if (mapped && !symptoms.includes(mapped)) symptoms.push(mapped);
  });

  // ── Safety flags ──────────────────────────────────────────────────────
  // NOTE: "palpitations" in symptoms[] = symptom modifier
  // NOTE: "palpitations_flag" in safety_flags[] = safety restriction
  // Both may be active simultaneously.
  const safety_flags = [];
  if (ctx.pregnancy)          safety_flags.push("pregnancy");
  if (ctx.gastritis)          safety_flags.push("gastritis");
  if (ctx.hypertension)       safety_flags.push("hypertension");
  if (ctx.anticoagulants)     safety_flags.push("anticoagulants");
  // Significant palpitations as a clinical safety concern:
  if (ctx.significantPalpitations) safety_flags.push("palpitations_flag");

  return {
    thermal,
    moisture,
    energy_state,
    frailty,
    digestive_sensitivity,
    symptom_intensity,
    symptoms,
    safety_flags
  };
}
```

---

## Schema Additions Required for window._clinicalContext

When integrating, add these fields if not already present:

```javascript
window._clinicalContext = {
  // ... existing fields ...

  // ── NEW: wellness layer fields ──────────────────────────
  digestiveSensitivity:    "low" | "medium" | "high",  // default "medium"
  symptomList:             string[],                    // free text symptoms
  pregnancy:               boolean,
  gastritis:               boolean,
  hypertension:            boolean,
  anticoagulants:          boolean,
  significantPalpitations: boolean                      // maps to palpitations_flag
};
```

---

## Guardrail Interaction

The wellness layer must NOT fire when guardrail state = escalation_recommended.

```javascript
// In systemMode router:
if (window._guardrails && window._guardrails.state === "escalation_recommended") {
  // Show escalation notice instead of wellness protocol
  renderEscalationNotice();
  return;
}
```

---

## Debug Mode Wiring

The engine always generates `debug_trace`. Wire to Avicenna 2 debugMode:

```javascript
const protocol = window.AvicennaEngine.generateProtocol(wellnessInput);

if (window._clinicalContext.debugMode === true ||
    systemMode === "internal-audit") {
  // Show debug_trace in output
  console.log("Wellness engine trace:", protocol.debug_trace);
}
```

---

## Standalone vs Connected Mode

The app supports two modes:

```javascript
// Set at app initialisation:
window.AVICENNA_MODE = "standalone"; // or "connected"

// In form submit handler:
if (window.AVICENNA_MODE === "connected") {
  // Bypass form — use mapClinicalContextToWellnessInput()
  const input = mapClinicalContextToWellnessInput(window._clinicalContext);
  if (input) {
    const output = window.AvicennaEngine.generateProtocol(input);
    window.AvicennaOutput.render(output);
  }
} else {
  // Standalone: use form state directly
  const output = window.AvicennaEngine.generateProtocol(formState);
  window.AvicennaOutput.render(output);
}
```

---

## Summary of Integration Touchpoints

| Touchpoint | Location | What to connect |
|---|---|---|
| systemMode routing | Avicenna 2 router | Add "wellness" case |
| Input mapping | This file | mapClinicalContextToWellnessInput() |
| Guardrail check | Avicenna 2 router | Check before calling wellness layer |
| Schema additions | window._clinicalContext | digestiveSensitivity, symptomList, safety fields |
| Debug mode | Engine output | Wire debug_trace to debugMode flag |
| Standalone toggle | App init | window.AVICENNA_MODE = "connected" |
