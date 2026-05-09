const assert = require("assert");
const { evaluateTransitionEngine } = require("../lib/avicenna/transitionEngine.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

const redFlag = evaluateTransitionEngine({
  red_flag_present: true
});

const tth = evaluateTransitionEngine({
  headache_quality: "pressing",
  headache_laterality: "bilateral",
  aggravated_by_activity: false,
  nausea_present: false,
  vomiting_present: false,
  photophobia_present: true,
  phonophobia_present: false,
  yin_depletion_signs: true,
  heat_signs: true,
  heat_toxicity_overlay: true,
  persistent_tension: true,
  yin_support_fails: true,
  medication_overuse_present: true,
  symptoms: ["neck_shoulder_pain", "tth"]
});

const victimSuppression = evaluateTransitionEngine({
  trauma_role: "victim",
  autonomic_state: "freeze",
  visceral_sensitivity: "high",
  exertional_intolerance: true,
  symptoms: ["ibs", "fibromyalgia", "migraine", "aura"],
  axis_probability_scores: {
    shaoyang: 85,
    taiyin: 75,
    central: 65,
    jueyin: 60
  }
});

const savior = evaluateTransitionEngine({
  trauma_role: "savior",
  pain_topology: "posterior_neck_shoulder",
  orthostatic_symptoms: true,
  symptoms: ["tth", "neck_shoulder_pain"],
  axis_probability_scores: {
    taiyang: 80,
    shaoyin: 60
  }
});

const perpetrator = evaluateTransitionEngine({
  trauma_role: "perpetrator",
  visceral_sensitivity: "high",
  heat_signs: true,
  symptoms: ["metabolic_pain", "vascular_congestion", "bloating"],
  axis_probability_scores: {
    yangming: 82,
    taiyin: 45
  }
});

const taiyinHighest = evaluateTransitionEngine({
  visceral_sensitivity: "high",
  exertional_intolerance: true,
  symptoms: ["ibs"],
  axis_probability_scores: {
    taiyin: 80
  }
});

const shaoyinHighest = evaluateTransitionEngine({
  orthostatic_symptoms: true,
  emotional_survival_axis_features: "high",
  symptoms: ["palpitations"],
  axis_probability_scores: {
    shaoyin: 80
  }
});

const jueyinHighest = evaluateTransitionEngine({
  pelvic_autonomic_symptoms: true,
  neuropathic_descriptors: ["burning", "electric"],
  symptoms: ["crps", "pelvic_autonomic_pain"],
  axis_probability_scores: {
    jueyin: 85,
    shaoyang: 60
  }
});

const centralHighest = evaluateTransitionEngine({
  orthostatic_symptoms: true,
  emotional_survival_axis_features: "high",
  symptoms: ["fibromyalgia", "sensory_overload", "panic"],
  axis_probability_scores: {
    central: 88,
    shaoyin: 55
  }
});

const rejectCase = evaluateTransitionEngine({
  trauma_roles_treated_static: true,
  pain_syndromes_primary_keys: true
});

assert.equal(redFlag.stopped, true, "red flags should stop the integrative pathway");
assert.equal(redFlag.clinician.integrative_logic_applied, false, "red flag stop should avoid transition/terrain logic");

assert.equal(tth.tth.active, true, "TTH criteria should activate tth_static_tension");
assert(
  tth.medication_overuse.message.includes("Do not add further acute analgesics") || tth.medication_overuse.message.includes("avoid adding further acute analgesics"),
  "medication overuse should block further acute analgesic logic"
);
assert(
  tth.backend_only.formula_logic.length === 2,
  "TTH backend formula rules should be stored privately"
);
assert(
  !JSON.stringify(tth.patient).includes("Liu Wei") && !JSON.stringify(tth.patient).includes("Huang Lian"),
  "backend-only formulas must not appear in patient output"
);

assert.equal(victimSuppression.trauma_role.dynamic_enum, true, "trauma role must be dynamic enum");
assert.equal(victimSuppression.treatment_clusters.primary.cluster, "Interoceptive Regulation", "victim DO_NOT should suppress lateral decompression as primary");
assert(
  victimSuppression.treatment_clusters.suppressed.some((item) => item.cluster === "Lateral Autonomic Decompression"),
  "DO_NOT hierarchy should suppress blocked clusters"
);

assert.equal(savior.trauma_role.matched_pattern, "savior_pattern", "savior role should activate savior_pattern");
assert.equal(perpetrator.trauma_role.matched_pattern, "perpetrator_pattern", "perpetrator role should activate perpetrator_pattern");
assert.equal(jueyinHighest.transition_detection.primary_transition.transition, "Shaoyang -> Jueyin", "Jueyin/Shaoyang with pelvic neuropathic signs should detect severe transition");
assert.equal(centralHighest.expression_classifier.name, "Autonomic-Sensory Amplification", "central load should classify as amplification");
assert.equal(rejectCase.rejected, true, "unsafe static role or pain-primary design should be rejected");

const covered = new Set([
  ...ruleIds(redFlag),
  ...ruleIds(tth),
  ...ruleIds(victimSuppression),
  ...ruleIds(savior),
  ...ruleIds(perpetrator),
  ...ruleIds(taiyinHighest),
  ...ruleIds(shaoyinHighest),
  ...ruleIds(jueyinHighest),
  ...ruleIds(centralHighest),
  ...ruleIds(rejectCase)
]);
const expected = Array.from({ length: 23 }, (_, index) => `B15_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 15 rule coverage: ${missing.join(", ")}`);

console.log(`Transition engine tests passed: ${covered.size}/23 rules covered`);
