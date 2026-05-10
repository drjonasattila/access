const headacheTriAxialData = require("./data/engines/headacheTriAxialEngine.v1.json");
const trigeminalNeuralgiaData = require("./data/engines/trigeminalNeuralgiaModule.v1.json");
const metabolicRhythmData = require("./data/engines/metabolicRhythmModule.v1.json");
const headacheGridStates = require("./data/libraries/headacheGridStates.json");
const fasciaNerveVesselUnit = require("./data/libraries/fasciaNerveVesselUnit.json");
const sharedDiagnosisMapBatch17 = require("./data/libraries/sharedDiagnosisMap.batch17.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const PATIENT_DISCLAIMER = "This is an educational pattern-recognition tool, not a medical diagnosis.";
const PRACTITIONER_DISCLAIMER = "This tool supports structured clinical reasoning and does not replace professional judgement.";

const HEADACHE_NODES = Object.fromEntries((headacheTriAxialData.nodes || []).map((node) => [node.id, node]));
const VALID_GRID_STATES = ["continuous_grid", "fragmented_grid"];
const VALID_OUTPUT_MODES = ["patient", "practitioner"];

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

function rule(id, condition, action, reason = "") {
  return { id, condition, action, reason };
}

function normaliseOutputMode(input) {
  return VALID_OUTPUT_MODES.includes(input.output_mode) ? input.output_mode : input.practitioner_mode ? "practitioner" : "patient";
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.headache_features),
    ...list(input.pain_features),
    ...list(input.autonomic_signs),
    ...list(input.metabolic_features),
    ...list(input.tgn_features)
  ];
  const headacheCharacter = lower(input.headache_character || input.pain_character || input.pain_quality);
  const diagnosis = lower(input.western_diagnosis || input.diagnosis || "");
  const requested = [
    ...list(input.treatment_selected),
    ...list(input.requested_interventions),
    ...list(input.supplements_selected)
  ].map(lower);

  const autonomicSignsPresent = bool(input.autonomic_signs_present)
    || bool(input.tearing)
    || bool(input.rhinorrhea)
    || bool(input.ptosis)
    || bool(input.miosis)
    || includesAny(symptoms, ["tearing", "rhinorrhea", "ptosis", "miosis", "lacrimation", "nasal_discharge"]);
  const auraPresent = bool(input.aura_present)
    || bool(input.visual_aura)
    || bool(input.sensory_march)
    || includesAny(symptoms, ["aura", "visual_phenomena", "scotoma", "zigzag", "sensory_march"]);
  const pressurePattern = bool(input.pressure_pattern)
    || bool(input.occipital_heaviness)
    || bool(input.postural_headache)
    || bool(input.valsalva_worse)
    || bool(input.worse_with_Valsalva)
    || includesAny(symptoms, ["occipital_heaviness", "bilateral_pressure", "postural_headache", "pressure", "valsava", "valsalva"]);
  const electricShock = bool(input.electric_shock_pain)
    || headacheCharacter.includes("electric")
    || headacheCharacter.includes("shock")
    || includesAny(symptoms, ["electric", "shock", "lancinating"]);
  const triggerZones = bool(input.trigger_zones)
    || bool(input.touch_triggered)
    || bool(input.chewing_triggered)
    || bool(input.wind_triggered)
    || includesAny(symptoms, ["trigger_zone", "touch_trigger", "chewing", "wind_trigger"]);

  return {
    output_mode: normaliseOutputMode(input),
    module_focus: input.module_focus || "auto",
    symptoms,
    diagnosis,
    requested,
    headache_character: headacheCharacter,
    grid_state: VALID_GRID_STATES.includes(input.grid_state) ? input.grid_state : "",
    autonomic_signs_present: autonomicSignsPresent,
    aura_present: auraPresent,
    visual_aura: bool(input.visual_aura) || includesAny(symptoms, ["visual_phenomena", "scotoma", "zigzag"]),
    sensory_march: bool(input.sensory_march) || includesAny(symptoms, ["sensory_march"]),
    reversible_neuro_symptoms: bool(input.reversible_neuro_symptoms),
    aura_duration_minutes: number(input.aura_duration_minutes),
    first_aura_over_50: bool(input.first_aura_over_50),
    motor_aura: bool(input.motor_aura),
    pressure_pattern: pressurePattern,
    valsalva_worse: bool(input.valsalva_worse) || bool(input.worse_with_Valsalva) || includesAny(symptoms, ["valsava", "valsalva"]),
    severe_valsava_worsening: bool(input.severe_valsava_worsening) || bool(input.severe_valsalva_worsening),
    occipital_heaviness: bool(input.occipital_heaviness) || includesAny(symptoms, ["occipital_heaviness", "occipital_pressure"]),
    bilateral_pressure: bool(input.bilateral_pressure) || includesAny(symptoms, ["bilateral_pressure", "tight_band"]),
    postural_headache: bool(input.postural_headache) || includesAny(symptoms, ["postural_headache", "lying_down_worse"]),
    throbbing: bool(input.throbbing) || headacheCharacter.includes("throbb") || headacheCharacter.includes("puls"),
    nausea_vomiting: bool(input.nausea_vomiting) || bool(input.nausea_present) || bool(input.vomiting_present) || includesAny(symptoms, ["nausea", "vomiting"]),
    photophobia: bool(input.photophobia) || bool(input.photophobia_present),
    phonophobia: bool(input.phonophobia) || bool(input.phonophobia_present),
    activity_worsens: bool(input.activity_worsens) || bool(input.aggravated_by_activity),
    stress_hormonal_trigger: bool(input.stress_hormonal_trigger) || includesAny(symptoms, ["stress_trigger", "hormonal_trigger"]),
    strict_unilateral: bool(input.strict_unilateral) || includesAny(symptoms, ["strict_unilateral", "fixed_side"]),
    periorbital_temporal: bool(input.periorbital_temporal) || includesAny(symptoms, ["periorbital", "temporal"]),
    restlessness_agitation: bool(input.restlessness_agitation) || includesAny(symptoms, ["restlessness", "agitation"]),
    circadian_seasonal: bool(input.circadian_seasonal) || includesAny(symptoms, ["circadian", "seasonal"]),
    indomethacin_complete_response: bool(input.indomethacin_complete_response),
    oxygen_response: bool(input.oxygen_response),
    tgn_features_present: electricShock || triggerZones || bool(input.tgn_suspected) || diagnosis.includes("trigeminal"),
    electric_shock_pain: electricShock,
    brief_attacks: bool(input.brief_attacks) || includesAny(symptoms, ["brief_attack", "seconds"]),
    trigger_zones: triggerZones,
    trigeminal_distribution: input.trigeminal_distribution || (includesAny(symptoms, ["v1", "v2", "v3", "trigeminal"]) ? "trigeminal" : ""),
    background_concomitant_pain: bool(input.background_concomitant_pain),
    continuous_trigeminal_pain: bool(input.continuous_trigeminal_pain),
    secondary_tgn_suspected: bool(input.secondary_tgn_suspected) || includesAny(symptoms, ["multiple_sclerosis", "tumour", "tumor", "lyme"]),
    neuroimaging_done: bool(input.neuroimaging_done),
    no_neurovascular_conflict: bool(input.no_neurovascular_conflict),
    carbamazepine_current: bool(input.carbamazepine_current),
    carbamazepine_taper_requested: bool(input.carbamazepine_taper_requested),
    shaoyang_release_stable: bool(input.shaoyang_release_stable),
    yin_support_stable: bool(input.yin_support_stable),
    herb_formula_starting: bool(input.herb_formula_starting),
    formula_selected: input.formula_selected || "",
    laser_target: input.laser_target || "",
    vitamin_D_supplementation: input.vitamin_D_supplementation || "",
    nigella_selected: bool(input.nigella_selected) || requested.includes("nigella"),
    age: number(input.age),
    central_weight_gain: bool(input.central_weight_gain) || bool(input.increased_waist_circumference),
    fatigue: bool(input.fatigue) || includesAny(symptoms, ["fatigue"]),
    low_back_stiffness: bool(input.low_back_stiffness) || includesAny(symptoms, ["low_back_stiffness"]),
    poor_sleep: bool(input.poor_sleep) || bool(input.sleep_fragmentation) || includesAny(symptoms, ["poor_sleep", "sleep_fragmentation"]),
    concentration_decline: bool(input.concentration_decline) || includesAny(symptoms, ["brain_fog", "concentration_decline"]),
    stress_dominance: bool(input.stress_dominance) || includesAny(symptoms, ["stress_dominance", "burnout"]),
    early_insulin_resistance: bool(input.early_insulin_resistance) || bool(input.insulin_resistance),
    advanced_metabolic_disease: bool(input.advanced_metabolic_disease),
    structural_abdominal_wall_defect: bool(input.structural_abdominal_wall_defect) || bool(input.hernia) || bool(input.significant_diastasis),
    lab_confirmation: bool(input.lab_confirmation) || bool(input.lab_confirmed_indication),
    lab_guided_addon_requested: bool(input.lab_guided_addon_requested) || requested.some((item) => item.includes("lab_addon") || item.includes("glucose") || item.includes("lipid")),
    supplement_selected_without_lab: bool(input.supplement_selected_without_lab),
    positioning_language: input.positioning_language || "",
    sleep_quality_improving: bool(input.sleep_quality_improving),
    energy_improving: bool(input.energy_improving),
    anti_inflammatory_only_selected: bool(input.anti_inflammatory_only_selected) || requested.includes("anti-inflammatory-only"),
    vasodilator_selected: bool(input.vasodilator_selected) || requested.includes("vasodilator"),
    thunderclap_headache: bool(input.thunderclap_headache) || bool(input.thunderclap),
    neuro_deficit: bool(input.neuro_deficit) || bool(input.new_neurological_deficit),
    fever_meningism: bool(input.fever_meningism) || bool(input.fever_neck_stiffness),
    papilloedema_present: bool(input.papilloedema_present) || bool(input.papilledema_present),
    pregnancy_postpartum_severe_headache: bool(input.pregnancy_postpartum_severe_headache),
    new_onset_over_50: bool(input.new_onset_over_50) || bool(input.new_headache_age_over_50),
    cancer_immunosuppression: bool(input.cancer_immunosuppression) || bool(input.cancer_active) || bool(input.immunosuppression),
    progressive_worsening: bool(input.progressive_worsening),
    exertional_valsava_new_pattern: bool(input.exertional_valsava_new_pattern) || bool(input.exertional_valsalva_new_pattern) || bool(input.new_exertional_headache)
  };
}

