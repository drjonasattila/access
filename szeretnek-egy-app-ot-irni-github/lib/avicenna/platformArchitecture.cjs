const platformData = require("./data/platform/platformPhilosophy.v1.json");
const sixCompartmentMap = require("./data/libraries/sixCompartmentCommunicationMap.json");
const threeSystemIntegrationModel = require("./data/libraries/threeSystemIntegrationModel.json");
const instabilityClassifierData = require("./data/libraries/instabilityClassifier.v1.json");
const dataQualityArchitecture = require("./data/caseLibrary/dataQualityArchitecture.v1.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const RULES = (platformData.rules || []).map((item, index) => ({
  id: item.id || `B16_R${String(index + 1).padStart(3, "0")}`,
  condition: item.condition || "",
  action: item.action || ""
}));
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const PATIENT_DISCLAIMER = "This is an educational pattern-recognition tool, not a medical diagnosis.";
const PRACTITIONER_DISCLAIMER = "This tool supports structured clinical reasoning and does not replace professional judgement.";
const EVIDENCE_POSITIONING = "Evidence-informed + practice-derived.";
const TRADITIONAL_FRAME = "It is believed in traditional medical systems that...";

const FRONT_END_TYPES = [
  "energy_deficiency",
  "overheating",
  "dryness",
  "stagnation",
  "neural_overload"
];

const ROOT_BRANCH_OPTIONS = [
  "internal_reserves_weak",
  "root_weak",
  "exit_pathway_impaired",
  "exit_impaired",
  "trauma_active"
];

const SYSTEM_PRIORITIES = [
  "medication",
  "herbal",
  "lifestyle",
  "nutrition",
  "nervous_system_reset"
];

const REQUIRED_CASE_FIELDS = [
  "timeline",
  "pain_scores",
  "PROMs",
  "labs_imaging_if_available",
  "outcome",
  "adverse_events",
  "compliance",
  "relapse_timing"
];

const CASE_PROMPT_FIELDS = [
  "timeline",
  "pain score",
  "PROMs",
  "labs/imaging if available",
  "outcome",
  "adverse events",
  "treatment cluster selected"
];

