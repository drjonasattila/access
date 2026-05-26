const DEFAULT_TERRAIN = {
  hydration: "balanced",
  thermal_tendency: "neutral",
  energetic_reserve: "stable",
  nervous_system: "stable",
  fascial_tension: "relaxed",
  autonomic_stability: "stable"
};

const FEATURE_RULES = [
  {
    id: "burning_pain",
    label: "Burning pain",
    patterns: ["burning pain", "burning", "burn", "hot pain"],
    feature: "neural hyperexcitability",
    terrain: { nervous_system: "hyperexcitable", thermal_tendency: "heat" },
    cluster: "neuropathic irritability"
  },
  {
    id: "electric_shock_pain",
    label: "Electric shock pain",
    patterns: ["electric shock", "shock pain", "zapping", "electric"],
    feature: "neural irritability",
    terrain: { nervous_system: "hyperexcitable" },
    cluster: "neuropathic irritability"
  },
  {
    id: "allodynia",
    label: "Allodynia",
    patterns: ["allodynia", "touch sensitivity", "clothing sensitivity", "skin sensitivity"],
    feature: "sensory sensitisation",
    terrain: { nervous_system: "hyperexcitable" },
    cluster: "sensory sensitisation"
  },
  {
    id: "dry_stool",
    label: "Dry stool",
    patterns: ["dry stool", "hard stool", "constipation", "straining"],
    feature: "dry terrain",
    terrain: { hydration: "dry" },
    cluster: "dryness"
  },
  {
    id: "dry_skin",
    label: "Dry skin",
    patterns: ["dry skin", "flaky skin", "dry mouth", "dryness"],
    feature: "dry terrain",
    terrain: { hydration: "dry" },
    cluster: "dryness"
  },
  {
    id: "afternoon_worsening",
    label: "Afternoon worsening",
    patterns: ["afternoon worsening", "worse afternoon", "afternoon crash", "late day crash"],
    feature: "depleted reserve",
    terrain: { energetic_reserve: "depleted" },
    cluster: "low reserve"
  },
  {
    id: "weather_sensitivity",
    label: "Weather sensitivity",
    patterns: ["weather sensitivity", "barometric", "humidity sensitive", "rain sensitivity"],
    feature: "unstable fascia/environmental sensitivity",
    terrain: { fascial_tension: "stagnant", autonomic_stability: "unstable" },
    cluster: "environmental sensitivity"
  },
  {
    id: "palpitations",
    label: "Palpitations",
    patterns: ["palpitations", "heart racing", "fluttering", "tachy"],
    feature: "autonomic instability",
    terrain: { autonomic_stability: "unstable", nervous_system: "hyperexcitable" },
    cluster: "autonomic activation"
  },
  {
    id: "insomnia",
    label: "Insomnia",
    patterns: ["insomnia", "cannot sleep", "sleep onset", "night waking", "wired at night"],
    feature: "autonomic instability",
    terrain: { autonomic_stability: "unstable", nervous_system: "hyperexcitable" },
    cluster: "sleep disruption"
  },
  {
    id: "pemf_use",
    label: "PEMF use",
    patterns: ["pemf", "olylife", "pulsed electromagnetic"],
    feature: "stimulation tolerance risk",
    risk: "stimulation tolerance risk",
    cluster: "intervention sensitivity"
  },
  {
    id: "damp_heavy",
    label: "Damp-heavy signal",
    patterns: ["damp", "heavy", "brain fog", "sluggish", "edema", "oedema", "swollen"],
    feature: "damp/heavy terrain",
    terrain: { hydration: "damp" },
    cluster: "damp heaviness"
  },
  {
    id: "locked_fascia",
    label: "Locked fascia",
    patterns: ["locked", "stiff", "frozen", "restricted fascia", "tight fascia"],
    feature: "locked fascial tension",
    terrain: { fascial_tension: "locked" },
    cluster: "fascial restriction"
  },
  {
    id: "collapsed_state",
    label: "Collapsed state",
    patterns: ["collapsed", "crashed", "shutdown", "exhausted"],
    feature: "collapsed nervous system",
    terrain: { nervous_system: "collapsed", energetic_reserve: "depleted" },
    cluster: "low reserve"
  }
];

