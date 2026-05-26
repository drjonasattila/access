const assert = require("node:assert/strict");
const {
  generateAdaptiveMonitoringSchema
} = require("../lib/avicenna/adaptiveMonitoringEngine.cjs");
const demo = require("../lib/avicenna/data/adaptiveMonitoringDemo.json");

const schema = generateAdaptiveMonitoringSchema(demo.rawInput);
const expected = demo.exampleGeneratedSchema;
const fieldIds = schema.monitoring_schema.fields.map((field) => field.id);

assert.equal(schema.version, "adaptive-monitoring-v1");
assert.equal(schema.disease_independent, true);
assert.deepEqual(schema.terrain_dimensions, expected.terrain_dimensions);

for (const cluster of expected.symptom_clusters) {
  assert.ok(
    schema.symptom_clusters.includes(cluster),
    `expected symptom cluster: ${cluster}`
  );
}

for (const risk of expected.intervention_risks) {
  assert.ok(schema.intervention_risks.includes(risk), `expected intervention risk: ${risk}`);
}

for (const fieldId of expected.requiredMonitoringFieldIds) {
  assert.ok(fieldIds.includes(fieldId), `expected monitoring field: ${fieldId}`);
}

assert.equal(schema.educational_summary.headline, expected.educationalSummaryHeadline);
assert.equal(schema.educational_summary.validation_note, expected.validationNote);
assert.ok(
  !JSON.stringify(schema.educational_summary).toLowerCase().includes("diagnosis"),
  "educational summary should not use diagnosis language"
);

console.log(`Adaptive monitoring demo fields: ${fieldIds.join(", ")}`);
console.log("Adaptive monitoring engine tests passed");
