const assert = require("assert");
const { evaluateCranialRezDuralEngine } = require("../lib/avicenna/cranialRezDuralEngine.cjs");

const forbiddenPatientTerms = [
  "Liver Yang",
  "Yin deficiency",
  "EZ collapse",
  "Plate collapse",
  "Pulse chaos",
  "Plexus storm",
  "REZ decoherence",
  "Shaoyang",
  "Yangming",
  "Taiyang",
  "còu lǐ",
  "field turbulence",
  "energetic siphoning"
];

function ruleIds(result) {
  return (result.triggered_rules || []).map((rule) => rule.id);
}

function assertPatientSafe(result, label) {
  const text = JSON.stringify(result.patient || {});
  for (const term of forbiddenPatientTerms) {
    assert(!text.includes(term), `${label}: patient output leaked internal term ${term}`);
  }
}

const typical = evaluateCranialRezDuralEngine({
  cranial_nerve_affected: "CN V",
  paroxysmal_electric_pain: true,
  no_baseline_pain: true
});

const atypical = evaluateCranialRezDuralEngine({
  cranial_nerve_affected: "V",
  paroxysms: true,
  persistent_ache: true
});

const neuropathic = evaluateCranialRezDuralEngine({
  output_mode: "clinician",
  cranial_nerve_affected: "trigeminal",
  continuous_burning_pain: true,
  no_paroxysms: true,
  ablative_RF_considered: true
});

const pppMeniere = evaluateCranialRezDuralEngine({
  output_mode: "clinician",
  diagnosis: "Meniere tinnitus"
});

const posterior = evaluateCranialRezDuralEngine({
  output_mode: "clinician",
  headache: true,
  visual_blurring: true,
  tinnitus: true,
  papilledema: true
});

const iih = evaluateCranialRezDuralEngine({
  diagnosis: "IIH",
  output_mode: "clinician"
});

const steroidStrong = evaluateCranialRezDuralEngine({
  output_mode: "clinician",
  spinal_radicular: true,
  onset_under_3_months: true,
  EZ_continuous_signs: true,
  burning_mechanical_pain: true,
  morning_stiffness_improves: true,
  MRI_oedema: true
});

const steroidPoor = evaluateCranialRezDuralEngine({
  output_mode: "clinician",
  spinal_radicular: true,
  duration_over_6_months: true,
  EZ_fragmented_signs: true,
  nocturnal_pain: true,
  autonomic_dysfunction_present: true,
  deep_cold_sensation: true
});

const steroidFlare = evaluateCranialRezDuralEngine({
  paradoxical_flare_after_steroids: true
});

const duralPropagation = evaluateCranialRezDuralEngine({
  cervical_tension: true,
  thoracic_stiffness: true,
  lumbar_stenosis: true,
  scoliosis: true
});

const shuMu = evaluateCranialRezDuralEngine({
  shu_mu_segment: "T7-T10",
  organ_dysfunction_present: true
});

const craniosacral = evaluateCranialRezDuralEngine({
  chronic_pain: true,
  multi_system: true,
  EZ_fragmented_signs: true
});

const pulsed = evaluateCranialRezDuralEngine({
  pulsed_RF_considered: true
});

const allergy = evaluateCranialRezDuralEngine({
  cranial_nerve_affected: "CN V",
  allergic_boundary_overload: true
});

assert.equal(typical.tn_subtype, "TGN_TYPICAL", "typical TN should be classified");
assert(ruleIds(typical).includes("B20_R001"), "cranial nerve routing should trigger B20_R001");
assert(ruleIds(typical).includes("B20_R002"), "typical TN should trigger B20_R002");
assert(typical.matched_patterns.includes("PPP_UNIVERSAL"), "typical TN should load PPP universal");
assert(typical.matched_patterns.includes("TGN_SPECTRUM"), "typical TN should match TGN spectrum");
assertPatientSafe(typical, "typical TN");

assert.equal(atypical.tn_subtype, "TGN_ATYPICAL", "atypical TN should be classified");
assert(ruleIds(atypical).includes("B20_R003"), "atypical TN should trigger B20_R003");

