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

export default function AvicennaApp() {
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
        <h1>Wellness protocol generator</h1>
        <span>Rule-based terrain assessment and tea protocol builder</span>
      </header>

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
    </main>
  );
}