const AXIS_MAPPING = {
  TaiYang: "Axis 1",
  ShaoYang: "Axis 2",
  YangMing: "Axis 3",
  TaiYin: "Axis 4",
  ShaoYin: "Axis 5",
  JueYin: "Axis 6",
  "Ren/Du Central": "Axis 7"
};

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function normaliseChoice(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
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

function routeInstability(input) {
  const type = normaliseChoice(input.instability_type, FRONT_END_TYPES, "energy_deficiency");
  const location = lower(input.location || input.primary_location || input.instability_location || input.pain_location || "");

  const routes = {
    energy_deficiency: {
      public_label: "Energy deficiency",
      route_to: ["Shaoyin", "Taiyin"],
      cluster_candidates: ["Survival-Axis Stabilization", "Interoceptive Regulation"],
      explanation: "The first move is support, not stimulation. The engine prioritises internal reserves and basic regulation before stronger surface intervention.",
      safety: ["Do not stimulate. Support first."],
      rule_id: "B16_R009"
    },
    overheating: {
      public_label: "Overheating",
      route_to: ["Shaoyang", "Yangming"],
      cluster_candidates: ["Lateral Autonomic Decompression", "Metabolic Rebalancing"],
      explanation: "The engine checks whether heat, inflammation, or autonomic overactivity is driving the pattern before adding rebuild inputs.",
      safety: ["Check inflammatory phenotype before stimulation or building logic."],
      rule_id: "B16_R010"
    },
    dryness: {
      public_label: "Dryness",
      route_to: ["Yin depletion", "tissue hydration logic"],
      cluster_candidates: ["Survival-Axis Stabilization", "Interoceptive Regulation"],
      explanation: "The engine treats this as a tissue-hydration and reserve problem first, with slower rebuild logic rather than strong movement.",
      safety: ["Avoid aggressive drying, heating, or stimulation logic."],
      rule_id: null
    },
    stagnation: {
      public_label: "Stagnation",
      route_to: location.includes("posterior") || location.includes("neck") || location.includes("spine") || location.includes("back")
        ? ["Taiyang", "posterior sensory cluster"]
        : ["Yangming", "microcirculation / metabolic cluster"],
      cluster_candidates: location.includes("posterior") || location.includes("neck") || location.includes("spine") || location.includes("back")
        ? ["Posterior Sensory Pressure Modulation", "Microcirculatory Restoration"]
        : ["Metabolic Rebalancing", "Microcirculatory Restoration"],
      explanation: "The engine distinguishes posterior shell tension from anterior/metabolic stagnation, then routes flow support accordingly.",
      safety: ["Sequence movement support; do not stack multiple strong movers."],
      rule_id: "B16_R011"
    },
    neural_overload: {
      public_label: "Neural overload",
      route_to: ["Taiyang", "Jueyin"],
      cluster_candidates: ["Posterior Sensory Pressure Modulation", "Central Coherence Support", "Microcirculatory Restoration"],
      explanation: "The engine checks central sensitisation and autonomic dysregulation before adding stimulation or device logic.",
      safety: ["Reduce noise first; avoid aggressive stimulation in sensitised states."],
      rule_id: "B16_R012"
    }
  };

  return {
    type,
    ...routes[type]
  };
}

function evaluateRootBranch(input) {
  const raw = normaliseChoice(input.root_branch_assessment, ROOT_BRANCH_OPTIONS, "internal_reserves_weak");
  const assessment = raw === "root_weak"
    ? "internal_reserves_weak"
    : raw === "exit_impaired"
      ? "exit_pathway_impaired"
      : raw;

  const map = {
    internal_reserves_weak: {
      public_label: "Internal reserves weak",
      priority: "Prioritise internal support before surface intervention.",
      route_note: "Root-weak logic points toward Shaoyin/Taiyin stabilisation first.",
      rule_id: "B16_R013"
    },
    exit_pathway_impaired: {
      public_label: "Exit pathway impaired",
      priority: "Prioritise drainage, ventilation, and safe release-pathway support.",
      route_note: "Exit-impaired logic points toward Shaoyang/Yangming regulation.",
      rule_id: "B16_R014"
    },
    trauma_active: {
      public_label: "Trauma / hyperreactivity active",
      priority: "Activate the hyperreactivity overlay and check stimulation or supplement contraindications before device logic.",
      route_note: "Trauma-active logic checks Taiyang laser contraindications and keeps support gentle.",
      rule_id: "B16_R015"
    }
  };

  return {
    assessment,
    ...map[assessment]
  };
}

function evaluateBranchDirection(input) {
  const direction = input.branch_direction === "outbound" || input.branch_direction === "inbound"
    ? input.branch_direction
    : "not_specified";

  if (direction === "outbound") {
    return {
      direction,
      interpretation: "Release valve for excessive charge.",
      pattern: "overflow / release active",
      rule_id: "B16_R007"
    };
  }

  if (direction === "inbound") {
    return {
      direction,
      interpretation: "Stress or pathogen entry route.",
      pattern: "invasion / suppression / trauma-active",
      rule_id: "B16_R008"
    };
  }

  return {
    direction,
    interpretation: "No branch direction selected.",
    pattern: "not assessed",
    rule_id: null
  };
}

function normalizeCaseSubmission(input) {
  const source = input.case_submission && typeof input.case_submission === "object"
    ? input.case_submission
    : {};
  const merged = { ...source };

  for (const field of REQUIRED_CASE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, field)) merged[field] = input[field];
  }
  if (Object.prototype.hasOwnProperty.call(input, "labs_imaging")) {
    merged.labs_imaging_if_available = input.labs_imaging;
  }
  if (Object.prototype.hasOwnProperty.call(input, "proms")) {
    merged.PROMs = input.proms;
  }

  return merged;
}