function detectHeadacheRedFlags(input) {
  const flags = [];
  if (input.thunderclap_headache) flags.push("thunderclap headache");
  if (input.neuro_deficit) flags.push("new neurological deficit");
  if (input.fever_meningism) flags.push("fever + meningism");
  if (input.papilloedema_present) flags.push("papilloedema");
  if (input.pregnancy_postpartum_severe_headache) flags.push("pregnancy/postpartum severe headache");
  if (input.new_onset_over_50) flags.push("new onset >50");
  if (input.cancer_immunosuppression) flags.push("cancer or immunosuppression");
  if (input.progressive_worsening) flags.push("progressive worsening");
  if (input.exertional_valsava_new_pattern) flags.push("new exertional/Valsalva pattern");
  if (input.severe_valsava_worsening && input.pressure_pattern) flags.push("severe Valsalva pressure pattern");
  if (input.first_aura_over_50) flags.push("first aura >50 years");
  if (input.motor_aura) flags.push("motor aura");
  if (input.aura_duration_minutes > 60) flags.push("aura >60 minutes");
  return flags;
}

function inferGridState(input, evidence) {
  if (input.grid_state) {
    evidence.push(`grid_state provided: ${input.grid_state}`);
    return input.grid_state;
  }
  if (input.aura_present || input.sensory_march || input.visual_aura || input.reversible_neuro_symptoms) {
    evidence.push("aura or sensory march suggests fragmented grid");
    return "fragmented_grid";
  }
  if (input.autonomic_signs_present || input.pressure_pattern || input.occipital_heaviness || input.bilateral_pressure || input.postural_headache) {
    evidence.push("pressure/autonomic/fluid-discharge features suggest continuous grid");
    return "continuous_grid";
  }
  if (input.throbbing && (input.photophobia || input.phonophobia || input.nausea_vomiting)) {
    evidence.push("migraine rhythm features suggest fragmented grid");
    return "fragmented_grid";
  }
  evidence.push("grid state defaulted to continuous_grid due insufficient fragmentation evidence");
  return "continuous_grid";
}

