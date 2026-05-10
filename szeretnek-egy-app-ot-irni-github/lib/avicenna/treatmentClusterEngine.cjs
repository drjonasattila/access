const treatmentClusterEngineData = require("./data/engines/treatmentClusterEngine.v1.json");
const sevenFunctionalAxes = require("./data/libraries/sevenFunctionalAxes.v1.json");
const clusterRoutingRules = require("./data/libraries/clusterRoutingRules.v1.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const PATTERNS = treatmentClusterEngineData.patterns || [];
const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((pattern) => [pattern.id, pattern]));
const RULES = treatmentClusterEngineData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));
const AXIS_IDS = ["LAX", "PSA", "AMA", "MIA", "SVA", "DAV", "CIA"];

const AXIS_ALIASES = {
  lax: "LAX",
  lateral: "LAX",
  shaoyang: "LAX",
  "lateral autonomic axis": "LAX",
  "lateral autonomic dysfunction": "LAX",
  psa: "PSA",
  posterior: "PSA",
  taiyang: "PSA",
  "posterior sensory axis": "PSA",
  "posterior sensory overload": "PSA",
  ama: "AMA",
  anterior: "AMA",
  yangming: "AMA",
  "anterior metabolic axis": "AMA",
  "anterior metabolic imbalance": "AMA",
  mia: "MIA",
  midline: "MIA",
  taiyin: "MIA",
  "midline interoceptive axis": "MIA",
  "midline interoceptive dysregulation": "MIA",
  sva: "SVA",
  survival: "SVA",
  shaoyin: "SVA",
  "survival axis": "SVA",
  "survival axis instability": "SVA",
  dav: "DAV",
  jueyin: "DAV",
  vascular: "DAV",
  "deep autonomic-vascular axis": "DAV",
  "deep autonomic-vascular dysregulation": "DAV",
  cia: "CIA",
  central: "CIA",
  "central integration axis": "CIA",
  "central integration failure": "CIA",
  "ren/du": "CIA",
  ren_du: "CIA"
};

const TRANSITION_AXIS_ALIASES = {
  shaoyang: "LAX",
  taiyang: "PSA",
  yangming: "AMA",
  taiyin: "MIA",
  shaoyin: "SVA",
  jueyin: "DAV",
  central: "CIA"
};

const ADJACENT_AXIS = {
  LAX: "PSA",
  PSA: "SVA",
  AMA: "MIA",
  MIA: "AMA",
  SVA: "PSA",
  DAV: "LAX",
  CIA: "SVA"
};

const INTERVENTION_OVERVIEWS = {
  LAX: [
    "lateral chain release",
    "cervical-scapular normalization",
    "low-level laser along lateral anatomical lines",
    "autonomic pacing",
    "microcirculatory warm-up"
  ],
  PSA: [
    "cervical decompression",
    "proprioceptive retraining",
    "graded positional protocols",
    "posterior myofascial decompression",
    "CSF/venous drainage-oriented exercises",
    "metabolic warming support"
  ],
  AMA: [
    "GI motility-supportive breathing",
    "anterior wall microcirculation",
    "mobility after meals",
    "gentle aerobic activation",
    "metabolic support"
  ],
  MIA: [
    "diaphragm-rib mobilization",
    "interoceptive retraining",
    "gentle vagal support",
    "thoracic mobility",
    "anxiety-modulating routines"
  ],
  SVA: [
    "pacing protocols",
    "autonomic retraining",
    "sleep architecture optimization",
    "grounding movement cycles",
    "cardiovagal support"
  ],
  DAV: [
    "pelvic microcirculatory restoration",
    "noninvasive neuromodulation",
    "vascular-neuromodulatory support",
    "gentle heat cycling",
    "autonomic stabilization"
  ],
  CIA: [
    "graded multisystem pacing",
    "cross-axis mobility",
    "sleep stabilization",
    "cognitive load management",
    "mitochondrial support"
  ]
};

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

function axisId(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const upper = raw.toUpperCase();
  if (AXIS_IDS.includes(upper)) return upper;
  return AXIS_ALIASES[lower(raw).replace(/_/g, " ")] || AXIS_ALIASES[lower(raw)] || "";
}

