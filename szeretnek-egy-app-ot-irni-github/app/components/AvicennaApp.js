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

  return (
    <main className="av-page">
      <header className="av-header">
        <p>Avicenna Clinical Engine</p>
        <h1>{mode === "headache" ? "Headache pattern engine" : "Wellness protocol generator"}</h1>
        <span>
          {mode === "headache"
            ? "Safety-first terrain scoring across nerve, fascia, gut, vessel, and energy-recovery axes"
            : "Rule-based terrain assessment and tea protocol builder"}
        </span>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      {mode === "headache" ? (
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
