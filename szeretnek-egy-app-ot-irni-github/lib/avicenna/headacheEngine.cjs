const headacheData = require("./data/engines/headacheEngine.batch6.json");

const AXES = [
  "nerve_first_score",
  "fascia_first_score",
  "gut_metabolic_first_score",
  "vessel_dominant_score",
  "mitochondrial_fatigue_score"
];

const AXIS_TO_PATTERN = {
  nerve_first_score: "signal_overload_neurovascular_decoupling",
  fascia_first_score: "fascia_dominant_mechanical",
  gut_metabolic_first_score: "gut_metabolic_dominant",
  vessel_dominant_score: "dampness_microcirculatory_failure",
  mitochondrial_fatigue_score: "mitochondrial_fatigue_energy_deficiency"
};

const AXIS_META = {
  nerve_first_score: {
    axis: "nerve_first",
    embryological_layer: "ectoderm",
    tcm_channel: "Taiyang"
  },
  fascia_first_score: {
    axis: "fascia_first",
    embryological_layer: "mesoderm",
    tcm_channel: "Shaoyang"
  },
  gut_metabolic_first_score: {
    axis: "gut_metabolic_first",
    embryological_layer: "endoderm",
    tcm_channel: "Yangming"
  },
  vessel_dominant_score: {
    axis: "vessel_dominant_overlay",
    embryological_layer: "mesoderm vessel overlay",
    tcm_channel: "Taiyin damp accumulation"
  },
  mitochondrial_fatigue_score: {
    axis: "mitochondrial_fatigue",
    embryological_layer: "cross-layer energy support",
    tcm_channel: "uncertain"
  }
};

const PATIENT_LABELS = {
  signal_overload_neurovascular_decoupling: "Signal overload pattern",
  fascia_dominant_mechanical: "Fascia-led tension pattern",
  gut_metabolic_dominant: "Gut-metabolic pattern",
  dampness_microcirculatory_failure: "Microcirculation and heaviness overlay",
  mitochondrial_fatigue_energy_deficiency: "Energy-recovery pattern",
  membrane_EZ_water_instability: "Membrane and water-network rebuild layer",
  insufficient_pattern_evidence: "Unclear headache terrain"
};

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function normaliseInput(input = {}) {
  return {
    pain_quality: input.pain_quality || "",
    sensory_features: list(input.sensory_features),
    timing: input.timing || "",
    energy_state: input.energy_state || "",
    existing_diagnosis: list(input.existing_diagnosis),
    current_medications: list(input.current_medications),
    treatment_response: input.treatment_response || "",
    body_signals: list(input.body_signals),
    tongue_photo: input.tongue_photo || "",
    tongue_features: list(input.tongue_features),
    trigger_category: input.trigger_category || "",
    early_warning_signs: list(input.early_warning_signs),
    frailty: bool(input.frailty),
    emotional_constraint: bool(input.emotional_constraint),
    digestive_sensitivity: bool(input.digestive_sensitivity),
    cancer_active: bool(input.cancer_active),
    post_chemo_window: bool(input.post_chemo_window),
    gut_flare_active: bool(input.gut_flare_active),
    new_neurological_deficit: bool(input.new_neurological_deficit),
    thunderclap_headache: bool(input.thunderclap_headache),
    acute_headache_episode: bool(input.acute_headache_episode),
    ProImmunoR_requested: bool(input.ProImmunoR_requested),
    multiple_adaptogens_stacking: bool(input.multiple_adaptogens_stacking),
    glutathione_initiated: bool(input.glutathione_initiated),
    EZ_stabilisation_not_done: bool(input.EZ_stabilisation_not_done),
    laser_eligibility_check: bool(input.laser_eligibility_check),
    omega3_dose: input.omega3_dose || "",
    reassessment_day: Number(input.reassessment_day || 0),
    internal_audit: bool(input.internal_audit)
  };
}

function includes(values, value) {
  return values.includes(value);
}

function any(values, options) {
  return options.some((option) => values.includes(option));
}

