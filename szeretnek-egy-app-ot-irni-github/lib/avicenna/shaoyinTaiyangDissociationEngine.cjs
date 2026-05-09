const batch13Data = require("./data/engines/avicenna_engine_batch13.json");
const shaoyinTaiyangData = require("./data/engines/shaoyinTaiyangDissociationEngine.json");
const shaoyinSinkProtocols = require("./data/libraries/shaoyinSinkProtocols.batch13.json");
const taiyangShaoyinConcepts = require("./data/libraries/taiyangShaoyinConcepts.batch13.json");

const PATTERNS = batch13Data.patterns || [];
const RULES = shaoyinTaiyangData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const PATTERN_LABELS = {
  shaoyin_taiyang_dissociation: "Shaoyin-Taiyang dissociation pattern",
  jueyin_shaoyang_dissociation: "Jueyin-Shaoyang sliding-layer pattern",
  pericardial_lock_syndrome: "Chest closure / autonomic holding pattern"
};

const META_DIAGNOSES = [
  "IIH",
  "PRESS",
  "Chiari",
  "POTS",
  "fibromyalgia",
  "migraine",
  "CRPS",
  "post_COVID",
  "post_COVID_fatigue",
  "posterior_fossa_congestion",
  "frozen_shoulder",
  "spinal_degenerative",
  "skin_autoimmune",
  "autonomic"
];

const CORE_PHRASES = [
  "Restore Shaoyin Yin first; Taiyang tension discharges second.",
  "Do not target Taiyang directly as primary in deep Shaoyin collapse.",
  "HT -> SI -> BL -> KD is the critical switching pathway.",
  "Pericardial lock is a Shaoyin-Jueyin intersection freeze.",
  "Taiyang movers require safety gating.",
  "Bai Zhi is the Yin-sensitive Taiyang mover.",
  "Suan Zao Ren Tang is transitional sedation, not Shaoyin reboot.",
  "The posterior fossa is a Shaoyin-Taiyang transition node."
];

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function any(values, targets) {
  return targets.some((target) => values.includes(target));
}

function pattern(name) {
  return PATTERNS.find((item) => item.name === name) || {};
}

function rule(id, reason = "") {
  const item = RULE_BY_ID[id] || { id, condition: "", action: "" };
  return { id: item.id, condition: item.condition, action: item.action, reason };
}

