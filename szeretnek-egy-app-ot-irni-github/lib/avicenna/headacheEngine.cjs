const headacheData = require("./data/engines/headacheEngine.batch6.json");
const batch7Data = require("./data/engines/avicenna_engine_batch7.json");

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
  heat_flare_active: "Heat flare phase",
  dampness_stagnation_baseline: "Baseline dampness-stagnation phase",
  cold_deficiency_yang_insufficient: "Cold low-recovery phase",
  hypertonic_damp_heat_yang_type: "Overuse heat-tension pattern",
  nerve_first_signal_overload: "Nerve-first signal overload pattern",
  vessel_first_amplitude_overload: "Vessel-first amplitude pattern",
  fascia_first_buffer_failure: "Fascia-first buffer failure pattern",
  shoulder_capsule_cold_stasis: "Shoulder capsule cold-stasis pattern",
  hip_capsule_deep_fascia_oedema: "Hip deep-fascia oedema pattern",
  hip_cartilage_deficiency_blood_stasis: "Hip cartilage-support pattern",
  hip_ligament_laxity_cold_mitochondrial_weakness: "Hip ligament laxity and cold-recovery pattern",
  spine_facet_capsule_ligament_oedema: "Spinal facet-capsule oedema pattern",
  spine_disc_dominant_degeneration: "Spinal disc-support pattern",
  migraine_western_ICHD3: "Migraine criteria reference layer",
  insufficient_pattern_evidence: "Unclear headache terrain"
};

const RED_FLAG_LABELS = {
  thunderclap: "thunderclap headache",
  neuro_deficit: "new neurological deficit",
  papilloedema: "papilloedema",
  neck_stiffness: "neck stiffness",
  immunocompromised: "immunocompromised state",
  fever_weight_loss: "fever or weight loss",
  new_over_50: "new headache after age 50",
  progressive: "progressive worsening",
  head_trauma: "recent head trauma",
  exertional: "exertional headache"
};

const CORE_PHRASES = [
  "Berberine is a switch, not a foundation.",
  "Laser should follow the dominant failure layer, not the pain location.",
  "Chronic headache is not escalation - it is migration.",
  "We don't just stop headaches. We restore the system that prevents them.",
  "Ondansetron and triptans are not opposites; they attempt to re-synchronise the same neurovascular-fascial continuum from different entry points."
];

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
    trigger_today: input.trigger_today || input.trigger_category || "",
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
    dominant_state: input.dominant_state || "",
    berberine_status: input.berberine_status || "OFF",
    system_response_at_day3_7: input.system_response_at_day3_7 || "",
    headache_character: input.headache_character || input.pain_quality || "",
    pain_onset_pattern: input.pain_onset_pattern || "",
    pain_location: input.pain_location || "head",
    pain_timing: input.pain_timing || "",
    instability_present: bool(input.instability_present),
    radiculopathy_present: bool(input.radiculopathy_present),
    cold_signs: bool(input.cold_signs),
    heat_signs: bool(input.heat_signs),
    tongue: input.tongue || "",
    pulse: input.pulse || "",
    Shaoyang_collapse_cluster_signs: list(input.Shaoyang_collapse_cluster_signs),
    triptan_response: input.triptan_response || "",
    gepant_use: bool(input.gepant_use),
    gepant_side_effects: list(input.gepant_side_effects),
    current_phase: input.current_phase || "",
    red_flag_present: bool(input.red_flag_present),
    red_flag_type: list(input.red_flag_type),
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