function rule(id, reason = "") {
  const item = RULE_BY_ID[id] || { id, condition: "", action: "" };
  return { id: item.id, condition: item.condition, action: item.action, reason };
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

function normaliseInput(input = {}) {
  const transition = input.transition_engine_output || {};
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.autonomic_symptoms),
    ...list(input.digestive_symptoms),
    ...list(input.cardiovascular_symptoms),
    ...list(input.interoceptive_symptoms),
    ...list(input.pelvic_symptoms),
    ...list(input.pain_location),
    ...list(input.pain_character),
    ...list(input.diagnosis)
  ];
  const diagnoses = [
    ...list(input.diagnosis),
    ...list(input.western_diagnosis),
    ...list(input.existing_diagnosis)
  ];
  const prior = list(input.prior_treatment_response);
  const failedTreatments = number(input.failed_treatments) || number(input.failed_treatment_count) || (bool(input.multiple_prior_failed_treatments) ? 2 : 0);
  const centralFeatures = bool(input.multi_system_features)
    || bool(input.central_integration_features)
    || includesAny(symptoms, ["sensory_hypersensitivity", "cognitive_overload", "autonomic_dissociation", "midline_dissociation", "post_stress_central_fatigue", "adhd_like"]);

  return {
    system_mode: input.system_mode || input.systemMode || "integrative-neutral",
    debugMode: bool(input.debugMode)
      || input.systemMode === "debugMode"
      || input.system_mode === "debugMode"
      || input.systemMode === "internal-audit"
      || input.system_mode === "internal-audit"
      || bool(input.internal_audit),
    transition_engine_output: transition,
    functional_axis_primary: axisId(input.functional_axis_primary || input.primary_axis || transition.primary_axis || transition.primaryAxis),
    functional_axis_secondary: axisId(input.functional_axis_secondary || input.secondary_axis || transition.secondary_axis || transition.secondaryAxis),
    axis_probability_scores: input.axis_probability_scores || transition.axis_probability_scores || {},
    axis_ranked: input.axis_ranked || transition.axis_ranked || transition.ranked_axes || [],
    treatment_clusters: transition.treatment_clusters || {},
    pain_laterality: input.pain_laterality || "",
    laterality_unilateral: lower(input.pain_laterality).includes("unilateral") || bool(input.unilateral) || includesAny(symptoms, ["unilateral", "fixed_side"]),
    pressure_sensitivity: bool(input.pressure_sensitivity) || includesAny(symptoms, ["pressure", "bending", "strain", "valsalva", "occipital"]),
    post_meal_flare: bool(input.post_meal_flare) || includesAny(symptoms, ["post_meal", "post_prandial"]),
    chest_tightness_noncardiac: bool(input.chest_tightness_noncardiac) || includesAny(symptoms, ["non_cardiac_chest_tightness", "chest_tightness"]),
    panic_or_palpitations: bool(input.panic_or_palpitations) || includesAny(symptoms, ["panic", "palpitations", "tachycardia"]),
    burning_neuropathy: bool(input.burning_neuropathy) || includesAny(symptoms, ["burning_neuropathy", "burning", "neuropathic"]),
    pelvic_pain_chronic: bool(input.pelvic_pain_chronic) || bool(input.chronic_pelvic_pain) || includesAny(symptoms, ["chronic_pelvic", "pelvic_pain", "endometriosis", "bladder_pelvic"]),
    widespread_pain: bool(input.widespread_pain) || includesAny(symptoms, ["widespread_pain", "fibromyalgia", "central_sensitization", "central_sensitisation"]),
    central_features: centralFeatures,
    failed_treatments: failedTreatments,
    multiple_prior_failed_treatments: failedTreatments >= 2 || bool(input.multiple_prior_failed_treatments) || prior.includes("failed"),
    frailty: bool(input.frailty),
    digestive_sensitivity: bool(input.digestive_sensitivity),
    emotional_constraint: bool(input.emotional_constraint),
    overweight: bool(input.overweight) || bool(input.body_weight_status === "overweight") || bool(input.body_weight_status === "obesity"),
    internal_cold_sensation: bool(input.internal_cold_sensation) || includesAny(symptoms, ["internal_cold", "coldness"]),
    crps_phase: input.CRPS_phase || input.crps_phase || "",
    adjunctive_pharmacology_considered: bool(input.adjunctive_pharmacology_considered),
    generate_pdf_summary: bool(input.generate_pdf_summary),
    symptoms,
    diagnoses
  };
}

