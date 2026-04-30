/**
 * AVICENNA WELLNESS LAYER — ENGINE MODULE
 * src/engine/engine.js
 * Build 1.0 — Final
 *
 * Pure logic. No DOM. No side effects.
 * Takes a validated input object, returns a protocol output object.
 *
 * For Next.js migration: convert to TypeScript at lib/avicenna/engine.ts
 * Import types from types/avicenna.ts (see docs/NEXTJS_MIGRATION.md)
 *
 * INPUT SCHEMA:
 * {
 *   thermal:               "cold" | "heat" | "neutral"
 *   moisture:              "damp" | "dry" | "neutral"
 *   energy_state:          "undercharged" | "overcharged" | "neutral"
 *   frailty:               boolean
 *   digestive_sensitivity: "low" | "medium" | "high"
 *   symptom_intensity:     "mild" | "moderate" | "strong"
 *   symptoms:              string[]
 *     // values: "bloating" | "brain_fog" | "cold_hands_feet" |
 *     //         "dry_mouth" | "irritability" | "loose_stool" |
 *     //         "constipation_dry" | "palpitations"
 *     //
 *     // "palpitations" = symptom modifier (formula-level adjustment)
 *     // NOT the same as "palpitations_flag" in safety_flags
 *   safety_flags:          string[]
 *     // values: "pregnancy" | "gastritis" | "hypertension" |
 *     //         "palpitations_flag" | "anticoagulants" | "none"
 *     //
 *     // "palpitations_flag" = safety-level restriction for significant
 *     //   clinical palpitations. Blocks pepper/mustard/clove.
 *     //   Independent from "palpitations" symptom modifier above.
 * }
 *
 * OUTPUT SCHEMA:
 * {
 *   primary_pattern:        string
 *   secondary_pattern:      string | null
 *   formula_strength:       string
 *   ingredients:            { name, amount, role }[]
 *   preparation:            string
 *   timing:                 string
 *   modifications_applied:  string[]
 *   avoid:                  string[]
 *   field_effects:          string[]
 *   follow_up_questions:    string[]
 *   safety_notes:           string[]
 *   debug_trace:            string[]
 * }
 */

const { PROTOCOLS, SECONDARY_HERBS, PRIMARY_CONFLICTS, NEUTRAL_BASELINE } = require('../data/protocols.json')
  ? require('../data/protocols.json')
  : _getInlineData();

// Inline data fallback for browser/standalone use
function _getInlineData() {
  return {
    PROTOCOLS: PROTOCOLS_INLINE,
    SECONDARY_HERBS: SECONDARY_HERBS_INLINE,
    PRIMARY_CONFLICTS: PRIMARY_CONFLICTS_INLINE,
    NEUTRAL_BASELINE: NEUTRAL_BASELINE_INLINE
  };
}

// ─── PROTOCOL LIBRARY (inline — also exported to protocols.json) ──────────────