function batch7Pattern(name) {
  return batch7Data.patterns.find((item) => item.name === name) || {};
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
  if (input.headache_character === "burning_vibrating") add(scores, "nerve_first_score", 3, "burning_vibrating", "diffuse burning/vibrating nerve-first character");
  if (input.pain_onset_pattern === "nerve_first") add(scores, "nerve_first_score", 2, "pain_onset_pattern", "nerve-first onset pattern");
  if (includes(input.current_medications, "triptan") && input.treatment_response === "helps_temporarily") {
    add(scores, "nerve_first_score", 2, "triptan_partial_response", "triptan helps temporarily");
  }
  if (input.triptan_response === "partial") add(scores, "nerve_first_score", 2, "triptan_partial_response", "partial triptan response");
  if (input.energy_state === "tired_but_wired") add(scores, "nerve_first_score", 1, "tired_but_wired", "activated but fatigued state");
  if (input.trigger_category === "stress_overload" || input.trigger_today === "stress_emotional") add(scores, "nerve_first_score", 1, "stress_overload", "stress load can enter through nerve-first pathway");
  if (includes(input.early_warning_signs, "scalp_tenderness")) add(scores, "nerve_first_score", 1, "scalp_tenderness", "surface neural sensitivity");
  if (any(input.existing_diagnosis, ["migraine_with_aura", "migraine_without_aura", "anxiety_depression"])) {
    add(scores, "nerve_first_score", 1, "existing_diagnosis", "neurovascular/signal-load history");
  }

  if (input.pain_quality === "tight_band_like") add(scores, "fascia_first_score", 2, "tight_band_like", "band-like fascial tension");
  if (input.headache_character === "dull_deep" || input.headache_character === "tight_band") add(scores, "fascia_first_score", 3, "headache_character", "dull/tight chronic fascia-first character");
  if (input.pain_onset_pattern === "fascia_first") add(scores, "fascia_first_score", 2, "pain_onset_pattern", "fascia-first onset pattern");
  if (input.pain_onset_pattern === "mixed_chronic") add(scores, "fascia_first_score", 2, "mixed_chronic", "chronic migration endpoint");
  if (any(input.early_warning_signs, ["neck_stiffness", "jaw_tightness", "shoulder_pull"])) {
    add(scores, "fascia_first_score", 2, "neck_shoulder_precedes_headache", "neck/jaw/shoulder precedes headache");
  }
  if (includes(input.existing_diagnosis, "cervical_spine")) add(scores, "fascia_first_score", 2, "cervical_spine", "cervical spine context");
  if (includes(input.existing_diagnosis, "tension_headache")) add(scores, "fascia_first_score", 2, "tension_headache", "tension-type pattern context");
  if (input.trigger_category === "weather") add(scores, "fascia_first_score", 2, "weather", "barometric sensitivity");
  if (input.timing === "worse_morning" && any(input.early_warning_signs, ["neck_stiffness", "heavy_head"])) {
    add(scores, "fascia_first_score", 1, "morning_stiffness", "morning stiffness/heavy head");
  }
  if (input.pain_timing === "morning_worse_improves") add(scores, "fascia_first_score", 2, "morning_worse_improves", "ligament/fascia pattern improves through day");
  if (["shoulder", "hip", "spine"].includes(input.pain_location)) add(scores, "fascia_first_score", 1, "capsule_fascia_location", "capsule/fascia pain location");

  if (input.trigger_category === "food_alcohol_histamine") add(scores, "gut_metabolic_first_score", 2, "food_alcohol_histamine", "food or histamine trigger");
  if (any(input.early_warning_signs, ["bloating", "reflux", "constipation", "nausea"])) {
    add(scores, "gut_metabolic_first_score", 2, "bloating_reflux_constipation", "GI signal before headache");
  }
  if (includes(input.body_signals, "bloating_heaviness")) add(scores, "gut_metabolic_first_score", 2, "bloating_heaviness", "gut heaviness");
  if (input.trigger_category === "hormonal") add(scores, "gut_metabolic_first_score", 2, "hormonal", "PMS/hormonal GI-headache route");
  if (input.trigger_category === "infection") add(scores, "gut_metabolic_first_score", 2, "infection", "post-infectious onset");
  if (input.dominant_state === "heat_flare") add(scores, "gut_metabolic_first_score", 2, "heat_flare", "heat-flare gut/metabolic expression");
  if (input.dominant_state === "dampness_stagnation") add(scores, "gut_metabolic_first_score", 1, "dampness_stagnation", "baseline dampness expression");
  if (input.gut_flare_active) add(scores, "gut_metabolic_first_score", 1, "gut_flare_active", "active gut flare");
  if (input.digestive_sensitivity) add(scores, "gut_metabolic_first_score", 1, "digestive_sensitivity", "sensitive gut interface");
  if (input.gepant_side_effects.some((item) => ["nausea", "constipation"].includes(item))) {
    add(scores, "gut_metabolic_first_score", 1, "gepant_side_effects", "gepant gut side-effect terrain conflict");
  }

  if (input.pain_quality === "pulsing_throbbing") add(scores, "vessel_dominant_score", 2, "pulsing_throbbing", "pulsing/throbbing vessel signal");
  if (input.headache_character === "pulsing_throbbing") add(scores, "vessel_dominant_score", 2, "headache_character", "pulsatile vessel-first character");
  if (input.pain_onset_pattern === "vessel_first") add(scores, "vessel_dominant_score", 2, "pain_onset_pattern", "vessel-first onset pattern");
  if (includes(input.early_warning_signs, "pulsatile_temple")) add(scores, "vessel_dominant_score", 2, "pulsatile_temple", "pulsatile temple warning");
  if (input.trigger_category === "overexertion" || includes(input.early_warning_signs, "exertion_intolerance")) {
    add(scores, "vessel_dominant_score", 2, "exertion_worsens", "worse with exertion");
  }
  if (["weather", "hormonal"].includes(input.trigger_category) || ["weather", "hormonal", "overexertion"].includes(input.trigger_today)) {
    add(scores, "vessel_dominant_score", 1, "trigger_today", "weather/hormonal/exertion vessel-amplitude trigger");
  }
  if (includes(input.body_signals, "cold_hands_feet") || includes(input.early_warning_signs, "cold_hands_feet")) {
    add(scores, "vessel_dominant_score", 1, "cold_extremities", "cold extremities");
  }
  if (any(input.existing_diagnosis, ["diabetes", "hypertension"])) add(scores, "vessel_dominant_score", 1, "metabolic_vessel_background", "metabolic or pressure background");
  if (includes(input.tongue_features, "purple_dark")) add(scores, "vessel_dominant_score", 1, "purple_dark_tongue", "dark/purple tongue overlay");
  if (input.tongue === "purple_engorged") add(scores, "vessel_dominant_score", 2, "purple_engorged_tongue", "purple/engorged tongue vessel sign");

  if (input.energy_state === "exhausted") add(scores, "mitochondrial_fatigue_score", 2, "exhausted", "exhausted energy state");
  if (input.energy_state === "cold") add(scores, "mitochondrial_fatigue_score", 1, "cold", "cold energy state");
  if (input.dominant_state === "cold_deficiency" || input.cold_signs) add(scores, "mitochondrial_fatigue_score", 2, "cold_deficiency", "cold deficiency or cold intolerance");
  if (input.trigger_today === "overexertion") add(scores, "mitochondrial_fatigue_score", 1, "overexertion", "overexertion energy depletion");
  if (input.timing === "worse_morning") add(scores, "mitochondrial_fatigue_score", 2, "worse_morning", "morning recovery is poor");
  if (includes(input.current_medications, "beta_blocker")) add(scores, "mitochondrial_fatigue_score", 2, "beta_blocker", "drug-terrain energy conflict marker");
  if (includes(input.current_medications, "antidepressant")) add(scores, "mitochondrial_fatigue_score", 2, "antidepressant", "drug-terrain energy conflict marker");
  if (input.treatment_response === "helps_pain_but_drains") add(scores, "mitochondrial_fatigue_score", 2, "helps_pain_but_drains", "pain relief drains energy");
  if (input.gepant_side_effects.includes("fatigue")) add(scores, "mitochondrial_fatigue_score", 1, "gepant_fatigue", "gepant fatigue terrain conflict");

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
  const redFlags = [];
  if (input.thunderclap_headache) redFlags.push("thunderclap");
  if (input.new_neurological_deficit) redFlags.push("neuro_deficit");
  if (input.red_flag_present) redFlags.push(...input.red_flag_type);
  const uniqueFlags = [...new Set(redFlags)].filter(Boolean);
  if (!uniqueFlags.length) return null;
  return {
    stopped: true,
    reason: "red_flag_headache",
    red_flags: uniqueFlags,
    message: `Seek urgent care now for ${uniqueFlags.map((flag) => RED_FLAG_LABELS[flag] || flag).join(", ")}. This educational tool stops here.`
  };
}

