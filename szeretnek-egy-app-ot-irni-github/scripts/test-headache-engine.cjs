const assert = require("node:assert/strict");
const { evaluateHeadache } = require("../lib/avicenna/headacheEngine.cjs");

const nerve = evaluateHeadache({
  pain_quality: "pulsing_throbbing",
  sensory_features: ["light_sensitivity", "sound_sensitivity", "visual_aura", "nausea"],
  energy_state: "tired_but_wired",
  current_medications: ["triptan"],
  treatment_response: "helps_temporarily",
  early_warning_signs: ["scalp_tenderness"]
});

assert.equal(nerve.dominant_pattern, "signal_overload_neurovascular_decoupling");
assert.ok(nerve.axis_scores.nerve_first_score.score > nerve.axis_scores.fascia_first_score.score);
assert.ok(nerve.drug_terrain_conflicts.length > 0);

const redFlag = evaluateHeadache({
  thunderclap_headache: true,
  sensory_features: ["light_sensitivity"]
});

assert.equal(redFlag.stopped, true);
assert.equal(redFlag.stop.reason, "red_flag_headache");
assert.deepEqual(redFlag.intervention_hierarchy.first_line, []);

const membraneSafety = evaluateHeadache({
  body_signals: ["dry_mouth", "dry_skin", "brittle_nails"],
  tongue_features: ["dry"],
  cancer_active: true,
  glutathione_initiated: true,
  EZ_stabilisation_not_done: true,
  internal_audit: true
});

assert.ok(membraneSafety.contraindications.includes("glutathione"));
assert.ok(membraneSafety.contraindications.includes("glutathione_before_EZ_preparation"));
assert.ok(membraneSafety.contraindications.includes("ginger_in_dry_pattern"));
assert.ok(membraneSafety.clinician.rule_trace.length > 0);

const gut = evaluateHeadache({
  pain_quality: "dull_heavy",
  trigger_category: "food_alcohol_histamine",
  early_warning_signs: ["bloating", "reflux", "constipation"],
  digestive_sensitivity: true,
  gut_flare_active: true,
  laser_eligibility_check: true
});

assert.equal(gut.dominant_pattern, "gut_metabolic_dominant");
assert.ok(gut.contraindications.includes("berberine_maintenance"));
assert.ok(gut.contraindications.includes("laser_during_active_gut_flare"));

console.log("Headache engine tests passed: 4/4");