const PROTOCOLS_INLINE = {
  damp_cold: {
    principle: "Warm, drain, move, dry",
    field_effects: [
      "Warms the body's fluid-holding spaces",
      "Reduces heaviness and morning stiffness",
      "Clears foggy thinking related to cold dampness"
    ],
    light: [
      { name: "Cardamom",       amount: "6–8 pods",    role: "aromatic mover" },
      { name: "Coriander seed", amount: "½ tsp",       role: "gently drains damp" },
      { name: "Cinnamon",       amount: "small piece",  role: "warming support" }
    ],
    medium: [
      { name: "Cardamom",       amount: "8–10 pods",   role: "aromatic mover" },
      { name: "Coriander seed", amount: "1 tsp",       role: "drains damp" },
      { name: "Cumin",          amount: "½ tsp",       role: "warms digestion" },
      { name: "Cinnamon",       amount: "small stick",  role: "warming support" },
      { name: "Black pepper",   amount: "3–4 grains",  role: "activates circulation" }
    ],
    strong: [
      { name: "Cardamom",       amount: "10 pods",     role: "aromatic mover" },
      { name: "Coriander seed", amount: "1 tsp",       role: "drains damp" },
      { name: "Cumin",          amount: "1 tsp",       role: "warms digestion" },
      { name: "Cinnamon",       amount: "1 stick",     role: "warming support" },
      { name: "Mustard seed",   amount: "¼ tsp",       role: "breaks stagnation" }
    ]
  },
  damp_heat: {
    principle: "Cool, drain, move aromatically",
    field_effects: [
      "Clears overheated dampness",
      "Softens irritability and restlessness",
      "Restores flow without overheating"
    ],
    light: [
      { name: "Mint",           amount: "small handful", role: "cools and moves" },
      { name: "Coriander seed", amount: "½ tsp",         role: "drains damp gently" },
      { name: "Rose petals",    amount: "1 tsp",         role: "cools heat" }
    ],
    medium: [
      { name: "Mint",           amount: "handful",       role: "cools and moves" },
      { name: "Coriander seed", amount: "1 tsp",         role: "drains overheated damp" },
      { name: "Burdock root",   amount: "1 tsp",         role: "clears heat" },
      { name: "Rose petals",    amount: "1 tsp",         role: "cools and softens" }
    ],
    strong: [
      { name: "Mint",           amount: "large handful", role: "cools and disperses" },
      { name: "Coriander seed", amount: "1 tsp",         role: "drains damp" },
      { name: "Burdock root",   amount: "1½ tsp",        role: "clears heat" },
      { name: "Rose petals",    amount: "1½ tsp",        role: "cools" },
      { name: "Fennel seed",    amount: "½ tsp",         role: "aromatic mover" }
    ]
  },
  dry_heat: {
    principle: "Moisten, cool, rebuild fluids",
    field_effects: [
      "Restores fluid reservoir",
      "Cools dry heat gently",
      "Supports tissue responsiveness"
    ],
    light: [
      { name: "Goji berry",  amount: "1 tbsp",        role: "rebuilds fluid" },
      { name: "Rose petals", amount: "1 tsp",         role: "cools and soothes" },
      { name: "Honey",       amount: "½ tsp",         role: "moistens" }
    ],
    medium: [
      { name: "Goji berry",  amount: "1–2 tbsp",      role: "rebuilds fluid" },
      { name: "Spirulina",   amount: "½ tsp",         role: "structural fluid support" },
      { name: "Rose petals", amount: "1 tsp",         role: "cools" },
      { name: "Mint",        amount: "small handful", role: "cools gently" }
    ],
    strong: [
      { name: "Goji berry",  amount: "2 tbsp",        role: "fluid reservoir" },
      { name: "Spirulina",   amount: "1 tsp",         role: "deep fluid support" },
      { name: "Shatavari",   amount: "½ tsp",         role: "nourishes" },
      { name: "Rose petals", amount: "1 tsp",         role: "cools" },
      { name: "Mint",        amount: "handful",       role: "descends heat" }
    ]
  },
  dry_cold: {
    principle: "Moisten, gently warm, restore fluids",
    field_effects: [
      "Rebuilds cold-dry tissue fluids",
      "Warms gently without over-drying",
      "Supports resilience and moisture"
    ],
    light: [
      { name: "Soaked chia seed", amount: "1 tsp",       role: "restores fluid" },
      { name: "Honey",            amount: "½ tsp",       role: "moistens and warms" },
      { name: "Cardamom",         amount: "4 pods",      role: "gentle warmth" }
    ],
    medium: [
      { name: "Soaked chia seed", amount: "1½ tsp",      role: "restores fluid" },
      { name: "Goji berry",       amount: "1 tbsp",      role: "nourishes" },
      { name: "Dates",            amount: "2 pieces",    role: "moistens and warms" },
      { name: "Cardamom",         amount: "6 pods",      role: "gentle aromatic warmth" }
    ],
    strong: [
      { name: "Soaked chia seed", amount: "2 tsp",       role: "restores fluid" },
      { name: "Goji berry",       amount: "1–2 tbsp",    role: "nourishes deeply" },
      { name: "Dates",            amount: "2–3 pieces",  role: "moistens" },
      { name: "Cardamom",         amount: "8 pods",      role: "warms gently" },
      { name: "Cinnamon",         amount: "small piece", role: "gentle warmth without drying" }
    ]
  },
  undercharged: {
    principle: "Build organising force",
    field_effects: [
      "Supports mitochondrial signalling",
      "Restores organisational coherence",
      "Rebuilds energy reserves gradually"
    ],
    light: [
      { name: "Astragalus", amount: "1 tsp",               role: "supports vitality" },
      { name: "Ginger",     amount: "1 slice",             role: "activates gently" }
    ],
    medium: [
      { name: "Astragalus", amount: "1–2 tsp",             role: "builds organising force" },
      { name: "Ginseng",    amount: "small piece / ½ tsp", role: "deep vitality support" },
      { name: "Ginger",     amount: "2 slices",            role: "activates circulation" }
    ],
    strong: [
      { name: "Astragalus", amount: "2 tsp",               role: "builds organising force" },
      { name: "Ginseng",    amount: "1 tsp",               role: "deep vitality" },
      { name: "Ginger",     amount: "2–3 slices",          role: "warms and activates" },
      { name: "Cinnamon",   amount: "small piece",         role: "supports warmth and coherence" }
    ]
  },
  overcharged: {
    principle: "Cool, settle, discharge excess",
    field_effects: [
      "Reduces chaotic activation",
      "Settles upper-field tension",
      "Restores coherence and calm"
    ],
    light: [
      { name: "Mint",           amount: "small handful", role: "cools and calms" },
      { name: "Coriander seed", amount: "½ tsp",         role: "settles gently" },
      { name: "Rose petals",    amount: "1 tsp",         role: "soothes" }
    ],
    medium: [
      { name: "Mint",           amount: "handful",       role: "cools and disperses" },
      { name: "Coriander seed", amount: "1 tsp",         role: "settles excess" },
      { name: "Rose petals",    amount: "1 tsp",         role: "calms field tension" }
    ],
    strong: [
      { name: "Mint",           amount: "large handful", role: "strong cooling" },
      { name: "Coriander seed", amount: "1 tsp",         role: "settles excess" },
      { name: "Rose petals",    amount: "1½ tsp",        role: "calms" },
      { name: "Fennel seed",    amount: "½ tsp",         role: "gently moves without heating" }
    ]
  }
};

