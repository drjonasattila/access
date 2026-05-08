"use client";

import { useMemo, useState } from "react";

const initialInput = {
  thermal: "",
  moisture: "",
  energy_state: "",
  symptom_intensity: "",
  digestive_sensitivity: "",
  frailty: false,
  symptoms: [],
  safety_flags: []
};

const fieldGroups = [
  {
    key: "thermal",
    label: "Thermal tendency",
    options: [
      ["cold", "Cold", "Feel cold, worse in cold weather"],
      ["neutral", "Neutral", "No strong tendency"],
      ["heat", "Heat", "Feel hot, burning, restless"]
    ]
  },
  {
    key: "moisture",
    label: "Moisture state",
    options: [
      ["damp", "Damp", "Heavy, bloated, foggy"],
      ["neutral", "Neutral", "Neither clearly"],
      ["dry", "Dry", "Dry skin, thirsty, depleted"]
    ]
  },
  {
    key: "energy_state",
    label: "Energy state",
    options: [
      ["undercharged", "Low", "Exhausted, slow, depleted"],
      ["neutral", "Moderate", "Neither extreme"],
      ["overcharged", "Overactive", "Wired, agitated, hypersensitive"]
    ]
  },
  {
    key: "symptom_intensity",
    label: "Symptom intensity",
    options: [
      ["mild", "Mild", "Noticeable"],
      ["moderate", "Moderate", "Affecting daily life"],
      ["strong", "Strong", "Significantly disruptive"]
    ]
  },
  {
    key: "digestive_sensitivity",
    label: "Digestive sensitivity",
    options: [
      ["low", "Low", "Tolerates most things well"],
      ["medium", "Medium", "Somewhat sensitive"],
      ["high", "High", "Very sensitive, reacts easily"]
    ]
  }
];

const symptoms = [
  ["bloating", "Bloating"],
  ["brain_fog", "Brain fog"],
  ["cold_hands_feet", "Cold hands / feet"],
  ["dry_mouth", "Dry mouth"],
  ["irritability", "Irritability"],
  ["loose_stool", "Loose stool"],
  ["constipation_dry", "Constipation / dry"],
  ["palpitations", "Palpitations / anxiety"]
];

const safetyFlags = [
  ["pregnancy", "Pregnancy"],
  ["gastritis", "Gastritis / ulcers"],
  ["hypertension", "High blood pressure"],
  ["palpitations_flag", "Significant palpitations"],
  ["anticoagulants", "Blood thinners"]
];

const headacheInitialInput = {
  pain_quality: "",
  sensory_features: [],
  timing: "",
  energy_state: "",
  existing_diagnosis: [],
  current_medications: [],
  treatment_response: "",
  body_signals: [],
  tongue_photo: "",
  tongue_features: [],
  trigger_category: "",
  early_warning_signs: [],
  frailty: false,
  emotional_constraint: false,
  digestive_sensitivity: false,
  cancer_active: false,
  post_chemo_window: false,
  gut_flare_active: false,
  new_neurological_deficit: false,
  thunderclap_headache: false,
  acute_headache_episode: false,
  ProImmunoR_requested: false,
  multiple_adaptogens_stacking: false,
  glutathione_initiated: false,
  EZ_stabilisation_not_done: false,
  laser_eligibility_check: false,
  omega3_dose: "",
  reassessment_day: "",
  internal_audit: false
};

