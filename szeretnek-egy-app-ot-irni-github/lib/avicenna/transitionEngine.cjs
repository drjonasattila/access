const batch15Data = require("./data/engines/avicenna_engine_batch15.json");
const transitionEngineData = require("./data/engines/transitionEngine.v1.json");
const tthModuleData = require("./data/engines/tthModule.v1.json");
const unifiedTransitionMap = require("./data/libraries/unifiedTransitionMap.json");
const treatmentClusters = require("./data/libraries/treatmentClusters.v1.json");

const RULES = transitionEngineData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));
const PATTERNS = batch15Data.patterns || [];
const TTH_PATTERN = PATTERNS.find((pattern) => pattern.name === "tth_static_tension") || {};
const ROLE_PATTERNS = Object.fromEntries(
  PATTERNS.filter((pattern) => pattern.trauma_role).map((pattern) => [pattern.trauma_role, pattern])
);

const AXES = [
  {
    id: "taiyang",
    name: "Posterior Sensory Axis",
    meridian: "Taiyang BL/SI",
    cluster: "Posterior Sensory Pressure Modulation"
  },
  {
    id: "shaoyang",
    name: "Lateral Autonomic Axis",
    meridian: "Shaoyang GB/TB",
    cluster: "Lateral Autonomic Decompression"
  },
  {
    id: "yangming",
    name: "Anterior Metabolic Axis",
    meridian: "Yangming ST/LI",
    cluster: "Metabolic Rebalancing"
  },
  {
    id: "taiyin",
    name: "Midline Interoceptive Axis",
    meridian: "Taiyin LU/SP",
    cluster: "Interoceptive Regulation"
  },
  {
    id: "shaoyin",
    name: "Survival/Emotional Axis",
    meridian: "Shaoyin HT/KD",
    cluster: "Survival-Axis Stabilization"
  },
  {
    id: "jueyin",
    name: "Deep Autonomic-Vascular Axis",
    meridian: "Jueyin LV/PC",
    cluster: "Microcirculatory Restoration"
  },
  {
    id: "central",
    name: "Central Integration Axis",
    meridian: "Ren/Du",
    cluster: "Central Coherence Support"
  }
];

const AXIS_BY_ID = Object.fromEntries(AXES.map((axis) => [axis.id, axis]));
const AXIS_ALIASES = {
  taiyang: "taiyang",
  posterior: "taiyang",
  "posterior sensory axis": "taiyang",
  shaoyang: "shaoyang",
  lateral: "shaoyang",
  "lateral autonomic axis": "shaoyang",
  yangming: "yangming",
  anterior: "yangming",
  "anterior metabolic axis": "yangming",
  taiyin: "taiyin",
  midline: "taiyin",
  "midline interoceptive axis": "taiyin",
  shaoyin: "shaoyin",
  survival: "shaoyin",
  "survival/emotional axis": "shaoyin",
  jueyin: "jueyin",
  vascular: "jueyin",
  "deep autonomic-vascular axis": "jueyin",
  central: "central",
  "central integration axis": "central",
  "ren/du": "central"
};

const TRANSITION_RULES = [
  {
    id: "Jueyin -> Shaoyang",
    from: "jueyin",
    to: "shaoyang",
    ruleId: "B15_R018",
    priority: 4,
    trigger: (input, scores) => scores.jueyin >= 40 && scores.shaoyang >= 40 || input.migraine_like && input.visceral_sensitivity_high
  },
  {
    id: "Shaoyang -> Yangming",
    from: "shaoyang",
    to: "yangming",
    priority: 3,
    trigger: (input, scores) => scores.shaoyang >= 45 && scores.yangming >= 35 || input.migraine_like && input.metabolic_or_anterior_load
  },
  {
    id: "Shaoyang -> Taiyin",
    from: "shaoyang",
    to: "taiyin",
    priority: 3,
    trigger: (input, scores) => scores.shaoyang >= 35 && scores.taiyin >= 40 && (input.exertional_intolerance || input.fatigue_or_collapse)
  },
  {
    id: "Taiyin collapse",
    from: "taiyin",
    to: "central",
    ruleId: "B15_R021",
    priority: 7,
    trigger: (input, scores) => scores.taiyin >= 55 && (scores.central >= 45 || input.fibromyalgia_like || input.cfs_like)
  },
  {
    id: "Taiyang -> Shaoyin",
    from: "taiyang",
    to: "shaoyin",
    ruleId: "B15_R020",
    priority: 5,
    trigger: (input, scores) => scores.taiyang >= 45 && scores.shaoyin >= 35 || input.tth_candidate && (input.orthostatic_symptoms || input.emotional_survival_high)
  },
  {
    id: "Yangming -> Taiyin",
    from: "yangming",
    to: "taiyin",
    priority: 3,
    trigger: (input, scores) => scores.yangming >= 40 && scores.taiyin >= 35 && input.visceral_sensitivity_high
  },
  {
    id: "Shaoyang -> Jueyin",
    from: "shaoyang",
    to: "jueyin",
    ruleId: "B15_R019",
    priority: 9,
    trigger: (input, scores) => scores.shaoyang >= 40 && scores.jueyin >= 50 && (input.neuropathic_high || input.pelvic_autonomic_symptoms)
  },
  {
    id: "Central -> Shaoyin",
    from: "central",
    to: "shaoyin",
    priority: 4,
    trigger: (input, scores) => scores.central >= 45 && scores.shaoyin >= 40 && (input.panic_like || input.orthostatic_symptoms)
  }
];

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

