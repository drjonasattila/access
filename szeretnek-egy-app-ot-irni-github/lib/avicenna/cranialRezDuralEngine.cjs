const cranialRezDuralData = require("./data/engines/cranialRezDuralEngine.v1.json");
const pppUniversalArchitecture = require("./data/engines/PPPUniversalArchitecture.v1.json");
const posteriorFossaResonance = require("./data/engines/posteriorFossaResonance.v1.json");
const duralContinuum = require("./data/engines/duralContinuum.v1.json");
const steroidResponseDecisionModel = require("./data/engines/steroidResponseDecisionModel.v1.json");
const cranialNervePPPMap = require("./data/libraries/cranialNervePPPMap.v1.json");
const internalBackendTranslationMap = require("./data/libraries/internalBackendTranslationMap.batch20.json");
const { sanitizeForOutput } = require("./brandSanitizer.cjs");

const PATIENT_DISCLAIMER = "This is an educational pattern-recognition and systems-support tool. It does not replace medical diagnosis or specialist treatment.";

const PATTERNS = cranialRezDuralData.patterns || [];
const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((pattern) => [pattern.id, pattern]));
const RULES = cranialRezDuralData.rules || [];
const RULE_BY_ID = Object.fromEntries(RULES.map((rule) => [rule.id, rule]));
const CRANIAL_NERVES = cranialNervePPPMap.cranial_nerve_map || [];
const CRANIAL_NERVE_BY_ID = Object.fromEntries(CRANIAL_NERVES.map((item) => [item.id, item]));

const SAFE_PATTERN_LABELS = {
  TGN_SPECTRUM: "trigeminal neurovascular interface pattern",
  PPP_UNIVERSAL: "triune neurovascular coherence system",
  POSTERIOR_FOSSA_RESONANCE: "posterior fossa neurovascular resonance",
  DURAL_CONTINUUM: "cranial-spinal meningeal continuity pattern",
  STEROID_RESPONSE_MODEL: "interventional response prediction model"
};

const SAFE_TN_LABELS = {
  TGN_TYPICAL: "typical paroxysmal trigeminal pattern",
  TGN_ATYPICAL: "mixed paroxysmal and baseline trigeminal pattern",
  TGN_NEUROPATHIC: "continuous trigeminal neuropathic pattern"
};

const FORBIDDEN_PATIENT_TERMS = [
  [/Liver Yang/gi, "global metabolic overdrive"],
  [/Yin deficiency/gi, "reduced tissue rebuilding capacity"],
  [/Yin-deficient/gi, "low rebuilding-capacity"],
  [/EZ collapse/gi, "tissue buffering failure"],
  [/EZ fragmented/gi, "perineural matrix discontinuity"],
  [/EZ fragmentation/gi, "tissue buffering failure"],
  [/meningeal EZ fragmentation/gi, "meningeal interface instability"],
  [/Plate collapse/gi, "meningeal interface instability"],
  [/Pulse chaos/gi, "arterial pulse discoherence"],
  [/Plexus storm/gi, "autonomic ganglionic amplification"],
  [/REZ decoherence/gi, "nerve-root interface instability"],
  [/Shaoyang/gi, "rhythmic regulation system"],
  [/Yangming/gi, "cortical projection system"],
  [/Taiyang/gi, "posterior cranial-fascial containment system"],
  [/còu lǐ/gi, "dermal interstice"],
  [/field turbulence/gi, "neurovascular turbulence"],
  [/energetic siphoning/gi, "local resource depletion"]
];

const TRANSLATION_REPLACEMENTS = [
  ...(internalBackendTranslationMap.translations || []).map((entry) => [
    new RegExp(escapeRegExp(entry.backend_term), "gi"),
    entry.frontend_term
  ]),
  ...FORBIDDEN_PATIENT_TERMS
];

const DIAGNOSIS_TO_CN = [
  { terms: ["trigeminal", "facial pain", "migraine"], nerve: "CN_V" },
  { terms: ["meniere", "ménière", "tinnitus", "vestibular paroxysmia", "vestibular"], nerve: "CN_VIII" },
  { terms: ["pots", "dysautonomia", "ibs", "gastroparesis", "sibo"], nerve: "CN_X" },
  { terms: ["optic neuritis", "glaucoma", "papilledema", "papilloedema"], nerve: "CN_II" },
  { terms: ["bell", "facial palsy"], nerve: "CN_VII" },
  { terms: ["glossopharyngeal"], nerve: "CN_IX" },
  { terms: ["occipital neuralgia"], nerve: "CN_V" }
];

