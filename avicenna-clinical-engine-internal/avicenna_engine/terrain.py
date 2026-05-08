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
    "metabolic_rhythm_disruption": [
        "circadian_regulation",
        "mitochondrial_energy_state",
        "autonomic_balance",
        "digestive_resilience",
        "onboarding_program",
    ],
    "cold_heat_complex": ["thermal_regulation", "vertical_autonomic_dissociation", "lower_root_collapse", "compensatory_heat"],
    "yin_field_laxity_coxa_saltans": ["connective_tissue_laxity", "hip_fascia_stability", "sleep_regulation"],
    "pelvic_yang_compression": ["pelvic_fascia_compression", "emotional_holding", "microcirculation", "mitochondrial_rhythm"],
    "five_element_destroying_cycle": ["graph_pathology", "cascade_prediction", "root_node_prioritization"],
    "fascia_ecm_dominant": ["fascia_ecm_load", "microcirculation", "tissue_holding", "pain_noise"],
    "nerve_dominant": ["neural_overfiring", "autonomic_instability", "signal_filtering"],
    "mixed_transitional": ["tissue_nerve_transition", "relapse_loop", "sequencing_required"],
    "gut_relapse_driver": ["digestive_flow", "gut_ecm_axis", "flare_recurrence"],
    "mitochondrial_decoherence": ["mitochondrial_energy_state", "recovery_capacity", "coherence_model"],
    "dampness_biofilm": ["digestive_flow", "metabolite_accumulation", "gut_first_sequence"],
    "du_mai_yang_overload": ["posterior_yang_conduction", "facet_microcirculation", "sympathetic_tone", "shaoyang_torque"],
    "du_ren_collapse": ["anterior_chain_containment", "posterior_compensation", "abdominal_fascia_tone"],
    "yin_structure_calcification": ["late_structural_stage", "calcification", "stenosis_risk", "supportive_only_boundary"],
    "kidney_yin_jing_deficiency": ["fascia_scaffold", "collagen_ez_water_lattice", "repair_capacity"],
    "liver_qi_fascia_tension": ["fascial_electrotension", "stress_load", "segmental_tension"],
    "sympathetic_overdrive_spinal": ["sympathetic_chain", "du_mai_supercharge", "paraspinal_fascia"],
    "endothel_surface_stagnation": [
        "endothelial_surface",
        "microvascular_adhesion",
        "interface_hydration",
        "surface_before_moving",
    ],
    "dampness_ECM_overload": [
        "ecm_dampness",
        "gut_ecm_nerve_axis",
        "slow_recovery_medium",
        "clearance_interface",
    ],
    "functional_exhaustion_neurofascial": [
        "neurofascial_exhaustion",
        "sleep_regulation",
        "recovery_capacity",
        "nonvascular_diffuse_pain",
    ],
    "lateral_kinetic_chain_overload": [
        "lateral_kinetic_chain",
        "fascia_chain_load",
        "vestibular_temporal_tension",
        "microcirculation_chain",
    ],
    "medial_chain_collapse": ["medial_kinetic_chain", "arch_pelvis_support", "fatigue_load"],
    "inferior_gate_congestion": ["inferior_gate", "plantar_fascia", "grounding_sensation"],
    "anterior_posterior_phase_lock": ["ren_du_phase_lock", "core_torsion", "emotional_armoring"],
    "proton_gradient_instability_post_viral": [
        "post_viral_surface_instability",
        "redox_regulation",
        "endothelial_surface",
        "autonomic_sleep_support",
    ],
}


