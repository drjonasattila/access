from __future__ import annotations

from collections import Counter
from typing import Any

from .knowledge_base import KnowledgeBase
from .models import Contradiction, EngineInput, PatternScore, TerrainInterpretation


PATTERN_AXIS_MAP = {
    "shaoyang_taiyin_dissonance": [
        "autonomic_sympathetic_brace",
        "digestive_resilience",
        "diaphragm_splanchnic_fascia",
        "thermal_misalignment",
    ],
    "shaoyin_taiyang_dissonance": [
        "sleep_regulation",
        "recovery_capacity",
        "posterior_fascial_tension",
        "heat_above_cold_below",
    ],
    "cold_pelvis_shaoyin_collapse": [
        "mitochondrial_downshift",
        "microcirculation",
        "lower_burner_fluid_stasis",
        "pelvic_fascia_autonomic_lock",
    ],
    "jueyin_depletion": [
        "deep_recovery_capacity",
        "connective_tissue_dryness",
        "emotional_stress_load",
        "sleep_dream_regulation",
    ],
    "damp_heat_pelvic": ["inflammatory_load", "pelvic_microcirculation", "fluid_organisation"],
    "qi_blood_stasis_joint": ["microcirculation", "joint_fascia_load", "pain_persistence"],
    "metabolic_cold_damp": ["mitochondrial_downshift", "fluid_organisation", "digestive_resilience"],
    "cancer_pain_composite": ["supportive_pain_modulation", "microcirculation", "safety_boundary"],
    "cluster_headache_TAC": ["autonomic_instability", "neurovascular_rhythm", "red_flag_screening"],
    "arthritis_joint_degenerative": ["joint_fascia_load", "inflammatory_load", "recovery_capacity"],
    "berberine_metabolic_protocol": ["metabolic_heat_damp", "digestive_resilience", "inflammatory_tone"],
}


DYNAMIC_RELATIONSHIPS = {
    "jueyin_depletion": "Jueyin depletion may cascade toward Taiyin depletion and then Shaoyin instability if recovery capacity keeps falling.",
    "cold_pelvis_shaoyin_collapse": "Cold lower terrain can recruit upper heat compensation through a vertical autonomic split.",
    "damp_heat_pelvic": "Damp-heat may be a flare layer superimposed on colder pelvic stagnation, so timing and inflammatory markers matter.",
    "shaoyang_taiyin_dissonance": "Shaoyang bracing may compensate for weak Taiyin anchoring and can amplify visceral autonomic arousal.",
    "metabolic_cold_damp": "Metabolic cold-damp may alternate with heat-damp phases when inflammatory load or glucose stress rises.",
}


def interpret_terrain(
    case: EngineInput,
    knowledge_base: KnowledgeBase,
    patterns: list[PatternScore],
    facts: dict[str, Any],
    contradictions: list[Contradiction],
) -> TerrainInterpretation:
    top_patterns = patterns[:4]
    dominant_states = []
    axis_counter: Counter[str] = Counter()
    transitions: list[str] = []
    loops: list[str] = []

    for score in top_patterns:
        dominant_states.append(
            {
                "pattern": score.name,
                "probability": score.probability,
                "confidence": score.confidence,
                "interpretation": _state_phrase(score),
                "field_model": score.field_model,
                "tcm_axis": score.tcm_axis,
            }
        )
        for axis in PATTERN_AXIS_MAP.get(score.name, []):
            axis_counter[axis] += max(1, int(score.confidence * 10))
        if score.name in DYNAMIC_RELATIONSHIPS:
            transitions.append(DYNAMIC_RELATIONSHIPS[score.name])

    if facts.get("upper_heat") and facts.get("lower_cold"):
        loops.append("Upper heat may be compensating for lower cold or depleted anchoring rather than representing isolated excess heat.")
    if facts.get("deficiency_pattern") and facts.get("heat_dominant_flag"):
        loops.append("Heat signs on a depleted background may represent compensatory activation with limited recovery reserve.")
    if facts.get("blood_stasis_flag") and facts.get("cold_dominant_flag"):
        loops.append("Cold terrain may slow microcirculation and reinforce stasis-type pain persistence.")

    axis_total = sum(axis_counter.values()) or 1
    axis_involvement = [
        {"axis": axis, "relative_weight": weight / axis_total}
        for axis, weight in axis_counter.most_common()
    ]

    summary = _summary(top_patterns, contradictions, facts)
    return TerrainInterpretation(
        dominant_states=dominant_states,
        axis_involvement=axis_involvement,
        compensatory_loops=loops,
        dynamic_transitions=transitions,
        educational_summary=summary,
    )


def _state_phrase(score: PatternScore) -> str:
    return (
        f"This may reflect a {score.name.replace('_', ' ')} terrain pattern with "
        f"{score.confidence:.0%} evidence confidence in the current symbolic model."
    )


def _summary(patterns: list[PatternScore], contradictions: list[Contradiction], facts: dict[str, Any]) -> str:
    if not patterns:
        return "The current case input does not contain enough structured evidence for a stable terrain interpretation."
    names = ", ".join(score.name.replace("_", " ") for score in patterns[:3])
    summary = f"The leading terrain signals are {names}. Treat these as overlapping physiological hypotheses, not diagnoses."
    if contradictions:
        summary += " Contradiction checks indicate that mixed-state reasoning is required."
    if facts.get("active_cancer"):
        summary += " Oncology-related content must remain supportive and adjunctive to conventional care."
    return summary

