const assert = require("assert");
const { evaluateTreatmentClusterEngine } = require("../lib/avicenna/treatmentClusterEngine.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

function assertNoInternalPatientLeak(result, label) {
  const patientText = JSON.stringify({
    patient: result.patient,
    per_patient_output: result.per_patient_output
  });
  assert(!patientText.includes("BL/SI"), `${label}: frontend output leaked TCM pair`);
  assert(!patientText.includes("internal_tag"), `${label}: frontend output leaked internal tag`);
  assert(!patientText.includes("backend_translation_map"), `${label}: frontend output leaked backend map`);
  assert(!patientText.includes("Ban Xia Tian Ma Bai Zhu San"), `${label}: frontend output leaked internal formula`);
}

const lateral = evaluateTreatmentClusterEngine({
  functional_axis_primary: "LAX",
  functional_axis_secondary: "PSA",
  pain_laterality: "unilateral",
  system_mode: "integrative-neutral"
});

const singleAxis = evaluateTreatmentClusterEngine({
  primary_axis: "LAX",
  secondary_axis: "LAX"
});

const posteriorReview = evaluateTreatmentClusterEngine({
  diagnosis: "IIH",
  pressure_sensitivity: true,
  overweight: true,
  internal_cold_sensation: true
});

const deepVascular = evaluateTreatmentClusterEngine({
  primary_axis: "DAV",
  burning_neuropathy: true
});

const anteriorMetabolic = evaluateTreatmentClusterEngine({
  primary_axis: "AMA",
  post_meal_flare: true
});

const survivalAxis = evaluateTreatmentClusterEngine({
  primary_axis: "SVA",
  panic_or_palpitations: true
});

const ciaGuard = evaluateTreatmentClusterEngine({
  primary_axis: "CIA",
  failed_treatments: 4
});

const ciaAllowed = evaluateTreatmentClusterEngine({
  primary_axis: "CIA",
  secondary_axis: "SVA",
  failed_treatments: 3,
  widespread_pain: true,
  multi_system_features: true
});

const sensitivity = evaluateTreatmentClusterEngine({
  primary_axis: "MIA",
  chest_tightness_noncardiac: true,
  frailty: true,
  digestive_sensitivity: true,
  emotional_constraint: true,
  adjunctive_pharmacology_considered: true
});

const crpsEarly = evaluateTreatmentClusterEngine({
  primary_axis: "LAX",
  crps_phase: "I"
});

const crpsLate = evaluateTreatmentClusterEngine({
  primary_axis: "DAV",
  crps_phase: "II"
});

const tcm = evaluateTreatmentClusterEngine({
  primary_axis: "PSA",
  pressure_sensitivity: true,
  system_mode: "TCM"
});

const debug = evaluateTreatmentClusterEngine({
  primary_axis: "PSA",
  pressure_sensitivity: true,
  system_mode: "debugMode"
});

assert.equal(lateral.primary_cluster, "Lateral Autonomic Decompression", "LAX should route to lateral cluster");
assert.equal(lateral.secondary_cluster, "Posterior Pressure Modulation", "PSA should route to posterior cluster");
assert(!lateral.clinician, "integrative-neutral output should suppress clinician backend panel");
assertNoInternalPatientLeak(lateral, "integrative-neutral lateral");

assert.equal(singleAxis.single_axis_dominance, true, "same-axis routing should be marked as single-axis dominance");
assert.equal(singleAxis.per_patient_output.secondary_cluster, "Posterior Pressure Modulation", "single-axis dominance should select adjacent secondary");
assert(ruleIds(singleAxis).includes("B18_R017"), "single-axis dominance should trigger B18_R017");

assert.equal(posteriorReview.primary_cluster, "Posterior Pressure Modulation", "IIH/PRES/Chiari/PDPH should force PSA");
assert.equal(posteriorReview.clinician_review_required, true, "IIH-style diagnoses require clinician review");
assert(ruleIds(posteriorReview).includes("B18_R019"), "serious pressure diagnosis should trigger B18_R019");
assert(ruleIds(posteriorReview).includes("B18_R011"), "PSA + overweight + internal cold should trigger archetype rule");
assertNoInternalPatientLeak(posteriorReview, "posterior review");

assert.equal(deepVascular.clinician_review_required, true, "DAV should always require clinician review");
assert(ruleIds(deepVascular).includes("B18_R006"), "DAV burning neuropathy should trigger B18_R006");
assert(ruleIds(anteriorMetabolic).includes("B18_R003"), "AMA post-meal flare should trigger B18_R003");
assert(ruleIds(survivalAxis).includes("B18_R005"), "SVA panic/palpitations should trigger B18_R005");

assert.notEqual(ciaGuard.primary_cluster, "Central Coherence Support", "CIA must not be assigned from failed treatments alone");
assert(ruleIds(ciaGuard).includes("B18_R018"), "CIA guard should trigger B18_R018");

assert.equal(ciaAllowed.primary_cluster, "Central Coherence Support", "CIA can be assigned with widespread + central features");
assert(ruleIds(ciaAllowed).includes("B18_R007"), "CIA assignment should trigger B18_R007 when criteria are present");

assert(ruleIds(sensitivity).includes("B18_R008"), "frailty rule should trigger");
assert(ruleIds(sensitivity).includes("B18_R009"), "emotional constraint rule should trigger");
assert(ruleIds(sensitivity).includes("B18_R010"), "digestive sensitivity rule should trigger");
assert(ruleIds(sensitivity).includes("B18_R020"), "pharmacology review rule should trigger");
assert(sensitivity.contraindications.some((item) => item.includes("Avoid oral botanical")), "digestive sensitivity should avoid oral botanicals");
assert(ruleIds(crpsEarly).includes("B18_R012"), "CRPS phase I should trigger LAX routing rule");
assert(ruleIds(crpsLate).includes("B18_R013"), "CRPS phase II/III should trigger DAV routing rule");

assert(tcm.clinician.tcm_axis_pairs.PSA, "TCM mode may show practitioner TCM pair");
assert(!JSON.stringify(tcm.clinician).includes("backend_translation_map"), "TCM mode must not expose backend translation map");
assert(!JSON.stringify(tcm.patient).includes("Ban Xia Tian Ma Bai Zhu San"), "formula must stay out of patient output");

assert(debug.per_patient_output.internal_debug, "debug mode should include internal_debug in schema");
assert(debug.per_patient_output.internal_debug.backend_translation_map, "debug mode should expose backend translation map");
assert(JSON.stringify(debug.clinician).includes("Ban Xia Tian Ma Bai Zhu San"), "debug/internal mode may expose internal PSA formula reference");

const covered = new Set([
  ...ruleIds(lateral),
  ...ruleIds(singleAxis),
  ...ruleIds(posteriorReview),
  ...ruleIds(deepVascular),
  ...ruleIds(anteriorMetabolic),
  ...ruleIds(survivalAxis),
  ...ruleIds(ciaGuard),
  ...ruleIds(ciaAllowed),
  ...ruleIds(sensitivity),
  ...ruleIds(crpsEarly),
  ...ruleIds(crpsLate),
  ...ruleIds(tcm),
  ...ruleIds(debug)
]);

const expected = Array.from({ length: 20 }, (_, index) => `B18_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 18 rule coverage: ${missing.join(", ")}`);

console.log(`Treatment cluster engine tests passed: ${covered.size}/20 rules covered`);
