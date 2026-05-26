const assert = require("node:assert/strict");
const { generateProtocol } = require("../lib/avicenna/engine.cjs");
const { testCases } = require("../lib/avicenna/data/testCases.json");

function names(protocol) {
  return protocol.ingredients.map((ingredient) => ingredient.name.toLowerCase());
}

for (const testCase of testCases) {
  const protocol = generateProtocol(testCase.input);
  const expected = testCase.expected;
  const ingredientNames = names(protocol);

  if (expected.primary_pattern) {
    assert.equal(protocol.primary_pattern, expected.primary_pattern, testCase.id);
  }

  if (Object.hasOwn(expected, "secondary_pattern")) {
    assert.equal(protocol.secondary_pattern, expected.secondary_pattern, testCase.id);
  }

  if (expected.formula_strength) {
    assert.equal(protocol.formula_strength, expected.formula_strength, testCase.id);
  }

  if (expected.max_ingredients) {
    assert.ok(
      protocol.ingredients.length <= expected.max_ingredients,
      `${testCase.id}: expected max ${expected.max_ingredients} ingredients`
    );
  }

  for (const herb of expected.must_include || []) {
    assert.ok(
      ingredientNames.includes(herb.toLowerCase()),
      `${testCase.id}: expected ${herb} to be included`
    );
  }

  for (const herb of expected.must_not_include || []) {
    assert.ok(
      !ingredientNames.includes(herb.toLowerCase()),
      `${testCase.id}: expected ${herb} to be omitted`
    );
  }

  if (expected.safety_note_min !== undefined) {
    assert.ok(
      protocol.safety_notes.length >= expected.safety_note_min,
      `${testCase.id}: expected at least ${expected.safety_note_min} safety notes`
    );
  }

  if (expected.follow_up_max !== undefined) {
    assert.ok(
      protocol.follow_up_questions.length <= expected.follow_up_max,
      `${testCase.id}: expected at most ${expected.follow_up_max} follow-up questions`
    );
  }

  assert.equal(protocol.monitoring_schema.mode, "dynamic_runtime", `${testCase.id}: expected runtime monitoring`);
  assert.ok(
    Array.isArray(protocol.monitoring_schema.fields),
    `${testCase.id}: expected monitoring fields array`
  );
}

const dynamicMonitoring = generateProtocol({
  thermal: "heat",
  moisture: "dry",
  energy_state: "overcharged",
  symptom_intensity: "moderate",
  digestive_sensitivity: "medium",
  symptoms: ["palpitations"],
  safety_flags: [],
  pemf_use: true,
  user_goals: ["sleep", "hydration"]
});

const monitoringFieldIds = dynamicMonitoring.monitoring_schema.fields.map((field) => field.id);
for (const fieldId of [
  "sleep",
  "burning_pain",
  "allodynia",
  "hydration",
  "stool_dryness",
  "palpitations",
  "pemf_tolerance",
  "next_day_overstimulation"
]) {
  assert.ok(
    monitoringFieldIds.includes(fieldId),
    `dynamic monitoring should include ${fieldId}`
  );
}

assert.equal(dynamicMonitoring.monitoring_schema.mode, "dynamic_runtime");
assert.ok(
  dynamicMonitoring.monitoring_schema.principle.includes("not disease categories"),
  "monitoring schema should not be disease-pathway based"
);

console.log(`Engine tests passed: ${testCases.length}/${testCases.length}`);