const SECONDARY_HERBS_INLINE = {
  undercharged: [
    { name: "Astragalus",  amount: "1 tsp",          role: "supports organising force" },
    { name: "Ginger",      amount: "1 slice",        role: "gentle activation" }
  ],
  overcharged: [
    { name: "Mint",        amount: "small handful",  role: "settles excess" },
    { name: "Rose petals", amount: "1 tsp",          role: "calms" }
  ]
};

const PRIMARY_CONFLICTS_INLINE = {
  dry_heat:    ["ginger", "cinnamon", "mustard seed", "black pepper", "cumin"],
  dry_cold:    ["mustard seed", "black pepper"],
  overcharged: ["ginger", "cinnamon", "mustard seed", "black pepper", "cumin", "ginseng"]
};

const NEUTRAL_BASELINE_INLINE = {
  principle: "Gentle baseline — no strong terrain distortion detected",
  ingredients: [
    { name: "Cardamom",       amount: "6 pods", role: "gentle aromatic baseline" },
    { name: "Coriander seed", amount: "½ tsp",  role: "light balancer" },
    { name: "Honey",          amount: "½ tsp",  role: "optional — adds gentle warmth" }
  ],
  field_effects: [
    "Gentle tonic baseline",
    "Supports mild digestion and warmth",
    "No strong corrective direction — reassess after a few days"
  ]
};

// Use inline data as the working set
const PROTOCOLS      = PROTOCOLS_INLINE;
const SECONDARY_HERBS = SECONDARY_HERBS_INLINE;
const PRIMARY_CONFLICTS = PRIMARY_CONFLICTS_INLINE;
const NEUTRAL_BASELINE = NEUTRAL_BASELINE_INLINE;

// ─── PATTERN IDENTIFICATION ───────────────────────────────────────────────────

