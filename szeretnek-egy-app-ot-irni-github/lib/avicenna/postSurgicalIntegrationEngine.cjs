const batch11Data = require("./data/engines/avicenna_engine_batch11.json");
const postSurgicalIntegrationData = require("./data/engines/postSurgicalIntegrationEngine.json");
const reflexologyConcepts = require("./data/libraries/reflexologyConcepts.batch11.json");
const verticalAxisConcepts = require("./data/libraries/verticalAxisConcepts.batch11.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const PATTERNS = batch11Data.patterns || [];
const RULES = postSurgicalIntegrationData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const PATTERN_LABELS = {
  shaoyang_gate_dysfunction: "Shaoyang gate reintegration pattern",
  kd_sp_holding_field_deficiency: "KD-SP holding-field pattern",
  shaoyang_overload_compensatory: "Compensatory Shaoyang overload pattern"
};

const CORE_PHRASES = [
  "Pain may persist because the system failed to restore transition timing.",
  "The foot is the ground-plane reference for the vertical axis.",
  "Treat the holding field before treating compensatory overload.",
  "Shaoyang overload is often secondary, not primary.",
  "Do not suppress pain without reintegration.",
  "Small interventions can reorganise adaptive systems.",
  "Meridians are preferential tension-conduction directions within fascia."
];

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function includes(values, target) {
  return values.includes(target);
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

function normalisePhase(value) {
  if (value === 1 || value === "1" || value === "phase_1" || value === "calm_the_gate") return 1;
  if (value === 2 || value === "2" || value === "phase_2" || value === "restore_flow") return 2;
  if (value === 3 || value === "3" || value === "phase_3" || value === "reintegration") return 3;
  return 0;
}

function parseTimelineDays(value) {
  const text = String(value || "").toLowerCase();
  const number = Number((text.match(/\d+/) || [0])[0]);
  if (!number) {
    if (text.includes("month") || text.includes("year") || text.includes("chronic")) return 90;
    return 0;
  }
  if (text.includes("week")) return number * 7;
  if (text.includes("month")) return number * 30;
  if (text.includes("year")) return number * 365;
  return number;
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.symptom_clusters),
    ...list(input.vertical_axis_signs),
    ...list(input.upper_compensation_signs)
  ];
  const painCharacters = [
    ...list(input.pain_character),
    ...list(input.pain_quality),
    ...list(input.pain_features)
  ];
  const redFlagList = [
    ...list(input.red_flags),
    ...list(input.red_flag_type)
  ];
  const devices = list(input.device_selected);
  const phase = normalisePhase(input.phase_current);
  const timelineDays = parseTimelineDays(input.pain_timeline);
  const woundHealing = input.wound_healing_status || "";
  const headacheType = input.headache_type || "";
  const systemRigidity = input.system_rigidity || "none";

  const result = {
    wound_healing_status: woundHealing,
    pain_character: painCharacters,
    pain_timeline: input.pain_timeline || "",
    timeline_days: timelineDays,
    pain_persists: bool(input.pain_persists)
      || bool(input.post_surgical_pain_persistent)
      || timelineDays >= 42
      || symptoms.includes("persistent_pain"),
    transition_sensitivity: bool(input.transition_sensitivity) || symptoms.includes("transition_sensitive_pain"),
    guarding_present: bool(input.guarding_present) || symptoms.includes("guarding") || symptoms.includes("rigidity"),
    collapse_present: bool(input.collapse_present),
    red_flags: bool(input.red_flags) || redFlagList.length > 0,
    red_flag_type: redFlagList,
    fever: bool(input.fever) || redFlagList.includes("fever"),
    acute_neuro_deficit: bool(input.acute_neuro_deficit) || bool(input.acute_neuro) || redFlagList.includes("acute_neuro") || redFlagList.includes("acute_neuro_deficit"),
    dvt_pe_signs: bool(input.dvt_pe_signs) || bool(input.DVT_PE_signs) || redFlagList.includes("DVT_PE") || redFlagList.includes("dvt_pe"),
    mechanical_tear: bool(input.mechanical_tear) || redFlagList.includes("mechanical_tear"),
    thermal_state: input.thermal_state || "",
    moisture_state: input.moisture_state || "",
    energy_state: input.energy_state || "",
    digestive_sensitivity: bool(input.digestive_sensitivity),
    frailty: bool(input.frailty),
    prolapse_present: bool(input.prolapse_present) || symptoms.includes("prolapse"),
    ligament_instability: bool(input.ligament_instability) || symptoms.includes("ligament_instability") || symptoms.includes("knee_ligament_instability"),
    pes_planus: bool(input.pes_planus) || bool(input.flat_foot) || symptoms.includes("pes_planus") || symptoms.includes("flat_foot"),
    headache_type: headacheType,
    headache_present: bool(input.headache_present) || ["migraine", "tension", "cluster"].includes(headacheType) || any(symptoms, ["migraine", "headache", "eye_pressure", "neck_tension"]),
    heat_sensation: bool(input.heat_sensation) || input.thermal_state === "heat_dominant",
    dryness: bool(input.dryness) || input.moisture_state === "dry",
    Qi_collapse: bool(input.Qi_collapse) || input.energy_state === "collapsed" || symptoms.includes("qi_collapse"),
    stagnation_level: input.stagnation_level || "none",
    cold_dominance: bool(input.cold_dominance) || input.thermal_state === "cold_dominant",
    digestive_weakness_dominant: bool(input.digestive_weakness_dominant),
    system_rigidity: systemRigidity,
    adaptivity_intact: bool(input.adaptivity_intact) || systemRigidity === "none" || systemRigidity === "mild",
    phase_current: phase,
    phase_1_complete: bool(input.phase_1_complete),
    pain_partially_resolved: bool(input.pain_partially_resolved),
    phase_2_complete: bool(input.phase_2_complete),
    guarding_reduced: bool(input.guarding_reduced),
    ginger_requested: bool(input.ginger_requested) || list(input.requested_interventions).includes("ginger"),
    dry_component_confirmed: bool(input.dry_component_confirmed) || bool(input.dryness) || input.moisture_state === "dry",
    device_selected: devices,
    summus_selected: devices.includes("Summus") || bool(input.summus_selected),
    thz_selected: devices.includes("THZ_cell_activator") || bool(input.thz_selected),
    whieda_insole_selected: devices.includes("Whieda_insole") || bool(input.whieda_insole_selected),
    si_joint_dysfunction: bool(input.si_joint_dysfunction) || symptoms.includes("si_joint_dysfunction"),
    cervical_fascia_tension: bool(input.cervical_fascia_tension) || symptoms.includes("cervical_fascia_tension") || symptoms.includes("neck_tension"),
    lateral_fascial_tightness: bool(input.lateral_fascial_tightness) || symptoms.includes("lateral_fascial_tightness"),
    sensory_hypersensitivity: bool(input.sensory_hypersensitivity) || symptoms.includes("sensory_hypersensitivity"),
    scar_line_discomfort: bool(input.scar_line_discomfort) || symptoms.includes("scar_line_discomfort"),
    analgesic_partial_unsustained: bool(input.analgesic_partial_unsustained) || symptoms.includes("partial_analgesic_response"),
    emotionalConstraint: bool(input.emotionalConstraint),
    debugMode: bool(input.debugMode)
  };

  return sanitizeForOutput(result);
}

