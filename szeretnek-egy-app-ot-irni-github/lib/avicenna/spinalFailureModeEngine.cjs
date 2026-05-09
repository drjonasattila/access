const batch12Data = require("./data/engines/avicenna_engine_batch12.json");
const spinalFailureModeData = require("./data/engines/spinalFailureModeEngine.json");
const spinalConcepts = require("./data/libraries/spinalConcepts.batch12.json");
const neuroMeningealConcepts = require("./data/libraries/neuroMeningealConcepts.batch12.json");

const PATTERNS = batch12Data.patterns || [];
const RULES = spinalFailureModeData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));

const AXES = spinalFailureModeData.axis_model || [
  { axis: "A", key: "disc", score_key: "failure_mode_score_disc", pattern: "disc_dehydration_structural_failure", label: "Disc dehydration / matrix collapse" },
  { axis: "B", key: "stasis", score_key: "failure_mode_score_stasis", pattern: "stasis_fascial_tension", label: "Stasis / fascial tension" },
  { axis: "C", key: "neurogenic", score_key: "failure_mode_score_neurogenic", pattern: "neurogenic_overload", label: "Neurogenic overload" },
  { axis: "D", key: "deep_ligament", score_key: "failure_mode_score_deep_ligament", pattern: "deep_ligament_segmental_instability", label: "Deep ligament / segmental instability" }
];

const PATTERN_LABELS = {
  neuro_meningeal_hydration_failure: "Hydration Layer Integrity Failure",
  disc_dehydration_structural_failure: "Disc dehydration / structural support pattern",
  stasis_fascial_tension: "Stasis / fascial tension pattern",
  neurogenic_overload: "Neurogenic overload pattern",
  deep_ligament_segmental_instability_hypertonic: "Deep ligament instability - hypertonic pattern",
  deep_ligament_segmental_instability_hypotonic: "Deep ligament instability - hypotonic pattern",
  hybrid_yin_yang_spinal: "Hybrid Yin/Yang spinal pattern",
  organ_instability_visceral_neural_overload: "Organ-spine feedback pattern"
};

const CORE_PHRASES = [
  "Pain emerges from functional failure modes, not anatomy alone.",
  "The disc is often a passive witness.",
  "Steroids work when hydration continuity remains intact.",
  "Facet pain is capsulo-ligamentous pain.",
  "BUILD first, MOVE later.",
  "Treatment is never purely local.",
  "The structure may fail because it cannot hold - not because it is inflamed."
];

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function number(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(10, parsed));
}