assert.equal(neuropathic.tn_subtype, "TGN_NEUROPATHIC", "neuropathic TN should be classified");
assert(ruleIds(neuropathic).includes("B20_R004"), "neuropathic TN should trigger B20_R004");
assert(ruleIds(neuropathic).includes("B20_R014"), "ablative RF warning should trigger in neuropathic TN");
assert(neuropathic.patient.pulsed_rf_note.includes("field-coherence restoring"), "pulsed RF note should be patient-safe");
assertPatientSafe(neuropathic, "neuropathic TN");

assert.equal(pppMeniere.cranial_nerve_affected, "CN_VIII", "Meniere/tinnitus should route to CN VIII");
assert(pppMeniere.clinician.ppp_triad.nerve.includes("Vestibulocochlear"), "CN VIII PPP triad should load");

assert(posterior.matched_patterns.includes("POSTERIOR_FOSSA_RESONANCE"), "posterior fossa signs should match");
assert.equal(posterior.posterior_fossa_psa_link, true, "posterior fossa should link to PSA");
assert(ruleIds(posterior).includes("B20_R005"), "posterior fossa symptom quartet should trigger B20_R005");
assertPatientSafe(posterior, "posterior fossa");

assert(ruleIds(iih).includes("B20_R006"), "IIH/PRES should trigger B20_R006");
assert(iih.clinician_review_flags.some((flag) => flag.includes("IIH/PRES")), "IIH/PRES should flag specialist review");

assert.equal(steroidStrong.steroid_response.output, "interventional modulation likely beneficial", "acute/continuous profile should be steroid responsive");
assert(ruleIds(steroidStrong).includes("B20_R007"), "strong steroid responder should trigger B20_R007");

assert.equal(steroidPoor.steroid_response.output, "interventional modulation alone unlikely sufficient", "chronic/fragmented profile should redirect");
assert(ruleIds(steroidPoor).includes("B20_R008"), "poor steroid responder should trigger B20_R008");

assert(ruleIds(steroidFlare).includes("B20_R009"), "paradoxical flare should trigger B20_R009");

assert(ruleIds(duralPropagation).includes("B20_R010"), "dural propagation screen should trigger B20_R010");
assert(duralPropagation.dural_propagation_links.includes("cervical tension -> trigeminal flare"), "cervical propagation link should appear");
assert(duralPropagation.dural_propagation_links.includes("thoracic stiffness -> occipital neuralgia"), "thoracic propagation link should appear");
assert(duralPropagation.dural_propagation_links.includes("lumbar stenosis -> migraine frequency shifts"), "lumbar propagation link should appear");
assert(duralPropagation.dural_propagation_links.includes("scoliosis -> tinnitus / facial pain"), "scoliosis propagation link should appear");

assert(ruleIds(shuMu).includes("B20_R011"), "Shu-Mu/segmental reporting rule should trigger");
assertPatientSafe(shuMu, "segmental reporting");

assert(ruleIds(craniosacral).includes("B20_R012"), "craniosacral indication should trigger B20_R012");
assert(ruleIds(pulsed).includes("B20_R013"), "pulsed RF should trigger B20_R013");

assert(allergy.clinician_review_flags.some((flag) => flag.includes("dermal interstice congestion")), "allergic boundary overload should use safe frontend language");
assertPatientSafe(allergy, "allergy boundary");

for (const result of [typical, atypical, neuropathic, pppMeniere, posterior, iih, steroidStrong, steroidPoor, steroidFlare, duralPropagation, shuMu, craniosacral, pulsed, allergy]) {
  assertPatientSafe(result, result.engine);
}

const covered = new Set([
  ...ruleIds(typical),
  ...ruleIds(atypical),
  ...ruleIds(neuropathic),
  ...ruleIds(pppMeniere),
  ...ruleIds(posterior),
  ...ruleIds(iih),
  ...ruleIds(steroidStrong),
  ...ruleIds(steroidPoor),
  ...ruleIds(steroidFlare),
  ...ruleIds(duralPropagation),
  ...ruleIds(shuMu),
  ...ruleIds(craniosacral),
  ...ruleIds(pulsed)
]);

const expected = Array.from({ length: 14 }, (_, index) => `B20_R${String(index + 1).padStart(3, "0")}`);
const missing = expected.filter((id) => !covered.has(id));

assert.deepEqual(missing, [], `Missing Batch 20 rule coverage: ${missing.join(", ")}`);

console.log(`Cranial REZ / dural engine tests passed: ${covered.size}/14 rules covered`);