const MONITORING_FIELD_RULES = [
  {
    id: "burning_pain",
    label: "Burning pain",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate burning or heat-like pain intensity.",
    when: ({ features, terrain }) => features.includes("burning_pain") || terrain.nervous_system === "hyperexcitable"
  },
  {
    id: "electric_shock",
    label: "Electric shock",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate zapping, shock-like or sudden neural irritability.",
    when: ({ features, terrain }) => features.includes("electric_shock_pain") || terrain.nervous_system === "hyperexcitable"
  },
  {
    id: "allodynia",
    label: "Allodynia",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate touch sensitivity, clothing sensitivity or skin-level irritability.",
    when: ({ features, terrain }) => features.includes("allodynia") || terrain.nervous_system === "hyperexcitable"
  },
  {
    id: "sleep_quality",
    label: "Sleep quality",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Track sleep onset, night waking and next-morning recovery.",
    when: ({ features, terrain, goals }) => features.includes("insomnia") || terrain.autonomic_stability === "unstable" || goals.some((goal) => goal.includes("sleep"))
  },
  {
    id: "hydration_intake",
    label: "Hydration intake",
    type: "quantity",
    unit: "daily intake",
    prompt: "Record fluid intake and perceived tissue hydration.",
    when: ({ terrain, goals }) => terrain.hydration === "dry" || goals.some((goal) => goal.includes("hydration"))
  },
  {
    id: "stool_dryness",
    label: "Stool dryness",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate stool dryness, hardness and ease of elimination.",
    when: ({ features, terrain }) => features.includes("dry_stool") || terrain.hydration === "dry"
  },
  {
    id: "palpitations",
    label: "Palpitations",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate heart racing, fluttering or activation surges.",
    when: ({ features, terrain }) => features.includes("palpitations") || terrain.autonomic_stability === "unstable"
  },
  {
    id: "pemf_duration_intensity",
    label: "PEMF duration/intensity",
    type: "intervention_log",
    unit: "minutes/intensity",
    prompt: "Record PEMF duration, intensity and timing.",
    when: ({ risks }) => risks.includes("stimulation tolerance risk")
  },
  {
    id: "next_day_overstimulation",
    label: "Next-day overstimulation",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate next-day wired feeling, flare, agitation, headache or poor sleep.",
    when: ({ risks, terrain }) => risks.includes("stimulation tolerance risk") || terrain.nervous_system === "hyperexcitable"
  },
  {
    id: "energy_reserve",
    label: "Energy reserve",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate baseline energy, afternoon reserve and recovery after activity.",
    when: ({ terrain, features }) => terrain.energetic_reserve === "depleted" || features.includes("afternoon_worsening")
  },
  {
    id: "fascial_weather_response",
    label: "Fascial/weather response",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate weather sensitivity, stiffness, pressure response and environmental reactivity.",
    when: ({ terrain, features }) => terrain.fascial_tension !== "relaxed" || features.includes("weather_sensitivity")
  },
  {
    id: "damp_heaviness",
    label: "Damp/heavy feeling",
    type: "scale",
    scale: "0-10",
    unit: "0-10",
    prompt: "Rate heaviness, puffiness, fogginess or sluggish drainage.",
    when: ({ terrain }) => terrain.hydration === "damp"
  }
];

const TERRAIN_PRECEDENCE = {
  hydration: ["dry", "damp", "balanced"],
  thermal_tendency: ["heat", "cold", "neutral"],
  energetic_reserve: ["overcharged", "depleted", "stable"],
  nervous_system: ["hyperexcitable", "collapsed", "stable"],
  fascial_tension: ["locked", "stagnant", "relaxed"],
  autonomic_stability: ["unstable", "stable"]
};

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[_-]/g, " ").trim();
}