function includesAny(values, targets) {
  const haystack = list(values).map((value) => lower(value).replace(/\s+/g, "_"));
  return targets.some((target) => haystack.some((item) => item.includes(target)));
}

function isHigh(value) {
  return value === "high" || value === "severe" || value === true || value === "true";
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

function transitionNode(id) {
  return (transitionEngineData.transition_nodes || []).find((node) => node.transition === id) || {};
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.existing_diagnosis),
    ...list(input.pain_syndromes),
    ...list(input.pain_topology),
    ...list(input.neuropathic_descriptors),
    ...list(input.emotional_survival_axis_features)
  ];
  const headacheQuality = input.headache_quality || "";
  const headacheLaterality = input.headache_laterality || "";
  const traumaRole = ["victim", "savior", "perpetrator"].includes(input.trauma_role) ? input.trauma_role : "none";
  const visceralSensitivityHigh = isHigh(input.visceral_sensitivity) || includesAny(symptoms, ["ibs", "bloating", "dyspepsia", "visceral", "abdominal", "chest_tightness"]);
  const lateralHigh = isHigh(input.lateral_MSK_tension) || includesAny(symptoms, ["tmj", "lateral", "neck_shoulder", "gb", "side"]);
  const neuropathicHigh = isHigh(input.neuropathic_descriptors) || includesAny(symptoms, ["burning", "electric", "allodynia", "crps", "neuropathic"]);
  const emotionalSurvivalHigh = isHigh(input.emotional_survival_axis_features) || includesAny(symptoms, ["panic", "palpitations", "survival", "fear", "orthostatic"]);
  const posteriorTopology = includesAny(symptoms, ["neck", "shoulder", "posterior", "occipital", "low_back", "myofascial", "tth"]);
  const metabolicOrAnteriorLoad = includesAny(symptoms, ["metabolic", "nafld", "diabetic", "anterior", "front_wall", "rigid_fascia"]) || input.germ_layer_dominance === "endoderm";
  const centralLoad = includesAny(symptoms, ["fibromyalgia", "cfs", "sensory_overload", "adhd", "systemic", "whole_body"]);
  const migraineLike = includesAny(symptoms, ["migraine", "aura"]) || bool(input.photophobia_present) || bool(input.phonophobia_present);
  const tthCandidate = isTthInput({
    ...input,
    headache_quality: headacheQuality,
    headache_laterality: headacheLaterality,
    vomiting_present: bool(input.vomiting_present)
  });

  return {
    systemMode: input.systemMode === "clinician" ? "clinician" : "patient",
    headache_quality: headacheQuality,
    headache_laterality: headacheLaterality,
    headache_frequency_days_per_month: Number(input.headache_frequency_days_per_month || 0),
    nausea_present: bool(input.nausea_present),
    vomiting_present: bool(input.vomiting_present),
    photophobia_present: bool(input.photophobia_present),
    phonophobia_present: bool(input.phonophobia_present),
    aggravated_by_activity: bool(input.aggravated_by_activity),
    red_flag_present: bool(input.red_flag_present),
    yin_depletion_signs: bool(input.yin_depletion_signs),
    heat_signs: bool(input.heat_signs),
    heat_toxicity_overlay: bool(input.heat_toxicity_overlay),
    persistent_tension: bool(input.persistent_tension),
    yin_support_fails: bool(input.yin_support_fails),
    trauma_role: traumaRole,
    trauma_role_history: list(input.trauma_role_history),
    germ_layer_dominance: input.germ_layer_dominance || "unknown",
    autonomic_state: input.autonomic_state || "unknown",
    pain_topology: input.pain_topology || "",
    lateral_MSK_tension: input.lateral_MSK_tension || "unknown",
    visceral_sensitivity: input.visceral_sensitivity || "unknown",
    neuropathic_descriptors: list(input.neuropathic_descriptors),
    exertional_intolerance: bool(input.exertional_intolerance),
    orthostatic_symptoms: bool(input.orthostatic_symptoms),
    pelvic_autonomic_symptoms: bool(input.pelvic_autonomic_symptoms),
    emotional_survival_axis_features: input.emotional_survival_axis_features || "unknown",
    symptom_weight_scores: input.symptom_weight_scores && typeof input.symptom_weight_scores === "object" ? input.symptom_weight_scores : {},
    axis_probability_scores: input.axis_probability_scores && typeof input.axis_probability_scores === "object" ? input.axis_probability_scores : {},
    stability_state: input.stability_state || "unknown",
    medication_overuse_present: bool(input.medication_overuse_present),
    trauma_roles_treated_static: bool(input.trauma_roles_treated_static),
    pain_syndromes_primary_keys: bool(input.pain_syndromes_primary_keys),
    symptoms,
    posterior_topology: posteriorTopology,
    visceral_sensitivity_high: visceralSensitivityHigh,
    lateral_high: lateralHigh,
    neuropathic_high: neuropathicHigh,
    emotional_survival_high: emotionalSurvivalHigh,
    metabolic_or_anterior_load: metabolicOrAnteriorLoad,
    central_load: centralLoad,
    migraine_like: migraineLike,
    tth_candidate: tthCandidate,
    fibromyalgia_like: includesAny(symptoms, ["fibromyalgia"]),
    cfs_like: includesAny(symptoms, ["cfs", "chronic_fatigue"]),
    panic_like: includesAny(symptoms, ["panic"]) || input.autonomic_state === "panic",
    fatigue_or_collapse: input.autonomic_state === "collapse" || input.autonomic_state === "freeze" || includesAny(symptoms, ["fatigue", "collapse"])
  };
}

