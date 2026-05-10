const biophysicalSubstrateData = require("./data/engines/biophysicalSubstrateEngine.v1.json");
const ezOscillatorModel = require("./data/engines/ezOscillatorModel.v1.json");
const fasciaNerveDualChannel = require("./data/engines/fasciaNerveDualChannel.v1.json");
const cervicalPrevertebralPattern = require("./data/engines/cervicalPrevertebralPattern.v1.json");
const internalBackendTranslationMap = require("./data/libraries/internalBackendTranslationMap.batch19.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const PATIENT_DISCLAIMER = "This is an educational pattern-recognition tool, not a medical diagnosis.";
const ONCOLOGY_DISCLAIMER = "This framework does not replace oncological diagnosis, staging, or treatment.";

const PATTERNS = biophysicalSubstrateData.patterns || [];
const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((pattern) => [pattern.id, pattern]));
const RULES = biophysicalSubstrateData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const SAFE_PATTERN_LABELS = {
  EZW_FRAG: "impaired tissue buffering / neurovascular oscillator instability",
  OSCILL_VISC: "visceral autonomic-vascular oscillator pattern",
  TAC_OSCILL: "cranial autonomic oscillator pattern",
  CERV_PREVRT: "voice-direction / neck-visceral coordination pattern",
  FASCIA_NERVE_SYSTEM: "fascial movement blueprint and neural trigger coordination pattern",
  MUSCLE_FIELD_COLLAPSE: "muscle-fascia coherence and mitochondrial support pattern",
  METASTASIS_GATE: "oncology meaning-layer for practitioner review only",
  NERVE_WATER_FIELD_THEORY: "neural field-phase transducer model"
};

const CLUSTER_ROUTES = {
  EZW_FRAG: ["LAX", "PSA", "AMA", "MIA", "SVA", "DAV", "CIA"],
  OSCILL_VISC: ["DAV", "MIA"],
  TAC_OSCILL: ["LAX", "PSA"],
  CERV_PREVRT: ["LAX", "MIA"],
  FASCIA_NERVE_SYSTEM: ["LAX", "DAV", "CIA"],
  MUSCLE_FIELD_COLLAPSE: ["SVA", "CIA"],
  METASTASIS_GATE: ["SVA", "DAV", "MIA", "LAX"],
  NERVE_WATER_FIELD_THEORY: ["LAX", "PSA", "AMA", "MIA", "SVA", "DAV", "CIA"]
};

const SAFE_RULE_ACTION_OVERRIDES = {
  B19_R016: "drug = rapid matrix disruption / short-term symptom reduction; formula = structured rebuild / direction; monitor for stronger-than-expected response and clinician-guided adjustment"
};

const FORBIDDEN_PATIENT_TERMS = [
  [/etheric field/gi, "structured tissue signalling model"],
  [/\bHUN\b/g, "emotional regulation layer"],
  [/\bQi\b/g, "directional regulation"],
  [/proton accumulator/gi, "stored tissue potential"],
  [/field hologram/gi, "movement blueprint"],
  [/Shaoyin gap/gi, "survival-axis coherence loss"],
  [/Jueyin slip/gi, "deep autonomic-vascular overdrive"],
  [/Taiyin phlegm overload/gi, "midline interoceptive counterflow"],
  [/Shaoyang gate instability/gi, "lateral autonomic gating instability"]
];

const TRANSLATION_REPLACEMENTS = [
  ...(internalBackendTranslationMap.translations || []).map((entry) => [
    new RegExp(escapeRegExp(entry.backend_term), "gi"),
    entry.frontend_term
  ]),
  ...FORBIDDEN_PATIENT_TERMS
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function includesAny(values, targets) {
  const haystack = list(values).map((value) => lower(value).replace(/\s+/g, "_"));
  return targets.some((target) => haystack.some((item) => item.includes(target)));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueRules(rules) {
  const seen = new Set();
  return rules.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function rule(id, reason = "") {
  const item = RULE_BY_ID[id] || { id, condition: "", action: "" };
  return { id: item.id, condition: item.condition, action: SAFE_RULE_ACTION_OVERRIDES[id] || item.action, reason };
}

function translatePatientString(value) {
  return TRANSLATION_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value)
  );
}

function patientSafe(value) {
  if (typeof value === "string") return translatePatientString(value);
  if (Array.isArray(value)) return value.map((item) => patientSafe(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, patientSafe(item)]));
  }
  return value;
}

