from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import (
    EngineInput,
    FascialChainAssessment,
    InterfaceFeedback,
    PatternScore,
    SurfaceInterfacePlan,
    SurfaceSequenceStep,
    TimingRule,
)
from .utils import normalize_term, text_contains_any, unique_preserve


SURFACE_PATTERNS = {
    "endothel_surface_stagnation": "surface_endothelial",
    "dampness_ECM_overload": "ecm_dampness",
    "functional_exhaustion_neurofascial": "neurofascial_exhaustion",
    "lateral_kinetic_chain_overload": "lateral_kinetic_chain",
    "medial_chain_collapse": "medial_chain",
    "inferior_gate_congestion": "inferior_gate",
    "anterior_posterior_phase_lock": "anterior_posterior_lock",
    "proton_gradient_instability_post_viral": "post_viral_surface_redox",
}


SUCCESS_METRICS = [
    "temperature_normalisation",
    "reduced_morning_stiffness",
    "less_heaviness",
    "better_exercise_tolerance",
    "reduced_pain_echo_after_treatment",
    "less_brain_fog",
    "better_sleep",
    "improved_recovery_speed",
]


class SurfaceInterfaceEngine:
    """Surface-interface sequencing layer.

    It models ordering and feedback, not treatment recommendations or detox
    protocols. Device handling stays functional and brand-agnostic.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def evaluate(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> SurfaceInterfacePlan:
        surface_scores = [score for score in patterns if score.name in SURFACE_PATTERNS]
        active = bool(surface_scores or self._surface_input_present(case, facts))
        if not active:
            return SurfaceInterfacePlan()

        dominant = self._dominant_interface(surface_scores, facts)
        sequence = self._sequence(dominant, facts)
        timing = self._timing_rules(facts)
        feedback = self._feedback(facts)
        chains = self._fascial_chains(surface_scores, case, facts)
        compatibility = self._compatibility_cautions(facts)
        cautions = self._cautions(dominant, facts)

        return SurfaceInterfacePlan(
            active=True,
            dominant_interface=dominant,
            sequence=sequence,
            timing_rules=timing,
            feedback=feedback,
            fascial_chain=chains,
            device_strategy=[
                "low_intensity_wide_field_interface_quieting",
                "abdomen_paraspinal_sacral_zones",
                "fascial_chain_phase_realignment",
                "not_activation_or_aggressive_stimulation",
                "device_capability_mapping_to_be_added_later",
            ],
            compatibility_cautions=compatibility,
            success_metrics=list(SUCCESS_METRICS),
            frontend_language={
                "preferred": ["tissue holding tension", "network overload", "slow recovery terrain", "support regulation"],
                "avoid": ["detox", "cure", "blood thinning guarantee", "tumour treatment", "stimulant framing"],
            },
            cautions=cautions,
        )

    def _surface_input_present(self, case: EngineInput, facts: dict[str, Any]) -> bool:
        text = case.all_text()
        return any(
            [
                facts.get("endothelial_stagnation_pattern_confirmed"),
                facts.get("ecm_dampness_logic"),
                facts.get("lateral_kinetic_chain_pattern_confirmed"),
                text_contains_any(text, ["fucoidan", "surface stagnation", "microclot", "lateral kinetic chain", "pain echoes"]),
            ]
        )

    def _dominant_interface(self, scores: list[PatternScore], facts: dict[str, Any]) -> str:
        if scores:
            return SURFACE_PATTERNS.get(scores[0].name, "surface_interface")
        if facts.get("endothelial_stagnation_pattern_confirmed"):
            return "surface_endothelial"
        if facts.get("ecm_dampness_logic"):
            return "ecm_dampness"
        if facts.get("lateral_kinetic_chain_pattern_confirmed"):
            return "lateral_kinetic_chain"
        return "surface_interface"

    def _sequence(self, dominant: str, facts: dict[str, Any]) -> list[SurfaceSequenceStep]:
        if dominant in {"surface_endothelial", "post_viral_surface_redox"}:
            steps = [
                (1, "surface_regulation", "Prepare endothelial and fascia-surface interface before stronger moving."),
                (2, "interface_hydration", "Support Yin/surface hydration and reduce surface resistance."),
                (3, "immune_or_redox_clarification", "Clarify immune/redox signalling without overstimulation."),
                (4, "microcirculation_moving", "Only then consider blood/microcirculation moving if fixed stasis remains."),
            ]
        elif dominant == "ecm_dampness":
            steps = [
                (1, "fiber_terrain_support", "Stabilize gut-ECM interface and reduce sticky recovery terrain."),
                (2, "autophagy_or_immune_modulation", "Introduce autophagy/immune modulation only after interface stability."),
                (3, "targeted_pain_protocol", "Target pain layer last after gut-noise and ECM load improve."),
            ]
        elif dominant == "neurofascial_exhaustion":
            steps = [
                (1, "sleep_neurofascial_calming", "Prioritize sleep, Magnesium-type calming, and collagen/interface support."),
                (2, "recovery_capacity_building", "Build resilience before surface or vascular moving strategies."),
                (3, "surface_support_only_if_markers_emerge", "Fucoidan-like surface support is optional only if endothelial collapse appears."),
            ]
        else:
            steps = [
                (1, "full_chain_assessment", "Assess the whole fascial chain, not only the local pain site."),
                (2, "interface_quieting", "Use low-intensity phase realignment rather than stimulation."),
                (3, "targeted_chain_modulation", "Target chain-specific load only after interface quieting."),
            ]
        return [
            SurfaceSequenceStep(order=order, name=name, goal=goal, rationale="Surface first, then build.")
            for order, name, goal in steps
        ]

    def _timing_rules(self, facts: dict[str, Any]) -> list[TimingRule]:
        rules = [
            TimingRule("Fucoidan", "morning_or_early_afternoon_only", "Avoid evening dosing if heaviness occurs."),
            TimingRule("Fucoidan + ProImmuno", "separate_by_30_to_60_minutes", "Fucoidan first, then ProImmuno."),
            TimingRule("Fucoidan + Dan Shen", "fucoidan_before_dan_shen", "Surface regulation precedes blood moving."),
            TimingRule("Fiber + autophagy protocol", "fiber_before_autophagy", "Gut-interface stability precedes autophagy induction."),
        ]
        if facts.get("fucoidan_dosing_evening"):
            rules.append(TimingRule("Fucoidan", "evening_dosing_flagged", "Heaviness may indicate excess Yin/surface load."))
        return rules

    def _feedback(self, facts: dict[str, Any]) -> list[InterfaceFeedback]:
        feedback = []
        if facts.get("fucoidan_heaviness"):
            feedback.append(
                InterfaceFeedback("Fucoidan causes heaviness", "Possible excess Yin/surface load.", "reduce_or_move_dosing_earlier")
            )
        if facts.get("dan_shen_worsens_stabbing_pain"):
            feedback.append(
                InterfaceFeedback("Dan Shen worsens stabbing pain", "Blood moving may have been introduced before surface preparation.", "return_to_surface_regulation")
            )
        if facts.get("fatigue_worsens"):
            feedback.append(
                InterfaceFeedback("Fatigue worsens", "Stack may be too stimulating or immune modulation may be too strong.", "reduce_stimulating_stack_and_reassess_sleep")
            )
        if facts.get("fiber_causes_collapse"):
            feedback.append(
                InterfaceFeedback("Fiber causes collapse", "Interface holding may be insufficient during drying/release.", "add_astragalus_type_stabilisation_or_slow_titration")
            )
        if facts.get("pain_returns_after_treatment"):
            feedback.append(
                InterfaceFeedback("Pain improves then returns", "ECM/gut interface may not have released.", "add_fiber_terrain_support_before_escalation")
            )
        return feedback

    def _fascial_chains(
        self,
        scores: list[PatternScore],
        case: EngineInput,
        facts: dict[str, Any],
    ) -> list[FascialChainAssessment]:
        text = case.all_text()
        active = facts.get("lateral_kinetic_chain_pattern_confirmed") or any(
            score.name == "lateral_kinetic_chain_overload" for score in scores
        )
        if not active and not text_contains_any(text, ["lateral hip", "gb20", "temporal headache", "vestibular tension"]):
            return []
        return [
            FascialChainAssessment(
                chain="lateral_kinetic_chain",
                active=True,
                regions_to_evaluate=[
                    "lateral_hip",
                    "GB20_GB21_neck_region",
                    "ribs_intercostal_compression",
                    "lateral_knee",
                    "ankle_instability",
                    "temporal_headache",
                    "vestibular_tension",
                ],
                neutral_language="lateral kinetic chain",
            )
        ]

    def _compatibility_cautions(self, facts: dict[str, Any]) -> list[str]:
        cautions = []
        if facts.get("fucoidan_with_anticoagulants"):
            cautions.append("Fucoidan with anticoagulants requires clinician review and careful monitoring; do not replace prescribed medication.")
        if facts.get("fucoidan_with_nsaids_or_steroids"):
            cautions.append("Fucoidan with NSAIDs/steroids should be framed as cautious adjunctive support; monitor carefully.")
        if facts.get("fucoidan_with_metformin_or_insulin"):
            cautions.append("Fucoidan with metformin/insulin requires glucose monitoring and clinician review.")
        return cautions

    def _cautions(self, dominant: str, facts: dict[str, Any]) -> list[str]:
        cautions = [
            "not_a_supplement_sales_engine",
            "avoid_detox_language",
            "device_agnostic_functional_modulation_only",
        ]
        if dominant == "surface_endothelial":
            cautions.append("dan_shen_not_first_line_in_rigid_endothelial_surface_state")
        if dominant == "neurofascial_exhaustion":
            cautions.append("do_not_confuse_functional_exhaustion_with_surface_stagnation")
        if facts.get("fucoidan_with_anticoagulants"):
            cautions.append("not_known_as_direct_inr_raising_but_monitor_carefully")
        return unique_preserve(cautions)

