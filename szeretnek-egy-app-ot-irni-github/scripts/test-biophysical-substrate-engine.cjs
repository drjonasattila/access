const assert = require("assert");
const { evaluateBiophysicalSubstrateEngine } = require("../lib/avicenna/biophysicalSubstrateEngine.cjs");

const forbiddenPatientTerms = [
  "etheric field",
  "HUN",
  " Qi ",
  "proton accumulator",
  "field hologram",
  "Shaoyin gap",
  "Jueyin slip",
  "Taiyin phlegm overload",
  "Shaoyang gate instability"
];

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

function assertPatientSafe(result, label) {
  const text = ` ${JSON.stringify(result.patient)} `;
  for (const term of forbiddenPatientTerms) {
    assert(!text.includes(term), `${label}: patient output leaked internal term ${term}`);
  }
}

const ezFrag = evaluateBiophysicalSubstrateEngine({
  symptom_oscillation: true,
  night_worsening: true,
  stress_sensitivity: true,
  allodynia_like_sensitivity: true,
  paradoxical_drug_response: true
});

const visceral = evaluateBiophysicalSubstrateEngine({
  small_trigger_disproportionate: true,
  bladder_dominant: true,
  autonomic_dysreflexia: true,
  acute_severe_hypertension: true
});

const cluster = evaluateBiophysicalSubstrateEngine({
  output_mode: "practitioner",
  headache_type: "cluster",
  circadian: true,
  oxygen_therapy: true
});

const ph = evaluateBiophysicalSubstrateEngine({
  headache_type: "paroxysmal_hemicrania",
  indomethacin_responsive: true
});

const sunct = evaluateBiophysicalSubstrateEngine({
  headache_type: "SUNCT"
});

const cervicalC2 = evaluateBiophysicalSubstrateEngine({
  output_mode: "practitioner",
  cervical_symptoms_present: true,
  hoarseness: true,
  globus: true,
  shoulder_tension: true,
  cervical_level: "C2_C3",
  ascending_visceral_pressure: true
});

const cervicalC5 = evaluateBiophysicalSubstrateEngine({
  output_mode: "practitioner",
  cervical_symptoms_present: true,
  dysphagia: true,
  shoulder_tension: true,
  cervical_level: "C5_C6",
  descending_sp_overload: true
});

const sgbBlocked = evaluateBiophysicalSubstrateEngine({
  cervical_symptoms_present: true,
  globus: true,
  shoulder_tension: true,
  stellate_ganglion_block_considered: true,
  phlegm_dominant: true,
  symptom_resolves_with_directional_change: false
});

const fasciaBlock = evaluateBiophysicalSubstrateEngine({
  passive_movement_restricted: true,
  active_movement_restricted: true
});

const nerveBlock = evaluateBiophysicalSubstrateEngine({
  passive_movement_available: true,
  active_movement_absent: true
});

const ionPhase = evaluateBiophysicalSubstrateEngine({
  movement_failure: "intermittent"
});

const muscleCollapse = evaluateBiophysicalSubstrateEngine({
  diagnosis: "ALS",
  neuroprotection_only: true
});

const metastasis = evaluateBiophysicalSubstrateEngine({
  output_mode: "practitioner",
  metastasis_site: "vertebral bone",
  practitioner_requests_integrative_layer: true
});

const metastasisPatient = evaluateBiophysicalSubstrateEngine({
  output_mode: "patient",
  metastasis_site: "liver",
  practitioner_requests_integrative_layer: true
});

const drugFormula = evaluateBiophysicalSubstrateEngine({
  output_mode: "practitioner",
  western_pharmaceutical: true,
  concurrent_TCM_formula: true
});

const pungentRisk = evaluateBiophysicalSubstrateEngine({
  pungent_herbs_used: true,
  Yin_support_absent: true
});

const complexity = evaluateBiophysicalSubstrateEngine({
  formula_components_count: 5,
  formula_axis: ["base", "direction", "guide", "extra_axis"]
});

assert(ezFrag.matched_patterns.includes("EZW_FRAG"), "oscillation signs should match EZW_FRAG");
assert.deepEqual(ezFrag.seven_cluster_routes.EZW_FRAG, ["LAX", "PSA", "AMA", "MIA", "SVA", "DAV", "CIA"], "EZW_FRAG should route into all seven clusters");
assertPatientSafe(ezFrag, "EZW_FRAG");

assert.equal(visceral.stopped, true, "acute autonomic dysreflexia safety features should stop substrate interpretation");
assert(visceral.matched_patterns.includes("OSCILL_VISC"), "bladder-dominant autonomic instability should match OSCILL_VISC");