function transitionAxisToPattern(value) {
  const id = axisId(value);
  if (id) return id;
  return TRANSITION_AXIS_ALIASES[lower(value)] || "";
}

function axesFromTransition(input) {
  const axes = [];
  if (input.functional_axis_primary) axes.push(input.functional_axis_primary);
  if (input.functional_axis_secondary) axes.push(input.functional_axis_secondary);

  for (const item of list(input.axis_ranked)) {
    const candidate = transitionAxisToPattern(item.axis || item.id || item.name);
    if (candidate) axes.push(candidate);
  }

  const scoreEntries = Object.entries(input.axis_probability_scores || {})
    .map(([key, score]) => ({ axis: transitionAxisToPattern(key), score: number(score) }))
    .filter((item) => item.axis)
    .sort((a, b) => b.score - a.score);
  for (const item of scoreEntries) axes.push(item.axis);

  return unique(axes);
}

function diagnosisCandidates(input) {
  const names = input.diagnoses.map((item) => lower(item));
  const matches = [];
  for (const diagnosis of treatmentClusterEngineData.diagnosis_map || []) {
    if (names.some((name) => name && (lower(diagnosis.diagnosis).includes(name) || name.includes(lower(diagnosis.diagnosis))))) {
      matches.push(diagnosis);
    }
  }
  return matches;
}