function pattern(name) {
  return headacheData.patterns.find((item) => item.name === name) || {};
}

function add(scores, axis, points, input, reason) {
  scores[axis].score += points;
  scores[axis].contributing_inputs.push({ input, points, reason });
}

function addMembrane(membrane, points, input, reason) {
  membrane.score += points;
  membrane.contributing_inputs.push({ input, points, reason });
}

function scoreAxes(input) {
  const scores = Object.fromEntries(
    AXES.map((axis) => [axis, { score: 0, contributing_inputs: [] }])
  );
  const membrane = { score: 0, contributing_inputs: [] };

  if (includes(input.sensory_features, "visual_aura")) add(scores, "nerve_first_score", 2, "visual_aura", "aura signal load");
  if (includes(input.sensory_features, "light_sensitivity")) add(scores, "nerve_first_score", 2, "light_sensitivity", "photophobia");
  if (includes(input.sensory_features, "sound_sensitivity")) add(scores, "nerve_first_score", 1, "sound_sensitivity", "phonophobia");
  if (includes(input.sensory_features, "nausea")) add(scores, "nerve_first_score", 1, "nausea", "sensory overload with nausea");
  if (input.pain_quality === "sharp_stabbing") add(scores, "nerve_first_score", 2, "sharp_stabbing", "sharp/electric pain quality proxy");
  if (includes(input.current_medications, "triptan") && input.treatment_response === "helps_temporarily") {
    add(scores, "nerve_first_score", 2, "triptan_partial_response", "triptan helps temporarily");
  }
  if (input.energy_state === "tired_but_wired") add(scores, "nerve_first_score", 1, "tired_but_wired", "activated but fatigued state");
  if (includes(input.early_warning_signs, "scalp_tenderness")) add(scores, "nerve_first_score", 1, "scalp_tenderness", "surface neural sensitivity");
  if (any(input.existing_diagnosis, ["migraine_with_aura", "migraine_without_aura", "anxiety_depression"])) {
    add(scores, "nerve_first_score", 1, "existing_diagnosis", "neurovascular/signal-load history");
  }

  if (input.pain_quality === "tight_band_like") add(scores, "fascia_first_score", 2, "tight_band_like", "band-like fascial tension");
  if (any(input.early_warning_signs, ["neck_stiffness", "jaw_tightness", "shoulder_pull"])) {
    add(scores, "fascia_first_score", 2, "neck_shoulder_precedes_headache", "neck/jaw/shoulder precedes headache");
  }
  if (includes(input.existing_diagnosis, "cervical_spine")) add(scores, "fascia_first_score", 2, "cervical_spine", "cervical spine context");
  if (includes(input.existing_diagnosis, "tension_headache")) add(scores, "fascia_first_score", 2, "tension_headache", "tension-type pattern context");
  if (input.trigger_category === "weather") add(scores, "fascia_first_score", 2, "weather", "barometric sensitivity");
  if (input.timing === "worse_morning" && any(input.early_warning_signs, ["neck_stiffness", "heavy_head"])) {
    add(scores, "fascia_first_score", 1, "morning_stiffness", "morning stiffness/heavy head");
  }

  if (input.trigger_category === "food_alcohol_histamine") add(scores, "gut_metabolic_first_score", 2, "food_alcohol_histamine", "food or histamine trigger");
  if (any(input.early_warning_signs, ["bloating", "reflux", "constipation", "nausea"])) {
    add(scores, "gut_metabolic_first_score", 2, "bloating_reflux_constipation", "GI signal before headache");
  }
  if (includes(input.body_signals, "bloating_heaviness")) add(scores, "gut_metabolic_first_score", 2, "bloating_heaviness", "gut heaviness");
  if (input.trigger_category === "hormonal") add(scores, "gut_metabolic_first_score", 2, "hormonal", "PMS/hormonal GI-headache route");
  if (input.trigger_category === "infection") add(scores, "gut_metabolic_first_score", 2, "infection", "post-infectious onset");
  if (input.gut_flare_active) add(scores, "gut_metabolic_first_score", 1, "gut_flare_active", "active gut flare");
  if (input.digestive_sensitivity) add(scores, "gut_metabolic_first_score", 1, "digestive_sensitivity", "sensitive gut interface");

  if (input.pain_quality === "pulsing_throbbing") add(scores, "vessel_dominant_score", 2, "pulsing_throbbing", "pulsing/throbbing vessel signal");
  if (includes(input.early_warning_signs, "pulsatile_temple")) add(scores, "vessel_dominant_score", 2, "pulsatile_temple", "pulsatile temple warning");
  if (input.trigger_category === "overexertion" || includes(input.early_warning_signs, "exertion_intolerance")) {
    add(scores, "vessel_dominant_score", 2, "exertion_worsens", "worse with exertion");
  }
  if (includes(input.body_signals, "cold_hands_feet") || includes(input.early_warning_signs, "cold_hands_feet")) {
    add(scores, "vessel_dominant_score", 1, "cold_extremities", "cold extremities");
  }
  if (any(input.existing_diagnosis, ["diabetes", "hypertension"])) add(scores, "vessel_dominant_score", 1, "metabolic_vessel_background", "metabolic or pressure background");
  if (includes(input.tongue_features, "purple_dark")) add(scores, "vessel_dominant_score", 1, "purple_dark_tongue", "dark/purple tongue overlay");

  if (input.energy_state === "exhausted") add(scores, "mitochondrial_fatigue_score", 2, "exhausted", "exhausted energy state");
  if (input.energy_state === "cold") add(scores, "mitochondrial_fatigue_score", 1, "cold", "cold energy state");
  if (input.timing === "worse_morning") add(scores, "mitochondrial_fatigue_score", 2, "worse_morning", "morning recovery is poor");
  if (includes(input.current_medications, "beta_blocker")) add(scores, "mitochondrial_fatigue_score", 2, "beta_blocker", "drug-terrain energy conflict marker");
  if (includes(input.current_medications, "antidepressant")) add(scores, "mitochondrial_fatigue_score", 2, "antidepressant", "drug-terrain energy conflict marker");
  if (input.treatment_response === "helps_pain_but_drains") add(scores, "mitochondrial_fatigue_score", 2, "helps_pain_but_drains", "pain relief drains energy");

  const drySignals = ["dry_mouth", "dry_stool_constipation", "dark_urine", "dry_skin", "brittle_nails", "brittle_hair"];
  const dryCount = drySignals.filter((signal) => input.body_signals.includes(signal)).length;
  if (dryCount >= 2) addMembrane(membrane, 2, "dryness_signs", "multiple dryness signs");
  if (includes(input.tongue_features, "dry")) addMembrane(membrane, 1, "dry_tongue", "dry tongue feature");
  if (input.post_chemo_window) addMembrane(membrane, 2, "post_chemo_window", "post-intervention rebuild window");
  if (input.cancer_active) addMembrane(membrane, 1, "cancer_active", "clinician-review membrane context");
  if (input.emotional_constraint) {
    addMembrane(membrane, 1, "emotional_constraint", "backend cellular recovery stress marker");
  }

  return { scores, membrane };
}

