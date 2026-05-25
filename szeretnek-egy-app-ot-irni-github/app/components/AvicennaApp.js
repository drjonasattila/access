"use client";

import { useMemo, useState } from "react";

const initialInput = {
  thermal: "",
  moisture: "",
  energy_state: "",
  symptom_intensity: "",
  digestive_sensitivity: "",
  frailty: false,
  symptoms: [],
  safety_flags: []
};

const fieldGroups = [
  {
    key: "thermal",
    label: "Thermal tendency",
    options: [
      ["cold", "Cold", "Feel cold, worse in cold weather"],
      ["neutral", "Neutral", "No strong tendency"],
      ["heat", "Heat", "Feel hot, burning, restless"]
    ]
  },
  {
    key: "moisture",
    label: "Moisture state",
    options: [
      ["damp", "Damp", "Heavy, bloated, foggy"],
      ["neutral", "Neutral", "Neither clearly"],
      ["dry", "Dry", "Dry skin, thirsty, depleted"]
    ]
  },
  {
    key: "energy_state",
    label: "Energy state",
    options: [
      ["undercharged", "Low", "Exhausted, slow, depleted"],
      ["neutral", "Moderate", "Neither extreme"],
      ["overcharged", "Overactive", "Wired, agitated, hypersensitive"]
    ]
  },
  {
    key: "symptom_intensity",
    label: "Symptom intensity",
    options: [
      ["mild", "Mild", "Noticeable"],
      ["moderate", "Moderate", "Affecting daily life"],
      ["strong", "Strong", "Significantly disruptive"]
    ]
  },
  {
    key: "digestive_sensitivity",
    label: "Digestive sensitivity",
    options: [
      ["low", "Low", "Tolerates most things well"],
      ["medium", "Medium", "Somewhat sensitive"],
      ["high", "High", "Very sensitive, reacts easily"]
    ]
  }
];

const symptoms = [
  ["bloating", "Bloating"],
  ["brain_fog", "Brain fog"],
  ["cold_hands_feet", "Cold hands / feet"],
  ["dry_mouth", "Dry mouth"],
  ["irritability", "Irritability"],
  ["loose_stool", "Loose stool"],
  ["constipation_dry", "Constipation / dry"],
  ["palpitations", "Palpitations / anxiety"]
];

const safetyFlags = [
  ["pregnancy", "Pregnancy"],
  ["gastritis", "Gastritis / ulcers"],
  ["hypertension", "High blood pressure"],
  ["palpitations_flag", "Significant palpitations"],
  ["anticoagulants", "Blood thinners"]
];

const headacheInitialInput = {
  pain_quality: "",
  sensory_features: [],
  timing: "",
  energy_state: "",
  existing_diagnosis: [],
  current_medications: [],
  treatment_response: "",
  body_signals: [],
  tongue_photo: "",
  tongue_features: [],
  trigger_category: "",
  early_warning_signs: [],
  frailty: false,
  emotional_constraint: false,
  digestive_sensitivity: false,
  cancer_active: false,
  post_chemo_window: false,
  gut_flare_active: false,
  new_neurological_deficit: false,
  thunderclap_headache: false,
  acute_headache_episode: false,
  ProImmunoR_requested: false,
  multiple_adaptogens_stacking: false,
  glutathione_initiated: false,
  EZ_stabilisation_not_done: false,
  laser_eligibility_check: false,
  omega3_dose: "",
  reassessment_day: "",
  dominant_state: "",
  berberine_status: "OFF",
  system_response_at_day3_7: "",
  headache_character: "",
  pain_onset_pattern: "",
  pain_location: "head",
  pain_timing: "",
  instability_present: false,
  radiculopathy_present: false,
  cold_signs: false,
  heat_signs: false,
  tongue: "",
  pulse: "",
  Shaoyang_collapse_cluster_signs: [],
  triptan_response: "",
  gepant_use: false,
  gepant_side_effects: [],
  current_phase: "",
  red_flag_present: false,
  red_flag_type: [],
  gi_symptoms_present: false,
  headache_type: "unknown",
  pain_character: "",
  thermal_state_joint: "",
  temporal_dynamic: "",
  pain_onset: "",
  aura_present: false,
  laterality: "",
  gi_link: false,
  neck_movement_worsens: false,
  photophobia: false,
  phonophobia: false,
  cold_extremities: false,
  weather_sensitive: false,
  cgrp_in_use: false,
  cgrp_side_effects: [],
  medication_status: "none",
  tca_snri_in_use: false,
  antipsychotic_pain_use: false,
  joint_phase: "",
  collagen_worsened: false,
  dry_component_in_formula: false,
  acute_gi_fever_inflammation: false,
  isolated_traumatic_neck_pain: false,
  purely_mechanical_injury: false,
  joint_heat_swelling: false,
  evening_worsening: false,
  stiffness_replaces_burning: false,
  movement_improves_joint: false,
  pain_empty_not_inflamed: false,
  warming_agents_worsened: false,
  exercise_worsened: false,
  increasing_medication_doses_required: false,
  effect_duration_shortening: false,
  side_effects_increasing: false,
  new_gi_fatigue_brain_fog: false,
  system_capacity_known: false,
  system_capacity_can_process_load: false,
  cgrp_step1_complete: false,
  cgrp_no_rebound: false,
  cgrp_step2_complete: false,
  cgrp_severe_uncontrolled: false,
  cgrp_qol_impairment: false,
  cgrp_patient_feels_unsafe: false,
  ginger_tea_prescribed: false,
  pain_quality_neuropathy: [],
  pain_distribution: [],
  pain_timing_neuropathy: [],
  sensory_functional_impact: [],
  neuropathy_diagnosis: "",
  current_medication_neuropathy: [],
  medication_experience: "",
  neuropathy_noise_reduced: false,
  neuropathy_flow_improved: false,
  rapidly_progressive_weakness: false,
  bowel_bladder_dysfunction: false,
  saddle_anaesthesia: false,
  acute_limb_ischemia: false,
  severe_infection: false,
  unexplained_systemic_illness: false,
  joint_thermal_state: "",
  joint_response_to_treatment: "",
  systemic_signs_joint: [],
  joint_hot_swollen_systemic_illness: false,
  pelvic_pain_present: false,
  adrenal_fatigue_signs: [],
  vertical_dissociation_pattern: false,
  low_back_pain: false,
  pelvic_NSAID_prescribed: false,
  pelvic_hormonal_therapy_prescribed: false,
  pelvic_warming_herbs_only: false,
  steroid_injection_pelvic_spinal: false,
  claudication_type: "unknown",
  neurogenic_claudication_signs: [],
  vascular_claudication_signs: [],
  EZ_field_collapse_signs: [],
  MRI_structural_severity: "none",
  NSMBP_features: [],
  shaoyin_disconnection_signs: [],
  acute_vascular_compromise: false,
  internal_audit: false
};

const headacheFieldGroups = [
  {
    key: "pain_quality",
    label: "Pain quality",
    options: [
      ["pulsing_throbbing", "Pulsing", "Throbbing or pulsatile"],
      ["dull_heavy", "Heavy", "Dull, weighted, foggy"],
      ["tight_band_like", "Band-like", "Tight or compressive"],
      ["sharp_stabbing", "Sharp", "Stabbing or electric"]
    ]
  },
  {
    key: "timing",
    label: "Timing",
    options: [
      ["worse_morning", "Morning", "Worse on waking"],
      ["worse_afternoon", "Afternoon", "Builds through the day"],
      ["worse_evening", "Evening", "Later-day pattern"],
      ["wakes_at_night", "Night waking", "Wakes from sleep"]
    ]
  },
  {
    key: "energy_state",
    label: "Energy state",
    options: [
      ["tired_but_wired", "Wired-tired", "Activated but depleted"],
      ["exhausted", "Exhausted", "Low recovery capacity"],
      ["irritable", "Irritable", "Reactive, buzzing"],
      ["cold", "Cold", "Cold, low warmth"],
      ["low", "Low", "Reduced capacity"],
      ["very_low", "Very low", "Strong recovery limitation"],
      ["flat", "Flat", "Quieter but not better"]
    ]
  },
  {
    key: "trigger_category",
    label: "Trigger pattern",
    options: [
      ["weather", "Weather", "Pressure or weather changes"],
      ["stress_overload", "Stress load", "Overload or strain"],
      ["overexertion", "Exertion", "Physical overexertion"],
      ["sleep_disruption", "Sleep", "Poor sleep or rhythm shift"],
      ["food_alcohol_histamine", "Food", "Food, alcohol, histamine"],
      ["infection", "Infection", "Post-infectious pattern"],
      ["hormonal", "Hormonal", "Cycle-linked pattern"]
    ]
  },
  {
    key: "treatment_response",
    label: "Response pattern",
    options: [
      ["helps_temporarily", "Temporary help", "Helps, then fades"],
      ["helps_pain_but_drains", "Draining relief", "Pain improves but energy drops"],
      ["helps_less_less", "Less effective", "Helps less over time"],
      ["helps_but_side_effects", "Side effects", "Helpful but costly"],
      ["no_help", "No help", "No clear benefit"]
    ]
  },
  {
    key: "omega3_dose",
    label: "Omega-3 context",
    options: [
      ["none", "None", "Not currently used"],
      ["low", "Low", "Small dose only"],
      ["high", "High", "High-dose use"]
    ]
  }
];

const batch7FieldGroups = [
  {
    key: "current_phase",
    label: "Current phase",
    options: [
      ["flare", "Flare", "Short-term stabilisation only"],
      ["baseline", "Baseline", "Rebuild and strengthen"],
      ["post_flare_rebuild", "Post-flare rebuild", "Transition from calming to reconstruction"]
    ]
  },
  {
    key: "dominant_state",
    label: "Dominant state",
    options: [
      ["heat_flare", "Heat flare", "Inflammatory escalation"],
      ["dampness_stagnation", "Dampness baseline", "Chronic stagnation"],
      ["cold_deficiency", "Cold deficiency", "Cold, low warmth"],
      ["mixed_unstable", "Mixed unstable", "Overlapping state"]
    ]
  },
  {
    key: "berberine_status",
    label: "Berberine switch",
    options: [
      ["OFF", "Off", "Not active"],
      ["ON", "On", "Short flare switch only"]
    ]
  },
  {
    key: "system_response_at_day3_7",
    label: "Day 3-7 response",
    options: [
      ["stabilised", "Stabilised", "Calmer, less flare"],
      ["worse", "Worse", "Symptoms increased"],
      ["no_change", "No change", "No clear shift"]
    ]
  },
  {
    key: "headache_character",
    label: "Headache character",
    options: [
      ["pulsing_throbbing", "Pulsing", "Vessel-amplitude signal"],
      ["burning_vibrating", "Burning / vibrating", "Nerve-first signal"],
      ["dull_deep", "Dull deep", "Fascia-buffer signal"],
      ["tight_band", "Tight band", "Fascia-line signal"]
    ]
  },
  {
    key: "pain_onset_pattern",
    label: "Progression pattern",
    options: [
      ["nerve_first", "Nerve first", "Noise / sensory first"],
      ["vessel_first", "Vessel first", "Throbbing / amplitude first"],
      ["fascia_first", "Fascia first", "Tension / buffer first"],
      ["mixed_chronic", "Mixed chronic", "Layered migration"]
    ]
  },
  {
    key: "pain_location",
    label: "Main location",
    options: [
      ["head", "Head", "Headache dominant"],
      ["shoulder", "Shoulder", "Shoulder capsule pattern"],
      ["hip", "Hip", "Hip capsule / cartilage / ligament"],
      ["spine", "Spine", "Facet / disc / segmental"],
      ["mixed", "Mixed", "Multiple regions"]
    ]
  },
  {
    key: "pain_timing",
    label: "Pain timing",
    options: [
      ["rest_night", "Rest / night", "Pain at rest or at night"],
      ["load_only", "Load only", "Pain mainly with load"],
      ["morning_worse_improves", "Morning worse", "Improves through day"],
      ["constant", "Constant", "Persistent"]
    ]
  },
  {
    key: "tongue",
    label: "Tongue pattern",
    options: [
      ["purple_engorged", "Purple / engorged", "Vessel signs"],
      ["wet_coated", "Wet coated", "Dampness signs"],
      ["thin_dry", "Thin dry", "Dry rebuild signs"],
      ["normal", "Normal", "No strong signal"]
    ]
  },
  {
    key: "pulse",
    label: "Pulse pattern",
    options: [
      ["weak", "Weak", "Low recovery signal"],
      ["wiry", "Wiry", "Tension signal"],
      ["full", "Full", "Excess / flare signal"],
      ["normal", "Normal", "No strong signal"]
    ]
  },
  {
    key: "triptan_response",
    label: "Triptan response",
    options: [
      ["good", "Good", "Clear acute help"],
      ["partial", "Partial", "Some help"],
      ["stops_working", "Stops working", "Diminishing response"],
      ["rebound", "Rebound", "Returns or rebounds"],
      ["not_used", "Not used", "Not applicable"]
    ]
  }
];

const batch8FieldGroups = [
  {
    key: "headache_type",
    label: "Migraine phenotype triage",
    options: [
      ["gut_driven", "Gut-driven", "Nausea, bloating, reflux, or meal/stress link"],
      ["vascular", "Vascular", "Throbbing, aura, cold hands, weather link"],
      ["fascia_tension", "Fascia tension", "Neck, shoulder, skull-base pattern"],
      ["neuro_sensory", "Neuro-sensory", "Light/noise intolerance or overload"],
      ["mixed", "Mixed", "Several patterns are close"],
      ["cervicogenic", "Cervicogenic", "Neck-initiated, movement-sensitive"],
      ["unknown", "Unknown", "Let the engine infer"]
    ]
  },
  {
    key: "pain_character",
    label: "Batch 8 pain character",
    options: [
      ["throbbing", "Throbbing", "Pulsatile / amplitude signal"],
      ["burning", "Burning", "Signal overload"],
      ["pressure_hat", "Pressure hat", "Band-like / fascia tension"],
      ["stiff", "Stiff", "Joint or fascia stiffness"],
      ["empty", "Empty", "Non-inflamed depleted feel"],
      ["moving", "Moving", "Migrating or shifting pain"]
    ]
  },
  {
    key: "pain_onset",
    label: "Where it seems to start",
    options: [
      ["from_inside_system", "Inside system", "General system overflow"],
      ["from_neck", "Neck", "Neck starts the cascade"],
      ["from_gut", "Gut", "GI signals precede headache"],
      ["from_stress", "Stress", "Stress load starts the cascade"]
    ]
  },
  {
    key: "thermal_state_joint",
    label: "Joint thermal state",
    options: [
      ["hot_swollen", "Hot / swollen", "Active heat or swelling"],
      ["intermittently_hot", "Intermittently hot", "Comes and goes"],
      ["cold_stiff", "Cold stiff", "Cold stiffness"],
      ["neutral", "Neutral", "No strong joint heat/cold"]
    ]
  },
  {
    key: "joint_phase",
    label: "Mixed joint phase",
    options: [
      ["inflammatory_edge", "Inflammatory edge", "Stabilise only"],
      ["transitional", "Transitional", "Flow without overdrive"],
      ["building", "Building", "Structure phase"],
      ["unknown", "Unknown", "Wait one phase longer"]
    ]
  },
  {
    key: "temporal_dynamic",
    label: "Temporal dynamic",
    options: [
      ["rapid_worsening_with_stimulation", "Worsens with stimulation", "Heat/exercise/building input worsens"],
      ["slow_improvement_not_sustained", "Improves then fades", "Needs phase support"],
      ["stable", "Stable", "No major dynamic shift"]
    ]
  },
  {
    key: "medication_status",
    label: "Medication capacity",
    options: [
      ["none", "None", "No medication context"],
      ["working", "Working", "Effect stable"],
      ["tolerance_developing", "Tolerance", "Effect shortening or dose pressure"],
      ["exhausted", "Exhausted", "Medication helps less and adds load"]
    ]
  },
  {
    key: "laterality",
    label: "Laterality",
    options: [
      ["fixed_side", "Fixed side", "Usually same side"],
      ["variable_side", "Variable", "Side changes"]
    ]
  }
];

const batch9FieldGroups = [
  {
    key: "neuropathy_diagnosis",
    label: "Neuropathy context",
    options: [
      ["diabetic", "Diabetic", "Diabetic neuropathy context"],
      ["post_surgical", "Post-surgical", "After procedure or injury"],
      ["chemotherapy_induced", "Chemo-related", "Post-chemotherapy context"],
      ["radiculopathy", "Radiculopathy", "Nerve-root background"],
      ["idiopathic", "Unclear", "No clear label"]
    ]
  },
  {
    key: "medication_experience",
    label: "Neuropathy medication experience",
    options: [
      ["helps_but_foggy", "Foggy relief", "Helps pain but causes cognitive fog"],
      ["helps_then_stops", "Fades", "Helped initially then stopped"],
      ["partial_breakthrough", "Partial", "Partial response / breakthrough symptoms"],
      ["helps_pain_not_sleep", "Pain only", "Pain improves but sleep remains poor"],
      ["no_help", "No help", "No clear help"]
    ]
  },
  {
    key: "joint_thermal_state",
    label: "OA / RA joint classifier",
    options: [
      ["hot_red_swollen", "Hot / red / swollen", "Inflammatory joint signal"],
      ["cold_stiff_empty", "Cold / stiff", "Degenerative depletion signal"],
      ["mixed", "Mixed", "Heat and stiffness overlap"],
      ["neutral", "Neutral", "No clear thermal signal"]
    ]
  },
  {
    key: "joint_response_to_treatment",
    label: "Joint response",
    options: [
      ["NSAID_steroid_rapid_response", "Rapid anti-inflammatory response", "NSAID/steroid works rapidly"],
      ["NSAID_partial", "Partial NSAID", "Partially helpful"],
      ["movement_improves", "Movement improves", "Warms up with movement"],
      ["cold_worsens", "Cold worsens", "Cold weather increases pain"]
    ]
  },
  {
    key: "claudication_type",
    label: "Claudication triage",
    options: [
      ["neurogenic", "Neurogenic", "Worse standing/walking, better sitting/flexion"],
      ["vascular", "Vascular", "Predictable distance, quick rest relief"],
      ["mixed", "Mixed", "Both branches possible"],
      ["unknown", "Unknown", "Let the engine infer"]
    ]
  },
  {
    key: "MRI_structural_severity",
    label: "MRI / symptom match",
    options: [
      ["severe_stenosis_no_symptoms", "Severe MRI, mild symptoms", "Field seems resilient"],
      ["mild_stenosis_severe_symptoms", "Mild MRI, severe symptoms", "Field collapse possibility"],
      ["moderate_matched", "Matched", "Symptoms and imaging broadly match"],
      ["none", "No MRI context", "Not assessed"]
    ]
  }
];

const headacheMultiGroups = [
  {
    key: "sensory_features",
    title: "Sensory features",
    items: [
      ["light_sensitivity", "Light sensitivity"],
      ["sound_sensitivity", "Sound sensitivity"],
      ["visual_aura", "Visual aura"],
      ["nausea", "Nausea"]
    ]
  },
  {
    key: "existing_diagnosis",
    title: "Existing labels or background",
    items: [
      ["migraine_with_aura", "Migraine with aura"],
      ["migraine_without_aura", "Migraine without aura"],
      ["tension_headache", "Tension headache"],
      ["cervical_spine", "Cervical spine"],
      ["diabetes", "Diabetes"],
      ["hypertension", "Hypertension"],
      ["anxiety_depression", "Anxiety / depression"]
    ]
  },
  {
    key: "current_medications",
    title: "Current medications",
    items: [
      ["triptan", "Triptan"],
      ["beta_blocker", "Beta blocker"],
      ["antidepressant", "Antidepressant"],
      ["gabapentin_pregabalin", "Gabapentin / pregabalin"],
      ["NSAID", "NSAID"],
      ["none", "None"]
    ]
  },
  {
    key: "body_signals",
    title: "Body signals",
    items: [
      ["dry_mouth", "Dry mouth"],
      ["dry_stool_constipation", "Dry stool / constipation"],
      ["dark_urine", "Dark urine"],
      ["dry_skin", "Dry skin"],
      ["brittle_nails", "Brittle nails"],
      ["brittle_hair", "Brittle hair"],
      ["bloating_heaviness", "Bloating / heaviness"],
      ["cold_hands_feet", "Cold hands / feet"],
      ["sweating_without_exertion", "Sweating without exertion"],
      ["usually_cold", "Usually cold"],
      ["usually_hot", "Usually hot"]
    ]
  },
  {
    key: "tongue_features",
    title: "Tongue features",
    items: [
      ["swollen", "Swollen"],
      ["thin", "Thin"],
      ["dry", "Dry"],
      ["thick_coating", "Thick coating"],
      ["purple_dark", "Purple / dark"],
      ["normal", "Normal"]
    ]
  },
  {
    key: "early_warning_signs",
    title: "Early warning signs",
    items: [
      ["bloating", "Bloating"],
      ["reflux", "Reflux"],
      ["constipation", "Constipation"],
      ["nausea", "Nausea"],
      ["neck_stiffness", "Neck stiffness"],
      ["jaw_tightness", "Jaw tightness"],
      ["shoulder_pull", "Shoulder pull"],
      ["light_sensitivity", "Light sensitivity"],
      ["scalp_tenderness", "Scalp tenderness"],
      ["irritability_buzzing", "Irritability / buzzing"],
      ["pulsatile_temple", "Pulsatile temple"],
      ["heavy_head", "Heavy head"],
      ["cold_hands_feet", "Cold hands / feet"],
      ["exertion_intolerance", "Exertion intolerance"]
    ]
  }
];

