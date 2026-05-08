# Avicenna Clinical Engine Internal Reasoning Layer

This package turns the `data/avicenna_engine_batch*.json` files into a safety-first symbolic terrain engine.

It is not a symptom checker, diagnostic AI, or treatment recommender. It produces probabilistic terrain interpretations, contradiction checks, safety overrides, and safety-filtered intervention categories.

## Architecture

- `knowledge_base.py` loads the JSON and indexes patterns, diagnosis mappings, rules, five-element notes, and axis blocks.
- `scoring.py` computes weighted pattern and axis probabilities from diagnoses, symptoms, flags, observations, labs, and free text.
- `safety.py` evaluates hard override rules before interventions are surfaced.
- `graph.py` treats Five Element structures as directional systems graphs, with generating, controlling, and destroying-cycle edges.
- `transitions.py` models temporal progression, root layers, compensation layers, and restoration sequencing.
- `onboarding.py` keeps beginner metabolic rhythm pathways separate from advanced terrain reconstruction.
- `stabilization.py` sequences intervention layers, bridge tools, medication-transition support, relapse loops, and dangerous-molecule safety redirects.
- `spinal.py` adds spinal segment, Du-Ren, fascia-organ, degenerative staging, movement, and PBM targeting overlays with red-flag-first safety.
- `surface.py` adds surface-interface sequencing for endothelial, ECM, gut-nerve, fascial-chain, and post-viral instability states.
- `contradictions.py` detects mixed thermal states and other terrain conflicts.
- `terrain.py` converts scores into system-state interpretation, compensatory loops, and dynamic transitions.
- `interventions.py` extracts herbs, devices, lifestyle, breathwork, movement, and related categories as terrain modulators, then blocks or cautions them through safety rules.
- `llm_hooks.py` defines the future extraction schema and response contract for a Claude/OpenAI reasoning layer.
- `visualization.py` exposes UI architecture separately from clinical reasoning.

## Quick Start

```bash
python3 examples/run_case.py
```

Use the engine directly:

```python
from avicenna_engine import AvicennaClinicalEngine

engine = AvicennaClinicalEngine.from_json()
result = engine.evaluate({
    "diagnoses": ["Chronic Pelvic Pain"],
    "symptoms": ["cold pelvis", "worse cold better heat", "palpitations"],
    "flags": {"pregnancy_flag": True},
})

print(result.to_dict()["safety"])
```

## Safety Posture

The hard safety layer can exclude herbs, turn modulation categories off, require specialist review, force oncology-adjunctive framing, and flag contradictions such as upper heat with lower cold.

All downstream layers receive the safety decision. The intervention layer keeps blocked candidates visible as `blocked_by_safety` so the reasoning trace remains auditable.

## Batch 2 Systems Expansion

Batch 2 adds systems architecture rather than only new clinical markers:

- Five Element graph reasoning for upstream/downstream and cascade logic
- cold-heat temporal sequencing, including lower-root restoration before upper-heat clearing
- metabolic rhythm onboarding as a lower-risk entry protocol
- state transitions and restoration stages
- UI visualization payloads kept outside clinical scoring

## Batch 3 Stabilization Expansion

Batch 3 adds intervention sequencing without turning the engine into a treatment recommender:

- suppression-versus-resolution distinction
- tissue-before-nerve phase blocking
- gut-first orchestration before advanced modulation
- TENS and laser modeled as bridge/coherence tools, not primary solutions
- medication transition support with no abrupt-discontinuation logic
- relapse-loop interpretation such as TENS relief only while active
- dangerous molecules handled as educational-only redirects, never recommendations
- success metrics focused on sleep, emotional regulation, digestive flow, resilience, flare frequency, pacing tolerance, and reduced medication dependence

## Batch 4 Spinal Segment Expansion

Batch 4 adds a spinal reasoning overlay:

- facet pain interpreted as possible Du Mai / Shaoyang / sympathetic segmental overload, not purely mechanical
- strict degenerative staging from early Yang overload to late structural compression
- segmental organ resonance map for C5-T2, T4-T6, T7-T10, and L1-L3
- Du Mai posterior Yang conduction and Ren Mai anterior Yin containment logic
- anterior-chain restoration when Ren collapse contributes to posterior spinal overload
- PBM targeting overlays for Huatuojiaji, BL line, GB line, affected segment, and organ resonance zones
- spinal red flags override all symbolic reasoning and require referral/escalation framing

## Batch 5 Surface-Interface Expansion

Batch 5 adds ordered surface/interface logic:

- endothelial surface stagnation is sequenced as surface regulation before stronger microcirculation moving
- ECM dampness is modeled as tissue/network overload and slow recovery medium, not mucus or detox
- gut-ECM-nerve patterns prioritize Fiber/terrain support before autophagy or targeted pain protocols
- Fucoidan is framed cautiously as a surface/interface regulator, never as anticoagulation, tumour treatment, stimulant, or replacement medication
- timing rules cover Fucoidan morning/early afternoon, Fucoidan before ProImmuno, Fucoidan before Dan Shen, and Fiber before autophagy
- contradiction feedback interprets heaviness, stabbing-pain worsening, fatigue worsening, or Fiber collapse as state information
- lateral kinetic chain logic evaluates the full chain instead of the local pain site only
- device guidance remains brand-agnostic and low-intensity, with capability mapping reserved for a later layer