function scoreHeadacheAxes(input, gridState) {
  const scores = {
    TaiYang: { score: 0, evidence: [] },
    ShaoYang: { score: 0, evidence: [] },
    YangMing: { score: 0, evidence: [] }
  };
  function add(axis, points, reason) {
    scores[axis].score += points;
    scores[axis].evidence.push({ points, reason });
  }

  if (input.occipital_heaviness) add("TaiYang", 3, "occipital heaviness / posterior pressure");
  if (input.valsalva_worse || input.postural_headache) add("TaiYang", 3, "Valsalva or postural pressure pattern");
  if (input.papilloedema_present) add("TaiYang", 4, "papilloedema pressure red flag");
  if (input.bilateral_pressure) add("TaiYang", 2, "bilateral pressure or TTH-like tightening");
  if (gridState === "continuous_grid" && input.pressure_pattern) add("TaiYang", 2, "continuous pressure/fluid grid");

  if (input.throbbing) add("ShaoYang", 2, "throbbing / rhythm instability");
  if (input.nausea_vomiting) add("ShaoYang", 2, "nausea or vomiting");
  if (input.photophobia || input.phonophobia) add("ShaoYang", 2, "photo/phonophobia");
  if (input.activity_worsens) add("ShaoYang", 2, "routine activity worsens pain");
  if (input.stress_hormonal_trigger) add("ShaoYang", 1, "stress or hormonal trigger");
  if (input.aura_present) add("ShaoYang", 3, "aura overlay implies ShaoYang rhythm instability");
  if (gridState === "fragmented_grid") add("ShaoYang", 2, "fragmented grid");

  if (input.autonomic_signs_present) add("YangMing", 5, "autonomic signs mandatory for TAC branch");
  if (input.strict_unilateral) add("YangMing", 2, "strict unilateral fixed-side pain");
  if (input.periorbital_temporal) add("YangMing", 2, "periorbital / temporal branch");
  if (input.restlessness_agitation) add("YangMing", 2, "restlessness/agitation during attack");
  if (input.circadian_seasonal) add("YangMing", 1, "circadian/seasonal periodicity");
  if (input.indomethacin_complete_response) add("YangMing", 3, "complete indomethacin response points to PH/HC");
  if (input.oxygen_response) add("YangMing", 2, "oxygen response supports cluster branch");

  return Object.fromEntries(Object.entries(scores).map(([axis, value]) => [axis, {
    score: Math.min(100, value.score * 10),
    raw_score: value.score,
    evidence: value.evidence
  }]));
}

function rankedAxes(scores) {
  return Object.entries(scores)
    .map(([axis, value]) => ({ axis, score: value.score, raw_score: value.raw_score }))
    .sort((a, b) => b.score - a.score);
}

function selectHeadacheNode(input, ranked) {
  if (input.autonomic_signs_present) return "YANGMING_ST_LI_TAC_TGN";
  if (input.aura_present || ranked[0]?.axis === "ShaoYang") return "MIGRAINE_GB_TB";
  if (input.pressure_pattern || ranked[0]?.axis === "TaiYang") return "TAIYANG_BL_SI_TTH_IIH";
  if (ranked[0]?.axis === "YangMing") return "YANGMING_ST_LI_TAC_TGN";
  return "MIGRAINE_GB_TB";
}

