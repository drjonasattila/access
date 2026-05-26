function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function textList(value) {
  return list(value).map((item) => String(item).toLowerCase());
}

function addUnique(target, value) {
  if (value && !target.includes(value)) target.push(value);
}

function includesAny(items, needles) {
  return items.some((item) => needles.some((needle) => item.includes(needle)));
}

function collectSignals(input, context) {
  const symptoms = list(input.symptoms);
  const safetyFlags = list(input.safety_flags);
  const interventions = textList([
    ...list(input.interventions),
    ...list(input.current_interventions),
    input.intervention,
    input.pemf_use || input.pemf_active || input.pemf_requested ? "pemf" : null
  ]);
  const goals = textList([...(list(input.user_goals)), ...(list(input.goals))]);
  const avoid = textList(context.avoid);
  const modifications = textList(context.modifications_applied);
  const followUps = textList(context.follow_up_questions);
  const patterns = textList([context.primary_pattern, context.secondary_pattern]);

  return { symptoms, safetyFlags, interventions, goals, avoid, modifications, followUps, patterns };
}

function detectTerrainDimensions(input, signals) {
  const dimensions = [];

  if (input.moisture === "dry" || signals.symptoms.some((symptom) => ["dry_mouth", "constipation_dry"].includes(symptom)) || signals.patterns.includes("dry_heat") || signals.patterns.includes("dry_cold")) {
    addUnique(dimensions, "dryness");
  }
  if (input.moisture === "damp" || signals.symptoms.some((symptom) => ["bloating", "brain_fog", "loose_stool"].includes(symptom)) || signals.patterns.includes("damp_heat") || signals.patterns.includes("damp_cold")) {
    addUnique(dimensions, "dampness");
  }
  if (input.thermal === "heat" || signals.patterns.includes("dry_heat") || signals.patterns.includes("damp_heat")) {
    addUnique(dimensions, "heat");
  }
  if (input.thermal === "cold" || signals.symptoms.includes("cold_hands_feet") || signals.patterns.includes("dry_cold") || signals.patterns.includes("damp_cold")) {
    addUnique(dimensions, "cold");
  }
  if (input.energy_state === "overcharged" || signals.symptoms.some((symptom) => ["irritability", "palpitations"].includes(symptom)) || signals.patterns.includes("overcharged")) {
    addUnique(dimensions, "hyperexcitability");
  }
  if (input.energy_state === "undercharged" || input.frailty || signals.patterns.includes("undercharged")) {
    addUnique(dimensions, "low_reserve");
  }

  return dimensions;
}

function detectSymptomClusters(signals) {
  const clusters = [];

  if (signals.symptoms.some((symptom) => ["dry_mouth", "constipation_dry"].includes(symptom))) {
    addUnique(clusters, "dryness_cluster");
  }
  if (signals.symptoms.some((symptom) => ["irritability", "palpitations"].includes(symptom))) {
    addUnique(clusters, "excitability_cluster");
  }
  if (signals.symptoms.some((symptom) => ["bloating", "brain_fog", "loose_stool"].includes(symptom))) {
    addUnique(clusters, "damp_digestive_cluster");
  }
  if (signals.symptoms.includes("cold_hands_feet")) {
    addUnique(clusters, "peripheral_cold_cluster");
  }

  return clusters;
}

function detectUncertainty(input, signals, context) {
  const uncertainty = [];

  if (context.primary_pattern === "mixed_pattern" || signals.modifications.some((item) => item.includes("mixed signals"))) {
    addUnique(uncertainty, "mixed_terrain");
  }
  if (signals.followUps.length > 0) addUnique(uncertainty, "needs_reassessment");
  if (signals.symptoms.includes("loose_stool") && signals.symptoms.includes("constipation_dry")) {
    addUnique(uncertainty, "alternating_bowel_pattern");
  }
  if (input.thermal === "cold" && input.energy_state === "overcharged") {
    addUnique(uncertainty, "cold_overcharged_conflict");
  }

  return uncertainty;
}

function detectInterventionRisks(signals) {
  const risks = [];

  if (includesAny(signals.interventions, ["pemf", "electromagnetic"])) addUnique(risks, "pemf");
  if (includesAny(signals.interventions, ["stimulant", "ginseng", "caffeine"]) || includesAny(signals.avoid, ["stimulant", "heating spices", "ginseng"])) {
    addUnique(risks, "overstimulation");
  }
  if (signals.safetyFlags.includes("palpitations_flag") || signals.safetyFlags.includes("hypertension")) {
    addUnique(risks, "cardiovascular_sensitivity");
  }
  if (signals.safetyFlags.includes("gastritis")) addUnique(risks, "mucosal_sensitivity");
  if (signals.safetyFlags.includes("anticoagulants")) addUnique(risks, "bleeding_caution");
  if (signals.safetyFlags.includes("pregnancy")) addUnique(risks, "pregnancy_caution");

  return risks;
}

function createField(id, label, prompt, source, cadence = "daily") {
  return {
    id,
    label,
    cadence,
    prompt,
    source: [...new Set(source)]
  };
}

