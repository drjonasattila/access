const assert = require("assert");
const { evaluateTaiyangModule } = require("../lib/avicenna/taiyangModule.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

const exitCase = evaluateTaiyangModule({
  posterior_tension: false
});

const mixedCase = evaluateTaiyangModule({
  posterior_tension: true,
  tension_worsens_with_stress_cold_or_overstimulation: false,
  systemMode: "TCM",
  debugMode: true
});

const waterCase = evaluateTaiyangModule({
  posterior_tension: true,
  cranial_pressure: true,
  acute_cranial_pressure: true,
  edema_present: true,
  symptoms: ["posterior_fossa_congestion", "heavy_legs"]
});

const shaoyinCase = evaluateTaiyangModule({
  posterior_tension: true,
  thermal_state_lower_body: "cold",
  thermal_state_surface: "tight",
  sleep_quality: "poor",
  shaoyin_fire_status: "deficient",
  heat_signs: true
});

const traumaCase = evaluateTaiyangModule({
  posterior_tension: true,
  panic_attacks: true,
  sensory_overload: true,
  emotional_integration: "impaired",
  trauma_history: true,
  autonomic_state: "hyperarousal",
  stability_state: "stable"
});

const blockedCase = evaluateTaiyangModule({
  posterior_tension: true,
  active_panic_or_dissociation: true,
  acute_migraine_active: true,
  severe_shaoyin_depletion: true,
  fresh_trauma: true,
  psychotic_state: true,
  severe_IIH_symptoms: true
});

const pureCase = evaluateTaiyangModule({
  posterior_tension: true,
  thermal_state_lower_body: "normal",
  thermal_state_surface: "dry_tight",
  symptoms: ["tension_headache", "trapezius_tightness"]
});

assert.equal(exitCase.active, false, "posterior_tension=false should exit the module");
assert.deepEqual(exitCase.route_to, ["Shaoyang", "Jueyin", "Shaoyin"]);

assert.equal(mixedCase.systemMode, "TCM", "TCM terminology mode should be preserved");
assert(
  mixedCase.display_terms.includes("Taiyang"),
  "TCM mode should expose TCM terms"
);
assert(
  mixedCase.formal_documentation.label.includes("Peripheral neuro-fascial decompression"),
  "formal documentation label should use neutral neurofascial language"
);

assert.equal(waterCase.selected_branch, "taiyang_water_sludging", "cranial pressure + oedema should select water sludging");
assert.equal(waterCase.laser_eligibility.status, "delayed", "acute cranial pressure should delay laser");
assert(
  waterCase.intervention_layers.laser_layer.notes.some((note) => note.includes("Herba first") || note.includes("herbs first")),
  "water sludging acute cranial pressure should state Herba/herbs first"
);

assert.equal(shaoyinCase.selected_branch, "taiyang_shaoyin_deficiency", "cold below + poor sleep + deficient fire should select Shaoyin deficiency");
assert.equal(shaoyinCase.laser_eligibility.status, "delayed", "Shaoyin deficiency should delay laser");
assert(
  shaoyinCase.contraindications.some((item) => item.includes("Rou Gui micro-dose contraindicated")),
  "Rou Gui must be blocked when heat signs are present"
);

assert.equal(traumaCase.selected_branch, "taiyang_trauma_hyperreactivity", "strong reactivity-only case should select trauma overlay branch");
assert(
  traumaCase.intervention_layers.laser_layer.forbidden_zones.includes("head"),
  "trauma branch must forbid direct head laser"
);

assert.equal(blockedCase.laser_eligibility.blocked, true, "absolute contraindications should block laser");
assert.equal(blockedCase.supplement_eligibility.blocked, true, "acute migraine/panic/fresh trauma should block DuoLife");
assert(
  blockedCase.patient.safety_notes.includes("The field needs direction, not energy."),
  "blocked laser should show patient-safe message"
);

assert.equal(pureCase.selected_branch, "taiyang_pure_tension", "dry-tight posterior tension should select pure tension");
assert.equal(pureCase.laser_eligibility.eligible, true, "pure tension should be laser-eligible when no gates are triggered");
assert.equal(pureCase.integration_order_status.order[0].layer, "Herba", "Herba must be first");
assert.equal(pureCase.integration_order_status.order[1].layer, "HILT Laser", "HILT laser must be second");
assert.equal(pureCase.integration_order_status.order[2].layer, "DuoLife", "DuoLife must be third");

const covered = new Set([
  ...ruleIds(exitCase),
  ...ruleIds(mixedCase),
  ...ruleIds(waterCase),
  ...ruleIds(shaoyinCase),
  ...ruleIds(traumaCase),
  ...ruleIds(blockedCase),
  ...ruleIds(pureCase)
]);
const expected = Array.from({ length: 19 }, (_, index) => `B14_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 14 rule coverage: ${missing.join(", ")}`);

console.log(`Taiyang module tests passed: ${covered.size}/19 rules covered`);
