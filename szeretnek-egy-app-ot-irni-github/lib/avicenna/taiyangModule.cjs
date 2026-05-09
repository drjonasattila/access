const batch14Data = require("./data/engines/avicenna_engine_batch14.json");
const taiyangModuleData = require("./data/terrainModules/taiyangModule.v1.json");
const laserEligibilityData = require("./data/libraries/laserEligibility.taiyang.json");

const PATTERNS = batch14Data.patterns || [];
const RULES = taiyangModuleData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const BRANCHES = [
  "taiyang_pure_tension",
  "taiyang_water_sludging",
  "taiyang_shaoyin_deficiency",
  "taiyang_trauma_hyperreactivity",
  "taiyang_heat_skin_immune",
  "taiyang_vascular_congestion"
];

const NEUTRAL_LABELS = {
  taiyang_pure_tension: "Dry-tight posterior neuro-fascial tension",
  taiyang_water_sludging: "Posterior fluid-pressure and return-flow congestion",
  taiyang_shaoyin_deficiency: "Internal warmth deficiency with surface alerting",
  taiyang_trauma_hyperreactivity: "Nervous system reactivity overlay",
  taiyang_heat_skin_immune: "Surface immune / skin overflow",
  taiyang_vascular_congestion: "Posterior circulatory congestion"
};

const TCM_LABELS = {
  taiyang_pure_tension: "Pure Taiyang Tension",
  taiyang_water_sludging: "Taiyang Water Sludging",
  taiyang_shaoyin_deficiency: "Taiyang-Shaoyin Deficiency",
  taiyang_trauma_hyperreactivity: "Taiyang Trauma Hyperreactivity Overlay",
  taiyang_heat_skin_immune: "Taiyang Heat / Skin / Immune Overflow",
  taiyang_vascular_congestion: "Taiyang Vascular Congestion"
};

const FORMAL_ZONES = {
  taiyang_pure_tension: "posterior cervical-thoracic and scapular",
  taiyang_water_sludging: "thoracolumbar paravertebral, sacral, and posterior knee",
  taiyang_shaoyin_deficiency: "gentle lumbar and thoracic recovery-axis",
  taiyang_trauma_hyperreactivity: "sacral and lower posterior-chain",
  taiyang_heat_skin_immune: "skin-surface and posterior fascial",
  taiyang_vascular_congestion: "posterior paravertebral and venous-return"
};

