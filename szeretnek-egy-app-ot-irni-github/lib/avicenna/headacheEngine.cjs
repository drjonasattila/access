const headacheData = require("./data/engines/headacheEngine.batch6.json");
const batch7Data = require("./data/engines/avicenna_engine_batch7.json");
const batch8Data = require("./data/engines/avicenna_engine_batch8.json");

const batch8Patterns = Array.isArray(batch8Data.patterns) ? batch8Data.patterns : Object.values(batch8Data.patterns || {});
const batch8Rules = Array.isArray(batch8Data.rules) ? batch8Data.rules : Object.values(batch8Data.rules || {});
const batch8DecisionAxes = Array.isArray(batch8Data.decision_axes)
  ? batch8Data.decision_axes
  : Object.values(batch8Data.decision_axes || {});
const BATCH8_RULE_BY_ID = Object.fromEntries(batch8Rules.map((rule) => [rule.id, rule]));

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
  gut_jueyin_overload: "Gut-pressure migraine pattern",
  shaoyang_gate_instability: "Shaoyang gate instability pattern",
  shaoyang_downstream_fascia_overload: "Downstream fascia overload pattern",
  vascular_blood_stasis_migraine: "Vascular microflow migraine pattern",
  neuro_sensory_membrane_excitability: "Neuro-sensory membrane pattern",
  mixed_joint_inflammatory_edge: "Mixed joint inflammatory-edge phase",
  mixed_joint_transitional: "Mixed joint transitional phase",
  mixed_joint_building_phase: "Mixed joint building phase",
  cgrp_suppression_structural_deficit: "CGRP support and rebuild pattern",
  medication_exhaustion_state: "Medication exhaustion and capacity pattern",
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
  "Ondansetron and triptans are not opposites; they attempt to re-synchronise the same neurovascular-fascial continuum from different entry points.",
  "Functional GI -> Migraine -> Neck/Shoulder pain - one axis, not three diseases.",
  "Mixed OA-RA: failure is due to wrong order, not wrong treatment.",
  "If mixed -> sequence, don't stack.",
  "If unsure -> wait one phase longer.",
  "Medications reduce oscillation; Base44 restores system capacity.",
  "Never use medication in isolation - assess system capacity and run structural support alongside."
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
    gi_symptoms_present: bool(input.gi_symptoms_present)
      || any(list(input.early_warning_signs), ["bloating", "reflux", "constipation", "nausea"])
      || includes(list(input.body_signals), "bloating_heaviness")
      || bool(input.gi_link)
      || bool(input.digestive_sensitivity),
    headache_type: input.headache_type || "unknown",
    pain_character: input.pain_character || "",
    thermal_state_joint: input.thermal_state_joint || "",
    temporal_dynamic: input.temporal_dynamic || "",
    pain_onset: input.pain_onset || "",
    aura_present: bool(input.aura_present) || includes(list(input.sensory_features), "visual_aura"),
    laterality: input.laterality || "",
    gi_link: bool(input.gi_link),
    neck_movement_worsens: bool(input.neck_movement_worsens),
    photophobia: bool(input.photophobia)
      || includes(list(input.sensory_features), "light_sensitivity")
      || includes(list(input.early_warning_signs), "light_sensitivity"),
    phonophobia: bool(input.phonophobia) || includes(list(input.sensory_features), "sound_sensitivity"),
    cold_extremities: bool(input.cold_extremities)
      || includes(list(input.body_signals), "cold_hands_feet")
      || includes(list(input.early_warning_signs), "cold_hands_feet"),
    weather_sensitive: bool(input.weather_sensitive)
      || input.trigger_category === "weather"
      || input.trigger_today === "weather",
    cgrp_in_use: bool(input.cgrp_in_use) || includes(list(input.current_medications), "CGRP_inhibitor"),
    cgrp_side_effects: list(input.cgrp_side_effects),
    medication_status: input.medication_status || "none",
    tca_snri_in_use: bool(input.tca_snri_in_use),
    antipsychotic_pain_use: bool(input.antipsychotic_pain_use),
    joint_phase: input.joint_phase || "",
    collagen_worsened: bool(input.collagen_worsened),
    dry_component_in_formula: bool(input.dry_component_in_formula),
    acute_gi_fever_inflammation: bool(input.acute_gi_fever_inflammation),
    isolated_traumatic_neck_pain: bool(input.isolated_traumatic_neck_pain),
    purely_mechanical_injury: bool(input.purely_mechanical_injury),
    joint_heat_swelling: bool(input.joint_heat_swelling),
    evening_worsening: bool(input.evening_worsening),
    stiffness_replaces_burning: bool(input.stiffness_replaces_burning),
    movement_improves_joint: bool(input.movement_improves_joint),
    pain_empty_not_inflamed: bool(input.pain_empty_not_inflamed),
    warming_agents_worsened: bool(input.warming_agents_worsened),
    exercise_worsened: bool(input.exercise_worsened),
    increasing_medication_doses_required: bool(input.increasing_medication_doses_required),
    effect_duration_shortening: bool(input.effect_duration_shortening),
    side_effects_increasing: bool(input.side_effects_increasing),
    new_gi_fatigue_brain_fog: bool(input.new_gi_fatigue_brain_fog),
    system_capacity_known: bool(input.system_capacity_known),
    system_capacity_can_process_load: bool(input.system_capacity_can_process_load),
    cgrp_step1_complete: bool(input.cgrp_step1_complete),
    cgrp_no_rebound: bool(input.cgrp_no_rebound),
    cgrp_step2_complete: bool(input.cgrp_step2_complete),
    cgrp_severe_uncontrolled: bool(input.cgrp_severe_uncontrolled),
    cgrp_qol_impairment: bool(input.cgrp_qol_impairment),
    cgrp_patient_feels_unsafe: bool(input.cgrp_patient_feels_unsafe),
    ginger_tea_prescribed: bool(input.ginger_tea_prescribed),
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