function blankScores() {
  return {
    shaoyang_gate_dysfunction: { score: 0, evidence: [] },
    kd_sp_holding_field_deficiency: { score: 0, evidence: [] },
    shaoyang_overload_compensatory: { score: 0, evidence: [] }
  };
}

function score(scores, patternName, points, inputName, reason) {
  scores[patternName].score += points;
  scores[patternName].evidence.push({ input: inputName, points, reason });
}

function detectRedFlags(input) {
  const flags = [];
  if (input.fever) flags.push("fever");
  if (input.acute_neuro_deficit) flags.push("acute neurological deficit");
  if (input.dvt_pe_signs) flags.push("possible DVT/PE signs");
  if (input.mechanical_tear) flags.push("possible mechanical tear");
  if (input.red_flags && !flags.length) flags.push("red flag reported");
  return flags;
}

function phaseName(phase) {
  if (phase === 1) return "calm_the_gate";
  if (phase === 2) return "restore_flow";
  if (phase === 3) return "reintegration";
  return "not_selected";
}

function phaseDefinition(phase) {
  const model = postSurgicalIntegrationData.phase_model || {};
  if (phase === 1) return model.phase_1 || {};
  if (phase === 2) return model.phase_2 || {};
  if (phase === 3) return model.phase_3 || {};
  return {};
}