function addField(fields, field) {
  if (!fields.some((existing) => existing.id === field.id)) fields.push(field);
}

function generateMonitoringSchema(input = {}, context = {}) {
  const signals = collectSignals(input, context);
  const terrainDimensions = detectTerrainDimensions(input, signals);
  const symptomClusters = detectSymptomClusters(signals);
  const uncertaintyPatterns = detectUncertainty(input, signals, context);
  const interventionRisks = detectInterventionRisks(signals);
  const userGoals = signals.goals;
  const fields = [];
  const has = (items, value) => items.includes(value);

  if (has(terrainDimensions, "hyperexcitability") || has(symptomClusters, "excitability_cluster") || userGoals.includes("sleep")) {
    addField(fields, createField("sleep", "Sleep", "Sleep onset, night waking, dreams, and next-morning refreshment.", ["terrain:hyperexcitability", "goal:sleep"]));
    addField(fields, createField("burning_pain", "Burning pain", "Burning, heat-like pain, tingling intensity, and flare duration.", ["terrain:hyperexcitability"]));
    addField(fields, createField("allodynia", "Allodynia", "Touch sensitivity, clothing sensitivity, and skin-level irritability.", ["terrain:hyperexcitability"]));
  }

  if (has(terrainDimensions, "dryness") || userGoals.includes("hydration")) {
    addField(fields, createField("hydration", "Hydration", "Thirst, mouth dryness, urine concentration, and perceived tissue dryness.", ["terrain:dryness", "goal:hydration"]));
    addField(fields, createField("stool_dryness", "Stool dryness", "Dryness, hardness, ease of bowel movement, and need to strain.", ["terrain:dryness"]));
  }

  if (signals.symptoms.includes("palpitations") || has(interventionRisks, "cardiovascular_sensitivity") || has(terrainDimensions, "hyperexcitability")) {
    addField(fields, createField("palpitations", "Palpitations", "Heart racing, skipped beats, chest flutter, and anxiety-linked surges.", ["symptom:palpitations", "risk:cardiovascular_sensitivity"]));
  }

  if (has(interventionRisks, "pemf")) {
    addField(fields, createField("pemf_tolerance", "PEMF tolerance", "Session intensity, immediate comfort, symptom shift during use, and recovery after use.", ["risk:pemf"]));
    addField(fields, createField("next_day_overstimulation", "Next-day overstimulation", "Wired feeling, poorer sleep, agitation, headache, palpitations, or pain flare the next day.", ["risk:pemf", "risk:overstimulation"]));
  }

  if (has(terrainDimensions, "dampness") || has(symptomClusters, "damp_digestive_cluster")) {
    addField(fields, createField("bloating", "Bloating", "Abdominal pressure, fullness, gas, and post-meal heaviness.", ["terrain:dampness"]));
    addField(fields, createField("brain_fog", "Brain fog", "Clarity, heaviness, focus, and mental fatigue.", ["terrain:dampness"]));
    addField(fields, createField("stool_looseness", "Stool looseness", "Loose stool, urgency, mucus-like heaviness, and digestive tolerance.", ["terrain:dampness"]));
  }

  if (has(terrainDimensions, "cold") || has(symptomClusters, "peripheral_cold_cluster")) {
    addField(fields, createField("peripheral_warmth", "Peripheral warmth", "Hands, feet, lower abdomen warmth, and cold sensitivity.", ["terrain:cold"]));
  }

  if (has(terrainDimensions, "low_reserve") || userGoals.includes("energy")) {
    addField(fields, createField("morning_energy", "Morning energy", "Ease of waking, baseline stamina, and post-activity recovery.", ["terrain:low_reserve", "goal:energy"]));
  }

  if (uncertaintyPatterns.length > 0) {
    addField(fields, createField("pattern_stability", "Pattern stability", "Which signal is dominant today: dry, damp, cold, heat, overcharged, or depleted?", ["uncertainty"], "each check-in"));
  }

  if (has(interventionRisks, "mucosal_sensitivity")) {
    addField(fields, createField("gastric_tolerance", "Gastric tolerance", "Burning, nausea, reflux, stomach pain, or irritation after protocol use.", ["risk:mucosal_sensitivity"]));
  }

  if (has(interventionRisks, "bleeding_caution")) {
    addField(fields, createField("bleeding_signals", "Bleeding signals", "Unusual bruising, gum bleeding, nosebleed, or medication interaction concerns.", ["risk:bleeding_caution"], "as needed"));
  }

  return {
    mode: "dynamic_runtime",
    principle: "Generated from terrain features, symptom clusters, uncertainty, intervention risks, and goals - not disease categories.",
    terrain_dimensions: terrainDimensions,
    symptom_clusters: symptomClusters,
    uncertainty_patterns: uncertaintyPatterns,
    intervention_risks: interventionRisks,
    user_goals: userGoals,
    fields,
    summary: fields.length
      ? `Monitor ${fields.length} dynamic dimension(s) matched to the current terrain and intervention context.`
      : "No specific monitoring dimensions detected yet; reassess as terrain signals or goals become clearer."
  };
}

module.exports = { generateMonitoringSchema };