const headacheFieldGroups = [
  {
    key: "pain_quality",
    label: "Pain quality",
    options: [
      ["pulsing_throbbing", "Pulsing", "Throbbing or pulsatile"],
      ["dull_heavy", "Heavy", "Dull, weighted, foggy"],
      ["tight_band_like", "Band-like", "Tight or compressive"],
      ["sharp_stabbing", "Sharp", "Stabbing or electric"]
    ]
  },
  {
    key: "timing",
    label: "Timing",
    options: [
      ["worse_morning", "Morning", "Worse on waking"],
      ["worse_afternoon", "Afternoon", "Builds through the day"],
      ["worse_evening", "Evening", "Later-day pattern"],
      ["wakes_at_night", "Night waking", "Wakes from sleep"]
    ]
  },
  {
    key: "energy_state",
    label: "Energy state",
    options: [
      ["tired_but_wired", "Wired-tired", "Activated but depleted"],
      ["exhausted", "Exhausted", "Low recovery capacity"],
      ["irritable", "Irritable", "Reactive, buzzing"],
      ["cold", "Cold", "Cold, low warmth"]
    ]
  },
  {
    key: "trigger_category",
    label: "Trigger pattern",
    options: [
      ["weather", "Weather", "Pressure or weather changes"],
      ["stress_overload", "Stress load", "Overload or strain"],
      ["overexertion", "Exertion", "Physical overexertion"],
      ["sleep_disruption", "Sleep", "Poor sleep or rhythm shift"],
      ["food_alcohol_histamine", "Food", "Food, alcohol, histamine"],
      ["infection", "Infection", "Post-infectious pattern"],
      ["hormonal", "Hormonal", "Cycle-linked pattern"]
    ]
  },
  {
    key: "treatment_response",
    label: "Response pattern",
    options: [
      ["helps_temporarily", "Temporary help", "Helps, then fades"],
      ["helps_pain_but_drains", "Draining relief", "Pain improves but energy drops"],
      ["helps_less_less", "Less effective", "Helps less over time"],
      ["helps_but_side_effects", "Side effects", "Helpful but costly"],
      ["no_help", "No help", "No clear benefit"]
    ]
  },
  {
    key: "omega3_dose",
    label: "Omega-3 context",
    options: [
      ["none", "None", "Not currently used"],
      ["low", "Low", "Small dose only"],
      ["high", "High", "High-dose use"]
    ]
  }
];

const headacheMultiGroups = [
  {
    key: "sensory_features",
    title: "Sensory features",
    items: [
      ["light_sensitivity", "Light sensitivity"],
      ["sound_sensitivity", "Sound sensitivity"],
      ["visual_aura", "Visual aura"],
      ["nausea", "Nausea"]
    ]
  },
  {
    key: "existing_diagnosis",
    title: "Existing labels or background",
    items: [
      ["migraine_with_aura", "Migraine with aura"],
      ["migraine_without_aura", "Migraine without aura"],
      ["tension_headache", "Tension headache"],
      ["cervical_spine", "Cervical spine"],
      ["diabetes", "Diabetes"],
      ["hypertension", "Hypertension"],
      ["anxiety_depression", "Anxiety / depression"]
    ]
  },
  {
    key: "current_medications",
    title: "Current medications",
    items: [
      ["triptan", "Triptan"],
      ["beta_blocker", "Beta blocker"],
      ["antidepressant", "Antidepressant"],
      ["gabapentin_pregabalin", "Gabapentin / pregabalin"],
      ["NSAID", "NSAID"],
      ["none", "None"]
    ]
  },
  {
    key: "body_signals",
    title: "Body signals",
    items: [
      ["dry_mouth", "Dry mouth"],
      ["dry_stool_constipation", "Dry stool / constipation"],
      ["dark_urine", "Dark urine"],
      ["dry_skin", "Dry skin"],
      ["brittle_nails", "Brittle nails"],
      ["brittle_hair", "Brittle hair"],
      ["bloating_heaviness", "Bloating / heaviness"],
      ["cold_hands_feet", "Cold hands / feet"],
      ["sweating_without_exertion", "Sweating without exertion"],
      ["usually_cold", "Usually cold"],
      ["usually_hot", "Usually hot"]
    ]
  },
  {
    key: "tongue_features",
    title: "Tongue features",
    items: [
      ["swollen", "Swollen"],
      ["thin", "Thin"],
      ["dry", "Dry"],
      ["thick_coating", "Thick coating"],
      ["purple_dark", "Purple / dark"],
      ["normal", "Normal"]
    ]
  },
  {
    key: "early_warning_signs",
    title: "Early warning signs",
    items: [
      ["bloating", "Bloating"],
      ["reflux", "Reflux"],
      ["constipation", "Constipation"],
      ["nausea", "Nausea"],
      ["neck_stiffness", "Neck stiffness"],
      ["jaw_tightness", "Jaw tightness"],
      ["shoulder_pull", "Shoulder pull"],
      ["light_sensitivity", "Light sensitivity"],
      ["scalp_tenderness", "Scalp tenderness"],
      ["irritability_buzzing", "Irritability / buzzing"],
      ["pulsatile_temple", "Pulsatile temple"],
      ["heavy_head", "Heavy head"],
      ["cold_hands_feet", "Cold hands / feet"],
      ["exertion_intolerance", "Exertion intolerance"]
    ]
  }
];