function scoreAxesFromInputs(input) {
  const scores = Object.fromEntries(AXIS_IDS.map((id) => [id, 0]));
  function add(id, points) {
    scores[id] += points;
  }
  if (input.laterality_unilateral) add("LAX", 3);
  if (input.pressure_sensitivity) add("PSA", 3);
  if (input.post_meal_flare) add("AMA", 3);
  if (input.chest_tightness_noncardiac) add("MIA", 3);
  if (input.panic_or_palpitations) add("SVA", 3);
  if (input.burning_neuropathy || input.pelvic_pain_chronic) add("DAV", 4);
  if (input.widespread_pain && input.central_features) add("CIA", 4);
  for (const match of diagnosisCandidates(input)) {
    for (const pattern of match.associated_patterns || []) add(pattern, 1);
  }
  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

function applyDiagnosisOverrides(input, axes, triggered, reviewFlags) {
  const serious = input.diagnoses.some((diagnosis) => ["iih", "pres", "arnold-chiari", "arnold chiari", "pdph"].some((term) => lower(diagnosis).includes(term)));
  if (serious) {
    triggered.push(rule("B18_R019", "diagnosis requires PSA and clinician review"));
    reviewFlags.push("Mandatory clinician review before intervention for IIH/PRES/Arnold-Chiari/PDPH pattern.");
    return ["PSA", ...axes.filter((axis) => axis !== "PSA")];
  }
  return axes;
}

function enforceCiaGuard(input, axes, triggered) {
  const primary = axes[0];
  if (primary === "CIA" && !(input.widespread_pain && input.central_features)) {
    triggered.push(rule("B18_R018", "CIA guard: failed treatments alone are insufficient"));
    const next = axes.find((axis) => axis !== "CIA") || ADJACENT_AXIS.CIA;
    return unique([next, "CIA", ...axes.filter((axis) => axis !== next && axis !== "CIA")]);
  }
  if (input.multiple_prior_failed_treatments && primary !== "CIA") {
    triggered.push(rule("B18_R018", "multiple failed treatments -> evaluate CIA, do not auto-assign"));
  }
  return axes;
}

function selectAxes(input, triggered, reviewFlags) {
  let axes = axesFromTransition(input);
  if (!axes.length) axes = scoreAxesFromInputs(input);
  axes = applyDiagnosisOverrides(input, axes, triggered, reviewFlags);
  axes = enforceCiaGuard(input, axes, triggered);
  if (!axes.length) axes = ["LAX", "PSA"];

  const primary = axes[0];
  let secondary = axes.find((axis) => axis !== primary);
  let singleAxisDominance = false;
  if (!secondary || secondary === primary) {
    singleAxisDominance = true;
    secondary = ADJACENT_AXIS[primary] || AXIS_IDS.find((axis) => axis !== primary);
    triggered.push(rule("B18_R017", "primary and secondary axis same or missing"));
  }
  return { primary, secondary, singleAxisDominance };
}

function addRuleTriggers(input, primary, triggered, reviewFlags, contraindications) {
  if (primary === "LAX" && input.laterality_unilateral) triggered.push(rule("B18_R001", "LAX + unilateral laterality"));
  if (primary === "PSA" && input.pressure_sensitivity) triggered.push(rule("B18_R002", "PSA + pressure sensitivity"));
  if (primary === "AMA" && input.post_meal_flare) triggered.push(rule("B18_R003", "AMA + post-meal flare"));
  if (primary === "MIA" && input.chest_tightness_noncardiac) triggered.push(rule("B18_R004", "MIA + non-cardiac chest tightness"));
  if (primary === "SVA" && input.panic_or_palpitations) triggered.push(rule("B18_R005", "SVA + panic/palpitations"));
  if (primary === "DAV" && (input.burning_neuropathy || input.pelvic_pain_chronic)) triggered.push(rule("B18_R006", "DAV + burning neuropathy/chronic pelvic pain"));
  if (primary === "CIA" && input.widespread_pain && input.failed_treatments >= 2 && input.central_features) triggered.push(rule("B18_R007", "CIA + widespread pain + failed treatments + central features"));

  if (input.frailty) {
    triggered.push(rule("B18_R008", "frailty"));
    reviewFlags.push("Frailty: reduce intervention complexity and prefer the gentlest modalities.");
  }
  if (input.emotional_constraint) {
    triggered.push(rule("B18_R009", "emotional constraint"));
    reviewFlags.push("Emotional constraint: prioritise autonomic retraining and behavioral support.");
  }
  if (input.digestive_sensitivity) {
    triggered.push(rule("B18_R010", "digestive sensitivity"));
    contraindications.push("Avoid oral botanical interventions; use external modalities only.");
  }
  if (primary === "PSA" && input.overweight && input.internal_cold_sensation) triggered.push(rule("B18_R011", "PSA archetype: posterior cold/damp load"));
  if (input.crps_phase === "I") triggered.push(rule("B18_R012", "CRPS phase I -> LAX"));
  if (input.crps_phase === "II" || input.crps_phase === "III") triggered.push(rule("B18_R013", "CRPS phase II/III -> DAV"));
  if (input.system_mode === "integrative-neutral") triggered.push(rule("B18_R014", "integrative-neutral output mode"));
  if (input.system_mode === "TCM") triggered.push(rule("B18_R015", "TCM practitioner output mode"));
  if (input.debugMode) triggered.push(rule("B18_R016", "debug/internal audit mode"));
  if (primary === "DAV") {
    reviewFlags.push("DAV always requires clinician review before intervention.");
  }
  if (input.adjunctive_pharmacology_considered) {
    triggered.push(rule("B18_R020", "adjunctive pharmacology considered"));
    reviewFlags.push("Adjunctive pharmacology requires prescriber review; no automatic recommendation is generated.");
  }
}

function clusterFor(axis) {
  return PATTERN_BY_ID[axis]?.cluster || sevenFunctionalAxes.canonical_clusters?.[axis] || axis;
}

function shortRationale(primary, secondary, input, reviewFlags) {
  const primaryName = PATTERN_BY_ID[primary]?.name || primary;
  const secondaryName = PATTERN_BY_ID[secondary]?.name || secondary;
  const reason = `${primaryName} appears most active, with ${secondaryName} as the secondary regulatory direction.`;
  const note = reviewFlags.length ? "Clinician review is flagged before intervention selection." : "Clusters are clinical directions, not diagnoses.";
  return `${reason} ${note}`;
}

function interventionOverview(axis) {
  return (INTERVENTION_OVERVIEWS[axis] || []).join(", ") + ".";
}

function publicOutput(primary, secondary, input, reviewFlags, contraindications) {
  return {
    primary_cluster: clusterFor(primary),
    secondary_cluster: clusterFor(secondary),
    clinical_rationale: shortRationale(primary, secondary, input, reviewFlags),
    intervention_overview: interventionOverview(primary),
    generate_pdf_summary: input.generate_pdf_summary,
    clinician_review_flags: reviewFlags,
    contraindications
  };
}

function internalDebug(primary, secondary, input, triggered) {
  const patterns = unique([primary, secondary]);
  return {
    primary_axis: primary,
    secondary_axis: secondary,
    pattern_ids: patterns,
    rule_trace: uniqueRules(triggered),
    bidirectional_couplings: patterns.flatMap((axis) => PATTERN_BY_ID[axis]?.bidirectional_coupling || []),
    internal_tags: patterns.map((axis) => PATTERN_BY_ID[axis]?.internal_tag).filter(Boolean),
    backend_translation_map: clusterRoutingRules.internal_backend_translation_map,
    internal_formula_reference: patterns.includes("PSA")
      ? treatmentClusterEngineData.internal_formula_references?.PSA
      : null
  };
}

function practitionerOutput(primary, secondary, input, triggered, reviewFlags, contraindications) {
  const patterns = unique([primary, secondary]);
  const base = {
    primary_axis: primary,
    secondary_axis: secondary,
    pattern_ids: patterns,
    rule_trace: uniqueRules(triggered),
    clinician_review_flags: reviewFlags,
    contraindications,
    output_visibility: {
      frontend_suppresses_internal_tags: true,
      backend_map_hidden: true,
      formula_names_patient_visible: false
    }
  };
  if (input.system_mode === "TCM") {
    base.tcm_axis_pairs = Object.fromEntries(patterns.map((axis) => [axis, PATTERN_BY_ID[axis]?.internal_tag]));
  }
  if (input.debugMode) {
    Object.assign(base, internalDebug(primary, secondary, input, triggered));
  }
  if (patterns.includes("PSA")) {
    base.internal_formula_reference = {
      functional_label: treatmentClusterEngineData.internal_formula_references?.PSA?.functional_label,
      visibility: "practitioner_internal_only",
      formula_name: input.debugMode ? treatmentClusterEngineData.internal_formula_references?.PSA?.formula : undefined
    };
  }
  return base;
}

function evaluateTreatmentClusterEngine(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const reviewFlags = [];
  const contraindications = [];
  const { primary, secondary, singleAxisDominance } = selectAxes(input, triggered, reviewFlags);
  addRuleTriggers(input, primary, triggered, reviewFlags, contraindications);

  const perPatientOutput = publicOutput(primary, secondary, input, reviewFlags, contraindications);
  if (input.debugMode) {
    perPatientOutput.internal_debug = internalDebug(primary, secondary, input, triggered);
  }

  const result = {
    engine: "treatment_cluster_engine_v1",
    name: "TREATMENT_CLUSTER_ENGINE_v1.0",
    routing_layer: "7_FUNCTIONAL_AXES_ROUTING_LAYER",
    source: ["treatmentClusterEngine.v1.json", "sevenFunctionalAxes.v1.json", "clusterRoutingRules.v1.json"],
    active: true,
    system_mode: input.system_mode,
    single_axis_dominance: singleAxisDominance,
    per_patient_output: perPatientOutput,
    primary_cluster: perPatientOutput.primary_cluster,
    secondary_cluster: perPatientOutput.secondary_cluster,
    clinical_rationale: perPatientOutput.clinical_rationale,
    intervention_overview: perPatientOutput.intervention_overview,
    clinician_review_required: reviewFlags.length > 0,
    clinician_review_flags: reviewFlags,
    contraindications,
    triggered_rules: uniqueRules(triggered),
    patient: {
      title: "Treatment cluster routing",
      summary: perPatientOutput.clinical_rationale,
      primary_cluster: perPatientOutput.primary_cluster,
      secondary_cluster: perPatientOutput.secondary_cluster,
      intervention_overview: perPatientOutput.intervention_overview,
      safety_notes: [
        "Clusters are clinical directions, not diagnoses.",
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        ...(reviewFlags.length ? ["Clinician review is flagged before intervention selection."] : [])
      ]
    },
    clinician: input.system_mode === "TCM" || input.debugMode
      ? practitionerOutput(primary, secondary, input, triggered, reviewFlags, contraindications)
      : undefined,
    key_principles: treatmentClusterEngineData.key_principles,
    cross_module_links: treatmentClusterEngineData.cross_module_links
  };

  if (input.system_mode === "integrative-neutral" && !input.debugMode) {
    delete result.clinician;
  }

  return sanitizeForOutput(result);
}

module.exports = {
  evaluateTreatmentClusterEngine,
  treatmentClusterEngineData,
  sevenFunctionalAxes,
  clusterRoutingRules,
  AXIS_IDS
};
