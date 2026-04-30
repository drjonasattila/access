const {
  PROTOCOLS,
  SECONDARY_HERBS,
  PRIMARY_CONFLICTS,
  NEUTRAL_BASELINE
} = require("./data/protocols.json");

function identifyPattern(thermal, moisture, energyState) {
  if (thermal === "cold" && moisture === "damp") return "damp_cold";
  if (thermal === "heat" && moisture === "damp") return "damp_heat";
  if (thermal === "heat" && moisture === "dry") return "dry_heat";
  if (thermal === "cold" && moisture === "dry") return "dry_cold";
  if (thermal === "neutral" && moisture === "neutral" && energyState === "undercharged") return "undercharged";
  if (thermal === "neutral" && moisture === "neutral" && energyState === "overcharged") return "overcharged";
  if (thermal === "neutral" && moisture === "neutral") return "neutral_baseline";
  return "mixed_pattern";
}

function inferDominantFromMixed(thermal, moisture, energyState, symptoms) {
  if (
    energyState === "overcharged" ||
    symptoms.includes("irritability") ||
    symptoms.includes("palpitations")
  ) {
    if (thermal === "heat" && moisture === "dry") return "dry_heat";
    if (thermal === "heat") return "damp_heat";
    return "overcharged";
  }

  if (moisture === "damp" || symptoms.includes("bloating") || symptoms.includes("brain_fog")) {
    return thermal === "heat" ? "damp_heat" : "damp_cold";
  }

  if (moisture === "dry") return thermal === "cold" ? "dry_cold" : "dry_heat";
  return "damp_cold";
}