const POSTERIOR_FOSSA_DIAGNOSES = ["iih", "idiopathic intracranial hypertension", "pres", "posterior reversible encephalopathy", "occipital neuralgia", "pulsatile tinnitus"];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === 1;
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function includesAny(values, targets) {
  const haystack = list(values).map((value) => lower(value).replace(/\s+/g, "_"));
  return targets.some((target) => haystack.some((item) => item.includes(target)));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueRules(rules) {
  const seen = new Set();
  return rules.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function rule(id, reason = "") {
  const item = RULE_BY_ID[id] || { id, condition: "", action: "" };
  return { id: item.id, condition: item.condition, action: item.action, reason };
}

function translatePatientString(value) {
  return TRANSLATION_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value)
  );
}

function patientSafe(value) {
  if (typeof value === "string") return translatePatientString(value);
  if (Array.isArray(value)) return value.map((item) => patientSafe(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, patientSafe(item)]));
  }
  return value;
}

function outputMode(input) {
  if (input.output_mode === "internal-audit" || input.system_mode === "internal-audit" || bool(input.internal_audit) || bool(input.debugMode)) return "internal-audit";
  if (input.output_mode === "clinician" || input.output_mode === "practitioner" || input.system_mode === "clinician" || input.system_mode === "practitioner" || bool(input.clinician_mode) || bool(input.practitioner_mode)) return "clinician";
  return "patient";
}

