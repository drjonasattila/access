from __future__ import annotations

from typing import Any

from .models import EngineInput, EngineResult


LLM_CASE_EXTRACTION_SCHEMA: dict[str, Any] = {
    "free_text": "original user/clinical narrative, if available",
    "diagnoses": ["conventional labels mentioned by patient or clinician"],
    "symptoms": ["normalized symptom tokens or short phrases"],
    "observations": {
        "thermal_sensation": "cold, heat, alternating, upper_heat_lower_cold, etc.",
        "moisture_state": "dry, damp, oedema, phlegm, normal",
        "energy_state": "fatigue, wired_tired, collapse, stable",
        "pain_quality": "fixed, burning, cramping, pressure, neuralgic",
        "pain_location": "pelvis, epigastrium, occiput, joints, etc.",
        "sleep_quality": "insomnia, fragmentation, early waking, restored",
        "response_to_heat": "better, worse, neutral, unknown",
        "response_to_cold": "better, worse, neutral, unknown",
        "tongue_coating": "white, yellow, greasy, peeled, unknown",
        "stasis_confidence": "low, medium, high",
    },
    "labs": {
        "CRP": "numeric or elevated/normal",
        "WBC": "numeric or elevated/normal",
        "culture": "positive/negative/unknown",
    },
    "flags": {
        "pregnancy_flag": "boolean",
        "frailty_flag": "boolean",
        "digestive_sensitivity_flag": "boolean",
        "active_cancer": "boolean",
        "acute_inflammatory_flare": "boolean",
        "yang_recovery_tempting": "boolean",
        "reassess_day_3_to_7": "boolean",
    },
}


LLM_OUTPUT_CONTRACT = {
    "must_not_claim": ["diagnosis", "cure", "disease treatment", "replacement for medical care"],
    "preferred_language": [
        "possible terrain pattern",
        "may reflect",
        "autonomic pattern",
        "supportive strategy",
        "integrative framework",
    ],
    "priority_order": [
        "safety",
        "pattern recognition",
        "contradiction detection",
        "terrain interpretation",
        "intervention categories",
        "education",
    ],
}


def coerce_llm_payload(payload: dict[str, Any]) -> EngineInput:
    """Convert an LLM extraction payload into the engine's case envelope."""
    return EngineInput.from_mapping(payload)


def build_llm_context(result: EngineResult) -> dict[str, Any]:
    """Machine-readable packet for a future narrative reasoning layer."""
    return {
        "contract": LLM_OUTPUT_CONTRACT,
        "safety": {
            "active_rules": [hit.condition for hit in result.safety.active_rules],
            "exclusions": result.safety.exclusions,
            "avoid_categories": result.safety.avoid_categories,
            "required_framing": result.safety.required_framing,
            "cautions": result.safety.cautions,
        },
        "dominant_patterns": [
            {
                "name": score.name,
                "probability": score.probability,
                "confidence": score.confidence,
                "supporting_evidence": [evidence.value for evidence in score.evidence[:4]],
            }
            for score in result.patterns[:5]
        ],
        "contradictions": [
            {
                "kind": contradiction.kind,
                "severity": contradiction.severity,
                "explanation": contradiction.explanation,
            }
            for contradiction in result.contradictions
        ],
        "terrain": {
            "dominant_states": result.terrain.dominant_states,
            "axis_involvement": result.terrain.axis_involvement,
            "compensatory_loops": result.terrain.compensatory_loops,
            "dynamic_transitions": result.terrain.dynamic_transitions,
        },
        "intervention_categories": [
            {
                "pattern": candidate.pattern,
                "category": candidate.category,
                "name": candidate.name,
                "role": candidate.role,
                "status": candidate.status,
                "safety_reason": candidate.safety_reason,
            }
            for candidate in result.interventions[:20]
        ],
    }