const GLOBAL_PRINCIPLES = [
  "Taiyang swelling = blocked internal return + external shell overflow.",
  "Herba = field direction.",
  "HILT laser = shell decompression / fascia reset.",
  "DuoLife = biological stabilisation only.",
  "Never reverse the order.",
  "Laser does not polarise. It interrupts pathological chaotic Yang oscillation.",
  "The field needs direction, not energy."
];

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function hasExplicit(input, key) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function includesAny(values, targets) {
  const haystack = values.map((value) => lower(value).replace(/\s+/g, "_"));
  return targets.some((target) => haystack.some((item) => item.includes(target)));
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
    ...list(input.existing_diagnosis),
    ...list(input.diagnosis),
    ...list(input.pain_location),
    ...list(input.pain_character),
    ...list(input.pain_quality),
    ...list(input.surface_signs),
    ...list(input.autonomic_signs)
  ];
  const thermalLower = input.thermal_state_lower_body || "unknown";
  const thermalSurface = input.thermal_state_surface || "unknown";
  const sleepQuality = input.sleep_quality || "unknown";
  const autonomicState = input.autonomic_state || "unknown";
  const emotionalIntegration = input.emotional_integration || "unknown";
  const shaoyinFire = input.shaoyin_fire_status || "unknown";
  const stabilityState = input.stability_state || "unknown";
  const skinReactivity = input.skin_reactivity || (bool(input.skin_reactivity_high) ? "high" : "unknown");

  const cranialPressure = bool(input.cranial_pressure) || includesAny(symptoms, ["posterior_fossa", "chiari", "iih", "cranial_pressure"]);
  const venousStasis = bool(input.venous_stasis) || includesAny(symptoms, ["venous_stasis", "varicos", "venous_insuff"]);
  const edemaPresent = bool(input.edema_present) || bool(input.oedema_present) || includesAny(symptoms, ["oedema", "edema", "heavy_legs"]);
  const heatSigns = bool(input.heat_signs) || lower(thermalSurface).includes("heat") || includesAny(symptoms, ["eczema", "psoriasis", "urticaria", "hay_fever"]);
  const coldLowerBody = lower(thermalLower).includes("cold") || bool(input.cold_lower_body) || includesAny(symptoms, ["cold_feet", "cold_lower"]);
  const tightSurface = ["tight", "dry_tight", "dry-tight"].includes(thermalSurface) || bool(input.tight_surface) || includesAny(symptoms, ["tight_neck", "trapezius", "erector_spinae"]);
  const dryTightSurface = tightSurface || ["dry", "dry_tight", "dry-tight"].includes(thermalSurface);
  const poorSleep = sleepQuality === "poor" || sleepQuality === "still_poor" || bool(input.poor_sleep) || includesAny(symptoms, ["insomnia", "poor_sleep"]);
  const shaoyinDeficient = shaoyinFire === "deficient" || shaoyinFire === "severely_deficient" || bool(input.shaoyin_fire_deficient) || bool(input.severe_shaoyin_deficiency);
  const severeShaoyinDepletion = bool(input.severe_shaoyin_depletion) || bool(input.severe_shaoyin_deficiency) || shaoyinFire === "severely_deficient";
  const activePanicOrDissociation = bool(input.active_panic_or_dissociation) || bool(input.active_panic) || bool(input.derealization_active) || bool(input.derealisation_active);
  const panicAttacks = bool(input.panic_attacks) || includesAny(symptoms, ["panic"]);
  const sensoryOverload = bool(input.sensory_overload) || includesAny(symptoms, ["sensory_overload", "hypersensitivity"]);
  const traumaHistory = bool(input.trauma_history);
  const hyperarousal = autonomicState === "hyperarousal" || bool(input.hyperarousal) || includesAny(symptoms, ["hyperarousal"]);
  const impairedEmotionalIntegration = emotionalIntegration === "impaired" || bool(input.impaired_emotional_integration);
  const skinHigh = skinReactivity === "high" || bool(input.skin_reactivity_high);

  return {
    posterior_tension: bool(input.posterior_tension),
    tension_worsens_with_stress_cold_or_overstimulation: hasExplicit(input, "tension_worsens_with_stress_cold_or_overstimulation")
      ? bool(input.tension_worsens_with_stress_cold_or_overstimulation)
      : null,
    thermal_state_lower_body: thermalLower,
    thermal_state_surface: thermalSurface,
    edema_present: edemaPresent,
    cranial_pressure: cranialPressure,
    acute_cranial_pressure: bool(input.acute_cranial_pressure),
    venous_stasis: venousStasis,
    urinary_difficulty: bool(input.urinary_difficulty) || includesAny(symptoms, ["urinary_difficulty"]),
    heavy_legs: bool(input.heavy_legs) || includesAny(symptoms, ["heavy_legs"]),
    sleep_quality: sleepQuality,
    autonomic_state: autonomicState,
    emotional_integration: emotionalIntegration,
    trauma_history: traumaHistory,
    skin_reactivity: skinReactivity,
    skin_reactivity_high: skinHigh,
    pain_location: input.pain_location || "",
    pain_character: input.pain_character || "",
    shaoyin_fire_status: shaoyinFire,
    shaoyin_fire_deficient: shaoyinDeficient,
    severe_shaoyin_depletion: severeShaoyinDepletion,
    jueyin_direction_status: input.jueyin_direction_status || "unknown",
    stability_state: stabilityState,
    stable: stabilityState === "stable" || bool(input.stable),
    active_panic_or_dissociation: activePanicOrDissociation,
    panic_attacks: panicAttacks,
    sensory_overload: sensoryOverload,
    hyperarousal,
    impaired_emotional_integration: impairedEmotionalIntegration,
    acute_migraine_active: bool(input.acute_migraine_active),
    fresh_trauma: bool(input.fresh_trauma),
    psychotic_state: bool(input.psychotic_state),
    severe_IIH_symptoms: bool(input.severe_IIH_symptoms) || bool(input.severe_iih_symptoms),
    heat_signs: heatSigns,
    immune_hyperreactivity: bool(input.immune_hyperreactivity) || includesAny(symptoms, ["immune_hyperreactivity", "allergy", "hay_fever"]),
    allergy: bool(input.allergy) || includesAny(symptoms, ["allergy", "hay_fever"]),
    cold_lower_body: coldLowerBody,
    tight_surface: tightSurface,
    dry_tight_surface: dryTightSurface,
    lower_normal: thermalLower === "normal" || thermalLower === "neutral",
    internal_pump_weakness: bool(input.internal_pump_weakness) || bool(input.weak_internal_pump),
    varicosities: bool(input.varicosities) || bool(input.varicositas) || includesAny(symptoms, ["varicos"]),
    venous_insufficiency: bool(input.venous_insufficiency) || includesAny(symptoms, ["venous_insuff"]),
    disc_protrusion_pattern: bool(input.disc_protrusion_pattern) || includesAny(symptoms, ["disc_protrusion", "disc_hernia", "discopathy"]),
    sleep_improved: bool(input.sleep_improved),
    internal_warmth_returning: bool(input.internal_warmth_returning),
    intervention_documentation_required: bool(input.intervention_documentation_required) || bool(input.debugMode) || bool(input.internal_audit),
    systemMode: input.systemMode === "TCM" ? "TCM" : "integrative-neutral",
    symptoms
  };
}