function uniqueRules(rules) {
  const seen = new Set();
  return rules.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.symptom_clusters),
    ...list(input.screen_domains),
    ...list(input.chronic_manifestations)
  ];
  const requested = [
    ...list(input.requested_interventions),
    ...list(input.prescribed_herbs),
    ...list(input.formula_components)
  ];
  const patientSensitivity = input.patient_sensitivity || "unknown";
  const westernDiagnosis = input.western_diagnosis_group || "other";
  const skinEruption = input.skin_eruption || (any(symptoms, ["eczema", "psoriasis", "seborrhea", "urticaria"]) ? "surface_inflammation" : "none");

  return {
    shaoyin_freeze: bool(input.shaoyin_freeze),
    taiyang_expansion: bool(input.taiyang_expansion),
    pericardial_lock: bool(input.pericardial_lock),
    HT_Yin_weak: bool(input.HT_Yin_weak),
    KD_Yin_weak: bool(input.KD_Yin_weak),
    KD_Yang_weak: bool(input.KD_Yang_weak),
    Jing_deficient: bool(input.Jing_deficient),
    SI_overloaded: bool(input.SI_overloaded) || any(symptoms, ["sensory_hypersensitivity", "decision_difficulty", "frozen_shoulder"]),
    BL_congested: bool(input.BL_congested) || any(symptoms, ["posterior_fossa_congestion", "occipital_tension", "spinal_pain", "neck_shoulder_scapula_tension"]),
    heat_above: bool(input.heat_above) || any(symptoms, ["head_heat", "hot_head"]),
    cold_below: bool(input.cold_below) || any(symptoms, ["cold_feet", "cold_below"]),
    diastolic_dysfunction: bool(input.diastolic_dysfunction),
    posterior_fossa_congestion: bool(input.posterior_fossa_congestion) || westernDiagnosis === "posterior_fossa_congestion",
    blood_sludging: bool(input.blood_sludging),
    venous_stasis: bool(input.venous_stasis),
    ankle_oedema: bool(input.ankle_oedema) || any(symptoms, ["ankle_oedema", "heavy_watery_ankles"]),
    emotional_closure: bool(input.emotional_closure) || bool(input.emotional_trauma) || any(symptoms, ["emotional_closure", "emotional_blockage"]),
    emotional_trauma: bool(input.emotional_trauma),
    decision_difficulty: bool(input.decision_difficulty) || symptoms.includes("decision_difficulty"),
    insomnia_rumination: bool(input.insomnia_rumination) || any(symptoms, ["insomnia", "rumination_insomnia"]),
    sensory_hypersensitivity: bool(input.sensory_hypersensitivity) || symptoms.includes("sensory_hypersensitivity"),
    frozen_shoulder: bool(input.frozen_shoulder) || westernDiagnosis === "frozen_shoulder",
    occipital_tension: bool(input.occipital_tension) || symptoms.includes("occipital_tension"),
    eye_fatigue: bool(input.eye_fatigue) || symptoms.includes("eye_fatigue"),
    tinnitus: bool(input.tinnitus) || symptoms.includes("tinnitus"),
    dizziness: bool(input.dizziness) || symptoms.includes("dizziness"),
    chest_tightness: bool(input.chest_tightness) || symptoms.includes("chest_tightness"),
    palpitations: bool(input.palpitations) || symptoms.includes("palpitations"),
    oliguria: bool(input.oliguria) || bool(input.low_urinary_output) || symptoms.includes("oliguria"),
    cold_feet: bool(input.cold_feet) || bool(input.cold_below) || symptoms.includes("cold_feet"),
    neck_shoulder_scapula_tension: bool(input.neck_shoulder_scapula_tension) || symptoms.includes("neck_shoulder_scapula_tension"),
    spinal_pain: bool(input.spinal_pain) || westernDiagnosis === "spinal_degenerative" || symptoms.includes("spinal_pain"),
    low_back_pain: bool(input.low_back_pain) || symptoms.includes("low_back_pain"),
    skin_eruption: skinEruption,
    heart_heat: bool(input.heart_heat),
    tongue_red_tip: bool(input.tongue_red_tip),
    urinary_complaint: bool(input.urinary_complaint),
    urinary_obstruction: bool(input.urinary_obstruction) || bool(input.urinary_complaint) || bool(input.oliguria),
    sterile_haematuria: bool(input.sterile_haematuria) || bool(input.steril_haematuria),
    urethral_discomfort: bool(input.urethral_discomfort),
    thirst: bool(input.thirst),
    irritability: bool(input.irritability) || symptoms.includes("irritability"),
    lower_abdominal_heat: bool(input.lower_abdominal_heat),
    patient_sex: input.patient_sex || "other",
    patient_sensitivity: patientSensitivity,
    taiyang_layer_state: input.taiyang_layer_state || "mixed",
    qi_relay_blocked_at: input.qi_relay_blocked_at || "none",
    EZ_state: input.EZ_state || "not_assessed",
    western_diagnosis_group: westernDiagnosis,
    frailty: bool(input.frailty),
    severe_yin_deficient: bool(input.severe_yin_deficient),
    du_huo_prescribed: bool(input.du_huo_prescribed) || requested.includes("du_huo"),
    qiang_huo_prescribed: bool(input.qiang_huo_prescribed) || requested.includes("qiang_huo"),
    taiyang_opening_needed: bool(input.taiyang_opening_needed),
    bai_zhi_selected: bool(input.bai_zhi_selected) || requested.includes("bai_zhi"),
    suan_zao_ren_tang_primary: bool(input.suan_zao_ren_tang_primary) || requested.includes("suan_zao_ren_tang"),
    sacrum_treatment: bool(input.sacrum_treatment),
    occiput_release: bool(input.occiput_release),
    posterior_fascia_release: bool(input.posterior_fascia_release),
    obese_oedematous_archetype: bool(input.obese_oedematous_archetype),
    adrenal_fatigue: bool(input.adrenal_fatigue) || symptoms.includes("adrenal_fatigue"),
    headache: bool(input.headache) || westernDiagnosis === "migraine" || symptoms.includes("headache"),
    screen_domains: symptoms,
    debugMode: bool(input.debugMode)
  };
}