function any(values, targets) {
  return targets.some((target) => values.includes(target));
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
    ...list(input.symptom_clusters),
    ...list(input.spinal_features),
    ...list(input.systemic_signs)
  ];
  const meds = list(input.current_medications);
  const interventions = list(input.requested_interventions);
  const imaging = input.imaging_findings || "";
  const westernDiagnosis = input.western_diagnosis || "";
  const painLocation = input.pain_location || "";
  const painQuality = input.pain_quality || "";
  const load = input.load_position_dependence || "";
  const ligamentTone = input.ligament_tone || "";
  const coreQuestion = input.core_question_result || "";
  const ezState = input.EZ_state || input.hydration_layer_state || "";
  const ezContinuityProvided = Object.prototype.hasOwnProperty.call(input, "EZ_continuity");

  return {
    pain_location: painLocation,
    pain_quality: painQuality,
    pain_type: input.pain_type || "",
    load_position_dependence: load,
    EZ_state: ezState,
    EZ_continuity: ezContinuityProvided ? bool(input.EZ_continuity) : (ezState ? ezState === "continuous" : null),
    western_diagnosis: westernDiagnosis,
    current_medications: meds,
    treatment_response: input.treatment_response || "",
    morning_stiffness: bool(input.morning_stiffness) || symptoms.includes("morning_stiffness"),
    end_day_fatigue: bool(input.end_day_fatigue) || symptoms.includes("end_day_fatigue"),
    cold_lower_back: bool(input.cold_lower_back) || symptoms.includes("cold_lower_back"),
    leg_numbness: bool(input.leg_numbness) || symptoms.includes("leg_numbness"),
    fatigue_dominant: bool(input.fatigue_dominant) || symptoms.includes("fatigue_dominant"),
    poor_sleep: bool(input.poor_sleep) || symptoms.includes("poor_sleep"),
    night_pain: bool(input.night_pain) || symptoms.includes("night_pain"),
    instability_sensation: bool(input.instability_sensation) || symptoms.includes("instability_sensation"),
    instability_sensation_reduced: bool(input.instability_sensation_reduced),
    clicking_popping: bool(input.clicking_popping) || symptoms.includes("clicking_popping"),
    pain_unpredictability: bool(input.pain_unpredictability) || symptoms.includes("pain_unpredictability"),
    pain_unpredictability_reduced: bool(input.pain_unpredictability_reduced),
    systemic_laxity_signs: bool(input.systemic_laxity_signs)
      || any(symptoms, ["varicose_veins", "prolapse", "pelvic_floor_prolapse", "haemorrhoids", "oedema"]),
    cold_extremities: bool(input.cold_extremities) || symptoms.includes("cold_extremities"),
    bloating_food_intolerance: bool(input.bloating_food_intolerance) || symptoms.includes("bloating_food_intolerance"),
    hypothyroid: bool(input.hypothyroid) || symptoms.includes("hypothyroid"),
    adrenal_fatigue: bool(input.adrenal_fatigue) || symptoms.includes("adrenal_fatigue"),
    postpartum: bool(input.postpartum) || symptoms.includes("postpartum"),
    liver_yang_rising: bool(input.liver_yang_rising),
    visceral_organ_feedback: input.visceral_organ_feedback || "none",
    organ_instability: bool(input.organ_instability),
    dermatomal_spread: bool(input.dermatomal_spread) || symptoms.includes("dermatomal_spread"),
    neurological_deficit: bool(input.neurological_deficit),
    imaging_findings: imaging,
    steroid_response_history: input.steroid_response_history || "",
    failure_mode_score_disc: number(input.failure_mode_score_disc),
    failure_mode_score_stasis: number(input.failure_mode_score_stasis),
    failure_mode_score_neurogenic: number(input.failure_mode_score_neurogenic),
    failure_mode_score_deep_ligament: number(input.failure_mode_score_deep_ligament),
    ligament_tone: ligamentTone,
    core_question_result: coreQuestion,
    improvement_not_sustained: bool(input.improvement_not_sustained),
    disc_stability_at_reassessment: input.disc_stability_at_reassessment || "",
    nerve_pain_at_reassessment: input.nerve_pain_at_reassessment || "",
    phase_current: Number(input.phase_current || 1),
    flow_support_present: bool(input.flow_support_present) || interventions.includes("myblood") || interventions.includes("flow_support"),
    collagen_prescribed: bool(input.collagen_prescribed) || interventions.includes("collagen"),
    steroid_prescribed: bool(input.steroid_prescribed) || meds.includes("steroids") || interventions.includes("steroid"),
    aggressive_stimulation: bool(input.aggressive_stimulation),
    acute_nerve_pain: bool(input.acute_nerve_pain) || input.pain_type === "acute_nerve",
    stretching_prescribed: bool(input.stretching_prescribed) || interventions.includes("stretching"),
    early_mobilisation: bool(input.early_mobilisation) || interventions.includes("early_mobilisation"),
    treating_disc_only: bool(input.treating_disc_only),
    treating_radiculopathy_nerve_only: bool(input.treating_radiculopathy_nerve_only),
    local_tenderness: bool(input.local_tenderness) || symptoms.includes("local_tenderness"),
    postural_strain: bool(input.postural_strain) || symptoms.includes("postural_strain"),
    post_surgical_scarring: bool(input.post_surgical_scarring) || symptoms.includes("post_surgical_scarring") || westernDiagnosis === "post_surgical_spine",
    stiffness_greater_than_pain: bool(input.stiffness_greater_than_pain) || painQuality === "stiffness_tightness",
    radiating_pain: any([painLocation], ["radiating_arm", "radiating_leg"]) || symptoms.includes("radiating_pain"),
    no_large_herniation: bool(input.no_large_herniation) || !["herniation", "disc_bulge_herniation"].includes(imaging) && westernDiagnosis !== "disc_bulge_herniation",
    sacrum_treated: bool(input.sacrum_treated),
    occiput_released: bool(input.occiput_released),
    fascia_released: bool(input.fascia_released),
    debugMode: bool(input.debugMode)
  };
}