function identifyPattern(thermal, moisture, energy_state) {
  if (thermal === "cold"    && moisture === "damp")            return "damp_cold";
  if (thermal === "heat"    && moisture === "damp")            return "damp_heat";
  if (thermal === "heat"    && moisture === "dry")             return "dry_heat";
  if (thermal === "cold"    && moisture === "dry")             return "dry_cold";
  if (thermal === "neutral" && energy_state === "undercharged") return "undercharged";
  if (thermal === "neutral" && energy_state === "overcharged")  return "overcharged";
  if (thermal === "neutral" && moisture === "neutral")          return "neutral_baseline";
  return "mixed_pattern";
}

function inferDominantFromMixed(thermal, moisture, energy_state, symptoms) {
  if (energy_state === "overcharged" ||
      symptoms.includes("irritability") ||
      symptoms.includes("palpitations")) {
    return (thermal === "heat" && moisture === "dry") ? "dry_heat"
         : (thermal === "heat")                       ? "damp_heat"
         :                                              "overcharged";
  }
  if (moisture === "damp" || symptoms.includes("bloating") || symptoms.includes("brain_fog"))
    return thermal === "heat" ? "damp_heat" : "damp_cold";
  if (moisture === "dry")
    return thermal === "cold" ? "dry_cold" : "dry_heat";
  return "damp_cold";
}

// ─── STRENGTH RESOLUTION ─────────────────────────────────────────────────────

function resolveStrength(symptom_intensity, frailty) {
  const map = { mild: "light", moderate: "medium", strong: "strong" };
  let s = map[symptom_intensity] || "light";
  if (frailty) {
    if      (s === "strong") s = "medium";
    else if (s === "medium") s = "light";
    else                     s = "frailty_floor";
  }
  return s;
}

// ─── DIGESTIVE SENSITIVITY ────────────────────────────────────────────────────

function applyDigestiveSensitivity(herbs, sensitivity, pattern) {
  if (sensitivity !== "high") return { herbs, applied: false };
  const remove   = new Set(["black pepper", "mustard seed", "clove", "ginger"]);
  let   filtered = herbs.filter(h => !remove.has(h.name.toLowerCase()));
  if (filtered.length < 2) {
    filtered.push({ name: "Fennel seed", amount: "½ tsp", role: "gentle aromatic fallback" });
    if (pattern === "damp_cold")
      filtered.push({ name: "Anise", amount: "¼ tsp", role: "gentle warming aromatic" });
  }
  return { herbs: filtered, applied: true };
}

// ─── SECONDARY PATTERN INTEGRATION ───────────────────────────────────────────

function integrateSecondary(herbs, primary_pattern, energy_state, trace) {
  if (energy_state === "neutral" || primary_pattern === energy_state) return herbs;
  const secHerbs = SECONDARY_HERBS[energy_state];
  if (!secHerbs) return herbs;
  const blocked = PRIMARY_CONFLICTS[primary_pattern] || [];
  let   added   = 0;
  secHerbs.forEach(h => {
    if (added >= 2) return;
    if (blocked.includes(h.name.toLowerCase())) {
      trace.push(`STEP 10: Secondary "${h.name}" omitted — conflicts with ${primary_pattern}`);
      return;
    }
    herbs.push({ ...h });
    added++;
    trace.push(`STEP 10: Secondary "${h.name}" added — ${energy_state} support`);
  });
  return herbs;
}

// ─── MODIFIER APPLICATION ─────────────────────────────────────────────────────

const MODIFIER_PRIORITY = {
  palpitations: 1, irritability: 2, brain_fog: 1, bloating: 1,
  dry_mouth: 2, cold_hands_feet: 2, loose_stool: 3, constipation_dry: 2
};

