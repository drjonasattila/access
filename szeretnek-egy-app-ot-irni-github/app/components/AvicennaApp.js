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
      ["myblood", "MyBlood / flow support"],
      ["flow_support", "Equivalent flow support"],
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
          title="Laser / DuoLife safety gates"
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
                ? "Posterior shell overpressure, laser eligibility, and Herba -> HILT Laser -> DuoLife sequencing"
              : "Rule-based terrain assessment and tea protocol builder";

  return (
    <main className="av-page">
      <header className="av-header">
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
