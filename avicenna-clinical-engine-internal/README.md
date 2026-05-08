# Avicenna Clinical Engine Internal Reasoning Layer

This package turns `data/avicenna_engine_batch1.json` into a safety-first symbolic terrain engine.

It is not a symptom checker, diagnostic AI, or treatment recommender. It produces probabilistic terrain interpretations, contradiction checks, safety overrides, and safety-filtered intervention categories.

## Architecture

- `knowledge_base.py` loads the JSON and indexes patterns, diagnosis mappings, rules, five-element notes, and axis blocks.
- `scoring.py` computes weighted pattern and axis probabilities from diagnoses, symptoms, flags, observations, labs, and free text.
- `safety.py` evaluates hard override rules before interventions are surfaced.
- `contradictions.py` detects mixed thermal states and other terrain conflicts.
- `terrain.py` converts scores into system-state interpretation, compensatory loops, and dynamic transitions.
- `interventions.py` extracts herbs, devices, lifestyle, breathwork, movement, and related categories as terrain modulators, then blocks or cautions them through safety rules.
- `llm_hooks.py` defines the future extraction schema and response contract for a Claude/OpenAI reasoning layer.

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
