from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import EngineInput, GraphAnalysis, PatternScore, RestorationPlan, StateTransition
from .utils import match_strength, normalize_term, unique_preserve


ROOT_LAYER_MARKERS = {"lower_dantian_freeze", "cold_pelvis_shaoyin_collapse", "jueyin_depletion"}
COMPENSATION_MARKERS = {"compensatory_upper_heat", "shaoyang_taiyin_dissonance", "upper_heat"}
SECONDARY_MARKERS = {"mixed_stagnant_heat", "damp_heat_pelvic", "blood_stasis", "stagnant_damp_heat"}


class StateTransitionEngine:
    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def transitions(self, case: EngineInput, patterns: list[PatternScore]) -> list[StateTransition]:
        terms = case.all_terms()
        out: list[StateTransition] = []
        for score in patterns[:6]:
            pattern = self.kb.pattern(score.name)
            for stage in pattern.get("progression_stages", []) or []:
                evidence = _stage_evidence(stage, terms)
                out.append(
                    StateTransition(
                        pattern=score.name,
                        stage=str(stage.get("name") or stage.get("stage")),
                        sequence_index=int(stage.get("stage") or len(out) + 1),
                        description=str(stage.get("description") or stage.get("western") or ""),
                        evidence=evidence,
                        intervention_posture=_posture_for_stage(str(stage.get("name") or "")),
                    )
                )
            if pattern.get("depletion_sequence"):
                sequence = str(pattern["depletion_sequence"])
                for index, stage_name in enumerate([part.strip() for part in sequence.split("→")], start=1):
                    out.append(
                        StateTransition(
                            pattern=score.name,
                            stage=normalize_term(stage_name),
                            sequence_index=index,
                            description=f"{sequence} dynamic depletion sequence.",
                            evidence=[score.name],
                            intervention_posture="rebuild_depletion_before_stimulation",
                        )
                    )
            for index, item in enumerate(pattern.get("collapse_chain", []) or [], start=1):
                out.append(
                    StateTransition(
                        pattern=score.name,
                        stage=normalize_term(str(item).split(":", 1)[0]),
                        sequence_index=index,
                        description=str(item),
                        evidence=[score.name],
                        intervention_posture="restore_root_before_downstream_manifestations",
                    )
                )
        return _dedupe_transitions(out)

    def restoration_plan(
        self,
        case: EngineInput,
        patterns: list[PatternScore],
        transitions: list[StateTransition],
        graph: GraphAnalysis,
        facts: dict[str, Any],
    ) -> RestorationPlan:
        root_layers: list[str] = []
        compensation_layers: list[str] = []
        secondary_layers: list[str] = []
        ordered_steps: list[dict[str, Any]] = []
        avoid_first: list[str] = []

        for transition in transitions:
            stage_key = normalize_term(transition.stage)
            if stage_key in ROOT_LAYER_MARKERS or "freeze" in stage_key or "root" in transition.description.lower():
                root_layers.append(transition.stage)
            elif stage_key in COMPENSATION_MARKERS or "compensatory" in stage_key:
                compensation_layers.append(transition.stage)
            elif stage_key in SECONDARY_MARKERS or "stagn" in stage_key or "inflammation" in transition.description.lower():
                secondary_layers.append(transition.stage)

        if facts.get("upper_heat") and facts.get("lower_cold"):
            root_layers.append("lower_dantian_freeze")
            compensation_layers.append("compensatory_upper_heat")
            avoid_first.append("do_not_attack_upper_heat_first")

        for score in patterns[:4]:
            pattern = self.kb.pattern(score.name)
            for stage in pattern.get("restoration_stages", []) or []:
                ordered_steps.append(
                    {
                        "pattern": score.name,
                        "sequence_index": stage.get("stage"),
                        "action": stage.get("action"),
                        "detail": stage.get("detail"),
                    }
                )

        if not ordered_steps and facts.get("circadian_drift"):
            ordered_steps.append(
                {
                    "pattern": "metabolic_rhythm_disruption",
                    "sequence_index": 1,
                    "action": "Rhythm restoration",
                    "detail": "Use day-night rhythm and sleep improvement as the first success marker before deeper terrain reconstruction.",
                }
            )

        if graph.root_nodes:
            ordered_steps.append(
                {
                    "pattern": "five_element_graph",
                    "sequence_index": len(ordered_steps) + 1,
                    "action": "Root-node stabilization",
                    "detail": f"Prioritize {', '.join(graph.root_nodes)} before treating all graph nodes simultaneously.",
                }
            )

        return RestorationPlan(
            root_layers=unique_preserve(root_layers),
            compensation_layers=unique_preserve(compensation_layers),
            secondary_layers=unique_preserve(secondary_layers),
            ordered_steps=sorted(ordered_steps, key=lambda item: item.get("sequence_index") or 999),
            avoid_first=unique_preserve(avoid_first),
            success_metrics=_success_metrics(patterns, self.kb),
        )


def _stage_evidence(stage: dict[str, Any], terms: list[str]) -> list[str]:
    evidence = []
    values = [stage.get("name", ""), stage.get("description", ""), stage.get("western", "")]
    for value in values:
        if max((match_strength(term, value) for term in terms), default=0.0):
            evidence.append(str(value))
    return unique_preserve(evidence)


def _posture_for_stage(stage_name: str) -> str:
    normal = normalize_term(stage_name)
    if "lower" in normal or "freeze" in normal:
        return "restore_lower_root_first"
    if "upper_heat" in normal or "compensatory" in normal:
        return "do_not_clear_compensation_first"
    if "stagnant" in normal or "damp_heat" in normal:
        return "address_after_root_stabilization"
    return "sequence_aware_support"


def _success_metrics(patterns: list[PatternScore], knowledge_base: KnowledgeBase) -> list[str]:
    metrics = []
    card = knowledge_base.metabolic_rhythm_card
    if any(score.name == "metabolic_rhythm_disruption" for score in patterns):
        metrics.extend(card.get("measurable_outcomes", {}).get("primary", []) or [])
    return unique_preserve(metrics)


def _dedupe_transitions(items: list[StateTransition]) -> list[StateTransition]:
    seen: set[tuple[str, str, int]] = set()
    out: list[StateTransition] = []
    for item in items:
        key = (item.pattern, item.stage, item.sequence_index)
        if key in seen:
            continue
        seen.add(key)
        out.append(item)
    return out