function evaluateCaseQuality(input) {
  const caseSubmission = normalizeCaseSubmission(input);
  const keys = Object.keys(caseSubmission).filter((key) => caseSubmission[key] !== undefined && caseSubmission[key] !== "");
  const freeTextOnly = bool(input.case_free_text_only)
    || Boolean(caseSubmission.free_text && keys.every((key) => key === "free_text"));
  const missingFields = REQUIRED_CASE_FIELDS.filter((field) => {
    if (field === "labs_imaging_if_available" && caseSubmission.labs_imaging_available === false) return false;
    return !caseSubmission[field];
  });
  const presentCount = REQUIRED_CASE_FIELDS.length - missingFields.length;
  const dataCompletenessScore = input.data_completeness_score !== undefined
    ? Number(input.data_completeness_score)
    : Number((presentCount / REQUIRED_CASE_FIELDS.length).toFixed(2));
  const calculatedPlausibility = Number(Math.max(0, Math.min(1, 0.25 + dataCompletenessScore * 0.55 + (caseSubmission.outcome ? 0.1 : 0) + (caseSubmission.adverse_events ? 0.05 : 0) + (caseSubmission.PROMs ? 0.05 : 0))).toFixed(2));
  const casePlausibilityScore = input.case_plausibility_score !== undefined
    ? Number(input.case_plausibility_score)
    : calculatedPlausibility;
  const threshold = dataQualityArchitecture.plausibility_threshold || 0.65;
  const submitted = keys.length > 0 || freeTextOnly || bool(input.clinician_requests_upload);
  const humanReviewRequired = submitted && (casePlausibilityScore < threshold || missingFields.length > 0 || freeTextOnly);

  return {
    submitted,
    free_text_only: freeTextOnly,
    status: !submitted
      ? "not_submitted"
      : freeTextOnly
      ? "structured_fields_required"
      : missingFields.length
        ? "completion_required"
        : humanReviewRequired
          ? "human_review_required"
          : "ready_for_peer_review",
    required_minimum_fields: REQUIRED_CASE_FIELDS,
    missing_fields: missingFields,
    prompt_fields: CASE_PROMPT_FIELDS,
    data_completeness_score: dataCompletenessScore,
    case_plausibility_score: casePlausibilityScore,
    plausibility_threshold: threshold,
    human_review_required: humanReviewRequired,
    auto_delete: false,
    peer_review: {
      anonymous_clinician_comment: input.practitioner_annotation || "",
      would_you_treat_similarly_binary_vote: input.would_treat_similarly ?? null,
      outcome_confirmation_request: true,
      pattern_challenge_flag: bool(input.pattern_challenge_flag)
    },
    precedent_capture: dataQualityArchitecture.precedent_engine_capture,
    not_required: dataQualityArchitecture.not_required
  };
}

function selectSystemPriority(input) {
  const priority = normaliseChoice(input.system_priority || input.which_system_can_help_most, SYSTEM_PRIORITIES, "nutrition");
  const labels = {
    medication: "Medication",
    herbal: "Herbal",
    lifestyle: "Lifestyle",
    nutrition: "Nutrition",
    nervous_system_reset: "Nervous system reset"
  };
  return {
    priority,
    public_label: labels[priority],
    note: "The platform gives recommendation weights, not dogmas. Medication changes must be discussed with a clinician."
  };
}

