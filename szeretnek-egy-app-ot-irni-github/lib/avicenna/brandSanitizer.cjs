const BRAND_REPLACEMENTS = [
  [/DuoLife\s+Collagen\s+\+\s+Mg\s*\/\s*DuoLife\s+Magnesium Balance/gi, "collagen / magnesium support"],
  [/DuoLife\s+Day\s*\/\s*Night/gi, "circadian nutritional support"],
  [/DuoLife\s+Day\/Night/gi, "circadian nutritional support"],
  [/DuoLife\s+Magnesium Balance/gi, "magnesium support"],
  [/DuoLife\s+Collagen/gi, "collagen / matrix support"],
  [/DuoLife\s+Day/gi, "daytime nutritional support"],
  [/DuoLife\s+Night/gi, "evening circadian nutritional support"],
  [/DuoLife\s+Adaptogen\s*\/\s*Anti-Stress(?:\s+formula)?/gi, "adaptogenic support, only if stable"],
  [/DuoLife\s+Adaptogen/gi, "adaptogenic support, only if stable"],
  [/DuoLife supplement module/gi, "generic supplement support module"],
  [/DuoLife supplement block/gi, "generic supplement support block"],
  [/DuoLife contraindications/gi, "generic supplement and stimulation contraindications"],
  [/DuoLife product names/gi, "supplement product names"],
  [/DuoLife/gi, "generic supplement support"],
  [/\bMyGastrin\b/g, "GI mucosal support"],
  [/\bMyBlood\b/g, "microcirculatory support"],
  [/\bProCardiol\b/g, "cardiometabolic flow support"],
  [/\bProcardiol\b/g, "cardiometabolic flow support"],
  [/\bProSugar Balance\b/g, "metabolic support"],
  [/\bProsugar\b/g, "metabolic support"],
  [/\bProcholterol\b/g, "lipid-metabolic support"],
  [/\bProrelaxin\b/g, "restorative sleep support"],
  [/\bProselect\b/g, "neural noise support"],
  [/\bProdeacid\b/g, "fascia-noise support"],
  [/\bPromigraine\b/g, "headache membrane support"]
];

function sanitizeBrandText(value) {
  return BRAND_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value)
  );
}

function sanitizeForOutput(value) {
  if (typeof value === "string") return sanitizeBrandText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeForOutput(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [sanitizeBrandText(key), sanitizeForOutput(item)])
    );
  }
  return value;
}

module.exports = {
  sanitizeBrandText,
  sanitizeForOutput
};