function triageWizard(input) {
  if (input.autonomic_signs_present) {
    return {
      probability: "HIGH",
      node: "YANGMING_ST_LI_TAC_TGN",
      reason: "Prominent autonomic signs route to the YangMing TAC branch."
    };
  }
  if (input.aura_present) {
    return {
      probability: "HIGH",
      node: "MIGRAINE_GB_TB",
      overlay: "AURA_SUPRA",
      reason: "Aura activates the suprasystem overlay on the migraine/ShaoYang node."
    };
  }
  if (input.pressure_pattern) {
    return {
      probability: "HIGH",
      node: "TAIYANG_BL_SI_TTH_IIH",
      reason: "Pressure, occipital heaviness, or Valsalva pattern routes to TaiYang pressure-fluid logic."
    };
  }
  return {
    probability: "MEDIUM",
    node: "TAIYANG_BL_SI_TTH_IIH or MIGRAINE_GB_TB",
    reason: "No autonomic, aura, or strong pressure signal was selected; this remains an educational routing estimate."
  };
}

function auraOverlay(input) {
  const active = input.aura_present;
  const redFlags = [];
  if (input.first_aura_over_50) redFlags.push("first aura >50 years");
  if (input.motor_aura) redFlags.push("motor aura");
  if (input.aura_duration_minutes > 60) redFlags.push("aura >60 minutes");
  return {
    active,
    node: active ? "AURA_SUPRA" : "",
    interpretation: active
      ? "Aura is treated as a fragmented-grid sparking overlay, not a standalone axis."
      : "Aura overlay not active.",
    red_flags: redFlags
  };
}

function classifyYangMingBranch(input) {
  if (input.tgn_features_present && !input.autonomic_signs_present) {
    return {
      branch: "trigeminal_neuralgia_cross_reference",
      note: "Electric-shock trigger-zone pain without autonomic signs routes to the dedicated TGN module, not TAC."
    };
  }
  if (!input.autonomic_signs_present) {
    return {
      branch: "yangming_not_confirmed",
      note: "Autonomic signs are mandatory for TAC routing."
    };
  }
  if (input.indomethacin_complete_response) {
    return {
      branch: "PH_or_HC_indomethacin_pathway",
      note: "Complete indomethacin response suggests paroxysmal hemicrania or hemicrania continua pathway."
    };
  }
  if (input.oxygen_response || input.circadian_seasonal || input.restlessness_agitation) {
    return {
      branch: "cluster_headache_TAC_pathway",
      note: "Autonomic signs with restlessness/periodicity or oxygen response support cluster-style TAC routing."
    };
  }
  return {
    branch: "TAC_branch",
    note: "Autonomic signs are present; TAC branch should be considered educationally."
  };
}

function sharedRuleChecks(input, gridState) {
  const triggered = [];
  const cautions = [];
  if (gridState === "fragmented_grid" && input.anti_inflammatory_only_selected) {
    triggered.push(rule(
      "B17_SHARED_006",
      "grid_state == fragmented AND treatment_selected == anti-inflammatory_only",
      "Insufficient; membrane/EZ stabilisation is required.",
      "fragmented grid with anti-inflammatory-only plan"
    ));
    cautions.push("Anti-inflammatory-only support is insufficient for fragmented-grid patterns; membrane support and stabilisation are needed.");
  }
  if (gridState === "continuous_grid" && input.vasodilator_selected) {
    triggered.push(rule(
      "B17_SHARED_007",
      "grid_state == continuous AND treatment_selected == vasodilator",
      "Check axis first before vasodilator logic.",
      "continuous grid with vasodilator selected"
    ));
    cautions.push("Continuous-grid patterns require axis checking before vasodilator-style support.");
  }
  if (input.autonomic_signs_present) {
    triggered.push(rule("B17_SHARED_001", "headache AND autonomic_signs_present == true", "Route to YANGMING_ST_LI_TAC_TGN node.", "autonomic signs present"));
  }
  if (input.aura_present) {
    triggered.push(rule("B17_SHARED_002", "headache AND aura_present == true", "Activate AURA_SUPRA overlay.", "aura present"));
  }
  if (input.valsalva_worse && input.papilloedema_present) {
    triggered.push(rule("B17_SHARED_003", "headache AND worse_with_Valsalva == true AND papilloedema_present == true", "Urgent IIH pathway only.", "Valsalva + papilloedema"));
  }
  if (input.indomethacin_complete_response) {
    triggered.push(rule("B17_SHARED_005", "indomethacin_trial AND complete_response == true", "PH or HC diagnostic pathway; integrative support adjunct only.", "complete indomethacin response"));
  }
  return { triggered, cautions };
}