assert(cluster.matched_patterns.includes("TAC_OSCILL"), "cluster should match TAC_OSCILL");
assert.equal(cluster.clinician.tac_oscillator.type, "cluster", "cluster subtype should be selected");
assert(JSON.stringify(cluster.clinician).includes("mitochondrial redox reset + NO dampening"), "oxygen mechanism should appear in clinician mode");
assert(cluster.integration_routes.headache_tri_axial_engine.includes("TAC branch"), "TAC should link to headache tri-axial engine");

assert.equal(ph.clinician, undefined, "patient mode should not expose clinician panel");
assert(ruleIds(ph).includes("B19_R005"), "PH should trigger B19_R005");
assert(ruleIds(sunct).includes("B19_R006"), "SUNCT/SUNA should trigger B19_R006");

assert(cervicalC2.matched_patterns.includes("CERV_PREVRT"), "cervical symptoms should match CERV_PREVRT");
assert(ruleIds(cervicalC2).includes("B19_R008"), "C2-C3 should trigger level rule");
assert(cervicalC2.clinician.cervical_prevertebral.formula_logic.guide.includes("Jie Geng"), "C2/hoarseness should use Jie Geng guide");
assert(ruleIds(cervicalC5).includes("B19_R009"), "C5-C6 should trigger level rule");
assert(cervicalC5.clinician.cervical_prevertebral.formula_logic.guide.includes("Hou Po"), "C5/dysphagia should use Hou Po guide");
assert(ruleIds(sgbBlocked).includes("B19_R010"), "SGB contraindication should trigger");

assert.equal(fasciaBlock.clinician, undefined, "patient movement output should hide clinician internals");
assert(fasciaBlock.matched_patterns.includes("FASCIA_NERVE_SYSTEM"), "movement rules should match fascia-nerve system");
assert(ruleIds(fasciaBlock).includes("B19_R011"), "FASCIA_BLOCK rule should trigger");
assert(ruleIds(nerveBlock).includes("B19_R012"), "NERVE_BLOCK rule should trigger");
assert(ruleIds(ionPhase).includes("B19_R013"), "ION_PHASE_DISORDER rule should trigger");

assert(muscleCollapse.matched_patterns.includes("MUSCLE_FIELD_COLLAPSE"), "ALS neuroprotection-only should flag muscle field support");
assert(ruleIds(muscleCollapse).includes("B19_R014"), "muscle collapse rule should trigger");

assert(metastasis.matched_patterns.includes("METASTASIS_GATE"), "practitioner oncology layer should match METASTASIS_GATE");
assert.equal(metastasis.clinician.metastasis_meaning_layer.dominant_gate, "GATE_1_SHAOYIN", "bone/vertebral site should map to gate 1 internally");
assert(JSON.stringify(metastasis.patient).includes("does not replace oncological diagnosis"), "oncology safety wrapper should be patient-visible");
assert(!metastasisPatient.patient.pattern_labels?.length, "patient mode should not expose metastasis gate pattern label");
assertPatientSafe(metastasisPatient, "metastasis patient");

assert(ruleIds(drugFormula).includes("B19_R016"), "drug + formula rule should trigger");
assert(!JSON.stringify(drugFormula).includes("reduce drug dose"), "engine must not auto-advise dose reduction");
assert(JSON.stringify(drugFormula.clinician).includes("clinician-guided adjustment"), "drug + formula note should require clinician-guided adjustment");

assert(ruleIds(pungentRisk).includes("B19_R017"), "pungent herbs without Yin support should trigger");
assert(ruleIds(complexity).includes("B19_R018"), "formula complexity rule should trigger");

for (const result of [ezFrag, visceral, cluster, ph, sunct, cervicalC2, sgbBlocked, fasciaBlock, muscleCollapse, metastasisPatient, pungentRisk]) {
  assertPatientSafe(result, result.engine);
}

const covered = new Set([
  ...ruleIds(ezFrag),
  ...ruleIds(visceral),
  ...ruleIds(cluster),
  ...ruleIds(ph),
  ...ruleIds(sunct),
  ...ruleIds(cervicalC2),
  ...ruleIds(cervicalC5),
  ...ruleIds(sgbBlocked),
  ...ruleIds(fasciaBlock),
  ...ruleIds(nerveBlock),
  ...ruleIds(ionPhase),
  ...ruleIds(muscleCollapse),
  ...ruleIds(metastasis),
  ...ruleIds(drugFormula),
  ...ruleIds(pungentRisk),
  ...ruleIds(complexity)
]);
const expected = Array.from({ length: 19 }, (_, index) => `B19_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 19 rule coverage: ${missing.join(", ")}`);

console.log(`Biophysical substrate engine tests passed: ${covered.size}/19 rules covered`);