function calculateBranchScores(input) {
  const scores = Object.fromEntries(BRANCHES.map((branch) => [branch, 0]));
  const evidence = [];

  function add(branch, points, reason) {
    scores[branch] += points;
    evidence.push({ branch, points, reason });
  }

  if (!input.posterior_tension) return { scores, evidence };

  add("taiyang_pure_tension", 2, "posterior tension present");
  if (!input.edema_present) add("taiyang_pure_tension", 1, "no oedema signal");
  if (!input.cranial_pressure) add("taiyang_pure_tension", 1, "no cranial pressure signal");
  if (input.dry_tight_surface) add("taiyang_pure_tension", 2, "dry-tight or tight posterior surface");
  if (input.cold_lower_body || input.lower_normal) add("taiyang_pure_tension", 1, "lower body cold or normal");
  if (includesAny(input.symptoms, ["tension_headache", "occipital_neuralgia", "cervicogenic", "trapezius", "erector_spinae", "myofascial", "frozen_shoulder"])) {
    add("taiyang_pure_tension", 2, "tension/occipital/cervicogenic/myofascial symptom cluster");
  }

  add("taiyang_water_sludging", 1, "posterior tension present");
  if (input.cranial_pressure) add("taiyang_water_sludging", 3, "cranial pressure");
  if (input.edema_present || input.venous_stasis) add("taiyang_water_sludging", 3, "oedema or venous stasis");
  if (includesAny(input.symptoms, ["iih", "posterior_fossa", "chiari"])) add("taiyang_water_sludging", 2, "IIH-like / posterior fossa / Chiari-like pressure");
  if (input.urinary_difficulty || input.heavy_legs) add("taiyang_water_sludging", 1, "urinary difficulty or heavy legs");

  add("taiyang_shaoyin_deficiency", 1, "posterior tension present");
  if (input.cold_lower_body) add("taiyang_shaoyin_deficiency", 2, "cold lower body");
  if (input.tight_surface) add("taiyang_shaoyin_deficiency", 2, "tight surface");
  if (input.sleep_quality === "poor" || input.sleep_quality === "still_poor") add("taiyang_shaoyin_deficiency", 2, "poor sleep");
  if (input.shaoyin_fire_deficient) add("taiyang_shaoyin_deficiency", 3, "deficient Shaoyin fire");

  add("taiyang_trauma_hyperreactivity", 1, "posterior tension present");
  if (input.skin_reactivity_high || input.allergy || input.panic_attacks || input.sensory_overload) add("taiyang_trauma_hyperreactivity", 2, "reactivity / allergy / panic / sensory overload");
  if (input.impaired_emotional_integration) add("taiyang_trauma_hyperreactivity", 2, "impaired emotional integration");
  if (input.trauma_history || input.hyperarousal) add("taiyang_trauma_hyperreactivity", 2, "trauma history or hyperarousal");

  add("taiyang_heat_skin_immune", 1, "posterior tension present");
  if (input.skin_reactivity_high) add("taiyang_heat_skin_immune", 2, "high skin reactivity");
  if (input.heat_signs) add("taiyang_heat_skin_immune", 2, "heat signs");
  if (input.immune_hyperreactivity) add("taiyang_heat_skin_immune", 2, "immune hyperreactivity");
  if (includesAny(input.symptoms, ["eczema", "psoriasis", "urticaria", "hay_fever", "dermatomyositis", "sle"])) add("taiyang_heat_skin_immune", 2, "skin/immune manifestation");

  add("taiyang_vascular_congestion", 1, "posterior tension present");
  if (input.venous_stasis) add("taiyang_vascular_congestion", 3, "venous stasis");
  if (input.internal_pump_weakness) add("taiyang_vascular_congestion", 3, "weak internal pump");
  if (input.varicosities || input.venous_insufficiency || input.disc_protrusion_pattern) add("taiyang_vascular_congestion", 2, "varicosities / venous insufficiency / disc protrusion pattern");

  return { scores, evidence };
}

