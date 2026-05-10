const assert = require("assert");
const {
  evaluateHeadacheTriAxialEngine,
  evaluateTrigeminalNeuralgiaModule,
  evaluateMetabolicRhythmModule,
  evaluateBatch17Modules
} = require("../lib/avicenna/headacheTriAxialEngine.cjs");

function hasRule(result, id) {
  return (result.triggered_rules || []).some((rule) => rule.id === id);
}

function assertBrandFree(result, label) {
  assert(!/DuoLife|MyGastrin|MyBlood|ProCardiol|ProSugar|Promigraine/i.test(JSON.stringify(result)), `${label} must be brand-free`);
}

const redFlag = evaluateHeadacheTriAxialEngine({
  thunderclap_headache: true,
  output_mode: "practitioner"
});
assert.equal(redFlag.stopped, true, "thunderclap should stop headache routing");
assert.equal(redFlag.integrative_pathway_applied, false, "red flags should block integrative pathway");

const aura = evaluateHeadacheTriAxialEngine({
  aura_present: true,
  visual_aura: true,
  throbbing: true,
  nausea_present: true,
  photophobia: true,
  output_mode: "practitioner"
});
assert.equal(aura.grid_state, "fragmented_grid", "aura should infer fragmented grid");
assert.equal(aura.aura_overlay.active, true, "aura overlay should activate");
assert.equal(aura.selected_node, "MIGRAINE_GB_TB", "aura should route through migraine/ShaoYang node");
assert(hasRule(aura, "B17_SHARED_002"), "aura rule should trigger");

const tac = evaluateHeadacheTriAxialEngine({
  autonomic_signs_present: true,
  tearing: true,
  rhinorrhea: true,
  strict_unilateral: true,
  periorbital_temporal: true,
  restlessness_agitation: true,
  oxygen_response: true,
  output_mode: "practitioner"
});
assert.equal(tac.selected_node, "YANGMING_ST_LI_TAC_TGN", "autonomic signs should route to YangMing TAC node");
assert.equal(tac.yangming_branch.branch, "cluster_headache_TAC_pathway", "oxygen/autonomic branch should classify as cluster-style TAC");
assert(hasRule(tac, "B17_SHARED_001"), "autonomic rule should trigger");

const tgnRoute = evaluateHeadacheTriAxialEngine({
  electric_shock_pain: true,
  brief_attacks: true,
  trigger_zones: true,
  trigeminal_distribution: "V2/V3",
  autonomic_signs_present: false,
  output_mode: "practitioner"
});
assert.equal(tgnRoute.tgn_cross_reference, true, "TGN-like pain should cross-reference dedicated module");
assert.equal(tgnRoute.yangming_branch.branch, "trigeminal_neuralgia_cross_reference", "TGN should not be treated as TAC without autonomic signs");

const tgnBlocked = evaluateTrigeminalNeuralgiaModule({
  electric_shock_pain: true,
  brief_attacks: true,
  trigger_zones: true,
  carbamazepine_current: true,
  carbamazepine_taper_requested: true,
  shaoyang_release_stable: false,
  yin_support_stable: false,
  pain_character: "sharp_electrical",
  formula_selected: "Huang_Lian_Jie_Du_Tang",
  laser_target: "direct_nerve_trunk",
  vitamin_D_supplementation: "high_dose",
  output_mode: "practitioner"
});
assert.equal(tgnBlocked.carbamazepine_safety.taper_status, "blocked_until_stabilisation", "carbamazepine taper should block until stabilised");
assert.equal(tgnBlocked.formula_logic.wu_wei_zi_required, true, "Wu Wei Zi should be required when EZ fragmentation is dominant");
assert(tgnBlocked.contraindications.some((item) => item.includes("Direct nerve burning")), "direct nerve laser should be forbidden");
assert(hasRule(tgnBlocked, "B17_TGN_001"), "long-term Huang Lian rule should trigger");
assert(hasRule(tgnBlocked, "B17_TGN_008"), "high-dose vitamin D caution should trigger");

const tgnEligible = evaluateTrigeminalNeuralgiaModule({
  electric_shock_pain: true,
  brief_attacks: true,
  trigger_zones: true,
  carbamazepine_current: true,
  carbamazepine_taper_requested: true,
  shaoyang_release_stable: true,
  yin_support_stable: true,
  nigella_selected: true,
  output_mode: "practitioner"
});
assert.equal(tgnEligible.carbamazepine_safety.taper_status, "eligible_for_clinician_supervised_slow_reduction");
assert.equal(tgnEligible.nigella_support.selected, true, "Nigella should be accepted as non-blocking anti-inflammatory support");

const metabolicExcluded = evaluateMetabolicRhythmModule({
  module_focus: "metabolic",
  structural_abdominal_wall_defect: true,
  output_mode: "practitioner"
});
assert.equal(metabolicExcluded.stopped, true, "abdominal wall defect should exclude metabolic rhythm module");

const metabolic = evaluateMetabolicRhythmModule({
  module_focus: "metabolic",
  age: 48,
  central_weight_gain: true,
  fatigue: true,
  low_back_stiffness: true,
  poor_sleep: true,
  concentration_decline: true,
  stress_dominance: true,
  early_insulin_resistance: true,
  lab_guided_addon_requested: true,
  lab_confirmation: false,
  positioning_language: "weight loss target",
  output_mode: "practitioner"
});
assert(metabolic.entry_score >= 75, "metabolic entry criteria should score strongly");
assert(metabolic.contraindications.some((item) => item.includes("Lab-guided add-ons are blocked")), "lab add-ons should be blocked without labs");
assert(metabolic.contraindications.some((item) => item.includes("Fat-loss")), "fat-loss language should be rejected");

const combined = evaluateBatch17Modules({
  module_focus: "auto",
  aura_present: true,
  age: 45,
  central_weight_gain: true,
  poor_sleep: true,
  output_mode: "patient"
});
assert(combined.headache_tri_axial, "combined output should include headache module");
assert(combined.metabolic_rhythm, "combined output should include metabolic module");
assert.equal(combined.key_principles, undefined, "patient mode should hide backend principles");

for (const [label, result] of Object.entries({ redFlag, aura, tac, tgnRoute, tgnBlocked, tgnEligible, metabolicExcluded, metabolic, combined })) {
  assertBrandFree(result, label);
}

console.log("Batch 17 tri-axial/TGN/metabolic tests passed");