function addAxis(axis, points, inputName, reason) {
  axis.score = Math.min(10, axis.score + points);
  axis.evidence.push({ input: inputName, points, reason });
}

function scoreAxes(input) {
  const axes = Object.fromEntries(AXES.map((axis) => [
    axis.key,
    {
      ...axis,
      score: input[axis.score_key] || 0,
      evidence: input[axis.score_key] ? [{ input: axis.score_key, points: input[axis.score_key], reason: "explicit score input" }] : []
    }
  ]));

  if (input.morning_stiffness) addAxis(axes.disc, 2, "morning_stiffness", "disc hydration/matrix signal");
  if (input.load_position_dependence === "relieved_movement") addAxis(axes.disc, 2, "relieved_movement", "movement improves disc hydration pattern");
  if (input.pain_location === "lower_back") addAxis(axes.disc, 1, "lower_back", "chronic lower back contribution");
  if (["degenerative_disc_disease", "disc_bulge_herniation"].includes(input.western_diagnosis)) addAxis(axes.disc, 2, "western_diagnosis", "disc diagnosis maps to axis A");
  if (["disc_height_loss", "herniation", "bulge"].includes(input.imaging_findings)) addAxis(axes.disc, 2, "imaging_findings", "disc matrix or height change");
  if (input.cold_lower_back) addAxis(axes.disc, 1, "cold_lower_back", "cold spine / Yin support signal");
  if (input.fatigue_dominant) addAxis(axes.disc, 1, "fatigue_dominant", "recovery capacity load");
  if (input.load_position_dependence === "relieved_lying") addAxis(axes.disc, 1, "relieved_lying", "load relief suggests structural support need");

  if (input.stiffness_greater_than_pain) addAxis(axes.stasis, 2, "stiffness_greater_than_pain", "stasis/fascial dominance");
  if (input.load_position_dependence === "worse_sitting") addAxis(axes.stasis, 2, "worse_sitting", "prolonged sitting worsens fascial flow");
  if (input.local_tenderness) addAxis(axes.stasis, 2, "local_tenderness", "local fascial tenderness");
  if (input.postural_strain) addAxis(axes.stasis, 2, "postural_strain", "postural strain history");
  if (input.post_surgical_scarring) addAxis(axes.stasis, 2, "post_surgical_scarring", "scar tightness/stasis");
  if (input.pain_quality === "stiffness_tightness") addAxis(axes.stasis, 1, "pain_quality", "stiffness quality");

  if (input.radiating_pain) addAxis(axes.neurogenic, 3, "radiating_pain", "radiating limb pain");
  if (["burning", "electric_shooting"].includes(input.pain_quality)) addAxis(axes.neurogenic, 2, "pain_quality", "burning/electric nerve quality");
  if (input.night_pain || input.poor_sleep) addAxis(axes.neurogenic, 1, "night_pain", "night overstimulation layer");
  if (input.current_medications.includes("gabapentin_pregabalin")) addAxis(axes.neurogenic, 1, "gabapentinoid_response_context", "neuropathic medication context");
  if (input.dermatomal_spread) addAxis(axes.neurogenic, 2, "dermatomal_spread", "dermatomal spread");
  if (["radiculopathy", "spinal_stenosis", "CRPS"].includes(input.western_diagnosis)) addAxis(axes.neurogenic, 2, "western_diagnosis", "diagnosis maps to neurogenic overload");
  if (input.leg_numbness || input.neurological_deficit) addAxis(axes.neurogenic, 1, "neurological_signs", "numbness or deficit signal");

  if (["worse_standing", "worse_sitting"].includes(input.load_position_dependence)) addAxis(axes.deep_ligament, 2, "load_position_dependence", "positional loading");
  if (input.treatment_response === "pain_reduced_returns_with_load") addAxis(axes.deep_ligament, 2, "treatment_response", "improves then returns with load");
  if (input.instability_sensation) addAxis(axes.deep_ligament, 2, "instability_sensation", "segmental holding signal");
  if (input.morning_stiffness && input.end_day_fatigue) addAxis(axes.deep_ligament, 2, "morning_stiffness_end_day_fatigue", "deep ligament fatigue cycle");
  if (["spondylosis_osteophytes", "disc_height_loss", "facet_degeneration"].includes(input.imaging_findings)) addAxis(axes.deep_ligament, 2, "imaging_findings", "spondylosis/facet/deep ligament load");
  if (input.western_diagnosis === "spondylosis" || input.western_diagnosis === "facet_pain") addAxis(axes.deep_ligament, 3, "western_diagnosis", "capsulo-ligamentous classification");
  if (input.no_large_herniation && ["dull_deep_ache", "diffuse_uncertain", "sharp_with_movement"].includes(input.pain_quality)) addAxis(axes.deep_ligament, 1, "no_large_herniation", "disc may be passive witness");
  if (input.clicking_popping || input.pain_unpredictability) addAxis(axes.deep_ligament, 2, "clicking_or_unpredictability", "instability/laxity signal");

  return axes;
}