function applyModifiers(herbs, symptoms, pattern, frailty) {
  const applied = [], avoid = [], followUps = [];
  const hasLoose = symptoms.includes("loose_stool");
  const hasConst = symptoms.includes("constipation_dry");
  if (hasLoose && hasConst)
    followUps.push("You selected both loose stool and constipation — which tendency is more frequent?");
  const active = symptoms
    .filter(s  => MODIFIER_PRIORITY[s] !== undefined)
    .filter(s  => !(s === "loose_stool"     && hasConst))
    .filter(s  => !(s === "constipation_dry" && hasLoose))
    .sort((a, b) => (MODIFIER_PRIORITY[a] || 9) - (MODIFIER_PRIORITY[b] || 9));
  const maxMods = frailty ? 1 : 2;
  const toApply = active.slice(0, maxMods);
  if (active.length > maxMods)
    followUps.push(`${active.length - maxMods} modifier(s) deferred: ${active.slice(maxMods).join(", ").replace(/_/g, " ")}.`);
  toApply.forEach(sym => {
    switch (sym) {
      case "dry_mouth":
        herbs = herbs.filter(h => !["black pepper","mustard seed","clove"].includes(h.name.toLowerCase()));
        if (!herbs.find(h => h.name.toLowerCase() === "honey"))
          herbs.push({ name: "Honey", amount: "½ tsp", role: "moistens" });
        applied.push("dry mouth — drying spices removed, honey added");
        break;
      case "bloating":
        if (!herbs.find(h => h.name.toLowerCase().includes("cardamom")))
          herbs.push({ name: "Cardamom", amount: "6 pods", role: "aromatic — relieves bloating" });
        applied.push("bloating — aromatic movers prioritised");
        break;
      case "cold_hands_feet":
        if (pattern !== "overcharged") {
          if (!herbs.find(h => h.name.toLowerCase() === "ginger"))
            herbs.push({ name: "Ginger", amount: "2 slices", role: "warms periphery" });
          else if (!herbs.find(h => h.name.toLowerCase() === "cinnamon"))
            herbs.push({ name: "Cinnamon", amount: "small piece", role: "warms periphery" });
          applied.push("cold hands/feet — warming herb added");
        } else {
          applied.push("cold hands/feet — skipped, overcharged state prevents heating");
        }
        break;
      case "irritability":
        herbs = herbs.filter(h => !["black pepper","mustard seed"].includes(h.name.toLowerCase()));
        if (!herbs.find(h => h.name.toLowerCase() === "rose petals"))
          herbs.push({ name: "Rose petals", amount: "1 tsp", role: "calms and soothes" });
        applied.push("irritability — rose added, stimulating spices reduced");
        break;
      case "brain_fog":
        if (!herbs.find(h => h.name.toLowerCase().includes("cardamom")))
          herbs.push({ name: "Cardamom", amount: "6 pods", role: "aromatic clarity" });
        applied.push("brain fog — aromatic clarity herbs prioritised");
        break;
      case "loose_stool":
        herbs = herbs.filter(h => !["chia seed","basil seed","soaked chia seed"].includes(h.name.toLowerCase()));
        applied.push("loose stool — seed moisteners removed");
        break;
      case "constipation_dry":
        if (!herbs.find(h => h.name.toLowerCase().includes("chia")))
          herbs.push({ name: "Soaked chia seed", amount: "1 tsp", role: "adds moisture gently" });
        applied.push("dry constipation — chia added for moisture");
        break;
      case "palpitations":
        // Symptom modifier — formula-level adjustment only
        // palpitations_flag in safety_flags handles safety-level restriction separately
        herbs = herbs.filter(h => !["ginseng","mustard seed","black pepper","clove"].includes(h.name.toLowerCase()));
        if (!herbs.find(h => h.name.toLowerCase() === "rose petals"))
          herbs.push({ name: "Rose petals", amount: "1 tsp", role: "calms" });
        avoid.push("strong stimulants (ginseng, pepper, mustard)");
        applied.push("palpitations — stimulants removed, rose added");
        break;
    }
  });
  return { herbs, applied, avoid, followUps };
}

// ─── SAFETY FLAGS ─────────────────────────────────────────────────────────────

function applySafetyFlags(herbs, safety_flags) {
  const blocked = new Set();
  const notes   = [];
  if (safety_flags.includes("pregnancy")) {
    ["mustard seed","clove","he shou wu","black pepper"].forEach(h => blocked.add(h));
    notes.push("Strong heating spices avoided — pregnancy noted. Check all herbs with your midwife or clinician.");
  }
  if (safety_flags.includes("gastritis") || safety_flags.includes("hypertension") || safety_flags.includes("palpitations_flag")) {
    ["black pepper","mustard seed","clove"].forEach(h => blocked.add(h));
    notes.push("Strong stimulating spices avoided — digestive or cardiovascular sensitivity noted.");
  }
  if (safety_flags.includes("anticoagulants"))
    notes.push("If turmeric or high-dose ginger are ever added, check with your clinician first.");
  return { herbs: herbs.filter(h => !blocked.has(h.name.toLowerCase())), notes };
}

