from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import (
    BridgeTool,
    DangerousMoleculeAlert,
    DysregulationLayer,
    EngineInput,
    MedicationTransition,
    PatternScore,
    RelapseLoop,
    SafetyDecision,
    StabilizationPhase,
    StabilizationPlan,
)
from .utils import match_strength, normalize_term, text_contains_any, unique_preserve


LAYER_PATTERN_MAP = {
    "fascia_ecm_dominant": "fascia_ecm",
    "mixed_transitional": "mixed_transitional",
    "gut_relapse_driver": "gut_relapse",
    "mitochondrial_decoherence": "mitochondrial",
    "dampness_biofilm": "gut_metabolic_dampness",
    "nerve_dominant": "nerve",
    "cold_heat_complex": "thermal_autonomic",
    "pelvic_yang_compression": "fascia_autonomic",
    "metabolic_rhythm_disruption": "mitochondrial_circadian",
}


BASE_PHASES = [
    (
        1,
        "unload_tissue",
        "Reduce tissue, fascia, ECM, and microcirculatory load before nerve suppression is escalated.",
    ),
    (
        2,
        "restore_elimination",
        "Support digestive flow and elimination as a system-level coherence layer.",
    ),
    (
        3,
        "improve_sleep_and_rhythm",
        "Stabilize circadian rhythm, sleep quality, and recovery capacity.",
    ),
    (
        4,
        "stabilize_autonomic_tone",
        "Reduce sympathetic load and improve parasympathetic pacing tolerance.",
    ),
    (
        5,
        "reduce_neural_overfiring",
        "Introduce neural noise reduction only after tissue and gut load are not dominant blockers.",
    ),
    (
        6,
        "targeted_modulation",
        "Use targeted herbs, supplements, devices, or medication-transition support as narrow bridge tools.",
    ),
]


SUCCESS_METRICS = [
    "sleep_quality",
    "emotional_regulation",
    "digestive_flow",
    "resilience",
    "flare_frequency",
    "pacing_tolerance",
    "reduced_medication_dependence",
]


