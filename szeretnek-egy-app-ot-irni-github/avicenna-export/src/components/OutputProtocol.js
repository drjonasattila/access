/**
 * AVICENNA WELLNESS LAYER — OUTPUT PROTOCOL COMPONENT
 * src/components/OutputProtocol.js
 *
 * Renders the protocol output returned by engine.generateProtocol().
 * Vanilla JS implementation. For Next.js: convert to React + TypeScript.
 * See docs/NEXTJS_MIGRATION.md for the React version skeleton.
 *
 * Usage:
 *   window.AvicennaOutput.setContainer(document.getElementById("av-output-container"))
 *   window.AvicennaOutput.render(protocolObject)
 */

const OutputProtocol = (() => {

  let _container = null;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function titleCase(s) {
    return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  function renderIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0)
      return '<p class="av-out-empty">No ingredients generated.</p>';
    return `<div class="av-ingredient-list">${
      ingredients.map(i => `
        <div class="av-ingredient">
          <div class="av-ing-name">${esc(i.name)}</div>
          <div class="av-ing-amount">${esc(i.amount)}</div>
          <div class="av-ing-role">${esc(i.role)}</div>
        </div>`).join("")
    }</div>`;
  }

  function renderTags(items, cls = "") {
    if (!items || items.length === 0)
      return '<span class="av-out-empty-inline">None</span>';
    return items.map(x => `<span class="av-tag ${cls}">${esc(x)}</span>`).join("");
  }

  function renderSafetyNotes(notes) {
    if (!notes || notes.length === 0) return "";
    return `
      <div class="av-out-section av-out-section--safety">
        <div class="av-out-label">Safety notes</div>
        ${notes.map(n => `<div class="av-safety-note">${esc(n)}</div>`).join("")}
      </div>`;
  }

  function renderFollowUps(questions) {
    if (!questions || questions.length === 0) return "";
    return `
      <div class="av-out-section">
        <div class="av-out-label">To refine further</div>
        ${questions.map(q => `<div class="av-followup-q">${esc(q)}</div>`).join("")}
      </div>`;
  }

  function renderDebugTrace(trace) {
    if (!trace || trace.length === 0) return "";
    return `
      <details class="av-debug-trace">
        <summary>Rule trace (debug / QA only)</summary>
        <div class="av-debug-content">
          ${trace.map(t => `<div>${esc(t)}</div>`).join("")}
        </div>
      </details>`;
  }

  function renderOutput(protocol) {
    const {
      primary_pattern, secondary_pattern, formula_strength,
      ingredients, preparation, timing,
      modifications_applied, avoid, field_effects,
      follow_up_questions, safety_notes, debug_trace
    } = protocol;

    const patternLabel = titleCase(primary_pattern || "Unknown pattern");
    const secondaryLabel = secondary_pattern ? ` + ${titleCase(secondary_pattern)}` : "";

    return `
      <div class="av-output">
        <div class="av-out-header">
          <div class="av-out-pattern">${patternLabel}${secondaryLabel}</div>
          <div class="av-out-strength">Formula strength: ${esc(formula_strength || "light")}</div>
        </div>
        <div class="av-out-section">
          <div class="av-out-label">Your formula — ${(ingredients || []).length} ingredients</div>
          ${renderIngredients(ingredients)}
        </div>
        <div class="av-out-section">
          <div class="av-out-label">Preparation</div>
          <div class="av-out-prep">${esc(preparation || "")}</div>
          <div class="av-out-timing">Timing: ${esc(timing || "")}</div>
          <div class="av-out-note">Use once daily initially. Increase only if well tolerated.</div>
        </div>
        <div class="av-out-section">
          <div class="av-out-label">What this supports</div>
          <div class="av-tags">${renderTags(field_effects, "av-tag--effect")}</div>
        </div>
        <div class="av-out-section">
          <div class="av-out-label">Adjustments applied</div>
          <div class="av-tags">${renderTags(modifications_applied, "av-tag--mod")}</div>
        </div>
        <div class="av-out-section">
          <div class="av-out-label">Avoid for now</div>
          <div class="av-tags">${renderTags(avoid, "av-tag--avoid")}</div>
        </div>
        ${renderSafetyNotes(safety_notes)}
        ${renderFollowUps(follow_up_questions)}
        <div class="av-out-section av-out-section--disclaimer">
          This is a wellness guide, not a medical prescription.
          If you have a health condition or take medications,
          check with your clinician before starting any new protocol.
        </div>
        ${renderDebugTrace(debug_trace)}
        <button class="av-btn-secondary" type="button" onclick="AvicennaOutput.reset()">
          ← Start again
        </button>
      </div>`;
  }

  function setContainer(el) { _container = el; }

  function render(protocol, container) {
    const target = container || _container;
    if (!target) { console.error("OutputProtocol: no container set."); return; }
    target.innerHTML = renderOutput(protocol);
    target.style.display = "block";
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    if (_container) { _container.innerHTML = ""; _container.style.display = "none"; }
    if (window.InputForm) {
      window.InputForm.reset();
      const fc = document.getElementById("av-form-container");
      if (fc) window.InputForm.mount(fc);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (typeof window !== "undefined") {
    window.AvicennaOutput = { render, reset, setContainer };
  }

  return { render, reset, setContainer };

})();