function orderedAxes(scores) {
  return AXES.map((axis) => ({ axis, ...scores[axis] })).sort((a, b) => b.score - a.score);
}

function safetyStop(input) {
  if (!input.thunderclap_headache && !input.new_neurological_deficit) return null;
  return {
    stopped: true,
    reason: "red_flag_headache",
    message: "Seek urgent care now for thunderclap headache or new neurological symptoms. This educational tool stops here."
  };
}

function applyRules(input, scores, membrane, audit) {
  const contraindications = [];
  const cautions = [];
  const drugTerrainConflicts = [];
  const ruleTrace = [];
  const dryComponent = membrane.score >= 2 || includes(input.tongue_features, "dry");

  function trace(condition, action) {
    ruleTrace.push({ condition, action });
  }

  if (includes(input.current_medications, "beta_blocker") || includes(input.current_medications, "antidepressant")) {
    drugTerrainConflicts.push("Beta-blocker or antidepressant use may overlap with an energy-recovery terrain; medication changes require clinician discussion.");
    trace("beta_blocker_use == true OR antidepressant_use == true", "increase mitochondrial_fatigue_score += 2; flag drug-terrain conflict");
  }
  if (includes(input.current_medications, "triptan") && input.treatment_response === "helps_temporarily") {
    drugTerrainConflicts.push("Temporary triptan response may support a neurovascular signal-overload interpretation without replacing medication review.");
    trace("triptan_use == true AND response == partial", "increase signal_overload_score += 2");
  }
  if (input.treatment_response === "helps_pain_but_drains") {
    cautions.push("Avoid stronger stimulation while energy recovery looks under-supported.");
    trace("treatment_response == helps_pain_but_drains", "avoid further stimulation protocols");
  }
  if (input.treatment_response === "helps_less_less" || input.treatment_response === "helps_less_and_less") {
    drugTerrainConflicts.push("Decreasing medication effect may indicate a medication-overuse or suppression-without-rebuild loop; discuss changes with the prescriber.");
    trace("treatment_response == helps_less_and_less", "flag medication_overuse_risk");
  }
  if (input.digestive_sensitivity) {
    contraindications.push("berberine_maintenance");
    cautions.push("Keep berberine as flare-only clinician-reviewed logic; prioritize simpler gut support.");
    trace("digestive_sensitivity == true", "remove berberine from maintenance plan");
  }
  if (scores.gut_metabolic_first_score.score > 0 && !input.gut_flare_active) {
    contraindications.push("berberine_maintenance");
    trace("gut_metabolic_score > 0 AND gut_flare_active != true", "berberine remains flare-only, never maintenance");
  }
  if (input.frailty) {
    contraindications.push("adaptogen_stacking");
    cautions.push("Use single-layer support and avoid stacking multiple adaptogens.");
    trace("frailty == true", "reduce herb stack complexity");
  }
  if (input.gut_flare_active) {
    contraindications.push("laser_during_active_gut_flare");
    cautions.push("Defer laser during an active gut flare; stabilize the gut terrain first.");
    trace("gut_flare_active == true", "defer laser");
    if (input.laser_eligibility_check) {
      trace("laser_eligibility_check AND gut_flare_active == true", "red: defer laser; stabilise gut first");
    }
  }
  if (scores.vessel_dominant_score.score >= 3 && dryComponent) {
    cautions.push("Microcirculatory heaviness with dryness needs water-network rebuild before stronger moving logic.");
    trace("pattern == dampness AND dry_signs_present == true", "add structured water hydration and EZ-water rebuild support");
  }
  if (dryComponent) {
    contraindications.push("ginger_in_dry_pattern");
    trace("ginger_in_formula == true AND dry_component_present == true", "exclude ginger");
  }
  if (input.cancer_active) {
    contraindications.push("glutathione");
    cautions.push("Active cancer requires clinician review; glutathione is contraindicated in this engine state.");
    trace("cancer_active == true", "contraindicate glutathione");
  }
  if (input.post_chemo_window && membrane.score > 0) {
    cautions.push("Post-chemo membrane support is clinician-facing and must follow staged EZ-water preparation.");
    trace("post_chemo_window == true AND glutathione_indicated == true", "pulsed glutathione only after preparation");
  }
  if (input.glutathione_initiated && input.EZ_stabilisation_not_done) {
    contraindications.push("glutathione_before_EZ_preparation");
    trace("glutathione_initiated == true AND EZ_stabilisation_not_done == true", "block glutathione");
  }
  if (input.omega3_dose === "high") {
    cautions.push("High-dose omega-3 is reduced to low-dose-only logic in fragile membrane/EZ states.");
    trace("omega3_dose == high", "reduce to low dose only");
  }
  if (input.ProImmunoR_requested && input.acute_headache_episode) {
    contraindications.push("ProImmunoR_acute_headache_episode");
    trace("ProImmunoR_requested == true AND acute_headache_episode == true", "contraindicate ProImmunoR in acute phase");
  }
  if (input.multiple_adaptogens_stacking) {
    contraindications.push("multiple_adaptogens_stacking");
    trace("multiple_adaptogens_stacking == true", "block adaptogen stacking");
  }
  if (input.reassessment_day >= 10 && input.reassessment_day <= 14) {
    cautions.push("Day 10-14 check-in is active: re-score all axes and do not lock the first pattern.");
    trace("reassessment_day >= 10 AND reassessment_day <= 14", "trigger reassessment loop");
  }
  if (input.emotional_constraint) {
    trace("emotional_constraint == true", "backend-only membrane score increase; frontend-safe language only");
  }
  if (input.laser_eligibility_check && scores.fascia_first_score.score >= 3 && !input.gut_flare_active) {
    cautions.push("Laser is a fascia-first candidate only as low-intensity educational support.");
    trace("laser_eligibility_check AND fascia_score_high == true", "green: laser primary");
  }

  return {
    contraindications: [...new Set(contraindications)],
    cautions: [...new Set(cautions)],
    drugTerrainConflicts: [...new Set(drugTerrainConflicts)],
    ruleTrace: audit ? ruleTrace : []
  };
}