function batch8Pattern(name) {
  return batch8Patterns.find((item) => item.name === name) || {};
}

function batch8Rule(id) {
  return BATCH8_RULE_BY_ID[id] || { id, condition: "", action: "" };
}

function triggeredBatch8Rule(id, reason = "") {
  const rule = batch8Rule(id);
  return {
    id: rule.id,
    condition: rule.condition,
    action: rule.action,
    reason
  };
}

function uniqueRules(rules) {
  const seen = new Set();
  return rules.filter((rule) => {
    if (!rule || !rule.id || seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
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
  if (input.photophobia) add(scores, "nerve_first_score", 1, "photophobia", "Batch 8 neuro-sensory phenotype signal");
  if (input.phonophobia) add(scores, "nerve_first_score", 1, "phonophobia", "Batch 8 neuro-sensory phenotype signal");
  if (input.pain_character === "burning") add(scores, "nerve_first_score", 2, "burning", "burning signal-load phenotype");
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
  if (input.pain_onset === "from_neck") add(scores, "fascia_first_score", 3, "pain_onset", "neck-initiated Batch 8 fascia/cervicogenic signal");
  if (input.neck_movement_worsens) add(scores, "fascia_first_score", 2, "neck_movement_worsens", "movement-sensitive cervicogenic signal");
  if (input.pain_character === "pressure_hat" || input.pain_character === "stiff") {
    add(scores, "fascia_first_score", 2, "pain_character", "pressure/stiff fascia tension phenotype");
  }
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
  if (input.gi_symptoms_present) add(scores, "gut_metabolic_first_score", 2, "gi_symptoms_present", "Batch 8 GI-migraine-neck axis signal");
  if (input.gi_link) add(scores, "gut_metabolic_first_score", 2, "gi_link", "GI timing correlates with headache");
  if (input.pain_onset === "from_gut") add(scores, "gut_metabolic_first_score", 3, "pain_onset", "gut symptoms precede or initiate headache");
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
  if (input.pain_character === "throbbing") add(scores, "vessel_dominant_score", 2, "throbbing", "Batch 8 vascular phenotype signal");
  if (input.aura_present) add(scores, "vessel_dominant_score", 1, "aura_present", "aura can contribute to vessel-amplitude phenotype");
  if (input.cold_extremities) add(scores, "vessel_dominant_score", 1, "cold_extremities", "cold extremities vascular overlay");
  if (input.weather_sensitive) add(scores, "vessel_dominant_score", 1, "weather_sensitive", "weather-sensitive vessel overlay");
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
  if (["low", "very_low", "flat"].includes(input.energy_state)) {
    add(scores, "mitochondrial_fatigue_score", 2, input.energy_state, "Batch 8 system-capacity energy signal");
  }
  if (input.energy_state === "cold") add(scores, "mitochondrial_fatigue_score", 1, "cold", "cold energy state");
  if (input.dominant_state === "cold_deficiency" || input.cold_signs) add(scores, "mitochondrial_fatigue_score", 2, "cold_deficiency", "cold deficiency or cold intolerance");
  if (input.trigger_today === "overexertion") add(scores, "mitochondrial_fatigue_score", 1, "overexertion", "overexertion energy depletion");
  if (input.timing === "worse_morning") add(scores, "mitochondrial_fatigue_score", 2, "worse_morning", "morning recovery is poor");
  if (includes(input.current_medications, "beta_blocker")) add(scores, "mitochondrial_fatigue_score", 2, "beta_blocker", "drug-terrain energy conflict marker");
  if (includes(input.current_medications, "antidepressant")) add(scores, "mitochondrial_fatigue_score", 2, "antidepressant", "drug-terrain energy conflict marker");
  if (input.treatment_response === "helps_pain_but_drains") add(scores, "mitochondrial_fatigue_score", 2, "helps_pain_but_drains", "pain relief drains energy");
  if (input.gepant_side_effects.includes("fatigue")) add(scores, "mitochondrial_fatigue_score", 1, "gepant_fatigue", "gepant fatigue terrain conflict");
  if (input.cgrp_side_effects.some((item) => ["fatigue", "flat_affect", "reduced_tolerance"].includes(item))) {
    add(scores, "mitochondrial_fatigue_score", 1, "cgrp_side_effects", "CGRP support capacity signal");
  }
  if (input.new_gi_fatigue_brain_fog) add(scores, "mitochondrial_fatigue_score", 1, "new_gi_fatigue_brain_fog", "medication capacity fatigue signal");

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
  if (input.red_flag_present || input.red_flag_type.length) redFlags.push(...input.red_flag_type);
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

function hasHeadacheSignal(input) {
  return Boolean(
    input.headache_type !== "unknown"
    || input.pain_quality
    || input.headache_character
    || input.pain_character
    || input.sensory_features.length
    || input.early_warning_signs.length
    || input.aura_present
    || input.photophobia
    || input.phonophobia
  );
}

function addPhenotype(phenotypes, key, points, inputName, reason) {
  phenotypes[key].score += points;
  phenotypes[key].contributing_inputs.push({ input: inputName, points, reason });
}

function detectMigrainePhenotype(input) {
  const phenotypes = {
    gut_driven: { score: 0, contributing_inputs: [] },
    vascular_blood_stasis: { score: 0, contributing_inputs: [] },
    fascia_tension: { score: 0, contributing_inputs: [] },
    neuro_sensory: { score: 0, contributing_inputs: [] }
  };

  if (input.headache_type && input.headache_type !== "unknown" && input.headache_type !== "mixed" && input.headache_type !== "cervicogenic") {
    const key = input.headache_type === "vascular" ? "vascular_blood_stasis" : input.headache_type;
    if (phenotypes[key]) addPhenotype(phenotypes, key, 3, "headache_type", "explicit phenotype selection");
  }
  if (input.headache_type === "cervicogenic") addPhenotype(phenotypes, "fascia_tension", 4, "headache_type", "explicit cervicogenic selection");
  if (input.headache_type === "mixed") {
    Object.keys(phenotypes).forEach((key) => addPhenotype(phenotypes, key, 1, "headache_type", "mixed phenotype selection"));
  }

  if (input.gi_symptoms_present || input.gi_link || input.pain_onset === "from_gut") {
    addPhenotype(phenotypes, "gut_driven", 3, "gi_symptoms_present", "nausea, bloating, reflux, constipation, or GI timing link");
  }
  if (includes(input.sensory_features, "nausea") || includes(input.early_warning_signs, "nausea")) {
    addPhenotype(phenotypes, "gut_driven", 1, "nausea", "nausea can mark gut-driven migraine phenotype");
  }

  if (input.pain_character === "throbbing" || input.pain_quality === "pulsing_throbbing" || input.headache_character === "pulsing_throbbing") {
    addPhenotype(phenotypes, "vascular_blood_stasis", 2, "throbbing", "throbbing or pulsatile headache");
  }
  if (input.aura_present) addPhenotype(phenotypes, "vascular_blood_stasis", 2, "aura_present", "aura signal");
  if (input.cold_extremities) addPhenotype(phenotypes, "vascular_blood_stasis", 1, "cold_extremities", "cold hands/feet vessel overlay");
  if (input.weather_sensitive) addPhenotype(phenotypes, "vascular_blood_stasis", 1, "weather_sensitive", "weather or barometric trigger");

  if (input.pain_onset === "from_neck" || input.neck_movement_worsens || input.pain_onset_pattern === "fascia_first") {
    addPhenotype(phenotypes, "fascia_tension", 3, "neck_or_fascia_onset", "neck-initiated or movement-sensitive pattern");
  }
  if (any(input.early_warning_signs, ["neck_stiffness", "jaw_tightness", "shoulder_pull"]) || input.pain_character === "pressure_hat" || input.pain_character === "stiff") {
    addPhenotype(phenotypes, "fascia_tension", 2, "neck_shoulder_pressure", "neck/shoulder/skull-base or pressure-hat tension");
  }

  if (input.photophobia || input.phonophobia) {
    addPhenotype(phenotypes, "neuro_sensory", 2, "light_noise_intolerance", "light/noise intolerance");
  }
  if (input.energy_state === "irritable" || input.trigger_category === "sleep_disruption" || input.pain_character === "burning") {
    addPhenotype(phenotypes, "neuro_sensory", 1, "sensory_overload", "irritability, sleep disruption, or burning overload");
  }

  const ordered = Object.entries(phenotypes)
    .map(([phenotype, value]) => ({ phenotype, ...value }))
    .sort((a, b) => b.score - a.score);
  const top = ordered[0];
  const second = ordered[1];
  const cervicogenic = Boolean(
    (input.headache_type === "cervicogenic" || input.pain_onset === "from_neck")
    && input.laterality === "fixed_side"
    && !input.aura_present
    && !input.gi_link
    && !input.gi_symptoms_present
    && input.neck_movement_worsens
  );
  const mixed = !cervicogenic && top.score > 0 && second.score > 0 && Math.abs(top.score - second.score) <= 1;
  const detected = cervicogenic ? "cervicogenic" : mixed ? "mixed" : top.score > 0 ? top.phenotype : "unknown";

  return {
    detected_phenotype: detected,
    phenotype_scores: phenotypes,
    contributing_inputs: Object.fromEntries(Object.entries(phenotypes).map(([key, value]) => [key, value.contributing_inputs])),
    top_two: ordered.slice(0, 2),
    mixed,
    cervicogenic
  };
}

function detectGIMigraineNeckAxis(input, phenotype) {
  const rules = [];
  const exclusionReasons = [];
  if (input.isolated_traumatic_neck_pain) exclusionReasons.push("isolated_traumatic_neck_pain");
  if (input.purely_mechanical_injury) exclusionReasons.push("purely_mechanical_injury");
  if (input.acute_gi_fever_inflammation) exclusionReasons.push("acute_GI_with_fever_inflammation");
  if (exclusionReasons.length) rules.push(triggeredBatch8Rule("R018", exclusionReasons.join(", ")));

  const headachePresent = hasHeadacheSignal(input);
  const giDriven = input.gi_symptoms_present || input.gi_link || input.pain_onset === "from_gut" || phenotype.detected_phenotype === "gut_driven";
  const active = !exclusionReasons.length && headachePresent && giDriven;
  let currentStage = "not_active";
  if (active) {
    currentStage = "gut_jueyin_overload";
    if (input.headache_type !== "gut_driven" && (input.photophobia || input.phonophobia || input.pain_character === "throbbing")) {
      currentStage = "shaoyang_gate_instability";
    }
    if (input.pain_onset === "from_neck" || input.neck_movement_worsens || any(input.early_warning_signs, ["neck_stiffness", "shoulder_pull"])) {
      currentStage = "shaoyang_downstream_fascia_overload";
    }
    rules.push(triggeredBatch8Rule("R001", "GI symptoms precede or accompany headache"));
  } else if (!exclusionReasons.length && headachePresent && !input.gi_symptoms_present && !input.gi_link) {
    rules.push(triggeredBatch8Rule("R002", "headache dominant without GI signal"));
  }

  const axis = batch8DecisionAxes.find((item) => item.name === "GI_migraine_neck_axis") || {};
  return {
    active,
    excluded: exclusionReasons.length > 0,
    exclusion_reasons: exclusionReasons,
    phrase: axis.description || "Functional GI -> Migraine -> Neck/Shoulder pain - one axis, not three diseases.",
    sequence: axis.sequence || ["gut_jueyin_overload", "shaoyang_gate_instability", "shaoyang_downstream_fascia_overload"],
    current_stage: currentStage,
    upstream_first: active,
    rules
  };
}

function detectJointPhase(input) {
  const rules = [];
  const contraindications = [];
  const cautions = [];
  const hasJointContext = Boolean(
    input.joint_phase
    || input.thermal_state_joint
    || input.joint_heat_swelling
    || input.evening_worsening
    || input.stiffness_replaces_burning
    || input.movement_improves_joint
    || input.pain_empty_not_inflamed
    || input.collagen_worsened
    || input.warming_agents_worsened
    || input.exercise_worsened
  );

  if (!hasJointContext) {
    return {
      active: false,
      phase: "not_assessed",
      pattern: "",
      goal: "",
      contraindications,
      cautions,
      intervention_sequence: [],
      rules
    };
  }

  let phase = input.joint_phase || "unknown";
  if (input.warming_agents_worsened || input.exercise_worsened || input.collagen_worsened || input.temporal_dynamic === "rapid_worsening_with_stimulation") {
    phase = "inflammatory_edge";
    rules.push(triggeredBatch8Rule("R008", "rapid worsening with warming, exercise, or collagen"));
  } else if (input.joint_heat_swelling || input.evening_worsening || input.thermal_state_joint === "hot_swollen" || input.thermal_state_joint === "intermittently_hot") {
    phase = "inflammatory_edge";
    rules.push(triggeredBatch8Rule("R005", "heat, swelling, or evening worsening"));
  } else if (input.stiffness_replaces_burning || phase === "transitional" || input.temporal_dynamic === "slow_improvement_not_sustained") {
    phase = "transitional";
    rules.push(triggeredBatch8Rule("R006", "heat subsiding and stiffness replacing burning"));
  } else if (input.movement_improves_joint && input.pain_empty_not_inflamed && phase !== "unknown") {
    phase = "building";
    rules.push(triggeredBatch8Rule("R007", "no active heat, movement improves, pain feels empty/not inflamed"));
  }

  if (input.temporal_dynamic === "slow_improvement_not_sustained") {
    rules.push(triggeredBatch8Rule("R009", "improvement relapsed without structural support"));
  }
  if (phase === "unknown") {
    rules.push(triggeredBatch8Rule("R023", "joint phase is uncertain"));
    cautions.push("If the joint phase is unclear, wait one phase longer before adding rebuilding inputs.");
  }
  rules.push(triggeredBatch8Rule("R022", "mixed joint phase logic is active"));

  const phaseMap = {
    inflammatory_edge: {
      pattern: "mixed_joint_inflammatory_edge",
      goal: "stabilise",
      intervention_sequence: ["stabilise inflammation", "avoid building inputs", "reassess after heat/swelling settles"],
      contraindications: ["Collagen_phase_1", "ProCardiol_phase_1", "strong_MyBlood_phase_1"]
    },
    transitional: {
      pattern: "mixed_joint_transitional",
      goal: "flow_without_overdrive",
      intervention_sequence: ["continue stabilisation base", "low-dose MyBlood only if tolerated", "keep Collagen excluded"],
      contraindications: ["Collagen_phase_2"]
    },
    building: {
      pattern: "mixed_joint_building_phase",
      goal: "structure",
      intervention_sequence: ["introduce Collagen", "increase MyBlood only after heat stays quiet", "consider ProCardiol only if improvement is not sustained"],
      contraindications: []
    },
    unknown: {
      pattern: "",
      goal: "wait_one_phase_longer",
      intervention_sequence: ["stabilise and observe", "do not stack phase 1 and phase 3 inputs"],
      contraindications: ["phase_advancement_until_clear"]
    }
  };
  const config = phaseMap[phase] || phaseMap.unknown;
  contraindications.push(...config.contraindications);
  if (phase === "inflammatory_edge") {
    cautions.push("Mixed OA-RA: failure is due to wrong order, not wrong treatment.");
    cautions.push("If mixed -> sequence, don't stack.");
  }

  return {
    active: true,
    phase,
    pattern: config.pattern,
    goal: config.goal,
    contraindications: [...new Set(contraindications)],
    cautions: [...new Set(cautions)],
    intervention_sequence: config.intervention_sequence,
    rules: uniqueRules(rules)
  };
}

function detectCgrpSupport(input, phenotype) {
  const rules = [];
  const contraindications = [];
  const cautions = [];
  const sideEffects = [...new Set(input.cgrp_side_effects)];
  if (input.energy_state === "flat" && !sideEffects.includes("flat_affect")) sideEffects.push("flat_affect");
  if (input.gi_symptoms_present && !sideEffects.includes("GI_worsening")) sideEffects.push("GI_worsening");
  if (input.energy_state === "low" || input.energy_state === "very_low") sideEffects.push("fatigue");
  const relevant = sideEffects.filter((item) => ["constipation", "fatigue", "flat_affect", "reduced_tolerance", "GI_worsening", "quieter_not_better"].includes(item));
  const active = input.cgrp_in_use && relevant.length >= 2;

  if (!input.cgrp_in_use) {
    return {
      active: false,
      status: "not_in_use",
      flag: "",
      side_effect_markers: [],
      support_sequence: [],
      contraindications,
      cautions,
      rules
    };
  }

  if (active) {
    rules.push(triggeredBatch8Rule("R010", relevant.join(", ")));
    cautions.push("Do not recommend CGRP dose reduction unless phenotype-specific support is in place and clinician supervision is explicit.");
  }
  if (input.cgrp_step1_complete && input.cgrp_no_rebound) rules.push(triggeredBatch8Rule("R011", "step 1 complete with no rebound"));
  if (input.cgrp_step2_complete) rules.push(triggeredBatch8Rule("R012", "step 2 complete"));
  if (input.cgrp_severe_uncontrolled || input.cgrp_qol_impairment || input.cgrp_patient_feels_unsafe) {
    rules.push(triggeredBatch8Rule("R013", "severe or unsafe CGRP exit context"));
    contraindications.push("CGRP_exit_attempt");
  }

  const phenotypeTuning = {
    gut_driven: ["MyGastrin + Fiber"],
    vascular_blood_stasis: ["MyBlood / ProCardiol"],
    fascia_tension: ["Promigraine + laser"],
    cervicogenic: ["Promigraine + laser"],
    mixed: ["phenotype-specific staged support"]
  };
  return {
    active,
    status: active ? "support_sequence_required" : "in_use_without_batch8_exit_flag",
    flag: active ? "cgrp_suppression_structural_deficit" : "",
    side_effect_markers: relevant,
    support_sequence: active ? [
      { step: 1, focus: "grounding", items: ["Fiber", "Hydration support", "Spirulina"] },
      { step: 2, focus: "membrane flow", items: ["RegenOil or D + Nigella", "MyGastrin only if GI pressure or nausea is present"] },
      { step: 3, focus: "phenotype tuning", items: phenotypeTuning[phenotype.detected_phenotype] || phenotypeTuning.mixed }
    ] : [],
    contraindications: [...new Set(contraindications)],
    cautions: [...new Set(cautions)],
    clinician_supervision_required: true,
    rules: uniqueRules(rules)
  };
}

function detectMedicationCapacity(input, phenotype) {
  const rules = [];
  const cautions = [];
  const drugTerrainConflicts = [];
  const active = Boolean(
    ["tolerance_developing", "exhausted"].includes(input.medication_status)
    || input.increasing_medication_doses_required
    || input.effect_duration_shortening
    || input.side_effects_increasing
    || input.new_gi_fatigue_brain_fog
    || input.treatment_response === "helps_less_less"
    || input.treatment_response === "helps_less_and_less"
  );

  if (active) {
    rules.push(triggeredBatch8Rule("R014", "medication effect shortening, dose pressure, side effects, or new GI/fatigue/brain fog symptoms"));
  }

  const canProcessLoad = input.system_capacity_known && input.system_capacity_can_process_load;
  if (active && !canProcessLoad) {
    rules.push(triggeredBatch8Rule("R015", input.system_capacity_known ? "system cannot process load" : "system capacity unknown, defaulting to stabilise-first"));
    cautions.push("Primary question: Is the system able to process load? If not clear, stabilise first and avoid stacking interventions.");
  }
  if (active && canProcessLoad) {
    rules.push(triggeredBatch8Rule("R016", "system capacity marked as able to process load"));
  }
  if (input.pain_character === "moving") rules.push(triggeredBatch8Rule("R017", "migrating or shifting pain character"));
  if (input.tca_snri_in_use || includes(input.current_medications, "antidepressant")) {
    rules.push(triggeredBatch8Rule("R019", "TCA/SNRI or antidepressant class context"));
    drugTerrainConflicts.push("TCA/SNRI support layer: Spirulina + Fiber; add MyGastrin only if GI complaints are present.");
  }
  if (input.antipsychotic_pain_use) {
    rules.push(triggeredBatch8Rule("R020", "off-label antipsychotic pain context"));
    drugTerrainConflicts.push("Off-label antipsychotic pain use is treated as transitional only and paired with stabilisation support.");
  }

  let dominantBranch = "stabilise_first";
  let branchSequence = ["stabilise first", "do not escalate medication or add multiple interventions inside this tool"];
  if (active && canProcessLoad) {
    if (input.gi_symptoms_present || phenotype.detected_phenotype === "gut_driven") {
      dominantBranch = "gut_noise";
      branchSequence = ["MyGastrin", "Fiber"];
    } else if (["low", "very_low", "flat", "exhausted"].includes(input.energy_state)) {
      dominantBranch = "energy_fatigue";
      branchSequence = ["Spirulina"];
    } else if (input.pain_character === "moving") {
      dominantBranch = "migrating_pain";
      branchSequence = ["RegenOil", "D + Nigella"];
    } else if (["from_neck", "from_stress"].includes(input.pain_onset) || ["shoulder", "hip", "spine"].includes(input.pain_location)) {
      dominantBranch = "local_overload";
      branchSequence = ["Laser", "Collagen", "Kudzu"];
    }
  }

  return {
    active,
    status: active ? "medication_exhaustion_state" : "not_flagged",
    system_capacity_question: "Is the system able to process load?",
    can_process_load: canProcessLoad,
    dominant_branch: dominantBranch,
    branch_sequence: branchSequence,
    cautions: [...new Set(cautions)],
    drug_terrain_conflicts: [...new Set(drugTerrainConflicts)],
    rules: uniqueRules(rules)
  };
}

function patternContainsGinger(patternName) {
  const source = batch8Pattern(patternName);
  const interventions = source.interventions || {};
  const herbs = [
    ...(interventions.herbs || []),
    ...Object.values(interventions)
      .filter((item) => item && Array.isArray(item.herbs))
      .flatMap((item) => item.herbs)
  ];
  return herbs.some((item) => /ginger/i.test(item.name || item));
}

function batch8InterventionSequence(patternName) {
  if (!patternName) return [];
  const source = batch8Pattern(patternName);
  const interventions = source.interventions || {};
  if (Array.isArray(interventions.herbs)) {
    return [{
      pattern: patternName,
      items: interventions.herbs.map((item) => item.name),
      device: interventions.device || "",
      sequence_note: interventions.preparation || ""
    }];
  }
  if (patternName === "cgrp_suppression_structural_deficit") {
    return [
      { pattern: patternName, step: 1, items: (interventions.step_1_grounding?.herbs || []).map((item) => item.name), sequence_note: interventions.step_1_grounding?.goal || "" },
      { pattern: patternName, step: 2, items: (interventions.step_2_membrane_flow?.herbs || []).map((item) => item.name), sequence_note: interventions.step_2_membrane_flow?.goal || "" },
      { pattern: patternName, step: 3, items: ["phenotype-specific tuning before any medication discussion"], sequence_note: interventions.step_3_phenotype_tuning?.notes || "" }
    ];
  }
  if (patternName === "medication_exhaustion_state") {
    return [{
      pattern: patternName,
      items: ["assess system capacity", "stabilise first if capacity is low", "then choose one dominant branch"],
      sequence_note: interventions.primary_question || ""
    }];
  }
  return [];
}

function evaluateBatch8(input, stopped) {
  const empty = {
    migraine_phenotype: {
      detected_phenotype: "not_evaluated",
      phenotype_scores: {},
      contributing_inputs: {},
      top_two: [],
      mixed: false,
      cervicogenic: false
    },
    gi_migraine_neck_axis: {
      active: false,
      excluded: false,
      exclusion_reasons: [],
      phrase: "Functional GI -> Migraine -> Neck/Shoulder pain - one axis, not three diseases.",
      sequence: [],
      current_stage: "not_evaluated",
      upstream_first: false,
      rules: []
    },
    joint_phase_logic: {
      active: false,
      phase: "not_evaluated",
      pattern: "",
      goal: "",
      contraindications: [],
      cautions: [],
      intervention_sequence: [],
      rules: []
    },
    cgrp_support: {
      active: false,
      status: "not_evaluated",
      flag: "",
      side_effect_markers: [],
      support_sequence: [],
      contraindications: [],
      cautions: [],
      rules: []
    },
    medication_capacity: {
      active: false,
      status: "not_evaluated",
      system_capacity_question: "Is the system able to process load?",
      can_process_load: false,
      dominant_branch: "",
      branch_sequence: [],
      cautions: [],
      drug_terrain_conflicts: [],
      rules: []
    },
    cervicogenic_protocol: { active: false, sequence: [] },
    matching_pattern: "",
    intervention_sequence: [],
    contraindications: [],
    cautions: [],
    drug_terrain_conflicts: [],
    rules_triggered_by_id: []
  };

  if (stopped) return empty;

  const phenotype = detectMigrainePhenotype(input);
  const giAxis = detectGIMigraineNeckAxis(input, phenotype);
  const jointPhase = detectJointPhase(input);
  const cgrpSupport = detectCgrpSupport(input, phenotype);
  const medicationCapacity = detectMedicationCapacity(input, phenotype);
  const rules = [
    ...giAxis.rules,
    ...jointPhase.rules,
    ...cgrpSupport.rules,
    ...medicationCapacity.rules
  ];
  const contraindications = [
    ...jointPhase.contraindications,
    ...cgrpSupport.contraindications
  ];
  const cautions = [
    ...jointPhase.cautions,
    ...cgrpSupport.cautions,
    ...medicationCapacity.cautions
  ];
  const drugTerrainConflicts = [...medicationCapacity.drug_terrain_conflicts];

  let matchingPattern = "";
  if (jointPhase.pattern) matchingPattern = jointPhase.pattern;
  if (cgrpSupport.active) matchingPattern = "cgrp_suppression_structural_deficit";
  if (medicationCapacity.active && !matchingPattern) matchingPattern = "medication_exhaustion_state";
  if (giAxis.active && !matchingPattern) matchingPattern = giAxis.current_stage;
  if (!matchingPattern) {
    const phenotypeMap = {
      gut_driven: "gut_jueyin_overload",
      vascular_blood_stasis: "vascular_blood_stasis_migraine",
      fascia_tension: "shaoyang_downstream_fascia_overload",
      cervicogenic: "shaoyang_downstream_fascia_overload",
      neuro_sensory: "neuro_sensory_membrane_excitability",
      mixed: "shaoyang_gate_instability"
    };
    matchingPattern = phenotypeMap[phenotype.detected_phenotype] || "";
  }

  if (phenotype.cervicogenic) {
    rules.push(triggeredBatch8Rule("R003", "neck-initiated, fixed-side, no aura/GI link, worse with movement"));
  }
  if (input.dry_component_in_formula) {
    contraindications.push("Ginger_Pack_1");
    rules.push(triggeredBatch8Rule("R004", "dry component present in formula"));
  }
  if (input.ginger_tea_prescribed || patternContainsGinger(matchingPattern)) {
    cautions.push("Ginger tea timing: morning or midday only; never evening; weak-to-medium strength.");
    rules.push(triggeredBatch8Rule("R021", "ginger tea present in the active pattern or selected inputs"));
  }
  if (phenotype.detected_phenotype === "neuro_sensory" && input.photophobia && input.phonophobia && input.energy_state === "irritable") {
    rules.push(triggeredBatch8Rule("R024", "photophobia + phonophobia + irritability dominant"));
  }

  const interventionSequence = [
    ...batch8InterventionSequence(matchingPattern),
    ...(jointPhase.active ? [{ pattern: jointPhase.pattern || "mixed_joint_phase", items: jointPhase.intervention_sequence, sequence_note: jointPhase.goal }] : []),
    ...(cgrpSupport.active ? cgrpSupport.support_sequence.map((step) => ({ pattern: "cgrp_suppression_structural_deficit", ...step })) : []),
    ...(medicationCapacity.active ? [{ pattern: "medication_exhaustion_state", items: medicationCapacity.branch_sequence, sequence_note: medicationCapacity.system_capacity_question }] : [])
  ];

  return {
    migraine_phenotype: phenotype,
    gi_migraine_neck_axis: giAxis,
    joint_phase_logic: jointPhase,
    cgrp_support: cgrpSupport,
    medication_capacity: medicationCapacity,
    cervicogenic_protocol: {
      active: phenotype.cervicogenic,
      sequence: phenotype.cervicogenic
        ? ["local laser C2-C5 / GB / SI / BL", "Collagen / RegenOil", "Kudzu", "do not treat as migraine alone"]
        : []
    },
    matching_pattern: matchingPattern,
    intervention_sequence: interventionSequence,
    contraindications: [...new Set(contraindications)],
    cautions: [...new Set(cautions)],
    drug_terrain_conflicts: [...new Set(drugTerrainConflicts)],
    rules_triggered_by_id: uniqueRules(rules)
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
  laser,
  batch8
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
  const batch8FirstSequence = (batch8?.intervention_sequence || []).find((step) => (step.items || []).length);
  if (batch8?.matching_pattern && batch8FirstSequence) {
    support.push(`Batch 8 sequence focus: ${batch8FirstSequence.items.join(", ")}.`);
  } else if (hierarchy.first_line.length) {
    support.push(`Primary support focus: ${hierarchy.first_line.map((item) => item.name).join(", ")}.`);
  }
  if (berberine.status !== "OFF") {
    support.push(`${berberine.rule} Current switch status: ${berberine.status.replace(/_/g, " ")}.`);
  }
  const batch8BlocksEarlyLaser = Boolean(
    batch8?.gi_migraine_neck_axis?.active
    || batch8?.cgrp_support?.active
    || (batch8?.medication_capacity?.active && !batch8.medication_capacity.can_process_load)
    || batch8?.joint_phase_logic?.phase === "inflammatory_edge"
  );
  if (laser.status !== "defer" && !batch8BlocksEarlyLaser) {
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
  if (batch8?.migraine_phenotype?.detected_phenotype && !["unknown", "not_evaluated"].includes(batch8.migraine_phenotype.detected_phenotype)) {
    support.push(`Batch 8 phenotype triage: ${batch8.migraine_phenotype.detected_phenotype.replace(/_/g, " ")} pattern.`);
  }
  if (batch8?.gi_migraine_neck_axis?.active) {
    support.push(`${batch8.gi_migraine_neck_axis.phrase.replace(/\.$/, "")}. Upstream GI support is prioritised when GI signals precede or accompany headache.`);
  }
  if (batch8?.cervicogenic_protocol?.active) {
    support.push("Cervicogenic distinction is active: neck-initiated, fixed-side, movement-sensitive pain is handled as local fascia/neck support, not migraine alone.");
  }
  if (batch8?.joint_phase_logic?.active) {
    support.push(`Joint phase logic: ${batch8.joint_phase_logic.phase.replace(/_/g, " ")} - ${batch8.joint_phase_logic.goal.replace(/_/g, " ")}.`);
  }
  if (batch8?.cgrp_support?.active) {
    support.push("CGRP support logic is active: grounding and membrane-flow support come before any medication discussion with a clinician.");
  }
  if (batch8?.medication_capacity?.active) {
    support.push(`System capacity check: ${batch8.medication_capacity.system_capacity_question}`);
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
  const batch8 = evaluateBatch8(input, Boolean(stop));
  safety.contraindications.push(...batch8.contraindications);
  safety.cautions.push(...batch8.cautions);
  safety.drugTerrainConflicts.push(...batch8.drug_terrain_conflicts);
  if (input.internal_audit) {
    safety.ruleTrace.push(...batch8.rules_triggered_by_id.map((rule) => ({
      id: rule.id,
      condition: rule.condition,
      action: rule.action,
      reason: rule.reason
    })));
  }
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
    source: ["headacheEngine.batch6.json", "avicenna_engine_batch7.json", "avicenna_engine_batch8.json"],
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
    batch8_matching_pattern: batch8.matching_pattern,
    dominant_pattern_label: PATIENT_LABELS[topPattern] || topPattern,
    matching_pattern_label: PATIENT_LABELS[matchingPattern] || matchingPattern,
    batch8_matching_pattern_label: PATIENT_LABELS[batch8.matching_pattern] || batch8.matching_pattern,
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
    migraine_phenotype: batch8.migraine_phenotype,
    gi_migraine_neck_axis: batch8.gi_migraine_neck_axis,
    joint_phase_logic: batch8.joint_phase_logic,
    cgrp_support: batch8.cgrp_support,
    medication_capacity: batch8.medication_capacity,
    cervicogenic_protocol: batch8.cervicogenic_protocol,
    batch8_intervention_sequence: stop ? [] : batch8.intervention_sequence,
    rules_triggered_by_id: batch8.rules_triggered_by_id,
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
      laser,
      batch8
    }),
    clinician: {
      axis_scores: scores,
      contributing_inputs: Object.fromEntries(AXES.map((axis) => [axis, scores[axis].contributing_inputs])),
      red_flag_status: stop ? stop.red_flags : [],
      current_phase: currentPhase,
      dominant_layer: layer,
      dominant_pattern: topPattern,
      matching_pattern: matchingPattern,
      batch8_matching_pattern: batch8.matching_pattern,
      detected_phenotype: batch8.migraine_phenotype.detected_phenotype,
      migraine_phenotype: batch8.migraine_phenotype,
      gi_migraine_neck_axis: batch8.gi_migraine_neck_axis,
      joint_phase_logic: batch8.joint_phase_logic,
      cgrp_support_status: batch8.cgrp_support.status,
      cgrp_support: batch8.cgrp_support,
      medication_exhaustion_state: batch8.medication_capacity,
      cervicogenic_protocol: batch8.cervicogenic_protocol,
      batch8_intervention_sequence: stop ? [] : batch8.intervention_sequence,
      rules_triggered_by_id: batch8.rules_triggered_by_id,
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
    batch7_patterns: batch7Data.patterns,
    batch8_patterns: batch8Patterns,
    batch8_decision_axes: batch8DecisionAxes
  };
}

module.exports = {
  evaluateHeadache,
  scoreAxes,
  headacheData,
  batch7Data,
  batch8Data,
  AXES
};