function evaluateHeadacheTriAxialEngine(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const redFlags = detectHeadacheRedFlags(input);
  const triggered = [];
  if (redFlags.length) {
    triggered.push(rule("B17_SHARED_004", "headache AND red_flag_present == true", "STOP all integrative pathway. Western medical assessment mandatory first.", redFlags.join(", ")));
    return sanitizeForOutput({
      engine: "headache_tri_axial_engine_v1",
      name: "HEADACHE_TRI_AXIAL_ENGINE_v1.0",
      stopped: true,
      red_flags: redFlags,
      selected_node: null,
      integrative_pathway_applied: false,
      triggered_rules: triggered,
      patient: {
        title: "Urgent headache safety stop",
        summary: "A red-flag headache feature is present. Western medical assessment is mandatory before any integrative routing. " + PATIENT_DISCLAIMER,
        safety_notes: [PATIENT_DISCLAIMER, "Seek urgent care for red flag symptoms."]
      },
      clinician: input.output_mode === "practitioner"
        ? {
            red_flags: redFlags,
            integrative_pathway_applied: false,
            triggered_rules: triggered
          }
        : undefined
    });
  }

  const gridEvidence = [];
  const gridState = inferGridState(input, gridEvidence);
  const scores = scoreHeadacheAxes(input, gridState);
  const ranked = rankedAxes(scores);
  const selectedNodeId = selectHeadacheNode(input, ranked);
  const selectedNode = HEADACHE_NODES[selectedNodeId];
  const wizard = triageWizard(input);
  const aura = auraOverlay(input);
  const yangmingBranch = selectedNodeId === "YANGMING_ST_LI_TAC_TGN" || input.tgn_features_present
    ? classifyYangMingBranch(input)
    : null;
  const shared = sharedRuleChecks(input, gridState);
  triggered.push(...shared.triggered);
  triggered.push(rule("B17_H001", "headache_tri_axial_model evaluated", "Axis determines pattern; grid state determines severity trajectory.", selectedNodeId));
  if (gridEvidence.length) triggered.push(rule("B17_H002", "grid_state inferred or provided", "Use grid_state as backend severity discriminator.", gridState));
  if (yangmingBranch?.branch === "trigeminal_neuralgia_cross_reference") {
    triggered.push(rule("B17_H003", "TGN-like pain without autonomic signs", "Route to dedicated TGN module rather than TAC.", "TGN differs from TAC routing"));
  }

  const transition = gridState === "fragmented_grid"
    ? "ShaoYang fragmented-grid instability with possible aura overlay"
    : selectedNodeId === "YANGMING_ST_LI_TAC_TGN"
      ? "Continuous hyper-energised grid with autonomic discharge"
      : "Continuous pressure-fluid grid with posterior shell load";

  const result = {
    engine: "headache_tri_axial_engine_v1",
    name: "HEADACHE_TRI_AXIAL_ENGINE_v1.0",
    source: ["headacheTriAxialEngine.v1.json", "headacheGridStates.json", "fasciaNerveVesselUnit.json"],
    stopped: false,
    backend_axiom: headacheTriAxialData.backend_axiom,
    grid_state: gridState,
    grid_state_evidence: gridEvidence,
    axis_scores: scores,
    ranked_axes: ranked,
    selected_axis: ranked[0]?.axis || "",
    selected_node: selectedNodeId,
    selected_node_data: selectedNode,
    triage_wizard: wizard,
    aura_overlay: aura,
    yangming_branch: yangmingBranch,
    tgn_cross_reference: Boolean(yangmingBranch?.branch === "trigeminal_neuralgia_cross_reference"),
    transition,
    shared_unit: fasciaNerveVesselUnit,
    diagnosis_map_additions: sharedDiagnosisMapBatch17,
    cautions: shared.cautions,
    triggered_rules: triggered,
    patient: {
      title: selectedNode?.title || "Headache terrain pattern",
      summary: `This may reflect a ${ranked[0]?.axis || "mixed"} headache-axis pattern with ${gridState.replace(/_/g, " ")}. This is educational routing only, not a diagnosis.`,
      routing: wizard.probability ? `${wizard.probability} probability routing: ${wizard.node}` : "",
      aura_note: aura.active ? "Aura is treated here as a fragmented-grid overlay rather than a separate axis." : "",
      safety_notes: [PATIENT_DISCLAIMER, "Seek urgent care for red flag symptoms."]
    },
    clinician: input.output_mode === "practitioner"
      ? {
          disclaimer: PRACTITIONER_DISCLAIMER,
          axis_scores: scores,
          grid_state: gridState,
          transition,
          backend_logic: selectedNode?.tcm_backend || {},
          formula_backend: selectedNode?.tcm_backend?.formula_backend_only || "",
          laser_logic: "Laser/device logic follows the dominant failure layer and shared Fascia-Nerve-Vessel unit.",
          membrane_instability_concepts: headacheGridStates,
          fascia_nerve_vessel_unit: fasciaNerveVesselUnit,
          triggered_rules: triggered
        }
      : undefined
  };

  if (input.output_mode === "patient") delete result.clinician;
  return sanitizeForOutput(result);
}

function classifyTgn(input) {
  if (input.secondary_tgn_suspected) return "secondary_TGN";
  if (input.electric_shock_pain && input.brief_attacks && input.trigger_zones && input.background_concomitant_pain) return "atypical_TGN";
  if (input.electric_shock_pain && input.brief_attacks && input.trigger_zones) return "typical_TGN";
  if (input.continuous_trigeminal_pain || input.background_concomitant_pain) return "trigeminal_neuropathic_pain";
  if (input.no_neurovascular_conflict && input.electric_shock_pain) return "idiopathic_TGN";
  return input.tgn_features_present ? "possible_TGN_pattern" : "insufficient_TGN_evidence";
}