function outputMode(input) {
  if (input.output_mode === "practitioner" || input.system_mode === "practitioner" || bool(input.practitioner_mode)) return "practitioner";
  if (input.output_mode === "internal-audit" || input.system_mode === "internal-audit" || bool(input.internal_audit) || bool(input.debugMode)) return "internal-audit";
  return "patient";
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.pain_features),
    ...list(input.autonomic_symptoms),
    ...list(input.cervical_symptoms),
    ...list(input.visceral_symptoms),
    ...list(input.movement_features),
    ...list(input.diagnosis),
    ...list(input.western_diagnosis)
  ];
  const diagnosis = [
    ...list(input.diagnosis),
    ...list(input.western_diagnosis),
    ...list(input.existing_diagnosis)
  ].map(lower);
  const headacheType = lower(input.headache_type || input.headacheType || "");
  const cervicalLevel = String(input.cervical_level || "").replace("-", "_");
  const formulaAxes = list(input.formula_axis || input.formula_axes);

  return {
    output_mode: outputMode(input),
    symptoms,
    diagnosis,
    EZ_water_integrity: input.EZ_water_integrity || input.ez_water_integrity || "",
    bulk_water_ratio: input.bulk_water_ratio || "",
    fascial_coherence_state: input.fascial_coherence_state || "",
    mitochondrial_drive: input.mitochondrial_drive || "",
    oscillator_frequency_range: input.oscillator_frequency_range || "",
    gate_dominant: input.gate_dominant || "",
    metastasis_site: input.metastasis_site || "",
    primary_tumor_site: input.primary_tumor_site || "",
    spinal_level_involved: input.spinal_level_involved || "",
    cervical_level: cervicalLevel,
    trigger_type: input.trigger_type || "",
    pharmaceutical_class: input.pharmaceutical_class || "",
    formula_axis: formulaAxes,
    formula_components_count: number(input.formula_components_count || input.formula_components),
    symptom_oscillation: bool(input.symptom_oscillation) || bool(input.symptoms_oscillate) || includesAny(symptoms, ["oscillat", "wave_like", "fluctuat"]),
    fixed_dermatomal: bool(input.fixed_dermatomal),
    night_worsening: bool(input.night_worsening) || includesAny(symptoms, ["night_worse", "nighttime_worse"]),
    stress_sensitivity: bool(input.stress_sensitivity) || includesAny(symptoms, ["stress_sensitive", "stress_trigger"]),
    allodynia_like_sensitivity: bool(input.allodynia_like_sensitivity) || includesAny(symptoms, ["allodynia", "touch_sensitivity"]),
    clear_structural_nerve_injury: bool(input.clear_structural_nerve_injury),
    paradoxical_drug_response: bool(input.paradoxical_drug_response) || includesAny(symptoms, ["paradoxical_drug"]),
    small_trigger_disproportionate: bool(input.small_trigger_disproportionate) || bool(input.disproportionate_autonomic_response),
    autonomic_dysreflexia: bool(input.autonomic_dysreflexia) || diagnosis.some((item) => item.includes("autonomic dysreflexia")),
    bladder_dominant: bool(input.bladder_dominant) || bool(input.overactive_bladder) || diagnosis.some((item) => item.includes("overactive bladder") || item.includes("oab")),
    acute_severe_hypertension: bool(input.acute_severe_hypertension),
    spinal_cord_emergency_features: bool(input.spinal_cord_emergency_features),
    bowel_skin_autonomic_resonance: bool(input.bowel_skin_autonomic_resonance),
    headache_type: headacheType,
    circadian: bool(input.circadian) || bool(input.circadian_attacks) || includesAny(symptoms, ["circadian", "night_attack"]),
    indomethacin_responsive: bool(input.indomethacin_responsive) || bool(input.indometacin_responsive),
    oxygen_therapy: bool(input.oxygen_therapy),
    cervical_symptoms_present: bool(input.cervical_symptoms_present) || includesAny(symptoms, ["neck", "cervical", "prevertebral"]),
    hoarseness: bool(input.hoarseness) || includesAny(symptoms, ["hoarseness", "voice_fatigue"]),
    globus: bool(input.globus) || includesAny(symptoms, ["globus", "lump_throat"]),
    dysphagia: bool(input.dysphagia) || includesAny(symptoms, ["dysphagia", "swallow"]),
    shoulder_tension: bool(input.shoulder_tension) || includesAny(symptoms, ["shoulder", "scapular"]),
    dizziness_palpitations: bool(input.dizziness_palpitations) || includesAny(symptoms, ["dizziness", "palpitations"]),
    speech_breathing_changes_symptoms: bool(input.speech_breathing_changes_symptoms) || includesAny(symptoms, ["speech_trigger", "breathing_trigger"]),
    ascending_visceral_pressure: bool(input.ascending_visceral_pressure),
    descending_sp_overload: bool(input.descending_sp_overload) || bool(input.rumination) || bool(input.phlegm_dominant) || bool(input.qi_reversal),
    phlegm_dominant: bool(input.phlegm_dominant),
    stellate_ganglion_block_considered: bool(input.stellate_ganglion_block_considered),
    visceral_trigger_worsens: bool(input.visceral_trigger_worsens),
    symptom_resolves_with_directional_change: input.symptom_resolves_with_directional_change === undefined
      ? null
      : bool(input.symptom_resolves_with_directional_change),
    passive_movement_restricted: bool(input.passive_movement_restricted),
    active_movement_restricted: bool(input.active_movement_restricted),
    passive_movement_available: bool(input.passive_movement_available),
    active_movement_absent: bool(input.active_movement_absent),
    movement_failure: lower(input.movement_failure || input.paralysis_type || ""),
    neuroprotection_only: bool(input.neuroprotection_only),
    practitioner_requests_integrative_layer: bool(input.practitioner_requests_integrative_layer),
    western_pharmaceutical: bool(input.western_pharmaceutical) || Boolean(input.pharmaceutical_class),
    concurrent_TCM_formula: bool(input.concurrent_TCM_formula) || bool(input.concurrent_tcm_formula),
    pungent_herbs_used: bool(input.pungent_herbs_used),
    Yin_support_absent: bool(input.Yin_support_absent) || bool(input.yin_support_absent),
    aggressive_cervical_manipulation_considered: bool(input.aggressive_cervical_manipulation_considered),
    theory_reference_requested: bool(input.theory_reference_requested)
  };
}