function normaliseCranialNerve(value) {
  const raw = lower(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const direct = {
    i: "CN_I",
    "1": "CN_I",
    olfactory: "CN_I",
    ii: "CN_II",
    "2": "CN_II",
    optic: "CN_II",
    iii: "CN_III",
    "3": "CN_III",
    oculomotor: "CN_III",
    iv: "CN_IV",
    "4": "CN_IV",
    trochlear: "CN_IV",
    v: "CN_V",
    "5": "CN_V",
    trigeminal: "CN_V",
    vi: "CN_VI",
    "6": "CN_VI",
    abducens: "CN_VI",
    vii: "CN_VII",
    "7": "CN_VII",
    facial: "CN_VII",
    viii: "CN_VIII",
    "8": "CN_VIII",
    vestibulocochlear: "CN_VIII",
    ix: "CN_IX",
    "9": "CN_IX",
    glossopharyngeal: "CN_IX",
    x: "CN_X",
    "10": "CN_X",
    vagus: "CN_X",
    xi: "CN_XI",
    "11": "CN_XI",
    accessory: "CN_XI",
    xii: "CN_XII",
    "12": "CN_XII",
    hypoglossal: "CN_XII"
  };
  if (direct[raw]) return direct[raw];
  if (raw.startsWith("cn_") && CRANIAL_NERVE_BY_ID[raw.toUpperCase()]) return raw.toUpperCase();
  return "";
}

function normaliseInput(input = {}) {
  const symptoms = [
    ...list(input.symptoms),
    ...list(input.pain_features),
    ...list(input.posterior_fossa_symptoms),
    ...list(input.dural_symptoms),
    ...list(input.diagnosis),
    ...list(input.western_diagnosis)
  ];
  const diagnoses = [
    ...list(input.diagnosis),
    ...list(input.western_diagnosis),
    ...list(input.existing_diagnosis)
  ].map(lower);
  const painCharacter = lower(input.pain_character || input.pain_type || "");
  const durationMonths = number(input.pain_onset_duration_months || input.duration_months);
  const durationText = lower(input.pain_onset_duration || input.duration || "");
  const onsetUnder3 = bool(input.onset_under_3_months)
    || durationMonths > 0 && durationMonths < 3
    || durationText.includes("<3")
    || durationText.includes("under 3");
  const durationOver6 = bool(input.duration_over_6_months)
    || durationMonths > 6
    || durationText.includes(">6")
    || durationText.includes("over 6")
    || durationText.includes("6-12")
    || durationText.includes("12");
  const cranialNerve = normaliseCranialNerve(input.cranial_nerve_affected || input.cranial_nerve);

  return {
    output_mode: outputMode(input),
    symptoms,
    diagnoses,
    TN_type: input.TN_type || input.tn_type || "",
    pain_character: painCharacter,
    paroxysmal_electric_pain: bool(input.paroxysmal_electric_pain) || bool(input.typical_paroxysms) || (painCharacter.includes("electric") && (painCharacter.includes("parox") || bool(input.paroxysms))),
    paroxysms: bool(input.paroxysms) || bool(input.typical_paroxysms),
    no_baseline_pain: bool(input.no_baseline_pain),
    persistent_ache: bool(input.persistent_ache) || bool(input.background_pain) || painCharacter.includes("ache"),
    continuous_burning_pain: bool(input.continuous_burning_pain) || bool(input.continuous_burning) || (painCharacter.includes("continuous") && painCharacter.includes("burn")),
    no_paroxysms: bool(input.no_paroxysms),
    EZ_continuity_state: input.EZ_continuity_state || input.ez_continuity_state || "",
    REZ_location: input.REZ_location || input.rez_location || "",
    pulse_driver_vessel: input.pulse_driver_vessel || "",
    plexus_ganglion: input.plexus_ganglion || "",
    cranial_nerve_affected: cranialNerve,
    allergic_boundary_overload: bool(input.allergic_boundary_overload),
    headache: bool(input.headache) || includesAny(symptoms, ["headache", "migraine"]),
    visual_blurring: bool(input.visual_blurring) || bool(input.visual_changes) || includesAny(symptoms, ["visual_blurring", "visual_changes", "aura"]),
    tinnitus: bool(input.tinnitus) || bool(input.pulsatile_tinnitus) || includesAny(symptoms, ["tinnitus"]),
    papilledema: bool(input.papilledema) || bool(input.papilloedema) || includesAny(symptoms, ["papilledema", "papilloedema"]),
    IIH_confirmed: bool(input.IIH_confirmed) || bool(input.iih_confirmed) || diagnoses.some((item) => item.includes("iih") || item.includes("idiopathic intracranial hypertension")),
    PRES_confirmed: bool(input.PRES_confirmed) || bool(input.pres_confirmed) || diagnoses.some((item) => item.includes("pres") || item.includes("posterior reversible")),
    posterior_fossa_symptoms_present: bool(input.posterior_fossa_symptoms_present),
    pain_type: lower(input.pain_type || ""),
    spinal_radicular: bool(input.spinal_radicular) || lower(input.pain_type).includes("radicular") || diagnoses.some((item) => item.includes("radicul")),
    onset_under_3_months: onsetUnder3,
    duration_over_6_months: durationOver6,
    EZ_continuous_signs: bool(input.EZ_continuous_signs) || input.EZ_continuity_state === "continuous" || input.ez_continuity_state === "continuous",
    EZ_fragmented_signs: bool(input.EZ_fragmented_signs) || input.EZ_continuity_state === "fragmented" || input.ez_continuity_state === "fragmented",
    burning_mechanical_pain: bool(input.burning_mechanical_pain) || (painCharacter.includes("burn") && painCharacter.includes("mechan")),
    morning_stiffness_improves: bool(input.morning_stiffness_improves) || lower(input.morning_stiffness_pattern).includes("improves"),
    MRI_oedema: bool(input.MRI_oedema) || bool(input.mri_oedema) || lower(input.MRI_finding).includes("oedema") || lower(input.MRI_finding).includes("edema"),
    hydration_rest_response: bool(input.hydration_rest_response),
    gentle_decompression_response: bool(input.gentle_decompression_response),
    nocturnal_pain: bool(input.nocturnal_pain),
    autonomic_dysfunction_present: bool(input.autonomic_dysfunction_present),
    deep_cold_sensation: bool(input.deep_cold_sensation),
    paradoxical_flare_after_steroids: bool(input.paradoxical_flare_after_steroids),
    multi_segment_involvement: bool(input.multi_segment_involvement),
    MRI_collapse_or_atrophy: bool(input.MRI_collapse_or_atrophy) || lower(input.MRI_finding).includes("atrophy") || lower(input.MRI_finding).includes("collapse") || lower(input.MRI_finding).includes("severe"),
    steroid_response_history: lower(input.steroid_response_history || ""),
    cervical_tension: bool(input.cervical_tension),
    thoracic_stiffness: bool(input.thoracic_stiffness),
    lumbar_stenosis: bool(input.lumbar_stenosis),
    scoliosis: bool(input.scoliosis),
    dural_continuity_impaired: bool(input.dural_continuity_impaired),
    organ_dysfunction_present: bool(input.organ_dysfunction_present),
    organ_trauma_history: bool(input.organ_trauma_history),
    shu_mu_segment: input.shu_mu_segment || "",
    chronic_pain: bool(input.chronic_pain),
    multi_system: bool(input.multi_system),
    craniosacral_indication: bool(input.craniosacral_indication),
    intervention_type_considered: lower(input.intervention_type_considered || ""),
    pulsed_RF_considered: bool(input.pulsed_RF_considered) || bool(input.pulsed_rf_considered) || lower(input.intervention_type_considered).includes("pulsed"),
    ablative_RF_considered: bool(input.ablative_RF_considered) || bool(input.ablative_rf_considered) || lower(input.intervention_type_considered).includes("ablat")
  };
}

function diagnosisMatches(input, terms) {
  return terms.some((term) => input.diagnoses.some((diagnosis) => diagnosis.includes(term)));
}

function inferCranialNerve(input) {
  if (input.cranial_nerve_affected) return input.cranial_nerve_affected;
  for (const match of DIAGNOSIS_TO_CN) {
    if (diagnosisMatches(input, match.terms)) return match.nerve;
  }
  return "";
}

function addPattern(matches, id, evidence) {
  if (!matches[id]) matches[id] = [];
  matches[id].push(evidence);
}

function classifyTN(input, cranialNerve, triggered) {
  if (cranialNerve !== "CN_V" && !diagnosisMatches(input, ["trigeminal"])) return null;
  if (input.paroxysmal_electric_pain && input.no_baseline_pain) {
    triggered.push(rule("B20_R002", "paroxysmal electric pain without baseline pain"));
    return "TGN_TYPICAL";
  }
  if (input.paroxysms && input.persistent_ache) {
    triggered.push(rule("B20_R003", "paroxysms plus persistent ache"));
    return "TGN_ATYPICAL";
  }
  if (input.continuous_burning_pain && input.no_paroxysms) {
    triggered.push(rule("B20_R004", "continuous burning pain without paroxysms"));
    return "TGN_NEUROPATHIC";
  }
  if (lower(input.TN_type).includes("neuropathic")) return "TGN_NEUROPATHIC";
  if (lower(input.TN_type).includes("atypical")) return "TGN_ATYPICAL";
  if (lower(input.TN_type).includes("typical")) return "TGN_TYPICAL";
  return null;
}

function pppTriadFor(nerveId) {
  const row = CRANIAL_NERVE_BY_ID[nerveId];
  if (!row) return null;
  return {
    nerve: row.nerve,
    plate: row.plate,
    pulse: row.pulse,
    plexus: row.plexus,
    pathology: row.pathology,
    interventions: row.interventions || []
  };
}

function posteriorFossaActive(input) {
  return input.posterior_fossa_symptoms_present
    || (input.headache && input.visual_blurring && input.tinnitus && input.papilledema)
    || input.IIH_confirmed
    || input.PRES_confirmed
    || diagnosisMatches(input, POSTERIOR_FOSSA_DIAGNOSES);
}

function steroidDecision(input, tnSubtype, triggered) {
  const strong = [];
  const poor = [];
  if (input.onset_under_3_months) strong.push("onset <3 months");
  if (input.burning_mechanical_pain) strong.push("burning/mechanical pain");
  if (input.morning_stiffness_improves) strong.push("morning stiffness improves with movement");
  if (input.MRI_oedema) strong.push("MRI oedema rather than collapse");
  if (input.hydration_rest_response) strong.push("responds to hydration/rest");
  if (input.gentle_decompression_response) strong.push("responds to gentle decompression");

  if (input.duration_over_6_months) poor.push("duration >6 months");
  if (input.nocturnal_pain) poor.push("nocturnal pain");
  if (input.autonomic_dysfunction_present) poor.push("autonomic dysfunction");
  if (input.deep_cold_sensation) poor.push("deep cold sensation");
  if (input.paradoxical_flare_after_steroids || input.steroid_response_history.includes("flare")) poor.push("paradoxical steroid flare");
  if (input.multi_segment_involvement) poor.push("multi-segment involvement");
  if (input.MRI_collapse_or_atrophy) poor.push("MRI atrophy/severe collapse");
  if (tnSubtype === "TGN_NEUROPATHIC") poor.push("continuous neuropathic trigeminal pattern");

  if (input.spinal_radicular && strong.length >= 2 && (input.EZ_continuous_signs || !input.EZ_fragmented_signs)) {
    triggered.push(rule("B20_R007", "acute radicular pain with continuity signs"));
  }
  if (input.spinal_radicular && poor.length >= 2 && (input.EZ_fragmented_signs || input.duration_over_6_months)) {
    triggered.push(rule("B20_R008", "chronic radicular pain with fragmentation signs"));
  }
  if (input.paradoxical_flare_after_steroids || input.steroid_response_history.includes("flare")) {
    triggered.push(rule("B20_R009", "paradoxical flare after steroids"));
  }

  const state = poor.length > strong.length || input.EZ_fragmented_signs || tnSubtype === "TGN_NEUROPATHIC"
    ? "chronic_fragmented"
    : strong.length
      ? "acute_continuous"
      : "undetermined";
  const output = state === "acute_continuous"
    ? "interventional modulation likely beneficial"
    : state === "chronic_fragmented"
      ? "interventional modulation alone unlikely sufficient"
      : "steroid response cannot be inferred from current inputs";

  return {
    state,
    output,
    strong_responder_features: strong,
    poor_responder_features: poor,
    redirect_if_chronic: [
      "coherence restoration",
      "pulsed RF",
      "gentle neurofascial rhythm restoration",
      "fascial regulation",
      "autonomic restoration",
      "restorative support"
    ]
  };
}

function duralPropagation(input, triggered) {
  const links = [];
  if (input.cervical_tension) links.push("cervical tension -> trigeminal flare");
  if (input.thoracic_stiffness) links.push("thoracic stiffness -> occipital neuralgia");
  if (input.lumbar_stenosis) links.push("lumbar stenosis -> migraine frequency shifts");
  if (input.scoliosis) links.push("scoliosis -> tinnitus / facial pain");
  if (links.length) triggered.push(rule("B20_R010", "dural propagation screen"));
  return links;
}

function evaluateMatches(input, triggered, reviewFlags, contraindications) {
  const matches = {};
  let tnSubtype = null;
  let cranialNerve = inferCranialNerve(input);
  let pppTriad = null;
  let steroid = null;
  let posterior = null;
  let dural = null;

  if (cranialNerve || diagnosisMatches(input, ["trigeminal", "glossopharyngeal", "bell", "meniere", "ménière", "tinnitus", "optic neuritis", "glaucoma", "pots", "vestibular"])) {
    triggered.push(rule("B20_R001", "cranial nerve diagnosis or nerve provided"));
    addPattern(matches, "PPP_UNIVERSAL", "cranial nerve lookup activated");
    pppTriad = pppTriadFor(cranialNerve);
  }

  tnSubtype = classifyTN(input, cranialNerve, triggered);
  if (tnSubtype) {
    cranialNerve = "CN_V";
    pppTriad = pppTriad || pppTriadFor("CN_V");
    addPattern(matches, "TGN_SPECTRUM", tnSubtype);
    addPattern(matches, "PPP_UNIVERSAL", "CN V Plate-Pulse-Plexus triad loaded");
  }

  if (input.allergic_boundary_overload) {
    reviewFlags.push("Allergic boundary overload: dermal interstice congestion with trigeminal-immune sensitisation.");
  }

  if (posteriorFossaActive(input)) {
    if (input.headache && input.visual_blurring && input.tinnitus && input.papilledema) {
      triggered.push(rule("B20_R005", "headache + visual change + tinnitus + papilledema"));
    }
    if (input.IIH_confirmed || input.PRES_confirmed) {
      triggered.push(rule("B20_R006", "IIH/PRES posterior pressure route"));
      reviewFlags.push("IIH/PRES requires specialist medical assessment; integrative logic is supportive only.");
    }
    addPattern(matches, "POSTERIOR_FOSSA_RESONANCE", "posterior pressure/resonance signs");
    posterior = {
      psa_axis: true,
      label: "posterior pressure regulatory overload",
      intervention_focus: [
        "slow breathing entrainment",
        "positional decompression",
        "occipital photobiomodulation",
        "magnesium support",
        "cranial venous drainage restoration",
        "sensory load reduction"
      ],
      avoid_now: [
        "stimulatory visual input",
        "loud sound",
        "cold exposure to occiput during flare"
      ],
      tentorium_filter: "tentorial damping system"
    };
    contraindications.push(...posterior.avoid_now);
  }

  if (input.spinal_radicular || input.dural_continuity_impaired || input.organ_trauma_history || input.shu_mu_segment || input.cervical_tension || input.thoracic_stiffness || input.lumbar_stenosis || input.scoliosis) {
    addPattern(matches, "DURAL_CONTINUUM", "cranial-spinal-visceral propagation logic activated");
    const propagation = duralPropagation(input, triggered);
    dural = {
      propagation_links: propagation,
      equivalence_table: {
        spinal: "epidural steroid -> DRG modulation",
        cranial: "SPG / Gasserian / glossopharyngeal / occipital ganglion modulation",
        shared: "temporary restoration of perineural matrix damping"
      },
      segmental_reporting: input.shu_mu_segment ? "segmental neural-fascial reporting system" : "",
      craniosacral_mechanism: "gentle neurofascial rhythm restoration may improve venous drainage, reduce dural tension, and restore oscillatory synchrony"
    };
    if (input.shu_mu_segment && input.organ_dysfunction_present) {
      triggered.push(rule("B20_R011", "organ dysfunction with segmental reporting"));
    }
  }

  if (input.chronic_pain && input.multi_system && input.EZ_fragmented_signs || input.craniosacral_indication) {
    triggered.push(rule("B20_R012", "craniosacral indication"));
    addPattern(matches, "DURAL_CONTINUUM", "craniosacral continuity support");
  }

  steroid = steroidDecision(input, tnSubtype, triggered);
  if (steroid.state !== "undetermined" || input.spinal_radicular || input.paradoxical_flare_after_steroids || input.pulsed_RF_considered || input.ablative_RF_considered) {
    addPattern(matches, "STEROID_RESPONSE_MODEL", steroid.state);
  }

  if (input.pulsed_RF_considered) {
    triggered.push(rule("B20_R013", "pulsed RF considered"));
  }
  if (input.ablative_RF_considered && tnSubtype === "TGN_NEUROPATHIC") {
    triggered.push(rule("B20_R014", "ablative RF considered with neuropathic TN"));
    contraindications.push("Avoid destructive signal interruption in chronic neuropathic trigeminal patterns; consider field-coherence restoring intervention discussion instead.");
  }

  return { matches, cranialNerve, pppTriad, tnSubtype, steroid, posterior, dural };
}

function dominantPattern(matches) {
  const entries = Object.entries(matches);
  if (!entries.length) return "";
  return entries.sort((a, b) => b[1].length - a[1].length)[0][0];
}

function patientSummary(patternIds, tnSubtype, steroid) {
  if (!patternIds.length) return "No strong cranial REZ or dural-continuum pattern was selected from the current inputs.";
  const labels = patternIds.map((id) => SAFE_PATTERN_LABELS[id]).filter(Boolean);
  const tnText = tnSubtype ? ` The trigeminal pattern appears closest to ${SAFE_TN_LABELS[tnSubtype]}.` : "";
  const steroidText = steroid?.state && steroid.state !== "undetermined" ? ` Steroid-response screening suggests: ${steroid.output}.` : "";
  return `This may reflect ${labels.slice(0, 2).join(" with ")}.${tnText}${steroidText}`;
}

function patientInterventions(patternIds, tnSubtype, posterior, steroid) {
  const items = [];
  if (patternIds.includes("TGN_SPECTRUM")) items.push("meningeal interface support", "arterial pulse rhythm harmonisation", "autonomic ganglion modulation discussion");
  if (patternIds.includes("PPP_UNIVERSAL")) items.push("triune neurovascular coherence review");
  if (patternIds.includes("POSTERIOR_FOSSA_RESONANCE")) items.push(...(posterior?.intervention_focus || []));
  if (patternIds.includes("DURAL_CONTINUUM")) items.push("gentle neurofascial rhythm restoration", "cranial-spinal propagation review");
  if (tnSubtype === "TGN_NEUROPATHIC" || steroid?.state === "chronic_fragmented") items.push("field-coherence restoring intervention discussion", "avoid destructive signal interruption unless specialist-led");
  return unique(items);
}

function evaluateCranialRezDuralEngine(inputPayload = {}) {
  const input = normaliseInput(inputPayload);
  const triggered = [];
  const reviewFlags = [];
  const contraindications = [];
  const evaluated = evaluateMatches(input, triggered, reviewFlags, contraindications);
  const matchedPatterns = Object.keys(evaluated.matches);
  const dominant = dominantPattern(evaluated.matches);

  const patient = patientSafe({
    title: "Cranial REZ / dural continuum interpretation",
    summary: patientSummary(matchedPatterns, evaluated.tnSubtype, evaluated.steroid),
    pattern_labels: matchedPatterns.map((id) => SAFE_PATTERN_LABELS[id]),
    support_focus: patientInterventions(matchedPatterns, evaluated.tnSubtype, evaluated.posterior, evaluated.steroid),
    steroid_prediction: evaluated.steroid?.output,
    pulsed_rf_note: evaluated.tnSubtype === "TGN_NEUROPATHIC" || input.pulsed_RF_considered
      ? "Pulsed radiofrequency is framed here as a field-coherence restoring intervention; destructive approaches require specialist caution."
      : "",
    safety_notes: [
      PATIENT_DISCLAIMER,
      ...(reviewFlags.length ? reviewFlags : []),
      "Medication and procedure decisions must be discussed with a clinician."
    ],
    avoid_now: contraindications
  });

  const clinician = input.output_mode !== "patient"
    ? {
        matched_patterns: matchedPatterns,
        dominant_pattern: dominant,
        rule_trace: uniqueRules(triggered),
        cranial_nerve_affected: evaluated.cranialNerve,
        ppp_triad: evaluated.pppTriad,
        tn_subtype: evaluated.tnSubtype,
        rez_continuity_state: input.EZ_continuity_state || evaluated.steroid?.state,
        posterior_fossa_resonance: evaluated.posterior,
        dural_continuum: evaluated.dural,
        steroid_response_prediction: evaluated.steroid,
        pulsed_rf_vs_ablative_rf: steroidResponseDecisionModel.response_profiles?.pulsed_RF_vs_ablative_RF,
        cranial_axis_map: posteriorFossaResonance.pattern?.cranial_axis_map,
        cranial_nerve_lookup_table: CRANIAL_NERVES,
        cross_batch_links: cranialRezDuralData.cross_batch_links,
        internal_theory_references: input.output_mode === "internal-audit"
          ? {
              internal_backend_translation_map: internalBackendTranslationMap,
              patterns: matchedPatterns.map((id) => PATTERN_BY_ID[id])
            }
          : undefined
      }
    : undefined;

  const result = {
    engine: "cranial_rez_dural_engine_v1",
    name: "CRANIAL_REZ_DURAL_ENGINE_v1.0",
    models: [
      "PPP_UNIVERSAL_ARCHITECTURE",
      "POSTERIOR_FOSSA_RESONANCE_ENGINE",
      "DURAL_CONTINUUM_MODEL",
      "STEROID_RESPONSE_DECISION_ENGINE"
    ],
    source: [
      "cranialRezDuralEngine.v1.json",
      "PPPUniversalArchitecture.v1.json",
      "posteriorFossaResonance.v1.json",
      "duralContinuum.v1.json",
      "steroidResponseDecisionModel.v1.json",
      "cranialNervePPPMap.v1.json",
      "internalBackendTranslationMap.batch20.json"
    ],
    active: true,
    output_mode: input.output_mode,
    matched_patterns: matchedPatterns,
    dominant_pattern: dominant,
    tn_subtype: evaluated.tnSubtype,
    cranial_nerve_affected: evaluated.cranialNerve,
    posterior_fossa_psa_link: Boolean(evaluated.posterior?.psa_axis),
    steroid_response: evaluated.steroid,
    dural_propagation_links: evaluated.dural?.propagation_links || [],
    patient,
    contraindications,
    clinician_review_flags: reviewFlags,
    triggered_rules: uniqueRules(triggered),
    integration_routes: {
      treatment_cluster_engine: evaluated.posterior?.psa_axis ? ["PSA"] : [],
      headache_tri_axial_engine: matchedPatterns.includes("TGN_SPECTRUM") || matchedPatterns.includes("POSTERIOR_FOSSA_RESONANCE") ? ["TAC / trigeminal / posterior fossa overlap"] : [],
      biophysical_substrate_engine: ["TAC_OSCILL", "EZW_FRAG"],
      steroid_response_engine: matchedPatterns.includes("STEROID_RESPONSE_MODEL")
    },
    clinician
  };

  if (input.output_mode === "patient") delete result.clinician;
  return sanitizeForOutput(result);
}

module.exports = {
  evaluateCranialRezDuralEngine,
  cranialRezDuralData,
  pppUniversalArchitecture,
  posteriorFossaResonance,
  duralContinuum,
  steroidResponseDecisionModel,
  cranialNervePPPMap,
  internalBackendTranslationMap
};