DYNAMIC_RELATIONSHIPS = {
    "jueyin_depletion": "Jueyin depletion may cascade toward Taiyin depletion and then Shaoyin instability if recovery capacity keeps falling.",
    "cold_pelvis_shaoyin_collapse": "Cold lower terrain can recruit upper heat compensation through a vertical autonomic split.",
    "damp_heat_pelvic": "Damp-heat may be a flare layer superimposed on colder pelvic stagnation, so timing and inflammatory markers matter.",
    "shaoyang_taiyin_dissonance": "Shaoyang bracing may compensate for weak Taiyin anchoring and can amplify visceral autonomic arousal.",
    "metabolic_cold_damp": "Metabolic cold-damp may alternate with heat-damp phases when inflammatory load or glucose stress rises.",
    "metabolic_rhythm_disruption": "Metabolic rhythm disruption is best treated as an onboarding terrain state where sleep and circadian restoration precede weight or lab normalization.",
    "cold_heat_complex": "Cold-heat complex progresses from lower collapse to upper heat compensation and later mixed stagnation; lower-root restoration should come first.",
    "pelvic_yang_compression": "Pelvic Yang compression can evolve from emotional guarding into autonomic compression, fascial dehydration, stasis, and structural overgrowth.",
    "five_element_destroying_cycle": "Destroying-cycle activation implies graph spread; root-node stabilization should precede treating every node manifestation.",
    "fascia_ecm_dominant": "Fascia/ECM dominance suggests tissue unloading should precede nerve-suppressive escalation.",
    "nerve_dominant": "Nerve dominance may need neural noise reduction, but only after tissue and gut load are not the primary drivers.",
    "mixed_transitional": "Mixed transitional states require staged sequencing rather than simultaneous tissue and nerve modulation.",
    "gut_relapse_driver": "Gut-linked relapse implies digestive flow may be a system-level coherence gate before advanced modulation.",
    "mitochondrial_decoherence": "Mitochondrial decoherence is treated as an exploratory coherence-oriented model, not established mainstream biochemistry.",
    "dampness_biofilm": "Dampness/biofilm patterns follow gut to energy to nervous-system sequencing before targeted intervention.",
    "du_mai_yang_overload": "Early facet-type pain may represent posterior Yang conduction overload and Shaoyang torque congestion rather than purely local mechanics.",
    "du_ren_collapse": "Du-Ren collapse suggests posterior spinal load may be compensating for reduced anterior-chain containment.",
    "yin_structure_calcification": "Late Yin structural calcification is supportive-only terrain; red flags and Western referral boundaries become primary.",
    "kidney_yin_jing_deficiency": "Kidney Yin/Jing deficiency is used internally as a fascia scaffold and recovery-capacity model.",
    "liver_qi_fascia_tension": "Liver Qi fascia tension may reflect stress-amplified fascial electrotension, especially when Yin buffering is low.",
    "sympathetic_overdrive_spinal": "Sympathetic overdrive may act as a Du Mai supercharger, increasing paraspinal tone and segmental turbulence.",
    "endothel_surface_stagnation": "Endothelial surface stagnation follows surface-first sequencing; microcirculation moving is deferred until the interface feels less rigid.",
    "dampness_ECM_overload": "ECM dampness is interpreted as tissue/network overload and slow recovery medium; gut-interface support should precede autophagy or targeted pain protocols.",
    "functional_exhaustion_neurofascial": "Functional neurofascial exhaustion may resemble surface stagnation, but without vascular surface signs it prioritizes sleep, Magnesium-type calming, and connective-tissue recovery.",
    "lateral_kinetic_chain_overload": "Lateral kinetic chain overload should be read as a whole-chain pattern rather than only a local pain site.",
    "medial_chain_collapse": "Medial chain collapse may reflect foot-arch, knee, pelvic, and fatigue load interacting as a support-chain state.",
    "inferior_gate_congestion": "Inferior gate congestion may connect plantar fascia symptoms with loss of grounding sensation and upward compensatory pull.",
    "anterior_posterior_phase_lock": "Anterior-posterior phase lock suggests Ren-Du or front-back fascial conflict, often requiring interface quieting before targeted shoulder or core work.",
    "proton_gradient_instability_post_viral": "Post-viral proton-gradient instability is handled as an exploratory redox/surface-autonomic model with surface regulation before immune clarification and evening sleep support.",
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