function isTthInput(input) {
  const quality = lower(input.headache_quality);
  const pressing = quality.includes("press") || quality.includes("tight");
  const bilateral = lower(input.headache_laterality).includes("bilateral");
  const photoAndPhono = bool(input.photophobia_present) && bool(input.phonophobia_present);
  return pressing &&
    bilateral &&
    !bool(input.aggravated_by_activity) &&
    !bool(input.nausea_present) &&
    !bool(input.vomiting_present) &&
    !photoAndPhono &&
    !bool(input.red_flag_present);
}

function addContribution(contributions, axis, weight, reason) {
  if (!weight) return;
  const bounded = Math.max(0, Math.min(3, Number(weight)));
  contributions[axis].push({ weight: bounded, reason });
}

function calculateAxisScores(input) {
  const contributions = Object.fromEntries(AXES.map((axis) => [axis.id, []]));

  if (input.tth_candidate) addContribution(contributions, "taiyang", 3, "TTH static tension candidate");
  if (input.posterior_topology) addContribution(contributions, "taiyang", 3, "posterior / neck / shoulder / myofascial topology");
  if (input.trauma_role === "savior") addContribution(contributions, "taiyang", 2, "dynamic savior role currently active");
  if (input.headache_quality && (lower(input.headache_quality).includes("press") || lower(input.headache_quality).includes("tight"))) addContribution(contributions, "taiyang", 2, "pressing/tightening headache quality");

  if (input.migraine_like) addContribution(contributions, "shaoyang", 3, "migraine-like sensory adaptation load");
  if (input.lateral_high) addContribution(contributions, "shaoyang", 3, "lateral MSK/autonomic tension");
  if (input.heat_signs) addContribution(contributions, "shaoyang", 1, "heat signs");
  if (input.autonomic_state === "spike" || input.autonomic_state === "hyperarousal") addContribution(contributions, "shaoyang", 2, "sympathetic spike / hyperarousal");

  if (input.metabolic_or_anterior_load) addContribution(contributions, "yangming", 3, "metabolic or anterior-wall load");
  if (input.trauma_role === "perpetrator") addContribution(contributions, "yangming", 2, "dynamic perpetrator role currently active");
  if (input.heat_signs && input.visceral_sensitivity_high) addContribution(contributions, "yangming", 2, "heat with digestive/anterior load");

  if (input.visceral_sensitivity_high) addContribution(contributions, "taiyin", 3, "visceral/interoceptive sensitivity");
  if (input.exertional_intolerance) addContribution(contributions, "taiyin", 3, "exertional intolerance");
  if (input.trauma_role === "victim") addContribution(contributions, "taiyin", 2, "dynamic victim role currently active");
  if (input.autonomic_state === "collapse" || input.autonomic_state === "freeze") addContribution(contributions, "taiyin", 2, "freeze/collapse trajectory");

  if (input.orthostatic_symptoms) addContribution(contributions, "shaoyin", 3, "orthostatic symptoms");
  if (input.pelvic_autonomic_symptoms) addContribution(contributions, "shaoyin", 2, "pelvic autonomic symptoms");
  if (input.emotional_survival_high) addContribution(contributions, "shaoyin", 3, "emotional/survival axis features");
  if (input.trauma_role === "savior") addContribution(contributions, "shaoyin", 1, "savior Taiyang -> Shaoyin axis");

  if (input.neuropathic_high) addContribution(contributions, "jueyin", 3, "neuropathic / vascular-autonomic descriptors");
  if (input.pelvic_autonomic_symptoms) addContribution(contributions, "jueyin", 3, "pelvic autonomic pain pathway");
  if (input.trauma_role === "victim") addContribution(contributions, "jueyin", 2, "victim Jueyin entry point");
  if (input.trauma_role === "perpetrator") addContribution(contributions, "jueyin", 1, "externalised load with vascular-congestion risk");

  if (input.central_load) addContribution(contributions, "central", 3, "systemic / cross-domain amplification");
  if (input.neuropathic_high && input.emotional_survival_high) addContribution(contributions, "central", 2, "neural + survival-axis coupling");
  if (input.exertional_intolerance && input.visceral_sensitivity_high) addContribution(contributions, "central", 2, "interoceptive + exertional collapse");

  for (const [key, value] of Object.entries(input.symptom_weight_scores || {})) {
    const axisId = AXIS_ALIASES[lower(key)] || key;
    if (contributions[axisId]) addContribution(contributions, axisId, value, "external symptom weight score");
  }

  const calculated = {};
  const raw = {};
  const evidence = {};
  for (const axis of AXES) {
    raw[axis.id] = contributions[axis.id].reduce((sum, item) => sum + item.weight, 0);
    calculated[axis.id] = Math.min(100, Math.round(raw[axis.id] / 12 * 100));
    evidence[axis.id] = contributions[axis.id];
  }

  for (const [key, value] of Object.entries(input.axis_probability_scores || {})) {
    const axisId = AXIS_ALIASES[lower(key)] || key;
    if (calculated[axisId] !== undefined) {
      calculated[axisId] = Math.max(0, Math.min(100, Number(value)));
      evidence[axisId].push({ weight: 0, reason: "external axis probability override" });
    }
  }

  const ranked = AXES
    .map((axis) => ({
      ...axis,
      score: calculated[axis.id],
      raw_score: raw[axis.id],
      evidence: evidence[axis.id]
    }))
    .sort((a, b) => b.score - a.score);

  return { scores: calculated, raw_scores: raw, evidence, ranked };
}