class StabilizationEngine:
    """Intervention sequencing and stabilization layer.

    This layer does not recommend treatment. It identifies order, bridge-tool
    limits, suppression loops, and recovery-environment priorities.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def evaluate(
        self,
        case: EngineInput,
        patterns: list[PatternScore],
        safety: SafetyDecision,
        facts: dict[str, Any],
    ) -> StabilizationPlan:
        layers = self._layers(case, patterns, facts)
        phases = self._phases(layers, facts, safety)
        bridges = self._bridge_tools(case, facts)
        meds = self._medication_transitions(facts)
        relapse = self._relapse_loops(case, facts, layers)
        alerts = self._dangerous_molecule_alerts(case)

        return StabilizationPlan(
            dominant_layers=layers,
            phases=phases,
            bridge_tools=bridges,
            medication_transitions=meds,
            relapse_loops=relapse,
            dangerous_molecule_alerts=alerts,
            success_metrics=list(SUCCESS_METRICS),
            suppression_warnings=self._suppression_warnings(facts, meds, relapse),
            conceptual_cautions=self._conceptual_cautions(),
        )

    def _layers(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> list[DysregulationLayer]:
        weights: dict[str, float] = {}
        evidence: dict[str, list[str]] = {}
        for score in patterns:
            layer = LAYER_PATTERN_MAP.get(score.name)
            if not layer:
                continue
            weights[layer] = weights.get(layer, 0.0) + score.confidence
            evidence.setdefault(layer, []).append(score.name)

        if facts.get("digestive_flow_impaired") or facts.get("gut_symptoms_count", 0) >= 2:
            weights["gut_relapse"] = weights.get("gut_relapse", 0.0) + 1.0
            evidence.setdefault("gut_relapse", []).append("digestive flow / gut symptoms")
        if facts.get("tens_only_while_on"):
            weights["fascia_ecm"] = weights.get("fascia_ecm", 0.0) + 0.8
            evidence.setdefault("fascia_ecm", []).append("TENS helps only while on")
        if facts.get("side_effects_present") or facts.get("dose_escalating"):
            weights["suppression_loop"] = weights.get("suppression_loop", 0.0) + 0.8
            evidence.setdefault("suppression_loop", []).append("medication escalation or side effects")

        total = sum(weights.values()) or 1.0
        ordered = sorted(weights.items(), key=lambda item: item[1], reverse=True)
        out: list[DysregulationLayer] = []
        for index, (layer, weight) in enumerate(ordered):
            role = "primary" if index == 0 else "compensatory" if index == 1 else "downstream"
            out.append(
                DysregulationLayer(
                    name=layer,
                    weight=weight / total,
                    role=role,
                    evidence=unique_preserve(evidence.get(layer, [])),
                )
            )
        return out

    def _phases(
        self,
        layers: list[DysregulationLayer],
        facts: dict[str, Any],
        safety: SafetyDecision,
    ) -> list[StabilizationPhase]:
        layer_names = {layer.name for layer in layers if layer.weight >= 0.12}
        phases: list[StabilizationPhase] = []
        tissue_loaded = bool({"fascia_ecm", "fascia_autonomic", "gut_metabolic_dampness"} & layer_names)
        gut_impaired = facts.get("digestive_flow_impaired") or facts.get("gut_symptoms_count", 0) >= 2

        for order, name, goal in BASE_PHASES:
            status = "candidate"
            blocked_by: list[str] = []
            rationale = "Small coherent inputs are preferred over high-intensity stimulation."
            if name == "reduce_neural_overfiring" and tissue_loaded:
                status = "blocked_until_stabilized"
                blocked_by.append("tissue_before_nerve")
                rationale = "Persistent neural overactivity may be secondary to tissue load; do not calm the nerve before unloading tissue."
            if name in {"stabilize_autonomic_tone", "reduce_neural_overfiring", "targeted_modulation"} and gut_impaired:
                status = "deprioritized"
                blocked_by.append("gut_first")
                rationale = "Gut regulation is treated as system-level coherence support before advanced modulation."
            if name == "targeted_modulation" and safety.avoid_categories:
                blocked_by.extend(safety.avoid_categories)
            phases.append(
                StabilizationPhase(
                    order=order,
                    name=name,
                    goal=goal,
                    rationale=rationale,
                    status=status,
                    blocked_by=unique_preserve(blocked_by),
                )
            )
        return phases

    def _bridge_tools(self, case: EngineInput, facts: dict[str, Any]) -> list[BridgeTool]:
        tools: list[BridgeTool] = []
        tens = self.kb.tens_protocol
        if tens:
            monitoring = ["diminishing_returns", "relief_only_while_on", "flare_rebound", "pacing_tolerance"]
            tools.append(
                BridgeTool(
                    name="TENS",
                    role=str(tens.get("general_role", "bridge tool")),
                    limits=list(tens.get("not_for") or []) + ["not a primary long-term solution"],
                    monitoring=monitoring,
                )
            )
        laser = self.kb.laser_protocol
        if laser:
            tools.append(
                BridgeTool(
                    name="laser",
                    role="coherence modulation, not stimulation",
                    limits=[str(laser.get("dosing_principle", "small coherent dose"))],
                    monitoring=["overstimulation", "sleep_response", "flare_frequency"],
                )
            )
        return tools

    def _medication_transitions(self, facts: dict[str, Any]) -> list[MedicationTransition]:
        meds = set(facts.get("current_medications") or [])
        out: list[MedicationTransition] = []
        for row in self.kb.western_medication_compatibility:
            drug = str(row.get("drug", ""))
            drug_keys = {normalize_term(part) for part in drug.replace("/", ",").split(",")}
            if not (drug_keys & meds):
                continue
            status = "bridge_or_monitor"
            alerts = ["never_abrupt_discontinuation", "stabilization_overlap_required", "relapse_monitoring_required"]
            if facts.get("dose_escalating") or facts.get("side_effects_present"):
                status = "transition_support_flagged"
                alerts.append("possible_suppression_without_resolution")
            out.append(
                MedicationTransition(
                    medication=drug,
                    stance=str(row.get("base44_stance", "")),
                    trigger=str(row.get("exit_trigger", "")),
                    pathway=[
                        {"stage": "week_0_2", "focus": "parallel stabilization and baseline metrics"},
                        {"stage": "week_2_4", "focus": "slow clinician-guided taper only if stable"},
                        {"stage": "week_4_8", "focus": "maintenance, relapse monitoring, dominant layer reassessment"},
                        {"stage": "after_8_weeks", "focus": "reassess whether symptoms represent withdrawal, relapse, or unresolved terrain instability"},
                    ],
                    safety_alerts=alerts,
                    status=status,
                )
            )
        return out

    def _relapse_loops(
        self,
        case: EngineInput,
        facts: dict[str, Any],
        layers: list[DysregulationLayer],
    ) -> list[RelapseLoop]:
        loops: list[RelapseLoop] = []
        if facts.get("tens_only_while_on"):
            loops.append(
                RelapseLoop(
                    signal="TENS helps only while ON",
                    interpretation="This may indicate unresolved tissue holding rather than restored regulation.",
                    recommended_posture="do_not_escalate_suppression; return_to_tissue_unloading_and_gut_flow",
                    evidence=["tens_response"],
                )
            )
        if facts.get("crps_returning_post_treatment"):
            loops.append(
                RelapseLoop(
                    signal="relief fades rapidly after ketamine or bridge intervention",
                    interpretation="This may indicate suppression without integration or insufficient autonomic recovery.",
                    recommended_posture="bridge_only; reassess tissue, gut, sleep, and pacing tolerance",
                    evidence=["current_medication", "relapse"],
                )
            )
        if facts.get("dose_escalating") or facts.get("side_effects_present"):
            loops.append(
                RelapseLoop(
                    signal="escalating medication requirement or cognitive/fatigue side effects",
                    interpretation="This may reflect an over-suppression loop or unresolved terrain load.",
                    recommended_posture="avoid abrupt changes; add stabilization overlap and clinician-guided review",
                    evidence=["current_medications"],
                )
            )
        return loops

    def _dangerous_molecule_alerts(self, case: EngineInput) -> list[DangerousMoleculeAlert]:
        text = case.all_text()
        alerts: list[DangerousMoleculeAlert] = []
        for row in self.kb.dangerous_molecules_reference.get("series", []) or []:
            molecule = str(row.get("molecule", ""))
            if not text_contains_any(text, [molecule]):
                continue
            alerts.append(
                DangerousMoleculeAlert(
                    molecule=molecule,
                    unmet_need=str(row.get("teaches", "")),
                    risk=str(row.get("risk", "")),
                    safer_redirects=list(row.get("safe_substitutes") or []),
                )
            )
        return alerts

    def _suppression_warnings(
        self,
        facts: dict[str, Any],
        medication_transitions: list[MedicationTransition],
        relapse_loops: list[RelapseLoop],
    ) -> list[str]:
        warnings: list[str] = []
        if medication_transitions:
            warnings.append("Medication support is treated as compatible bridge care, never as abrupt discontinuation.")
        if relapse_loops:
            warnings.append("Symptom relief without durable regulation may indicate suppression without resolution.")
        if facts.get("tens_only_while_on"):
            warnings.append("Do not escalate TENS simply because it suppresses pain while active.")
        return unique_preserve(warnings)

    def _conceptual_cautions(self) -> list[str]:
        cautions = []
        if self.kb.mitochondrial_field_model:
            cautions.append(
                "The mitochondrial coherence model is an exploratory integrative framework, not established mainstream biochemistry."
            )
        if self.kb.dangerous_molecules_reference:
            cautions.append("Dangerous molecules are educational references only and must never be recommended.")
        return cautions

