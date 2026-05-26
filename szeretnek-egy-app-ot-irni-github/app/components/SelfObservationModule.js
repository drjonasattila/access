"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "avicenna:self-observation:v1";

const today = () => new Date().toISOString().slice(0, 10);

const initialEntry = {
  date: today(),
  sleep_quality: 5,
  energy: 5,
  pain_or_discomfort: 0,
  stress_activation: 0,
  digestion: "mixed",
  hydration_feeling: "balanced",
  thermal_state: "balanced",
  nervous_system_state: "stable",
  interventions_used: [],
  response_after_intervention: [],
  notes: ""
};

const interventions = [
  ["olylife_pemf", "Olylife / PEMF"],
  ["herbs", "Herbs"],
  ["hydration", "Hydration"],
  ["walking_movement", "Walking / movement"],
  ["breathing", "Breathing"],
  ["heat_exposure", "Heat exposure"],
  ["cold_exposure", "Cold exposure"],
  ["other", "Other"]
];

const responses = [
  ["improved", "Improved"],
  ["no_change", "No change"],
  ["worse", "Worse"],
  ["overstimulated", "Overstimulated"],
  ["calmer", "Calmer"],
  ["slept_better", "Slept better"]
];

const selectFields = [
  ["digestion", "Digestion", [["poor", "Poor"], ["mixed", "Mixed"], ["good", "Good"]]],
  ["hydration_feeling", "Hydration feeling", [["dry", "Dry"], ["balanced", "Balanced"], ["damp-heavy", "Damp-heavy"]]],
  ["thermal_state", "Thermal state", [["cold", "Cold"], ["balanced", "Balanced"], ["hot", "Hot"]]],
  ["nervous_system_state", "Nervous system state", [["collapsed", "Collapsed"], ["stable", "Stable"], ["wired", "Wired"]]]
];

const scoreFields = [
  ["sleep_quality", "Sleep quality", 1, 10],
  ["energy", "Energy", 1, 10],
  ["pain_or_discomfort", "Pain or discomfort", 0, 10],
  ["stress_activation", "Stress activation", 0, 10]
];

function average(entries, selector) {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + selector(entry), 0) / entries.length;
}

function recoveryScore(entry) {
  return Number(entry.sleep_quality) + Number(entry.energy) - Number(entry.pain_or_discomfort) - Number(entry.stress_activation);
}

function generateTrendIndicators(entries) {
  if (!entries.length) return [];

  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = ordered[ordered.length - 1];
  const lastThree = ordered.slice(-3);
  const previousThree = ordered.slice(-6, -3);
  const indicators = [];

  if (previousThree.length) {
    const recentRecovery = average(lastThree, recoveryScore);
    const previousRecovery = average(previousThree, recoveryScore);
    if (recentRecovery > previousRecovery + 1) {
      indicators.push({
        id: "recovery_improving",
        title: "Recovery improving",
        text: "Recent sleep, energy, pain and stress scores suggest improving biological responsiveness."
      });
    }
  }

  if (
    latest.response_after_intervention.includes("overstimulated") ||
    latest.response_after_intervention.includes("worse") ||
    (latest.nervous_system_state === "wired" && Number(latest.stress_activation) >= 7)
  ) {
    indicators.push({
      id: "possible_overstimulation",
      title: "Possible overstimulation",
      text: "The latest entry suggests the system may need gentler pacing and closer next-day response observation."
    });
  }

  if (
    Number(latest.energy) <= 4 ||
    latest.nervous_system_state === "collapsed" ||
    (latest.thermal_state === "cold" && Number(latest.sleep_quality) <= 5)
  ) {
    indicators.push({
      id: "undercharged_pattern",
      title: "Undercharged pattern",
      text: "Low energy, collapse, coldness or poor sleep may point toward a low-reserve terrain trend."
    });
  }

  if (
    latest.thermal_state === "hot" ||
    latest.nervous_system_state === "wired" ||
    Number(latest.stress_activation) >= 7
  ) {
    indicators.push({
      id: "heat_overactivation_pattern",
      title: "Heat / overactivation pattern",
      text: "Heat, wired state or high activation suggests tracking signal noise, sleep onset and calming response."
    });
  }

  if (
    latest.hydration_feeling === "damp-heavy" ||
    latest.digestion === "poor" ||
    (latest.digestion === "mixed" && Number(latest.energy) <= 5)
  ) {
    indicators.push({
      id: "damp_heavy_pattern",
      title: "Damp / heavy pattern",
      text: "Heavy hydration feeling, poor digestion or low energy may suggest a slowed terrain trend."
    });
  }

  return indicators.length
    ? indicators
    : [{
      id: "stable_observation",
      title: "Stable observation window",
      text: "No strong trend is visible yet. Continue observing daily pattern, response and pacing."
    }];
}

function formatList(values, options) {
  if (!values.length) return "None recorded";
  const labels = new Map(options);
  return values.map((value) => labels.get(value) || value).join(", ");
}