function sortedAxes(axisScores) {
  return Object.values(axisScores).sort((a, b) => b.score - a.score);
}

function determineLigamentSubtype(input, deepScore) {
  let hypo = 0;
  let hyper = 0;
  const hypoEvidence = [];
  const hyperEvidence = [];

  function addHypo(points, reason) {
    hypo += points;
    hypoEvidence.push(reason);
  }
  function addHyper(points, reason) {
    hyper += points;
    hyperEvidence.push(reason);
  }

  if (input.core_question_result === "cannot_hold") addHypo(5, "core question: cannot hold");
  if (input.core_question_result === "holding_too_much") addHyper(5, "core question: holding too much");
  if (input.core_question_result === "mixed") {
    addHypo(3, "core question mixed");
    addHyper(3, "core question mixed");
  }
  if (input.ligament_tone === "hypotonic") addHypo(4, "hypotonic ligament tone");
  if (input.ligament_tone === "hypertonic") addHyper(4, "hypertonic ligament tone");
  if (input.ligament_tone === "mixed") {
    addHypo(2, "mixed ligament tone");
    addHyper(2, "mixed ligament tone");
  }
  if (input.clicking_popping || input.systemic_laxity_signs || input.postpartum || input.hypothyroid || input.cold_extremities || input.bloating_food_intolerance) {
    addHypo(3, "systemic laxity / postpartum / cold / hypotonic signs");
  }
  if (input.fatigue_dominant || input.adrenal_fatigue) addHypo(2, "fatigue dominant / adrenal fatigue");
  if (input.liver_yang_rising) addHyper(3, "Liver Yang signs");
  if (["sharp_with_movement", "stiffness_tightness"].includes(input.pain_quality) || input.load_position_dependence === "worse_standing") {
    addHyper(1, "rigid or load-triggered guarding");
  }
  if (input.western_diagnosis === "facet_pain") addHyper(1, "facet/capsular guarding signal");

  if (deepScore < 3 && hypo === 0 && hyper === 0) {
    return { subtype: "not_assessed", pattern: "", hypo_score: hypo, hyper_score: hyper, evidence: [] };
  }
  if (Math.abs(hypo - hyper) <= 2 && hypo > 0 && hyper > 0) {
    return { subtype: "hybrid", pattern: "hybrid_yin_yang_spinal", hypo_score: hypo, hyper_score: hyper, evidence: [...hypoEvidence, ...hyperEvidence] };
  }
  if (hypo > hyper) {
    return { subtype: "hypotonic", pattern: "deep_ligament_segmental_instability_hypotonic", hypo_score: hypo, hyper_score: hyper, evidence: hypoEvidence };
  }
  return { subtype: "hypertonic", pattern: "deep_ligament_segmental_instability_hypertonic", hypo_score: hypo, hyper_score: hyper, evidence: hyperEvidence };
}

