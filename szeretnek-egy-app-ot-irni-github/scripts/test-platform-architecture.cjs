const assert = require("assert");
const { evaluatePlatformArchitecture } = require("../lib/avicenna/platformArchitecture.cjs");
const { evaluateTaiyangModule } = require("../lib/avicenna/taiyangModule.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

function assertNoBranding(result, label) {
  const text = JSON.stringify(result);
  assert(!/DuoLife|MyGastrin|MyBlood|ProCardiol|ProSugar|Promigraine/.test(text), `${label} should not display branded supplement names`);
}

const frontEnd = evaluatePlatformArchitecture({
  system_output_mode: "front_end",
  instability_type: "energy_deficiency",
  root_branch_assessment: "internal_reserves_weak",
  system_priority: "nutrition"
});

assert.equal(frontEnd.system_output_mode, "front_end");
assert.equal(frontEnd.output_visibility.six_compartment_map_visible, false);
assert.equal(frontEnd.route_summary, undefined, "front-end mode should not expose backend route maps");
assert.equal(frontEnd.clinician, undefined, "front-end mode should not expose clinician maps");
assert(frontEnd.patient.explanation.includes("evidence-informed + practice-derived"));
assert(frontEnd.patient.safety_notes.includes("This is an educational pattern-recognition tool, not a medical diagnosis."));

const practitioner = evaluatePlatformArchitecture({
  system_output_mode: "practitioner",
  instability_type: "overheating",
  root_branch_assessment: "exit_pathway_impaired",
  system_priority: "herbal",
  branch_direction: "outbound",
  traditional_content_referenced: true,
  clinician_requests_upload: true,
  case_submission: { free_text: "helpful case note only" },
  case_plausibility_score: 0.4
});

assert.equal(practitioner.output_visibility.six_compartment_map_visible, true);
assert.equal(practitioner.clinician.axis_mapping.TaiYang, "Axis 1");
assert.equal(practitioner.case_quality.status, "structured_fields_required");
assert.equal(practitioner.case_quality.human_review_required, true);
assert.equal(practitioner.case_quality.auto_delete, false);
assert(practitioner.case_quality.prompt_fields.includes("timeline"));
assert(practitioner.patient.safety_notes.some((note) => note.includes("It is believed in traditional medical systems")));

const stagnation = evaluatePlatformArchitecture({
  system_output_mode: "practitioner",
  instability_type: "stagnation",
  root_branch_assessment: "trauma_active",
  system_priority: "nervous_system_reset",
  branch_direction: "inbound",
  primary_location: "posterior neck and spine",
  case_submission: {
    timeline: "6 weeks",
    pain_scores: [4, 6],
    PROMs: "PROMIS pain interference",
    labs_imaging_if_available: "MRI reviewed",
    outcome: "partial",
    adverse_events: "none",
    compliance: "good",
    relapse_timing: "day 12"
  }
});

assert.equal(stagnation.route_summary.instability_routes[0], "Taiyang");
assert.equal(stagnation.case_quality.status, "ready_for_peer_review");
assert.equal(stagnation.case_quality.human_review_required, false);

const neural = evaluatePlatformArchitecture({
  system_output_mode: "practitioner",
  instability_type: "neural_overload",
  root_branch_assessment: "internal_reserves_weak",
  system_priority: "nervous_system_reset"
});

assert(neural.route_summary.treatment_cluster_candidates.includes("Central Coherence Support"));

const dryness = evaluatePlatformArchitecture({
  system_output_mode: "front_end",
  instability_type: "dryness",
  root_branch_assessment: "exit_pathway_impaired",
  system_priority: "lifestyle"
});

assert.equal(dryness.patient.instability_type, "Dryness");

assertNoBranding(practitioner, "platform practitioner output");
assertNoBranding(evaluateTaiyangModule({
  posterior_tension: true,
  thermal_state_lower_body: "normal",
  thermal_state_surface: "dry_tight",
  symptoms: ["tension_headache"]
}), "Taiyang runtime output");

const covered = new Set([
  ...ruleIds(frontEnd),
  ...ruleIds(practitioner),
  ...ruleIds(stagnation),
  ...ruleIds(neural),
  ...ruleIds(dryness)
]);
const expected = Array.from({ length: 15 }, (_, index) => `B16_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 16 rule coverage: ${missing.join(", ")}`);

console.log(`Platform architecture tests passed: ${covered.size}/15 rules covered`);
