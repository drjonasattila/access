const batch10Data = require("./data/engines/avicenna_engine_batch10.json");
const pharyngealArchData = require("./data/engines/pharyngealArchEngine.json");
const cranialNervePainMap = require("./data/libraries/cranialNervePainMap.json");
const gateOrgans = require("./data/libraries/gateOrgans.json");
const developmentalEngineModel = require("./data/libraries/developmentalEngineModel.json");
const herbLibraryBatch10 = require("./data/libraries/herbLibrary.batch10.json");
const mergedHerbLibrary = require("./data/libraries/herbLibrary.merged.json");

const PATTERNS = batch10Data.patterns || [];
const RULES = batch10Data.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const PATTERN_LABELS = {
  arch_I_trigeminus_shaoyang_gate: "Arch I / trigeminal Shaoyang gate",
  arch_II_facialis_shaoyin_autonomic_buffer: "Arch II / facial Shaoyin autonomic buffer",
  arch_III_glossopharyngeus_ren_mai_block: "Arch III / glossopharyngeal Ren Mai gate",
  arch_IV_VI_vagus_cardio_aortic_jueyin_ren: "Arch IV-VI / vagus cardio-aortic gate",
  thyroid_ventral_field_node_disharmony: "Thyroid ventral field node pattern",
  post_thoracotomy_sternotomy_cranial_ascent: "Post-thoracotomy / sternotomy cranial ascent pattern",
  CRPS_arm_cardiopulmonary_field_inversion: "Arm CRPS cardiopulmonary field inversion",
  neural_crest_caudal_segmentation_BL_huatuojiaji: "Neural crest caudal segmentation / BL-Huatuojiaji layer",
  craniofacial_visceral_distortion_myofascial_embryonic: "Craniofacial-visceral myofascial field pattern"
};

const MODULE_TO_PATTERN = {
  ARCH_1_CN_V: "arch_I_trigeminus_shaoyang_gate",
  ARCH_2_CN_VII: "arch_II_facialis_shaoyin_autonomic_buffer",
  ARCH_3_CN_IX: "arch_III_glossopharyngeus_ren_mai_block",
  ARCH_4_6_CN_X: "arch_IV_VI_vagus_cardio_aortic_jueyin_ren"
};

const CROSS_BATCH_REFERENCES = [
  "Batch 6-8 headache phenotypes can connect to Arch 1 temporal migraine and Arch 3/4 atypical migraine modules.",
  "Batch 9 pelvic EZ grid connects to caudal neural crest segmentation.",
  "Batch 9 NSMBP / Du meridian logic connects to BL / Huatuojiaji continuation.",
  "Arm CRPS links to both Batch 9 neuropathy and Batch 10 Arch 4-6 module."
];