function diagnosisMatches(input, targets) {
  return targets.some((target) => input.diagnosis.some((item) => item.includes(target)));
}

function hasTACHeadache(input) {
  return ["cluster", "paroxysmal_hemicrania", "paroxysmal hemicrania", "sunct", "suna", "hemicrania_continua", "hemicrania continua"].some((term) => input.headache_type.includes(term))
    || diagnosisMatches(input, ["cluster headache", "paroxysmal hemicrania", "sunct", "suna", "hemicrania continua"]);
}

function tacSubtype(input, triggered) {
  if ((input.headache_type.includes("cluster") || diagnosisMatches(input, ["cluster headache"])) && input.circadian) {
    triggered.push(rule("B19_R004", "cluster headache with circadian/night pattern"));
    return {
      type: "cluster",
      gate: "SPG / parasympathetic amplitude",
      frequency: "medium-high pulsatile",
      standard_care_note: input.oxygen_therapy ? "Oxygen therapy should remain clinician-directed; standard acute use is 12-15 L/min by non-rebreather." : ""
    };
  }
  if ((input.headache_type.includes("paroxysmal") || diagnosisMatches(input, ["paroxysmal hemicrania"])) && input.indomethacin_responsive) {
    triggered.push(rule("B19_R005", "paroxysmal hemicrania with indomethacin response"));
    return { type: "paroxysmal_hemicrania", gate: "vascular-meningeal gate", frequency: "medium, fast reset" };
  }
  if (input.headache_type.includes("sunct") || input.headache_type.includes("suna") || diagnosisMatches(input, ["sunct", "suna"])) {
    triggered.push(rule("B19_R006", "SUNCT/SUNA presentation"));
    return { type: "SUNCT/SUNA", gate: "trigeminal microcircuit", frequency: "very high spike-like" };
  }
  if (input.headache_type.includes("hemicrania") || diagnosisMatches(input, ["hemicrania continua"])) {
    return { type: "hemicrania_continua", gate: "continuous unilateral indomethacin-responsive oscillator", frequency: "continuous unilateral" };
  }
  return { type: "TAC_spectrum", gate: "cranial autonomic gate", frequency: input.oscillator_frequency_range || "not specified" };
}