export default function SelfObservationModule() {
  const [entry, setEntry] = useState(initialEntry);
  const [entries, setEntries] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) setEntries(stored);
    } catch {
      setEntries([]);
    }
  }, []);

  const timeline = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [entries]
  );
  const trendIndicators = useMemo(() => generateTrendIndicators(timeline), [timeline]);

  function setField(key, value) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setEntry((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      };
    });
  }

  function saveEntry(event) {
    event.preventDefault();
    const cleaned = {
      ...entry,
      sleep_quality: Number(entry.sleep_quality),
      energy: Number(entry.energy),
      pain_or_discomfort: Number(entry.pain_or_discomfort),
      stress_activation: Number(entry.stress_activation),
      saved_at: new Date().toISOString()
    };
    const withoutSameDate = entries.filter((item) => item.date !== cleaned.date);
    const nextEntries = [...withoutSameDate, cleaned].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(nextEntries);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    setSavedMessage("Entry saved locally.");
    setEntry({ ...initialEntry, date: today() });
  }

  function clearEntries() {
    setEntries([]);
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedMessage("Local self-observation entries cleared.");
  }

  return (
    <main className="av-page">
      <header className="av-header">
        <p>Avicenna Clinical Engine</p>
        <h1>Self Observation</h1>
        <span>Track daily signals, interventions and biological responsiveness over time.</span>
        <nav className="av-mode-tabs" aria-label="Self observation navigation">
          <a className="av-mode-tab" href="/">Back to engine</a>
        </nav>
      </header>

      <div className="av-self-observation-grid">
        <form className="av-form" onSubmit={saveEntry}>
          <section className="av-section">
            <h2>Daily system state</h2>
            <label className="av-score-field">
              <span>Date</span>
              <input
                className="av-text-input"
                type="date"
                value={entry.date}
                onChange={(event) => setField("date", event.target.value)}
              />
            </label>
          </section>

          <section className="av-section">
            <h2>Scores</h2>
            <div className="av-score-grid">
              {scoreFields.map(([key, label, min, max]) => (
                <label className="av-score-field" key={key}>
                  <span>{label}: {entry[key]}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={entry[key]}
                    onChange={(event) => setField(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="av-section">
            <h2>Terrain state</h2>
            <div className="av-score-grid">
              {selectFields.map(([key, label, options]) => (
                <label className="av-score-field" key={key}>
                  <span>{label}</span>
                  <select
                    className="av-text-input"
                    value={entry[key]}
                    onChange={(event) => setField(key, event.target.value)}
                  >
                    {options.map(([value, optionLabel]) => (
                      <option value={value} key={value}>{optionLabel}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <ToggleChecklist
            title="Interventions used"
            items={interventions}
            selected={entry.interventions_used}
            onToggle={(value) => toggleArray("interventions_used", value)}
          />

          <ToggleChecklist
            title="Response after intervention"
            items={responses}
            selected={entry.response_after_intervention}
            onToggle={(value) => toggleArray("response_after_intervention", value)}
          />

          <section className="av-section">
            <h2>Notes</h2>
            <textarea
              className="av-text-input av-notes-input"
              value={entry.notes}
              onChange={(event) => setField("notes", event.target.value)}
              placeholder="What changed today? What felt calmer, heavier, hotter, clearer or more reactive?"
            />
          </section>

          {savedMessage && <p className="av-self-save-message">{savedMessage}</p>}

          <button className="av-primary-button" type="submit">
            Save local entry
          </button>
        </form>

        <aside className="av-output av-self-output" aria-live="polite">
          <div className="av-output-header">
            <p>Longitudinal feedback</p>
            <strong>Last 7 entries</strong>
          </div>

          <section>
            <h2>Terrain trend indicators</h2>
            <div className="av-ingredients">
              {trendIndicators.map((indicator) => (
                <div className="av-ingredient" key={indicator.id}>
                  <strong>{indicator.title}</strong>
                  <small>{indicator.text}</small>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Timeline</h2>
            {timeline.length ? (
              <div className="av-self-timeline">
                {timeline.map((item) => (
                  <article className="av-self-entry" key={`${item.date}-${item.saved_at}`}>
                    <div>
                      <strong>{item.date}</strong>
                      <span>Sleep {item.sleep_quality}/10 · Energy {item.energy}/10 · Pain {item.pain_or_discomfort}/10 · Stress {item.stress_activation}/10</span>
                    </div>
                    <p>{item.thermal_state} · {item.hydration_feeling} · {item.nervous_system_state} · digestion {item.digestion}</p>
                    <p>Interventions: {formatList(item.interventions_used, interventions)}</p>
                    <p>Response: {formatList(item.response_after_intervention, responses)}</p>
                    {item.notes && <p className="av-muted">{item.notes}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="av-muted">No entries yet. Save today&apos;s observation to begin the timeline.</p>
            )}
          </section>

          <p className="av-disclaimer">
            This is not diagnosis. It helps you observe how your system responds over time.
          </p>

          {entries.length > 0 && (
            <button className="av-secondary-button" type="button" onClick={clearEntries}>
              Clear local entries
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

function ToggleChecklist({ title, items, selected, onToggle }) {
  return (
    <section className="av-section">
      <h2>{title}</h2>
      <div className="av-check-grid">
        {items.map(([value, label]) => (
          <label className="av-check" key={value}>
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