function list(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function any(values, options) {
  return options.some((option) => values.includes(option));
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
  const painLocations = list(input.pain_location_cranial);
  const visceral = list(input.visceral_trigger_cranial);
  const autonomic = list(input.autonomic_signs_cranial);
  const thyroidCo = list(input.thyroid_co_patterns);
  const symptoms = [
    ...list(input.cranial_symptoms),
    ...list(input.symptom_clusters),
    ...list(input.symptoms)
  ];

  return {
    pain_location_cranial: painLocations,
    cranial_symptoms: symptoms,
    dominant_arch_module: input.dominant_arch_module || "unknown",
    visceral_trigger_cranial: visceral,
    post_surgical_history: list(input.post_surgical_history),
    autonomic_signs_cranial: autonomic,
    thyroid_dysfunction_present: bool(input.thyroid_dysfunction_present),
    thyroid_co_patterns: thyroidCo,
    CRPS_arm_present: bool(input.CRPS_arm_present) || bool(input.arm_crps_present) || any(symptoms, ["CRPS_arm", "arm_crps", "crps_arm"]),
    stellate_block_effective: bool(input.stellate_block_effective) || bool(input.stellate_ganglion_block_helped) || bool(input.stellate_block_helped),
    vagus_stimulation_effective: bool(input.vagus_stimulation_effective) || bool(input.vagus_stimulation_helped),
    SCM_trigger_present: bool(input.SCM_trigger_present) || painLocations.includes("SCM_trigger"),
    symptom_modulated_by_posture_breath_emotion: bool(input.symptom_modulated_by_posture_breath_emotion),
    laser_available: bool(input.laser_available),
    laser_wavelength_available: list(input.laser_wavelength_available),
    hashimoto_present: bool(input.hashimoto_present) || symptoms.includes("hashimoto"),
    neck_pain_present: bool(input.neck_pain_present) || painLocations.includes("SCM_trigger") || symptoms.includes("neck_pain"),
    facial_pain_present: bool(input.facial_pain_present) || any(painLocations, ["facial", "temporal", "periorbital", "retroauricular"]) || symptoms.includes("facial_pain"),
    bell_palsy_features: bool(input.bell_palsy_features) || symptoms.includes("bell_palsy_features"),
    trigeminal_neuralgia: bool(input.trigeminal_neuralgia) || symptoms.includes("trigeminal_neuralgia"),
    cluster_headache: bool(input.cluster_headache) || symptoms.includes("cluster_headache"),
    temporal_migraine: bool(input.temporal_migraine) || painLocations.includes("temporal") || symptoms.includes("temporal_migraine"),
    occipital_migraine: bool(input.occipital_migraine) || painLocations.includes("occipital") || symptoms.includes("occipital_migraine"),
    glossopharyngeal_neuralgia: bool(input.glossopharyngeal_neuralgia) || symptoms.includes("glossopharyngeal_neuralgia"),
    BP_linked_headache: bool(input.BP_linked_headache) || autonomic.includes("BP_fluctuation_with_headache"),
    atypical_migraine_dizziness_chest: bool(input.atypical_migraine_dizziness_chest)
      || (painLocations.includes("chest_concurrent") && symptoms.includes("dizziness"))
      || (any(symptoms, ["atypical_migraine", "migraine"]) && any(symptoms, ["dizziness", "chest_pressure"]))
      || symptoms.includes("atypical_migraine_dizziness_chest"),
    IBS_present: bool(input.IBS_present) || visceral.includes("IBS"),
    POTS_present: bool(input.POTS_present) || autonomic.includes("POTS_features"),
    arrhythmia_present: bool(input.arrhythmia_present) || autonomic.includes("arrhythmia") || visceral.includes("cardiac_arrhythmia"),
    anxiety_present: bool(input.anxiety_present) || symptoms.includes("anxiety"),
    swallowing_pain_present: bool(input.swallowing_pain_present) || symptoms.includes("swallowing_pain"),
    mediastinal_pressure_present: bool(input.mediastinal_pressure_present) || any(symptoms, ["mediastinal_pressure", "chest_pressure"]) || painLocations.includes("chest_concurrent"),
    headache_present: bool(input.headache_present)
      || any(painLocations, ["temporal", "periorbital", "occipital", "throat_radiating"])
      || any(symptoms, ["headache", "migraine", "temporal_migraine", "occipital_migraine", "cluster_headache"]),
    internal_audit: bool(input.internal_audit)
  };
}

function scorePattern(scores, patternName, points, inputName, reason) {
  scores[patternName].score += points;
  scores[patternName].matching_symptoms.push({ input: inputName, points, reason });
}

function blankScores() {
  return Object.fromEntries(PATTERNS.map((item) => [item.name, { score: 0, matching_symptoms: [] }]));
}

function gateForPattern(patternName) {
  const byId = Object.fromEntries((gateOrgans.entries || []).map((item) => [item.id, item]));
  const fallback = { id: "FIELD_GATE", gate_role: "Resonance box gate", interface_type: "fascia-neuro-vascular module", field_metaphor: "oscillating gate" };
  if (patternName === "thyroid_ventral_field_node_disharmony") return byId.THYROID || fallback;
  if (patternName === "arch_III_glossopharyngeus_ren_mai_block") return byId.TONSIL || byId.THYROID || fallback;
  if (patternName === "arch_IV_VI_vagus_cardio_aortic_jueyin_ren" || patternName === "post_thoracotomy_sternotomy_cranial_ascent" || patternName === "CRPS_arm_cardiopulmonary_field_inversion") {
    return byId.THYMUS || fallback;
  }
  if (patternName === "arch_II_facialis_shaoyin_autonomic_buffer") return byId.PARATHYROID || fallback;
  return fallback;
}

function resetStrategyFor(patternName, input) {
  const source = pattern(patternName);
  const interventions = source.interventions || {};
  const herbs = Array.isArray(interventions.herbs)
    ? interventions.herbs.map((item) => ({ name: item.name, role: item.role, notes: item.notes || "" }))
    : [];
  return {
    formula_class: interventions.formula_class || "module-specific support",
    herbs,
    device: interventions.device || "",
    preparation: interventions.preparation || "",
    laser_gate_logic: input.laser_available ? laserGateLogic(input, patternName) : null
  };
}

function laserGateLogic(input, patternName) {
  const notes = [];
  if (input.laser_wavelength_available.includes("808nm") || input.laser_wavelength_available.includes("830nm")) {
    notes.push("808-830nm: deep autonomic modulation");
  }
  if (input.laser_wavelength_available.includes("980nm")) notes.push("980nm: fascia / vasomotor layer");
  if (!notes.length) notes.push("Use wavelength only within trained clinician/device protocol.");
  if (patternName === "CRPS_arm_cardiopulmonary_field_inversion" || input.CRPS_arm_present) {
    notes.push("4-gate stellate substitute: cervicothoracic fascia, C6-T2 Huatuojiaji, Ren17, carotid sheath lateral / supraclavicular plexus.");
  } else {
    notes.push("Volume PBM over gate zone with front-back pairing and breathing rhythm.");
  }
  return {
    available: true,
    principle: "Laser should be gate-volume modulation, not single-point nerve chasing.",
    notes
  };
}

function evaluatePharyngealArch(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const scores = blankScores();
  const triggered = [];

  if (MODULE_TO_PATTERN[input.dominant_arch_module]) {
    scorePattern(scores, MODULE_TO_PATTERN[input.dominant_arch_module], 4, "dominant_arch_module", "explicit arch module selection");
  }

  if (input.neck_pain_present && input.facial_pain_present) {
    triggered.push(rule("R_B3_001", "neck pain + facial pain"));
    scorePattern(scores, "craniofacial_visceral_distortion_myofascial_embryonic", 2, "neck_facial_chain", "neck plus facial pain is field-module signal");
  }

  if (input.trigeminal_neuralgia || input.temporal_migraine || input.cluster_headache || any(input.pain_location_cranial, ["temporal", "periorbital"])) {
    triggered.push(rule("R_B3_002", "trigeminal/temporal/periorbital headache signal"));
    scorePattern(scores, "arch_I_trigeminus_shaoyang_gate", 4, "arch_1_symptoms", "temporal migraine, cluster, or trigeminal territory");
  }
  if (any(input.pain_location_cranial, ["facial"]) || any(input.visceral_trigger_cranial, ["reflux_hiatus", "hepatic_tension", "epigastric_tension", "carotid_irritation", "vagus_symp_imbalance"])) {
    scorePattern(scores, "arch_I_trigeminus_shaoyang_gate", 2, "arch_1_visceral_pull", "face/TMJ/reflux/hepatic/carotid pull can enter Arch 1 gate");
  }

  if (
    any(input.pain_location_cranial, ["facial", "retroauricular"])
    || input.bell_palsy_features
    || (input.IBS_present && input.facial_pain_present)
    || any(input.autonomic_signs_cranial, ["lacrimation_mismatch", "dry_mouth", "hot_cold_facial_asymmetry", "palpitations"])
  ) {
    triggered.push(rule("R_B3_003", "facial tension/Bell/IBS-facial/autonomic mismatch"));
    scorePattern(scores, "arch_II_facialis_shaoyin_autonomic_buffer", 4, "arch_2_symptoms", "facial autonomic buffer signal");
  }

  if (
    input.occipital_migraine
    || input.glossopharyngeal_neuralgia
    || input.BP_linked_headache
    || input.pain_location_cranial.includes("throat_radiating")
  ) {
    triggered.push(rule("R_B3_004", "occipital/throat/BP-linked headache signal"));
    scorePattern(scores, "arch_III_glossopharyngeus_ren_mai_block", 4, "arch_3_symptoms", "baroreceptor/Ren Mai gate signal");
  }
  if (any(input.visceral_trigger_cranial, ["thyroid_distortion", "mediastinal_adhesion", "cardiac_arrhythmia"])) {
    scorePattern(scores, "arch_III_glossopharyngeus_ren_mai_block", 1, "arch_3_visceral", "thyroid/carotid/mediastinal field can load Arch 3");
  }

  if (
    input.atypical_migraine_dizziness_chest
    || input.POTS_present
    || input.arrhythmia_present
    || input.CRPS_arm_present
    || input.post_surgical_history.includes("sternotomy")
    || any(input.visceral_trigger_cranial, ["IBS", "pulmonary_congestion", "pericardial_tension"])
  ) {
    triggered.push(rule("R_B3_005", "vagus/cardio-aortic/mediastinal signal"));
    scorePattern(scores, "arch_IV_VI_vagus_cardio_aortic_jueyin_ren", 4, "arch_4_6_symptoms", "vagus-cardio-aortic module signal");
  }

  if (input.thyroid_dysfunction_present && input.thyroid_co_patterns.length) {
    triggered.push(rule("R_B3_006", "thyroid dysfunction with branchial co-pattern"));
    scorePattern(scores, "thyroid_ventral_field_node_disharmony", 5, "thyroid_co_pattern", "thyroid plus TMJ/neck/sternum/vagus/globus co-pattern");
  }
  if (input.hashimoto_present) {
    triggered.push(rule("R_B3_015", "Hashimoto context"));
    scorePattern(scores, "thyroid_ventral_field_node_disharmony", 2, "hashimoto_present", "multifactorial thyroid caution context");
  }

  const sternotomyLike = input.post_surgical_history.includes("sternotomy") || input.post_surgical_history.includes("thoracotomy");
  if (
    sternotomyLike
    && input.occipital_migraine
    && input.anxiety_present
    && input.autonomic_signs_cranial.includes("palpitations")
    && input.thyroid_co_patterns.includes("globus")
  ) {
    triggered.push(rule("R_B3_007", "thoracotomy/sternotomy + occipital/anxiety/palpitations/globus"));
    scorePattern(scores, "post_thoracotomy_sternotomy_cranial_ascent", 6, "post_surgical_cranial_ascent", "Ren Mai / ventral aorta field injury with cranial ascent");
  }

  if (input.CRPS_arm_present && (input.stellate_block_effective || input.vagus_stimulation_effective)) {
    triggered.push(rule("R_B3_008", "arm CRPS with stellate/vagus response"));
    scorePattern(scores, "CRPS_arm_cardiopulmonary_field_inversion", 7, "arm_CRPS_gate_response", "cardiopulmonary field inversion / stellate reset gate");
  }
  if (input.CRPS_arm_present && input.laser_available) {
    triggered.push(rule("R_B3_014", "laser selected as stellate substitute for arm CRPS"));
    scorePattern(scores, "CRPS_arm_cardiopulmonary_field_inversion", 2, "CRPS_laser", "4-gate non-invasive laser stellate protocol");
  }

  if (input.SCM_trigger_present) {
    triggered.push(rule("R_B3_009", "SCM trigger point present"));
    scorePattern(scores, "craniofacial_visceral_distortion_myofascial_embryonic", 4, "SCM_trigger", "SCM-migraine-palpitation-reflux chain");
  }
  if (input.symptom_modulated_by_posture_breath_emotion) {
    triggered.push(rule("R_B3_010", "cranial symptoms modulated by posture/breath/emotion"));
    scorePattern(scores, "neural_crest_caudal_segmentation_BL_huatuojiaji", 2, "field_modulation", "posture/breath/emotion modulation is field sign");
  }
  if (input.laser_available) triggered.push(rule("R_B3_011", "laser available for cranial-thoracic arch module"));

  const clearGIUpstream = any(input.visceral_trigger_cranial, ["reflux_hiatus", "epigastric_tension", "hepatic_tension"]);
  if (input.IBS_present && !clearGIUpstream) {
    triggered.push(rule("R_B3_012", "IBS without clear GI upstream cause"));
    scorePattern(scores, "arch_II_facialis_shaoyin_autonomic_buffer", 1, "IBS_arch_2_check", "IBS can enter CN VII autonomic buffer if facial symptoms coexist");
    scorePattern(scores, "arch_IV_VI_vagus_cardio_aortic_jueyin_ren", 1, "IBS_arch_4_6_check", "IBS can enter vagal-enteric axis");
  }

  if (input.swallowing_pain_present && input.mediastinal_pressure_present && input.headache_present) {
    triggered.push(rule("R_B3_013", "swallowing pain + mediastinal pressure + headache"));
    scorePattern(scores, "arch_III_glossopharyngeus_ren_mai_block", 2, "multi_module_arch_3", "baroreceptor/pharyngeal gate");
    scorePattern(scores, "arch_IV_VI_vagus_cardio_aortic_jueyin_ren", 7, "multi_module_arch_4_6", "mediastinal gate first");
  }

  const ordered = Object.entries(scores)
    .map(([patternName, value]) => ({ pattern: patternName, ...value }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const dominant = ordered[0] || { pattern: "", score: 0, matching_symptoms: [] };
  const dominantPattern = pattern(dominant.pattern);
  const gateOrgan = gateForPattern(dominant.pattern);
  const resetStrategy = resetStrategyFor(dominant.pattern, input);
  const matchedPatterns = ordered.map((item) => item.pattern);
  const matchedSymptoms = ordered.flatMap((item) => item.matching_symptoms.map((match) => ({ pattern: item.pattern, ...match })));
  const resonanceBox = {
    principle: batch10Data.engine_module.field_principle,
    model: batch10Data.resonance_box_model,
    decision_loop: batch10Data.resonance_box_model.identification_algorithm
  };
  const cranialNerveBus = dominantPattern.cranial_nerve || "";
  const suspectedArchModule = dominantPattern.developmental_module || input.dominant_arch_module || "";

  return {
    engine: "cranio_visceral_developmental_gates",
    name: "Cranio-Visceral Developmental Gates",
    subtitle: "Pharyngeal Arch Engine",
    source: ["avicenna_engine_batch10.json", "pharyngealArchEngine.json"],
    active: Boolean(dominant.pattern),
    suspected_arch_module: suspectedArchModule,
    cranial_nerve_bus: cranialNerveBus,
    gate_organ: gateOrgan,
    resonance_box: resonanceBox,
    field_state: dominantPattern.field_state || [],
    matched_patterns: matchedPatterns,
    primary_pattern: dominant.pattern,
    primary_pattern_label: PATTERN_LABELS[dominant.pattern] || dominant.pattern || "Unclear developmental gate pattern",
    matching_symptoms: matchedSymptoms,
    triggered_rule_ids: uniqueRules(triggered),
    reset_strategy: resetStrategy,
    laser_gate_logic: resetStrategy.laser_gate_logic,
    four_gate_laser_stellate_protocol: (pattern("CRPS_arm_cardiopulmonary_field_inversion").interventions || {}).device_laser_4_point_protocol || null,
    cranial_nerve_pain_module_map: cranialNervePainMap.entries,
    gate_organ_library: gateOrgans.entries,
    pharyngeal_pouch_sensor_corridor: batch10Data.pharyngeal_pouch_sensor_corridor,
    developmental_engine_data_model: developmentalEngineModel,
    herb_library_batch10: herbLibraryBatch10.entries,
    merged_herb_library: mergedHerbLibrary.entries,
    cross_batch_references: CROSS_BATCH_REFERENCES,
    patient: {
      title: PATTERN_LABELS[dominant.pattern] || "Developmental gate pattern",
      summary: dominant.pattern
        ? "This module may reflect an oscillating cranio-visceral resonance box. This is an educational pattern-recognition tool, not a medical diagnosis."
        : "No dominant developmental gate module was identified from the current inputs. This is an educational pattern-recognition tool, not a medical diagnosis.",
      support: dominant.pattern ? [
        "Pain = oscillating resonance box, not a single structure. The engine treats module oscillation, not the nerve.",
        `Likely gate focus: ${gateOrgan.id || gateOrgan.gate_role || "field gate"}.`,
        `Reset class: ${resetStrategy.formula_class}.`
      ] : [],
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "Medication changes must be discussed with a clinician.",
        "This engine does not claim embryology proves disease causation."
      ]
    },
    clinician: {
      suspected_arch_module: suspectedArchModule,
      cranial_nerve_bus: cranialNerveBus,
      gate_organ: gateOrgan,
      resonance_box: resonanceBox,
      field_state: dominantPattern.field_state || [],
      matching_symptoms: matchedSymptoms,
      triggered_rule_ids: uniqueRules(triggered),
      suggested_reset_strategy: resetStrategy,
      laser_gate_logic: resetStrategy.laser_gate_logic,
      associated_herbs: resetStrategy.herbs,
      formula_class: resetStrategy.formula_class,
      cross_batch_references: CROSS_BATCH_REFERENCES,
      cranial_nerve_pain_module_map: cranialNervePainMap.entries,
      gate_organ_library: gateOrgans.entries,
      developmental_engine_data_model: developmentalEngineModel
    },
    notes: batch10Data.notes
  };
}

module.exports = {
  evaluatePharyngealArch,
  batch10Data,
  pharyngealArchData,
  cranialNervePainMap,
  gateOrgans,
  developmentalEngineModel
};
