const assert = require("assert");
const { evaluateShaoyinTaiyang } = require("../lib/avicenna/shaoyinTaiyangDissociationEngine.cjs");

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

const cases = [
  evaluateShaoyinTaiyang({
    heat_above: true,
    cold_below: true,
    emotional_closure: true,
    occipital_tension: true,
    ankle_oedema: true,
    neck_shoulder_scapula_tension: true,
    spinal_pain: true,
    western_diagnosis_group: "migraine",
    EZ_state: "fragmented"
  }),
  evaluateShaoyinTaiyang({
    chest_tightness: true,
    palpitations: true,
    insomnia_rumination: true,
    diastolic_dysfunction: true
  }),
  evaluateShaoyinTaiyang({
    diastolic_dysfunction: true,
    heat_above: true,
    cold_below: true,
    ankle_oedema: true,
    adrenal_fatigue: true,
    sensory_hypersensitivity: true
  }),
  evaluateShaoyinTaiyang({
    KD_Yin_weak: true,
    BL_congested: true,
    taiyang_expansion: true
  }),
  evaluateShaoyinTaiyang({
    SI_overloaded: true,
    sensory_hypersensitivity: true,
    decision_difficulty: true,
    frozen_shoulder: true
  }),
  evaluateShaoyinTaiyang({
    du_huo_prescribed: true,
    qiang_huo_prescribed: true,
    patient_sensitivity: "Yin_deficient",
    patient_sex: "female"
  }),
  evaluateShaoyinTaiyang({
    taiyang_layer_state: "full_tense",
    patient_sensitivity: "robust"
  }),
  evaluateShaoyinTaiyang({
    taiyang_opening_needed: true,
    patient_sensitivity: "cold_weak"
  }),
  evaluateShaoyinTaiyang({
    heart_heat: true,
    urinary_obstruction: true,
    tongue_red_tip: true,
    lower_abdominal_heat: true
  }),
  evaluateShaoyinTaiyang({
    suan_zao_ren_tang_primary: true
  }),
  evaluateShaoyinTaiyang({
    sacrum_treatment: true,
    occiput_release: true,
    posterior_fascia_release: true
  }),
  evaluateShaoyinTaiyang({
    patient_sex: "female",
    ankle_oedema: true,
    adrenal_fatigue: true,
    headache: true,
    cold_below: true
  }),
  evaluateShaoyinTaiyang({
    skin_eruption: "eczema"
  }),
  evaluateShaoyinTaiyang({
    frailty: true,
    severe_yin_deficient: true
  })
];

assert.equal(cases[0].meta_pattern_positive, true, "4+ screen domains should confirm meta-pattern");
assert.equal(cases[0].primary_pattern, "shaoyin_taiyang_dissociation");
assert.equal(cases[0].clinical_30_second_screen.positive_count >= 4, true);
assert(
  cases[5].contraindications.some((item) => item.includes("Du Huo / Qiang Huo contraindicated")),
  "Taiyang movers should be safety-gated"
);
assert(
  cases[7].taiyang_mover_safety.substitutions.some((item) => item.includes("Bai Zhi")),
  "Bai Zhi should be the Yin-sensitive Taiyang mover"
);
assert.equal(cases[8].treitz_heart_sj_module.active, true, "Treitz module should activate only when criteria are present");
assert(
  cases[9].suan_zao_ren_tang_status.includes("transitional sedation"),
  "Suan Zao Ren Tang should be transitional sedation only"
);

const covered = new Set(cases.flatMap(ruleIds));
const expected = Array.from({ length: 21 }, (_, index) => `B13_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 13 rule coverage: ${missing.join(", ")}`);

console.log(`Shaoyin-Taiyang engine tests passed: ${covered.size}/21 rules covered`);