function hierarchyFor(patternName, rebuildIndicated) {
  const basePattern = pattern(patternName);
  const herbs = ((basePattern.interventions || {}).herbs || []).map((item) => ({
    name: item.name,
    role: item.role,
    notes: item.notes || ""
  }));
  const hierarchy = {
    first_line: herbs.slice(0, 2),
    second_line: herbs.slice(2, 5),
    device: (basePattern.interventions || {}).device || "",
    rebuild_layer: []
  };

  if (rebuildIndicated) {
    const membranePattern = pattern("membrane_EZ_water_instability");
    hierarchy.rebuild_layer = ((membranePattern.interventions || {}).herbs || []).slice(0, 4).map((item) => ({
      name: item.name,
      role: item.role,
      notes: item.notes || ""
    }));
  }

  return hierarchy;
}

function patientOutput({ stopped, stop, dominantPattern, mixed, mixedPatterns, vesselOverlay, membrane, safety, hierarchy }) {
  if (stopped) {
    return {
      title: "Urgent check-in needed",
      summary: stop.message,
      support: [],
      avoid: ["do not use this tool as the next step"],
      safety_notes: [
        "This is an educational pattern-recognition tool and not a medical diagnosis.",
        "Seek urgent care for red flag symptoms."
      ],
      reassessment_prompt: ""
    };
  }

  const label = PATIENT_LABELS[dominantPattern] || "Headache terrain pattern";
  const support = [];
  if (hierarchy.first_line.length) {
    support.push(`Primary support focus: ${hierarchy.first_line.map((item) => item.name).join(", ")}.`);
  }
  if (vesselOverlay) {
    support.push("Microcirculation and heaviness signs are treated as an overlay, not a separate body-system diagnosis.");
  }
  if (membrane.score >= 3) {
    support.push("A membrane and water-network rebuild layer may be relevant before stronger modulation.");
  }
  if (mixed) {
    support.push(`This looks layered; the closest axes are ${mixedPatterns.map((item) => item.axis.replace(/_score$/, "")).join(" and ")}.`);
  }

  return {
    title: label,
    summary: "This pattern may reflect a headache terrain where nerve, fascia, gut, vessel, and energy-recovery signals overlap. It is educational pattern recognition, not a medical diagnosis.",
    support,
    avoid: safety.contraindications,
    safety_notes: [
      "Seek urgent care for red flag symptoms.",
      "Medication changes must be discussed with a clinician.",
      "This is an educational pattern-recognition tool and not a medical diagnosis."
    ],
    reassessment_prompt: "Reassess around day 10-14: re-check symptoms, sleep, gut signals, medication response, and recovery capacity."
  };
}