function ezContinuityState(input) {
  const state = input.EZ_state || (input.EZ_continuity === true ? "continuous" : input.EZ_continuity === false ? "fragmented" : "not_assessed");
  const continuity = input.EZ_continuity === null ? null : input.EZ_continuity && state !== "fragmented";
  const stage = state === "continuous"
    ? "acute/subacute"
    : state === "partially_fragmented"
      ? "subchronic"
      : state === "fragmented"
        ? "chronic Yin-deficiency neuropathic state"
        : "not assessed";
  const steroidSuitability = continuity === null
    ? "Hydration continuity was not assessed."
    : continuity
    ? "Consolidation therapies may be more plausible in this exploratory model."
    : "Hydration continuity appears reduced in this model; rebuild Yin/hydration support before relying on consolidation logic.";
  return {
    backend_entity: "EZ_water_grid",
    frontend_label: "Hydration Layer Integrity Failure",
    state,
    continuity,
    charge_coherence: continuity === null ? "not_assessed" : continuity ? "preserved_or_recoverable" : "reduced",
    pulse_coupling: state === "not_assessed" ? "not_assessed" : state === "fragmented" ? "uncoupled" : "partially_coupled",
    clinical_stage: stage,
    steroid_suitability: steroidSuitability,
    advanced_note: "Steroid = artificial Yang is an internal educational metaphor only, not established medical fact."
  };
}

function dominantPatternForAxis(axis, ligamentSubtype) {
  if (!axis || axis.score <= 0) return "";
  if (axis.key === "deep_ligament") return ligamentSubtype.pattern || "deep_ligament_segmental_instability_hypertonic";
  return axis.pattern;
}

function buildContraindications(input, dominantPattern, ligamentSubtype, triggered) {
  const contraindications = [];
  if (input.collagen_prescribed && !input.flow_support_present) contraindications.push("Collagen without flow support is contraindicated; pair collagen with MyBlood or equivalent flow support.");
  if (input.aggressive_stimulation && input.acute_nerve_pain) contraindications.push("Aggressive stimulation is contraindicated during acute nerve pain.");
  if (input.stretching_prescribed && ligamentSubtype.subtype === "hypotonic") contraindications.push("Stretching is contraindicated during hypotonic instability.");
  if (input.early_mobilisation && ligamentSubtype.subtype === "hypotonic") contraindications.push("Early mobilisation before holding tone restoration may worsen instability.");
  if (input.treating_disc_only) contraindications.push("Do not treat all spinal pain as disc-only; run the functional failure mode model.");
  if (input.treating_radiculopathy_nerve_only) contraindications.push("Do not treat all radiculopathy as nerve-only; check ligament, hydration, and flow layers.");
  if (triggered.some((item) => item.id === "B12_R005" || item.id === "B12_R006")) contraindications.push("Steroid/consolidation logic should not be primary when hydration continuity is fragmented in this model.");
  if (dominantPattern === "neurogenic_overload") contraindications.push("Avoid aggressive stimulation in acute neurogenic overload.");
  return [...new Set(contraindications)];
}