function evaluatePlatformArchitecture(inputPayload = {}) {
  const systemOutputMode = inputPayload.system_output_mode === "practitioner" || bool(inputPayload.practitioner_mode)
    ? "practitioner"
    : "front_end";
  const triggered = [rule(systemOutputMode === "practitioner" ? "B16_R002" : "B16_R001", `system_output_mode == ${systemOutputMode}`)];
  const instability = routeInstability(inputPayload);
  const rootBranch = evaluateRootBranch(inputPayload);
  const branchDirection = evaluateBranchDirection(inputPayload);
  const systemPriority = selectSystemPriority(inputPayload);
  const caseQuality = evaluateCaseQuality(inputPayload);

  if (instability.rule_id) triggered.push(rule(instability.rule_id, `instability_type == ${instability.type}`));
  if (rootBranch.rule_id) triggered.push(rule(rootBranch.rule_id, `root_branch_assessment == ${rootBranch.assessment}`));
  if (branchDirection.rule_id) triggered.push(rule(branchDirection.rule_id, `branch_direction == ${branchDirection.direction}`));
  if (bool(inputPayload.traditional_content_referenced) || bool(inputPayload.traditional_content_referenced_in_patient_output)) {
    triggered.push(rule("B16_R003", "traditional content frame required"));
  }
  if (caseQuality.submitted && caseQuality.case_plausibility_score < caseQuality.plausibility_threshold) {
    triggered.push(rule("B16_R004", "case_plausibility_score below threshold"));
  }
  if (caseQuality.free_text_only) {
    triggered.push(rule("B16_R005", "case submitted with free text only"));
  }
  if (bool(inputPayload.clinician_requests_upload) && caseQuality.missing_fields.length) {
    triggered.push(rule("B16_R006", "clinician upload missing structured fields"));
  }

  const patient = {
    instability_type: instability.public_label,
    root_branch: rootBranch.public_label,
    system_priority: systemPriority.public_label,
    explanation: `${instability.explanation} ${rootBranch.priority} This platform is ${EVIDENCE_POSITIONING.replace(/\.$/, "").toLowerCase()} and returns recommendation weights, not dogmas.`,
    branch_direction: branchDirection.direction === "not_specified" ? undefined : {
      direction: branchDirection.direction,
      interpretation: branchDirection.interpretation
    },
    safety_notes: [
      PATIENT_DISCLAIMER,
      "Medication changes must be discussed with a clinician.",
      ...(bool(inputPayload.traditional_content_referenced) ? [TRADITIONAL_FRAME] : [])
    ],
    visible_questions: platformData.app_ux_logic?.user_facing_questions || []
  };

  const result = {
    engine: "platform_philosophy_and_architecture_v1",
    name: "PLATFORM_PHILOSOPHY_AND_ARCHITECTURE_v1.0",
    active: true,
    source: ["avicenna_engine_batch16.json", "platformPhilosophy.v1.json"],
    system_output_mode: systemOutputMode,
    evidence_positioning: EVIDENCE_POSITIONING,
    selected: {
      instability_type: instability.type,
      root_branch_assessment: rootBranch.assessment,
      system_priority: systemPriority.priority
    },
    route_summary: {
      instability_routes: instability.route_to,
      treatment_cluster_candidates: instability.cluster_candidates,
      root_branch_priority: rootBranch.priority,
      branch_direction: branchDirection
    },
    supplement_brand_policy: {
      named_brand_recommendations_allowed: false,
      display_language: ["supplement support", "nutritional support", "biological stabilisation", "magnesium / collagen / hydration / metabolic support where appropriate"],
      compatibility_layer: {
        legacy_brand_family: "genericSupplementSupport",
        legacy_day_night_products: "circadian nutritional support",
        legacy_collagen_product: "collagen / matrix support",
        legacy_magnesium_product: "magnesium support",
        legacy_adaptogen_product: "adaptogenic support, only if stable"
      }
    },
    case_quality: caseQuality,
    triggered_rules: uniqueRules(triggered),
    patient,
    output_visibility: systemOutputMode === "front_end"
      ? {
          six_compartment_map_visible: false,
          meridian_axis_visible: false,
          ayurveda_terms_visible: false,
          backend_physical_model_visible: false
        }
      : {
          six_compartment_map_visible: true,
          meridian_axis_visible: true,
          ayurveda_terms_visible: true,
          backend_physical_model_visible: false
        },
    clinician: systemOutputMode === "practitioner"
      ? {
          disclaimer: PRACTITIONER_DISCLAIMER,
          axis_mapping: AXIS_MAPPING,
          six_compartment_communication_map: sixCompartmentMap,
          three_system_integration_model: threeSystemIntegrationModel,
          instability_classifier: instabilityClassifierData,
          cross_tradition_mapping: platformData.cross_module_links,
          case_plausibility_score: caseQuality.case_plausibility_score,
          data_completeness_score: caseQuality.data_completeness_score,
          case_quality_status: caseQuality.status,
          triggered_rules: uniqueRules(triggered),
          platform_metadata: platformData.platform_architecture_metadata,
          data_quality_architecture: dataQualityArchitecture
        }
      : undefined,
    core_principles: [
      "The engine translates between clinical languages.",
      "TCM provides topology.",
      "Ayurveda provides tissue-state logic.",
      "Western medicine provides measurement and safety.",
      "The app gives recommendation weights, not dogmas.",
      "Structured case data is the long-term clinical asset.",
      EVIDENCE_POSITIONING
    ]
  };

  if (systemOutputMode === "front_end") {
    delete result.clinician;
    delete result.route_summary;
    delete result.supplement_brand_policy;
    delete result.case_quality;
    delete result.core_principles;
    result.triggered_rules = result.triggered_rules.map(({ id, reason }) => ({ id, reason }));
  }

  return sanitizeForOutput(result);
}

module.exports = {
  evaluatePlatformArchitecture,
  platformData,
  sixCompartmentMap,
  threeSystemIntegrationModel,
  instabilityClassifierData,
  dataQualityArchitecture,
  REQUIRED_CASE_FIELDS
};