function scoreDomains(input) {
  const domains = [
    {
      id: "head_heat_occipital_eye",
      label: "Head heat / occipital pressure / eye fatigue",
      positive: input.heat_above || input.occipital_tension || input.posterior_fossa_congestion || input.eye_fatigue || input.tinnitus || input.dizziness
    },
    {
      id: "chest_closure_sleep",
      label: "Chest closure / palpitations / rumination insomnia",
      positive: input.chest_tightness || input.emotional_closure || input.palpitations || input.insomnia_rumination || input.pericardial_lock
    },
    {
      id: "urinary_oedema_cold_feet",
      label: "Oliguria / ankle oedema / cold feet",
      positive: input.oliguria || input.ankle_oedema || input.cold_feet || input.cold_below
    },
    {
      id: "emotional_overload_hypersensitivity",
      label: "Emotional overload / decision difficulty / hypersensitivity",
      positive: input.irritability || input.sensory_hypersensitivity || input.decision_difficulty || input.emotional_closure
    },
    {
      id: "neck_shoulder_scapula",
      label: "Neck-shoulder-scapula tension",
      positive: input.neck_shoulder_scapula_tension || input.frozen_shoulder || input.occipital_tension
    },
    {
      id: "low_back_spine",
      label: "Low back / spine pain",
      positive: input.low_back_pain || input.spinal_pain || input.BL_congested
    }
  ];
  return {
    domains,
    positive_count: domains.filter((domain) => domain.positive).length,
    confirmed: domains.filter((domain) => domain.positive).length >= 4,
    output: domains.filter((domain) => domain.positive).length >= 4
      ? "Complete Taiyang-Shaoyin dissociation pattern likely."
      : "Shaoyin-Taiyang screen not fully positive from current inputs."
  };
}

function calculateScores(input, screen) {
  let shaoyin = 0;
  let taiyang = 0;
  let pericardial = 0;
  let jueyinShaoyang = 0;
  const evidence = [];

  function add(axis, points, reason) {
    if (axis === "shaoyin") shaoyin += points;
    if (axis === "taiyang") taiyang += points;
    if (axis === "pericardial") pericardial += points;
    if (axis === "jueyin_shaoyang") jueyinShaoyang += points;
    evidence.push({ axis, points, reason });
  }

  if (input.shaoyin_freeze) add("shaoyin", 3, "explicit Shaoyin freeze");
  if (input.HT_Yin_weak) add("shaoyin", 2, "HT Yin weak");
  if (input.KD_Yin_weak || input.KD_Yang_weak || input.Jing_deficient) add("shaoyin", 2, "KD/Jing weakness");
  if (input.cold_below || input.cold_feet || input.ankle_oedema || input.oliguria) add("shaoyin", 2, "lower sink weakness");
  if (input.insomnia_rumination || input.palpitations) add("shaoyin", 1, "HT-KD sleep/rhythm signal");

  if (input.taiyang_expansion) add("taiyang", 3, "explicit Taiyang expansion");
  if (input.SI_overloaded || input.sensory_hypersensitivity || input.decision_difficulty) add("taiyang", 2, "SI overload");
  if (input.BL_congested || input.occipital_tension || input.posterior_fossa_congestion || input.spinal_pain) add("taiyang", 3, "BL/posterior congestion");
  if (input.heat_above || input.frozen_shoulder || input.skin_eruption !== "none") add("taiyang", 2, "surface expansion/heat signal");
  if (input.venous_stasis || input.blood_sludging) add("taiyang", 1, "venous stasis/sludging");

  if (input.pericardial_lock || input.chest_tightness || input.emotional_closure) add("pericardial", 3, "chest closure / autonomic holding");
  if (input.palpitations || input.insomnia_rumination || input.diastolic_dysfunction) add("pericardial", 2, "palpitations, insomnia, or diastolic rigidity");
  if (input.emotional_trauma) add("pericardial", 1, "prolonged emotional stress context");

  if (input.diastolic_dysfunction) add("jueyin_shaoyang", 3, "early diastolic dysfunction");
  if (input.heat_above && input.cold_below) add("jueyin_shaoyang", 2, "heat above / cold below");
  if (input.ankle_oedema || input.fatigue_dominant || input.adrenal_fatigue) add("jueyin_shaoyang", 1, "oedema/fatigue pressure");
  if (input.emotional_closure || input.sensory_hypersensitivity) add("jueyin_shaoyang", 1, "sliding-layer emotional/sensory load");

  if (screen.confirmed) {
    add("shaoyin", 3, "30-second screen positive");
    add("taiyang", 3, "30-second screen positive");
  }

  return {
    shaoyin_freeze_score: Math.min(10, shaoyin),
    taiyang_expansion_score: Math.min(10, taiyang),
    pericardial_lock_score: Math.min(10, pericardial),
    jueyin_shaoyang_score: Math.min(10, jueyinShaoyang),
    evidence
  };
}