function selectBranch(scores) {
  const traumaScore = scores.taiyang_trauma_hyperreactivity || 0;
  const structural = BRANCHES
    .filter((branch) => branch !== "taiyang_trauma_hyperreactivity")
    .map((branch) => ({ branch, score: scores[branch] || 0 }))
    .sort((a, b) => b.score - a.score);
  const all = BRANCHES.map((branch) => ({ branch, score: scores[branch] || 0 })).sort((a, b) => b.score - a.score);
  const primary = traumaScore >= 6 && (structural[0]?.score || 0) <= 4
    ? { branch: "taiyang_trauma_hyperreactivity", score: traumaScore }
    : structural[0]?.score >= 4 ? structural[0] : all[0];
  const secondary = structural.find((item) => item.branch !== primary.branch && item.score >= 4 && primary.score - item.score <= 2);
  const overlays = [];

  if (traumaScore >= 4 && primary.branch !== "taiyang_trauma_hyperreactivity") overlays.push("taiyang_trauma_hyperreactivity");

  return {
    selected_branch: primary.score > 0 ? primary.branch : "",
    selected_score: primary.score || 0,
    mixed_patterns: secondary ? [primary.branch, secondary.branch] : [],
    overlays,
    ranked: all
  };
}

function evaluateLaserEligibility(input, branch) {
  const contraindications = [];
  for (const item of laserEligibilityData.absolute_contraindications || []) {
    if (bool(input[item.key])) contraindications.push(item.label);
  }

  const branchDelays = [];
  let branchStatus = "eligible";
  if (branch === "taiyang_water_sludging" && input.acute_cranial_pressure) {
    branchDelays.push("Acute cranial pressure: delay HILT laser and use Herba first.");
    branchStatus = "delayed";
  }
  if (branch === "taiyang_shaoyin_deficiency") {
    if (input.sleep_improved && input.internal_warmth_returning) {
      branchStatus = "eligible_after_stabilisation";
    } else {
      branchDelays.push("First 7-10 days: Herba only. HILT only after sleep improves and internal warmth returns.");
      branchStatus = "delayed";
    }
  }
  if (branch === "taiyang_trauma_hyperreactivity" && !input.stable) {
    branchDelays.push("Reactivity pattern requires stability before any HILT layer.");
    branchStatus = "delayed";
  }

  const blocked = contraindications.length > 0;
  return {
    eligible: !blocked && branchStatus !== "delayed",
    blocked,
    status: blocked ? "blocked" : branchStatus,
    contraindications,
    branch_delays: branchDelays,
    patient_message: blocked ? laserEligibilityData.app_message_when_contraindicated : "",
    internal_hungarian_message: blocked ? laserEligibilityData.internal_hungarian_message : "",
    mechanism_summary: laserEligibilityData.mechanism_summary,
    formal_documentation_template: laserEligibilityData.formal_documentation_template
  };
}