function detectTransitions(input, axisScores) {
  const detected = [];
  for (const item of TRANSITION_RULES) {
    if (!item.trigger(input, axisScores)) continue;
    const node = transitionNode(item.id);
    detected.push({
      transition: item.id,
      meaning: node.meaning || "",
      likely_manifestation: node.typical_manifestation || [],
      clinical_explanation: node.backend_note || "",
      from_axis: item.from,
      to_axis: item.to,
      score: (axisScores[item.from] || 0) + (axisScores[item.to] || 0),
      priority: item.priority || 0,
      rule_id: item.ruleId || ""
    });
  }
  detected.sort((a, b) => b.score - a.score || b.priority - a.priority);
  return {
    primary_transition: detected[0] || null,
    secondary_transition: detected[1] || null,
    all: detected
  };
}

function classifyExpression(input, axisScores) {
  const neurovascular = Math.max(axisScores.jueyin, axisScores.shaoyang) + (input.migraine_like || input.pelvic_autonomic_symptoms || input.neuropathic_high ? 20 : 0);
  const mechanical = Math.max(axisScores.taiyang, axisScores.yangming) + (input.tth_candidate || input.posterior_topology ? 20 : 0);
  const amplification = Math.max(axisScores.taiyin, axisScores.shaoyin, axisScores.central) + (input.central_load || input.panic_like || input.visceral_sensitivity_high ? 20 : 0);
  const rows = [
    {
      name: "Neurovascular Expression",
      score: neurovascular,
      axis_bias: ["Jueyin", "Shaoyang"]
    },
    {
      name: "Mechanical-Fascial Expression",
      score: mechanical,
      axis_bias: ["Taiyang", "Yangming"]
    },
    {
      name: "Autonomic-Sensory Amplification",
      score: amplification,
      axis_bias: ["Taiyin", "Shaoyin", "Central"]
    }
  ].sort((a, b) => b.score - a.score);
  return rows[0];
}