const headacheSafetyFlags = [
  ["thunderclap_headache", "Thunderclap headache"],
  ["new_neurological_deficit", "New neurological deficit"],
  ["cancer_active", "Active cancer"],
  ["post_chemo_window", "Post-chemo window"],
  ["gut_flare_active", "Active gut flare"],
  ["digestive_sensitivity", "Digestive sensitivity"],
  ["frailty", "Low resilience / frailty"],
  ["acute_headache_episode", "Acute headache episode"]
];

const headacheAdvancedFlags = [
  ["internal_audit", "Internal audit mode"],
  ["emotional_constraint", "Cellular recovery stress marker"],
  ["ProImmunoR_requested", "ProImmunoR requested"],
  ["multiple_adaptogens_stacking", "Multiple adaptogens stacking"],
  ["glutathione_initiated", "Glutathione initiated"],
  ["EZ_stabilisation_not_done", "EZ preparation not completed"],
  ["laser_eligibility_check", "Laser eligibility check"]
];

function titleCase(value) {
  return String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ToggleList({ title, items, selected, onToggle, safety }) {
  return (
    <section className="av-section">
      <h2>{title}</h2>
      <div className="av-check-grid">
        {items.map(([value, label]) => (
          <label className={safety ? "av-check av-check-safety" : "av-check"} key={value}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function ProtocolOutput({ protocol, onReset }) {
  if (!protocol) return null;

  const secondary = protocol.secondary_pattern ? ` + ${titleCase(protocol.secondary_pattern)}` : "";

  return (
    <aside className="av-output" aria-live="polite">
      <div className="av-output-header">
        <p>{titleCase(protocol.primary_pattern)}{secondary}</p>
        <strong>Formula strength: {protocol.formula_strength}</strong>
      </div>

      <section>
        <h2>Your formula</h2>
        <div className="av-ingredients">
          {protocol.ingredients.map((ingredient) => (
            <div className="av-ingredient" key={`${ingredient.name}-${ingredient.role}`}>
              <strong>{ingredient.name}</strong>
              <span>{ingredient.amount}</span>
              <small>{ingredient.role}</small>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Preparation</h2>
        <p>{protocol.preparation}</p>
        <p className="av-muted">Timing: {protocol.timing}</p>
      </section>

      <TagSection title="What this supports" items={protocol.field_effects} tone="effect" />
      <TagSection title="Adjustments applied" items={protocol.modifications_applied} tone="mod" />
      <TagSection title="Avoid for now" items={protocol.avoid} tone="avoid" empty="None" />

      {protocol.safety_notes.length > 0 && (
        <section className="av-safety-box">
          <h2>Safety notes</h2>
          {protocol.safety_notes.map((note) => <p key={note}>{note}</p>)}
        </section>
      )}

      {protocol.follow_up_questions.length > 0 && (
        <section>
          <h2>To refine further</h2>
          {protocol.follow_up_questions.map((question) => <p key={question}>{question}</p>)}
        </section>
      )}

      <p className="av-disclaimer">
        This is a wellness guide, not a medical prescription. If you have a health condition
        or take medications, check with your clinician before starting any new protocol.
      </p>

      <details className="av-debug">
        <summary>Rule trace</summary>
        {protocol.debug_trace.map((line) => <span key={line}>{line}</span>)}
      </details>

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function TagSection({ title, items, tone, empty = "None" }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length ? (
        <div className="av-tags">
          {items.map((item) => <span className={`av-tag av-tag-${tone}`} key={item}>{item}</span>)}
        </div>
      ) : (
        <p className="av-muted">{empty}</p>
      )}
    </section>
  );
}

function ModeTabs({ mode, onChange }) {
  return (
    <nav className="av-mode-tabs" aria-label="Engine mode">
      <button
        className={mode === "wellness" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("wellness")}
      >
        Wellness protocol
      </button>
      <button
        className={mode === "headache" ? "av-mode-tab av-mode-tab-active" : "av-mode-tab"}
        type="button"
        onClick={() => onChange("headache")}
      >
        Headache patterns
      </button>
    </nav>
  );
}

function HeadacheResult({ result, advanced, onReset }) {
  if (!result) return null;

  const patient = result.patient;
  const axisRows = Object.entries(result.axis_scores || {});

  return (
    <aside className="av-output av-headache-output" aria-live="polite">
      <div className={result.stopped ? "av-output-header av-output-header-danger" : "av-output-header"}>
        <p>{result.stopped ? "Urgent safety stop" : "Headache / migraine terrain"}</p>
        <strong>{patient.title}</strong>
      </div>

      <section>
        <h2>Pattern interpretation</h2>
        <p>{patient.summary}</p>
        {result.mixed_pattern && (
          <p className="av-muted">The top two axes are close, so this is treated as a layered pattern.</p>
        )}
      </section>

      <TagSection title="Support focus" items={patient.support} tone="effect" empty="No support output while red flags are active." />
      <TagSection title="Avoid / defer" items={patient.avoid} tone="avoid" />

      <section className="av-safety-box">
        <h2>Safety notes</h2>
        {patient.safety_notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      {patient.reassessment_prompt && (
        <section>
          <h2>Day 10-14 check-in</h2>
          <p>{patient.reassessment_prompt}</p>
        </section>
      )}

      {advanced && (
        <details className="av-debug" open>
          <summary>Advanced clinician view</summary>
          <div className="av-axis-table">
            {axisRows.map(([axis, value]) => (
              <div className="av-axis-row" key={axis}>
                <strong>{axis.replace(/_/g, " ")}</strong>
                <span>{value.score}</span>
              </div>
            ))}
            <div className="av-axis-row">
              <strong>membrane EZ-water instability</strong>
              <span>{result.membrane_EZ_water_instability_score.score}</span>
            </div>
          </div>
          <p>Dominant pattern: {result.dominant_pattern}</p>
          <p>Embryological layer: {result.embryological_layer}</p>
          <p>TCM channel: {result.tcm_channel}</p>
          <p>Vessel overlay: {result.vessel_overlay_active ? "active" : "not dominant"}</p>
          <TagSection title="Drug-terrain conflicts" items={result.drug_terrain_conflicts} tone="avoid" empty="None flagged" />
          <TagSection title="Contraindications" items={result.contraindications} tone="avoid" empty="None flagged" />
          {result.clinician.rule_trace.length > 0 && (
            <section>
              <h2>Rule trace</h2>
              {result.clinician.rule_trace.map((rule) => (
                <span key={`${rule.condition}-${rule.action}`}>{rule.condition}: {rule.action}</span>
              ))}
            </section>
          )}
        </details>
      )}

      <button className="av-secondary-button" type="button" onClick={onReset}>
        Start again
      </button>
    </aside>
  );
}

function HeadacheEngineSection() {
  const [input, setInput] = useState(headacheInitialInput);
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/headache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, internal_audit: advanced || input.internal_audit })
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Headache evaluation failed");
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(headacheInitialInput);
    setResult(null);
    setError("");
  }

  return (
    <div className="av-workspace av-headache-workspace">
      <form className="av-form" onSubmit={submit}>
        <section className="av-section">
          <h2>Headache / migraine pattern engine</h2>
          <p className="av-muted">
            This is an educational pattern-recognition tool and not a medical diagnosis.
            Seek urgent care for red flag symptoms. Medication changes must be discussed with a clinician.
          </p>
        </section>

        {headacheFieldGroups.map((group) => (
          <section className="av-section" key={group.key}>
            <h2>{group.label}</h2>
            <div className="av-options">
              {group.options.map(([value, label, description]) => (
                <label className="av-option" key={value}>
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={input[group.key] === value}
                    onChange={() => setField(group.key, value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {headacheMultiGroups.map((group) => (
          <ToggleList
            key={group.key}
            title={group.title}
            items={group.items}
            selected={input[group.key]}
            onToggle={(value) => toggleArray(group.key, value)}
          />
        ))}

        <ToggleList
          title="Safety and context"
          items={headacheSafetyFlags}
          selected={headacheSafetyFlags.filter(([key]) => input[key]).map(([key]) => key)}
          onToggle={(value) => setField(value, !input[value])}
          safety
        />

        <section className="av-section">
          <h2>Tongue photo</h2>
          <input
            className="av-file"
            type="file"
            accept="image/*"
            onChange={(event) => setField("tongue_photo", event.target.files?.[0]?.name || "")}
          />
          <p className="av-muted">The current engine records that a photo was provided; image interpretation remains separate.</p>
        </section>

        <section className="av-section">
          <h2>Advanced view</h2>
          <label className="av-check">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Show clinician/debug inputs and result panel</span>
          </label>
        </section>

        {advanced && (
          <>
            <ToggleList
              title="Clinician/debug flags"
              items={headacheAdvancedFlags}
              selected={headacheAdvancedFlags.filter(([key]) => input[key]).map(([key]) => key)}
              onToggle={(value) => setField(value, !input[value])}
              safety
            />
            <section className="av-section">
              <h2>Reassessment day</h2>
              <input
                className="av-number"
                min="0"
                type="number"
                value={input.reassessment_day}
                onChange={(event) => setField("reassessment_day", event.target.value)}
              />
            </section>
          </>
        )}

        {error && <p className="av-error">{error}</p>}

        <button className="av-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Evaluating..." : "Evaluate headache pattern"}
        </button>
      </form>

      <HeadacheResult result={result} advanced={advanced} onReset={reset} />
    </div>
  );
}

export default function AvicennaApp() {
  const [mode, setMode] = useState("wellness");
  const [input, setInput] = useState(initialInput);
  const [protocol, setProtocol] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const missing = useMemo(
    () => fieldGroups.filter((group) => !input[group.key]).map((group) => group.label),
    [input]
  );

  function setField(key, value) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setInput((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (missing.length) {
      setError(`Please complete: ${missing.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Protocol generation failed");
      setProtocol(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setInput(initialInput);
    setProtocol(null);
    setError("");
  }

  return (
    <main className="av-page">
      <header className="av-header">
        <p>Avicenna Clinical Engine</p>
        <h1>{mode === "headache" ? "Headache pattern engine" : "Wellness protocol generator"}</h1>
        <span>
          {mode === "headache"
            ? "Safety-first terrain scoring across nerve, fascia, gut, vessel, and energy-recovery axes"
            : "Rule-based terrain assessment and tea protocol builder"}
        </span>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      {mode === "headache" ? (
        <HeadacheEngineSection />
      ) : (
      <div className="av-workspace">
        <form className="av-form" onSubmit={submit}>
          {fieldGroups.map((group) => (
            <section className="av-section" key={group.key}>
              <h2>{group.label}</h2>
              <div className="av-options">
                {group.options.map(([value, label, description]) => (
                  <label className="av-option" key={value}>
                    <input
                      type="radio"
                      name={group.key}
                      value={value}
                      checked={input[group.key] === value}
                      onChange={() => setField(group.key, value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section className="av-section">
            <h2>General resilience</h2>
            <label className="av-check">
              <input
                type="checkbox"
                checked={input.frailty}
                onChange={(event) => setField("frailty", event.target.checked)}
              />
              <span>Low resilience, easily fatigued, sensitive to change</span>
            </label>
          </section>

          <ToggleList
            title="Current symptoms"
            items={symptoms}
            selected={input.symptoms}
            onToggle={(value) => toggleArray("symptoms", value)}
          />

          <ToggleList
            title="Safety flags"
            items={safetyFlags}
            selected={input.safety_flags}
            onToggle={(value) => toggleArray("safety_flags", value)}
            safety
          />

          {error && <p className="av-error">{error}</p>}

          <button className="av-primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate protocol"}
          </button>
        </form>

        <ProtocolOutput protocol={protocol} onReset={reset} />
      </div>
      )}
    </main>
  );
}