function detectPhase(input, scores) {
  if (input.current_phase) return input.current_phase;
  if (input.dominant_state === "heat_flare" || input.gut_flare_active || input.heat_signs) return "flare";
  if (input.berberine_status === "ON") return "flare";
  if (input.system_response_at_day3_7 === "stabilised") return "post_flare_rebuild";
  if (scores.gut_metabolic_first_score.score > 0 || input.dominant_state === "dampness_stagnation") return "baseline";
  return "baseline";
}

function phasePosture(phase) {
  if (phase === "flare") {
    return {
      name: "flare",
      goal: "short_term_stabilisation_only",
      instruction: "During flare: stabilise first; do not introduce rebuild protocols during the active flare."
    };
  }
  if (phase === "post_flare_rebuild") {
    return {
      name: "post_flare_rebuild",
      goal: "transition_from_calming_to_reconstruction",
      instruction: "Post-flare rebuild: transition from calming to reconstruction."
    };
  }
  return {
    name: "baseline",
    goal: "rebuild_and_strengthen",
    instruction: "Baseline: rebuild, strengthen, and reduce future flare susceptibility."
  };
}

function berberineDecision(input, phase) {
  const blockedReasons = [];
  const heatFlare = input.dominant_state === "heat_flare" || (phase === "flare" && input.heat_signs);
  if (input.dominant_state === "cold_deficiency") blockedReasons.push("cold_deficiency");
  if (input.dominant_state === "dampness_stagnation" && phase === "baseline") blockedReasons.push("baseline_dampness_stagnation");
  if (input.energy_state === "exhausted" || input.dominant_state === "fatigue_dominant") blockedReasons.push("fatigue_dominant");
  if (input.trigger_category === "infection" || input.trigger_today === "infection") blockedReasons.push("post_infectious");
  if (input.cold_signs || includes(input.body_signals, "usually_cold") || input.energy_state === "cold") blockedReasons.push("cold_intolerance");

  if (blockedReasons.length) {
    return {
      status: "BLOCKED",
      rule: "Berberine is a switch, not a foundation.",
      max_duration: "0 days",
      next_step: "Use baseline module only; fiber + mucosal rebuild where appropriate.",
      blocked_reasons: [...new Set(blockedReasons)]
    };
  }

  if (input.berberine_status === "ON" && heatFlare) {
    if (input.system_response_at_day3_7 === "stabilised") {
      return {
        status: "TAPER_OFF",
        rule: "Berberine is a switch, not a foundation.",
        max_duration: "3-7 days",
        next_step: "Taper off and transition to fiber + mucosal rebuild.",
        blocked_reasons: []
      };
    }
    if (input.system_response_at_day3_7 === "worse" || input.system_response_at_day3_7 === "no_change") {
      return {
        status: "STOP_AND_REASSESS",
        rule: "Berberine is a switch, not a foundation.",
        max_duration: "stop now",
        next_step: "Stop berberine and reassess whether this is truly a heat flare.",
        blocked_reasons: [input.system_response_at_day3_7]
      };
    }
    return {
      status: "ON_SHORT_COURSE",
      rule: "Berberine is a switch, not a foundation.",
      max_duration: "3-7 days",
      next_step: "Check system response at day 3-7; if stabilised, taper off.",
      blocked_reasons: []
    };
  }

  if (heatFlare && phase === "flare") {
    return {
      status: "ELIGIBLE_FLARE_ONLY",
      rule: "Berberine is a switch, not a foundation.",
      max_duration: "3-7 days",
      next_step: "Consider only as short flare switch with clinician review; then transition to rebuild.",
      blocked_reasons: []
    };
  }

  return {
    status: "OFF",
    rule: "Berberine is a switch, not a foundation.",
    max_duration: "0 days",
    next_step: "Stay with baseline rebuild rather than maintenance berberine.",
    blocked_reasons: []
  };
}