const batch9MultiGroups = [
  {
    key: "pain_quality_neuropathy",
    title: "Neuropathy pain quality",
    items: [
      ["burning", "Burning"],
      ["electric_shooting", "Electric / shooting"],
      ["tingling", "Tingling"],
      ["numbness", "Numbness"],
      ["deep_aching", "Deep aching"]
    ]
  },
  {
    key: "pain_distribution",
    title: "Neuropathy distribution",
    items: [
      ["hands", "Hands"],
      ["feet", "Feet"],
      ["one_side_only", "One side only"],
      ["follows_nerve_path", "Follows nerve path"],
      ["patchy_changing", "Patchy / changing"]
    ]
  },
  {
    key: "pain_timing_neuropathy",
    title: "Neuropathy timing",
    items: [
      ["worse_at_night", "Worse at night"],
      ["worse_at_rest", "Worse at rest"],
      ["worse_after_activity", "Worse after activity"],
      ["constant", "Constant"]
    ]
  },
  {
    key: "sensory_functional_impact",
    title: "Sensory and functional impact",
    items: [
      ["sleep_disturbance", "Sleep disturbance"],
      ["touch_sensitivity", "Touch sensitivity / allodynia"],
      ["cold_sensitivity", "Cold sensitivity"],
      ["balance_issues", "Balance issues"],
      ["muscle_weakness", "Muscle weakness"]
    ]
  },
  {
    key: "current_medication_neuropathy",
    title: "Neuropathy medication context",
    items: [
      ["gabapentin", "Gabapentin"],
      ["pregabalin", "Pregabalin"],
      ["antidepressant", "Antidepressant"],
      ["opioid", "Opioid"],
      ["none", "None"]
    ]
  },
  {
    key: "systemic_signs_joint",
    title: "Joint systemic signs",
    items: [
      ["general_fatigue", "General fatigue"],
      ["fever", "Fever"],
      ["multiple_joints", "Multiple joints"],
      ["autoimmune_diagnosis", "Autoimmune diagnosis"],
      ["steroid_DMARD_use", "Steroid / DMARD use"]
    ]
  },
  {
    key: "adrenal_fatigue_signs",
    title: "Pelvic / Shaoyin vertical signs",
    items: [
      ["mental_overdrive", "Mental overdrive"],
      ["insomnia", "Insomnia"],
      ["cold_lower_limbs", "Cold lower limbs"],
      ["pelvic_congestion", "Pelvic congestion"],
      ["fatigue", "Fatigue"],
      ["eye_strain", "Eye strain"]
    ]
  },
  {
    key: "neurogenic_claudication_signs",
    title: "Neurogenic claudication signs",
    items: [
      ["improves_with_flexion", "Improves sitting / flexion"],
      ["bilateral_leg_symptoms", "Bilateral/asymmetric leg symptoms"],
      ["Du_tightness", "Du line tightness"],
      ["perineal_discomfort", "Perineal discomfort"],
      ["symptom_modifiable_by_posture_breath_emotion", "Modifiable by posture/breath/emotion"]
    ]
  },
  {
    key: "vascular_claudication_signs",
    title: "Vascular claudication signs",
    items: [
      ["calf_thigh_buttock_cramping", "Calf/thigh/buttock cramping"],
      ["predictable_walking_distance", "Predictable walking distance"],
      ["resolves_quickly_with_rest", "Quick rest relief"],
      ["atherosclerosis_endothelial_signs", "Atherosclerosis / endothelial signs"]
    ]
  },
  {
    key: "EZ_field_collapse_signs",
    title: "Spinal / EZ field signs",
    items: [
      ["cold_lower_limbs", "Cold lower limbs"],
      ["mental_overthinking", "Mental overthinking"],
      ["Du_meridian_tightness", "Du meridian tightness"],
      ["posture_breath_modifiable_symptoms", "Posture/breath modifiable symptoms"]
    ]
  },
  {
    key: "NSMBP_features",
    title: "Non-specific back-pain features",
    items: [
      ["imaging_mismatch", "Imaging mismatch"],
      ["post_acute_persistence", "Post-acute persistence"],
      ["shifting_pain", "Shifting pain"],
      ["non_dermatomal_radiation", "Non-dermatomal radiation"],
      ["morning_stiffness_fascia", "Morning stiffness"],
      ["emotional_overlay", "Emotional overlay"]
    ]
  },
  {
    key: "shaoyin_disconnection_signs",
    title: "Shaoyin disconnection signs",
    items: [
      ["insomnia", "Insomnia"],
      ["palpitations", "Palpitations"],
      ["anxiety_with_fatigue", "Anxiety with fatigue"],
      ["upper_heat_lower_cold", "Upper heat + lower cold"]
    ]
  }
];

const headacheSafetyFlags = [
  ["thunderclap_headache", "Thunderclap headache"],
  ["new_neurological_deficit", "New neurological deficit"],
  ["red_flag_present", "Other red flag present"],
  ["cancer_active", "Active cancer"],
  ["post_chemo_window", "Post-chemo window"],
  ["gut_flare_active", "Active gut flare"],
  ["gi_symptoms_present", "GI symptoms present"],
  ["gi_link", "GI timing link"],
  ["digestive_sensitivity", "Digestive sensitivity"],
  ["frailty", "Low resilience / frailty"],
  ["acute_headache_episode", "Acute headache episode"],
  ["acute_gi_fever_inflammation", "Acute GI fever / inflammation"],
  ["isolated_traumatic_neck_pain", "Isolated traumatic neck pain"],
  ["purely_mechanical_injury", "Purely mechanical injury"],
  ["rapidly_progressive_weakness", "Rapidly progressive weakness"],
  ["bowel_bladder_dysfunction", "Bowel / bladder dysfunction"],
  ["saddle_anaesthesia", "Saddle anaesthesia"],
  ["acute_limb_ischemia", "Possible acute limb ischemia"],
  ["severe_infection", "Severe infection signs"],
  ["unexplained_systemic_illness", "Unexplained systemic illness"],
  ["acute_vascular_compromise", "Possible acute vascular compromise"]
];

const headacheAdvancedFlags = [
  ["internal_audit", "Internal audit mode"],
  ["emotional_constraint", "Cellular recovery stress marker"],
  ["ProImmunoR_requested", "ProImmunoR requested"],
  ["multiple_adaptogens_stacking", "Multiple adaptogens stacking"],
  ["glutathione_initiated", "Glutathione initiated"],
  ["EZ_stabilisation_not_done", "EZ preparation not completed"],
  ["laser_eligibility_check", "Laser eligibility check"],
  ["instability_present", "Instability present"],
  ["radiculopathy_present", "Radiculopathy present"],
  ["cold_signs", "Cold signs"],
  ["heat_signs", "Heat signs"],
  ["gepant_use", "Gepant use"],
  ["aura_present", "Aura present"],
  ["photophobia", "Photophobia"],
  ["phonophobia", "Phonophobia"],
  ["cold_extremities", "Cold extremities"],
  ["weather_sensitive", "Weather sensitive"],
  ["neck_movement_worsens", "Neck movement worsens"],
  ["cgrp_in_use", "CGRP inhibitor in use"],
  ["tca_snri_in_use", "TCA/SNRI in use"],
  ["antipsychotic_pain_use", "Off-label antipsychotic for pain"],
  ["collagen_worsened", "Collagen worsened symptoms"],
  ["dry_component_in_formula", "Dry component in formula"],
  ["joint_heat_swelling", "Joint heat / swelling"],
  ["evening_worsening", "Evening worsening"],
  ["stiffness_replaces_burning", "Stiffness replaces burning"],
  ["movement_improves_joint", "Movement improves joint"],
  ["pain_empty_not_inflamed", "Pain feels empty / not inflamed"],
  ["warming_agents_worsened", "Warming agents worsened"],
  ["exercise_worsened", "Exercise worsened"],
  ["increasing_medication_doses_required", "Increasing medication doses required"],
  ["effect_duration_shortening", "Medication effect shortening"],
  ["side_effects_increasing", "Side effects increasing"],
  ["new_gi_fatigue_brain_fog", "New GI / fatigue / brain fog"],
  ["system_capacity_known", "System capacity assessed"],
  ["system_capacity_can_process_load", "System can process load"],
  ["cgrp_step1_complete", "CGRP support step 1 complete"],
  ["cgrp_no_rebound", "No CGRP rebound"],
  ["cgrp_step2_complete", "CGRP support step 2 complete"],
  ["cgrp_severe_uncontrolled", "Severe uncontrolled migraine"],
  ["cgrp_qol_impairment", "Quality-of-life impairment"],
  ["cgrp_patient_feels_unsafe", "Patient feels unsafe"],
  ["ginger_tea_prescribed", "Ginger tea in plan"],
  ["neuropathy_noise_reduced", "Neuropathy noise reduced"],
  ["neuropathy_flow_improved", "Neuropathy flow improved"],
  ["joint_hot_swollen_systemic_illness", "Hot swollen joint + systemic illness"],
  ["pelvic_pain_present", "Pelvic pain present"],
  ["vertical_dissociation_pattern", "Vertical cold-heat dissociation"],
  ["low_back_pain", "Low back pain"],
  ["pelvic_NSAID_prescribed", "NSAID pelvic context"],
  ["pelvic_hormonal_therapy_prescribed", "Hormonal pelvic context"],
  ["pelvic_warming_herbs_only", "Warming herbs only pelvic context"],
  ["steroid_injection_pelvic_spinal", "Steroid injection pelvic/spinal"]
];

const shaoyangClusterItems = [
  ["migraine", "Migraine"],
  ["TMJ", "TMJ"],
  ["intercostal_neuralgia", "Intercostal neuralgia"],
  ["hip_pain", "Hip pain"],
  ["meralgia", "Meralgia"],
  ["knee_pain", "Knee pain"],
  ["ankle_pain", "Ankle pain"],
  ["bursitis", "Bursitis"]
];

const redFlagTypes = [
  ["thunderclap", "Thunderclap onset"],
  ["neuro_deficit", "Neurological deficit"],
  ["papilloedema", "Papilloedema"],
  ["neck_stiffness", "Neck stiffness"],
  ["immunocompromised", "Immunocompromised"],
  ["fever_weight_loss", "Fever / weight loss"],
  ["new_over_50", "New headache age >50"],
  ["progressive", "Progressive worsening"],
  ["head_trauma", "Recent head trauma"],
  ["exertional", "Exertional headache"]
];

const gepantSideEffects = [
  ["nausea", "Nausea"],
  ["fatigue", "Fatigue"],
  ["constipation", "Constipation"]
];

const cgrpSideEffects = [
  ["constipation", "Constipation"],
  ["fatigue", "Fatigue"],
  ["flat_affect", "Flat affect"],
  ["reduced_tolerance", "Reduced tolerance"],
  ["GI_worsening", "GI worsening"],
  ["quieter_not_better", "Quieter but not better"]
];

const archInitialInput = {
  pain_location_cranial: [],
  cranial_symptoms: [],
  dominant_arch_module: "unknown",
  visceral_trigger_cranial: [],
  post_surgical_history: [],
  autonomic_signs_cranial: [],
  thyroid_dysfunction_present: false,
  thyroid_co_patterns: [],
  CRPS_arm_present: false,
  stellate_block_effective: false,
  vagus_stimulation_effective: false,
  SCM_trigger_present: false,
  symptom_modulated_by_posture_breath_emotion: false,
  laser_available: false,
  laser_wavelength_available: [],
  hashimoto_present: false,
  neck_pain_present: false,
  facial_pain_present: false,
  internal_audit: false
};

const archFieldGroups = [
  {
    key: "dominant_arch_module",
    label: "Dominant arch module",
    options: [
      ["ARCH_1_CN_V", "Arch 1 / CN V", "Trigeminus / Shaoyang cranial gate"],
      ["ARCH_2_CN_VII", "Arch 2 / CN VII", "Facialis / Shaoyin autonomic buffer"],
      ["ARCH_3_CN_IX", "Arch 3 / CN IX", "Glossopharyngeus / Ren Mai block"],
      ["ARCH_4_6_CN_X", "Arch 4-6 / CN X", "Vagus cardio-aortic / mediastinal gate"],
      ["mixed", "Mixed", "Multiple modules may oscillate"],
      ["unknown", "Unknown", "Let the engine infer"]
    ]
  }
];

const archMultiGroups = [
  {
    key: "pain_location_cranial",
    title: "Cranio-thoracic territory",
    items: [
      ["temporal", "Temporal"],
      ["periorbital", "Periorbital / cluster region"],
      ["facial", "Facial"],
      ["retroauricular", "Behind ear"],
      ["occipital", "Occipital"],
      ["throat_radiating", "Throat-radiating"],
      ["chest_concurrent", "Chest concurrent"],
      ["SCM_trigger", "SCM trigger"]
    ]
  },
  {
    key: "cranial_symptoms",
    title: "Cranial and field symptoms",
    items: [
      ["trigeminal_neuralgia", "Trigeminal neuralgia"],
      ["cluster_headache", "Cluster headache"],
      ["temporal_migraine", "Temporal migraine"],
      ["occipital_migraine", "Occipital migraine"],
      ["glossopharyngeal_neuralgia", "Glossopharyngeal neuralgia"],
      ["bell_palsy_features", "Bell's palsy features"],
      ["dizziness", "Dizziness"],
      ["headache", "Headache"],
      ["migraine", "Migraine"],
      ["swallowing_pain", "Swallowing pain"],
      ["mediastinal_pressure", "Mediastinal pressure"],
      ["anxiety", "Anxiety"],
      ["hashimoto", "Hashimoto context"]
    ]
  },
  {
    key: "visceral_trigger_cranial",
    title: "Visceral trigger corridor",
    items: [
      ["reflux_hiatus", "Reflux / hiatus"],
      ["hepatic_tension", "Hepatic tension"],
      ["carotid_irritation", "Carotid irritation"],
      ["vagus_symp_imbalance", "Vagus-sympathetic imbalance"],
      ["epigastric_tension", "Epigastric tension"],
      ["IBS", "IBS"],
      ["biliary_dysregulation", "Biliary dysregulation"],
      ["palpitations", "Palpitations"],
      ["thyroid_distortion", "Thyroid distortion"],
      ["mediastinal_adhesion", "Mediastinal adhesion"],
      ["cardiac_arrhythmia", "Cardiac arrhythmia"],
      ["pulmonary_congestion", "Pulmonary congestion"],
      ["pericardial_tension", "Pericardial tension"]
    ]
  },
  {
    key: "post_surgical_history",
    title: "Surgical history",
    items: [
      ["thoracotomy", "Thoracotomy"],
      ["sternotomy", "Sternotomy"],
      ["cervical_surgery", "Cervical surgery"],
      ["none", "None"]
    ]
  },
  {
    key: "autonomic_signs_cranial",
    title: "Autonomic signs",
    items: [
      ["lacrimation_mismatch", "Dry eye / tearing mismatch"],
      ["dry_mouth", "Dry mouth"],
      ["hot_cold_facial_asymmetry", "Hot-cold facial asymmetry"],
      ["palpitations", "Palpitations"],
      ["BP_fluctuation_with_headache", "BP-linked headache"],
      ["POTS_features", "POTS features"],
      ["arrhythmia", "Arrhythmia"]
    ]
  },
  {
    key: "thyroid_co_patterns",
    title: "Thyroid co-patterns",
    items: [
      ["TMJ_concurrent", "TMJ concurrent"],
      ["neck_fascia_tension", "Neck fascia tension"],
      ["sternum_symptoms", "Sternum symptoms"],
      ["vagus_tone_change", "Vagus tone change"],
      ["globus", "Globus"]
    ]
  },
  {
    key: "laser_wavelength_available",
    title: "Laser wavelength available",
    items: [
      ["808nm", "808 nm"],
      ["830nm", "830 nm"],
      ["980nm", "980 nm"],
      ["other", "Other"]
    ]
  }
];

const archFlags = [
  ["thyroid_dysfunction_present", "Thyroid dysfunction present"],
  ["hashimoto_present", "Hashimoto context"],
  ["CRPS_arm_present", "Arm CRPS present"],
  ["stellate_block_effective", "Stellate block helped"],
  ["vagus_stimulation_effective", "Vagus stimulation helped"],
  ["SCM_trigger_present", "SCM trigger present"],
  ["neck_pain_present", "Neck pain present"],
  ["facial_pain_present", "Facial pain present"],
  ["symptom_modulated_by_posture_breath_emotion", "Modulated by posture / breath / emotion"],
  ["laser_available", "Laser available"],
  ["internal_audit", "Internal audit mode"]
];

const verticalInitialInput = {
  wound_healing_status: "",
  pain_character: [],
  pain_timeline: "",
  transition_sensitivity: false,
  guarding_present: false,
  collapse_present: false,
  red_flags: [],
  thermal_state: "",
  moisture_state: "",
  energy_state: "",
  digestive_sensitivity: false,
  frailty: false,
  prolapse_present: false,
  ligament_instability: false,
  pes_planus: false,
  headache_type: "uncertain",
  heat_sensation: false,
  dryness: false,
  Qi_collapse: false,
  stagnation_level: "none",
  cold_dominance: false,
  digestive_weakness_dominant: false,
  system_rigidity: "none",
  adaptivity_intact: false,
  phase_current: "none",
  phase_1_complete: false,
  pain_partially_resolved: false,
  phase_2_complete: false,
  guarding_reduced: false,
  ginger_requested: false,
  dry_component_confirmed: false,
  device_selected: [],
  upper_compensation_signs: [],
  debugMode: false
};

const verticalTextFields = [
  {
    key: "pain_timeline",
    label: "Pain timeline",
    placeholder: "Example: 8 weeks, 3 months, chronic"
  }
];

const verticalFieldGroups = [
  {
    key: "wound_healing_status",
    label: "Tissue / wound status",
    options: [
      ["healed", "Healed", "Structure appears healed but symptoms continue"],
      ["partial", "Partial", "Recovery is still incomplete"],
      ["not_healed", "Not healed", "Healing is still active"],
      ["unknown", "Unknown", "Not sure"]
    ]
  },
  {
    key: "thermal_state",
    label: "Thermal state",
    options: [
      ["heat_dominant", "Heat dominant", "Burning, hot, reactive"],
      ["cold_dominant", "Cold dominant", "Cold, weak, slow recovery"],
      ["mixed", "Mixed", "Heat above or cold below pattern"],
      ["neutral", "Neutral", "No clear thermal direction"]
    ]
  },
  {
    key: "moisture_state",
    label: "Moisture state",
    options: [
      ["dry", "Dry", "Dryness or depleted fluids"],
      ["damp", "Damp", "Heavy, boggy, slow-clearing"],
      ["normal", "Neutral", "No clear moisture pattern"]
    ]
  },
  {
    key: "energy_state",
    label: "Energy state",
    options: [
      ["deficient", "Deficient", "Low reserve"],
      ["collapsed", "Collapsed", "Exhausted or hypotonic"],
      ["excess", "Overactive", "Wired or reactive"],
      ["normal", "Stable", "No clear energy issue"]
    ]
  },
  {
    key: "headache_type",
    label: "Headache / upper-pole pattern",
    options: [
      ["migraine", "Migraine-like", "Upper-pole compensation possible"],
      ["tension", "Tension-like", "Neck/eye/holding strain"],
      ["cluster", "Cluster-like", "Stronger cranial gate overlay"],
      ["acute_structural", "Acute structural", "Needs medical distinction"],
      ["inflammatory_lesion", "Inflammatory lesion", "Needs medical distinction"],
      ["uncertain", "Uncertain", "Not sure"]
    ]
  },
  {
    key: "stagnation_level",
    label: "Stagnation level",
    options: [
      ["none", "None", "No clear stagnation"],
      ["mild", "Mild", "Some stuckness"],
      ["strong", "Strong", "Marked stagnation or congestion"]
    ]
  },
  {
    key: "system_rigidity",
    label: "System rigidity",
    options: [
      ["none", "None", "Responsive and changeable"],
      ["mild", "Mild", "Still adaptable"],
      ["moderate", "Moderate", "Less responsive"],
      ["severe", "Severe", "Very rigid or calcified-feeling"]
    ]
  },
  {
    key: "phase_current",
    label: "Current phase",
    options: [
      ["1", "Phase 1", "calm_the_gate"],
      ["2", "Phase 2", "restore_flow"],
      ["3", "Phase 3", "reintegration"],
      ["none", "Let engine infer", "No phase selected"]
    ]
  }
];

const verticalMultiGroups = [
  {
    key: "pain_character",
    title: "Pain character",
    items: [
      ["burning", "Burning"],
      ["pulling", "Pulling"],
      ["deep_aching", "Deep aching"],
      ["fixed", "Fixed"],
      ["moving", "Moving"],
      ["diffuse", "Diffuse"],
      ["oscillating", "Oscillating / wave-like"]
    ]
  },
  {
    key: "upper_compensation_signs",
    title: "Upper-pole / Shaoyang compensation signs",
    items: [
      ["migraine", "Migraine"],
      ["headache", "Headache"],
      ["neck_tension", "Neck tension"],
      ["eye_pressure", "Eye pressure"],
      ["sensory_hypersensitivity", "Light/noise sensitivity"],
      ["si_joint_dysfunction", "SI joint dysfunction"],
      ["knee_ligament_instability", "Knee ligament instability"],
      ["cervical_fascia_tension", "Cervical fascia tension"],
      ["lateral_fascial_tightness", "Lateral fascial tightness"],
      ["scar_line_discomfort", "Scar-line discomfort"],
      ["partial_analgesic_response", "Partial but short-lived analgesic response"]
    ]
  },
  {
    key: "device_selected",
    title: "Device layer selected",
    items: [
      ["Whieda_insole", "Whieda insole"],
      ["THZ_cell_activator", "THZ / cell activator"],
      ["Summus", "Summus laser"]
    ]
  },
  {
    key: "red_flags",
    title: "Red flags",
    items: [
      ["fever", "Fever"],
      ["acute_neuro_deficit", "Acute neurological deficit"],
      ["DVT_PE", "DVT/PE signs"],
      ["mechanical_tear", "Mechanical tear or rapid deterioration"]
    ],
    safety: true
  }
];

const verticalFlags = [
  ["transition_sensitivity", "Transition-sensitive pain"],
  ["guarding_present", "Guarding / rigidity present"],
  ["collapse_present", "Collapse present"],
  ["pes_planus", "Pes planus / flat foot"],
  ["prolapse_present", "Prolapse tendency"],
  ["ligament_instability", "Ligament instability"],
  ["Qi_collapse", "Qi collapse / hypotonia"],
  ["heat_sensation", "Heat sensation"],
  ["dryness", "Dryness"],
  ["cold_dominance", "Cold dominance"],
  ["digestive_weakness_dominant", "Digestive weakness dominant"],
  ["digestive_sensitivity", "Digestive sensitivity"],
  ["frailty", "Frailty"],
  ["adaptivity_intact", "Adaptivity intact"],
  ["phase_1_complete", "Phase 1 complete"],
  ["pain_partially_resolved", "Pain partially resolved"],
  ["phase_2_complete", "Phase 2 complete"],
  ["guarding_reduced", "Guarding reduced"],
  ["ginger_requested", "Ginger requested"],
  ["dry_component_confirmed", "Dry component confirmed"],
  ["debugMode", "Debug mode"]
];