function buildContraindications(input, triggered) {
  const contraindications = [];
  if (input.dry_component_confirmed) contraindications.push("Exclude ginger during dry-component presentation.");
  if (input.stagnation_level === "strong") contraindications.push("Contraindicate Liu Wei Di Huang Wan while strong stagnation dominates.");
  if (input.cold_dominance) contraindications.push("Contraindicate Liu Wei Di Huang Wan while cold dominance is present.");
  if (input.digestive_weakness_dominant) contraindications.push("Contraindicate Liu Wei Di Huang Wan while digestive weakness dominates; prioritise SP-Qi stabilisation.");
  if (input.frailty) contraindications.push("Reduce formula complexity and avoid multi-herb stacks.");
  if (input.digestive_sensitivity) contraindications.push("Simplify formulas and avoid GI-irritating herbs.");
  if (triggered.some((item) => item.id === "B11_R003")) {
    contraindications.push("During Phase 1, avoid strong blood movers and aggressive mobilisation.");
  }
  return [...new Set(contraindications)];
}

function sequenceFor(input, primaryPattern, detectedPhase, compensationSecondary) {
  const sequence = [];
  if (primaryPattern === "kd_sp_holding_field_deficiency" || compensationSecondary) {
    sequence.push("Start with KD1-3 + SP4-6 + plantar zones before treating upper Shaoyang signs.");
    if (input.Qi_collapse) sequence.push("Qi collapse dominant: Huang Qi + Si Jun Zi Tang base before Yin restoration.");
    if (!input.Qi_collapse && input.heat_sensation && input.dryness && input.stagnation_level !== "strong" && !input.cold_dominance && !input.digestive_weakness_dominant) {
      sequence.push("Liu Wei Di Huang Wan may be considered only within clinician review for Yin nourishment criteria.");
    }
  }

  if (primaryPattern === "shaoyang_gate_dysfunction") {
    if (detectedPhase === 1) sequence.push("Phase 1 calm_the_gate: Spirulina, Vitamin D, Nigella, gentle laser, sleep rhythm support; optional melatonin only for evening overactivation.");
    if (detectedPhase === 2) sequence.push("Phase 2 restore_flow: mild microcirculatory support, weak ginger only if no dry component, gentle warming laser.");
    if (detectedPhase === 3) sequence.push("Phase 3 reintegration: cardiometabolic flow support if indicated, collagen only if instability confirmed, progressive movement.");
  }

  if (input.whieda_insole_selected || primaryPattern === "kd_sp_holding_field_deficiency") {
    sequence.push("Device Phase 1: Whieda insole as mechanical axis and low-intensity KD/SP reflex stimulation.");
  }
  if (input.thz_selected) sequence.push("Device Phase 2: THZ / cell activator only below knee, below elbow, or scalp; superficial gate priming only.");
  if (input.summus_selected) sequence.push("Device Phase 3: Summus laser for deep field ordering and mitochondrial tonal restoration, not Yang boosting.");
  return [...new Set(sequence)];
}

function rigidityIndex(input) {
  const map = { none: 0, mild: 1, moderate: 2, severe: 3 };
  const rigidity = map[input.system_rigidity] || 0;
  const adaptivity = input.adaptivity_intact ? 3 - Math.min(rigidity, 3) : 0;
  const finalResult = {
    rigidity_level: input.system_rigidity,
    rigidity_score: rigidity,
    adaptivity_intact: input.adaptivity_intact,
    adaptivity_score: adaptivity,
    interpretation: rigidity >= 2
      ? "Chronic rigidity may reduce responsiveness; pace lower-intensity field inputs."
      : "Residual adaptivity appears present; lower-intensity interventions may be more informative."
  };

  return sanitizeForOutput(finalResult);
}