function toTextPool(input) {
  const values = [
    input.free_text,
    input.notes,
    input.terrain_notes,
    ...(input.symptoms || []),
    ...(input.goals || []),
    ...(input.user_goals || []),
    ...(input.interventions || []),
    ...(input.interventions_used || []),
    ...(input.safety_flags || [])
  ];

  return values.map(normalize).join(" | ");
}

function prefer(current, candidate, dimension) {
  if (!candidate) return current;
  const order = TERRAIN_PRECEDENCE[dimension] || [];
  return order.indexOf(candidate) < order.indexOf(current) ? candidate : current;
}

function extractFeatures(input = {}) {
  const textPool = toTextPool(input);
  const features = [];
  const symptomClusters = [];
  const interventionRisks = [];
  const evidence = [];
  const terrain = { ...DEFAULT_TERRAIN };

  FEATURE_RULES.forEach((rule) => {
    const matched = rule.patterns.some((pattern) => textPool.includes(pattern));
    if (!matched) return;

    features.push({
      id: rule.id,
      label: rule.label,
      interpreted_as: rule.feature,
      evidence: rule.patterns.filter((pattern) => textPool.includes(pattern))
    });
    if (rule.cluster && !symptomClusters.includes(rule.cluster)) symptomClusters.push(rule.cluster);
    if (rule.risk && !interventionRisks.includes(rule.risk)) interventionRisks.push(rule.risk);
    if (rule.terrain) {
      Object.entries(rule.terrain).forEach(([dimension, value]) => {
        terrain[dimension] = prefer(terrain[dimension], value, dimension);
      });
    }
    evidence.push(`${rule.label} -> ${rule.feature}`);
  });

  return {
    raw_text_pool: textPool,
    features,
    symptom_clusters: symptomClusters,
    intervention_risks: interventionRisks,
    terrain_dimensions: terrain,
    evidence
  };
}

function detectUncertainty(input = {}, extracted) {
  const uncertainty = [];
  const terrain = extracted.terrain_dimensions;
  const featureIds = extracted.features.map((feature) => feature.id);

  if (terrain.hydration === "dry" && extracted.raw_text_pool.includes("damp")) {
    uncertainty.push({
      id: "dry_damp_mixed",
      label: "Mixed dry and damp signals",
      question: "Which signal is dominant today: dryness, heaviness, or alternating states?"
    });
  }

  if (terrain.nervous_system === "hyperexcitable" && terrain.energetic_reserve === "depleted") {
    uncertainty.push({
      id: "wired_depleted",
      label: "Wired but depleted pattern",
      question: "Is the system overstimulated, under-recovered, or both?"
    });
  }

  if (featureIds.includes("pemf_use") && terrain.nervous_system === "hyperexcitable") {
    uncertainty.push({
      id: "pemf_tolerance_unknown",
      label: "PEMF tolerance unclear",
      question: "Does PEMF improve regulation, or create next-day overstimulation?"
    });
  }

  if (!extracted.features.length) {
    uncertainty.push({
      id: "low_signal_input",
      label: "Insufficient signal detail",
      question: "Which symptom, terrain feature or intervention response should be observed first?"
    });
  }

  return uncertainty;
}

function generateAdaptiveQuestions(extracted, uncertainty) {
  const questions = [];
  const terrain = extracted.terrain_dimensions;

  if (terrain.hydration === "dry") questions.push("Are dryness signs improving, worsening or alternating with heaviness?");
  if (terrain.nervous_system === "hyperexcitable") questions.push("Which sensory signals flare first: burning, shock pain, allodynia, sleep disruption or palpitations?");
  if (terrain.energetic_reserve === "depleted") questions.push("Does activity cause same-day fatigue, next-day crash or afternoon worsening?");
  if (extracted.intervention_risks.includes("stimulation tolerance risk")) questions.push("What PEMF duration and intensity are tolerated without next-day overstimulation?");
  uncertainty.forEach((item) => questions.push(item.question));

  return [...new Set(questions)];
}