const spinalInitialInput = {
  pain_location: "",
  pain_quality: "",
  pain_type: "",
  load_position_dependence: "",
  EZ_state: "",
  EZ_continuity: false,
  western_diagnosis: "",
  current_medications: [],
  treatment_response: "",
  imaging_findings: "",
  steroid_response_history: "",
  ligament_tone: "",
  core_question_result: "",
  visceral_organ_feedback: "none",
  phase_current: 1,
  failure_mode_score_disc: 0,
  failure_mode_score_stasis: 0,
  failure_mode_score_neurogenic: 0,
  failure_mode_score_deep_ligament: 0,
  spinal_features: [],
  requested_interventions: [],
  morning_stiffness: false,
  cold_lower_back: false,
  leg_numbness: false,
  fatigue_dominant: false,
  poor_sleep: false,
  night_pain: false,
  instability_sensation: false,
  instability_sensation_reduced: false,
  clicking_popping: false,
  pain_unpredictability: false,
  pain_unpredictability_reduced: false,
  systemic_laxity_signs: false,
  cold_extremities: false,
  bloating_food_intolerance: false,
  hypothyroid: false,
  adrenal_fatigue: false,
  postpartum: false,
  liver_yang_rising: false,
  organ_instability: false,
  dermatomal_spread: false,
  neurological_deficit: false,
  improvement_not_sustained: false,
  flow_support_present: false,
  collagen_prescribed: false,
  steroid_prescribed: false,
  aggressive_stimulation: false,
  acute_nerve_pain: false,
  stretching_prescribed: false,
  early_mobilisation: false,
  treating_disc_only: false,
  treating_radiculopathy_nerve_only: false,
  local_tenderness: false,
  postural_strain: false,
  post_surgical_scarring: false,
  stiffness_greater_than_pain: false,
  no_large_herniation: false,
  sacrum_treated: false,
  occiput_released: false,
  fascia_released: false,
  disc_stability_at_reassessment: "",
  nerve_pain_at_reassessment: "",
  debugMode: false
};

const spinalFieldGroups = [
  {
    key: "pain_location",
    label: "Pain location",
    options: [
      ["neck", "Neck", "Cervical region"],
      ["upper_back", "Upper back", "Thoracic region"],
      ["lower_back", "Lower back", "Lumbar/sacral region"],
      ["radiating_arm", "Radiating arm", "Arm radiation"],
      ["radiating_leg", "Radiating leg", "Leg radiation"],
      ["cranial", "Cranial", "Head/craniosacral continuity"]
    ]
  },
  {
    key: "pain_quality",
    label: "Pain quality",
    options: [
      ["dull_deep_ache", "Dull deep ache", "Structural or ligament layer"],
      ["sharp_with_movement", "Sharp with movement", "Load or segmental trigger"],
      ["electric_shooting", "Electric / shooting", "Neurogenic signal"],
      ["stiffness_tightness", "Stiffness / tightness", "Stasis or guarding"],
      ["burning", "Burning", "Nerve or hydration layer"],
      ["diffuse_uncertain", "Diffuse / uncertain", "Mixed or ligament layer"]
    ]
  },
  {
    key: "pain_type",
    label: "Pain type",
    options: [
      ["intermittent", "Intermittent", "Hydration layer may remain connected"],
      ["mixed", "Mixed", "Partial fragmentation model"],
      ["continuous_neuropathic", "Continuous neuropathic", "Chronic nerve-type state"],
      ["acute_nerve", "Acute nerve", "Stimulation-sensitive nerve pain"]
    ]
  },
  {
    key: "load_position_dependence",
    label: "Load / position behavior",
    options: [
      ["worse_sitting", "Worse sitting", "Stasis or ligament loading"],
      ["worse_standing", "Worse standing", "Segmental holding stress"],
      ["worse_bending", "Worse bending", "Mechanical loading"],
      ["relieved_movement", "Relieved by movement", "Disc/stasis improvement signal"],
      ["relieved_lying", "Relieved lying down", "Structural support signal"]
    ]
  },
  {
    key: "EZ_state",
    label: "Hydration layer state",
    options: [
      ["continuous", "Continuous", "Acute/subacute"],
      ["partially_fragmented", "Partially fragmented", "Subchronic"],
      ["fragmented", "Fragmented", "Chronic Yin-deficiency model"],
      ["not_assessed", "Not assessed", "Unknown"]
    ]
  },
  {
    key: "western_diagnosis",
    label: "Conventional context",
    options: [
      ["disc_bulge_herniation", "Disc bulge/herniation", "Disc plus neurogenic check"],
      ["degenerative_disc_disease", "Degenerative disc disease", "Disc matrix axis"],
      ["spinal_stenosis", "Spinal stenosis", "Neurogenic axis"],
      ["post_surgical_spine", "Post-surgical spine", "Stasis / gate overlay"],
      ["spondylosis", "Spondylosis", "Deep ligament axis"],
      ["facet_pain", "Facet pain", "Capsulo-ligamentous reclassification"],
      ["non_specific", "Non-specific", "Run all axes"],
      ["radiculopathy", "Radiculopathy", "Neurogenic plus ligament check"],
      ["CRPS", "CRPS", "DRG / hydration overlay"]
    ]
  },
  {
    key: "imaging_findings",
    label: "Imaging finding",
    options: [
      ["herniation", "Herniation", "Disc / nerve context"],
      ["bulge", "Bulge", "Disc context"],
      ["spondylosis_osteophytes", "Spondylosis / osteophytes", "Ligament load context"],
      ["disc_height_loss", "Disc height loss", "Disc + ligament context"],
      ["facet_degeneration", "Facet degeneration", "Capsulo-ligamentous context"],
      ["stenosis", "Stenosis", "Neurogenic context"],
      ["normal", "Normal", "Functional failure-mode check"],
      ["none", "None", "No imaging available"]
    ]
  },
  {
    key: "ligament_tone",
    label: "Ligament tone",
    options: [
      ["hypertonic", "Hypertonic", "Holding too much"],
      ["hypotonic", "Hypotonic", "Cannot hold"],
      ["mixed", "Mixed", "Weak structure with guarding"],
      ["unknown", "Unknown", "Let engine infer"]
    ]
  },
  {
    key: "core_question_result",
    label: "Core holding question",
    options: [
      ["cannot_hold", "Cannot hold", "Yin-type / hypotonic"],
      ["holding_too_much", "Holding too much", "Yang-type / hypertonic"],
      ["mixed", "Mixed", "Build first, move later"],
      ["unknown", "Unknown", "Let engine infer"]
    ]
  },
  {
    key: "visceral_organ_feedback",
    label: "Visceral feedback",
    options: [
      ["HT", "Heart", "Palpitations / red tip / sleep"],
      ["LU", "Lung", "Chest or breath-linked"],
      ["LV", "Liver", "Heat/headache/tension"],
      ["KD", "Kidney", "Lower back/cold/fatigue"],
      ["none", "None", "No clear organ feedback"]
    ]
  }
];

const spinalMultiGroups = [
  {
    key: "current_medications",
    title: "Current medications",
    items: [
      ["NSAIDs", "NSAIDs"],
      ["muscle_relaxants", "Muscle relaxants"],
      ["gabapentin_pregabalin", "Gabapentin / pregabalin"],
      ["opioids", "Opioids"],
      ["steroids", "Steroids"],
      ["none", "None"]
    ]
  },
  {
    key: "requested_interventions",
    title: "Requested or planned supports",
    items: [
      ["collagen", "Collagen"],
      ["flow_support", "Microcirculatory flow support"],
      ["equivalent_flow_support", "Equivalent flow support"],
      ["steroid", "Steroid / block"],
      ["stretching", "Stretching"],
      ["early_mobilisation", "Early mobilisation"]
    ]
  },
  {
    key: "spinal_features",
    title: "Spinal and systemic features",
    items: [
      ["morning_stiffness", "Morning stiffness"],
      ["end_day_fatigue", "End-day fatigue"],
      ["local_tenderness", "Local tenderness"],
      ["postural_strain", "Postural strain"],
      ["post_surgical_scarring", "Post-surgical scarring"],
      ["varicose_veins", "Varicose veins"],
      ["prolapse", "Prolapse"],
      ["haemorrhoids", "Haemorrhoids"],
      ["oedema", "Oedema"],
      ["adrenal_fatigue", "Adrenal fatigue"],
      ["postpartum", "Postpartum"]
    ]
  }
];

const spinalFlags = [
  ["EZ_continuity", "Hydration continuity intact"],
  ["morning_stiffness", "Morning stiffness"],
  ["cold_lower_back", "Cold lower back"],
  ["leg_numbness", "Leg numbness"],
  ["fatigue_dominant", "Fatigue dominant"],
  ["poor_sleep", "Poor sleep"],
  ["night_pain", "Night pain"],
  ["instability_sensation", "Instability sensation"],
  ["instability_sensation_reduced", "Instability reduced at reassessment"],
  ["clicking_popping", "Clicking / popping"],
  ["pain_unpredictability", "Pain unpredictability"],
  ["pain_unpredictability_reduced", "Unpredictability reduced"],
  ["systemic_laxity_signs", "Systemic laxity signs"],
  ["cold_extremities", "Cold extremities"],
  ["bloating_food_intolerance", "Bloating / food intolerance"],
  ["hypothyroid", "Hypothyroid context"],
  ["adrenal_fatigue", "Adrenal fatigue"],
  ["postpartum", "Postpartum"],
  ["liver_yang_rising", "Liver Yang signs"],
  ["organ_instability", "Organ instability"],
  ["dermatomal_spread", "Dermatomal spread"],
  ["neurological_deficit", "Neurological deficit"],
  ["improvement_not_sustained", "Improvement not sustained"],
  ["flow_support_present", "Flow support present"],
  ["collagen_prescribed", "Collagen planned"],
  ["steroid_prescribed", "Steroid / block planned"],
  ["aggressive_stimulation", "Aggressive stimulation planned"],
  ["acute_nerve_pain", "Acute nerve pain"],
  ["stretching_prescribed", "Stretching planned"],
  ["early_mobilisation", "Early mobilisation planned"],
  ["treating_disc_only", "Treating as disc-only"],
  ["treating_radiculopathy_nerve_only", "Treating radiculopathy as nerve-only"],
  ["local_tenderness", "Local tenderness"],
  ["postural_strain", "Postural strain"],
  ["post_surgical_scarring", "Post-surgical scarring"],
  ["stiffness_greater_than_pain", "Stiffness greater than pain"],
  ["no_large_herniation", "No large herniation"],
  ["sacrum_treated", "Sacrum treated"],
  ["occiput_released", "Occiput released"],
  ["fascia_released", "Fascia released"],
  ["debugMode", "Debug mode"]
];

const spinalScoreFields = [
  ["failure_mode_score_disc", "Axis A: disc dehydration"],
  ["failure_mode_score_stasis", "Axis B: stasis / fascia"],
  ["failure_mode_score_neurogenic", "Axis C: neurogenic overload"],
  ["failure_mode_score_deep_ligament", "Axis D: deep ligament"]
];

const spinalReassessmentGroups = [
  {
    key: "disc_stability_at_reassessment",
    label: "Disc stability at 14-28 days",
    options: [
      ["improved", "Improved", "Gradual load return"],
      ["unchanged", "Unchanged", "Continue support"],
      ["worsened", "Worsened", "Reassess safety and load"]
    ]
  },
  {
    key: "nerve_pain_at_reassessment",
    label: "Nerve pain at 14-28 days",
    options: [
      ["reduced", "Reduced", "Taper noise reduction, maintain membrane protection"],
      ["unchanged", "Unchanged", "Continue membrane protection"],
      ["worsened", "Worsened", "Reassess safety and load"]
    ]
  }
];

const shaoyinInitialInput = {
  western_diagnosis_group: "other",
  patient_sex: "other",
  patient_sensitivity: "unknown",
  taiyang_layer_state: "mixed",
  qi_relay_blocked_at: "none",
  EZ_state: "not_assessed",
  skin_eruption: "none",
  shaoyin_freeze: false,
  taiyang_expansion: false,
  pericardial_lock: false,
  HT_Yin_weak: false,
  KD_Yin_weak: false,
  KD_Yang_weak: false,
  Jing_deficient: false,
  SI_overloaded: false,
  BL_congested: false,
  heat_above: false,
  cold_below: false,
  diastolic_dysfunction: false,
  posterior_fossa_congestion: false,
  blood_sludging: false,
  venous_stasis: false,
  ankle_oedema: false,
  emotional_trauma: false,
  emotional_closure: false,
  insomnia_rumination: false,
  sensory_hypersensitivity: false,
  frozen_shoulder: false,
  occipital_tension: false,
  eye_fatigue: false,
  tinnitus: false,
  dizziness: false,
  chest_tightness: false,
  palpitations: false,
  oliguria: false,
  cold_feet: false,
  decision_difficulty: false,
  irritability: false,
  neck_shoulder_scapula_tension: false,
  low_back_pain: false,
  spinal_pain: false,
  heart_heat: false,
  tongue_red_tip: false,
  urinary_complaint: false,
  urinary_obstruction: false,
  sterile_haematuria: false,
  urethral_discomfort: false,
  thirst: false,
  lower_abdominal_heat: false,
  frailty: false,
  severe_yin_deficient: false,
  du_huo_prescribed: false,
  qiang_huo_prescribed: false,
  taiyang_opening_needed: false,
  bai_zhi_selected: false,
  suan_zao_ren_tang_primary: false,
  sacrum_treatment: false,
  occiput_release: false,
  posterior_fascia_release: false,
  obese_oedematous_archetype: false,
  adrenal_fatigue: false,
  headache: false,
  debugMode: false
};