function evaluateSupplementEligibility(input, branch) {
  const contraindications = [];
  if (input.active_panic_or_dissociation) contraindications.push("active panic or dissociation");
  if (input.acute_migraine_active) contraindications.push("acute migraine");
  if (input.fresh_trauma) contraindications.push("fresh trauma");
  if (branch === "taiyang_trauma_hyperreactivity" && input.severe_shaoyin_depletion) contraindications.push("severe Shaoyin deficiency");

  return {
    eligible: contraindications.length === 0,
    blocked: contraindications.length > 0,
    contraindications,
    role: "DuoLife = biological stabilisation only. It is never the primary treatment layer."
  };
}

function branchIntervention(branch, input, laserEligibility, supplementEligibility) {
  const source = pattern(branch);
  const interventions = source.interventions || {};
  const device = interventions.device && typeof interventions.device === "object" ? interventions.device : {};
  const supplement = interventions.supplement && typeof interventions.supplement === "object" ? interventions.supplement : interventions.supplement;
  const formalZone = FORMAL_ZONES[branch] || "functional";
  const contraindications = [];

  if (branch === "taiyang_shaoyin_deficiency" && input.heat_signs) {
    contraindications.push("Rou Gui micro-dose contraindicated while heat signs are present.");
  }
  if (branch === "taiyang_trauma_hyperreactivity") {
    contraindications.push("Do not apply HILT directly to the head or neck in this branch.");
  }

  return {
    herb_layer: {
      status: "first_line",
      herbs: Array.isArray(interventions.herbs) ? interventions.herbs : [],
      preparation: interventions.preparation || "not specified in source",
      goal: interventions.goal || "Provide field direction before any device or supplement layer."
    },
    laser_layer: {
      status: laserEligibility.status,
      recommendation: device.recommendation || "not explicitly specified",
      internal_target_zones: device.target_zones || [],
      forbidden_zones: device.forbidden_zones || [],
      mechanism: device.mechanism || device.rationale || "not explicitly specified",
      formal_documentation_label: `Peripheral neuro-fascial decompression using HILT laser at ${formalZone} convergence zones.`,
      patient_label: "neuro-fascial decompression support",
      notes: [
        device.rule || "",
        device.gate_question || "",
        ...(laserEligibility.branch_delays || [])
      ].filter(Boolean)
    },
    supplement_layer: {
      status: supplementEligibility.eligible ? (supplement?.status || "not explicitly specified") : "blocked",
      name: supplement?.name || String(supplement || "not explicitly specified"),
      rationale: supplement?.rationale || "Biological stabilisation only; not primary treatment.",
      timing: supplement?.timing || "",
      contraindications: supplement?.contraindicated_if || supplement?.avoid || []
    },
    contraindications
  };
}

function terminology(systemMode, branch) {
  return {
    systemMode,
    branch_label: systemMode === "TCM" ? TCM_LABELS[branch] : NEUTRAL_LABELS[branch],
    visible_terms: taiyangModuleData.system_modes?.[systemMode] || taiyangModuleData.system_modes?.["integrative-neutral"] || []
  };
}

