const assert = require("assert");
const { evaluateSpinalFailureMode } = require("../lib/avicenna/spinalFailureModeEngine.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

const cases = [
  evaluateSpinalFailureMode({
    pain_type: "intermittent",
    EZ_state: "continuous",
    EZ_continuity: true
  }),
  evaluateSpinalFailureMode({
    pain_type: "mixed",
    EZ_state: "partially_fragmented"
  }),
  evaluateSpinalFailureMode({
    pain_type: "continuous_neuropathic",
    EZ_state: "fragmented",
    EZ_continuity: false,
    steroid_prescribed: true
  }),
  evaluateSpinalFailureMode({
    pain_location: "lower_back",
    pain_quality: "dull_deep_ache",
    load_position_dependence: "relieved_movement",
    western_diagnosis: "degenerative_disc_disease",
    morning_stiffness: true,
    cold_lower_back: true,
    collagen_prescribed: true,
    disc_stability_at_reassessment: "improved",
    no_large_herniation: true
  }),
  evaluateSpinalFailureMode({
    pain_quality: "stiffness_tightness",
    load_position_dependence: "worse_sitting",
    local_tenderness: true,
    postural_strain: true,
    post_surgical_scarring: true
  }),
  evaluateSpinalFailureMode({
    pain_location: "radiating_leg",
    pain_quality: "electric_shooting",
    night_pain: true,
    current_medications: ["gabapentin_pregabalin"],
    dermatomal_spread: true,
    aggressive_stimulation: true,
    acute_nerve_pain: true,
    nerve_pain_at_reassessment: "reduced"
  }),
  evaluateSpinalFailureMode({
    failure_mode_score_deep_ligament: 9,
    core_question_result: "cannot_hold",
    ligament_tone: "hypotonic",
    phase_current: 1,
    instability_sensation_reduced: true,
    pain_unpredictability_reduced: true,
    improvement_not_sustained: true,
    systemic_laxity_signs: true,
    cold_extremities: true,
    hypothyroid: true,
    stretching_prescribed: true,
    current_medications: ["gabapentin_pregabalin", "NSAIDs"]
  }),
  evaluateSpinalFailureMode({
    failure_mode_score_deep_ligament: 9,
    core_question_result: "holding_too_much",
    ligament_tone: "hypertonic",
    phase_current: 1,
    western_diagnosis: "facet_pain",
    liver_yang_rising: true
  }),
  evaluateSpinalFailureMode({
    failure_mode_score_deep_ligament: 9,
    core_question_result: "mixed",
    ligament_tone: "mixed"
  }),
  evaluateSpinalFailureMode({
    organ_instability: true,
    visceral_organ_feedback: "HT",
    sacrum_treated: true,
    occiput_released: true,
    fascia_released: true
  })
];

assert.equal(cases[0].EZ_continuity_state.continuity, true, "continuous EZ should preserve continuity");
assert.equal(cases[2].EZ_continuity_state.continuity, false, "fragmented EZ should reduce continuity");
assert.equal(cases[3].primary_pattern, "disc_dehydration_structural_failure");
assert.equal(cases[4].primary_pattern, "stasis_fascial_tension");
assert.equal(cases[5].primary_pattern, "neurogenic_overload");
assert.equal(cases[6].primary_pattern, "deep_ligament_segmental_instability_hypotonic");
assert.equal(cases[7].primary_pattern, "deep_ligament_segmental_instability_hypertonic");
assert.equal(cases[8].primary_pattern, "hybrid_yin_yang_spinal");
assert(
  cases[8].suggested_sequence.some((item) => item.includes("BUILD first")),
  "hybrid pattern should enforce BUILD first, MOVE later"
);
assert(
  cases[3].contraindications.some((item) => item.includes("Collagen without flow support")),
  "collagen without flow support should be blocked"
);
assert(
  cases[6].contraindications.some((item) => item.includes("Stretching is contraindicated")),
  "stretching should be blocked in hypotonic instability"
);

const covered = new Set(cases.flatMap(ruleIds));
const expected = Array.from({ length: 30 }, (_, index) => `B12_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 12 rule coverage: ${missing.join(", ")}`);

console.log(`Spinal failure mode engine tests passed: ${covered.size}/30 rules covered`);