function sequencingFor(dominantPattern, mixedPattern, ligamentSubtype, input) {
  const sequence = [];
  if (mixedPattern) sequence.push("Mixed pattern: sequence, do not stack.");
  if (dominantPattern === "disc_dehydration_structural_failure") {
    sequence.push("Disc/matrix support: collagen + MyBlood or equivalent flow support together, adequate protein, hydration support.");
  }
  if (dominantPattern === "stasis_fascial_tension") {
    sequence.push("Stasis/fascial layer: MyBlood, weak ginger tea if appropriate, garlic only if sludging pattern, laser/fascia work; mobilisation only after stasis reduction.");
  }
  if (dominantPattern === "neurogenic_overload" || dominantPattern === "neuro_meningeal_hydration_failure") {
    sequence.push("Neurogenic layer: astaxanthin, spirulina, and melatonin only if night overstimulation is confirmed; avoid aggressive stimulation in acute phase.");
  }
  if (dominantPattern === "deep_ligament_segmental_instability_hypertonic") {
    sequence.push("Hypertonic ligament Phase 1: calm + support with collagen, spirulina, astaxanthin, gentle laser only; avoid strong MyBlood and aggressive mobilisation.");
    if (input.phase_current >= 2) sequence.push("Hypertonic ligament Phase 2: low-dose MyBlood and weak ginger tea for microflow support.");
    if (input.phase_current >= 3 || input.improvement_not_sustained) sequence.push("Hypertonic ligament Phase 3: low-dose ProCardiol for load-holding support.");
  }
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic") {
    sequence.push("Hypotonic ligament Phase 1 BUILD: collagen, spirulina, astaxanthin; no stretching, no mobilisation, no MyBlood initially.");
    if (input.phase_current >= 2) sequence.push("Hypotonic ligament Phase 2: Qi holding restoration with astragalus, ginseng, schisandra, Vitamin D + Nigella, and protein support.");
    if (input.phase_current >= 3 || input.improvement_not_sustained) sequence.push("Hypotonic ligament Phase 3: only after holding improves, low-dose MyBlood and extremely gentle ginger for secondary stagnation.");
  }
  if (dominantPattern === "hybrid_yin_yang_spinal" || ligamentSubtype.subtype === "hybrid") {
    sequence.push("Hybrid Yin/Yang pattern: BUILD first, MOVE later; never release and build at the same time.");
  }
  if (dominantPattern === "organ_instability_visceral_neural_overload" || input.organ_instability) {
    sequence.push("Organ-spine feedback: treat the organ pattern first; reduce afferent overload before chasing local spinal pain.");
  }
  if (!sequence.length) sequence.push("Insufficient dominant spinal evidence: reassess inputs and keep safety-first clinical review.");
  sequence.push("Reassess at 14-28 days: if disc stability improves, gradually return load; if nerve pain reduces, taper noise reduction while maintaining membrane protection.");
  return [...new Set(sequence)];
}

