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

const giMigraineNeck = evaluateHeadache({
  headache_type: "gut_driven",
  pain_onset: "from_gut",
  gi_symptoms_present: true,
  sensory_features: ["nausea"],
  internal_audit: true
});

assert.equal(giMigraineNeck.migraine_phenotype.detected_phenotype, "gut_driven");
assert.equal(giMigraineNeck.gi_migraine_neck_axis.active, true);
assert.equal(giMigraineNeck.batch8_matching_pattern, "gut_jueyin_overload");
assert.ok(giMigraineNeck.rules_triggered_by_id.some((rule) => rule.id === "R001"));

const cervicogenic = evaluateHeadache({
  headache_type: "cervicogenic",
  pain_onset: "from_neck",
  laterality: "fixed_side",
  neck_movement_worsens: true,
  internal_audit: true
});

assert.equal(cervicogenic.migraine_phenotype.detected_phenotype, "cervicogenic");
assert.equal(cervicogenic.cervicogenic_protocol.active, true);
assert.ok(cervicogenic.rules_triggered_by_id.some((rule) => rule.id === "R003"));

const mixedJoint = evaluateHeadache({
  joint_heat_swelling: true,
  evening_worsening: true,
  internal_audit: true
});

assert.equal(mixedJoint.joint_phase_logic.phase, "inflammatory_edge");
assert.ok(mixedJoint.contraindications.includes("Collagen_phase_1"));
assert.ok(mixedJoint.rules_triggered_by_id.some((rule) => rule.id === "R005"));

const cgrpSupport = evaluateHeadache({
  cgrp_in_use: true,
  cgrp_side_effects: ["constipation", "quieter_not_better"],
  headache_type: "vascular",
  internal_audit: true
});

assert.equal(cgrpSupport.cgrp_support.active, true);
assert.equal(cgrpSupport.cgrp_support.flag, "cgrp_suppression_structural_deficit");
assert.ok(cgrpSupport.rules_triggered_by_id.some((rule) => rule.id === "R010"));

const medicationCapacity = evaluateHeadache({
  medication_status: "exhausted",
  effect_duration_shortening: true,
  new_gi_fatigue_brain_fog: true,
  internal_audit: true
});

assert.equal(medicationCapacity.medication_capacity.active, true);
assert.ok(medicationCapacity.rules_triggered_by_id.some((rule) => rule.id === "R014"));
assert.ok(medicationCapacity.rules_triggered_by_id.some((rule) => rule.id === "R015"));

const gingerSafety = evaluateHeadache({
  dry_component_in_formula: true,
  ginger_tea_prescribed: true,
  internal_audit: true
});

assert.ok(gingerSafety.contraindications.includes("Ginger_Pack_1"));
assert.ok(gingerSafety.rules_triggered_by_id.some((rule) => rule.id === "R004"));
assert.ok(gingerSafety.rules_triggered_by_id.some((rule) => rule.id === "R021"));

const tcaSupport = evaluateHeadache({
  tca_snri_in_use: true,
  internal_audit: true
});

assert.ok(tcaSupport.rules_triggered_by_id.some((rule) => rule.id === "R019"));

const offLabelAntipsychotic = evaluateHeadache({
  antipsychotic_pain_use: true,
  internal_audit: true
});

assert.ok(offLabelAntipsychotic.rules_triggered_by_id.some((rule) => rule.id === "R020"));

const neuropathyA = evaluateHeadache({
  pain_quality_neuropathy: ["burning"],
  pain_timing_neuropathy: ["worse_at_night"],
  sensory_functional_impact: ["touch_sensitivity"],
  current_medication_neuropathy: ["gabapentin"],
  medication_experience: "partial_breakthrough",
  internal_audit: true
});