// ─── DEDUPLICATION + CAP ─────────────────────────────────────────────────────

function dedup(herbs) {
  const seen = new Map();
  herbs.forEach(h => {
    const k = h.name.toLowerCase();
    if (!seen.has(k)) seen.set(k, { ...h });
    else { const ex = seen.get(k); if (!ex.role.includes(h.role)) ex.role += " + " + h.role; }
  });
  return Array.from(seen.values());
}

function cap(herbs, frailty) { return herbs.slice(0, frailty ? 3 : 5); }

// ─── PREPARATION TEXT ─────────────────────────────────────────────────────────

function getPreparation(pattern, herbs) {
  const delicate = herbs.some(h => ["mint","rose petals","rose"].includes(h.name.toLowerCase()));
  const seed     = herbs.some(h => h.name.toLowerCase().includes("chia"));
  let prep = "Simmer gently in 400ml water for 10–15 minutes. Strain and drink warm.";
  if (delicate) prep = "Simmer harder ingredients for 10 minutes. Remove from heat, add mint or rose, steep 3 minutes. Strain and drink warm.";
  if (seed)     prep += " Soak chia seeds for 10 minutes before adding.";
  if (pattern === "dry_heat" || pattern === "dry_cold")
    prep = "Combine in warm (not boiling) water. Steep 8–10 minutes. Do not over-boil. Drink warm or at room temperature.";
  return prep;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

/**
 * generateProtocol(input)
 *
 * @param  {object} input  Validated input object
 * @returns {object}       Protocol output object
 *
 * AVICENNA 2 INTEGRATION:
 *   When systemMode === "wellness", call:
 *     const input = mapClinicalContextToWellnessInput(window._clinicalContext);
 *     const protocol = generateProtocol(input);
 *   See docs/INTEGRATION_NOTES.md for the full mapping function.
 */
function generateProtocol(input) {
  const {
    thermal, moisture, energy_state, frailty,
    digestive_sensitivity, symptom_intensity,
    symptoms = [], safety_flags = []
  } = input;

  const trace = [], mods = [], avoidArr = [], fqs = [];
  let safety_notes = [];

  // Step 3: Pattern
  const raw = identifyPattern(thermal, moisture, energy_state);
  trace.push(`STEP 3: Pattern → ${raw}`);

  // Step 4: Neutral baseline
  if (raw === "neutral_baseline") {
    trace.push("STEP 4: Neutral baseline");
    fqs.push("Which of these feels most true today: more tired and slow / more hot and restless / more heavy and foggy / more dry and depleted?");
    let ings = [...NEUTRAL_BASELINE.ingredients];
    const sf = applySafetyFlags(ings, safety_flags);
    ings = sf.herbs; safety_notes = sf.notes;
    ings = cap(ings, frailty);
    trace.push("STEP 15: Output assembled");
    return {
      primary_pattern: "neutral_baseline", secondary_pattern: null,
      formula_strength: "baseline", ingredients: ings,
      preparation: getPreparation("neutral_baseline", ings),
      timing: "Morning. Use for a few days, then reassess.",
      modifications_applied: ["neutral state — gentle baseline protocol"],
      avoid: [], field_effects: NEUTRAL_BASELINE.field_effects,
      follow_up_questions: fqs, safety_notes, debug_trace: trace
    };
  }

  // Step 5: Mixed pattern
  let primary = raw;
  if (raw === "mixed_pattern") {
    primary = inferDominantFromMixed(thermal, moisture, energy_state, symptoms);
    trace.push(`STEP 5: Mixed → inferred ${primary}`);
    mods.push("mixed signals detected — closest pattern selected, light formula applied");
    fqs.push("Your signals are mixed. Which feels more prominent: the cold/heavy feeling, or the hot/restless feeling?");
  }

  // Step 6: Strength
  let strength = resolveStrength(symptom_intensity, frailty);
  trace.push(`STEP 6: strength=${strength}`);
  if (strength === "frailty_floor") mods.push("frailty floor — light formula, maximum 3 ingredients");
  if (raw === "mixed_pattern") strength = "light";

  // Step 7: Base formula
  const protocol = PROTOCOLS[primary];
  const baseKey  = strength === "frailty_floor" ? "light" : strength;
  let   herbs    = JSON.parse(JSON.stringify(protocol[baseKey] || protocol["light"]));
  trace.push(`STEP 7: ${primary}[${baseKey}] — ${herbs.length} herbs`);

  // Step 8: Digestive sensitivity
  const ds = applyDigestiveSensitivity(herbs, digestive_sensitivity, primary);
  herbs = ds.herbs;
  if (ds.applied) { mods.push("digestive sensitivity high — strong spices removed"); trace.push("STEP 8: applied"); }

  // Step 9: Overcharged + cold conflict
  if (energy_state === "overcharged" && thermal === "cold") {
    herbs = [
      { name: "Cardamom",       amount: "8 pods",        role: "aromatic mover — not heating" },
      { name: "Coriander seed", amount: "1 tsp",         role: "moves gently — not heating" },
      { name: "Anise",          amount: "½ tsp",         role: "aromatic, not heating" },
      { name: "Mint",           amount: "small handful", role: "cools overcharged field" }
    ];
    mods.push("overcharged-cold conflict — aromatic movers only, heating suppressed");
    trace.push("STEP 9: OC+cold conflict resolved");
  }

  // Step 10: Secondary
  const secondary = (energy_state !== "neutral" && primary !== energy_state) ? energy_state : null;
  if (secondary) { herbs = integrateSecondary(herbs, primary, energy_state, trace); }

  // Step 11: Modifiers
  const modResult = applyModifiers(herbs, symptoms, primary, frailty);
  herbs = modResult.herbs;
  mods.push(...modResult.applied);
  avoidArr.push(...modResult.avoid);
  fqs.push(...modResult.followUps);
  modResult.applied.forEach(m => trace.push(`STEP 11: ${m}`));

  // Step 12: Safety flags
  const sf = applySafetyFlags(herbs, safety_flags);
  herbs = sf.herbs; safety_notes = sf.notes;
  sf.notes.forEach(n => trace.push(`STEP 12: ${n}`));

  // Step 13: Dedup + cap
  herbs = dedup(herbs);
  const bc = herbs.length;
  herbs = cap(herbs, frailty);
  if (herbs.length < bc) trace.push(`STEP 13: cap ${bc}→${herbs.length}`);

  // Step 14: Follow-up
  if (herbs.length < 2) fqs.push("Your formula is very limited. Could you share more about what you can tolerate?");
  if (energy_state === "overcharged") {
    avoidArr.push("strong heating spices (cinnamon, ginger, pepper, mustard)");
    avoidArr.push("excess ginger or ginseng");
  }
  if (safety_flags.includes("pregnancy"))     avoidArr.push("he shou wu");
  if (safety_flags.includes("anticoagulants")) avoidArr.push("high-dose turmeric or ginger without clinician guidance");

  trace.push("STEP 15: Output assembled");

  return {
    primary_pattern:       primary,
    secondary_pattern:     secondary,
    formula_strength:      strength === "frailty_floor" ? "minimal (frailty)" : strength,
    ingredients:           herbs,
    preparation:           getPreparation(primary, herbs),
    timing:                ["undercharged","damp_cold"].includes(primary)
                             ? "Morning or early afternoon. Not late evening."
                             : "Morning or afternoon.",
    modifications_applied: mods,
    avoid:                 [...new Set(avoidArr)],
    field_effects:         protocol.field_effects,
    follow_up_questions:   [...new Set(fqs)],
    safety_notes,
    debug_trace:           trace
  };
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

// Node.js / bundler:
if (typeof module !== "undefined" && module.exports) {
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
    getPreparation,
    PROTOCOLS,
    SECONDARY_HERBS,
    PRIMARY_CONFLICTS,
    NEUTRAL_BASELINE,
    MODIFIER_PRIORITY
  };
}

// Browser:
if (typeof window !== "undefined") {
  window.AvicennaEngine = { generateProtocol, PROTOCOLS, identifyPattern };
}
