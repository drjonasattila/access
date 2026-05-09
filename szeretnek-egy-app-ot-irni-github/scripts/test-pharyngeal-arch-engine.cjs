const assert = require("node:assert/strict");
const { evaluatePharyngealArch } = require("../lib/avicenna/pharyngealArchEngine.cjs");

function ids(result) {
  return result.triggered_rule_ids.map((rule) => rule.id);
}

const arch1 = evaluatePharyngealArch({
  pain_location_cranial: ["temporal", "facial"],
  neck_pain_present: true,
  trigeminal_neuralgia: true,
  visceral_trigger_cranial: ["reflux_hiatus"]
});

assert.equal(arch1.primary_pattern, "arch_I_trigeminus_shaoyang_gate");
assert.ok(ids(arch1).includes("R_B3_001"));
assert.ok(ids(arch1).includes("R_B3_002"));

const arch2 = evaluatePharyngealArch({
  pain_location_cranial: ["facial", "retroauricular"],
  bell_palsy_features: true,
  visceral_trigger_cranial: ["IBS"],
  autonomic_signs_cranial: ["lacrimation_mismatch"]
});

assert.equal(arch2.primary_pattern, "arch_II_facialis_shaoyin_autonomic_buffer");
assert.ok(ids(arch2).includes("R_B3_003"));
assert.ok(ids(arch2).includes("R_B3_012"));

const arch3 = evaluatePharyngealArch({
  pain_location_cranial: ["occipital", "throat_radiating"],
  autonomic_signs_cranial: ["BP_fluctuation_with_headache"],
  glossopharyngeal_neuralgia: true
});

assert.equal(arch3.primary_pattern, "arch_III_glossopharyngeus_ren_mai_block");
assert.ok(ids(arch3).includes("R_B3_004"));

const arch46 = evaluatePharyngealArch({
  pain_location_cranial: ["chest_concurrent"],
  cranial_symptoms: ["dizziness"],
  autonomic_signs_cranial: ["POTS_features", "arrhythmia"]
});

assert.equal(arch46.primary_pattern, "arch_IV_VI_vagus_cardio_aortic_jueyin_ren");
assert.ok(ids(arch46).includes("R_B3_005"));

const thyroid = evaluatePharyngealArch({
  thyroid_dysfunction_present: true,
  thyroid_co_patterns: ["TMJ_concurrent", "neck_fascia_tension", "globus"],
  hashimoto_present: true
});

assert.equal(thyroid.primary_pattern, "thyroid_ventral_field_node_disharmony");
assert.ok(ids(thyroid).includes("R_B3_006"));
assert.ok(ids(thyroid).includes("R_B3_015"));

const postSurgical = evaluatePharyngealArch({
  post_surgical_history: ["sternotomy"],
  pain_location_cranial: ["occipital"],
  cranial_symptoms: ["anxiety"],
  autonomic_signs_cranial: ["palpitations"],
  thyroid_co_patterns: ["globus"]
});

assert.equal(postSurgical.primary_pattern, "post_thoracotomy_sternotomy_cranial_ascent");
assert.ok(ids(postSurgical).includes("R_B3_007"));

const crps = evaluatePharyngealArch({
  CRPS_arm_present: true,
  stellate_block_effective: true,
  laser_available: true,
  laser_wavelength_available: ["808nm", "980nm"]
});

assert.equal(crps.primary_pattern, "CRPS_arm_cardiopulmonary_field_inversion");
assert.ok(ids(crps).includes("R_B3_008"));
assert.ok(ids(crps).includes("R_B3_011"));
assert.ok(ids(crps).includes("R_B3_014"));
assert.ok(crps.four_gate_laser_stellate_protocol.gates.length === 4);

const scm = evaluatePharyngealArch({
  SCM_trigger_present: true,
  cranial_symptoms: ["migraine"],
  visceral_trigger_cranial: ["palpitations", "reflux_hiatus"]
});

assert.equal(scm.primary_pattern, "craniofacial_visceral_distortion_myofascial_embryonic");
assert.ok(ids(scm).includes("R_B3_009"));

const fieldSign = evaluatePharyngealArch({
  symptom_modulated_by_posture_breath_emotion: true,
  dominant_arch_module: "ARCH_4_6_CN_X"
});

assert.ok(ids(fieldSign).includes("R_B3_010"));

const swallowingMediastinal = evaluatePharyngealArch({
  pain_location_cranial: ["throat_radiating", "chest_concurrent"],
  cranial_symptoms: ["swallowing_pain", "mediastinal_pressure", "headache"]
});

assert.ok(ids(swallowingMediastinal).includes("R_B3_013"));
assert.equal(swallowingMediastinal.primary_pattern, "arch_IV_VI_vagus_cardio_aortic_jueyin_ren");

assert.equal(crps.cranial_nerve_pain_module_map.length, 12);
assert.equal(crps.gate_organ_library.length, 5);
assert.ok(crps.merged_herb_library.length >= crps.herb_library_batch10.length);

console.log("Pharyngeal arch engine tests passed: 15/15 rules covered");