function roleStatus(input) {
  const pattern = ROLE_PATTERNS[input.trauma_role] || null;
  if (!pattern) {
    return {
      current_role: "none",
      dynamic_enum: true,
      reassessment_required: true,
      matched_pattern: "",
      do_rules: [],
      do_not_rules: []
    };
  }
  return {
    current_role: input.trauma_role,
    dynamic_enum: true,
    reassessment_required: true,
    matched_pattern: pattern.name,
    germ_layer: pattern.germ_layer,
    meridian_axis: pattern.meridian_axis,
    do_rules: pattern.interventions?.do || [],
    do_not_rules: pattern.interventions?.do_not || [],
    note: "Trauma roles are dynamic enums and may switch over time; reassess rather than treating them as identity labels."
  };
}

function blockedClusterNames(input, role, transitions) {
  const blocked = new Set();
  if (role.current_role === "victim") {
    blocked.add("Lateral Autonomic Decompression");
  }
  if (transitions.all.some((item) => item.transition === "Taiyin collapse")) {
    blocked.add("Lateral Autonomic Decompression");
  }
  return blocked;
}

function selectTreatmentClusters(input, axis, role, transitions, doNotRules) {
  const blocked = blockedClusterNames(input, role, transitions);
  const sorted = axis.ranked.filter((item) => item.score > 0);
  const selected = [];
  const suppressed = [];

  for (const item of sorted) {
    const cluster = AXIS_BY_ID[item.id].cluster;
    if (blocked.has(cluster)) {
      suppressed.push({
        cluster,
        axis: item.id,
        reason: "blocked by DO_NOT hierarchy"
      });
      continue;
    }
    if (!selected.some((row) => row.cluster === cluster)) {
      selected.push({ cluster, axis: item.id, score: item.score });
    }
    if (selected.length >= 2) break;
  }

  return {
    primary: selected[0] || null,
    secondary: selected[1] || null,
    suppressed,
    hierarchy_applied: doNotRules.length > 0 || suppressed.length > 0,
    rule: "DO_NOT rules > DO rules > intervention choice"
  };
}

function backendFormulaLogic(input, tthActive) {
  const formulas = [];
  if (tthActive && input.yin_depletion_signs) {
    formulas.push({
      name: "Liu Wei Di Huang Wan / Zhi Bai Di Huang Wan",
      condition: "TTH + Yin depletion",
      visibility: "backend_only"
    });
  }
  if (tthActive && input.heat_signs && input.heat_toxicity_overlay) {
    formulas.push({
      name: "Huang Lian Jie Du Tang",
      condition: "TTH + heat signs + heat toxicity overlay",
      visibility: "backend_only"
    });
  }
  return formulas;
}

function clinicalSummary(input, expression, transitions, clusters) {
  if (input.red_flag_present) {
    return "Red flag features are present, so this educational router stops before integrative pattern logic and prioritises urgent conventional medical assessment.";
  }
  const transitionText = transitions.primary_transition
    ? `The leading transition is ${transitions.primary_transition.transition}, suggesting ${transitions.primary_transition.meaning.toLowerCase()}.`
    : "No dominant transition is strongly activated from the current inputs.";
  const clusterText = clusters.primary
    ? `The current support direction is ${clusters.primary.cluster}${clusters.secondary ? ` with secondary ${clusters.secondary.cluster}` : ""}.`
    : "Cluster selection is withheld because safety or DO_NOT hierarchy blocked it.";
  return `${expression.name} is the leading expression category. ${transitionText} ${clusterText}`;
}