function evaluateSpinalFailureMode(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const axisScores = scoreAxes(input);
  const orderedAxes = sortedAxes(axisScores);
  const topAxis = orderedAxes[0];
  const secondAxis = orderedAxes[1];
  const mixedAxes = topAxis && secondAxis && topAxis.score >= 6 && secondAxis.score >= 5 && topAxis.score - secondAxis.score <= 2;
  const ligamentSubtype = determineLigamentSubtype(input, axisScores.deep_ligament.score);
  const hydrationLayer = ezContinuityState(input);

  if (input.pain_type === "intermittent" && input.EZ_state === "continuous") triggered.push(rule("B12_R001", "intermittent pain with continuous EZ state"));
  if (input.pain_type === "mixed" && input.EZ_state === "partially_fragmented") triggered.push(rule("B12_R002", "mixed pain with partially fragmented EZ state"));
  if (input.pain_type === "continuous_neuropathic" && input.EZ_state === "fragmented") triggered.push(rule("B12_R003", "continuous neuropathic pain with fragmented EZ state"));
  if (hydrationLayer.continuity === true) triggered.push(rule("B12_R004", "hydration continuity intact"));
  if (hydrationLayer.continuity === false) triggered.push(rule("B12_R005", "hydration continuity reduced"));
  if ((input.EZ_state === "fragmented" || hydrationLayer.continuity === false) && input.steroid_prescribed) triggered.push(rule("B12_R006", "steroid requested/prescribed with fragmented hydration layer"));

  let dominantPattern = dominantPatternForAxis(topAxis, ligamentSubtype);
  if (topAxis?.key === "disc") triggered.push(rule("B12_R007", "disc axis highest"));
  if (topAxis?.key === "stasis") triggered.push(rule("B12_R008", "stasis axis highest"));
  if (topAxis?.key === "neurogenic") triggered.push(rule("B12_R009", "neurogenic axis highest"));
  if (topAxis?.key === "deep_ligament") triggered.push(rule("B12_R010", "deep ligament axis highest"));

  if (topAxis?.key === "deep_ligament" && ligamentSubtype.subtype === "hypotonic") triggered.push(rule("B12_R011", "deep ligament cannot hold / hypotonic subtype"));
  if (topAxis?.key === "deep_ligament" && ligamentSubtype.subtype === "hypertonic") triggered.push(rule("B12_R012", "deep ligament holding too much / hypertonic subtype"));
  if (ligamentSubtype.subtype === "hybrid" || dominantPattern === "hybrid_yin_yang_spinal") {
    dominantPattern = "hybrid_yin_yang_spinal";
    triggered.push(rule("B12_R013", "hybrid Yin/Yang spinal pattern"));
  }
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic" && input.phase_current === 1) triggered.push(rule("B12_R014", "hypotonic ligament Phase 1"));
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic" && input.instability_sensation_reduced && input.pain_unpredictability_reduced) triggered.push(rule("B12_R015", "hypotonic instability and unpredictability reduced"));
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic" && input.improvement_not_sustained) triggered.push(rule("B12_R016", "hypotonic improvement not sustained"));
  if (dominantPattern === "deep_ligament_segmental_instability_hypertonic" && input.phase_current === 1) triggered.push(rule("B12_R017", "hypertonic ligament Phase 1"));

  if (input.collagen_prescribed && !input.flow_support_present) triggered.push(rule("B12_R018", "collagen without flow support"));
  if (input.aggressive_stimulation && input.acute_nerve_pain) triggered.push(rule("B12_R019", "aggressive stimulation during acute nerve pain"));
  if (input.stretching_prescribed && ligamentSubtype.subtype === "hypotonic") triggered.push(rule("B12_R020", "stretching during hypotonic instability"));
  if (input.western_diagnosis === "facet_pain") triggered.push(rule("B12_R021", "facet pain diagnosis"));
  if (input.no_large_herniation && ["dull_deep_ache", "diffuse_uncertain"].includes(input.pain_quality)) triggered.push(rule("B12_R022", "no large herniation with deep/diffuse positional pain"));
  if (input.organ_instability) triggered.push(rule("B12_R023", "organ instability present"));
  if (input.systemic_laxity_signs || input.cold_extremities || input.hypothyroid || input.adrenal_fatigue) triggered.push(rule("B12_R024", "systemic laxity or cold/hypothyroid/adrenal fatigue signs"));
  if (input.liver_yang_rising) triggered.push(rule("B12_R025", "Liver Yang rising signs"));
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic" && input.current_medications.includes("gabapentin_pregabalin")) triggered.push(rule("B12_R026", "Yin-type spinal pattern with gabapentinoid"));
  if (dominantPattern === "deep_ligament_segmental_instability_hypotonic" && input.current_medications.includes("NSAIDs")) triggered.push(rule("B12_R027", "Yin-type spinal pattern with NSAID"));
  if (input.disc_stability_at_reassessment === "improved") triggered.push(rule("B12_R028", "14-28 day reassessment: disc stability improved"));
  if (input.nerve_pain_at_reassessment === "reduced") triggered.push(rule("B12_R029", "14-28 day reassessment: nerve pain reduced"));
  if (input.sacrum_treated || input.occiput_released || input.fascia_released) triggered.push(rule("B12_R030", "craniosacral continuity sign"));

  const hydrationOverlayActive = Boolean(input.EZ_state) || input.steroid_response_history === "poor_none" || input.pain_type === "continuous_neuropathic";
  const organOverlayActive = input.organ_instability || input.visceral_organ_feedback !== "none";
  if (!dominantPattern && hydrationOverlayActive) dominantPattern = "neuro_meningeal_hydration_failure";
  if (!dominantPattern && organOverlayActive) dominantPattern = "organ_instability_visceral_neural_overload";

  const matchedPatterns = orderedAxes
    .filter((axis) => axis.score > 0)
    .map((axis) => dominantPatternForAxis(axis, ligamentSubtype))
    .filter(Boolean);
  if (hydrationOverlayActive) matchedPatterns.push("neuro_meningeal_hydration_failure");
  if (organOverlayActive) matchedPatterns.push("organ_instability_visceral_neural_overload");
  const uniquePatterns = [...new Set(matchedPatterns)];
  const contraindications = buildContraindications(input, dominantPattern, ligamentSubtype, triggered);
  const sequence = sequencingFor(dominantPattern, mixedAxes, ligamentSubtype, input);

  return {
    engine: "spinal_neuro_meningeal_failure_mode",
    name: "Spinal & Neuro-Meningeal Failure Mode Engine",
    source: ["avicenna_engine_batch12.json", "spinalFailureModeEngine.json"],
    active: Boolean(dominantPattern),
    primary_pattern: dominantPattern,
    primary_pattern_label: PATTERN_LABELS[dominantPattern] || "Unclear spinal failure mode",
    matched_patterns: uniquePatterns,
    mixed_pattern: Boolean(mixedAxes || ligamentSubtype.subtype === "hybrid"),
    dominant_failure_mode: topAxis || null,
    secondary_failure_modes: orderedAxes.slice(1).filter((axis) => axis.score > 0),
    axis_scores: axisScores,
    ligament_subtype: ligamentSubtype,
    EZ_continuity_state: hydrationLayer,
    steroid_suitability_logic: {
      visible_to_patient: false,
      suitability: hydrationLayer.steroid_suitability,
      clinician_note: hydrationLayer.advanced_note
    },
    pulse_plate_plexus_model: neuroMeningealConcepts.pulse_plate_plexus_model,
    organ_spine_feedback: {
      active: organOverlayActive,
      organ: input.visceral_organ_feedback,
      interpretation: "organ instability -> afferent overload -> DRG sensitisation -> sympathetic-maintained pain"
    },
    dural_craniosacral_continuity: neuroMeningealConcepts.concepts.find((item) => item.concept === "dural_craniosacral_continuity"),
    triggered_rules: uniqueRules(triggered),
    contraindications,
    suggested_sequence: sequence,
    reassessment_timing: "Reassess at 14-28 days.",
    spinal_concepts: spinalConcepts,
    neuro_meningeal_concepts: neuroMeningealConcepts,
    cross_batch_links: spinalFailureModeData.cross_batch_links || [],
    core_phrases: CORE_PHRASES,
    patient: {
      title: PATTERN_LABELS[dominantPattern] || "Spinal failure-mode pattern",
      summary: dominantPattern
        ? "This may reflect a functional spinal failure mode involving hydration, flow, load distribution, ligament holding, or neural damping. This is an educational pattern-recognition tool, not a medical diagnosis."
        : "No dominant spinal failure mode was identified from the current inputs. This is an educational pattern-recognition tool, not a medical diagnosis.",
      support_language: [
        "Support the dominant layer first.",
        "Restore holding before increasing movement when instability is present.",
        "Reduce overload before adding stimulation when nerve pain is active."
      ],
      sequence,
      safety_notes: [
        "This is an educational pattern-recognition tool, not a medical diagnosis.",
        "This tool does not replace imaging review, neurological examination, or standard medical care.",
        "Medication or injection decisions must be discussed with a clinician."
      ]
    },
    clinician: {
      axis_scores: axisScores,
      dominant_failure_mode: topAxis,
      secondary_failure_modes: orderedAxes.slice(1),
      ligament_subtype: ligamentSubtype,
      EZ_continuity_state: hydrationLayer,
      steroid_suitability_logic: {
        suitability: hydrationLayer.steroid_suitability,
        metaphor: "Steroid = artificial Yang",
        caution: "Clinician educational metaphor only; do not present as established medical fact."
      },
      pulse_plate_plexus_model: neuroMeningealConcepts.pulse_plate_plexus_model,
      organ_spine_feedback: {
        active: organOverlayActive,
        organ: input.visceral_organ_feedback,
        interpretation: "organ instability -> afferent overload -> DRG sensitisation -> sympathetic-maintained pain"
      },
      triggered_rules: uniqueRules(triggered),
      contraindications,
      suggested_sequence: sequence,
      reassessment_timing: "14-28 days",
      spinal_concepts: spinalConcepts,
      neuro_meningeal_concepts: neuroMeningealConcepts,
      primary_pattern_data: pattern(dominantPattern)
    }
  };
}

module.exports = {
  evaluateSpinalFailureMode,
  batch12Data,
  spinalFailureModeData,
  spinalConcepts,
  neuroMeningealConcepts
};