function cervicalDirection(input) {
  if (input.ascending_visceral_pressure && input.descending_sp_overload) return "mixed";
  if (input.ascending_visceral_pressure) return "ascending visceral pressure";
  if (input.descending_sp_overload) return "descending interoceptive overload";
  return "unclear";
}

function cervicalFormulaLogic(input, triggered) {
  const level = input.cervical_level;
  const guide = input.hoarseness || level === "C2_C3"
    ? "Jie Geng guide"
    : input.dysphagia || level === "C5_C6"
      ? "Hou Po guide"
      : "guide herb selected by dominant symptom";
  if (level === "C2_C3") triggered.push(rule("B19_R008", "C2-C3 cervical level"));
  if (level === "C5_C6") triggered.push(rule("B19_R009", "C5-C6 cervical level"));
  return {
    base: "Wen Dan Tang axis",
    direction: "Xiao Chai Hu Tang direction if lateral gate dominance is present",
    guide,
    rule: "1 base + 1 direction + 1 guide"
  };
}

function movementSubtype(input, triggered) {
  if (input.passive_movement_restricted && input.active_movement_restricted) {
    triggered.push(rule("B19_R011", "passive and active movement restricted"));
    return {
      subtype: "FASCIA_BLOCK",
      interpretation: "passive and active movement are both restricted",
      direction: "fascial pattern release"
    };
  }
  if (input.passive_movement_available && input.active_movement_absent) {
    triggered.push(rule("B19_R012", "passive movement available but active movement absent"));
    return {
      subtype: "NERVE_BLOCK",
      interpretation: "movement pattern may be present but active trigger is absent",
      direction: "Yin/Blood rebuilding + mitochondrial support"
    };
  }
  if (input.movement_failure === "intermittent") {
    triggered.push(rule("B19_R013", "intermittent movement failure"));
    return {
      subtype: "ION_PHASE_DISORDER",
      interpretation: "movement failure is intermittent or fluctuating",
      direction: "mineralisation, PEMF, and phase-stability support"
    };
  }
  return null;
}

function metastasisGate(input) {
  const site = lower(input.metastasis_site);
  if (["bone", "marrow", "vertebra", "spine"].some((term) => site.includes(term))) return "GATE_1_SHAOYIN";
  if (["liver", "lateral"].some((term) => site.includes(term))) return "GATE_2_JUEYIN";
  if (["neck", "mediastinum", "thorax"].some((term) => site.includes(term))) return "GATE_3_TAIYIN";
  if (["brain", "cervical", "multifocal"].some((term) => site.includes(term))) return "GATE_4_SHAOYANG";
  return "GATE_UNSPECIFIED";
}

function addPattern(matches, id, evidence) {
  if (!matches[id]) matches[id] = [];
  matches[id].push(evidence);
}

