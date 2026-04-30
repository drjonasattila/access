/**
 * AVICENNA WELLNESS LAYER — INPUT FORM COMPONENT
 * src/components/InputForm.js
 *
 * Manages form state and user input collection.
 * Vanilla JS implementation. For Next.js: convert to React + TypeScript.
 * See docs/NEXTJS_MIGRATION.md for the React version skeleton.
 *
 * Usage: InputForm.mount(document.getElementById("av-form-container"))
 */

const InputForm = (() => {

  const state = {
    thermal:               null,
    moisture:              null,
    energy_state:          null,
    symptom_intensity:     null,
    digestive_sensitivity: null,
    frailty:               false,
    symptoms:              [],
    safety_flags:          []
  };

  const FIELDS = {
    thermal: {
      label: "Thermal tendency",
      options: [
        { value: "cold",    label: "Cold — feel cold, worse in cold weather" },
        { value: "neutral", label: "Neutral — no strong tendency" },
        { value: "heat",    label: "Heat — feel hot, burning, restless" }
      ]
    },
    moisture: {
      label: "Moisture state",
      options: [
        { value: "damp",    label: "Damp — heavy, bloated, foggy" },
        { value: "neutral", label: "Neutral — neither clearly" },
        { value: "dry",     label: "Dry — dry skin, thirsty, depleted" }
      ]
    },
    energy_state: {
      label: "Energy state",
      options: [
        { value: "undercharged", label: "Low — exhausted, slow, depleted" },
        { value: "neutral",      label: "Moderate — neither extreme" },
        { value: "overcharged",  label: "Overactive — wired, agitated, hypersensitive" }
      ]
    },
    symptom_intensity: {
      label: "How strong are your symptoms?",
      options: [
        { value: "mild",     label: "Mild — noticeable" },
        { value: "moderate", label: "Moderate — affecting daily life" },
        { value: "strong",   label: "Strong — significantly disruptive" }
      ]
    },
    digestive_sensitivity: {
      label: "Digestive sensitivity",
      options: [
        { value: "low",    label: "Tolerates most things well" },
        { value: "medium", label: "Somewhat sensitive" },
        { value: "high",   label: "Very sensitive — reacts easily" }
      ]
    }
  };

  const SYMPTOMS = [
    { value: "bloating",         label: "Bloating" },
    { value: "brain_fog",        label: "Brain fog" },
    { value: "cold_hands_feet",  label: "Cold hands / feet" },
    { value: "dry_mouth",        label: "Dry mouth" },
    { value: "irritability",     label: "Irritability" },
    { value: "loose_stool",      label: "Loose stool" },
    { value: "constipation_dry", label: "Constipation / dry" },
    // NOTE: "palpitations" here is the SYMPTOM modifier (formula-level)
    // NOT the same as "palpitations_flag" in SAFETY which is a safety restriction
    { value: "palpitations",     label: "Palpitations / anxiety" }
  ];

  const SAFETY = [
    { value: "pregnancy",         label: "Pregnancy" },
    { value: "gastritis",         label: "Gastritis / ulcers" },
    { value: "hypertension",      label: "High blood pressure" },
    // NOTE: "palpitations_flag" here is the SAFETY restriction (ingredient-level block)
    // NOT the same as "palpitations" in SYMPTOMS which is a formula modifier
    { value: "palpitations_flag", label: "Significant palpitations" },
    { value: "anticoagulants",    label: "Blood thinners" }
  ];

  function validate() {
    const required = ["thermal","moisture","energy_state","symptom_intensity","digestive_sensitivity"];
    return required.filter(k => !state[k]);
  }

  function toggleArrayValue(arr, value) {
    const idx = arr.indexOf(value);
    if (idx === -1) arr.push(value); else arr.splice(idx, 1);
  }

  function mount(container) {
    const fieldHtml = Object.entries(FIELDS).map(([k, f]) => `
      <div class="av-field-group">
        <div class="av-field-label">${f.label}</div>
        <div class="av-options">${f.options.map(o =>
          `<label class="av-option">
            <input type="radio" name="${k}" value="${o.value}" onchange="InputForm.setField('${k}','${o.value}')">
            <span>${o.label}</span>
          </label>`).join("")}
        </div>
      </div>`).join("");

    const frailtyHtml = `
      <div class="av-field-group">
        <div class="av-field-label">General resilience</div>
        <label class="av-check">
          <input type="checkbox" onchange="InputForm.toggleFrailty()">
          <span>Low resilience — easily fatigued, sensitive to change</span>
        </label>
      </div>`;

    const symHtml = `
      <div class="av-field-group">
        <div class="av-field-label">Current symptoms (select all that apply)</div>
        <div class="av-checks">${SYMPTOMS.map(s =>
          `<label class="av-check">
            <input type="checkbox" value="${s.value}" onchange="InputForm.toggleSymptom('${s.value}')">
            <span>${s.label}</span>
          </label>`).join("")}
        </div>
      </div>`;

    const safeHtml = `
      <div class="av-field-group">
        <div class="av-field-label">Any of these apply? (optional)</div>
        <div class="av-checks">${SAFETY.map(s =>
          `<label class="av-check av-check--safety">
            <input type="checkbox" value="${s.value}" onchange="InputForm.toggleSafetyFlag('${s.value}')">
            <span>${s.label}</span>
          </label>`).join("")}
        </div>
      </div>`;

    container.innerHTML = `
      <form class="av-form" onsubmit="return false;">
        ${fieldHtml}
        ${frailtyHtml}
        ${symHtml}
        ${safeHtml}
        <div class="av-validation-msg" id="av-validation-msg" style="display:none;"></div>
        <button class="av-btn-primary" type="button" onclick="InputForm.submit()">
          Generate my protocol
        </button>
      </form>`;
  }

  function submit() {
    const missing = validate();
    const msg = document.getElementById("av-validation-msg");
    if (missing.length) {
      msg.style.display = "block";
      msg.textContent = "Please complete: " + missing.map(k => FIELDS[k]?.label || k).join(", ");
      return;
    }
    msg.style.display = "none";
    if (!window.AvicennaEngine) { console.error("AvicennaEngine not loaded."); return; }
    const output = window.AvicennaEngine.generateProtocol({ ...state });
    if (window.AvicennaOutput) window.AvicennaOutput.render(output);
    else console.log("Protocol output:", JSON.stringify(output, null, 2));
  }

  function setField(field, value)  { state[field] = value; }
  function toggleFrailty()         { state.frailty = !state.frailty; }
  function toggleSymptom(value)    { toggleArrayValue(state.symptoms, value); }
  function toggleSafetyFlag(value) { toggleArrayValue(state.safety_flags, value); }
  function reset() {
    Object.assign(state, {
      thermal: null, moisture: null, energy_state: null,
      symptom_intensity: null, digestive_sensitivity: null,
      frailty: false, symptoms: [], safety_flags: []
    });
  }
  function getState() { return { ...state }; }

  if (typeof window !== "undefined") {
    window.InputForm = { mount, submit, setField, toggleFrailty, toggleSymptom, toggleSafetyFlag, reset, getState };
  }

  return { mount, submit, setField, toggleFrailty, toggleSymptom, toggleSafetyFlag, reset, getState };

})();