function resolveStrength(symptomIntensity, frailty) {
  const map = { mild: "light", moderate: "medium", strong: "strong" };
  let strength = map[symptomIntensity] || "light";

  if (frailty) {
    if (strength === "strong") strength = "medium";
    else if (strength === "medium") strength = "light";
    else strength = "frailty_floor";
  }

  return strength;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function herbKey(herb) {
  return herb.name.toLowerCase();
}

function hasHerb(herbs, nameOrFragment) {
  const needle = nameOrFragment.toLowerCase();
  return herbs.some((herb) => herbKey(herb).includes(needle));
}

function applyDigestiveSensitivity(herbs, sensitivity, pattern) {
  if (sensitivity !== "high") return { herbs, applied: false };

  const remove = new Set(["black pepper", "mustard seed", "clove", "ginger"]);
  const filtered = herbs.filter((herb) => !remove.has(herbKey(herb)));

  if (filtered.length < 2) {
    filtered.push({ name: "Fennel seed", amount: "1/2 tsp", role: "gentle aromatic fallback" });
    if (pattern === "damp_cold") {
      filtered.push({ name: "Anise", amount: "1/4 tsp", role: "gentle warming aromatic" });
    }
  }

  return { herbs: filtered, applied: true };
}

function integrateSecondary(herbs, primaryPattern, energyState, trace) {
  if (energyState === "neutral" || primaryPattern === energyState) return herbs;

  const secondaryHerbs = SECONDARY_HERBS[energyState];
  if (!secondaryHerbs) return herbs;

  const blocked = PRIMARY_CONFLICTS[primaryPattern] || [];
  let added = 0;

  secondaryHerbs.forEach((herb) => {
    if (added >= 2) return;

    if (blocked.includes(herbKey(herb))) {
      trace.push(`STEP 10: Secondary "${herb.name}" omitted - conflicts with ${primaryPattern}`);
      return;
    }

    herbs.push({ ...herb });
    added += 1;
    trace.push(`STEP 10: Secondary "${herb.name}" added - ${energyState} support`);
  });

  return herbs;
}

const MODIFIER_PRIORITY = {
  palpitations: 1,
  irritability: 2,
  brain_fog: 1,
  bloating: 1,
  dry_mouth: 2,
  cold_hands_feet: 2,
  loose_stool: 3,
  constipation_dry: 2
};

function applyModifiers(herbs, symptoms, pattern, frailty) {
  const applied = [];
  const avoid = [];
  const followUps = [];
  const hasLoose = symptoms.includes("loose_stool");
  const hasConstipation = symptoms.includes("constipation_dry");

  if (hasLoose && hasConstipation) {
    followUps.push("You selected both loose stool and constipation - which tendency is more frequent?");
  }

  const active = symptoms
    .filter((symptom) => MODIFIER_PRIORITY[symptom] !== undefined)
    .filter((symptom) => !(symptom === "loose_stool" && hasConstipation))
    .filter((symptom) => !(symptom === "constipation_dry" && hasLoose))
    .sort((a, b) => MODIFIER_PRIORITY[a] - MODIFIER_PRIORITY[b]);

  const maxMods = frailty ? 1 : 2;
  const toApply = active.slice(0, maxMods);

  if (active.length > maxMods) {
    followUps.push(`${active.length - maxMods} modifier(s) deferred: ${active.slice(maxMods).join(", ").replace(/_/g, " ")}.`);
  }

  toApply.forEach((symptom) => {
    switch (symptom) {
      case "dry_mouth":
        herbs = herbs.filter((herb) => !["black pepper", "mustard seed", "clove"].includes(herbKey(herb)));
        if (!hasHerb(herbs, "honey")) herbs.push({ name: "Honey", amount: "1/2 tsp", role: "moistens" });
        applied.push("dry mouth - drying spices removed, honey added");
        break;
      case "bloating":
        if (!hasHerb(herbs, "cardamom")) herbs.push({ name: "Cardamom", amount: "6 pods", role: "aromatic - relieves bloating" });
        applied.push("bloating - aromatic movers prioritised");
        break;
      case "cold_hands_feet":
        if (pattern !== "overcharged") {
          if (!hasHerb(herbs, "ginger")) herbs.push({ name: "Ginger", amount: "2 slices", role: "warms periphery" });
          else if (!hasHerb(herbs, "cinnamon")) herbs.push({ name: "Cinnamon", amount: "small piece", role: "warms periphery" });
          applied.push("cold hands/feet - warming herb added");
        } else {
          applied.push("cold hands/feet - skipped, overcharged state prevents heating");
        }
        break;
      case "irritability":
        herbs = herbs.filter((herb) => !["black pepper", "mustard seed"].includes(herbKey(herb)));
        if (!hasHerb(herbs, "rose petals")) herbs.push({ name: "Rose petals", amount: "1 tsp", role: "calms and soothes" });
        applied.push("irritability - rose added, stimulating spices reduced");
        break;
      case "brain_fog":
        if (!hasHerb(herbs, "cardamom")) herbs.push({ name: "Cardamom", amount: "6 pods", role: "aromatic clarity" });
        applied.push("brain fog - aromatic clarity herbs prioritised");
        break;
      case "loose_stool":
        herbs = herbs.filter((herb) => !["chia seed", "basil seed", "soaked chia seed"].includes(herbKey(herb)));
        applied.push("loose stool - seed moisteners removed");
        break;
      case "constipation_dry":
        if (!hasHerb(herbs, "chia")) herbs.push({ name: "Soaked chia seed", amount: "1 tsp", role: "adds moisture gently" });
        applied.push("dry constipation - chia added for moisture");
        break;
      case "palpitations":
        herbs = herbs.filter((herb) => !["ginseng", "mustard seed", "black pepper", "clove"].includes(herbKey(herb)));
        if (!hasHerb(herbs, "rose petals")) herbs.push({ name: "Rose petals", amount: "1 tsp", role: "calms" });
        avoid.push("strong stimulants (ginseng, pepper, mustard)");
        applied.push("palpitations - stimulants removed, rose added");
        break;
      default:
        break;
    }
  });

  return { herbs, applied, avoid, followUps };
}

function applySafetyFlags(herbs, safetyFlags) {
  const blocked = new Set();
  const notes = [];

  if (safetyFlags.includes("pregnancy")) {
    ["mustard seed", "clove", "he shou wu", "black pepper"].forEach((herb) => blocked.add(herb));
    notes.push("Strong heating spices avoided - pregnancy noted. Check all herbs with your midwife or clinician.");
  }

  if (
    safetyFlags.includes("gastritis") ||
    safetyFlags.includes("hypertension") ||
    safetyFlags.includes("palpitations_flag")
  ) {
    ["black pepper", "mustard seed", "clove"].forEach((herb) => blocked.add(herb));
    notes.push("Strong stimulating spices avoided - digestive or cardiovascular sensitivity noted.");
  }

  if (safetyFlags.includes("anticoagulants")) {
    notes.push("If turmeric or high-dose ginger are ever added, check with your clinician first.");
  }

  return { herbs: herbs.filter((herb) => !blocked.has(herbKey(herb))), notes };
}

function dedup(herbs) {
  const seen = new Map();

  herbs.forEach((herb) => {
    const key = herbKey(herb);
    if (!seen.has(key)) {
      seen.set(key, { ...herb });
      return;
    }

    const existing = seen.get(key);
    if (!existing.role.includes(herb.role)) existing.role += ` + ${herb.role}`;
  });

  return Array.from(seen.values());
}

function cap(herbs, frailty) {
  return herbs.slice(0, frailty ? 3 : 5);
}

function getPreparation(pattern, herbs) {
  const delicate = herbs.some((herb) => ["mint", "rose petals", "rose"].includes(herbKey(herb)));
  const seed = herbs.some((herb) => herbKey(herb).includes("chia"));

  let preparation = "Simmer gently in 400ml water for 10-15 minutes. Strain and drink warm.";
  if (delicate) {
    preparation = "Simmer harder ingredients for 10 minutes. Remove from heat, add mint or rose, steep 3 minutes. Strain and drink warm.";
  }
  if (seed) preparation += " Soak chia seeds for 10 minutes before adding.";
  if (pattern === "dry_heat" || pattern === "dry_cold") {
    preparation = "Combine in warm, not boiling, water. Steep 8-10 minutes. Do not over-boil. Drink warm or at room temperature.";
  }

  return preparation;
}

function generateProtocol(input) {
  const {
    thermal,
    moisture,
    energy_state: energyState,
    frailty = false,
    digestive_sensitivity: digestiveSensitivity,
    symptom_intensity: symptomIntensity,
    symptoms = [],
    safety_flags: safetyFlags = []
  } = input;

  const trace = [];
  const modifications = [];
  const avoid = [];
  const followUps = [];
  let safetyNotes = [];

  const rawPattern = identifyPattern(thermal, moisture, energyState);
  trace.push(`STEP 3: Pattern -> ${rawPattern}`);

  if (rawPattern === "neutral_baseline") {
    trace.push("STEP 4: Neutral baseline");
    followUps.push("Which of these feels most true today: more tired and slow / more hot and restless / more heavy and foggy / more dry and depleted?");

    let ingredients = clone(NEUTRAL_BASELINE.ingredients);
    const safety = applySafetyFlags(ingredients, safetyFlags);
    ingredients = cap(safety.herbs, frailty);
    safetyNotes = safety.notes;

    trace.push("STEP 15: Output assembled");

    return {
      primary_pattern: "neutral_baseline",
      secondary_pattern: null,
      formula_strength: "baseline",
      ingredients,
      preparation: getPreparation("neutral_baseline", ingredients),
      timing: "Morning. Use for a few days, then reassess.",
      modifications_applied: ["neutral state - gentle baseline protocol"],
      avoid: [],
      field_effects: NEUTRAL_BASELINE.field_effects,
      follow_up_questions: followUps,
      safety_notes: safetyNotes,
      debug_trace: trace
    };
  }

  let primary = rawPattern;
  if (rawPattern === "mixed_pattern") {
    primary = inferDominantFromMixed(thermal, moisture, energyState, symptoms);
    trace.push(`STEP 5: Mixed -> inferred ${primary}`);
    modifications.push("mixed signals detected - closest pattern selected, light formula applied");
    followUps.push("Your signals are mixed. Which feels more prominent: the cold/heavy feeling, or the hot/restless feeling?");
  }

  let strength = resolveStrength(symptomIntensity, frailty);
  trace.push(`STEP 6: strength=${strength}`);
  if (strength === "frailty_floor") modifications.push("frailty floor - light formula, maximum 3 ingredients");
  if (rawPattern === "mixed_pattern") strength = "light";

  const protocol = PROTOCOLS[primary];
  const baseKey = strength === "frailty_floor" ? "light" : strength;
  let herbs = clone(protocol[baseKey] || protocol.light);
  trace.push(`STEP 7: ${primary}[${baseKey}] - ${herbs.length} herbs`);

  const digestive = applyDigestiveSensitivity(herbs, digestiveSensitivity, primary);
  herbs = digestive.herbs;
  if (digestive.applied) {
    modifications.push("digestive sensitivity high - strong spices removed");
    trace.push("STEP 8: applied");
  }

  if (energyState === "overcharged" && thermal === "cold") {
    herbs = [
      { name: "Cardamom", amount: "8 pods", role: "aromatic mover - not heating" },
      { name: "Coriander seed", amount: "1 tsp", role: "moves gently - not heating" },
      { name: "Anise", amount: "1/2 tsp", role: "aromatic, not heating" },
      { name: "Mint", amount: "small handful", role: "cools overcharged field" }
    ];
    modifications.push("overcharged-cold conflict - aromatic movers only, heating suppressed");
    trace.push("STEP 9: OC+cold conflict resolved");
  }

  const secondary = energyState !== "neutral" && primary !== energyState ? energyState : null;
  if (secondary) herbs = integrateSecondary(herbs, primary, energyState, trace);

  const modifierResult = applyModifiers(herbs, symptoms, primary, frailty);
  herbs = modifierResult.herbs;
  modifications.push(...modifierResult.applied);
  avoid.push(...modifierResult.avoid);
  followUps.push(...modifierResult.followUps);
  modifierResult.applied.forEach((item) => trace.push(`STEP 11: ${item}`));

  const safety = applySafetyFlags(herbs, safetyFlags);
  herbs = safety.herbs;
  safetyNotes = safety.notes;
  safety.notes.forEach((note) => trace.push(`STEP 12: ${note}`));

  herbs = dedup(herbs);
  const beforeCap = herbs.length;
  herbs = cap(herbs, frailty);
  if (herbs.length < beforeCap) trace.push(`STEP 13: cap ${beforeCap}->${herbs.length}`);

  if (herbs.length < 2) {
    followUps.push("Your formula is very limited. Could you share more about what you can tolerate?");
  }
  if (energyState === "overcharged") {
    avoid.push("strong heating spices (cinnamon, ginger, pepper, mustard)");
    avoid.push("excess ginger or ginseng");
  }
  if (safetyFlags.includes("pregnancy")) avoid.push("he shou wu");
  if (safetyFlags.includes("anticoagulants")) avoid.push("high-dose turmeric or ginger without clinician guidance");

  trace.push("STEP 15: Output assembled");

  return {
    primary_pattern: primary,
    secondary_pattern: secondary,
    formula_strength: strength === "frailty_floor" ? "minimal (frailty)" : strength,
    ingredients: herbs,
    preparation: getPreparation(primary, herbs),
    timing: ["undercharged", "damp_cold"].includes(primary)
      ? "Morning or early afternoon. Not late evening."
      : "Morning or afternoon.",
    modifications_applied: modifications,
    avoid: [...new Set(avoid)],
    field_effects: protocol.field_effects,
    follow_up_questions: [...new Set(followUps)],
    safety_notes: safetyNotes,
    debug_trace: trace
  };
}

module.exports = {
  generateProtocol,
  identifyPattern,
  inferDominantFromMixed,
  resolveStrength,
  applyDigestiveSensitivity,
  integrateSecondary,
  applyModifiers,
  applySafetyFlags,
  dedup,
  cap,
  getPreparation
};
