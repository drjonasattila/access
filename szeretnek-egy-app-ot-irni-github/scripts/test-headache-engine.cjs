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
  red_flag_present: true,
  red_flag_type: ["fever_weight_loss"],
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

const berberineHeat = evaluateHeadache({
  current_phase: "flare",
  dominant_state: "heat_flare",
  berberine_status: "ON",
  system_response_at_day3_7: "stabilised",
  internal_audit: true
});

assert.equal(berberineHeat.current_phase, "flare");
assert.equal(berberineHeat.berberine_switch.status, "TAPER_OFF");
assert.equal(berberineHeat.matching_pattern, "heat_flare_active");

const berberineColdBlock = evaluateHeadache({
  current_phase: "baseline",
  dominant_state: "cold_deficiency",
  berberine_status: "ON",
  cold_signs: true
});

assert.equal(berberineColdBlock.berberine_switch.status, "BLOCKED");
assert.ok(berberineColdBlock.contraindications.includes("berberine"));

const hipLigament = evaluateHeadache({
  pain_location: "hip",
  pain_timing: "load_only",
  instability_present: true,
  cold_signs: true,
  internal_audit: true
});

assert.equal(hipLigament.matching_pattern, "hip_ligament_laxity_cold_mitochondrial_weakness");
assert.equal(hipLigament.clinician.dominant_layer, "fascia_first");

const spineFacet = evaluateHeadache({
  pain_location: "spine",
  pain_timing: "rest_night",
  laser_eligibility_check: true
});

assert.equal(spineFacet.matching_pattern, "spine_facet_capsule_ligament_oedema");
assert.equal(spineFacet.laser_layer_recommendation.layer, "spine_segmental");

const chronic = evaluateHeadache({
  pain_onset_pattern: "mixed_chronic",
  headache_character: "dull_deep"
});

assert.equal(chronic.chronic_progression.detected, true);
assert.equal(chronic.chronic_progression.phrase, "Chronic headache is not escalation - it is migration.");

console.log("Headache engine tests passed: 9/9");
