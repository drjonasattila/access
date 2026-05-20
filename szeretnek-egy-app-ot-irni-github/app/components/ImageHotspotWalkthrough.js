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

  const selectedHotspot = useMemo(() => {
    return (
      walkthrough.hotspots.find((hotspot) => hotspot.id === selectedId) ||
      walkthrough.hotspots.find((hotspot) => hotspot.id === walkthrough.defaultHotspot) ||
      walkthrough.hotspots[0]
    );
  }, [selectedId, walkthrough]);

  const selectedIndex = Math.max(0, narrativeOrder.indexOf(selectedHotspot.id));

  function selectHotspot(id) {
    setSelectedId(id);

    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }

  function selectNextHotspot() {
    const nextIndex = (selectedIndex + 1) % narrativeOrder.length;
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

        <section className="image-walkthrough-panel" ref={panelRef} aria-live="polite">
          <p>
            {isNarrative ? `Concept ${selectedIndex + 1} of ${narrativeOrder.length}` : "Selected region"}
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