const shaoyinFieldGroups = [
  {
    key: "western_diagnosis_group",
    label: "Downstream clinical context",
    options: [
      ["IIH", "IIH", "Posterior fossa / pressure context"],
      ["PRESS", "PRESS", "Posterior reversible encephalopathy context"],
      ["Chiari", "Chiari-like", "Posterior fossa pressure"],
      ["POTS", "POTS", "Autonomic instability"],
      ["fibromyalgia", "Fibromyalgia", "Distributed pain/fatigue"],
      ["migraine", "Migraine", "Headache migration context"],
      ["CRPS", "CRPS", "Non-local pain pattern"],
      ["post_COVID", "Post-COVID", "Post-viral fatigue/autonomic context"],
      ["posterior_fossa_congestion", "Posterior fossa", "Venous/pressure field"],
      ["frozen_shoulder", "Frozen shoulder", "SI/Taiyang shoulder axis"],
      ["spinal_degenerative", "Spinal degenerative", "BL/dura-paraspinal overload"],
      ["skin_autoimmune", "Skin autoimmune", "Surface inflammation"],
      ["autonomic", "Autonomic", "Instability / sleep / rhythm"],
      ["other", "Other", "No listed context"]
    ]
  },
  {
    key: "patient_sensitivity",
    label: "Sensitivity state",
    options: [
      ["Yin_deficient", "Yin deficient", "Dry/sensitive/depleted"],
      ["cold_weak", "Cold weak", "Cold and low reserve"],
      ["robust", "Robust", "Can tolerate movement better"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "patient_sex",
    label: "Sex context",
    options: [
      ["female", "Female", "Taiyang mover safety gate"],
      ["male", "Male", "Safety gate context"],
      ["other", "Other", "Safety gate context"]
    ]
  },
  {
    key: "taiyang_layer_state",
    label: "Taiyang layer state",
    options: [
      ["full_tense", "Full and tense", "Optional mover only if robust"],
      ["lax_empty", "Lax / empty", "Do not push surface"],
      ["mixed", "Mixed", "Default cautious state"]
    ]
  },
  {
    key: "qi_relay_blocked_at",
    label: "Likely relay block",
    options: [
      ["HT_SI", "HT -> SI", "Heart to differentiation gate"],
      ["SI_BL", "SI -> BL", "Sensory to posterior shell"],
      ["BL_KD", "BL -> KD", "Surface cannot return to depth"],
      ["KD_PC", "KD -> PC", "Depth cannot reopen chest field"],
      ["multiple", "Multiple", "Several relay blocks"],
      ["none", "Infer", "Let engine infer"]
    ]
  },
  {
    key: "EZ_state",
    label: "EZ / hydration state",
    options: [
      ["continuous", "Continuous", "Acute/subacute"],
      ["partially_fragmented", "Partially fragmented", "Subchronic"],
      ["fragmented", "Fragmented", "Chronic Yin-deficiency model"],
      ["not_assessed", "Not assessed", "Unknown"]
    ]
  },
  {
    key: "skin_eruption",
    label: "Skin / surface expression",
    options: [
      ["eczema", "Eczema", "Surface decompression screen"],
      ["psoriasis", "Psoriasis", "Surface decompression screen"],
      ["seborrhea", "Seborrhea", "Surface decompression screen"],
      ["urticaria", "Urticaria", "Surface reactivity"],
      ["none", "None", "No skin expression"]
    ]
  }
];

const shaoyinScreenFlags = [
  ["heat_above", "Head heat / upper heat"],
  ["occipital_tension", "Occipital pressure / tension"],
  ["eye_fatigue", "Eye fatigue"],
  ["chest_tightness", "Chest closure"],
  ["palpitations", "Palpitations"],
  ["insomnia_rumination", "Rumination insomnia"],
  ["ankle_oedema", "Ankle oedema"],
  ["oliguria", "Reduced urination"],
  ["cold_feet", "Cold feet"],
  ["irritability", "Irritability + fatigue"],
  ["sensory_hypersensitivity", "Hypersensitivity"],
  ["decision_difficulty", "Decision difficulty"],
  ["neck_shoulder_scapula_tension", "Neck-shoulder-scapula tension"],
  ["frozen_shoulder", "Frozen shoulder pattern"],
  ["low_back_pain", "Low back pain"],
  ["spinal_pain", "Spinal pain"]
];

const shaoyinAdvancedFlags = [
  ["shaoyin_freeze", "Shaoyin freeze"],
  ["taiyang_expansion", "Taiyang expansion"],
  ["pericardial_lock", "Pericardial lock"],
  ["HT_Yin_weak", "HT Yin weak"],
  ["KD_Yin_weak", "KD Yin weak"],
  ["KD_Yang_weak", "KD Yang weak"],
  ["Jing_deficient", "Jing deficient"],
  ["SI_overloaded", "SI overloaded"],
  ["BL_congested", "BL congested"],
  ["cold_below", "Cold below"],
  ["diastolic_dysfunction", "Diastolic rigidity / dysfunction"],
  ["posterior_fossa_congestion", "Posterior fossa congestion"],
  ["blood_sludging", "Blood sludging"],
  ["venous_stasis", "Venous stasis"],
  ["emotional_closure", "Chest closure / autonomic holding"],
  ["heart_heat", "Heart heat"],
  ["tongue_red_tip", "Red tongue tip"],
  ["urinary_complaint", "Urinary complaint"],
  ["urinary_obstruction", "Urinary obstruction"],
  ["sterile_haematuria", "Sterile haematuria"],
  ["urethral_discomfort", "Urethral discomfort"],
  ["thirst", "Thirst"],
  ["lower_abdominal_heat", "Lower abdominal heat"],
  ["frailty", "Frailty"],
  ["severe_yin_deficient", "Severe Yin deficiency"],
  ["du_huo_prescribed", "Du Huo selected"],
  ["qiang_huo_prescribed", "Qiang Huo selected"],
  ["taiyang_opening_needed", "Taiyang opening needed"],
  ["bai_zhi_selected", "Bai Zhi selected"],
  ["suan_zao_ren_tang_primary", "Suan Zao Ren Tang primary"],
  ["sacrum_treatment", "Sacrum treatment"],
  ["occiput_release", "Occiput release"],
  ["posterior_fascia_release", "Posterior fascia release"],
  ["obese_oedematous_archetype", "Oedematous cold-fatigue headache archetype"],
  ["adrenal_fatigue", "Adrenal fatigue"],
  ["headache", "Headache"],
  ["debugMode", "Debug mode"]
];

const taiyangInitialInput = {
  systemMode: "integrative-neutral",
  thermal_state_lower_body: "unknown",
  thermal_state_surface: "unknown",
  sleep_quality: "unknown",
  autonomic_state: "unknown",
  emotional_integration: "unknown",
  shaoyin_fire_status: "unknown",
  stability_state: "unknown",
  skin_reactivity: "unknown",
  symptoms: [],
  posterior_tension: false,
  tension_worsens_with_stress_cold_or_overstimulation: true,
  edema_present: false,
  cranial_pressure: false,
  acute_cranial_pressure: false,
  venous_stasis: false,
  urinary_difficulty: false,
  heavy_legs: false,
  cold_lower_body: false,
  tight_surface: false,
  poor_sleep: false,
  panic_attacks: false,
  sensory_overload: false,
  trauma_history: false,
  hyperarousal: false,
  impaired_emotional_integration: false,
  heat_signs: false,
  immune_hyperreactivity: false,
  allergy: false,
  internal_pump_weakness: false,
  varicosities: false,
  venous_insufficiency: false,
  disc_protrusion_pattern: false,
  sleep_improved: false,
  internal_warmth_returning: false,
  active_panic_or_dissociation: false,
  acute_migraine_active: false,
  fresh_trauma: false,
  severe_shaoyin_depletion: false,
  psychotic_state: false,
  severe_IIH_symptoms: false,
  derealization_active: false,
  intervention_documentation_required: false,
  debugMode: false
};

const taiyangFieldGroups = [
  {
    key: "systemMode",
    label: "Output language mode",
    options: [
      ["integrative-neutral", "Integrative neutral", "Posterior shell, fluid regulation, autonomic reactivity"],
      ["TCM", "TCM terminology", "Taiyang / Shaoyin / BL / SI language in advanced context"]
    ]
  },
  {
    key: "thermal_state_lower_body",
    label: "Lower-body thermal state",
    options: [
      ["cold", "Cold", "Cold feet or lower-body cold"],
      ["normal", "Normal", "No strong lower cold"],
      ["heat", "Heat", "Lower-body heat signs"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "thermal_state_surface",
    label: "Posterior surface state",
    options: [
      ["dry_tight", "Dry-tight", "Tense, tight, dry-feeling surface"],
      ["tight", "Tight", "Surface held in alert tone"],
      ["heat", "Heat", "Skin/immune heat expression"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "sleep_quality",
    label: "Sleep quality",
    options: [
      ["poor", "Poor", "Insomnia, hyperarousal, unrested"],
      ["improving", "Improving", "Stabilising after support"],
      ["good", "Good", "Sleep not a major driver"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "shaoyin_fire_status",
    label: "Internal warmth / Shaoyin fire",
    options: [
      ["deficient", "Deficient", "Low internal warmth, poor settling"],
      ["severely_deficient", "Severely depleted", "Herbs first, laser blocked/delayed"],
      ["adequate", "Adequate", "No clear warmth deficiency"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "stability_state",
    label: "System stability",
    options: [
      ["stable", "Stable", "Can tolerate gentle next layer"],
      ["reactive", "Reactive", "Needs calming first"],
      ["unstable", "Unstable", "Avoid device escalation"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "skin_reactivity",
    label: "Skin / surface reactivity",
    options: [
      ["high", "High", "Urticaria, eczema, allergy, sensory reactivity"],
      ["moderate", "Moderate", "Some reactivity"],
      ["low", "Low", "Not prominent"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "autonomic_state",
    label: "Autonomic state",
    options: [
      ["hyperarousal", "Hyperarousal", "Panic, alertness, overstimulation"],
      ["settled", "Settled", "No active overdrive"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "emotional_integration",
    label: "Integration state",
    options: [
      ["impaired", "Impaired", "Reactivity or incomplete integration signal"],
      ["intact", "Intact", "No clear integration block"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  }
];

const taiyangSymptomItems = [
  ["tension_headache", "Tension headache"],
  ["occipital_neuralgia", "Occipital neuralgia"],
  ["cervicogenic_headache", "Cervicogenic headache"],
  ["trapezius_tightness", "Trapezius tightness"],
  ["myofascial_pain", "Myofascial pain"],
  ["frozen_shoulder", "Frozen shoulder"],
  ["posterior_fossa_congestion", "Posterior fossa pressure"],
  ["iih_like", "IIH-like pressure"],
  ["chiari_like", "Chiari-like pressure"],
  ["urinary_difficulty", "Urinary difficulty"],
  ["heavy_legs", "Heavy legs"],
  ["eczema", "Eczema"],
  ["psoriasis", "Psoriasis"],
  ["urticaria", "Urticaria"],
  ["hay_fever", "Hay fever / allergy"],
  ["varicosities", "Varicosities"],
  ["venous_insufficiency", "Venous insufficiency"],
  ["disc_protrusion", "Disc protrusion pattern"]
];

const taiyangBranchFlags = [
  ["posterior_tension", "Posterior tension"],
  ["tension_worsens_with_stress_cold_or_overstimulation", "Worse with stress/cold/overstimulation"],
  ["edema_present", "Oedema present"],
  ["cranial_pressure", "Cranial pressure"],
  ["acute_cranial_pressure", "Acute cranial pressure"],
  ["venous_stasis", "Venous stasis"],
  ["urinary_difficulty", "Urinary difficulty"],
  ["heavy_legs", "Heavy legs"],
  ["cold_lower_body", "Cold lower body"],
  ["tight_surface", "Tight posterior surface"],
  ["poor_sleep", "Poor sleep"],
  ["panic_attacks", "Panic attacks"],
  ["sensory_overload", "Sensory overload"],
  ["trauma_history", "Trauma history"],
  ["hyperarousal", "Hyperarousal"],
  ["impaired_emotional_integration", "Impaired emotional integration"],
  ["heat_signs", "Heat signs"],
  ["immune_hyperreactivity", "Immune hyperreactivity"],
  ["allergy", "Allergy"],
  ["internal_pump_weakness", "Weak internal pump"],
  ["varicosities", "Varicosities"],
  ["venous_insufficiency", "Venous insufficiency"],
  ["disc_protrusion_pattern", "Disc protrusion pattern"],
  ["sleep_improved", "Sleep improved"],
  ["internal_warmth_returning", "Internal warmth returning"]
];

const taiyangSafetyFlags = [
  ["active_panic_or_dissociation", "Active panic or dissociation"],
  ["acute_migraine_active", "Acute migraine"],
  ["fresh_trauma", "Fresh trauma"],
  ["severe_shaoyin_depletion", "Severe Shaoyin depletion"],
  ["psychotic_state", "Psychotic state"],
  ["severe_IIH_symptoms", "Severe IIH symptoms"],
  ["derealization_active", "Derealisation active"],
  ["intervention_documentation_required", "Formal documentation needed"],
  ["debugMode", "Debug mode"]
];

const DAMP_COLD_YOUTUBE_ID = "ImpMLWzXdIM";
const DAMP_COLD_YOUTUBE_URL = `https://youtu.be/${DAMP_COLD_YOUTUBE_ID}`;
const DAMP_COLD_YOUTUBE_EMBED =
  `https://www.youtube-nocookie.com/embed/${DAMP_COLD_YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${DAMP_COLD_YOUTUBE_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;
const DAMP_HEAT_YOUTUBE_ID = "uzDIVfpVBNI";
const DAMP_HEAT_YOUTUBE_URL = `https://youtu.be/${DAMP_HEAT_YOUTUBE_ID}`;
const DAMP_HEAT_YOUTUBE_EMBED =
  `https://www.youtube-nocookie.com/embed/${DAMP_HEAT_YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${DAMP_HEAT_YOUTUBE_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;
const DRY_COLD_YOUTUBE_ID = "PekqIFDvagU";
const DRY_COLD_YOUTUBE_URL = `https://youtu.be/${DRY_COLD_YOUTUBE_ID}`;
const DRY_COLD_YOUTUBE_EMBED =
  `https://www.youtube-nocookie.com/embed/${DRY_COLD_YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${DRY_COLD_YOUTUBE_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;
const DRY_HEAT_YOUTUBE_ID = "mO-b_CEx5X8";
const DRY_HEAT_YOUTUBE_URL = `https://youtu.be/${DRY_HEAT_YOUTUBE_ID}`;
const DRY_HEAT_YOUTUBE_EMBED =
  `https://www.youtube-nocookie.com/embed/${DRY_HEAT_YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${DRY_HEAT_YOUTUBE_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;
const TENSION_RELEASE_YOUTUBE_ID = "3jI6X8e2J18";
const TENSION_RELEASE_YOUTUBE_URL = `https://youtu.be/${TENSION_RELEASE_YOUTUBE_ID}`;
const TENSION_RELEASE_YOUTUBE_EMBED =
  `https://www.youtube-nocookie.com/embed/${TENSION_RELEASE_YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${TENSION_RELEASE_YOUTUBE_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;

const transitionInitialInput = {
  systemMode: "patient",
  headache_quality: "",
  headache_laterality: "",
  headache_frequency_days_per_month: "",
  trauma_role: "none",
  germ_layer_dominance: "unknown",
  autonomic_state: "unknown",
  pain_topology: "",
  lateral_MSK_tension: "unknown",
  visceral_sensitivity: "unknown",
  emotional_survival_axis_features: "unknown",
  stability_state: "unknown",
  symptoms: [],
  neuropathic_descriptors: [],
  nausea_present: false,
  vomiting_present: false,
  photophobia_present: false,
  phonophobia_present: false,
  aggravated_by_activity: false,
  red_flag_present: false,
  yin_depletion_signs: false,
  heat_signs: false,
  heat_toxicity_overlay: false,
  persistent_tension: false,
  yin_support_fails: false,
  exertional_intolerance: false,
  orthostatic_symptoms: false,
  pelvic_autonomic_symptoms: false,
  medication_overuse_present: false,
  trauma_roles_treated_static: false,
  pain_syndromes_primary_keys: false
};

const transitionFieldGroups = [
  {
    key: "systemMode",
    label: "Output mode",
    options: [
      ["patient", "Patient", "Plain educational explanation"],
      ["clinician", "Clinician", "Axis scores, transitions, rules, module links"]
    ]
  },
  {
    key: "headache_quality",
    label: "Headache quality",
    options: [
      ["pressing", "Pressing", "Static pressure quality"],
      ["tightening", "Tightening", "Tension-type quality"],
      ["pulsating", "Pulsating", "Migraine / vessel tendency"],
      ["burning", "Burning", "Neurovascular or neuropathic tendency"],
      ["none", "None", "No headache quality selected"]
    ]
  },
  {
    key: "headache_laterality",
    label: "Headache laterality",
    options: [
      ["bilateral", "Bilateral", "TTH-compatible"],
      ["unilateral", "Unilateral", "Migraine / vascular tendency"],
      ["variable", "Variable", "Mixed or shifting pattern"],
      ["none", "None", "Not assessed"]
    ]
  },
  {
    key: "trauma_role",
    label: "Current role enum",
    options: [
      ["none", "None", "No role pattern selected"],
      ["victim", "Victim", "Inwardly absorbed load, freeze/exhaustion"],
      ["savior", "Savior", "Over-holding, sustained control"],
      ["perpetrator", "Perpetrator", "Externalised load, fight/discharge"]
    ]
  },
  {
    key: "germ_layer_dominance",
    label: "Germ-layer tendency",
    options: [
      ["ectoderm", "Ectoderm", "Sensory / neural load"],
      ["mesoderm", "Mesoderm", "Fascia / vascular / musculoskeletal load"],
      ["endoderm", "Endoderm", "Metabolic / visceral load"],
      ["unknown", "Unknown", "Let engine infer from symptoms"]
    ]
  },
  {
    key: "autonomic_state",
    label: "Autonomic state",
    options: [
      ["freeze", "Freeze", "Inward holding"],
      ["collapse", "Collapse", "Low capacity / exhaustion"],
      ["maintain", "Maintain", "Sustained control"],
      ["hyperarousal", "Hyperarousal", "Spike / overactivation"],
      ["discharge", "Discharge", "Externalised fight state"],
      ["panic", "Panic", "Survival-axis activation"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "pain_topology",
    label: "Pain topology",
    options: [
      ["posterior_neck_shoulder", "Posterior neck/shoulder", "Taiyang / mechanical-fascial"],
      ["lateral_msk", "Lateral MSK", "Shaoyang / lateral autonomic"],
      ["anterior_wall", "Anterior wall", "Yangming / metabolic-anterior"],
      ["whole_body", "Whole body", "Central amplification tendency"],
      ["pelvic_autonomic", "Pelvic autonomic", "Jueyin / Shaoyin overlap"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "lateral_MSK_tension",
    label: "Lateral MSK tension",
    options: [
      ["high", "High", "Lateral antenna overload"],
      ["moderate", "Moderate", "Some lateral tension"],
      ["low", "Low", "Not prominent"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "visceral_sensitivity",
    label: "Visceral sensitivity",
    options: [
      ["high", "High", "IBS, bloating, interoceptive load"],
      ["moderate", "Moderate", "Some visceral sensitivity"],
      ["low", "Low", "Not prominent"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  },
  {
    key: "emotional_survival_axis_features",
    label: "Survival-axis features",
    options: [
      ["high", "High", "Palpitations, panic, survival activation"],
      ["moderate", "Moderate", "Some survival-axis load"],
      ["low", "Low", "Not prominent"],
      ["unknown", "Unknown", "Not assessed"]
    ]
  }
];

const transitionSymptomItems = [
  ["tth", "TTH / tension headache"],
  ["migraine", "Migraine"],
  ["aura", "Aura"],
  ["neck_shoulder_pain", "Neck/shoulder pain"],
  ["low_back_pain", "Low back pain"],
  ["myofascial_pain", "Myofascial pain"],
  ["tmj", "TMJ"],
  ["fibromyalgia", "Fibromyalgia"],
  ["cfs", "CFS / chronic fatigue"],
  ["ibs", "IBS"],
  ["bloating", "Bloating"],
  ["panic", "Panic"],
  ["palpitations", "Palpitations"],
  ["sensory_overload", "Sensory overload"],
  ["crps", "CRPS"],
  ["pelvic_autonomic_pain", "Pelvic autonomic pain"],
  ["metabolic_pain", "Metabolic pain"],
  ["vascular_congestion", "Vascular congestion"]
];

const transitionNeuropathicItems = [
  ["burning", "Burning"],
  ["electric", "Electric"],
  ["allodynia", "Allodynia"],
  ["neuropathic", "Neuropathic descriptors"],
  ["crps", "CRPS descriptor"]
];

const transitionFlags = [
  ["nausea_present", "Nausea"],
  ["vomiting_present", "Vomiting"],
  ["photophobia_present", "Photophobia"],
  ["phonophobia_present", "Phonophobia"],
  ["aggravated_by_activity", "Aggravated by activity"],
  ["yin_depletion_signs", "Yin depletion signs"],
  ["heat_signs", "Heat signs"],
  ["heat_toxicity_overlay", "Heat toxicity overlay"],
  ["persistent_tension", "Persistent tension"],
  ["yin_support_fails", "Yin support fails"],
  ["exertional_intolerance", "Exertional intolerance"],
  ["orthostatic_symptoms", "Orthostatic symptoms"],
  ["pelvic_autonomic_symptoms", "Pelvic autonomic symptoms"],
  ["medication_overuse_present", "Medication overuse risk"]
];

const transitionSafetyFlags = [
  ["red_flag_present", "Red flag present"],
  ["trauma_roles_treated_static", "Reject: static trauma role"],
  ["pain_syndromes_primary_keys", "Reject: pain syndrome as primary key"]
];

const platformInitialInput = {
  system_output_mode: "front_end",
  instability_type: "",
  root_branch_assessment: "",
  system_priority: "",
  branch_direction: "",
  traditional_content_referenced: false,
  clinician_requests_upload: false,
  case_free_text_only: false,
  case_plausibility_score: "",
  data_completeness_score: ""
};

const platformFieldGroups = [
  {
    key: "instability_type",
    label: "Where is the primary instability?",
    options: [
      ["energy_deficiency", "Energy deficiency", "Low reserve, slow recovery, depletion"],
      ["overheating", "Overheating", "Heat, flares, irritability, inflammatory tone"],
      ["dryness", "Dryness", "Dry tissue, low hydration, rebuilding need"],
      ["stagnation", "Stagnation", "Blocked movement, heaviness, pressure"],
      ["neural_overload", "Neural overload", "Sensory load, pain amplification, autonomic noise"]
    ]
  },
  {
    key: "root_branch_assessment",
    label: "What is root, what is branch?",
    options: [
      ["internal_reserves_weak", "Internal reserves weak", "Support before surface intervention"],
      ["exit_pathway_impaired", "Exit pathway impaired", "Ventilation / drainage before rebuilding"],
      ["trauma_active", "Trauma active", "Hyperreactivity overlay and stimulation caution"]
    ]
  },
  {
    key: "system_priority",
    label: "Which system can help most right now?",
    options: [
      ["medication", "Medication", "Conventional care or medication review"],
      ["herbal", "Herbal", "Plant-based support under clinician guidance"],
      ["lifestyle", "Lifestyle", "Sleep, pacing, rhythm, movement"],
      ["nutrition", "Nutrition", "Nutritional and supplement support"],
      ["nervous_system_reset", "Nervous system reset", "Breath, bodywork, device or regulation input"]
    ]
  }
];

const platformAdvancedFlags = [
  ["traditional_content_referenced", "Traditional content referenced"],
  ["clinician_requests_upload", "Clinician case upload"],
  ["case_free_text_only", "Case is free text only"]
];

const triAxialInitialInput = {
  module_focus: "headache",
  output_mode: "patient",
  grid_state: "",
  headache_character: "",
  aura_duration_minutes: "",
  age: "",
  formula_selected: "",
  laser_target: "",
  vitamin_D_supplementation: "",
  symptoms: [],
  headache_features: [],
  autonomic_signs: [],
  metabolic_features: [],
  requested_interventions: [],
  autonomic_signs_present: false,
  aura_present: false,
  visual_aura: false,
  sensory_march: false,
  pressure_pattern: false,
  valsalva_worse: false,
  papilloedema_present: false,
  severe_valsava_worsening: false,
  first_aura_over_50: false,
  motor_aura: false,
  thunderclap_headache: false,
  neuro_deficit: false,
  fever_meningism: false,
  pregnancy_postpartum_severe_headache: false,
  new_onset_over_50: false,
  cancer_immunosuppression: false,
  progressive_worsening: false,
  exertional_valsava_new_pattern: false,
  electric_shock_pain: false,
  brief_attacks: false,
  trigger_zones: false,
  background_concomitant_pain: false,
  continuous_trigeminal_pain: false,
  secondary_tgn_suspected: false,
  neuroimaging_done: false,
  carbamazepine_current: false,
  carbamazepine_taper_requested: false,
  shaoyang_release_stable: false,
  yin_support_stable: false,
  herb_formula_starting: false,
  nigella_selected: false,
  central_weight_gain: false,
  fatigue: false,
  low_back_stiffness: false,
  poor_sleep: false,
  concentration_decline: false,
  stress_dominance: false,
  early_insulin_resistance: false,
  advanced_metabolic_disease: false,
  structural_abdominal_wall_defect: false,
  lab_confirmation: false,
  lab_guided_addon_requested: false,
  supplement_selected_without_lab: false,
  positioning_language: ""
};

const triAxialFieldGroups = [
  {
    key: "module_focus",
    label: "Batch 17 module",
    options: [
      ["headache", "Headache tri-axial", "TaiYang / ShaoYang / YangMing routing"],
      ["tgn", "Trigeminal neuralgia", "Dedicated TGN safety and transition logic"],
      ["metabolic", "Metabolic rhythm", "Circadian and autonomic restoration entry"],
      ["auto", "Connected view", "Evaluate all connected modules"]
    ]
  },
  {
    key: "output_mode",
    label: "Output mode",
    options: [
      ["patient", "Patient", "Plain educational explanation"],
      ["practitioner", "Practitioner", "Axis, grid, formula, laser and rule trace"]
    ]
  },
  {
    key: "grid_state",
    label: "Grid state",
    options: [
      ["", "Infer", "Let the engine infer from the pattern"],
      ["continuous_grid", "Continuous grid", "Pressure, sustained discharge, fluid overload"],
      ["fragmented_grid", "Fragmented grid", "Aura, sparking edges, episodic instability"]
    ]
  },
  {
    key: "headache_character",
    label: "Pain character",
    options: [
      ["throbbing", "Throbbing", "Migraine / ShaoYang rhythm signal"],
      ["pressure", "Pressure", "TaiYang pressure-fluid pattern"],
      ["sharp_electrical", "Sharp electrical", "TGN / Yin support signal"],
      ["pressing_or_migrating", "Pressing / migrating", "Shaoyang ventilation signal"],
      ["none", "None", "No dominant pain character"]
    ]
  },
  {
    key: "vitamin_D_supplementation",
    label: "Vitamin D context",
    options: [
      ["", "Not assessed", "No Vitamin D rule applied"],
      ["moderate", "Moderate", "Moderate dosing only"],
      ["high_dose", "High dose", "May worsen neural over-tension"]
    ]
  }
];

const triAxialHeadacheFlags = [
  ["autonomic_signs_present", "Autonomic signs"],
  ["aura_present", "Aura"],
  ["visual_aura", "Visual aura"],
  ["sensory_march", "Sensory march"],
  ["pressure_pattern", "Pressure / occipital pattern"],
  ["valsalva_worse", "Valsalva worse"],
  ["severe_valsava_worsening", "Severe Valsalva worsening"],
  ["papilloedema_present", "Papilloedema"],
  ["first_aura_over_50", "First aura over 50"],
  ["motor_aura", "Motor aura"],
  ["anti_inflammatory_only_selected", "Anti-inflammatory only selected"],
  ["vasodilator_selected", "Vasodilator selected"]
];

const triAxialAutonomicItems = [
  ["tearing", "Tearing"],
  ["rhinorrhea", "Rhinorrhea"],
  ["ptosis", "Ptosis"],
  ["miosis", "Miosis"],
  ["restlessness", "Restlessness"],
  ["circadian", "Circadian / seasonal pattern"]
];

const triAxialRedFlags = [
  ["thunderclap_headache", "Thunderclap headache"],
  ["neuro_deficit", "New neurological deficit"],
  ["fever_meningism", "Fever + meningism"],
  ["pregnancy_postpartum_severe_headache", "Pregnancy/postpartum severe headache"],
  ["new_onset_over_50", "New onset over 50"],
  ["cancer_immunosuppression", "Cancer/immunosuppression"],
  ["progressive_worsening", "Progressive worsening"],
  ["exertional_valsava_new_pattern", "New exertional/Valsalva pattern"]
];

const triAxialTgnFlags = [
  ["electric_shock_pain", "Electric shock pain"],
  ["brief_attacks", "Brief attacks"],
  ["trigger_zones", "Trigger zones"],
  ["background_concomitant_pain", "Background pain"],
  ["continuous_trigeminal_pain", "Continuous trigeminal pain"],
  ["secondary_tgn_suspected", "Secondary TGN suspected"],
  ["neuroimaging_done", "Neuroimaging done"],
  ["carbamazepine_current", "Carbamazepine current"],
  ["carbamazepine_taper_requested", "Taper requested"],
  ["shaoyang_release_stable", "Shaoyang release stable"],
  ["yin_support_stable", "Yin support stable"],
  ["herb_formula_starting", "Herbal support starting"],
  ["nigella_selected", "Nigella selected"]
];

const triAxialMetabolicFlags = [
  ["central_weight_gain", "Central weight gain"],
  ["fatigue", "Fatigue"],
  ["low_back_stiffness", "Low back stiffness"],
  ["poor_sleep", "Poor sleep"],
  ["concentration_decline", "Concentration decline"],
  ["stress_dominance", "Stress dominance"],
  ["early_insulin_resistance", "Early insulin resistance"],
  ["advanced_metabolic_disease", "Advanced metabolic disease"],
  ["structural_abdominal_wall_defect", "Structural abdominal wall defect"],
  ["lab_confirmation", "Lab indication present"],
  ["lab_guided_addon_requested", "Lab-guided add-on requested"],
  ["supplement_selected_without_lab", "Supplement selected without labs"]
];

const treatmentClusterInitialInput = {
  system_mode: "integrative-neutral",
  functional_axis_primary: "LAX",
  functional_axis_secondary: "",
  pain_laterality: "",
  diagnosis: "",
  crps_phase: "",
  failed_treatments: "",
  pressure_sensitivity: false,
  post_meal_flare: false,
  chest_tightness_noncardiac: false,
  panic_or_palpitations: false,
  burning_neuropathy: false,
  pelvic_pain_chronic: false,
  widespread_pain: false,
  multi_system_features: false,
  multiple_prior_failed_treatments: false,
  frailty: false,
  digestive_sensitivity: false,
  emotional_constraint: false,
  overweight: false,
  internal_cold_sensation: false,
  adjunctive_pharmacology_considered: false,
  generate_pdf_summary: false
};

const treatmentClusterFieldGroups = [
  {
    key: "system_mode",
    label: "Output mode",
    options: [
      ["integrative-neutral", "Integrative-neutral", "Cluster and modality categories only"],
      ["TCM", "Practitioner TCM", "Adds axis pairs without exposing backend maps"],
      ["internal-audit", "Internal audit", "Shows rule trace, internal tags, and couplings"]
    ]
  },
  {
    key: "functional_axis_primary",
    label: "Primary functional axis",
    options: [
      ["LAX", "LAX", "Lateral autonomic dysfunction"],
      ["PSA", "PSA", "Posterior sensory overload"],
      ["AMA", "AMA", "Anterior metabolic imbalance"],
      ["MIA", "MIA", "Midline interoceptive dysregulation"],
      ["SVA", "SVA", "Survival axis instability"],
      ["DAV", "DAV", "Deep autonomic-vascular dysregulation"],
      ["CIA", "CIA", "Central integration failure"]
    ]
  },
  {
    key: "functional_axis_secondary",
    label: "Secondary functional axis",
    options: [
      ["", "Infer / adjacent", "Use the closest adjacent axis if none is clear"],
      ["LAX", "LAX", "Lateral autonomic dysfunction"],
      ["PSA", "PSA", "Posterior sensory overload"],
      ["AMA", "AMA", "Anterior metabolic imbalance"],
      ["MIA", "MIA", "Midline interoceptive dysregulation"],
      ["SVA", "SVA", "Survival axis instability"],
      ["DAV", "DAV", "Deep autonomic-vascular dysregulation"],
      ["CIA", "CIA", "Central integration failure"]
    ]
  },
  {
    key: "pain_laterality",
    label: "Laterality",
    options: [
      ["", "Not specified", "No laterality rule"],
      ["unilateral", "Unilateral", "Supports lateral autonomic routing"],
      ["bilateral", "Bilateral", "No LAX unilateral rule"]
    ]
  },
  {
    key: "crps_phase",
    label: "CRPS phase",
    options: [
      ["", "Not relevant", "No CRPS phase rule"],
      ["I", "Phase I", "Routes toward LAX"],
      ["II", "Phase II", "Routes toward DAV"],
      ["III", "Phase III", "Routes toward DAV"]
    ]
  }
];

const treatmentClusterFlags = [
  ["pressure_sensitivity", "Pressure sensitivity"],
  ["post_meal_flare", "Post-meal flare"],
  ["chest_tightness_noncardiac", "Non-cardiac chest tightness"],
  ["panic_or_palpitations", "Panic or palpitations"],
  ["burning_neuropathy", "Burning neuropathy"],
  ["pelvic_pain_chronic", "Chronic pelvic pain"],
  ["widespread_pain", "Widespread pain"],
  ["multi_system_features", "Multi-system central features"],
  ["multiple_prior_failed_treatments", "At least 2 failed treatments"],
  ["overweight", "Overweight / posterior load"],
  ["internal_cold_sensation", "Internal cold sensation"]
];

const treatmentClusterReviewFlags = [
  ["frailty", "Frailty"],
  ["digestive_sensitivity", "Digestive sensitivity"],
  ["emotional_constraint", "Emotional constraint"],
  ["adjunctive_pharmacology_considered", "Adjunctive pharmacology considered"],
  ["generate_pdf_summary", "Generate PDF summary flag"]
];

const biophysicalInitialInput = {
  output_mode: "patient",
  diagnosis: "",
  headache_type: "",
  cervical_level: "",
  metastasis_site: "",
  formula_components_count: "",
  formula_axis: [],
  symptom_oscillation: false,
  night_worsening: false,
  stress_sensitivity: false,
  allodynia_like_sensitivity: false,
  paradoxical_drug_response: false,
  small_trigger_disproportionate: false,
  bladder_dominant: false,
  autonomic_dysreflexia: false,
  acute_severe_hypertension: false,
  spinal_cord_emergency_features: false,
  circadian: false,
  indomethacin_responsive: false,
  oxygen_therapy: false,
  cervical_symptoms_present: false,
  hoarseness: false,
  globus: false,
  dysphagia: false,
  shoulder_tension: false,
  ascending_visceral_pressure: false,
  descending_sp_overload: false,
  phlegm_dominant: false,
  stellate_ganglion_block_considered: false,
  visceral_trigger_worsens: false,
  symptom_resolves_with_directional_change: true,
  aggressive_cervical_manipulation_considered: false,
  passive_movement_restricted: false,
  active_movement_restricted: false,
  passive_movement_available: false,
  active_movement_absent: false,
  movement_failure: "",
  neuroprotection_only: false,
  practitioner_requests_integrative_layer: false,
  western_pharmaceutical: false,
  concurrent_TCM_formula: false,
  pungent_herbs_used: false,
  Yin_support_absent: false,
  theory_reference_requested: false
};

const biophysicalFieldGroups = [
  {
    key: "output_mode",
    label: "Output mode",
    options: [
      ["patient", "Patient", "Safe educational language only"],
      ["practitioner", "Practitioner", "Shows substrate logic and safety wrappers"],
      ["internal-audit", "Internal audit", "Includes translation map and theory references"]
    ]
  },
  {
    key: "headache_type",
    label: "TAC / headache type",
    options: [
      ["", "Not assessed", "No TAC oscillator routing"],
      ["cluster", "Cluster", "Circadian/night attacks can activate cluster oscillator"],
      ["paroxysmal_hemicrania", "Paroxysmal hemicrania", "Indomethacin-responsive short attacks"],
      ["SUNCT", "SUNCT / SUNA", "Spike-like trigeminal-autonomic attacks"],
      ["hemicrania_continua", "Hemicrania continua", "Continuous unilateral oscillator"]
    ]
  },
  {
    key: "cervical_level",
    label: "Cervical level",
    options: [
      ["", "Not specified", "No level theme"],
      ["C2_C3", "C2-C3", "Practitioner theme and Jie Geng guide logic"],
      ["C5_C6", "C5-C6", "Practitioner theme and Hou Po guide logic"]
    ]
  },
  {
    key: "movement_failure",
    label: "Movement failure",
    options: [
      ["", "Not assessed", "No movement subtype selected"],
      ["intermittent", "Intermittent", "Ion-phase disorder"],
      ["fixed", "Fixed", "Use active/passive movement flags to classify"]
    ]
  }
];

const biophysicalSubstrateFlags = [
  ["symptom_oscillation", "Symptoms oscillate"],
  ["night_worsening", "Night worsening"],
  ["stress_sensitivity", "Stress sensitivity"],
  ["allodynia_like_sensitivity", "Allodynia-like sensitivity"],
  ["paradoxical_drug_response", "Paradoxical drug response"],
  ["small_trigger_disproportionate", "Small trigger, large response"]
];

const biophysicalVisceralTacFlags = [
  ["bladder_dominant", "Bladder dominant"],
  ["autonomic_dysreflexia", "Autonomic dysreflexia context"],
  ["circadian", "Circadian/night attacks"],
  ["indomethacin_responsive", "Indomethacin responsive"],
  ["oxygen_therapy", "Oxygen therapy context"]
];

const biophysicalCervicalFlags = [
  ["cervical_symptoms_present", "Cervical symptoms"],
  ["hoarseness", "Hoarseness / voice fatigue"],
  ["globus", "Globus"],
  ["dysphagia", "Dysphagia"],
  ["shoulder_tension", "Shoulder-scapular tension"],
  ["ascending_visceral_pressure", "Ascending visceral pressure"],
  ["descending_sp_overload", "Descending interoceptive overload"],
  ["phlegm_dominant", "Phlegm / heaviness dominant"],
  ["stellate_ganglion_block_considered", "SGB considered"],
  ["visceral_trigger_worsens", "Visceral triggers worsen symptoms"],
  ["aggressive_cervical_manipulation_considered", "Aggressive cervical manipulation considered"]
];

const biophysicalMovementFlags = [
  ["passive_movement_restricted", "Passive movement restricted"],
  ["active_movement_restricted", "Active movement restricted"],
  ["passive_movement_available", "Passive movement available"],
  ["active_movement_absent", "Active movement absent"],
  ["neuroprotection_only", "Neuroprotection-only strategy"]
];

const biophysicalSafetyFlags = [
  ["acute_severe_hypertension", "Acute severe hypertension"],
  ["spinal_cord_emergency_features", "Spinal cord emergency features"],
  ["practitioner_requests_integrative_layer", "Practitioner oncology meaning-layer request"],
  ["western_pharmaceutical", "Western pharmaceutical in use"],
  ["concurrent_TCM_formula", "Concurrent formula"],
  ["pungent_herbs_used", "Pungent herbs used"],
  ["Yin_support_absent", "Yin support absent"],
  ["theory_reference_requested", "Internal theory reference requested"]
];

const biophysicalFormulaAxes = [
  ["base", "Base"],
  ["direction", "Direction"],
  ["guide", "Guide"],
  ["extra_axis", "Extra axis"]
];

const cranialRezInitialInput = {
  output_mode: "patient",
  diagnosis: "",
  cranial_nerve_affected: "",
  pain_character: "",
  pain_onset_duration_months: "",
  EZ_continuity_state: "",
  MRI_finding: "",
  intervention_type_considered: "",
  paroxysmal_electric_pain: false,
  no_baseline_pain: false,
  paroxysms: false,
  persistent_ache: false,
  continuous_burning_pain: false,
  no_paroxysms: false,
  allergic_boundary_overload: false,
  headache: false,
  visual_blurring: false,
  tinnitus: false,
  papilledema: false,
  IIH_confirmed: false,
  PRES_confirmed: false,
  spinal_radicular: false,
  onset_under_3_months: false,
  duration_over_6_months: false,
  EZ_continuous_signs: false,
  EZ_fragmented_signs: false,
  burning_mechanical_pain: false,
  morning_stiffness_improves: false,
  MRI_oedema: false,
  hydration_rest_response: false,
  gentle_decompression_response: false,
  nocturnal_pain: false,
  autonomic_dysfunction_present: false,
  deep_cold_sensation: false,
  paradoxical_flare_after_steroids: false,
  multi_segment_involvement: false,
  MRI_collapse_or_atrophy: false,
  cervical_tension: false,
  thoracic_stiffness: false,
  lumbar_stenosis: false,
  scoliosis: false,
  dural_continuity_impaired: false,
  organ_dysfunction_present: false,
  organ_trauma_history: false,
  shu_mu_segment: "",
  chronic_pain: false,
  multi_system: false,
  craniosacral_indication: false,
  pulsed_RF_considered: false,
  ablative_RF_considered: false
};

const cranialRezFieldGroups = [
  {
    key: "output_mode",
    label: "Output mode",
    options: [
      ["patient", "Patient", "Safe educational language only"],
      ["clinician", "Clinician", "PPP triad, steroid prediction, propagation map"],
      ["internal-audit", "Internal audit", "Includes internal theory references"]
    ]
  },
  {
    key: "cranial_nerve_affected",
    label: "Cranial nerve",
    options: [
      ["", "Infer", "Infer from diagnosis or symptoms"],
      ["CN II", "CN II", "Optic"],
      ["CN V", "CN V", "Trigeminal"],
      ["CN VII", "CN VII", "Facial"],
      ["CN VIII", "CN VIII", "Vestibulocochlear"],
      ["CN IX", "CN IX", "Glossopharyngeal"],
      ["CN X", "CN X", "Vagus"]
    ]
  },
  {
    key: "EZ_continuity_state",
    label: "Matrix continuity",
    options: [
      ["", "Not assessed", "Let clinical signs drive prediction"],
      ["continuous", "Continuous", "Disrupted but still responsive"],
      ["fragmented", "Fragmented", "Chronic discontinuity / steroid-resistant profile"]
    ]
  },
  {
    key: "intervention_type_considered",
    label: "Intervention considered",
    options: [
      ["", "Not specified", "No RF rule"],
      ["pulsed_RF", "Pulsed RF", "Field-coherence restoring intervention"],
      ["ablative_RF", "Ablative RF", "Destructive signal interruption"]
    ]
  }
];

const cranialRezTnFlags = [
  ["paroxysmal_electric_pain", "Paroxysmal electric pain"],
  ["no_baseline_pain", "No baseline pain"],
  ["paroxysms", "Paroxysms"],
  ["persistent_ache", "Persistent ache"],
  ["continuous_burning_pain", "Continuous burning pain"],
  ["no_paroxysms", "No paroxysms"],
  ["allergic_boundary_overload", "Allergic boundary overload"]
];

const cranialRezPosteriorFlags = [
  ["headache", "Headache"],
  ["visual_blurring", "Visual blurring"],
  ["tinnitus", "Tinnitus"],
  ["papilledema", "Papilledema"],
  ["IIH_confirmed", "IIH confirmed"],
  ["PRES_confirmed", "PRES confirmed"]
];

const cranialRezSteroidStrongFlags = [
  ["spinal_radicular", "Spinal / radicular pain"],
  ["onset_under_3_months", "Onset under 3 months"],
  ["EZ_continuous_signs", "Continuity signs"],
  ["burning_mechanical_pain", "Burning + mechanical pain"],
  ["morning_stiffness_improves", "Morning stiffness improves"],
  ["MRI_oedema", "MRI oedema"],
  ["hydration_rest_response", "Responds to hydration/rest"],
  ["gentle_decompression_response", "Responds to gentle decompression"]
];

const cranialRezSteroidPoorFlags = [
  ["duration_over_6_months", "Duration over 6 months"],
  ["EZ_fragmented_signs", "Fragmentation signs"],
  ["nocturnal_pain", "Nocturnal pain"],
  ["autonomic_dysfunction_present", "Autonomic dysfunction"],
  ["deep_cold_sensation", "Deep cold sensation"],
  ["paradoxical_flare_after_steroids", "Paradoxical steroid flare"],
  ["multi_segment_involvement", "Multi-segment involvement"],
  ["MRI_collapse_or_atrophy", "MRI atrophy / collapse"],
  ["pulsed_RF_considered", "Pulsed RF considered"],
  ["ablative_RF_considered", "Ablative RF considered"]
];

const cranialRezDuralFlags = [
  ["cervical_tension", "Cervical tension"],
  ["thoracic_stiffness", "Thoracic stiffness"],
  ["lumbar_stenosis", "Lumbar stenosis"],
  ["scoliosis", "Scoliosis"],
  ["dural_continuity_impaired", "Dural continuity impaired"],
  ["organ_dysfunction_present", "Organ dysfunction present"],
  ["organ_trauma_history", "Organ trauma history"],
  ["chronic_pain", "Chronic pain"],
  ["multi_system", "Multi-system features"],
  ["craniosacral_indication", "Craniosacral indication"]
];

function titleCase(value) {
  return String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ToggleList({ title, items, selected, onToggle, safety }) {
  return (
    <section className="av-section">
      <h2>{title}</h2>
      <div className="av-check-grid">
        {items.map(([value, label]) => (
          <label className={safety ? "av-check av-check-safety" : "av-check"} key={value}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function ProtocolOutput({ protocol, onReset }) {
  if (!protocol) return null;

  const secondary = protocol.secondary_pattern ? ` + ${titleCase(protocol.secondary_pattern)}` : "";

  return (
    <aside className="av-output" aria-live="polite">
      <div className="av-output-header">
        <p>{titleCase(protocol.primary_pattern)}{secondary}</p>
        <strong>Formula strength: {protocol.formula_strength}</strong>
      </div>

      <section>
        <h2>Your formula</h2>
        <div className="av-ingredients">
          {protocol.ingredients.map((ingredient) => (
            <div className="av-ingredient" key={`${ingredient.name}-${ingredient.role}`}>
              <strong>{ingredient.name}</strong>
              <span>{ingredient.amount}</span>
              <small>{ingredient.role}</small>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Preparation</h2>
        <p>{protocol.preparation}</p>
        <p className="av-muted">Timing: {protocol.timing}</p>
      </section>

      <TagSection title="What this supports" items={protocol.field_effects} tone="effect" />
      <TagSection title="Adjustments applied" items={protocol.modifications_applied} tone="mod" />
      <TagSection title="Avoid for now" items={protocol.avoid} tone="avoid" empty="None" />

      {protocol.safety_notes.length > 0 && (
        <section className="av-safety-box">
          <h2>Safety notes</h2>
          {protocol.safety_notes.map((note) => <p key={note}>{note}</p>)}
        </section>
      )}

      {protocol.follow_up_questions.length > 0 && (
        <section>
          <h2>To refine further</h2>
          {protocol.follow_up_questions.map((question) => <p key={question}>{question}</p>)}
        </section>
      )}

      <p className="av-disclaimer">
        This is a wellness guide, not a medical prescription. If you have a health condition
        or take medications, check with your clinician before starting any new protocol.
      </p>

      <details className="av-debug">
        <summary>Rule trace</summary>
        {protocol.debug_trace.map((line) => <span key={line}>{line}</span>)}
      </details>

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TagSection({ title, items, tone, empty = "None" }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length ? (
        <div className="av-tags">
          {items.map((item) => <span className={`av-tag av-tag-${tone}`} key={item}>{item}</span>)}
        </div>
      ) : (
        <p className="av-muted">{empty}</p>
      )}
    </section>
  );
}

function ModeTabs({ mode, onChange }) {
  return (
    <nav className="av-mode-tabs" aria-label="Engine mode">
      <button
        className={mode === "wellness" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("wellness")}
      >
        Wellness protocol
      </button>
      <button
        className={mode === "headache" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("headache")}
      >
        Pain patterns
      </button>
      <button
        className={mode === "arch" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("arch")}
      >
        Pharyngeal gates
      </button>
      <button
        className={mode === "vertical" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("vertical")}
      >
        Vertical axis
      </button>
      <button
        className={mode === "spinal" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("spinal")}
      >
        Spinal modes
      </button>
      <button
        className={mode === "shaoyin" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("shaoyin")}
      >
        Meta pattern
      </button>
      <button
        className={mode === "taiyang" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("taiyang")}
      >
        Taiyang shell
      </button>
      <button
        className={mode === "transition" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("transition")}
      >
        Transition router
      </button>
      <button
        className={mode === "platform" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("platform")}
      >
        Platform UX
      </button>
      <button
        className={mode === "triaxial" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("triaxial")}
      >
        Tri-axial + metabolic
      </button>
      <button
        className={mode === "cluster" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("cluster")}
      >
        Treatment clusters
      </button>
      <button
        className={mode === "biophysical" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("biophysical")}
      >
        Biophysical substrate
      </button>
      <button
        className={mode === "cranial" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("cranial")}
      >
        Cranial REZ
      </button>
      <button
        className={mode === "dampCold" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("dampCold")}
      >
        Damp-Cold
      </button>
      <button
        className={mode === "dampHeat" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("dampHeat")}
      >
        Damp-Heat
      </button>
      <button
        className={mode === "dryCold" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("dryCold")}
      >
        Dry-Cold
      </button>
      <button
        className={mode === "dryHeat" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("dryHeat")}
      >
        Dry-Heat
      </button>
      <button
        className={mode === "tensionRelease" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("tensionRelease")}
      >
        Tension Release
      </button>
      <a className="av-mode-tab" href="/walkthroughs/water-colloid-fragmentation">
        Fragmentation walkthrough
      </a>
      <a className="av-mode-tab" href="/walkthroughs/signal-propagation-fragmented-media">
        Signal propagation
      </a>
      <a className="av-mode-tab" href="/walkthroughs/dampening-signal-fidelity">
        Dampening fidelity
      </a>
      <a className="av-mode-tab" href="/walkthroughs/connection-of-life-energy">
        Life energy
      </a>
      <a className="av-mode-tab" href="/walkthroughs/six-compartment-map">
        Six compartments
      </a>
      <a className="av-mode-tab" href="/walkthroughs/trigeminovascular-headache-pathways">
        Headache pathways
      </a>
      <a className="av-mode-tab" href="/walkthroughs/receptor-vs-field-responsiveness">
        Field responsiveness
      </a>
      <a className="av-mode-tab" href="/walkthroughs/receptor-to-field-responsiveness">
        Receptor to field
      </a>
      <a className="av-mode-tab" href="/walkthroughs/liver-yang-posterior-fossa">
        Liver Yang map
      </a>
      <a className="av-mode-tab" href="/walkthroughs/extended-central-sensitisation">
        Central sensitisation
      </a>
      <a className="av-mode-tab" href="/walkthroughs/visceral-fat-internal-swamp">
        Internal swamp
      </a>
      <a className="av-mode-tab" href="/walkthroughs/taiyang-shaoyin-dissociation">
        Taiyang-Shaoyin
      </a>
      <a className="av-mode-tab" href="/walkthroughs/shaoyang-jueyin-dissociation">
        Shaoyang-Jueyin
      </a>
      <a className="av-mode-tab" href="/walkthroughs/yangming-taiyin-disconnection">
        Yangming-Taiyin
      </a>
      <a className="av-mode-tab" href="/walkthroughs/lysosomotropic-agents">
        Lysosomotropic agents
      </a>
      <a className="av-mode-tab" href="/walkthroughs/dna-hydration-shell">
        DNA hydration shell
      </a>
      <a className="av-mode-tab" href="/walkthroughs/mitochondrial-hydration-shell">
        Mito hydration shell
      </a>
      <a className="av-mode-tab" href="/walkthroughs/endoplasmic-reticulum-hydration-shell">
        ER hydration shell
      </a>
      <a className="av-mode-tab" href="/walkthroughs/microtubule-hydration-shell">
        Microtubule shell
      </a>
      <a className="av-mode-tab" href="/walkthroughs/cell-membrane-hydration-shell">
        Membrane shell
      </a>
    </nav>
  );
}

function HeadacheResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;
  const axisRows = Object.entries(result.axis_scores || {});

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={result.stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{result.stopped ? "Urgent safety stop" : "Headache / migraine terrain"}</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Pattern interpretation</h2>
        <p>{patient.summary}</p>
        {result.mixed_pattern && (
          <p className="av-muted">The top two axes are close, so this is treated as a layered pattern.</p>
        )}
      </section>

      <TagSection title="Support focus" items={patient.support} tone="effect" empty="No support output while red flags are active." />
      <TagSection title="Avoid / defer" items={patient.avoid} tone="avoid" />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {patient.reassessment_prompt && (
        <section>
          <h2>Day 10-14 check-in</h2>
          <p>{patient.reassessment_prompt}</p>
        </section>
      )}

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <div className="av-axis-table">
            {axisRows.map(([axis, value]) => (
              <div className="av-axis-row" key={axis}>
                <strong>{axis.replace(/_/g, " ")}</strong>
                <span>{value.score}</span>
              </div>
            ))}
            <div className="av-axis-row">
              <strong>membrane EZ-water instability</strong>
              <span>{result.membrane_EZ_water_instability_score.score}</span>
            </div>
          </div>
          <p>Dominant pattern: {result.dominant_pattern}</p>
          <p>Matching Batch 7 pattern: {result.matching_pattern}</p>
          <p>Matching Batch 8 pattern: {result.batch8_matching_pattern || "none"}</p>
          <p>Detected phenotype: {result.migraine_phenotype?.detected_phenotype || "unknown"}</p>
          <p>GI-migraine-neck axis: {result.gi_migraine_neck_axis?.active ? result.gi_migraine_neck_axis.current_stage : result.gi_migraine_neck_axis?.excluded ? "excluded" : "not active"}</p>
          <p>Joint phase: {result.joint_phase_logic?.active ? `${result.joint_phase_logic.phase} / ${result.joint_phase_logic.goal}` : "not assessed"}</p>
          <p>CGRP support: {result.cgrp_support?.status || "not assessed"}</p>
          <p>Medication capacity: {result.medication_capacity?.status || "not assessed"} / {result.medication_capacity?.dominant_branch || "none"}</p>
          <p>Batch 9 domains: {(result.batch9_detected_domains || []).length ? result.batch9_detected_domains.join(", ") : "none"}</p>
          <p>Batch 9 patterns: {(result.batch9_matched_patterns || []).length ? result.batch9_matched_patterns.join(", ") : "none"}</p>
          <p>Neuropathy A/B/C: {result.batch9_neuropathy?.active ? `${result.batch9_neuropathy.dominant_mode} / ${JSON.stringify(result.batch9_neuropathy.percentages)}` : "not assessed"}</p>
          <p>OA/RA classifier: {result.batch9_joint_classifier?.active ? result.batch9_joint_classifier.classifier : "not assessed"}</p>
          <p>Pelvic vertical axis: {result.batch9_pelvic_shaoyin?.active ? result.batch9_pelvic_shaoyin.vertical_dissociation_status : "not assessed"}</p>
          <p>Claudication: {result.batch9_claudication?.active ? `${result.batch9_claudication.classifier} / ${result.batch9_claudication.MRI_mismatch_status}` : "not assessed"}</p>
          <p>Back-pain layer: {result.batch9_mechanical_back_pain?.active ? result.batch9_mechanical_back_pain.pattern : "not assessed"}</p>
          <p>Detected phase: {result.current_phase}</p>
          <p>Dominant layer: {result.dominant_layer}</p>
          <p>Embryological layer: {result.embryological_layer}</p>
          <p>TCM channel: {result.tcm_channel}</p>
          <p>Red flags: {result.clinician.red_flag_status.length ? result.clinician.red_flag_status.join(", ") : "none"}</p>
          <p>Vessel overlay: {result.vessel_overlay_active ? "active" : "not dominant"}</p>
          <p>Laser: {result.laser_layer_recommendation.recommendation}</p>
          <p>Berberine: {result.berberine_switch.status} - {result.berberine_switch.next_step}</p>
          <p>Shaoyang collapse cluster: {result.shaoyang_collapse_cluster.present ? result.shaoyang_collapse_cluster.signs.join(", ") : "absent"}</p>
          <TagSection title="Batch 8 triggered rules" items={(result.rules_triggered_by_id || []).map((rule) => `${rule.id}: ${rule.action}`)} tone="mod" empty="None triggered" />
          <TagSection title="Batch 9 avoid now" items={result.batch9_what_to_avoid_now || []} tone="avoid" empty="None flagged" />
          <TagSection title="Batch 9 triggered rules" items={(result.batch9_rules_triggered_by_id || []).map((rule) => `${rule.id}: ${rule.action}`)} tone="mod" empty="None triggered" />
          <section>
            <h2>Batch 8 intervention sequence</h2>
            {(result.batch8_intervention_sequence || []).length ? (
              result.batch8_intervention_sequence.map((step, index) => (
                <span key={`${step.pattern}-${step.step || index}`}>
                  {step.pattern}: {(step.items || []).join(", ")} {step.sequence_note ? `(${step.sequence_note})` : ""}
                </span>
              ))
            ) : (
              <p className="av-muted">None</p>
            )}
          </section>
          <section>
            <h2>Batch 9 intervention hierarchy</h2>
            {(result.batch9_intervention_hierarchy || []).length ? (
              result.batch9_intervention_hierarchy.map((step, index) => (
                <span key={`${step.pattern}-${step.step || index}`}>
                  {step.pattern}: {(step.items || []).join(", ")} {step.sequence_note ? `(${step.sequence_note})` : ""}
                </span>
              ))
            ) : (
              <p className="av-muted">None</p>
            )}
          </section>
          {result.batch9_pelvic_shaoyin?.shaoyin_sink_reboot_formula && (
            <section>
              <h2>Shaoyin Sink Reboot Formula</h2>
              <p>{result.batch9_pelvic_shaoyin.shaoyin_sink_reboot_formula.description}</p>
              {result.batch9_pelvic_shaoyin.shaoyin_sink_reboot_formula.composition.map((item) => (
                <span key={item.herb}>{item.herb}: {item.role}</span>
              ))}
            </section>
          )}
          {(result.batch9_field_medicine_concepts || []).length > 0 && (
            <section>
              <h2>Field medicine concepts</h2>
              {result.batch9_field_medicine_concepts.map((concept) => (
                <span key={concept.id}>{concept.id}: {concept.clinical_relevance || concept.engine_rule}</span>
              ))}
            </section>
          )}
          <TagSection title="Drug-terrain conflicts" items={result.drug_terrain_conflicts} tone="avoid" empty="None flagged" />
          <TagSection title="Contraindications" items={result.contraindications} tone="avoid" empty="None flagged" />
          <section>
            <h2>Intervention interoperability</h2>
            <p>{result.intervention_interoperability.description}</p>
            {result.intervention_interoperability.rows.map((row) => (
              <span key={row.dominant_layer}>
                {row.dominant_layer}: medication = {row.medication_role}; supplements = {row.supplement_role}; laser = {row.laser_role}
              </span>
            ))}
          </section>
          <section>
            <h2>Ayurveda interface map</h2>
            <p>{result.ayurveda_interface_map.note}</p>
            {result.ayurveda_interface_map.rows.map((row) => (
              <span key={row.ayurveda}>{row.ayurveda}: {row.base44}</span>
            ))}
          </section>
          {result.clinician.rule_trace.length > 0 && (
            <section>
              <h2>Rule trace</h2>
              {result.clinician.rule_trace.map((rule) => (
                <span key={`${rule.condition}-${rule.action}`}>{rule.condition}: {rule.action}</span>
              ))}
            </section>
          )}
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function PharyngealArchResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Cranio-visceral developmental gates</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Module interpretation</h2>
        <p>{patient.summary}</p>
      </section>

      <TagSection title="Reset focus" items={patient.support} tone="effect" empty="No dominant developmental gate module identified." />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <p>Suspected arch module: {result.suspected_arch_module || "not assessed"}</p>
          <p>Cranial nerve bus: {result.cranial_nerve_bus || "not assessed"}</p>
          <p>Gate organ: {result.gate_organ?.id || result.gate_organ?.gate_role || "field gate"}</p>
          <p>Primary pattern: {result.primary_pattern || "not assessed"}</p>
          <p>Formula class: {result.reset_strategy?.formula_class || "not assessed"}</p>
          <p>Field principle: {result.resonance_box?.principle}</p>
          <TagSection title="Field state" items={result.field_state || []} tone="mod" empty="None listed" />
          <TagSection title="Triggered rules" items={(result.triggered_rule_ids || []).map((rule) => `${rule.id}: ${rule.action}`)} tone="mod" empty="None triggered" />
          <TagSection title="Associated herbs" items={(result.reset_strategy?.herbs || []).map((herb) => `${herb.name}: ${herb.role}`)} tone="effect" empty="None listed" />
          {result.laser_gate_logic && (
            <section>
              <h2>Laser gate logic</h2>
              <p>{result.laser_gate_logic.principle}</p>
              {result.laser_gate_logic.notes.map((note) => <span key={note}>{note}</span>)}
            </section>
          )}
          {result.four_gate_laser_stellate_protocol && (
            <section>
              <h2>Non-invasive 4-gate laser stellate protocol</h2>
              <p>{result.four_gate_laser_stellate_protocol.description}</p>
              {result.four_gate_laser_stellate_protocol.gates.map((gate) => <span key={gate}>{gate}</span>)}
            </section>
          )}
          <section>
            <h2>Mouth of the fish model</h2>
            <p>{result.pharyngeal_pouch_sensor_corridor.description}</p>
            <p>{result.pharyngeal_pouch_sensor_corridor.principle}</p>
            <p>{result.pharyngeal_pouch_sensor_corridor.pouch_shunt_principle}</p>
          </section>
          <section>
            <h2>Cranial nerve map</h2>
            {result.cranial_nerve_pain_module_map.map((row) => (
              <span key={row.cranial_nerve}>{row.cranial_nerve}: {row.arch} / {row.TCM_axis}</span>
            ))}
          </section>
          <section>
            <h2>Gate organ library</h2>
            {result.gate_organ_library.map((gate) => (
              <span key={gate.id}>{gate.id}: {gate.gate_role} / {gate.interface_type}</span>
            ))}
          </section>
          <section>
            <h2>Cross-batch references</h2>
            {result.cross_batch_references.map((item) => <span key={item}>{item}</span>)}
          </section>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function PharyngealArchEngineSection() {
  const [input, setInput] = useState(archInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/pharyngeal-arch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, internal_audit: advanced || input.internal_audit })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Pharyngeal arch evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(archInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Cranio-Visceral Developmental Gates</h2>
          <p className="av-muted">
            Pharyngeal Arch Engine. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {archFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {archMultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
          />
        ))}

        <ToggleList
          title="Developmental gate flags"
          items={archFlags}
          selected={archFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/developmental model panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate developmental gate"}
        </button>
      </form>

      <PharyngealArchResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function VerticalAxisResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;
  const scoreRows = Object.entries(result.pattern_scores || {});

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={result.stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{result.stopped ? "Medical safety stop" : "Vertical-axis integration"}</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Reintegration interpretation</h2>
        <p>{patient.summary}</p>
        {!result.stopped && <p>{patient.phase}</p>}
      </section>

      <TagSection title="Suggested sequence" items={patient.sequence || []} tone="effect" empty="No sequencing suggested from current inputs." />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && !result.stopped && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <p>Detected phase: {result.detected_phase ? `Phase ${result.detected_phase} / ${result.detected_phase_name}` : "not selected"}</p>
          <p>Gate status: {result.gate_status}</p>
          <p>KD-SP holding status: {result.kd_sp_holding_status}</p>
          <p>Shaoyang compensation: {result.shaoyang_compensation_status}</p>
          <p>Root priority: {result.root_priority}</p>
          <p>Rigidity/adaptivity: {result.rigidity_adaptivity_index?.interpretation}</p>
          {result.why_headache_may_be_compensatory && <p>{result.why_headache_may_be_compensatory}</p>}
          {result.why_post_surgical_pain_may_persist && <p>{result.why_post_surgical_pain_may_persist}</p>}

          <section>
            <h2>Pattern scores</h2>
            {scoreRows.map(([name, value]) => (
              <span key={name}>{titleCase(name)}: {value.score}</span>
            ))}
          </section>

          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="mod" empty="None triggered" />
          <TagSection title="Contraindications" items={result.contraindications || []} tone="avoid" empty="None triggered" />
          <TagSection title="Core principles" items={result.core_phrases || []} tone="effect" empty="None listed" />

          <section>
            <h2>Reflexology concepts</h2>
            {(result.reflexology_concepts?.concepts || []).map((concept) => (
              <span key={concept.concept}>{titleCase(concept.concept)}: {concept.summary}</span>
            ))}
          </section>

          <section>
            <h2>Vertical-axis concepts</h2>
            {(result.vertical_axis_concepts?.axes || []).map((axis) => (
              <span key={axis.id}>{titleCase(axis.id)}: {axis.interpretation}</span>
            ))}
          </section>

          <section>
            <h2>Cross-batch links</h2>
            {(result.cross_batch_links || []).map((item) => <span key={item}>{item}</span>)}
          </section>
        </details>
      )}

      {advanced && result.stopped && (
        <details className="av-debug" open>
          <summary>Advanced safety view</summary>
          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="avoid" empty="None triggered" />
          <TagSection title="Red flags" items={result.red_flag_status?.flags || []} tone="avoid" empty="None listed" />
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function VerticalAxisEngineSection() {
  const [input, setInput] = useState(verticalInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/vertical-axis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, debugMode: advanced || input.debugMode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Vertical-axis evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(verticalInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Vertical Axis & Post-Surgical Integration</h2>
          <p className="av-muted">
            Detects transition, holding-field, and compensatory overload patterns. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {verticalTextFields.map((field) => (
          <section className="av-section" key={field.key}>
            <h2>{field.label}</h2>
            <input
              className="av-text-input"
              type="text"
              value={input[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          </section>
        ))}

        {verticalFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {verticalMultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
            safety={group.safety}
          />
        ))}

        <ToggleList
          title="Vertical-axis flags"
          items={verticalFlags}
          selected={verticalFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/reflexology/vertical-axis panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate vertical axis"}
        </button>
      </form>

      <VerticalAxisResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function SpinalAxisBars({ scores }) {
  const rows = Object.values(scores || {});
  if (!rows.length) return null;

  return (
    <section>
      <h2>4-axis failure scores</h2>
      <div className="av-axis-bars">
        {rows.map((axis) => (
          <div className="av-axis-row" key={axis.key}>
            <div>
              <strong>{axis.axis}: {axis.label}</strong>
              <span>{axis.score}/10</span>
            </div>
            <div className="av-axis-track">
              <div className="av-axis-fill" style={{ width: `${Math.min(axis.score, 10) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpinalFailureResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Spinal failure-mode engine</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Failure-mode interpretation</h2>
        <p>{patient.summary}</p>
      </section>

      <TagSection title="Support language" items={patient.support_language || []} tone="effect" empty="No support language generated." />
      <TagSection title="Suggested sequence" items={patient.sequence || []} tone="effect" empty="No sequencing suggested from current inputs." />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <p>Dominant failure mode: {result.dominant_failure_mode?.label || "not assessed"}</p>
          <p>Primary pattern: {result.primary_pattern || "not assessed"}</p>
          <p>Mixed pattern: {result.mixed_pattern ? "yes - sequence, do not stack" : "no"}</p>
          <p>Yin/Yang ligament subtype: {result.ligament_subtype?.subtype || "not assessed"}</p>
          <p>EZ continuity state: {result.EZ_continuity_state?.state || "not assessed"} / {String(result.EZ_continuity_state?.continuity)}</p>
          <p>Steroid suitability logic: {result.steroid_suitability_logic?.suitability}</p>

          <SpinalAxisBars scores={result.axis_scores} />

          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="mod" empty="None triggered" />
          <TagSection title="Contraindications" items={result.contraindications || []} tone="avoid" empty="None triggered" />
          <TagSection title="Core principles" items={result.core_phrases || []} tone="effect" empty="None listed" />

          <section>
            <h2>Pulse-plate-plexus model</h2>
            <p>Pulse: {result.pulse_plate_plexus_model?.pulse}</p>
            <p>Plate: {result.pulse_plate_plexus_model?.plate}</p>
            <p>Plexus: {result.pulse_plate_plexus_model?.plexus}</p>
            {(result.pulse_plate_plexus_model?.applications || []).map((item) => <span key={item}>{item}</span>)}
          </section>

          <section>
            <h2>Organ-spine feedback</h2>
            <p>{result.organ_spine_feedback?.interpretation}</p>
            <p>Active: {result.organ_spine_feedback?.active ? "yes" : "no"}</p>
          </section>

          <section>
            <h2>Dural craniosacral continuity</h2>
            <p>{result.dural_craniosacral_continuity?.summary}</p>
          </section>

          <section>
            <h2>Spinal concepts</h2>
            {(result.spinal_concepts?.concepts || []).map((concept) => (
              <span key={concept.concept}>{titleCase(concept.concept)}: {concept.summary}</span>
            ))}
          </section>

          <section>
            <h2>Neuro-meningeal concepts</h2>
            {(result.neuro_meningeal_concepts?.concepts || []).map((concept) => (
              <span key={concept.concept}>{titleCase(concept.concept)}: {concept.summary}</span>
            ))}
          </section>

          <section>
            <h2>Cross-batch links</h2>
            {(result.cross_batch_links || []).map((item) => <span key={item}>{item}</span>)}
          </section>

          <p>Reassessment timing: {result.reassessment_timing}</p>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function SpinalFailureModeSection() {
  const [input, setInput] = useState(spinalInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/spinal-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, debugMode: advanced || input.debugMode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Spinal failure-mode evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(spinalInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Spinal & Neuro-Meningeal Failure Modes</h2>
          <p className="av-muted">
            Maps spinal pain into hydration, flow, load-distribution, ligament-holding, and neural-damping failure modes. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {spinalFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <section className="av-section">
          <h2>Optional explicit axis scores</h2>
          <div className="av-score-grid">
            {spinalScoreFields.map(([key, label]) => (
              <label className="av-score-field" key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={input[key]}
                  onChange={(event) => setField(key, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        {spinalReassessmentGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {spinalMultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
          />
        ))}

        <ToggleList
          title="Spinal safety and logic flags"
          items={spinalFlags}
          selected={spinalFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/neuro-meningeal panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate spinal mode"}
        </button>
      </form>

      <SpinalFailureResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function ShaoyinScoreBars({ result }) {
  if (!result) return null;

  const rows = [
    ["Shaoyin freeze", result.shaoyin_freeze_score],
    ["Taiyang expansion", result.taiyang_expansion_score],
    ["Pericardial lock", result.pericardial_lock_score],
    ["Jueyin-Shaoyang", result.jueyin_shaoyang_score]
  ];

  return (
    <section>
      <h2>Meta-pattern scores</h2>
      <div className="av-axis-bars">
        {rows.map(([label, score]) => (
          <div className="av-axis-row" key={label}>
            <div>
              <strong>{label}</strong>
              <span>{score}/10</span>
            </div>
            <div className="av-axis-track">
              <div className="av-axis-fill" style={{ width: `${Math.min(score, 10) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShaoyinTaiyangResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;
  const positiveDomains = result.clinical_30_second_screen?.domains?.filter((domain) => domain.positive) || [];

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Shaoyin-Taiyang meta-pattern</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Meta-pattern interpretation</h2>
        <p>{patient.summary}</p>
        <p>{patient.screen_result}</p>
      </section>

      <TagSection title="Positive 30-second screen domains" items={positiveDomains.map((domain) => domain.label)} tone="mod" empty="No screen domains positive." />
      <TagSection title="Suggested sequence" items={result.suggested_sequence || []} tone="effect" empty="No sequencing suggested from current inputs." />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <p>Primary pattern: {result.primary_pattern || "not assessed"}</p>
          <p>Relay block: {result.relay_block}</p>
          <p>Pericardial lock status: {result.clinician?.pericardial_lock_status ? "active" : "not dominant"}</p>
          <p>Posterior fossa field node: {result.posterior_fossa_field_node_status?.active ? "active" : "not active"}</p>
          <p>Treitz-Heart-SJ module: {result.treitz_heart_sj_module?.active ? "active" : "not active"} / {result.treitz_heart_sj_module?.reason}</p>
          <p>Suan Zao Ren Tang status: {result.suan_zao_ren_tang_status}</p>

          <ShaoyinScoreBars result={result} />

          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="mod" empty="None triggered" />
          <TagSection title="Contraindications" items={result.contraindications || []} tone="avoid" empty="None triggered" />
          <TagSection title="Taiyang mover substitutions" items={result.taiyang_mover_safety?.substitutions || []} tone="effect" empty="None" />
          <TagSection title="Core principles" items={result.core_phrases || []} tone="effect" empty="None listed" />

          <section>
            <h2>Qi relay map</h2>
            <p>{(result.relay_map?.direction || []).join(" -> ")}</p>
            <p>Critical four-gate: {(result.relay_map?.critical_four_gate || []).join(" -> ")}</p>
          </section>

          <section>
            <h2>Shaoyin Sink Re-entry Formula</h2>
            <p>{result.shaoyin_sink_reentry_formula?.name}</p>
            {(result.shaoyin_sink_reentry_formula?.composition || []).map((item) => (
              <span key={item.herb}>{titleCase(item.herb)}: {item.dose_g}g</span>
            ))}
          </section>

          <section>
            <h2>Posterior fossa field node protocol</h2>
            <p>{result.posterior_fossa_field_node_status?.protocol?.indication}</p>
            {(result.posterior_fossa_field_node_status?.protocol?.three_level_restoration || []).map((level) => (
              <span key={level.name}>{level.level}. {titleCase(level.name)}</span>
            ))}
          </section>

          <section>
            <h2>Device / acupuncture logic</h2>
            {(result.device_acupuncture_map?.device || []).map((item) => <span key={item}>{item}</span>)}
            <p>{result.device_acupuncture_map?.acupuncture_points?.combined_opening}</p>
          </section>

          <section>
            <h2>Concept library</h2>
            {(result.concepts?.concepts || []).map((concept) => (
              <span key={concept.concept}>{titleCase(concept.concept)}: {concept.summary}</span>
            ))}
          </section>

          <section>
            <h2>Cross-batch links</h2>
            {(result.cross_batch_links || []).map((item) => <span key={item}>{item}</span>)}
          </section>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function ShaoyinTaiyangSection() {
  const [input, setInput] = useState(shaoyinInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/shaoyin-taiyang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, debugMode: advanced || input.debugMode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Shaoyin-Taiyang evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(shaoyinInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Shaoyin-Taiyang Dissociation</h2>
          <p className="av-muted">
            Inner Freeze / Outer Expansion meta-pattern screen. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {shaoyinFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="30-second clinical screen"
          items={shaoyinScreenFlags}
          selected={shaoyinScreenFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Advanced meta-pattern and safety gates"
          items={shaoyinAdvancedFlags}
          selected={shaoyinAdvancedFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/meta-pattern protocol panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate meta-pattern"}
        </button>
      </form>

      <ShaoyinTaiyangResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function TaiyangScoreBars({ scores = {} }) {
  const rows = Object.entries(scores).map(([label, score]) => [titleCase(label), score]);

  if (!rows.length) return null;

  return (
    <section>
      <h2>Branch scores</h2>
      <div className="av-axis-bars">
        {rows.map(([label, score]) => (
          <div className="av-axis-row" key={label}>
            <div>
              <strong>{label}</strong>
              <span>{score}/10</span>
            </div>
            <div className="av-axis-track">
              <div className="av-axis-fill" style={{ width: `${Math.min(score, 10) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaiyangResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Taiyang terrain module</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Terrain interpretation</h2>
        <p>{patient.summary}</p>
        {patient.branch_selection_note && <p>{patient.branch_selection_note}</p>}
        {patient.laser_message && <p>{patient.laser_message}</p>}
      </section>

      <TagSection title="Integration order" items={patient.integration_order || []} tone="effect" empty="No sequence generated." />
      <TagSection title="Mixed pattern / overlays" items={[...(result.mixed_patterns || []), ...(result.overlay_activation_status?.overlays || [])].map(titleCase)} tone="mod" empty="No overlay active." />
      <TagSection title="Contraindications" items={result.contraindications || []} tone="avoid" empty="No contraindications triggered." />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <p>Selected branch: {result.selected_branch || "not active"}</p>
          <p>System mode: {result.systemMode}</p>
          <p>Laser status: {result.laser_eligibility?.status}</p>
          <p>Supplement status: {result.supplement_eligibility?.eligible ? "eligible" : "blocked"}</p>
          <p>Formal documentation: {result.formal_documentation?.label}</p>
          <p>Internal logic: {result.internal_field_logic}</p>

          <TaiyangScoreBars scores={result.branch_scores} />

          <TagSection title="Visible terminology" items={result.display_terms || []} tone="mod" empty="No terminology listed." />
          <TagSection title="Internal target zones" items={result.target_zones?.internal || []} tone="effect" empty="No target zones listed." />
          <TagSection title="Herb layer" items={(result.herb_layer?.herbs || []).map((item) => `${item.name}: ${item.role}`)} tone="effect" empty="No herb layer listed." />
          <TagSection title="Laser notes" items={result.intervention_layers?.laser_layer?.notes || []} tone="mod" empty="No laser notes." />
          <TagSection title="Supplement layer" items={[result.supplement_layer?.name, result.supplement_layer?.timing].filter(Boolean)} tone="effect" empty="No supplement layer listed." />
          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="mod" empty="None triggered." />
          <TagSection title="Core principles" items={result.core_principles || []} tone="effect" empty="No principles listed." />
          <TagSection title="Cross-batch links" items={result.cross_batch_links || []} tone="effect" empty="No cross-batch links listed." />
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TaiyangModuleSection() {
  const [input, setInput] = useState(taiyangInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/taiyang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, debugMode: advanced || input.debugMode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Taiyang module evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(taiyangInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>TAIYANG_MODULE_v1.0</h2>
          <p className="av-muted">
            Posterior Shell Overpressure / Blocked Shaoyin Return Flow. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {taiyangFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="Symptoms and regional expressions"
          items={taiyangSymptomItems}
          selected={input.symptoms}
          onToggle={(value) => toggleArray("symptoms", value)}
        />

        <ToggleList
          title="Taiyang branch signals"
          items={taiyangBranchFlags}
          selected={taiyangBranchFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Laser / supplement safety gates"
          items={taiyangSafetyFlags}
          selected={taiyangSafetyFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/laser/order panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate Taiyang module"}
        </button>
      </form>

      <TaiyangResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function TransitionAxisBars({ scores = {} }) {
  const rows = Object.entries(scores);

  if (!rows.length) return null;

  return (
    <section>
      <h2>7-axis probability model</h2>
      <div className="av-axis-bars">
        {rows.map(([label, score]) => (
          <div className="av-axis-row" key={label}>
            <div>
              <strong>{titleCase(label)}</strong>
              <span>{score}%</span>
            </div>
            <div className="av-axis-track">
              <div className="av-axis-fill" style={{ width: `${Math.min(score, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlatformResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient || {};
  const caseQuality = result.case_quality || result.clinician?.case_quality_status;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Platform architecture</p>
        <strong>{patient.instability_type || "Instability route"}</strong>
      </div>

      <section>
        <h2>Three-question output</h2>
        <div className="av-mini-grid">
          <span><strong>Instability</strong>{patient.instability_type}</span>
          <span><strong>Root / branch</strong>{patient.root_branch}</span>
          <span><strong>System priority</strong>{patient.system_priority}</span>
        </div>
        <p>{patient.explanation}</p>
      </section>

      {patient.branch_direction && (
        <section>
          <h2>Branch direction</h2>
          <p>{patient.branch_direction.direction}: {patient.branch_direction.interpretation}</p>
        </section>
      )}

      <section className="av-safety-box">
        <h2>Language and safety</h2>
        {(patient.safety_notes || []).map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Practitioner / case-quality panel</summary>
          <section>
            <h2>Output mode</h2>
            <p>{result.system_output_mode}</p>
          </section>
          <section>
            <h2>Case quality</h2>
            <p>{typeof caseQuality === "string" ? caseQuality : result.case_quality?.status || "No case submission assessed"}</p>
            {result.case_quality && (
              <div className="av-mini-grid">
                <span><strong>Plausibility</strong>{result.case_quality.case_plausibility_score}</span>
                <span><strong>Completeness</strong>{result.case_quality.data_completeness_score}</span>
                <span><strong>Human review</strong>{result.case_quality.human_review_required ? "Required" : "Not required"}</span>
              </div>
            )}
          </section>
          <TagSection
            title="Rules triggered"
            items={(result.triggered_rules || []).map((rule) => rule.id)}
            tone="effect"
          />
          {result.clinician && (
            <pre>{JSON.stringify(result.clinician, null, 2)}</pre>
          )}
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function PlatformArchitectureSection() {
  const [input, setInput] = useState(platformInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const missing = platformFieldGroups.filter((group) => !input[group.key]).map((group) => group.label);
    if (missing.length) {
      setError(`Please complete: ${missing.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          system_output_mode: advanced ? "practitioner" : "front_end"
        })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Platform architecture evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(platformInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Platform Philosophy & Architecture</h2>
          <p className="av-muted">
            Three-question routing for instability, root/branch, and the system most useful right now. Evidence-informed + practice-derived.
          </p>
        </section>

        {platformFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <section className="av-section">
          <h2>Practitioner mode</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show backend maps and case-quality architecture</span>
          </label>
        </section>

        {advanced && (
          <>
            <section className="av-section">
              <h2>Branch direction</h2>
              <div className="av-options">
                {[
                  ["", "Not specified", "Do not infer branch direction"],
                  ["outbound", "Outbound", "Release valve / overflow"],
                  ["inbound", "Inbound", "Stress entry / suppression route"]
                ].map(([value, label, description]) => (
                  <label className="av-option" key={label}>
                    <input
                      type="radio"
                      name="branch_direction"
                      value={value}
                      checked={input.branch_direction === value}
                      onChange={() => setField("branch_direction", value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <ToggleList
              title="Case library / language flags"
              items={platformAdvancedFlags}
              selected={platformAdvancedFlags.filter(([key]) => input[key]).map(([key]) => key)}
              onToggle={(value) => setField(value, !input[value])}
            />

            <section className="av-section">
              <h2>Case quality scores</h2>
              <input
                className="av-number"
                min="0"
                max="1"
                step="0.01"
                type="number"
                placeholder="Plausibility 0-1"
                value={input.case_plausibility_score}
                onChange={(event) => setField("case_plausibility_score", event.target.value)}
              />
              <input
                className="av-number"
                min="0"
                max="1"
                step="0.01"
                type="number"
                placeholder="Completeness 0-1"
                value={input.data_completeness_score}
                onChange={(event) => setField("data_completeness_score", event.target.value)}
              />
            </section>
          </>
        )}

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate platform route"}
        </button>
      </form>

      <PlatformResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function TriAxialResult({ result, advanced, onReset }) {
  if (!result) return null;

  const focused =
    result.selected_focus === "metabolic"
      ? result.metabolic_rhythm
      : result.selected_focus === "tgn"
        ? result.trigeminal_neuralgia
        : result.headache_tri_axial;
  const patient = focused?.patient || result.patient || {};
  const stopped = focused?.stopped;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{stopped ? "Batch 17 safety stop" : "Batch 17 modules"}</p>
        <strong>{patient.title || "Connected module output"}</strong>
      </div>

      <section>
        <h2>Educational interpretation</h2>
        <p>{patient.summary}</p>
        {focused?.grid_state && (
          <div className="av-mini-grid">
            <span><strong>Grid state</strong>{focused.grid_state}</span>
            <span><strong>Selected node</strong>{focused.selected_node || "Not selected"}</span>
            <span><strong>Routing</strong>{focused.triage_wizard?.probability || "Not assessed"}</span>
          </div>
        )}
        {focused?.tgn_type && (
          <div className="av-mini-grid">
            <span><strong>TGN type</strong>{focused.tgn_type}</span>
            <span><strong>Taper status</strong>{focused.carbamazepine_safety?.taper_status}</span>
            <span><strong>Laser goal</strong>{focused.laser_protocol?.goal}</span>
          </div>
        )}
        {focused?.entry_score !== undefined && (
          <div className="av-mini-grid">
            <span><strong>Entry score</strong>{focused.entry_score}%</span>
            <span><strong>Layer 1</strong>Rhythm restoration</span>
            <span><strong>Layer 3</strong>{focused.therapeutic_layers?.[2]?.status}</span>
          </div>
        )}
      </section>

      <TagSection title="Support focus" items={patient.support || []} tone="effect" empty="No support output while safety stops are active." />
      <TagSection title="Cautions" items={focused?.contraindications || focused?.cautions || []} tone="avoid" />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {(patient.safety_notes || result.patient?.safety_notes || []).map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Practitioner view</summary>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TriAxialModulesSection() {
  const [input, setInput] = useState(triAxialInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/headache-triaxial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, output_mode: advanced ? "practitioner" : input.output_mode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Batch 17 module evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(triAxialInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Batch 17 connected modules</h2>
          <p className="av-muted">
            Headache tri-axial routing, trigeminal neuralgia safeguards, and metabolic rhythm restoration. Educational only, not diagnosis.
          </p>
        </section>

        {triAxialFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="Headache triage wizard inputs"
          items={triAxialHeadacheFlags}
          selected={triAxialHeadacheFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Autonomic signs"
          items={triAxialAutonomicItems}
          selected={input.autonomic_signs}
          onToggle={(value) => toggleArray("autonomic_signs", value)}
        />

        <ToggleList
          title="Headache red flags"
          items={triAxialRedFlags}
          selected={triAxialRedFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <ToggleList
          title="Trigeminal neuralgia module"
          items={triAxialTgnFlags}
          selected={triAxialTgnFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Metabolic rhythm module"
          items={triAxialMetabolicFlags}
          selected={triAxialMetabolicFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <section className="av-section">
          <h2>Details</h2>
          <input
            className="av-number"
            min="0"
            type="number"
            placeholder="Age"
            value={input.age}
            onChange={(event) => setField("age", event.target.value)}
          />
          <input
            className="av-number"
            min="0"
            type="number"
            placeholder="Aura duration minutes"
            value={input.aura_duration_minutes}
            onChange={(event) => setField("aura_duration_minutes", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="Formula selected"
            value={input.formula_selected}
            onChange={(event) => setField("formula_selected", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="Laser target"
            value={input.laser_target}
            onChange={(event) => setField("laser_target", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="Metabolic positioning language"
            value={input.positioning_language}
            onChange={(event) => setField("positioning_language", event.target.value)}
          />
        </section>

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show practitioner backend logic and rule trace</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate Batch 17 modules"}
        </button>
      </form>

      <TriAxialResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function TreatmentClusterResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient || {};
  const output = result.per_patient_output || {};

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={result.clinician_review_required ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>Treatment cluster routing</p>
        <strong>{output.primary_cluster || result.primary_cluster}</strong>
      </div>

      <section>
        <h2>Clinical direction</h2>
        <p>{output.clinical_rationale || patient.summary}</p>
        <div className="av-mini-grid">
          <span><strong>Primary</strong>{output.primary_cluster}</span>
          <span><strong>Secondary</strong>{output.secondary_cluster}</span>
          <span><strong>Single-axis</strong>{result.single_axis_dominance ? "Yes" : "No"}</span>
        </div>
      </section>

      <section>
        <h2>Non-prescriptive overview</h2>
        <p>{output.intervention_overview}</p>
      </section>

      <TagSection
        title="Clinician review flags"
        items={result.clinician_review_flags || []}
        tone="avoid"
        empty="No clinician review flag from this routing layer."
      />
      <TagSection
        title="Contraindications"
        items={result.contraindications || []}
        tone="avoid"
        empty="No additional contraindication from this routing layer."
      />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {(patient.safety_notes || []).map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Practitioner / internal audit panel</summary>
          <section>
            <h2>Mode</h2>
            <p>{result.system_mode}</p>
          </section>
          <TagSection
            title="Triggered rules"
            items={(result.triggered_rules || []).map((rule) => `${rule.id}: ${rule.reason || rule.action}`)}
            tone="mod"
            empty="No rules triggered."
          />
          <TagSection
            title="Core principles"
            items={result.key_principles || []}
            tone="effect"
            empty="No principles listed."
          />
          <TagSection
            title="Cross-module links"
            items={result.cross_module_links || []}
            tone="effect"
            empty="No cross-module links listed."
          />
          <pre>{JSON.stringify(result.clinician || output.internal_debug || {}, null, 2)}</pre>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TreatmentClusterSection() {
  const [input, setInput] = useState(treatmentClusterInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/treatment-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Treatment cluster evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(treatmentClusterInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>TREATMENT_CLUSTER_ENGINE_v1.0</h2>
          <p className="av-muted">
            Converts Transition Engine output into one primary and one secondary clinical direction. Clusters are not diagnoses.
          </p>
        </section>

        {treatmentClusterFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={`${group.key}-${value || "blank"}`}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="Routing features"
          items={treatmentClusterFlags}
          selected={treatmentClusterFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Safety / review modifiers"
          items={treatmentClusterReviewFlags}
          selected={treatmentClusterReviewFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Diagnosis routing context</h2>
          <input
            className="av-file"
            type="text"
            placeholder="Optional diagnosis context, e.g. IIH, CRPS, fibromyalgia"
            value={input.diagnosis}
            onChange={(event) => setField("diagnosis", event.target.value)}
          />
          <input
            className="av-number"
            min="0"
            type="number"
            placeholder="Failed treatment count"
            value={input.failed_treatments}
            onChange={(event) => setField("failed_treatments", event.target.value)}
          />
          <p className="av-muted">Diagnosis is used only as a routing hint; the functional axis remains primary.</p>
        </section>

        <section className="av-section">
          <h2>Advanced panel</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show practitioner/internal routing details</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate treatment clusters"}
        </button>
      </form>

      <TreatmentClusterResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function BiophysicalSubstrateResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient || {};
  const stopped = result.stopped;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{stopped ? "Substrate safety stop" : "Biophysical substrate"}</p>
        <strong>{patient.title || "Substrate interpretation"}</strong>
      </div>

      <section>
        <h2>Educational interpretation</h2>
        <p>{patient.summary}</p>
      </section>

      <TagSection
        title="Pattern labels"
        items={patient.pattern_labels || []}
        tone="effect"
        empty="No substrate pattern selected."
      />
      <TagSection
        title="Support focus"
        items={patient.support_focus || []}
        tone="mod"
        empty="Support output withheld or not selected."
      />
      <TagSection
        title="Avoid now"
        items={patient.avoid_now || []}
        tone="avoid"
        empty="No additional avoid rule from this layer."
      />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {(patient.safety_notes || []).map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Practitioner / internal substrate panel</summary>
          <TagSection
            title="Matched pattern IDs"
            items={result.matched_patterns || []}
            tone="effect"
            empty="No patterns matched."
          />
          <TagSection
            title="Triggered rules"
            items={(result.triggered_rules || []).map((rule) => `${rule.id}: ${rule.reason || rule.action}`)}
            tone="mod"
            empty="No rules triggered."
          />
          <TagSection
            title="Clinician review flags"
            items={result.clinician_review_flags || []}
            tone="avoid"
            empty="No clinician review flag."
          />
          <section>
            <h2>Cluster routing</h2>
            <pre>{JSON.stringify(result.seven_cluster_routes || {}, null, 2)}</pre>
          </section>
          <pre>{JSON.stringify(result.clinician || {}, null, 2)}</pre>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function BiophysicalSubstrateSection() {
  const [input, setInput] = useState(biophysicalInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/biophysical-substrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, output_mode: advanced ? input.output_mode : "patient" })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Biophysical substrate evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(biophysicalInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>BIOPHYSICAL_SUBSTRATE_ENGINE_v1.0</h2>
          <p className="av-muted">
            Substrate-level routing for tissue buffering, oscillator patterns, dual-channel movement logic, cervical prevertebral coordination, and practitioner-only oncology meaning layers.
          </p>
        </section>

        {biophysicalFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={`${group.key}-${value || "blank"}`}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="Substrate buffering signs"
          items={biophysicalSubstrateFlags}
          selected={biophysicalSubstrateFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Visceral / TAC oscillator signs"
          items={biophysicalVisceralTacFlags}
          selected={biophysicalVisceralTacFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Cervical prevertebral signs"
          items={biophysicalCervicalFlags}
          selected={biophysicalCervicalFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Fascia / nerve movement assessment"
          items={biophysicalMovementFlags}
          selected={biophysicalMovementFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Safety and clinician-only modifiers"
          items={biophysicalSafetyFlags}
          selected={biophysicalSafetyFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />
        <ToggleList
          title="Formula axes used"
          items={biophysicalFormulaAxes}
          selected={input.formula_axis}
          onToggle={(value) => toggleArray("formula_axis", value)}
        />

        <section className="av-section">
          <h2>Context</h2>
          <input
            className="av-file"
            type="text"
            placeholder="Optional diagnosis context, e.g. cluster headache, ALS, overactive bladder"
            value={input.diagnosis}
            onChange={(event) => setField("diagnosis", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="Metastasis site, practitioner/internal only"
            value={input.metastasis_site}
            onChange={(event) => setField("metastasis_site", event.target.value)}
          />
          <input
            className="av-number"
            min="0"
            type="number"
            placeholder="Formula component count"
            value={input.formula_components_count}
            onChange={(event) => setField("formula_components_count", event.target.value)}
          />
        </section>

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show practitioner substrate logic and rule trace</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate substrate pattern"}
        </button>
      </form>

      <BiophysicalSubstrateResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function CranialRezResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient || {};

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className="av-output-header">
        <p>Cranial REZ / dural engine</p>
        <strong>{patient.title || "Cranial-dural interpretation"}</strong>
      </div>

      <section>
        <h2>Educational interpretation</h2>
        <p>{patient.summary}</p>
        <div className="av-mini-grid">
          <span><strong>TN subtype</strong>{result.tn_subtype || "Not selected"}</span>
          <span><strong>Cranial nerve</strong>{result.cranial_nerve_affected || "Not selected"}</span>
          <span><strong>PSA link</strong>{result.posterior_fossa_psa_link ? "Active" : "Inactive"}</span>
        </div>
      </section>

      <TagSection
        title="Pattern labels"
        items={patient.pattern_labels || []}
        tone="effect"
        empty="No cranial-dural pattern selected."
      />
      <TagSection
        title="Support focus"
        items={patient.support_focus || []}
        tone="mod"
        empty="No support focus selected."
      />
      <TagSection
        title="Dural propagation links"
        items={result.dural_propagation_links || []}
        tone="effect"
        empty="No propagation link selected."
      />
      <TagSection
        title="Avoid now"
        items={patient.avoid_now || []}
        tone="avoid"
        empty="No additional avoid rule from this layer."
      />

      {patient.steroid_prediction && (
        <section className="av-safety-box">
          <h2>Steroid-response screen</h2>
          <p>{patient.steroid_prediction}</p>
          {patient.pulsed_rf_note && <p>{patient.pulsed_rf_note}</p>}
        </section>
      )}

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {(patient.safety_notes || []).map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && (
        <details className="av-debug" open>
          <summary>Clinician cranial-dural panel</summary>
          <TagSection
            title="Triggered rules"
            items={(result.triggered_rules || []).map((rule) => `${rule.id}: ${rule.reason || rule.action}`)}
            tone="mod"
            empty="No rules triggered."
          />
          <pre>{JSON.stringify(result.clinician || {}, null, 2)}</pre>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function CranialRezDuralSection() {
  const [input, setInput] = useState(cranialRezInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/cranial-rez-dural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, output_mode: advanced ? input.output_mode : "patient" })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Cranial REZ / dural evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(cranialRezInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>CRANIAL_REZ_DURAL_ENGINE_v1.0</h2>
          <p className="av-muted">
            Cranial nerve PPP routing, posterior fossa resonance, dural propagation, and steroid-response decision support. Educational and systems-support only.
          </p>
        </section>

        {cranialRezFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={`${group.key}-${value || "blank"}`}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <ToggleList
          title="Trigeminal spectrum clues"
          items={cranialRezTnFlags}
          selected={cranialRezTnFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Posterior fossa resonance"
          items={cranialRezPosteriorFlags}
          selected={cranialRezPosteriorFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />
        <ToggleList
          title="Steroid strong-responder signs"
          items={cranialRezSteroidStrongFlags}
          selected={cranialRezSteroidStrongFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />
        <ToggleList
          title="Steroid poor-responder / RF caution signs"
          items={cranialRezSteroidPoorFlags}
          selected={cranialRezSteroidPoorFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />
        <ToggleList
          title="Dural continuum propagation"
          items={cranialRezDuralFlags}
          selected={cranialRezDuralFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <section className="av-section">
          <h2>Context</h2>
          <input
            className="av-file"
            type="text"
            placeholder="Optional diagnosis context, e.g. TGN, IIH, POTS, Meniere"
            value={input.diagnosis}
            onChange={(event) => setField("diagnosis", event.target.value)}
          />
          <input
            className="av-number"
            min="0"
            type="number"
            placeholder="Pain duration in months"
            value={input.pain_onset_duration_months}
            onChange={(event) => setField("pain_onset_duration_months", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="MRI finding"
            value={input.MRI_finding}
            onChange={(event) => setField("MRI_finding", event.target.value)}
          />
          <input
            className="av-file"
            type="text"
            placeholder="Shu-Mu / segmental context"
            value={input.shu_mu_segment}
            onChange={(event) => setField("shu_mu_segment", event.target.value)}
          />
        </section>

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician PPP, steroid, and dural propagation details</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate cranial REZ / dural pattern"}
        </button>
      </form>

      <CranialRezResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function DampColdTerrainModule() {
  return (
    <section className="av-damp-cold-module" aria-label="Damp-Cold cinematic terrain state">
      <div className="av-damp-cold-stage av-damp-cold-stage-ready">
        <div className="av-damp-cold-video-shell">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label="Damp-Cold terrain-state video"
            className="av-damp-cold-video"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            src={DAMP_COLD_YOUTUBE_EMBED}
            title="Damp-Cold terrain-state cinematic video"
          />
        </div>

        <a
          className="av-damp-cold-play-state"
          href={DAMP_COLD_YOUTUBE_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play cinematic state
        </a>

        <div className="av-damp-cold-gradient" aria-hidden="true" />
        <div className="av-damp-cold-depth" aria-hidden="true" />

        <div className="av-damp-cold-overlay">
          <p>Terrain State</p>
          <h2>Damp-Cold</h2>
          <div className="av-damp-cold-labels" aria-label="Terrain descriptors">
            <span>Slowed biological conduction</span>
            <span>Dampened low-energy terrain</span>
            <span>Reduced biological responsiveness</span>
            <span>Cold submerged fascia-water dynamics</span>
          </div>
        </div>

        <div className="av-terrain-coordinate" aria-label="Biomechanical terrain coordinate">
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Damp</span>
            <i />
            <span>Dry</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Cold</span>
            <i />
            <span>Heat</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Undercharged</span>
            <i />
            <span>Overcharged</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Collapse</span>
            <i />
            <span>Coherent</span>
          </div>
        </div>

        <div className="av-proton-flow" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function DampHeatTerrainModule() {
  return (
    <section className="av-damp-cold-module av-damp-heat-module" aria-label="Damp-Heat cinematic terrain state">
      <div className="av-damp-cold-stage av-damp-cold-stage-ready av-damp-heat-stage">
        <div className="av-damp-cold-video-shell">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label="Damp-Heat terrain-state video"
            className="av-damp-cold-video"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            src={DAMP_HEAT_YOUTUBE_EMBED}
            title="Damp-Heat terrain-state cinematic video"
          />
        </div>

        <a
          className="av-damp-cold-play-state av-damp-heat-play-state"
          href={DAMP_HEAT_YOUTUBE_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play cinematic state
        </a>

        <div className="av-damp-cold-gradient" aria-hidden="true" />
        <div className="av-damp-cold-depth" aria-hidden="true" />

        <div className="av-damp-cold-overlay">
          <p>Terrain State</p>
          <h2>Damp-Heat</h2>
          <div className="av-damp-cold-labels" aria-label="Terrain descriptors">
            <span>Congested inflammatory terrain</span>
            <span>Trapped biological pressure</span>
            <span>Reduced adaptive flow</span>
            <span>Unstable proton-flow accumulation</span>
          </div>
        </div>

        <div className="av-terrain-coordinate" aria-label="Biomechanical terrain coordinate">
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Damp</span>
            <i />
            <span>Dry</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Cold</span>
            <i />
            <span>Heat</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Undercharged</span>
            <i />
            <span>Overcharged</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Collapse</span>
            <i />
            <span>Coherent</span>
          </div>
        </div>

        <div className="av-proton-flow" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function DryColdTerrainModule() {
  return (
    <section className="av-damp-cold-module av-dry-cold-module" aria-label="Dry-Cold cinematic terrain state">
      <div className="av-damp-cold-stage av-damp-cold-stage-ready av-dry-cold-stage">
        <div className="av-damp-cold-video-shell">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label="Dry-Cold terrain-state video"
            className="av-damp-cold-video"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            src={DRY_COLD_YOUTUBE_EMBED}
            title="Dry-Cold terrain-state cinematic video"
          />
        </div>

        <a
          className="av-damp-cold-play-state av-dry-cold-play-state"
          href={DRY_COLD_YOUTUBE_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play cinematic state
        </a>

        <div className="av-damp-cold-gradient" aria-hidden="true" />
        <div className="av-damp-cold-depth" aria-hidden="true" />

        <div className="av-damp-cold-overlay">
          <p>Terrain State</p>
          <h2>Dry-Cold</h2>
          <div className="av-damp-cold-labels" aria-label="Terrain descriptors">
            <span>Reduced tissue adaptability</span>
            <span>Fragile low-energy terrain</span>
            <span>Weakened biological conduction</span>
          </div>
        </div>

        <div className="av-terrain-coordinate" aria-label="Biomechanical terrain coordinate">
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Damp</span>
            <i />
            <span>Dry</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Cold</span>
            <i />
            <span>Heat</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Undercharged</span>
            <i />
            <span>Overcharged</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Collapse</span>
            <i />
            <span>Coherent</span>
          </div>
        </div>

        <div className="av-proton-flow" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function DryHeatTerrainModule() {
  return (
    <section className="av-damp-cold-module av-dry-heat-module" aria-label="Dry-Heat cinematic terrain state">
      <div className="av-damp-cold-stage av-damp-cold-stage-ready av-dry-heat-stage">
        <div className="av-damp-cold-video-shell">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label="Dry-Heat terrain-state video"
            className="av-damp-cold-video"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            src={DRY_HEAT_YOUTUBE_EMBED}
            title="Dry-Heat terrain-state cinematic video"
          />
        </div>

        <a
          className="av-damp-cold-play-state av-dry-heat-play-state"
          href={DRY_HEAT_YOUTUBE_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play cinematic state
        </a>

        <div className="av-damp-cold-gradient" aria-hidden="true" />
        <div className="av-damp-cold-depth" aria-hidden="true" />

        <div className="av-damp-cold-overlay">
          <p>Terrain State</p>
          <h2>Dry-Heat</h2>
          <div className="av-damp-cold-labels" aria-label="Terrain descriptors">
            <span>Metabolic stress</span>
            <span>Reduced tissue hydration</span>
            <span>Overstimulated biological terrain</span>
          </div>
        </div>

        <div className="av-terrain-coordinate" aria-label="Biomechanical terrain coordinate">
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Damp</span>
            <i />
            <span>Dry</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Cold</span>
            <i />
            <span>Heat</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Undercharged</span>
            <i />
            <span>Overcharged</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Collapse</span>
            <i />
            <span>Coherent</span>
          </div>
        </div>

        <div className="av-proton-flow" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function TensionReleaseModule() {
  return (
    <section className="av-damp-cold-module av-tension-release-module" aria-label="Tension Release cinematic transition state">
      <div className="av-damp-cold-stage av-damp-cold-stage-ready av-tension-release-stage">
        <div className="av-damp-cold-video-shell">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label="Tension Release transition-state video"
            className="av-damp-cold-video"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            src={TENSION_RELEASE_YOUTUBE_EMBED}
            title="Tension Release cinematic transition-state video"
          />
        </div>

        <a
          className="av-damp-cold-play-state av-tension-release-play-state"
          href={TENSION_RELEASE_YOUTUBE_URL}
          rel="noreferrer"
          target="_blank"
        >
          Play transition state
        </a>

        <div className="av-damp-cold-gradient" aria-hidden="true" />
        <div className="av-damp-cold-depth" aria-hidden="true" />

        <div className="av-damp-cold-overlay">
          <p>Transition State</p>
          <h2>Tension Release</h2>
          <div className="av-damp-cold-labels" aria-label="Transition descriptors">
            <span>Biologic decompression</span>
            <span>Restoring adaptive flow</span>
            <span>Pressure begins to dissolve</span>
          </div>
        </div>

        <div className="av-terrain-coordinate" aria-label="Biomechanical terrain coordinate">
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Damp</span>
            <i />
            <span>Dry</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Cold</span>
            <i />
            <span>Heat</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Undercharged</span>
            <i />
            <span>Overcharged</span>
          </div>
          <div className="av-terrain-axis av-terrain-axis-horizontal">
            <span>Collapse</span>
            <i />
            <span>Coherent</span>
          </div>
        </div>

        <div className="av-proton-flow" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function TransitionResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;
  const stopped = result.stopped || result.rejected;

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{stopped ? "Transition safety stop" : "Transition engine"}</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Clinical summary</h2>
        <p>{patient.summary}</p>
      </section>

      {!stopped && (
        <>
          <TagSection title="Support clusters" items={patient.support || []} tone="effect" empty="Cluster output withheld by safety hierarchy." />
          <TagSection title="Matched patterns" items={result.matched_patterns?.map(titleCase) || []} tone="mod" empty="No pattern matched." />
          <TagSection title="Route links" items={result.cross_module_links || []} tone="effect" empty="No module route selected." />
        </>
      )}

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {advanced && !result.stopped && !result.rejected && (
        <details className="av-debug" open>
          <summary>Clinician routing view</summary>
          <p>Primary transition: {result.transition_detection?.primary_transition?.transition || "none"}</p>
          <p>Expression classifier: {result.expression_classifier?.name}</p>
          <p>Primary cluster: {result.treatment_clusters?.primary?.cluster || "withheld"}</p>
          <p>Secondary cluster: {result.treatment_clusters?.secondary?.cluster || "withheld"}</p>
          <p>Dynamic role enum: {result.trauma_role?.current_role || "none"}; reassess over time.</p>
          <p>Backend-only formula rules active: {result.clinician?.backend_formula_logic_hidden_from_patient || 0} hidden from patient output.</p>

          <TransitionAxisBars scores={result.axis_probability_scores} />
          <TagSection title="DO_NOT hierarchy" items={result.decision_hierarchy?.do_not_rules || []} tone="avoid" empty="No DO_NOT rules triggered." />
          <TagSection title="DO rules" items={result.decision_hierarchy?.do_rules || []} tone="effect" empty="No role-specific DO rules." />
          <TagSection title="Suppressed clusters" items={(result.treatment_clusters?.suppressed || []).map((item) => `${item.cluster}: ${item.reason}`)} tone="avoid" empty="None suppressed." />
          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="mod" empty="None triggered." />
          <TagSection title="Core principles" items={result.core_principles || []} tone="effect" empty="No principles listed." />
        </details>
      )}

      {advanced && result.rejected && (
        <details className="av-debug" open>
          <summary>Reject reason</summary>
          <TagSection title="Triggered rules" items={(result.triggered_rules || []).map((item) => `${item.id}: ${item.action}`)} tone="avoid" empty="None triggered." />
          <p>{result.clinician?.reject_reason}</p>
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TransitionEngineSection() {
  const [input, setInput] = useState(transitionInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, systemMode: advanced ? "clinician" : input.systemMode })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Transition evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(transitionInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>TRANSITION_ENGINE_v1.0</h2>
          <p className="av-muted">
            Detects system-level coherence failure and routes downstream expressions. This is an educational pattern-recognition tool, not a medical diagnosis.
          </p>
        </section>

        {transitionFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <section className="av-section">
          <h2>Headache frequency</h2>
          <input
            className="av-number"
            min="0"
            max="31"
            type="number"
            value={input.headache_frequency_days_per_month}
            onChange={(event) => setField("headache_frequency_days_per_month", event.target.value)}
          />
        </section>

        <ToggleList
          title="Downstream expressions"
          items={transitionSymptomItems}
          selected={input.symptoms}
          onToggle={(value) => toggleArray("symptoms", value)}
        />

        <ToggleList
          title="Neuropathic descriptors"
          items={transitionNeuropathicItems}
          selected={input.neuropathic_descriptors}
          onToggle={(value) => toggleArray("neuropathic_descriptors", value)}
        />

        <ToggleList
          title="Transition inputs"
          items={transitionFlags}
          selected={transitionFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
        />

        <ToggleList
          title="Safety / reject rules"
          items={transitionSafetyFlags}
          selected={transitionSafetyFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician routing, rules, and axis panels</span>
          </label>
        </section>

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate transition route"}
        </button>
      </form>

      <TransitionResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

function HeadacheEngineSection() {
  const [input, setInput] = useState(headacheInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/headache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, internal_audit: advanced || input.internal_audit })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Headache evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(headacheInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Headache / pain pattern engine</h2>
          <p className="av-muted">
            This is an educational pattern-recognition tool and not a medical diagnosis.
            Seek urgent care for red flag symptoms. Medication changes must be discussed with a clinician.
          </p>
        </section>

        {headacheFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {batch7FieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {batch8FieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {batch9FieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {headacheMultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
          />
        ))}

        {batch9MultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
          />
        ))}

        <ToggleList
          title="Safety and context"
          items={headacheSafetyFlags}
          selected={headacheSafetyFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Tongue photo</h2>
          <input
            className="av-file"
            type="file"
            accept="image/*"
            onChange={(event) => setField("tongue_photo", event.target.files?.[0]?.name || "")}
          />
          <p className="av-muted">The current engine records that a photo was provided; image interpretation remains separate.</p>
        </section>

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/debug inputs and result panel</span>
          </label>
        </section>

        {advanced && (
          <>
            <ToggleList
              title="Clinician/debug flags"
              items={headacheAdvancedFlags}
              selected={headacheAdvancedFlags.filter(([key]) => input[key]).map(([key]) => key)}
              onToggle={(value) => setField(value, !input[value])}
              safety
            />
            <ToggleList
              title="Shaoyang collapse cluster"
              items={shaoyangClusterItems}
              selected={input.Shaoyang_collapse_cluster_signs}
              onToggle={(value) => toggleArray("Shaoyang_collapse_cluster_signs", value)}
            />
            <ToggleList
              title="Red flag details"
              items={redFlagTypes}
              selected={input.red_flag_type}
              onToggle={(value) => toggleArray("red_flag_type", value)}
              safety
            />
            <ToggleList
              title="Gepant side effects"
              items={gepantSideEffects}
              selected={input.gepant_side_effects}
              onToggle={(value) => toggleArray("gepant_side_effects", value)}
              safety
            />
            <ToggleList
              title="CGRP support markers"
              items={cgrpSideEffects}
              selected={input.cgrp_side_effects}
              onToggle={(value) => toggleArray("cgrp_side_effects", value)}
              safety
            />
            <section className="av-section">
              <h2>Reassessment day</h2>
              <input
                className="av-number"
                min="0"
                type="number"
                value={input.reassessment_day}
                onChange={(event) => setField("reassessment_day", event.target.value)}
              />
            </section>
          </>
        )}

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate headache pattern"}
        </button>
      </form>

      <HeadacheResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

export default function AvicennaApp() {
  const [mode, setMode] = useState("wellness");
  const [input, setInput] = useState(initialInput);
  const [protocol, setProtocol] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const missing = useMemo(
    () => fieldGroups.filter((group) => !input[group.key]).map((group) => group.label),
    [input]
  );

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (missing.length) {
      setError(`Please complete: ${missing.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Protocol generation failed");
      setProtocol(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(initialInput);
    setProtocol(null);
    setError("");
  }

  const title =
    mode === "headache"
      ? "Pain pattern engine"
      : mode === "arch"
        ? "Cranio-Visceral Developmental Gates"
        : mode === "vertical"
          ? "Vertical Axis & Post-Surgical Integration"
          : mode === "spinal"
            ? "Spinal & Neuro-Meningeal Failure Modes"
            : mode === "shaoyin"
              ? "Shaoyin-Taiyang Dissociation Engine"
              : mode === "taiyang"
                ? "TAIYANG_MODULE_v1.0"
                : mode === "transition"
                  ? "Transition Engine v1.0"
                  : mode === "platform"
                    ? "Platform Philosophy & Architecture"
                    : mode === "triaxial"
                      ? "Headache Tri-Axial / TGN / Metabolic Rhythm"
                      : mode === "cluster"
                        ? "Treatment Cluster Engine"
                        : mode === "biophysical"
                          ? "Biophysical Substrate Engine"
                          : mode === "cranial"
                            ? "Cranial REZ / Dural Engine"
                            : mode === "dampCold"
                            ? "Damp-Cold Terrain State"
                              : mode === "dampHeat"
                                ? "Damp-Heat Terrain State"
                                : mode === "dryCold"
                                  ? "Dry-Cold Terrain State"
                                  : mode === "dryHeat"
                                    ? "Dry-Heat Terrain State"
                                    : mode === "tensionRelease"
                                      ? "Tension Release Transition State"
              : "Wellness protocol generator";
  const subtitle =
    mode === "headache"
      ? "Safety-first terrain scoring across nerve, fascia, gut, vessel, and energy-recovery axes"
      : mode === "arch"
        ? "Pharyngeal Arch Engine: symptom to gate to axis to reset strategy"
        : mode === "vertical"
          ? "Post-surgical reintegration, KD-SP holding field, and compensatory Shaoyang logic"
          : mode === "spinal"
            ? "Functional spinal scoring across disc, fascia, neurogenic, and ligament holding layers"
            : mode === "shaoyin"
              ? "Inner Freeze / Outer Expansion meta-pattern screen for chronic downstream manifestations"
              : mode === "taiyang"
                ? "Posterior shell overpressure, laser eligibility, and Herba -> HILT Laser -> supplement support sequencing"
                : mode === "transition"
                  ? "High-level 7-axis routing above terrain modules and downstream symptom expressions"
                  : mode === "platform"
                    ? "Three-question UX, instability routing, case-quality architecture, and cross-system translation rules"
                    : mode === "triaxial"
                      ? "Grid-state headache routing, trigeminal neuralgia safeguards, and metabolic rhythm restoration"
                      : mode === "cluster"
                        ? "7-functional-axis routing into primary and secondary treatment clusters"
                        : mode === "biophysical"
                          ? "EZ oscillator, fascia-nerve movement, cervical prevertebral, and oncology meaning-layer safety logic"
                          : mode === "cranial"
                            ? "Plate-Pulse-Plexus cranial routing, posterior fossa resonance, dural continuum, and steroid response prediction"
                            : mode === "dampCold"
                            ? "Slowed biological conduction, dampened low-energy terrain, and cold submerged fascia-water dynamics"
                              : mode === "dampHeat"
                                ? "Trapped inflammatory pressure, congested terrain, and reduced adaptive flow"
                                : mode === "dryCold"
                                  ? "Depleted biological hydration, brittle low-energy terrain, and weakened conduction pathways"
                                  : mode === "dryHeat"
                                    ? "Metabolic stress, reduced tissue hydration, and overstimulated biological terrain"
                                    : mode === "tensionRelease"
                                      ? "Biologic decompression, adaptive flow restoration, and gradual pressure release"
              : "Rule-based terrain assessment and tea protocol builder";
  const isCinematicTerrain =
    mode === "dampCold"
    || mode === "dampHeat"
    || mode === "dryCold"
    || mode === "dryHeat"
    || mode === "tensionRelease";

  return (
    <main className={isCinematicTerrain ? "av-page av-page-cinematic" : "av-page"}>
      <header className={isCinematicTerrain ? "av-header av-header-cinematic" : "av-header"}>
        <p>Avicenna Clinical Engine</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      {mode === "arch" ? (
        <PharyngealArchEngineSection />
      ) : mode === "vertical" ? (
        <VerticalAxisEngineSection />
      ) : mode === "spinal" ? (
        <SpinalFailureModeSection />
      ) : mode === "shaoyin" ? (
        <ShaoyinTaiyangSection />
      ) : mode === "taiyang" ? (
        <TaiyangModuleSection />
      ) : mode === "transition" ? (
        <TransitionEngineSection />
      ) : mode === "platform" ? (
        <PlatformArchitectureSection />
      ) : mode === "triaxial" ? (
        <TriAxialModulesSection />
      ) : mode === "cluster" ? (
        <TreatmentClusterSection />
      ) : mode === "biophysical" ? (
        <BiophysicalSubstrateSection />
      ) : mode === "cranial" ? (
        <CranialRezDuralSection />
      ) : mode === "dampCold" ? (
        <DampColdTerrainModule />
      ) : mode === "dampHeat" ? (
        <DampHeatTerrainModule />
      ) : mode === "dryCold" ? (
        <DryColdTerrainModule />
      ) : mode === "dryHeat" ? (
        <DryHeatTerrainModule />
      ) : mode === "tensionRelease" ? (
        <TensionReleaseModule />
      ) : mode === "headache" ? (
        <HeadacheEngineSection />
      ) : (
      <div className="av-workspace">
        <form className="av-form" onSubmit={submit}>
          {fieldGroups.map((group) => (
            <section className="av-section" key={group.key}>
              <h2>{group.label}</h2>
              <div className="av-options">
                {group.options.map(([value, label, description]) => (
                  <label className="av-option" key={value}>
                    <input
                      type="radio"
                      name={group.key}
                      value={value}
                      checked={input[group.key] === value}
                      onChange={() => setField(group.key, value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section className="av-section">
            <h2>General resilience</h2>
            <label className="av-check">
              <input
                type="checkbox"
                checked={input.frailty}
                onChange={(event) => setField("frailty", event.target.checked)}
              />
              <span>Low resilience, easily fatigued, sensitive to change</span>
            </label>
          </section>

          <ToggleList
            title="Current symptoms"
            items={symptoms}
            selected={input.symptoms}
            onToggle={(value) => toggleArray("symptoms", value)}
          />

          <ToggleList
            title="Safety flags"
            items={safetyFlags}
            selected={input.safety_flags}
            onToggle={(value) => toggleArray("safety_flags", value)}
            safety
          />

          {error && <p className="av-error">{error}</p>}

          <button className="av-primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate protocol"}
          </button>
        </form>

        <ProtocolOutput protocol={protocol} onReset={reset} />
      </div>
      )}
    </main>
  );
}