function inferRelayBlock(input) {
  if (input.qi_relay_blocked_at && input.qi_relay_blocked_at !== "none") return input.qi_relay_blocked_at;
  const blocks = [];
  if (input.HT_Yin_weak || input.SI_overloaded || input.sensory_hypersensitivity) blocks.push("HT_SI");
  if (input.SI_overloaded && input.BL_congested) blocks.push("SI_BL");
  if ((input.BL_congested || input.ankle_oedema) && (input.KD_Yin_weak || input.KD_Yang_weak || input.cold_below)) blocks.push("BL_KD");
  if ((input.KD_Yin_weak || input.KD_Yang_weak) && (input.pericardial_lock || input.chest_tightness)) blocks.push("KD_PC");
  if (blocks.length > 1) return "multiple";
  return blocks[0] || "none";
}

function safetyGates(input) {
  const contraindications = [];
  const substitutions = [];
  const allowed = [];
  const taiyangMoverRequested = input.du_huo_prescribed || input.qiang_huo_prescribed;
  const yinSensitive = ["Yin_deficient", "cold_weak"].includes(input.patient_sensitivity) || input.severe_yin_deficient || input.frailty;
  const sensitiveFemale = input.patient_sex === "female" && input.patient_sensitivity !== "robust";

  if (taiyangMoverRequested && yinSensitive) {
    contraindications.push("Du Huo / Qiang Huo contraindicated in Yin-deficient, cold-weak, or severely frail presentation.");
  }
  if (taiyangMoverRequested && sensitiveFemale) {
    contraindications.push("Du Huo / Qiang Huo contraindicated in sensitive female presentation; use Bai Zhi if Taiyang opening is genuinely needed.");
  }
  if (input.taiyang_opening_needed && yinSensitive) {
    substitutions.push("Use Bai Zhi instead of Du Huo / Qiang Huo for Yin-sensitive Taiyang opening.");
  }
  if (input.taiyang_layer_state === "full_tense" && !yinSensitive && !sensitiveFemale && input.patient_sensitivity === "robust") {
    allowed.push("Du Huo optional only at 2-3g in robust full-tense Taiyang presentation; not a system initiator.");
  }
  if (input.qiang_huo_prescribed) {
    allowed.push("Qiang Huo is more pungent/moving than Du Huo and requires greater caution.");
  }
  return { contraindications, substitutions, allowed };
}