function evaluateCarbamazepine(input, triggered) {
  if (!input.carbamazepine_current) {
    return {
      current: false,
      taper_status: "not_applicable",
      safety: ["No carbamazepine-specific transition requested."]
    };
  }

  triggered.push(rule(
    "B17_TGN_002",
    "TGN AND carbamazepine_current == true",
    "Do NOT taper before Shaoyang release and Yin support are stable.",
    "carbamazepine current"
  ));

  const stable = input.shaoyang_release_stable && input.yin_support_stable;
  const taperStatus = input.carbamazepine_taper_requested
    ? stable ? "eligible_for_clinician_supervised_slow_reduction" : "blocked_until_stabilisation"
    : "do_not_change_without_clinician";

  return {
    current: true,
    taper_requested: input.carbamazepine_taper_requested,
    taper_status: taperStatus,
    prerequisites: {
      shaoyang_release_stable: input.shaoyang_release_stable,
      yin_support_stable: input.yin_support_stable
    },
    safety: [
      "Carbamazepine is a strong CYP3A4 inducer with major interactions.",
      "It cannot be stopped suddenly.",
      "Herb or supportive foundations must be stable before any clinician-supervised taper discussion."
    ],
    interaction_note: trigeminalNeuralgiaData.backend_logic?.carbamazepine_field_effects || {}
  };
}

function evaluateTrigeminalNeuralgiaModule(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const tgnType = classifyTgn(input);
  const redFlags = [];
  if (tgnType === "secondary_TGN" && !input.neuroimaging_done) redFlags.push("secondary TGN must be excluded with neuroimaging");
  if (input.neuro_deficit) redFlags.push("new neurological deficit");

  if (redFlags.length) {
    triggered.push(rule("B17_TGN_007", "TGN_type == secondary AND neuroimaging_not_done == true", "Secondary TGN must be excluded before integrative pathway.", redFlags.join(", ")));
    return sanitizeForOutput({
      engine: "trigeminal_neuralgia_module_v1",
      name: "TRIGEMINAL_NEURALGIA_MODULE_v1.0",
      stopped: true,
      red_flags: redFlags,
      integrative_pathway_applied: false,
      triggered_rules: triggered,
      patient: {
        title: "Trigeminal neuralgia safety stop",
        summary: "Secondary trigeminal neuralgia or neurological red flags require medical evaluation before integrative support. " + PATIENT_DISCLAIMER,
        safety_notes: [PATIENT_DISCLAIMER, "Medication changes must be discussed with a clinician."]
      },
      clinician: input.output_mode === "practitioner"
        ? { tgn_type: tgnType, red_flags: redFlags, triggered_rules: triggered }
        : undefined
    });
  }

  const carbamazepine = evaluateCarbamazepine(input, triggered);
  const contraindications = [];
  const supportSequence = ["Shaoyang ventilation", "Yin/EZ support", "Local field stabilisation via laser only if appropriate"];

  if (lower(input.formula_selected).includes("huang_lian_jie_du")) {
    triggered.push(rule("B17_TGN_001", "TGN AND formula_selected == Huang_Lian_Jie_Du_Tang", "Reject for long-term use.", "too cold / EZ instability risk"));
    contraindications.push("Huang Lian Jie Du Tang is rejected for long-term TGN logic; acute inflammation only with clinician review.");
  }
  if (input.herb_formula_starting && input.carbamazepine_current) {
    triggered.push(rule("B17_TGN_003", "TGN AND herb_formula_starting == true while carbamazepine_current", "Start support first; do not reduce medication until stable.", "foundation before taper"));
  }
  if (input.headache_character.includes("sharp") || input.electric_shock_pain) {
    triggered.push(rule("B17_TGN_004", "TGN AND pain_character == sharp_electrical", "Increase Yin support first.", "sharp electrical pain"));
  }
  if (input.headache_character.includes("pressing") || input.headache_character.includes("migrating")) {
    triggered.push(rule("B17_TGN_005", "TGN AND pain_character == pressing_or_migrating", "Increase Shaoyang ventilation first.", "pressing/migrating pain"));
  }
  if (lower(input.laser_target).includes("direct_nerve")) {
    triggered.push(rule("B17_TGN_006", "TGN AND laser_target == direct_nerve_trunk", "Forbidden; target fascia-gate points only.", "direct nerve target selected"));
    contraindications.push("Direct nerve burning is forbidden; goal is peripheral neurofascial modulation, not nerve destruction.");
  }
  if (lower(input.vitamin_D_supplementation).includes("high")) {
    triggered.push(rule("B17_TGN_008", "TGN AND Vitamin_D_supplementation == high_dose", "High-dose Vitamin D may worsen neural over-tension.", "high-dose Vitamin D"));
    contraindications.push("Use moderate Vitamin D dosing only; high-dose use may worsen neural over-tension.");
  }

  const ezFragmented = input.grid_state === "fragmented_grid" || input.aura_present || input.electric_shock_pain;
  const formula = {
    rejected_long_term: "Huang Lian Jie Du Tang",
    recommended_base: "modified Xiao Chai Hu Tang",
    key_membrane_stabiliser: "Wu Wei Zi",
    wu_wei_zi_required: ezFragmented,
    backend_only: trigeminalNeuralgiaData.backend_logic?.formula_logic || {}
  };

  const laser = {
    preferred_wavelength: "830 nm",
    goal: "EZ reordering, not nerve destruction",
    legal_safe_wording: "Peripheral neurofascial modulation at convergence zones.",
    forbidden: ["direct nerve burning"],
    targets: ["GB20", "GB14", "SJ17", "facial fascia trigger zones"],
    protocol: trigeminalNeuralgiaData.backend_logic?.laser_protocol
  };

  const result = {
    engine: "trigeminal_neuralgia_module_v1",
    name: "TRIGEMINAL_NEURALGIA_MODULE_v1.0",
    source: ["trigeminalNeuralgiaModule.v1.json"],
    stopped: false,
    tgn_type: tgnType,
    dedicated_module_note: "TGN is cross-referenced from the YangMing headache node, but evaluated in this separate module.",
    core_backend: "Shaoyang gate entrapment + local EZ collapse + Yin deficit.",
    nerve_model: "The nerve is antenna, not primary error source.",
    carbamazepine_safety: carbamazepine,
    formula_logic: formula,
    laser_protocol: laser,
    nigella_support: input.nigella_selected
      ? { selected: true, note: "Nigella sativa is treated as safe anti-inflammatory support that does not block Shaoyang ventilation." }
      : { selected: false, note: "Nigella sativa remains available as non-blocking anti-inflammatory support if appropriate." },
    vitamin_D_rule: "Moderate dosing only; high-dose Vitamin D may worsen neural over-tension.",
    support_sequence: supportSequence,
    contraindications,
    triggered_rules: triggered,
    patient: {
      title: "Trigeminal neuralgia pattern module",
      summary: "This module treats trigeminal neuralgia-like pain as a neurofascial pattern requiring stabilisation before medication-transition discussion. It is not a diagnosis.",
      support: ["stabilise first", "support membrane/EZ layer", "avoid abrupt medication changes"],
      safety_notes: [PATIENT_DISCLAIMER, "Do not stop or change carbamazepine without clinician supervision."]
    },
    clinician: input.output_mode === "practitioner"
      ? {
          tgn_type: tgnType,
          carbamazepine_safety: carbamazepine,
          formula_logic: formula,
          laser_protocol: laser,
          western_classification: trigeminalNeuralgiaData.western_classification,
          backend_logic: trigeminalNeuralgiaData.backend_logic,
          triggered_rules: triggered,
          contraindications
        }
      : undefined
  };

  if (input.output_mode === "patient") delete result.clinician;
  return sanitizeForOutput(result);
}

