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
        "spinal_level": "C5_T2, T4_T6, T7_T10, L1_L3, or specific level",
        "organ_resonance": "lung, heart_pericardium, liver_gallbladder, kidney, or unknown",
        "degenerative_stage": "early, intermediate, late, end_stage, or unknown",
        "ren_mai_tone": "low, normal, unknown",
        "movement_effect_on_pain": "extension_worse, rotation_helpful, warmth_helpful, unknown",
        "surface_signs": "microclot feeling, cold extremities, Raynaud-like episodes, heavy legs, or absent",
        "gut_ecm_signs": "bloating, post-meal pain, heaviness, pain returns after treatment, slow recovery",
        "fascial_chain": "lateral_kinetic_chain, medial_chain, inferior_gate, anterior_posterior_lock, or unknown",
        "supplement_timing": "Fucoidan morning/afternoon/evening, ProImmuno timing, Fiber/autophagy sequence, if mentioned",
        "protocol_feedback": "heaviness, stabbing pain worse, fatigue worse, fiber collapse, pain echo, or none",
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
        "age_40_plus_flag": "boolean",
        "central_weight_gain": "boolean",
        "circadian_drift_flag": "boolean",
        "sleep_fragmentation_flag": "boolean",
        "stress_dominance_flag": "boolean",
        "cold_lower_body_flag": "boolean",
        "heat_upper_body_flag": "boolean",
        "five_element_node_FIRE_pathology": "boolean",
        "crps_type": "CRPS_I, CRPS_II, mixed, or unknown",
        "dominant_layer": "fascia_ecm, nerve, mitochondrial, gut_relapse, mixed",
        "current_medications": ["opioid, ketamine, gabapentin, pregabalin, NSAID, steroid, etc."],
        "tens_response": "helps_only_while_on, durable_relief, worsens, unknown",
        "medication_exit_trigger_count": "integer count of medication-transition warning signals",
        "red_flag_present": "boolean; spinal and urgent medical red flags must be preserved",
        "pbm_available": "boolean",
        "post_viral": "boolean",
        "microvascular_surface_signs": "boolean",
        "autophagy_protocol_planned": "boolean",
        "fucoidan_dosing_evening": "boolean",
        "anticoagulant_or_antiplatelet_use": "boolean",
        "metformin_or_insulin_use": "boolean",
        "avoid_detox_framing": "boolean",
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
        "graph": {
            "active_nodes": [
                {
                    "node": node.node,
                    "activation": node.activation,
                    "evidence": node.evidence,
                    "clinical_correlates": node.clinical_correlates,
                }
                for node in result.graph.active_nodes
            ],
            "root_nodes": result.graph.root_nodes,
            "upstream_nodes": result.graph.upstream_nodes,
            "downstream_nodes": result.graph.downstream_nodes,
            "cascade_predictions": result.graph.cascade_predictions,
            "pathological_cycles": result.graph.pathological_cycles,
        },
        "state_transitions": [
            {
                "pattern": transition.pattern,
                "stage": transition.stage,
                "sequence_index": transition.sequence_index,
                "description": transition.description,
                "intervention_posture": transition.intervention_posture,
            }
            for transition in result.state_transitions
        ],
        "restoration": {
            "root_layers": result.restoration.root_layers,
            "compensation_layers": result.restoration.compensation_layers,
            "secondary_layers": result.restoration.secondary_layers,
            "ordered_steps": result.restoration.ordered_steps,
            "avoid_first": result.restoration.avoid_first,
            "success_metrics": result.restoration.success_metrics,
        },
        "stabilization": {
            "dominant_layers": [
                {
                    "name": layer.name,
                    "weight": layer.weight,
                    "role": layer.role,
                    "evidence": layer.evidence,
                }
                for layer in result.stabilization.dominant_layers
            ],
            "phases": [
                {
                    "order": phase.order,
                    "name": phase.name,
                    "goal": phase.goal,
                    "rationale": phase.rationale,
                    "status": phase.status,
                    "blocked_by": phase.blocked_by,
                }
                for phase in result.stabilization.phases
            ],
            "bridge_tools": [
                {
                    "name": tool.name,
                    "role": tool.role,
                    "limits": tool.limits,
                    "monitoring": tool.monitoring,
                    "status": tool.status,
                }
                for tool in result.stabilization.bridge_tools
            ],
            "medication_transitions": [
                {
                    "medication": transition.medication,
                    "stance": transition.stance,
                    "trigger": transition.trigger,
                    "pathway": transition.pathway,
                    "safety_alerts": transition.safety_alerts,
                    "status": transition.status,
                }
                for transition in result.stabilization.medication_transitions
            ],
            "relapse_loops": [
                {
                    "signal": loop.signal,
                    "interpretation": loop.interpretation,
                    "recommended_posture": loop.recommended_posture,
                    "evidence": loop.evidence,
                }
                for loop in result.stabilization.relapse_loops
            ],
            "dangerous_molecule_alerts": [
                {
                    "molecule": alert.molecule,
                    "unmet_need": alert.unmet_need,
                    "risk": alert.risk,
                    "safer_redirects": alert.safer_redirects,
                    "status": alert.status,
                }
                for alert in result.stabilization.dangerous_molecule_alerts
            ],
            "success_metrics": result.stabilization.success_metrics,
            "suppression_warnings": result.stabilization.suppression_warnings,
            "conceptual_cautions": result.stabilization.conceptual_cautions,
        },
        "spinal": {
            "active": result.spinal.active,
            "red_flags": result.spinal.red_flags,
            "referral_required": result.spinal.referral_required,
            "probable_patterns": result.spinal.probable_patterns,
            "degenerative_stage": (
                {
                    "stage": result.spinal.degenerative_stage.stage,
                    "pattern": result.spinal.degenerative_stage.pattern,
                    "tissue": result.spinal.degenerative_stage.tissue,
                    "interpretation": result.spinal.degenerative_stage.interpretation,
                    "action": result.spinal.degenerative_stage.action,
                    "confidence": result.spinal.degenerative_stage.confidence,
                }
                if result.spinal.degenerative_stage
                else None
            ),
            "segmental_resonance": [
                {
                    "level": item.level,
                    "organ": item.organ,
                    "emotional_load": item.emotional_load,
                    "facet_symptom": item.facet_symptom,
                    "confidence": item.confidence,
                    "evidence": item.evidence,
                }
                for item in result.spinal.segmental_resonance
            ],
            "du_ren_balance": (
                {
                    "du_mai_state": result.spinal.du_ren_balance.du_mai_state,
                    "ren_mai_state": result.spinal.du_ren_balance.ren_mai_state,
                    "interpretation": result.spinal.du_ren_balance.interpretation,
                    "anterior_chain_priority": result.spinal.du_ren_balance.anterior_chain_priority,
                }
                if result.spinal.du_ren_balance
                else None
            ),
            "movement_guidance": result.spinal.movement_guidance,
            "pbm_targets": result.spinal.pbm_targets,
            "cautions": result.spinal.cautions,
            "educational_framing": result.spinal.educational_framing,
        },
        "surface_interface": {
            "active": result.surface.active,
            "dominant_interface": result.surface.dominant_interface,
            "sequence": [
                {
                    "order": step.order,
                    "name": step.name,
                    "goal": step.goal,
                    "rationale": step.rationale,
                    "status": step.status,
                }
                for step in result.surface.sequence
            ],
            "timing_rules": [
                {
                    "item": rule.item,
                    "rule": rule.rule,
                    "rationale": rule.rationale,
                }
                for rule in result.surface.timing_rules
            ],
            "feedback": [
                {
                    "signal": item.signal,
                    "interpretation": item.interpretation,
                    "adjustment": item.adjustment,
                    "severity": item.severity,
                }
                for item in result.surface.feedback
            ],
            "fascial_chain": [
                {
                    "chain": item.chain,
                    "active": item.active,
                    "regions_to_evaluate": item.regions_to_evaluate,
                    "neutral_language": item.neutral_language,
                }
                for item in result.surface.fascial_chain
            ],
            "device_strategy": result.surface.device_strategy,
            "compatibility_cautions": result.surface.compatibility_cautions,
            "success_metrics": result.surface.success_metrics,
            "frontend_language": result.surface.frontend_language,
            "cautions": result.surface.cautions,
        },
        "onboarding": [
            {
                "name": path.name,
                "level": path.level,
                "eligible": path.eligible,
                "reasons": path.reasons,
                "exclusions": path.exclusions,
                "primary_metrics": path.primary_metrics,
            }
            for path in result.onboarding
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