function evaluateMatches(input, triggered, reviewFlags, contraindications) {
  const matches = {};
  const safetyStops = [];
  let tac = null;
  let cervical = null;
  let movement = null;
  let metastasis = null;
  const clinicianNotes = [];

  const ezLike = input.symptom_oscillation
    || input.night_worsening
    || input.stress_sensitivity
    || input.allodynia_like_sensitivity
    || input.paradoxical_drug_response
    || input.EZ_water_integrity === "fragmented"
    || input.bulk_water_ratio === "high";
  if (ezLike && !input.fixed_dermatomal) {
    triggered.push(rule("B19_R001", "oscillating/non-dermatomal sensitivity pattern"));
    addPattern(matches, "EZW_FRAG", "oscillating or disproportionate sensitivity suggests impaired buffering");
    contraindications.push("Avoid aggressive mechanical release during active fragmentation.");
    contraindications.push("Avoid cold or desiccating approaches while buffering is unstable.");
  }

  if (input.small_trigger_disproportionate) {
    triggered.push(rule("B19_R002", "small trigger with disproportionate autonomic response"));
    addPattern(matches, hasTACHeadache(input) ? "TAC_OSCILL" : "OSCILL_VISC", "small trigger creates disproportionate autonomic response");
  }

  if ((input.autonomic_dysreflexia || input.bladder_dominant) && input.bladder_dominant) {
    triggered.push(rule("B19_R003", "autonomic dysreflexia/OAB with bladder dominance"));
    addPattern(matches, "OSCILL_VISC", "bladder-bowel-skin oscillator features are dominant");
    addPattern(matches, "EZW_FRAG", "visceral oscillator implies impaired local buffering");
    if (input.acute_severe_hypertension || input.spinal_cord_emergency_features) {
      safetyStops.push("Acute severe hypertension or spinal cord emergency features require urgent medical care.");
    }
  }

  if (hasTACHeadache(input)) {
    addPattern(matches, "TAC_OSCILL", "TAC-spectrum headache geometry detected");
    tac = tacSubtype(input, triggered);
    if (input.oxygen_therapy && (tac.type === "cluster" || diagnosisMatches(input, ["cluster headache"]))) {
      triggered.push(rule("B19_R019", "oxygen therapy with cluster headache"));
      clinicianNotes.push("Cluster oxygen mechanism: mitochondrial redox reset + NO dampening + bulk-water oscillation reduction. Standard acute wording remains 12-15 L/min non-rebreather, clinician-directed.");
    }
  }

  if (input.cervical_symptoms_present && (input.hoarseness || input.globus || input.dysphagia || input.shoulder_tension)) {
    triggered.push(rule("B19_R007", "cervical-visceral symptoms"));
    addPattern(matches, "CERV_PREVRT", "neck-visceral coordination signs are present");
    cervical = {
      direction: cervicalDirection(input),
      formula_logic: cervicalFormulaLogic(input, triggered),
      laser_rule: "Low-level laser uses static, low-energy holds over longus colli / prevertebral projection; no sweeping or destructive intent."
    };
    if (input.aggressive_cervical_manipulation_considered && (input.dysphagia || input.hoarseness || input.dizziness_palpitations || input.speech_breathing_changes_symptoms)) {
      contraindications.push("Avoid aggressive cervical manipulation while dysphagia, hoarseness, autonomic instability, dizziness/palpitations, or speech/breath-linked symptoms are active.");
    }
  }

  if (input.stellate_ganglion_block_considered && (input.phlegm_dominant || input.visceral_trigger_worsens || input.symptom_resolves_with_directional_change === false)) {
    triggered.push(rule("B19_R010", "stellate ganglion block risk pattern"));
    contraindications.push("Stellate ganglion block is contraindicated in this engine state; reassess the prevertebral axis first.");
  }

  movement = movementSubtype(input, triggered);
  if (movement) addPattern(matches, "FASCIA_NERVE_SYSTEM", movement.subtype);

  if (diagnosisMatches(input, ["als", "critical care myopathy", "icu-acquired weakness", "icu acquired weakness"]) && input.neuroprotection_only) {
    triggered.push(rule("B19_R014", "neuroprotection-only strategy in ALS/critical care myopathy"));
    addPattern(matches, "MUSCLE_FIELD_COLLAPSE", "neuroprotection-only strategy is insufficient");
    clinicianNotes.push("Muscle-fascia coherence and mitochondrial support must be addressed alongside neurological care.");
  }

  if (input.metastasis_site && input.practitioner_requests_integrative_layer) {
    triggered.push(rule("B19_R015", "metastasis site with practitioner integrative layer request"));
    addPattern(matches, "METASTASIS_GATE", "practitioner-only oncology meaning layer requested");
    reviewFlags.push("Oncology remains primary; this meaning-layer must not delay staging, treatment, or oncology review.");
    metastasis = {
      site: input.metastasis_site,
      dominant_gate: metastasisGate(input),
      safety_wrapper: ONCOLOGY_DISCLAIMER,
      inquiry_steps: PATTERN_BY_ID.METASTASIS_GATE?.["3_step_clinical_inquiry"] || []
    };
  }

  if (input.western_pharmaceutical && input.concurrent_TCM_formula) {
    triggered.push(rule("B19_R016", "western pharmaceutical with concurrent TCM formula"));
    clinicianNotes.push("Medication plus formula: monitor for stronger-than-expected response and clinician-guided adjustment. Do not automatically advise dose reduction.");
  }

  if (input.pungent_herbs_used && input.Yin_support_absent) {
    triggered.push(rule("B19_R017", "pungent herbs without Yin support"));
    contraindications.push("Pungent herbs may injure Yin if not balanced; add a stabilising Yin component where appropriate.");
  }

  if (input.formula_components_count > 3 || input.formula_axis.length > 3) {
    triggered.push(rule("B19_R018", "formula complexity exceeds 1 base + 1 direction + 1 guide / 3 axes"));
    reviewFlags.push("Formula complexity suggests the dominant axis may be misidentified.");
  }

  if (input.theory_reference_requested || diagnosisMatches(input, ["diabetic neuropathy", "neuropathy"])) {
    addPattern(matches, "NERVE_WATER_FIELD_THEORY", "internal substrate theory reference requested or neuropathy context present");
  }

  return { matches, safetyStops, tac, cervical, movement, metastasis, clinicianNotes };
}

