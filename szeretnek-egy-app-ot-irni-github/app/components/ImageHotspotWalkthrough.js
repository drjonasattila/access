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

  const selectedHotspot = useMemo(() => {
    return (
      walkthrough.hotspots.find((hotspot) => hotspot.id === selectedId) ||
      walkthrough.hotspots.find((hotspot) => hotspot.id === walkthrough.defaultHotspot) ||
      walkthrough.hotspots[0]
    );
  }, [selectedId, walkthrough]);

  function selectHotspot(id) {
    setSelectedId(id);

    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }

  return (
    <main className="image-walkthrough-page">
      <header className="image-walkthrough-hero">
        <p>Guided Walkthrough</p>
        <h1>{walkthrough.title}</h1>
        <span>{walkthrough.subtitle}</span>
      </header>

      <article className="image-walkthrough-shell">
        <figure className="image-walkthrough-figure">
          <div className="image-walkthrough-image-wrap">
            <img src={walkthrough.image} alt={walkthrough.imageAlt} />
            {walkthrough.hotspots.map((hotspot) => {
              const isActive = selectedHotspot.id === hotspot.id;
              const shapeClass = hotspot.shape === "circle" ? "image-hotspot-circle" : "image-hotspot-rect";

              return (
                <button
                  aria-label={hotspot.title}
                  aria-pressed={isActive}
                  className={[
                    "image-hotspot",
                    shapeClass,
                    isActive ? "image-hotspot-active" : ""
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
          <p>Selected region</p>
          <h2>{selectedHotspot.title}</h2>
          <span>{selectedHotspot.text}</span>
          <small>{walkthrough.disclaimer}</small>
        </section>
      </article>
    </main>
  );
}
