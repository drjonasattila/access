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