function evaluateTaiyangModule(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];

  if (!input.posterior_tension) {
    triggered.push(rule("B14_R001", "posterior tension is false"));
    return {
      engine: "taiyang_module_v1",
      name: "TAIYANG_MODULE_v1.0",
      subtitle: "Posterior Shell Overpressure / Blocked Shaoyin Return Flow",
      source: ["avicenna_engine_batch14.json", "taiyangModule.v1.json", "laserEligibility.taiyang.json"],
      active: false,
      route_to: ["Shaoyang", "Jueyin", "Shaoyin"],
      selected_branch: "",
      branch_scores: Object.fromEntries(BRANCHES.map((branch) => [branch, 0])),
      triggered_rules: uniqueRules(triggered),
      integration_order: taiyangModuleData.mandatory_order,
      patient: {
        title: "Taiyang posterior shell screen not active",
        summary: "Posterior tension is not active from the current inputs, so this module exits and routes the case toward Shaoyang, Jueyin, or Shaoyin reasoning instead. This is an educational pattern-recognition tool, not a medical diagnosis.",
        safety_notes: [
          "This is an educational pattern-recognition tool, not a medical diagnosis.",
          "Medication, herb, supplement, or device changes must be discussed with a clinician."
        ]
      },
      clinician: {
        route_to: ["Shaoyang", "Jueyin", "Shaoyin"],
        reason: "posterior_tension == false"
      }
    };
  }

  if (input.tension_worsens_with_stress_cold_or_overstimulation === false) {
    triggered.push(rule("B14_R002", "posterior tension present but not stress/cold/overstimulation sensitive"));
  }
  if (input.cranial_pressure) triggered.push(rule("B14_R003", "cranial pressure signal"));
  if (input.edema_present || input.venous_stasis) triggered.push(rule("B14_R004", "oedema or venous stasis"));
  if (input.cold_lower_body && input.sleep_quality === "poor" && input.shaoyin_fire_deficient) triggered.push(rule("B14_R005", "cold lower body + poor sleep + deficient Shaoyin fire"));
  if (input.panic_attacks || input.skin_reactivity_high || input.sensory_overload) triggered.push(rule("B14_R006", "reactivity gate"));
  if (input.active_panic_or_dissociation) triggered.push(rule("B14_R007", "active panic or dissociation"));
  if (input.acute_migraine_active) triggered.push(rule("B14_R008", "acute migraine active"));
  if (input.severe_shaoyin_depletion) triggered.push(rule("B14_R009", "severe Shaoyin depletion"));
  if (input.fresh_trauma) triggered.push(rule("B14_R010", "fresh trauma"));
  if (input.psychotic_state) triggered.push(rule("B14_R011", "psychotic state"));
  if (input.severe_IIH_symptoms) triggered.push(rule("B14_R012", "severe IIH symptoms"));

  const scoring = calculateBranchScores(input);
  const selection = selectBranch(scoring.scores);
  const selectedBranch = selection.selected_branch || "taiyang_pure_tension";
  const selectedPattern = pattern(selectedBranch);
  const laser = evaluateLaserEligibility(input, selectedBranch);
  const supplement = evaluateSupplementEligibility(input, selectedBranch);
  const intervention = branchIntervention(selectedBranch, input, laser, supplement);
  const display = terminology(input.systemMode, selectedBranch);

  if (selectedBranch === "taiyang_shaoyin_deficiency" && !laser.blocked) triggered.push(rule("B14_R013", "Shaoyin-deficiency branch laser delay gate"));
  if (selectedBranch === "taiyang_shaoyin_deficiency" && supplement.eligible) triggered.push(rule("B14_R014", "Shaoyin-deficiency branch supplement timing"));
  if (selectedBranch === "taiyang_trauma_hyperreactivity" && input.stable) triggered.push(rule("B14_R015", "stable trauma/reactivity branch"));
  if (selectedBranch === "taiyang_water_sludging" && input.acute_cranial_pressure) triggered.push(rule("B14_R016", "acute cranial pressure in water-sludging branch"));
  if (supplement.eligible) triggered.push(rule("B14_R017", "DuoLife eligible as third layer only"));
  if (input.intervention_documentation_required) triggered.push(rule("B14_R018", "formal documentation requested"));
  if (selectedBranch === "taiyang_shaoyin_deficiency") triggered.push(rule("B14_R019", input.heat_signs ? "Rou Gui present with heat signs" : "Rou Gui micro-dose rule applies"));

  const contraindications = [
    ...laser.contraindications.map((item) => `HILT laser blocked: ${item}.`),
    ...supplement.contraindications.map((item) => `DuoLife layer blocked: ${item}.`),
    ...intervention.contraindications
  ];

  const integrationSteps = [
    {
      order: 1,
      layer: "Herba",
      status: "first",
      description: "field direction + internal recall",
      active: true
    },
    {
      order: 2,
      layer: "HILT Laser",
      status: laser.status,
      description: "shell decompression / fascia reset, only if eligible",
      active: laser.eligible
    },
    {
      order: 3,
      layer: "DuoLife",
      status: supplement.eligible ? "eligible" : "blocked",
      description: "biological stabilisation only, never primary treatment",
      active: supplement.eligible
    }
  ];

  return {
    engine: "taiyang_module_v1",
    name: "TAIYANG_MODULE_v1.0",
    subtitle: "Posterior Shell Overpressure / Blocked Shaoyin Return Flow",
    source: ["avicenna_engine_batch14.json", "taiyangModule.v1.json", "laserEligibility.taiyang.json"],
    active: true,
    selected_branch: selectedBranch,
    selected_branch_label: display.branch_label,
    selected_pattern: selectedPattern,
    overlay_activation_status: {
      active: selection.overlays.length > 0,
      overlays: selection.overlays
    },
    mixed_patterns: selection.mixed_patterns,
    branch_scores: scoring.scores,
    score_evidence: scoring.evidence,
    ranked_branches: selection.ranked,
    branch_selection_note: selection.mixed_patterns.length
      ? "Mixed Taiyang pattern: sequence the dominant branch first, then reassess secondary contributors."
      : "Dominant Taiyang branch selected by weighted posterior-shell evidence.",
    route_flags: input.tension_worsens_with_stress_cold_or_overstimulation === false
      ? ["Posterior tension is not clearly stress/cold/overstimulation sensitive; consider Shaoyang module overlap."]
      : [],
    integration_order_status: {
      valid_order: true,
      order: integrationSteps,
      mandatory_principle: "Never reverse the order: Herba -> HILT Laser -> DuoLife."
    },
    laser_eligibility: laser,
    supplement_eligibility: supplement,
    intervention_layers: intervention,
    formal_documentation: {
      label: intervention.laser_layer.formal_documentation_label,
      rule: "Formal documentation uses biomechanical / neurofascial terminology only. Meridian, acupuncture point, and field terminology remain internal."
    },
    systemMode: input.systemMode,
    display_terms: display.visible_terms,
    internal_field_logic: selectedPattern.field_logic || "",
    target_zones: {
      internal: intervention.laser_layer.internal_target_zones,
      formal_zone: FORMAL_ZONES[selectedBranch]
    },
    herb_layer: intervention.herb_layer,
    supplement_layer: intervention.supplement_layer,
    triggered_rules: uniqueRules(triggered),
    contraindications: [...new Set(contraindications)],
    cross_batch_links: taiyangModuleData.cross_batch_links || [],
    core_principles: GLOBAL_PRINCIPLES,
    patient: {
      title: display.branch_label || "Taiyang posterior shell pattern",
      summary: `This may reflect a ${display.branch_label} pattern: posterior tension with blocked internal return flow in this model. The safest order is herbal direction first, HILT laser only if eligible, then biological stabilisation if appropriate. This is an educational pattern-recognition tool, not a medical diagnosis.`,
      branch_selection_note: selection.mixed_patterns.length
        ? "More than one Taiyang layer is close. The model sequences rather than stacks support."
        : "One Taiyang branch is currently dominant from the provided inputs.",
      laser_message: laser.blocked ? "The field needs direction, not energy." : "Laser is considered only after safety gates and branch timing are checked.",
      integration_order: integrationSteps.map((step) => `${step.order}. ${step.layer}: ${step.description}`),
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "Medication, herb, supplement, or device changes must be discussed with a clinician.",
        "DuoLife support is biological stabilisation only, not primary treatment.",
        ...(laser.blocked ? ["The field needs direction, not energy."] : [])
      ]
    },
    clinician: {
      selected_branch: selectedBranch,
      selected_branch_label: display.branch_label,
      overlay_activation_status: {
        active: selection.overlays.length > 0,
        overlays: selection.overlays
      },
      laser_eligibility_status: laser,
      supplement_eligibility_status: supplement,
      integration_order_status: {
        valid_order: true,
        order: integrationSteps
      },
      formal_documentation_wording: intervention.laser_layer.formal_documentation_label,
      internal_field_logic: selectedPattern.field_logic || "",
      recommended_target_zones: intervention.laser_layer.internal_target_zones,
      herb_layer: intervention.herb_layer,
      supplement_layer: intervention.supplement_layer,
      triggered_rules: uniqueRules(triggered),
      contraindications: [...new Set(contraindications)],
      branch_scores: scoring.scores,
      score_evidence: scoring.evidence,
      systemMode: input.systemMode,
      cross_batch_links: taiyangModuleData.cross_batch_links || []
    }
  };
}

module.exports = {
  evaluateTaiyangModule,
  batch14Data,
  taiyangModuleData,
  laserEligibilityData
};