function applyRules(input, scores, membrane, audit, phase, berberine) {
  const contraindications = [];
  const cautions = [];
  const drugTerrainConflicts = [];
  const ruleTrace = [];
  const dryComponent = membrane.score >= 2 || includes(input.tongue_features, "dry");

  function trace(condition, action) {
    ruleTrace.push({ condition, action });
  }

  if (phase === "flare") {
    cautions.push("Flare phase: short-term stabilisation only; rebuild waits until the active flare settles.");
    trace("flare_detected == true", "phase = flare -> short-term stabilisation protocol");
  }
  if (phase === "baseline") {
    trace("flare_resolved == true", "phase = baseline -> rebuild and strengthen protocol");
  }
  if (phase === "post_flare_rebuild") {
    cautions.push("Post-flare rebuild: transition from calming toward reconstruction without overloading the system.");
  }

  if (berberine.status === "ON_SHORT_COURSE" || berberine.status === "ELIGIBLE_FLARE_ONLY") {
    trace("berberine_indicated AND state == heat_flare_active", "SET berberine = ON; max 3-7 days; response check at day 3-7");
  }
  if (berberine.status === "TAPER_OFF") {
    trace("berberine ON AND system_response_check == stabilised", "TAPER berberine OFF; transition to fiber + mucosal rebuild");
  }
  if (berberine.status === "STOP_AND_REASSESS") {
    contraindications.push("berberine_current_course");
    trace(`berberine ON AND system_response_check == ${input.system_response_at_day3_7}`, "STOP berberine; reassess dominant pattern");
  }
  if (berberine.status === "BLOCKED") {
    contraindications.push("berberine");
    trace("cold/fatigue/post-infectious/baseline state", "BLOCK berberine; use baseline module only");
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
  if (["stops_working", "rebound"].includes(input.triptan_response)) {
    drugTerrainConflicts.push("Triptan response that fades or rebounds suggests a rebuild-first medication exit discussion; do not stop abruptly.");
    trace("triptan_response == stops_working OR rebound_headache == true", "initiate medication exit strategy; refer prescriber");
  }
  if (input.gepant_use && input.gepant_side_effects.length) {
    drugTerrainConflicts.push("Gepant side effects such as nausea, fatigue, or constipation may overlap with gut and energy-recovery terrain.");
    trace("gepant_side_effects_present", "raise gut_metabolic_score + mitochondrial_fatigue_score");
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

function batch7HierarchyFor(patternName) {
  const source = batch7Pattern(patternName);
  const herbs = ((source.interventions || {}).herbs || []).map((item) => ({
    name: item.name,
    role: item.role,
    notes: item.notes || ""
  }));
  return {
    first_line: herbs.slice(0, 2),
    second_line: herbs.slice(2, 5),
    device: (source.interventions || {}).device || "",
    rebuild_layer: herbs.slice(5, 8),
    source_pattern: patternName
  };
}

function dominantLayer(topAxis, input) {
  if (["shoulder", "hip"].includes(input.pain_location)) return "fascia_first";
  if (input.pain_location === "spine") return "spine";
  if (input.pain_onset_pattern === "mixed_chronic") return "chronic_mixed";
  if (topAxis === "nerve_first_score") return "nerve_first";
  if (topAxis === "vessel_dominant_score") return "vessel_first";
  if (topAxis === "fascia_first_score") return "fascia_first";
  return "nerve_first";
}

function matchingBatch7Pattern(input, layer, phase) {
  if (phase === "flare" && (input.dominant_state === "heat_flare" || input.heat_signs || input.berberine_status === "ON")) {
    return "heat_flare_active";
  }
  if (input.dominant_state === "cold_deficiency") return "cold_deficiency_yang_insufficient";
  if (input.dominant_state === "dampness_stagnation" && phase === "baseline") return "dampness_stagnation_baseline";

  if (input.pain_location === "shoulder") {
    if (input.cold_signs || input.pain_timing === "rest_night") return "shoulder_capsule_cold_stasis";
    if (input.heat_signs || input.dominant_state === "heat_flare") return "hypertonic_damp_heat_yang_type";
  }
  if (input.pain_location === "hip") {
    if (input.pain_timing === "rest_night") return "hip_capsule_deep_fascia_oedema";
    if (input.pain_timing === "load_only" && input.instability_present) return "hip_ligament_laxity_cold_mitochondrial_weakness";
    if (input.pain_timing === "load_only" && !input.instability_present) return "hip_cartilage_deficiency_blood_stasis";
    if (input.pain_timing === "morning_worse_improves" && input.cold_signs) return "hip_ligament_laxity_cold_mitochondrial_weakness";
  }
  if (input.pain_location === "spine") {
    if (input.pain_timing === "rest_night") return "spine_facet_capsule_ligament_oedema";
    if (input.pain_timing === "load_only" && !input.radiculopathy_present) return "spine_disc_dominant_degeneration";
    if (input.pain_timing === "morning_worse_improves" && input.cold_signs) return "spine_facet_capsule_ligament_oedema";
  }

  if (layer === "nerve_first") return "nerve_first_signal_overload";
  if (layer === "vessel_first") return "vessel_first_amplitude_overload";
  if (layer === "fascia_first" || layer === "chronic_mixed") return "fascia_first_buffer_failure";
  return "migraine_western_ICHD3";
}

function laserRecommendation(input, layer, matchingPattern, mixed) {
  if (input.gut_flare_active) {
    return {
      status: "defer",
      layer,
      recommendation: "Defer laser during active gut flare; stabilise gut first.",
      principle: "Laser should follow the dominant failure layer, not the pain location."
    };
  }
  if (input.pain_location === "spine" || matchingPattern.startsWith("spine_")) {
    return {
      status: "candidate",
      layer: "spine_segmental",
      recommendation: "Paraspinal, segmental, bladder meridian / huatuojiaji logic.",
      principle: "Laser should follow the dominant failure layer, not the pain location."
    };
  }
  if (mixed || layer === "chronic_mixed") {
    return {
      status: "staged",
      layer: "mixed",
      recommendation: "Staged laser: nerve -> vessel -> fascia.",
      principle: "Laser should follow the dominant failure layer, not the pain location."
    };
  }
  if (layer === "nerve_first") {
    return {
      status: "candidate",
      layer,
      recommendation: "Low energy, superficial cervical / auricular / trigeminal zones.",
      principle: "Laser should follow the dominant failure layer, not the pain location."
    };
  }
  if (layer === "vessel_first") {
    return {
      status: "candidate",
      layer,
      recommendation: "Medium energy, perivascular, temporal / orbital region.",
      principle: "Laser should follow the dominant failure layer, not the pain location."
    };
  }
  return {
    status: "candidate",
    layer: "fascia_first",
    recommendation: "Low-medium energy along fascia lines with longer sessions.",
    principle: "Laser should follow the dominant failure layer, not the pain location."
  };
}

function shaoyangCluster(input) {
  const signs = input.Shaoyang_collapse_cluster_signs;
  return {
    present: signs.length > 0,
    signs,
    note: "Shaoyang collapse cluster is logged for weighting only; sub-pattern expansion waits until triage is stable."
  };
}

function progressionModel(input, layer) {
  const detected = input.pain_onset_pattern === "mixed_chronic" || layer === "chronic_mixed" || layer === "fascia_first";
  return {
    detected,
    phrase: "Chronic headache is not escalation - it is migration.",
    sequence: ["nerve_first", "vessel_first", "fascia_first"],
    current_layer: layer
  };
}

function patientOutput({
  stopped,
  stop,
  dominantPattern,
  matchingPattern,
  mixed,
  mixedPatterns,
  vesselOverlay,
  membrane,
  safety,
  hierarchy,
  phase,
  berberine,
  laser
}) {
  if (stopped) {
    return {
      title: "Urgent check-in needed",
      summary: stop.message,
      support: [],
      avoid: ["do not use this tool as the next step"],
      safety_notes: [
        "This is an educational pattern-recognition tool and not a medical diagnosis.",
        "Seek urgent care for red flag symptoms.",
        "Medication changes must be discussed with a clinician."
      ],
      reassessment_prompt: ""
    };
  }

  const label = PATIENT_LABELS[matchingPattern] || PATIENT_LABELS[dominantPattern] || "Headache terrain pattern";
  const support = [];
  support.push(`Current phase: ${phase.name.replace(/_/g, " ")} - ${phase.goal.replace(/_/g, " ")}.`);
  if (hierarchy.first_line.length) {
    support.push(`Primary support focus: ${hierarchy.first_line.map((item) => item.name).join(", ")}.`);
  }
  if (berberine.status !== "OFF") {
    support.push(`${berberine.rule} Current switch status: ${berberine.status.replace(/_/g, " ")}.`);
  }
  if (laser.status !== "defer") {
    support.push(`Laser layer logic: ${laser.recommendation}`);
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
    summary: "This pattern may reflect a headache terrain where nerve, fascia, gut, vessel, and energy-recovery signals overlap. This is an educational pattern-recognition tool, not a medical diagnosis.",
    support,
    avoid: safety.contraindications,
    safety_notes: [
      "Seek urgent care for red flag symptoms.",
      "Medication changes must be discussed with a clinician.",
      "This is an educational pattern-recognition tool, not a medical diagnosis.",
      "Symptoms returning usually means the system was challenged again - not that the treatment failed."
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
  const currentPhase = detectPhase(input, scores);
  const phase = phasePosture(currentPhase);
  const berberine = berberineDecision(input, currentPhase);
  const layer = dominantLayer(top.axis, input);
  const matchingPattern = top.score > 0 ? matchingBatch7Pattern(input, layer, currentPhase) : "insufficient_pattern_evidence";
  const laser = laserRecommendation(input, layer, matchingPattern, mixed);
  const cluster = shaoyangCluster(input);
  const progression = progressionModel(input, layer);
  const safety = applyRules(input, scores, membrane, input.internal_audit, currentPhase, berberine);
  if (matchingPattern === "shoulder_capsule_cold_stasis") {
    safety.contraindications.push("systemic_Fu_Zi_Rou_Gui_level_heating");
    safety.cautions.push("Use local targeted Yang support rather than systemic high-heat herbs for shoulder capsule cold-stasis patterns.");
    if (input.internal_audit) {
      safety.ruleTrace.push({
        condition: "shoulder_pattern == cold_stasis",
        action: "BLOCK Fu Zi / Rou Gui level systemic Yang; use local targeted Yang"
      });
    }
  }
  if (matchingPattern === "hypertonic_damp_heat_yang_type") {
    safety.contraindications.push("excessive_Yang_herbs");
    safety.cautions.push("Hypertonic damp-heat shoulder patterns use membrane/water-grid restoration rather than additional heating.");
    if (input.internal_audit) {
      safety.ruleTrace.push({
        condition: "shoulder_pattern == hypertonic_yang_type",
        action: "BLOCK excessive Yang herbs; use RegenOil + aloe + laser"
      });
    }
  }
  safety.contraindications = [...new Set(safety.contraindications)];
  safety.cautions = [...new Set(safety.cautions)];
  const hierarchy = stop
    ? { first_line: [], second_line: [], device: "", rebuild_layer: [] }
    : (matchingPattern && matchingPattern !== "insufficient_pattern_evidence")
      ? batch7HierarchyFor(matchingPattern)
      : hierarchyFor(topPattern, rebuildIndicated);
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
    if (cluster.present) {
      safety.ruleTrace.push({
        condition: "Shaoyang_collapse_cluster_check triggered",
        action: "note presence/absence; log for pattern weighting"
      });
    }
    if (progression.detected) {
      safety.ruleTrace.push({
        condition: "headache_chronic_progression_detected",
        action: "apply migration model: nerve-first -> vessel-first -> fascia-first"
      });
    }
  }

  return {
    engine: "headache_migraine_pattern_engine",
    source: ["headacheEngine.batch6.json", "avicenna_engine_batch7.json"],
    stopped: Boolean(stop),
    stop,
    axis_scores: scores,
    membrane_EZ_water_instability_score: membrane,
    dominant_axis: top.axis,
    current_phase: currentPhase,
    phase_logic: phase,
    dominant_layer: layer,
    dominant_pattern: topPattern,
    matching_pattern: matchingPattern,
    dominant_pattern_label: PATIENT_LABELS[topPattern] || topPattern,
    matching_pattern_label: PATIENT_LABELS[matchingPattern] || matchingPattern,
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
    chronic_progression: progression,
    berberine_switch: berberine,
    laser_layer_recommendation: laser,
    intervention_interoperability: batch7Data.intervention_interoperability_table,
    ayurveda_interface_map: {
      ...batch7Data.ayurveda_interface_map,
      note: "Structural parallel only - not diagnostic equivalence."
    },
    shaoyang_collapse_cluster: cluster,
    intervention_hierarchy: hierarchy,
    contraindications: safety.contraindications,
    drug_terrain_conflicts: safety.drugTerrainConflicts,
    cautions: safety.cautions,
    patient: patientOutput({
      stopped: Boolean(stop),
      stop,
      dominantPattern: topPattern,
      matchingPattern,
      mixed,
      mixedPatterns: ordered.slice(0, 2),
      vesselOverlay,
      membrane,
      safety,
      hierarchy,
      phase,
      berberine,
      laser
    }),
    clinician: {
      axis_scores: scores,
      contributing_inputs: Object.fromEntries(AXES.map((axis) => [axis, scores[axis].contributing_inputs])),
      red_flag_status: stop ? stop.red_flags : [],
      current_phase: currentPhase,
      dominant_layer: layer,
      dominant_pattern: topPattern,
      matching_pattern: matchingPattern,
      embryological_layer: meta.embryological_layer,
      tcm_channel: meta.tcm_channel,
      intervention_hierarchy: hierarchy,
      contraindications: safety.contraindications,
      drug_terrain_conflicts: safety.drugTerrainConflicts,
      berberine_switch: berberine,
      laser_layer_recommendation: laser,
      intervention_interoperability: batch7Data.intervention_interoperability_table,
      ayurveda_interface_map: batch7Data.ayurveda_interface_map,
      shaoyang_collapse_cluster: cluster,
      rule_trace: safety.ruleTrace
    },
    output_contract: headacheData.output_screens,
    notes: [...headacheData.notes, ...batch7Data.notes, ...CORE_PHRASES],
    batch7_patterns: batch7Data.patterns
  };
}

module.exports = {
  evaluateHeadache,
  scoreAxes,
  headacheData,
  batch7Data,
  AXES
};