function evaluateMetabolicRhythmModule(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const exclusions = [];
  if (input.structural_abdominal_wall_defect) exclusions.push("structural abdominal wall defect");
  if (input.advanced_metabolic_disease) exclusions.push("advanced metabolic disease");

  if (exclusions.length) {
    triggered.push(rule("B17_MET_003", "metabolic exclusion present", "Exclude from module and recommend standard assessment.", exclusions.join(", ")));
    return sanitizeForOutput({
      engine: "metabolic_rhythm_module_v1",
      name: "METABOLIC_RHYTHM_MODULE_v1.0",
      stopped: true,
      exclusions,
      patient: {
        title: "Metabolic rhythm safety boundary",
        summary: "This module is intended for early rhythm and recovery disruption only. The selected exclusion requires standard clinical assessment first. " + PATIENT_DISCLAIMER,
        safety_notes: [PATIENT_DISCLAIMER]
      },
      clinician: input.output_mode === "practitioner" ? { exclusions, triggered_rules: triggered } : undefined,
      triggered_rules: triggered
    });
  }

  const entryEvidence = [];
  if (input.age >= 40) entryEvidence.push("age 40+");
  if (input.central_weight_gain) entryEvidence.push("central weight gain / increased waist circumference");
  if (input.fatigue) entryEvidence.push("fatigue");
  if (input.low_back_stiffness) entryEvidence.push("low back stiffness");
  if (input.poor_sleep) entryEvidence.push("poor sleep / circadian drift");
  if (input.concentration_decline) entryEvidence.push("concentration decline");
  if (input.stress_dominance) entryEvidence.push("stress dominance");
  if (input.early_insulin_resistance) entryEvidence.push("early insulin resistance");

  const entryScore = Math.min(100, Math.round((entryEvidence.length / 8) * 100));
  const contraindications = [];
  if ((input.lab_guided_addon_requested || input.supplement_selected_without_lab) && !input.lab_confirmation) {
    triggered.push(rule("B17_MET_001", "metabolic_module AND supplement_selected WITHOUT lab_confirmation", "Only base rhythm support is permitted without labs.", "lab-guided add-on requested without labs"));
    contraindications.push("Lab-guided add-ons are blocked until a lab-confirmed indication is present; base rhythm support remains the only default layer.");
  }
  if (/fat\s*loss|weight\s*loss|cosmetic|visceral\s*fat\s*target/i.test(input.positioning_language)) {
    triggered.push(rule("B17_MET_002", "metabolic_module AND positioning_language includes fat_loss_claims", "Reject and replace with approved positioning language.", "forbidden positioning language"));
    contraindications.push("Fat-loss, cosmetic, or surgical-replacement framing is not allowed.");
  }
  if (input.sleep_quality_improving && input.energy_improving) {
    triggered.push(rule("B17_MET_006", "sleep_quality == improving AND energy == improving", "Primary outcome achieved; cautious lab-guided add-ons may be considered.", "sleep and energy improving"));
  }

  const layers = [
    {
      layer: 1,
      name: "Rhythm restoration",
      status: "foundation_first",
      support: ["circadian nutritional support", "morning activation support", "evening restorative support"]
    },
    {
      layer: 2,
      name: "Autonomic/fascial support",
      status: "optional_after_foundation",
      support: ["paraspinal fascial support", "thoracolumbar fascia support", "breathing rhythm support", "optional laser adjunct if eligible"]
    },
    {
      layer: 3,
      name: "Lab-guided add-ons only",
      status: input.lab_confirmation ? "available_if_indicated" : "blocked_without_labs",
      support: input.lab_confirmation ? ["metabolic support where labs indicate", "lipid/metabolic support where labs indicate"] : []
    }
  ];

  const result = {
    engine: "metabolic_rhythm_module_v1",
    name: "METABOLIC_RHYTHM_MODULE_v1.0",
    source: ["metabolicRhythmModule.v1.json"],
    stopped: false,
    active: entryScore > 0,
    entry_score: entryScore,
    entry_evidence: entryEvidence,
    core_principle: "Visceral fat is a stress-adaptation marker, not a primary fat disorder.",
    primary_drivers: ["circadian collapse", "autonomic imbalance", "mitochondrial debt", "fascial/peritoneal hypometabolism"],
    therapeutic_layers: layers,
    measurable_outcomes: metabolicRhythmData.measurable_outcomes,
    contraindications,
    triggered_rules: triggered,
    positioning_language: {
      allowed: ["metabolic rhythm restoration", "autonomic recalibration", "tissue regeneration support", "circadian recovery"],
      forbidden: ["fat loss claims", "cosmetic promises", "surgical replacement language"]
    },
    patient: {
      title: "Metabolic rhythm restoration",
      summary: "This module frames central metabolic change as a rhythm, stress, and recovery-capacity pattern rather than a cosmetic or fat-loss target.",
      support: ["restore rhythm first", "support sleep and recovery", "use lab-guided add-ons only when indicated"],
      safety_notes: [PATIENT_DISCLAIMER, "This is not a weight-loss or cosmetic medicine pathway."]
    },
    clinician: input.output_mode === "practitioner"
      ? {
          entry_score: entryScore,
          entry_evidence: entryEvidence,
          backend_logic: metabolicRhythmData.core_hypothesis,
          therapeutic_strategy: metabolicRhythmData.therapeutic_strategy,
          layers,
          triggered_rules: triggered,
          contraindications
        }
      : undefined
  };

  if (input.output_mode === "patient") delete result.clinician;
  return sanitizeForOutput(result);
}