assert.equal(neuropathyA.batch9_neuropathy.dominant_mode, "A_signal_overload");
assert.equal(neuropathyA.batch9_matched_patterns[0], "neuropathy_signal_overload_central_sensitization");
assert.ok(neuropathyA.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_001"));

const neuropathyAllModes = evaluateHeadache({
  pain_quality_neuropathy: ["burning", "numbness", "deep_aching"],
  pain_timing_neuropathy: ["worse_at_night"],
  sensory_functional_impact: ["touch_sensitivity", "muscle_weakness"],
  body_signals: ["cold_feet_hands", "swelling", "fatigue"],
  neuropathy_diagnosis: "chemotherapy_induced",
  energy_state: "very_low",
  internal_audit: true
});

assert.equal(neuropathyAllModes.batch9_neuropathy.all_three_present, true);
assert.ok(neuropathyAllModes.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_026"));

const jointRA = evaluateHeadache({
  joint_thermal_state: "hot_red_swollen",
  systemic_signs_joint: ["general_fatigue"],
  internal_audit: true
});

assert.equal(jointRA.batch9_joint_classifier.classifier, "RA_yang_joint_inflammatory");
assert.ok(jointRA.contraindications.includes("Collagen_into_active_inflammation"));
assert.ok(jointRA.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_009"));

const jointOA = evaluateHeadache({
  joint_thermal_state: "cold_stiff_empty",
  joint_response_to_treatment: "movement_improves",
  pain_timing: "load_only",
  internal_audit: true
});

assert.equal(jointOA.batch9_joint_classifier.classifier, "OA_yin_joint_degenerative");
assert.deepEqual(jointOA.batch9_joint_classifier.intervention_sequence, ["Collagen", "MyBlood", "ProCardiol"]);
assert.ok(jointOA.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_010"));

const pelvic = evaluateHeadache({
  pelvic_pain_present: true,
  adrenal_fatigue_signs: ["cold_lower_limbs", "mental_overdrive", "insomnia"],
  internal_audit: true
});

assert.equal(pelvic.batch9_pelvic_shaoyin.pattern, "pelvic_cold_heat_field_dissociation");
assert.equal(pelvic.batch9_pelvic_shaoyin.vertical_dissociation_status, "present");
assert.ok(pelvic.batch9_pelvic_shaoyin.shaoyin_sink_reboot_formula.composition.length === 11);
assert.ok(pelvic.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_014"));

const neurogenicClaudication = evaluateHeadache({
  claudication_type: "neurogenic",
  neurogenic_claudication_signs: ["improves_with_flexion", "bilateral_leg_symptoms"],
  MRI_structural_severity: "mild_stenosis_severe_symptoms",
  internal_audit: true
});

assert.equal(neurogenicClaudication.batch9_claudication.classifier, "neurogenic");
assert.equal(neurogenicClaudication.batch9_claudication.MRI_mismatch_status, "mild_imaging_severe_symptoms");
assert.ok(neurogenicClaudication.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_020"));

const vascularClaudication = evaluateHeadache({
  claudication_type: "vascular",
  vascular_claudication_signs: ["calf_thigh_buttock_cramping", "predictable_walking_distance", "resolves_quickly_with_rest"],
  internal_audit: true
});

assert.equal(vascularClaudication.batch9_claudication.classifier, "vascular");
assert.ok(vascularClaudication.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_023"));

const mechanicalBackPain = evaluateHeadache({
  NSMBP_features: ["imaging_mismatch", "post_acute_persistence", "shifting_pain", "emotional_overlay", "morning_stiffness_fascia"],
  internal_audit: true
});

assert.equal(mechanicalBackPain.batch9_mechanical_back_pain.pattern, "non_specific_mechanical_back_pain_du_meridian_stagnation");
assert.ok(mechanicalBackPain.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_024"));
assert.ok(mechanicalBackPain.batch9_rules_triggered_by_id.some((rule) => rule.id === "R_B2_025"));

const batch9RedFlag = evaluateHeadache({
  rapidly_progressive_weakness: true,
  pain_quality_neuropathy: ["burning"]
});

assert.equal(batch9RedFlag.stopped, true);
assert.deepEqual(batch9RedFlag.batch9_intervention_hierarchy, []);

console.log("Headache engine tests passed: 26/26");