function evaluatePostSurgicalIntegration(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const redFlags = detectRedFlags(input);
  if (redFlags.length) {
    return {
      engine: "vertical_axis_post_surgical_integration",
      name: "Vertical Axis & Post-Surgical Integration Engine",
      subtitle: "Shaoyang Gate / KD-SP Holding Field / CDR3 Integration Module",
      stopped: true,
      red_flag_status: { present: true, flags: redFlags },
      triggered_rules: [rule("B11_R002", redFlags.join(", "))],
      patient: {
        title: "Medical safety check needed",
        summary: "A red flag was reported, so this educational engine stops before terrain interpretation. Please seek Western medical workup before using symbolic pattern guidance.",
        safety_notes: [
          "This is an educational pattern-recognition tool, not a medical diagnosis.",
          "Fever, acute neurological deficit, DVT/PE signs, or mechanical tear signs require clinician review."
        ],
        sequence: []
      },
      clinician: {
        red_flag_status: { present: true, flags: redFlags },
        contraindications: ["Do not output supplement, herb, device, or movement sequencing before medical workup."]
      }
    };
  }

  const scores = blankScores();
  const triggered = [];

  const gatePainCharacter = any(input.pain_character, ["burning", "pulling", "deep_aching", "moving", "diffuse", "oscillating"]);
  if (input.wound_healing_status === "healed" && input.pain_persists && input.transition_sensitivity && input.guarding_present) {
    triggered.push(rule("B11_R001", "healed tissue + persistent transition-sensitive guarded pain"));
    score(scores, "shaoyang_gate_dysfunction", 8, "post_surgical_gate", "wound healed, pain persists, transitions worsen, guarding dominant");
  }
  if (gatePainCharacter) score(scores, "shaoyang_gate_dysfunction", 2, "pain_character", "burning/pulling/deep aching or oscillating quality");
  if (input.scar_line_discomfort) score(scores, "shaoyang_gate_dysfunction", 2, "scar_line_discomfort", "scar-line discomfort");
  if (input.analgesic_partial_unsustained) score(scores, "shaoyang_gate_dysfunction", 2, "analgesic_response", "partial but non-sustained analgesic response");
  if (input.thermal_state === "heat_dominant" || input.heat_sensation) score(scores, "shaoyang_gate_dysfunction", 1, "heat_sensitivity", "heat sensitivity can load Shaoyang gate");

  if (input.pes_planus) score(scores, "kd_sp_holding_field_deficiency", 4, "pes_planus", "foot arch as ground-plane reference");
  if (input.prolapse_present) score(scores, "kd_sp_holding_field_deficiency", 4, "prolapse", "holding-field weakness");
  if (input.ligament_instability) score(scores, "kd_sp_holding_field_deficiency", 3, "ligament_instability", "structural holding weakness");
  if (input.Qi_collapse || input.energy_state === "deficient" || input.energy_state === "collapsed") {
    score(scores, "kd_sp_holding_field_deficiency", 3, "energy_state", "Qi collapse / exhaustion signal");
  }
  if (input.headache_present && (input.pes_planus || input.Qi_collapse || input.ligament_instability || input.prolapse_present)) {
    score(scores, "kd_sp_holding_field_deficiency", 2, "upper_pole_compensation", "headache may be upper-pole compensation");
  }

  const shaoyangOverloadSigns = [
    input.headache_type === "migraine",
    input.si_joint_dysfunction,
    input.ligament_instability,
    input.cervical_fascia_tension,
    input.lateral_fascial_tightness,
    input.sensory_hypersensitivity
  ].filter(Boolean).length;
  if (shaoyangOverloadSigns >= 2) {
    score(scores, "shaoyang_overload_compensatory", 4, "shaoyang_overload_signs", "migraine/SI/knee/cervical/lateral fascia signs");
  }
  const kdSpLikely = scores.kd_sp_holding_field_deficiency.score >= 4;
  if (scores.shaoyang_overload_compensatory.score > 0 && kdSpLikely) {
    triggered.push(rule("B11_R014", "Shaoyang overload with KD-SP holding evidence"));
    score(scores, "shaoyang_overload_compensatory", 2, "root_holding_deficiency", "secondary GB/SJ overload from lower-axis weakness");
  }

  const currentPhase = input.phase_current;
  let detectedPhase = currentPhase;
  if (!detectedPhase) {
    if (input.phase_2_complete && input.guarding_reduced) detectedPhase = 3;
    else if (input.phase_1_complete && input.pain_partially_resolved) detectedPhase = 2;
    else detectedPhase = scores.shaoyang_gate_dysfunction.score > 0 ? 1 : 0;
  }

  if (scores.shaoyang_gate_dysfunction.score > 0 && detectedPhase === 1) triggered.push(rule("B11_R003", "Shaoyang gate dysfunction in Phase 1"));
  if (input.ginger_requested && input.dry_component_confirmed) triggered.push(rule("B11_R004", "ginger requested with dry component"));
  if (input.phase_1_complete && input.pain_partially_resolved) triggered.push(rule("B11_R005", "Phase 1 complete with partial pain resolution"));
  if (input.phase_2_complete && input.guarding_reduced) triggered.push(rule("B11_R006", "Phase 2 complete with guarding reduced"));
  if (kdSpLikely && input.Qi_collapse) triggered.push(rule("B11_R007", "KD-SP pattern with Qi collapse"));
  if (kdSpLikely && !input.Qi_collapse && input.heat_sensation && input.dryness) triggered.push(rule("B11_R008", "KD-SP pattern with Yin nourishment criteria"));
  if (kdSpLikely && input.stagnation_level === "strong") triggered.push(rule("B11_R009", "KD-SP pattern with strong stagnation"));
  if (kdSpLikely && input.cold_dominance) triggered.push(rule("B11_R010", "KD-SP pattern with cold dominance"));
  if (kdSpLikely && input.digestive_weakness_dominant) triggered.push(rule("B11_R011", "KD-SP pattern with digestive weakness dominant"));
  if (input.headache_present && kdSpLikely) triggered.push(rule("B11_R012", "headache with KD-SP holding-field evidence"));
  if (input.headache_type === "acute_structural" || input.headache_type === "inflammatory_lesion") triggered.push(rule("B11_R013", "acute structural or inflammatory headache type"));
  if (input.frailty) triggered.push(rule("B11_R015", "frailty present"));
  if (input.digestive_sensitivity) triggered.push(rule("B11_R016", "digestive sensitivity present"));
  if (input.summus_selected && kdSpLikely) triggered.push(rule("B11_R017", "Summus selected for KD-SP holding field"));
  if (input.thz_selected) triggered.push(rule("B11_R018", "THZ / cell activator selected"));
  if (["moderate", "severe"].includes(input.system_rigidity)) triggered.push(rule("B11_R019", "chronic rigid state"));
  if (input.adaptivity_intact) triggered.push(rule("B11_R020", "residual adaptivity intact"));

  const ordered = Object.entries(scores)
    .map(([name, value]) => ({ pattern: name, ...value }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  let primary = ordered[0] || { pattern: "", score: 0, evidence: [] };
  const compensationDetected = scores.shaoyang_overload_compensatory.score > 0;
  if (compensationDetected && kdSpLikely && primary.pattern === "shaoyang_overload_compensatory") {
    primary = {
      pattern: "kd_sp_holding_field_deficiency",
      score: scores.kd_sp_holding_field_deficiency.score,
      evidence: scores.kd_sp_holding_field_deficiency.evidence
    };
  }
  const primaryPattern = pattern(primary.pattern);
  const phase = phaseDefinition(detectedPhase);
  const contraindications = buildContraindications(input, triggered);
  const suggestedSequence = sequenceFor(input, primary.pattern, detectedPhase, compensationDetected && kdSpLikely);
  const rigidity = rigidityIndex(input);

  const finalResult = {
    engine: "vertical_axis_post_surgical_integration",
    name: "Vertical Axis & Post-Surgical Integration Engine",
    subtitle: "Shaoyang Gate / KD-SP Holding Field / CDR3 Integration Module",
    source: ["avicenna_engine_batch11.json", "postSurgicalIntegrationEngine.json"],
    stopped: false,
    active: Boolean(primary.pattern),
    primary_pattern: primary.pattern,
    primary_pattern_label: PATTERN_LABELS[primary.pattern] || "Unclear vertical-axis pattern",
    matched_patterns: ordered.map((item) => item.pattern),
    pattern_scores: scores,
    detected_phase: detectedPhase,
    detected_phase_name: phaseName(detectedPhase),
    phase_definition: phase,
    gate_status: scores.shaoyang_gate_dysfunction.score > 0 ? "possible Shaoyang transitional gate failure" : "not dominant",
    kd_sp_holding_status: kdSpLikely ? "holding-field deficiency likely" : "not dominant",
    shaoyang_compensation_status: compensationDetected
      ? "compensatory Shaoyang overload detected; treat holding field before upper/lateral overload"
      : "not dominant",
    rigidity_adaptivity_index: rigidity,
    triggered_rules: uniqueRules(triggered),
    contraindications,
    suggested_sequence: suggestedSequence,
    root_priority: compensationDetected && kdSpLikely
      ? "KD-SP holding field before Shaoyang overload"
      : primary.pattern || "insufficient evidence",
    why_headache_may_be_compensatory: input.headache_present
      ? "Headache may represent upper-pole compensation when the lower KD-SP holding field cannot receive and discharge load."
      : "",
    why_post_surgical_pain_may_persist: scores.shaoyang_gate_dysfunction.score > 0
      ? "Post-surgical pain may persist despite tissue healing when the system has not restored transition timing between repair and function."
      : "",
    reflexology_concepts: reflexologyConcepts,
    vertical_axis_concepts: verticalAxisConcepts,
    cross_batch_links: postSurgicalIntegrationData.cross_batch_links || [],
    core_phrases: CORE_PHRASES,
    patient: {
      title: PATTERN_LABELS[primary.pattern] || "Vertical-axis reintegration pattern",
      summary: primary.pattern
        ? "This may reflect a transition and reintegration pattern rather than a simple local tissue problem. This is an educational pattern-recognition tool, not a medical diagnosis."
        : "No dominant vertical-axis pattern was identified from the current inputs. This is an educational pattern-recognition tool, not a medical diagnosis.",
      phase: detectedPhase ? `Phase ${detectedPhase}: ${phaseName(detectedPhase)}` : "Phase not selected",
      sequence: suggestedSequence,
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "Medication changes and post-surgical concerns must be discussed with a clinician.",
        "This engine does not claim fascia-water models are established medical fact."
      ]
    },
    clinician: {
      detected_phase: detectedPhase,
      gate_status: scores.shaoyang_gate_dysfunction,
      kd_sp_holding_status: scores.kd_sp_holding_field_deficiency,
      shaoyang_compensation_status: scores.shaoyang_overload_compensatory,
      rigidity_adaptivity_index: rigidity,
      triggered_rules: uniqueRules(triggered),
      contraindications,
      suggested_sequence: suggestedSequence,
      why_headache_may_be_compensatory: input.headache_present
        ? "Lower pole cannot receive/discharge, so the upper pole may compensate through migraine, neck tension, eye pressure, or sensory hypersensitivity."
        : "",
      why_post_surgical_pain_may_persist: scores.shaoyang_gate_dysfunction.score > 0
        ? "Tissue may be healed while CDR3-style transition timing remains incomplete: fascial-water-grid fragmentation, neurovascular desynchronisation, incomplete drainage, and guarding loop."
        : "",
      reflexology_concepts: reflexologyConcepts,
      vertical_axis_concepts: verticalAxisConcepts,
      primary_pattern_data: primaryPattern
    }
  };

  return sanitizeForOutput(finalResult);
}

module.exports = {
  evaluatePostSurgicalIntegration,
  batch11Data,
  postSurgicalIntegrationData,
  reflexologyConcepts,
  verticalAxisConcepts
};