function generateMonitoringFields(extracted, uncertainty, goals = []) {
  const context = {
    features: extracted.features.map((feature) => feature.id),
    terrain: extracted.terrain_dimensions,
    clusters: extracted.symptom_clusters,
    risks: extracted.intervention_risks,
    uncertainty: uncertainty.map((item) => item.id),
    goals: goals.map(normalize)
  };

  return MONITORING_FIELD_RULES
    .filter((rule) => rule.when(context))
    .map(({ when, ...field }) => ({
      ...field,
      cadence: field.id.includes("pemf") ? "each use" : "daily",
      required: [
        "burning_pain",
        "electric_shock",
        "allodynia",
        "sleep_quality",
        "hydration_intake",
        "stool_dryness",
        "palpitations",
        "pemf_duration_intensity",
        "next_day_overstimulation"
      ].includes(field.id)
    }));
}

function describeTerrain(terrain) {
  const parts = [];
  if (terrain.hydration !== "balanced") parts.push(terrain.hydration);
  if (terrain.nervous_system === "hyperexcitable") parts.push("hyperexcitable");
  if (terrain.energetic_reserve === "depleted") parts.push("low reserve");
  if (terrain.thermal_tendency === "heat") parts.push("heat-leaning");
  if (terrain.hydration === "damp") parts.push("damp/heavy");
  if (terrain.fascial_tension !== "relaxed") parts.push(`${terrain.fascial_tension} fascia`);
  if (terrain.autonomic_stability === "unstable") parts.push("autonomically unstable");
  return parts.length ? parts.join(" ") : "mixed or stable";
}

function createEducationalSummary(extracted, monitoringFields) {
  const terrainPhrase = describeTerrain(extracted.terrain_dimensions);
  const fieldList = monitoringFields.map((field) => field.label.toLowerCase()).join(", ");

  return {
    headline: `Based on the information provided, this pattern resembles a ${terrainPhrase} terrain.`,
    interpretation: "This is a disease-independent monitoring schema generated from terrain features, symptom clusters, uncertainty, intervention risks and user goals.",
    monitoring_focus: fieldList
      ? `Suggested monitoring focuses: ${fieldList}.`
      : "Suggested monitoring focus is broad self-observation until more specific signals are available.",
    validation_note: "Human professional validation is advised."
  };
}

function generateAdaptiveMonitoringSchema(rawInput = {}) {
  const extracted = extractFeatures(rawInput);
  const unresolvedUncertainty = detectUncertainty(rawInput, extracted);
  const goals = [...(rawInput.goals || []), ...(rawInput.user_goals || [])];
  const adaptiveQuestions = generateAdaptiveQuestions(extracted, unresolvedUncertainty);
  const monitoringFields = generateMonitoringFields(extracted, unresolvedUncertainty, goals);
  const educationalSummary = createEducationalSummary(extracted, monitoringFields);

  return {
    version: "adaptive-monitoring-v1",
    disease_independent: true,
    flow: [
      "raw_input",
      "feature_extraction",
      "terrain_dimensions",
      "adaptive_questions",
      "generated_monitoring_schema",
      "educational_summary"
    ],
    raw_input: rawInput,
    extracted_features: extracted.features,
    terrain_dimensions: extracted.terrain_dimensions,
    symptom_clusters: extracted.symptom_clusters,
    unresolved_uncertainty: unresolvedUncertainty,
    intervention_risks: extracted.intervention_risks,
    user_goals: goals,
    adaptive_questions: adaptiveQuestions,
    monitoring_schema: {
      fields: monitoringFields,
      generated_from: {
        terrain_dimensions: extracted.terrain_dimensions,
        symptom_clusters: extracted.symptom_clusters,
        unresolved_uncertainty: unresolvedUncertainty.map((item) => item.id),
        intervention_risks: extracted.intervention_risks,
        user_goals: goals
      }
    },
    educational_summary: educationalSummary,
    evidence: extracted.evidence
  };
}

module.exports = {
  DEFAULT_TERRAIN,
  FEATURE_RULES,
  MONITORING_FIELD_RULES,
  extractFeatures,
  detectUncertainty,
  generateAdaptiveQuestions,
  generateMonitoringFields,
  createEducationalSummary,
  generateAdaptiveMonitoringSchema
};