function evaluateBatch17Modules(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const focus = input.module_focus;
  const headache = focus === "auto" || focus === "headache" || focus === "tri_axial" || focus === "tgn"
    ? evaluateHeadacheTriAxialEngine(inputPayload)
    : null;
  const tgn = focus === "auto" || focus === "tgn" || headache?.tgn_cross_reference
    ? evaluateTrigeminalNeuralgiaModule(inputPayload)
    : null;
  const metabolic = focus === "auto" || focus === "metabolic"
    ? evaluateMetabolicRhythmModule(inputPayload)
    : null;

  const result = {
    engine: "batch17_connected_modules",
    name: "Batch 17 Connected Modules",
    modules: [
      "HEADACHE_TRI_AXIAL_ENGINE_v1.0",
      "TRIGEMINAL_NEURALGIA_MODULE_v1.0",
      "METABOLIC_RHYTHM_MODULE_v1.0"
    ],
    selected_focus: focus,
    headache_tri_axial: headache,
    trigeminal_neuralgia: tgn,
    metabolic_rhythm: metabolic,
    output_mode: input.output_mode,
    patient: {
      title: focus === "metabolic" ? metabolic?.patient?.title : focus === "tgn" ? tgn?.patient?.title : headache?.patient?.title,
      summary: focus === "metabolic" ? metabolic?.patient?.summary : focus === "tgn" ? tgn?.patient?.summary : headache?.patient?.summary,
      safety_notes: unique([
        ...(headache?.patient?.safety_notes || []),
        ...(tgn?.patient?.safety_notes || []),
        ...(metabolic?.patient?.safety_notes || [])
      ])
    },
    key_principles: [
      "All headache is neurovascular desynchronisation.",
      "The axis determines the pattern.",
      "The grid state determines the severity trajectory.",
      "Aura = fragmented grid sparking.",
      "The nerve is antenna, not primary error source.",
      "Wu Wei Zi is a key membrane stabiliser.",
      "Visceral fat is a stress-adaptation marker.",
      "Do not taper carbamazepine before stabilisation."
    ]
  };

  if (input.output_mode === "patient") {
    delete result.key_principles;
  }
  return sanitizeForOutput(result);
}

module.exports = {
  evaluateHeadacheTriAxialEngine,
  evaluateTrigeminalNeuralgiaModule,
  evaluateMetabolicRhythmModule,
  evaluateBatch17Modules,
  headacheTriAxialData,
  trigeminalNeuralgiaData,
  metabolicRhythmData,
  headacheGridStates,
  fasciaNerveVesselUnit,
  sharedDiagnosisMapBatch17
};