function evaluateHeadache(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const stop = safetyStop(input);
  const { scores, membrane } = scoreAxes(input);
  const ordered = orderedAxes(scores);
  const top = ordered[0] || { axis: "nerve_first_score", score: 0 };
  const second = ordered[1] || { axis: "fascia_first_score", score: 0 };
  const topPattern = top.score > 0 ? AXIS_TO_PATTERN[top.axis] : "insufficient_pattern_evidence";
  const mixed = top.score > 0 && second.score > 0 && Math.abs(top.score - second.score) <= 2;
  const vesselOverlay = scores.vessel_dominant_score.score >= 3 || top.axis === "vessel_dominant_score";
  const rebuildIndicated = membrane.score >= 3;
  const safety = applyRules(input, scores, membrane, input.internal_audit);
  const hierarchy = stop ? { first_line: [], second_line: [], device: "", rebuild_layer: [] } : hierarchyFor(topPattern, rebuildIndicated);
  const meta = AXIS_META[top.axis] || {
    axis: "unclassified",
    embryological_layer: "unknown",
    tcm_channel: "unknown"
  };

  if (input.internal_audit && top.score > 0) {
    safety.ruleTrace.push({
      condition: `${top.axis} is highest scoring axis`,
      action: `assign dominant pattern = ${topPattern}`
    });
    if (vesselOverlay) {
      safety.ruleTrace.push({
        condition: "vessel_score_high == true",
        action: "assign vessel-dominant as parallel overlay axis"
      });
    }
    if (mixed) {
      safety.ruleTrace.push({
        condition: "top_two_pattern_scores_delta <= 2",
        action: "assign mixed layered pattern"
      });
    }
    if (input.laser_eligibility_check && mixed) {
      safety.ruleTrace.push({
        condition: "laser_eligibility_check AND mixed_pattern == true",
        action: "yellow: laser with parallel gut or nerve layer"
      });
    }
  }

  return {
    engine: "headache_migraine_pattern_engine",
    source: "headacheEngine.batch6.json",
    stopped: Boolean(stop),
    stop,
    axis_scores: scores,
    membrane_EZ_water_instability_score: membrane,
    dominant_axis: top.axis,
    dominant_pattern: topPattern,
    dominant_pattern_label: PATIENT_LABELS[topPattern] || topPattern,
    embryological_layer: meta.embryological_layer,
    tcm_channel: meta.tcm_channel,
    tri_axial_model: {
      nerve: "Taiyang / ectoderm",
      fascia: "Shaoyang / mesoderm",
      gut: "Yangming / endoderm",
      vessel_note: "Vessel-dominant is a parallel mesodermal overlay, not a separate fourth embryological axis."
    },
    mixed_pattern: mixed,
    mixed_patterns: mixed ? ordered.slice(0, 2).map((item) => ({
      axis: item.axis,
      score: item.score,
      pattern: AXIS_TO_PATTERN[item.axis]
    })) : [],
    vessel_overlay_active: vesselOverlay,
    intervention_hierarchy: hierarchy,
    contraindications: safety.contraindications,
    drug_terrain_conflicts: safety.drugTerrainConflicts,
    cautions: safety.cautions,
    patient: patientOutput({
      stopped: Boolean(stop),
      stop,
      dominantPattern: topPattern,
      mixed,
      mixedPatterns: ordered.slice(0, 2),
      vesselOverlay,
      membrane,
      safety,
      hierarchy
    }),
    clinician: {
      axis_scores: scores,
      contributing_inputs: Object.fromEntries(AXES.map((axis) => [axis, scores[axis].contributing_inputs])),
      dominant_pattern: topPattern,
      embryological_layer: meta.embryological_layer,
      tcm_channel: meta.tcm_channel,
      intervention_hierarchy: hierarchy,
      contraindications: safety.contraindications,
      drug_terrain_conflicts: safety.drugTerrainConflicts,
      rule_trace: safety.ruleTrace
    },
    output_contract: headacheData.output_screens,
    notes: headacheData.notes
  };
}

module.exports = {
  evaluateHeadache,
  scoreAxes,
  headacheData,
  AXES
};