function dominantPattern(matches) {
  const entries = Object.entries(matches);
  if (!entries.length) return "";
  return entries.sort((a, b) => b[1].length - a[1].length)[0][0];
}

function clusterRoutesFor(patternIds) {
  const routes = {};
  for (const id of patternIds) routes[id] = CLUSTER_ROUTES[id] || [];
  return routes;
}

function supportFocusFor(patternIds) {
  const focus = [];
  if (patternIds.includes("EZW_FRAG")) focus.push("oscillation dampening", "warmth", "slow breathing", "gentle fascia work", "PEMF / low-level laser", "structured hydration support");
  if (patternIds.includes("OSCILL_VISC")) focus.push("diaphragmatic breathing", "pelvic fascia support", "warmth", "urgent medical care if acute dysreflexia signs are present");
  if (patternIds.includes("TAC_OSCILL")) focus.push("clinician-directed acute headache care", "circadian pattern review", "cranial autonomic oscillator support");
  if (patternIds.includes("CERV_PREVRT")) focus.push("neck-visceral coordination support", "low-energy static laser logic", "voice/swallowing symptom review");
  if (patternIds.includes("FASCIA_NERVE_SYSTEM")) focus.push("passive vs active movement assessment", "fascial pattern release or neural rebuilding depending on subtype");
  if (patternIds.includes("MUSCLE_FIELD_COLLAPSE")) focus.push("muscle-fascia coherence", "mitochondrial support", "slow movement and phototherapy alongside neurological care");
  if (patternIds.includes("METASTASIS_GATE")) focus.push("oncology-primary practitioner reflection layer");
  return unique(focus);
}

function patientSummary(patternIds, stopped) {
  if (stopped) return "A safety feature is active, so this substrate interpretation should pause until urgent medical assessment has occurred.";
  if (!patternIds.length) return "No strong substrate pattern was selected from the current inputs; reassessment with more structured information may help.";
  const labels = patternIds.map((id) => SAFE_PATTERN_LABELS[id]).filter(Boolean);
  return `This may reflect ${labels.slice(0, 2).join(" with ")}. The emphasis is on nervous system regulation, tissue matrix coherence, and oscillation dampening rather than diagnosis or cure claims.`;
}

