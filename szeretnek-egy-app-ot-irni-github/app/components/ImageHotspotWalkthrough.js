"use client";

import { useMemo, useRef, useState } from "react";

function getHotspotStyle(hotspot) {
  const left = hotspot.x - hotspot.width / 2;
  const top = hotspot.y - hotspot.height / 2;

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`
  };
}

export default function ImageHotspotWalkthrough({ walkthrough }) {
  const [selectedId, setSelectedId] = useState(walkthrough.defaultHotspot);
  const panelRef = useRef(null);
  const narrativeOrder = walkthrough.narrativeOrder || walkthrough.hotspots.map((hotspot) => hotspot.id);
  const isNarrative = Boolean(walkthrough.narrative);
  const allConcepts = useMemo(() => {
    const referenceItems = (walkthrough.referenceSections || []).flatMap((section) =>
      section.items.map((item) => ({ ...item, referenceSectionTitle: section.title }))
    );

    return [...walkthrough.hotspots, ...referenceItems];
  }, [walkthrough]);

  const selectedHotspot = useMemo(() => {
    return (
      allConcepts.find((hotspot) => hotspot.id === selectedId) ||
      walkthrough.hotspots.find((hotspot) => hotspot.id === walkthrough.defaultHotspot) ||
      walkthrough.hotspots[0]
    );
  }, [allConcepts, selectedId, walkthrough]);

  const selectedNarrativeIndex = narrativeOrder.indexOf(selectedHotspot.id);
  const selectedIndex = Math.max(0, selectedNarrativeIndex);
  const isReferenceSelection = selectedNarrativeIndex === -1;

  function selectHotspot(id) {
    setSelectedId(id);

    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }

  function selectNextHotspot() {
    const nextIndex = isReferenceSelection ? 0 : (selectedIndex + 1) % narrativeOrder.length;
    selectHotspot(narrativeOrder[nextIndex]);
  }

  return (
    <main className={isNarrative ? "image-walkthrough-page image-walkthrough-page-narrative" : "image-walkthrough-page"}>
      <header className="image-walkthrough-hero">
        <p>{isNarrative ? "Guided Concept Journey" : "Guided Walkthrough"}</p>
        <h1>{walkthrough.title}</h1>
        <span>{walkthrough.subtitle}</span>
      </header>

      <article className="image-walkthrough-shell">
        <div className="image-walkthrough-watermark" aria-hidden="true" />
        <figure className="image-walkthrough-figure">
          <div className={isNarrative ? "image-walkthrough-image-wrap image-walkthrough-image-wrap-narrative" : "image-walkthrough-image-wrap"}>
            <img src={walkthrough.image} alt={walkthrough.imageAlt} />
            {walkthrough.hotspots.map((hotspot) => {
              const isActive = selectedHotspot.id === hotspot.id;
              const shapeClass = hotspot.shape === "circle" ? "image-hotspot-circle" : "image-hotspot-rect";
              const isNarrativeStep = narrativeOrder.includes(hotspot.id);

              return (
                <button
                  aria-label={hotspot.title}
                  aria-pressed={isActive}
                  className={[
                    "image-hotspot",
                    shapeClass,
                    isActive ? "image-hotspot-active" : "",
                    isNarrative ? "image-hotspot-narrative" : "",
                    isNarrative && !isActive ? "image-hotspot-muted" : "",
                    isNarrativeStep ? "image-hotspot-step" : ""
                  ].filter(Boolean).join(" ")}
                  key={hotspot.id}
                  onClick={() => selectHotspot(hotspot.id)}
                  style={getHotspotStyle(hotspot)}
                  type="button"
                >
                  <span>{hotspot.label}</span>
                </button>
              );
            })}
          </div>
        </figure>

        <section className="image-walkthrough-region-list" aria-label="Walkthrough regions">
          {walkthrough.hotspots.map((hotspot, index) => (
            <button
              className={selectedHotspot.id === hotspot.id ? "image-region-chip image-region-chip-active" : "image-region-chip"}
              key={hotspot.id}
              onClick={() => selectHotspot(hotspot.id)}
              type="button"
            >
              <span>{index + 1}</span>
              {hotspot.label}
            </button>
          ))}
        </section>

        {walkthrough.referenceSections?.length ? (
          <section className="image-walkthrough-reference-grid" aria-label="Clickable mechanism reference lists">
            {walkthrough.referenceSections.map((section) => (
              <div className="image-walkthrough-reference-section" key={section.title}>
                <h3>{section.title}</h3>
                <div>
                  {section.items.map((item) => (
                    <button
                      className={selectedHotspot.id === item.id ? "image-reference-chip image-reference-chip-active" : "image-reference-chip"}
                      key={item.id}
                      onClick={() => selectHotspot(item.id)}
                      type="button"
                    >
                      <span aria-hidden="true">i</span>
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <section className="image-walkthrough-panel" ref={panelRef} aria-live="polite">
          <p>
            {isNarrative
              ? `${selectedHotspot.phase || selectedHotspot.referenceSectionTitle ? `${selectedHotspot.phase || selectedHotspot.referenceSectionTitle} - ` : ""}${isReferenceSelection ? "Reference" : `Concept ${selectedIndex + 1} of ${narrativeOrder.length}`}`
              : "Selected region"}
          </p>
          <h2>{selectedHotspot.title}</h2>
          <span>{selectedHotspot.text}</span>
          {selectedHotspot.details?.length ? (
            <ul className="image-walkthrough-detail-list">
              {selectedHotspot.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
          {isNarrative ? (
            <div className="image-walkthrough-panel-actions">
              <button type="button" onClick={selectNextHotspot}>
                Next Concept
              </button>
            </div>
          ) : null}
          <small>{walkthrough.disclaimer}</small>
        </section>
      </article>
    </main>
  );
}