function treitzStatus(input) {
  const active = input.heart_heat && input.urinary_obstruction && input.tongue_red_tip;
  const supportiveSigns = [
    input.sterile_haematuria,
    input.urethral_discomfort,
    input.heat_above && input.cold_below,
    input.palpitations && input.thirst && input.irritability
  ].filter(Boolean).length;
  const contraindicated = !input.heart_heat || input.patient_sensitivity === "cold_weak" || (!input.urinary_complaint && !input.urinary_obstruction) || !input.lower_abdominal_heat && !supportiveSigns;
  return {
    active: active || (input.heart_heat && input.urinary_obstruction && supportiveSigns > 0),
    contraindicated,
    herbs: ["Deng Xin Cao", "Dan Zhu Ye"],
    reason: active ? "heart heat + urinary obstruction + red tongue tip" : supportiveSigns ? "partial Treitz-Heart-SJ pattern" : "criteria not met"
  };
}

function primaryPattern(input, scores, screen) {
  if (scores.pericardial_lock_score >= 5) return "pericardial_lock_syndrome";
  if (scores.jueyin_shaoyang_score >= 5 && scores.shaoyin_freeze_score < 7) return "jueyin_shaoyang_dissociation";
  if (screen.confirmed || scores.shaoyin_freeze_score >= 5 && scores.taiyang_expansion_score >= 5) return "shaoyin_taiyang_dissociation";
  if (META_DIAGNOSES.includes(input.western_diagnosis_group) && scores.shaoyin_freeze_score + scores.taiyang_expansion_score >= 6) return "shaoyin_taiyang_dissociation";
  if (scores.jueyin_shaoyang_score >= 4) return "jueyin_shaoyang_dissociation";
  if (scores.pericardial_lock_score >= 4) return "pericardial_lock_syndrome";
  return "";
}