function evaluateTransitionEngine(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];

  if (input.trauma_roles_treated_static) {
    triggered.push(rule("B15_R022", "caller attempted static trauma role classification"));
  }
  if (input.pain_syndromes_primary_keys) {
    triggered.push(rule("B15_R023", "caller attempted pain syndrome as primary key"));
  }
  if (input.trauma_roles_treated_static || input.pain_syndromes_primary_keys) {
    return {
      engine: "transition_engine_v1",
      name: "TRANSITION_ENGINE_v1.0",
      rejected: true,
      stopped: false,
      triggered_rules: uniqueRules(triggered),
      patient: {
        title: "Transition router rejected unsafe classification shape",
        summary: "This router requires dynamic role, germ-layer, and axis reasoning. Pain labels remain secondary attributes. This is an educational pattern-recognition tool, not a medical diagnosis.",
        safety_notes: ["This is an educational pattern-recognition tool, not a medical diagnosis."]
      },
      clinician: {
        reject_reason: "Trauma roles cannot be static and pain syndromes cannot be primary classification keys."
      }
    };
  }

  if (input.red_flag_present) {
    triggered.push(rule("B15_R001", "red flag present"));
    return {
      engine: "transition_engine_v1",
      name: "TRANSITION_ENGINE_v1.0",
      stopped: true,
      rejected: false,
      active: false,
      triggered_rules: uniqueRules(triggered),
      clinical_summary: clinicalSummary(input, { name: "Safety Stop" }, { primary_transition: null }, { primary: null }),
      patient: {
        title: "Urgent safety stop",
        summary: "Red flag symptoms are present. Please seek urgent conventional medical assessment before using any integrative terrain, herbal, transition, or device logic. This is an educational pattern-recognition tool, not a medical diagnosis.",
        support: [],
        safety_notes: [
          "Seek urgent medical care for red flag symptoms.",
          "This is an educational pattern-recognition tool, not a medical diagnosis."
        ]
      },
      clinician: {
        stopped_reason: "red_flag_present == true",
        integrative_logic_applied: false
      }
    };
  }

  const tthActive = input.tth_candidate;
  if (tthActive) triggered.push(rule("B15_R002", "TTH criteria met"));
  const backendFormulas = backendFormulaLogic(input, tthActive);
  if (backendFormulas.some((formula) => formula.name.includes("Liu Wei"))) triggered.push(rule("B15_R003", "TTH + Yin depletion"));
  if (backendFormulas.some((formula) => formula.name.includes("Huang Lian"))) triggered.push(rule("B15_R004", "TTH + heat toxicity overlay"));
  if (tthActive && input.persistent_tension && input.yin_support_fails) triggered.push(rule("B15_R005", "TTH progression risk"));
  if (input.medication_overuse_present) triggered.push(rule("B15_R006", "medication overuse risk"));

  const role = roleStatus(input);
  if (role.current_role === "victim") triggered.push(rule("B15_R007", "dynamic victim role currently active"));
  if (role.current_role === "savior") triggered.push(rule("B15_R008", "dynamic savior role currently active"));
  if (role.current_role === "perpetrator") triggered.push(rule("B15_R009", "dynamic perpetrator role currently active"));

  const doNotRules = [
    ...role.do_not_rules,
    ...(input.medication_overuse_present ? ["Do not add further acute analgesics. Do not provide medication taper instructions."] : [])
  ];
  const doRules = role.do_rules;
  if (doNotRules.length) triggered.push(rule("B15_R010", "DO_NOT hierarchy active"));

  const axis = calculateAxisScores(input);
  const highestAxis = axis.ranked[0];
  const axisRuleMap = {
    taiyang: "B15_R011",
    shaoyang: "B15_R012",
    yangming: "B15_R013",
    taiyin: "B15_R014",
    shaoyin: "B15_R015",
    jueyin: "B15_R016",
    central: "B15_R017"
  };
  if (highestAxis?.score > 0) triggered.push(rule(axisRuleMap[highestAxis.id], `${highestAxis.name} highest`));

  const transitions = detectTransitions(input, axis.scores);
  for (const item of transitions.all) {
    if (item.rule_id) triggered.push(rule(item.rule_id, item.transition));
  }

  const expression = classifyExpression(input, axis.scores);
  const clusters = selectTreatmentClusters(input, axis, role, transitions, doNotRules);
  const summary = clinicalSummary(input, expression, transitions, clusters);

  const matchedPatterns = [
    tthActive ? "tth_static_tension" : "",
    role.matched_pattern || ""
  ].filter(Boolean);

  const moduleLinks = [];
  if (tthActive || highestAxis?.id === "taiyang" || role.current_role === "savior") moduleLinks.push("Taiyang Module");
  if (role.current_role === "victim") moduleLinks.push("future Jueyin module");
  if (input.migraine_like) moduleLinks.push("dedicated migraine module");
  if (highestAxis?.id === "central") moduleLinks.push("chronic pain / fibromyalgia / CFS logic");
  if (transitions.all.some((item) => item.transition === "Shaoyang -> Jueyin")) moduleLinks.push("CRPS / pelvic autonomic pain modules");

  return {
    engine: "transition_engine_v1",
    name: "TRANSITION_ENGINE_v1.0",
    subtitle: "TTH Module + Unified Transition Map",
    source: ["avicenna_engine_batch15.json", "transitionEngine.v1.json", "tthModule.v1.json", "unifiedTransitionMap.json", "treatmentClusters.v1.json"],
    active: true,
    stopped: false,
    rejected: false,
    processing_pipeline: [
      "Symptom Input",
      "Axis Probability Model",
      "Transition Detection Engine",
      "Expression Pattern Classifier",
      "Treatment Cluster Selector",
      "Clinical Summary"
    ],
    tth: {
      active: tthActive,
      backend_axiom: TTH_PATTERN.backend_axiom,
      output: tthActive
        ? {
            load: "static fascia load",
            axis: "posterior sensory / Taiyang expression",
            expression: "mechanical-fascial expression",
            transition_risk: "risk of migraine transition if Yin support fails"
          }
        : null
    },
    trauma_role: role,
    matched_patterns: matchedPatterns,
    axis_probability_scores: axis.scores,
    axis_ranked: axis.ranked,
    axis_evidence: axis.evidence,
    transition_detection: transitions,
    expression_classifier: expression,
    treatment_clusters: clusters,
    decision_hierarchy: {
      order: ["DO_NOT rules", "DO rules", "intervention choice"],
      do_not_rules: doNotRules,
      do_rules: doRules,
      enforced: doNotRules.length > 0 || clusters.hierarchy_applied
    },
    medication_overuse: input.medication_overuse_present
      ? {
          active: true,
          message: "Medication overuse headache risk flagged. Use general educational limits for acute analgesics and avoid adding further acute analgesics; no taper instructions are generated."
        }
      : { active: false },
    backend_only: {
      formula_logic: backendFormulas,
      physical_model: transitionEngineData.backend_physical_model_private
    },
    backend_visibility: {
      formulas_hidden_from_patient: true,
      physical_model_hidden_from_frontend: true
    },
    cross_module_links: [...new Set(moduleLinks)],
    triggered_rules: uniqueRules(triggered),
    core_principles: transitionEngineData.principles,
    clinical_summary: summary,
    patient: {
      title: expression.name,
      summary: `${summary} This is an educational pattern-recognition tool, not a medical diagnosis.`,
      support: [
        clusters.primary?.cluster,
        clusters.secondary?.cluster
      ].filter(Boolean),
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "Medication changes must be discussed with a clinician.",
        ...(input.medication_overuse_present ? ["Medication overuse risk is flagged; this tool does not provide medication taper instructions."] : [])
      ]
    },
    clinician: {
      axis_probability_scores: axis.scores,
      axis_ranked: axis.ranked,
      transition_detected: transitions.primary_transition,
      secondary_transition: transitions.secondary_transition,
      expression_classifier: expression,
      treatment_clusters: clusters,
      triggered_do_not_rules: doNotRules,
      triggered_do_rules: doRules,
      triggered_rules: uniqueRules(triggered),
      backend_links_to_modules: [...new Set(moduleLinks)],
      backend_formula_logic_hidden_from_patient: backendFormulas.length,
      dynamic_role_enum: role,
      primary_keys: ["trauma_role", "germ_layer", "meridian_axis"],
      secondary_attributes: ["pain_syndromes", "western diagnoses", "symptom expressions"]
    }
  };
}

module.exports = {
  evaluateTransitionEngine,
  batch15Data,
  transitionEngineData,
  tthModuleData,
  unifiedTransitionMap,
  treatmentClusters
};