function evaluateBiophysicalSubstrateEngine(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const reviewFlags = [];
  const contraindications = [];
  const evaluated = evaluateMatches(input, triggered, reviewFlags, contraindications);
  const matchedPatterns = Object.keys(evaluated.matches);
  const patientVisiblePatterns = matchedPatterns.filter((id) => id !== "METASTASIS_GATE" || input.output_mode !== "patient");
  const dominant = dominantPattern(evaluated.matches);
  const stopped = evaluated.safetyStops.length > 0;

  const patient = patientSafe({
    title: stopped ? "Urgent medical pathway" : "Biophysical substrate interpretation",
    summary: matchedPatterns.includes("METASTASIS_GATE") && input.output_mode === "patient" && !patientVisiblePatterns.length
      ? "Oncology-related meaning-layer material is only shown in practitioner mode. Conventional oncology diagnosis, staging, and treatment remain primary."
      : patientSummary(patientVisiblePatterns, stopped),
    pattern_labels: patientVisiblePatterns.map((id) => SAFE_PATTERN_LABELS[id]),
    support_focus: stopped ? [] : supportFocusFor(patientVisiblePatterns),
    avoid_now: contraindications,
    safety_notes: [
      PATIENT_DISCLAIMER,
      ...(matchedPatterns.includes("METASTASIS_GATE") ? [ONCOLOGY_DISCLAIMER] : []),
      ...evaluated.safetyStops,
      "Medication changes must be discussed with a clinician."
    ]
  });

  const clinician = input.output_mode !== "patient"
    ? {
        matched_patterns: matchedPatterns,
        dominant_pattern: dominant,
        rule_trace: uniqueRules(triggered),
        ez_integrity: input.EZ_water_integrity || (matchedPatterns.includes("EZW_FRAG") ? "fragmented_or_unstable" : "not assessed"),
        oscillator_frequency_range: input.oscillator_frequency_range || evaluated.tac?.frequency || "",
        gate_dominant: input.gate_dominant || evaluated.tac?.gate || evaluated.metastasis?.dominant_gate || "",
        seven_cluster_routes: clusterRoutesFor(matchedPatterns),
        headache_engine_link: matchedPatterns.includes("TAC_OSCILL") ? "Headache Tri-Axial Engine / TAC branch" : "",
        tac_oscillator: evaluated.tac,
        cervical_prevertebral: evaluated.cervical,
        movement_assessment: evaluated.movement,
        metastasis_meaning_layer: evaluated.metastasis,
        formula_axis_logic: {
          selected_axes: input.formula_axis,
          component_count: input.formula_components_count,
          complexity_flagged: triggered.some((item) => item.id === "B19_R018")
        },
        safety_wrappers: {
          oncology: matchedPatterns.includes("METASTASIS_GATE") ? ONCOLOGY_DISCLAIMER : "",
          acute_autonomic: evaluated.safetyStops
        },
        clinician_notes: evaluated.clinicianNotes,
        cross_batch_links: biophysicalSubstrateData.cross_batch_links,
        internal_theory_references: input.output_mode === "internal-audit"
          ? {
              internal_backend_translation_map: internalBackendTranslationMap,
              patterns: matchedPatterns.map((id) => PATTERN_BY_ID[id])
            }
          : undefined
      }
    : undefined;

  const result = {
    engine: "biophysical_substrate_engine_v1",
    name: "BIOPHYSICAL_SUBSTRATE_ENGINE_v1.0",
    models: [
      "EZ_OSCILLATOR_MODEL",
      "FASCIA_NERVE_DUAL_CHANNEL_MODEL",
      "CERVICAL_PREVERTEBRAL_PATTERN",
      "METASTASIS_MEANING_LAYER"
    ],
    source: [
      "biophysicalSubstrateEngine.v1.json",
      "ezOscillatorModel.v1.json",
      "fasciaNerveDualChannel.v1.json",
      "cervicalPrevertebralPattern.v1.json",
      "internalBackendTranslationMap.batch19.json"
    ],
    active: true,
    stopped,
    output_mode: input.output_mode,
    matched_patterns: matchedPatterns,
    dominant_pattern: dominant,
    patient,
    contraindications,
    clinician_review_flags: reviewFlags,
    triggered_rules: uniqueRules(triggered),
    seven_cluster_routes: clusterRoutesFor(matchedPatterns),
    integration_routes: {
      treatment_cluster_engine: clusterRoutesFor(matchedPatterns),
      headache_tri_axial_engine: matchedPatterns.includes("TAC_OSCILL") ? ["TAC branch", "cranial autonomic oscillator"] : [],
      cervical_prevertebral_logic: matchedPatterns.includes("CERV_PREVRT"),
      fascia_nerve_dual_channel: matchedPatterns.includes("FASCIA_NERVE_SYSTEM"),
      metastasis_meaning_layer: matchedPatterns.includes("METASTASIS_GATE") ? "practitioner/internal only" : ""
    },
    clinician
  };

  if (input.output_mode === "patient") delete result.clinician;
  return sanitizeForOutput(result);
}

module.exports = {
  evaluateBiophysicalSubstrateEngine,
  biophysicalSubstrateData,
  ezOscillatorModel,
  fasciaNerveDualChannel,
  cervicalPrevertebralPattern,
  internalBackendTranslationMap
};