function evaluateShaoyinTaiyang(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const screen = scoreDomains(input);
  const scores = calculateScores(input, screen);
  const relayBlock = inferRelayBlock(input);
  const primary = primaryPattern(input, scores, screen);
  const triggered = [];

  if (input.heat_above && input.cold_below && input.emotional_closure) triggered.push(rule("B13_R001", "heat above + cold below + chest/emotional closure"));
  if (primary === "shaoyin_taiyang_dissociation") triggered.push(rule("B13_R002", "Shaoyin-Taiyang meta-pattern active"));
  if (input.diastolic_dysfunction || input.chest_tightness || input.emotional_closure || input.pericardial_lock) triggered.push(rule("B13_R003", "HT/PC closure signal"));
  if (input.BL_congested || input.posterior_fossa_congestion || input.occipital_tension || input.spinal_pain) triggered.push(rule("B13_R004", "BL/posterior congestion"));
  if ((input.KD_Yin_weak || input.KD_Yang_weak || input.ankle_oedema || input.cold_below) && (input.BL_congested || input.taiyang_expansion)) triggered.push(rule("B13_R005", "KD weakness with BL discharge failure"));
  if (input.SI_overloaded || input.sensory_hypersensitivity || input.decision_difficulty || input.frozen_shoulder) triggered.push(rule("B13_R006", "SI overload"));
  if (META_DIAGNOSES.includes(input.western_diagnosis_group)) triggered.push(rule("B13_R007", `western group ${input.western_diagnosis_group}`));
  if ((input.du_huo_prescribed || input.qiang_huo_prescribed) && ["Yin_deficient", "cold_weak"].includes(input.patient_sensitivity)) triggered.push(rule("B13_R008", "Taiyang mover requested with Yin/cold weakness"));
  if ((input.du_huo_prescribed || input.qiang_huo_prescribed) && input.patient_sex === "female" && input.patient_sensitivity !== "robust") triggered.push(rule("B13_R009", "Taiyang mover requested in sensitive female presentation"));
  if (input.taiyang_layer_state === "full_tense" && input.patient_sensitivity === "robust") triggered.push(rule("B13_R010", "full tense Taiyang layer in robust patient"));
  if (input.taiyang_opening_needed && ["Yin_deficient", "cold_weak"].includes(input.patient_sensitivity)) triggered.push(rule("B13_R011", "Taiyang opening needed with Yin sensitivity"));
  if (input.heart_heat && input.urinary_obstruction && input.tongue_red_tip) triggered.push(rule("B13_R012", "Treitz-Heart-SJ criteria met"));
  if (!input.heart_heat || input.patient_sensitivity === "cold_weak") triggered.push(rule("B13_R013", "Treitz module contraindication criteria"));
  if (input.suan_zao_ren_tang_primary) triggered.push(rule("B13_R014", "Suan Zao Ren Tang used as primary"));
  if (input.sacrum_treatment || input.occiput_release || input.posterior_fascia_release) triggered.push(rule("B13_R015", "craniosacral continuity input"));
  if (input.obese_oedematous_archetype || (input.patient_sex === "female" && input.ankle_oedema && input.adrenal_fatigue && input.headache && input.cold_below)) triggered.push(rule("B13_R016", "modern Jueyin-Shaoyang archetype"));
  if (input.ankle_oedema && input.adrenal_fatigue || input.ankle_oedema && input.KD_Yang_weak) triggered.push(rule("B13_R017", "ankle oedema with fatigue/KD weakness"));
  if (input.skin_eruption && input.skin_eruption !== "none") triggered.push(rule("B13_R018", "skin eruption / surface inflammation"));
  if (input.EZ_state === "fragmented" && primary === "shaoyin_taiyang_dissociation") triggered.push(rule("B13_R019", "fragmented EZ with Shaoyin-Taiyang pattern"));
  if (screen.confirmed) triggered.push(rule("B13_R020", `${screen.positive_count}/6 30-second screen domains positive`));
  if (input.frailty || input.severe_yin_deficient) triggered.push(rule("B13_R021", "frailty or severe Yin deficiency"));

  const safety = safetyGates(input);
  const treitz = treitzStatus(input);
  const matchedPatterns = [primary].filter(Boolean);
  if (scores.jueyin_shaoyang_score >= 4 && primary !== "jueyin_shaoyang_dissociation") matchedPatterns.push("jueyin_shaoyang_dissociation");
  if (scores.pericardial_lock_score >= 4 && primary !== "pericardial_lock_syndrome") matchedPatterns.push("pericardial_lock_syndrome");
  const metaPositive = primary === "shaoyin_taiyang_dissociation" || screen.confirmed;
  const posteriorFossaActive = input.posterior_fossa_congestion || input.occipital_tension || ["IIH", "PRESS", "Chiari", "posterior_fossa_congestion"].includes(input.western_diagnosis_group);
  const formula = shaoyinSinkProtocols.shaoyin_sink_reentry_formula;
  const posteriorProtocol = shaoyinSinkProtocols.posterior_fossa_field_node_protocol;

  return {
    engine: "shaoyin_taiyang_dissociation",
    name: "Shaoyin-Taiyang Dissociation Engine",
    subtitle: "Inner Freeze / Outer Expansion Model",
    source: ["avicenna_engine_batch13.json", "shaoyinTaiyangDissociationEngine.json"],
    active: Boolean(primary),
    meta_pattern_positive: metaPositive,
    primary_pattern: primary,
    primary_pattern_label: PATTERN_LABELS[primary] || "Unclear Shaoyin-Taiyang meta-pattern",
    matched_patterns: [...new Set(matchedPatterns)],
    clinical_30_second_screen: screen,
    shaoyin_freeze_score: scores.shaoyin_freeze_score,
    taiyang_expansion_score: scores.taiyang_expansion_score,
    pericardial_lock_score: scores.pericardial_lock_score,
    jueyin_shaoyang_score: scores.jueyin_shaoyang_score,
    score_evidence: scores.evidence,
    relay_map: taiyangShaoyinConcepts.qi_relay_map,
    relay_block: relayBlock,
    posterior_fossa_field_node_status: {
      active: posteriorFossaActive,
      protocol: posteriorProtocol
    },
    skin_surface_status: {
      active: input.skin_eruption !== "none",
      interpretation: input.skin_eruption !== "none" ? "possible Taiyang field decompression attempt in this model" : "not active"
    },
    taiyang_mover_safety: safety,
    treitz_heart_sj_module: treitz,
    suan_zao_ren_tang_status: input.suan_zao_ren_tang_primary
      ? "Flagged as transitional sedation only, not full Shaoyin reboot."
      : "not selected as primary",
    shaoyin_sink_reboot_protocol: shaoyinSinkProtocols.shaoyin_sink_reboot_protocol,
    shaoyin_sink_reentry_formula: formula,
    device_acupuncture_map: shaoyinSinkProtocols.device_acupuncture_map,
    triggered_rules: uniqueRules(triggered),
    contraindications: [...new Set([...safety.contraindications, ...(treitz.contraindicated ? ["Do not add Deng Xin Cao + Dan Zhu Ye unless Treitz-Heart-SJ criteria are present."] : [])])],
    suggested_sequence: [
      metaPositive ? "Restore Shaoyin Yin first; Taiyang tension discharges second." : "If the screen becomes positive, treat this as a meta-pattern before isolated diagnosis logic.",
      primary === "pericardial_lock_syndrome" ? "Chest closure / autonomic holding: Jueyin gate opening and pericardium decompression first." : "",
      primary === "jueyin_shaoyang_dissociation" ? "Jueyin-Shaoyang layer: harmonise depth and rhythm discharge before surface movement." : "",
      posteriorFossaActive ? "Posterior fossa field node: Shaoyang-Jueyin harmonisation, water-structure rebuilding, then venous/lymphatic drainage stimulation." : "",
      input.skin_eruption !== "none" ? "Skin expression: assess Shaoyin sink plus Taiyang discharge balance before only local suppression." : ""
    ].filter(Boolean),
    cross_batch_links: shaoyinTaiyangData.cross_batch_links || [],
    concepts: taiyangShaoyinConcepts,
    core_phrases: CORE_PHRASES,
    patient: {
      title: PATTERN_LABELS[primary] || "Shaoyin-Taiyang meta-pattern screen",
      summary: metaPositive
        ? "This may reflect a shared inner-support and outer-tension pattern in this model. Downstream labels may be manifestations of the same regulation problem, not separate roots. This is an educational pattern-recognition tool, not a medical diagnosis."
        : "The Shaoyin-Taiyang meta-pattern screen is not strongly positive from the current inputs. This is an educational pattern-recognition tool, not a medical diagnosis.",
      screen_result: screen.output,
      support_language: [
        "Restore inward regulation before pushing surface discharge.",
        "Reduce outer tension gradually.",
        "Support sleep and recovery rhythm."
      ],
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "This field model should not replace conventional medical care.",
        "Herb, medication, or device changes must be discussed with a clinician."
      ]
    },
    clinician: {
      shaoyin_freeze_score: scores.shaoyin_freeze_score,
      taiyang_expansion_score: scores.taiyang_expansion_score,
      pericardial_lock_status: scores.pericardial_lock_score >= 4,
      pericardial_lock_score: scores.pericardial_lock_score,
      jueyin_shaoyang_score: scores.jueyin_shaoyang_score,
      relay_block: relayBlock,
      posterior_fossa_field_node_status: {
        active: posteriorFossaActive,
        protocol: posteriorProtocol
      },
      skin_surface_status: {
        active: input.skin_eruption !== "none",
        type: input.skin_eruption
      },
      triggered_rules: uniqueRules(triggered),
      taiyang_mover_safety: safety,
      treitz_heart_sj_module: treitz,
      shaoyin_sink_reentry_formula: formula,
      shaoyin_sink_reboot_protocol: shaoyinSinkProtocols.shaoyin_sink_reboot_protocol,
      device_acupuncture_map: shaoyinSinkProtocols.device_acupuncture_map,
      concepts: taiyangShaoyinConcepts,
      primary_pattern_data: pattern(primary)
    }
  };
}

module.exports = {
  evaluateShaoyinTaiyang,
  batch13Data,
  shaoyinTaiyangData,
  shaoyinSinkProtocols,
  taiyangShaoyinConcepts
};
