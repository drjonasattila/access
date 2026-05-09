const assert = require("assert");
const { evaluatePostSurgicalIntegration } = require("../lib/avicenna/postSurgicalIntegrationEngine.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

const cases = [
  evaluatePostSurgicalIntegration({
    fever: true,
    wound_healing_status: "healed",
    pain_timeline: "3 months",
    transition_sensitivity: true,
    guarding_present: true
  }),
  evaluatePostSurgicalIntegration({
    wound_healing_status: "healed",
    pain_timeline: "8 weeks",
    pain_character: ["burning", "oscillating"],
    transition_sensitivity: true,
    guarding_present: true,
    phase_current: "1",
    ginger_requested: true,
    dry_component_confirmed: true,
    phase_1_complete: true,
    pain_partially_resolved: true,
    phase_2_complete: true,
    guarding_reduced: true
  }),
  evaluatePostSurgicalIntegration({
    pes_planus: true,
    ligament_instability: true,
    headache_type: "migraine",
    Qi_collapse: true,
    summus_selected: true,
    adaptivity_intact: true
  }),
  evaluatePostSurgicalIntegration({
    pes_planus: true,
    heat_sensation: true,
    dryness: true,
    adaptivity_intact: true
  }),
  evaluatePostSurgicalIntegration({
    pes_planus: true,
    stagnation_level: "strong",
    cold_dominance: true,
    digestive_weakness_dominant: true,
    frailty: true,
    digestive_sensitivity: true
  }),
  evaluatePostSurgicalIntegration({
    headache_type: "acute_structural"
  }),
  evaluatePostSurgicalIntegration({
    device_selected: ["THZ_cell_activator"],
    system_rigidity: "severe"
  })
];

assert.equal(cases[0].stopped, true, "red flags should stop the engine");
assert.deepEqual(ruleIds(cases[0]), ["B11_R002"], "red flag stop should only emit safety stop rule");
assert.equal(cases[0].patient.sequence.length, 0, "red flag stop should not emit sequencing");

assert.equal(cases[1].primary_pattern, "shaoyang_gate_dysfunction");
assert.equal(cases[1].detected_phase_name, "calm_the_gate");

assert.equal(cases[2].primary_pattern, "kd_sp_holding_field_deficiency");
assert.equal(cases[2].root_priority, "KD-SP holding field before Shaoyang overload");
assert(
  cases[2].suggested_sequence.some((item) => item.includes("KD1-3 + SP4-6 + plantar zones")),
  "compensatory Shaoyang overload should not be treated first"
);

assert(
  cases[4].contraindications.some((item) => item.includes("Liu Wei Di Huang Wan")),
  "Liu Wei Di Huang Wan contraindications should be surfaced"
);

const covered = new Set(cases.flatMap(ruleIds));
const expected = Array.from({ length: 20 }, (_, index) => `B11_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 11 rule coverage: ${missing.join(", ")}`);

console.log(`Post-surgical integration engine tests passed: ${covered.size}/20 rules covered`);
