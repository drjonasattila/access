from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from .utils import expand_terms, flatten_strings, normalize_term, unique_preserve


JsonDict = dict[str, Any]


@dataclass
class EngineInput:
    """Structured case envelope accepted by the internal engine.

    The object is deliberately broader than today's JSON batch. A future LLM can
    fill the same fields from free text, labs, imaging summaries, or observations.
    """

    free_text: str = ""
    diagnoses: list[str] = field(default_factory=list)
    symptoms: list[str] = field(default_factory=list)
    observations: JsonDict = field(default_factory=dict)
    labs: JsonDict = field(default_factory=dict)
    flags: JsonDict = field(default_factory=dict)
    metadata: JsonDict = field(default_factory=dict)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | "EngineInput") -> "EngineInput":
        if isinstance(data, EngineInput):
            return data
        return cls(
            free_text=str(data.get("free_text", "") or ""),
            diagnoses=_coerce_string_list(data.get("diagnoses") or data.get("diagnosis") or []),
            symptoms=_coerce_string_list(data.get("symptoms") or []),
            observations=dict(data.get("observations") or {}),
            labs=dict(data.get("labs") or {}),
            flags=dict(data.get("flags") or {}),
            metadata=dict(data.get("metadata") or {}),
        )

    def all_terms(self) -> list[str]:
        terms: list[str] = []
        terms.extend(self.diagnoses)
        terms.extend(self.symptoms)
        if self.free_text:
            terms.append(self.free_text)
        for key, value in flatten_strings(self.observations):
            if isinstance(value, str) and value:
                terms.append(value)
            if value == "true":
                terms.append(key)
        for key, value in flatten_strings(self.flags):
            if value == "true":
                terms.append(key)
            elif value and value != "false":
                terms.append(f"{key} {value}")
                terms.append(value)
        for key, value in flatten_strings(self.labs):
            if value:
                terms.append(f"{key} {value}")
        return expand_terms(terms)

    def all_text(self) -> str:
        return " ".join(self.all_terms())


@dataclass
class Evidence:
    source: str
    field: str
    value: str
    weight: float
    reason: str


@dataclass
class PatternScore:
    name: str
    probability: float
    confidence: float
    raw_score: float
    evidence: list[Evidence] = field(default_factory=list)
    aliases: list[str] = field(default_factory=list)
    tcm_axis: str | None = None
    field_model: str | None = None


@dataclass
class AxisScore:
    name: str
    probability: float
    confidence: float
    matched_symptoms: list[str] = field(default_factory=list)


@dataclass
class SafetyRuleHit:
    condition: str
    action: str
    severity: str


@dataclass
class SafetyDecision:
    active_rules: list[SafetyRuleHit] = field(default_factory=list)
    exclusions: list[str] = field(default_factory=list)
    avoid_categories: list[str] = field(default_factory=list)
    required_framing: list[str] = field(default_factory=list)
    cautions: list[str] = field(default_factory=list)
    modifiers: JsonDict = field(default_factory=dict)

    @property
    def has_hard_overrides(self) -> bool:
        return bool(self.active_rules or self.exclusions or self.avoid_categories)


@dataclass
class Contradiction:
    kind: str
    severity: str
    explanation: str
    implicated_flags: list[str] = field(default_factory=list)


@dataclass
class InterventionCandidate:
    pattern: str
    category: str
    name: str
    role: str = ""
    notes: str = ""
    status: str = "candidate"
    safety_reason: str = ""


@dataclass
class TerrainInterpretation:
    dominant_states: list[JsonDict] = field(default_factory=list)
    axis_involvement: list[JsonDict] = field(default_factory=list)
    compensatory_loops: list[str] = field(default_factory=list)
    dynamic_transitions: list[str] = field(default_factory=list)
    educational_summary: str = ""


@dataclass
class GraphEdge:
    source: str
    target: str
    relationship: str
    mechanism: str = ""
    label: str = ""


@dataclass
class GraphActivation:
    node: str
    activation: float
    evidence: list[str] = field(default_factory=list)
    clinical_correlates: list[str] = field(default_factory=list)


@dataclass
class GraphAnalysis:
    active_nodes: list[GraphActivation] = field(default_factory=list)
    edges: list[GraphEdge] = field(default_factory=list)
    root_nodes: list[str] = field(default_factory=list)
    upstream_nodes: list[str] = field(default_factory=list)
    downstream_nodes: list[str] = field(default_factory=list)
    cascade_predictions: list[str] = field(default_factory=list)
    pathological_cycles: list[str] = field(default_factory=list)
    ui_payload: JsonDict = field(default_factory=dict)


@dataclass
class StateTransition:
    pattern: str
    stage: str
    sequence_index: int
    description: str
    evidence: list[str] = field(default_factory=list)
    intervention_posture: str = ""


@dataclass
class RestorationPlan:
    root_layers: list[str] = field(default_factory=list)
    compensation_layers: list[str] = field(default_factory=list)
    secondary_layers: list[str] = field(default_factory=list)
    ordered_steps: list[JsonDict] = field(default_factory=list)
    avoid_first: list[str] = field(default_factory=list)
    success_metrics: list[str] = field(default_factory=list)


@dataclass
class OnboardingPath:
    name: str
    level: str
    eligible: bool
    reasons: list[str] = field(default_factory=list)
    exclusions: list[str] = field(default_factory=list)
    primary_metrics: list[str] = field(default_factory=list)
    next_depth: str = ""


@dataclass
class DysregulationLayer:
    name: str
    weight: float
    role: str
    evidence: list[str] = field(default_factory=list)


@dataclass
class StabilizationPhase:
    order: int
    name: str
    goal: str
    rationale: str = ""
    status: str = "candidate"
    blocked_by: list[str] = field(default_factory=list)


@dataclass
class BridgeTool:
    name: str
    role: str
    limits: list[str] = field(default_factory=list)
    monitoring: list[str] = field(default_factory=list)
    status: str = "bridge_only"


@dataclass
class MedicationTransition:
    medication: str
    stance: str
    trigger: str
    pathway: list[JsonDict] = field(default_factory=list)
    safety_alerts: list[str] = field(default_factory=list)
    status: str = "monitor"


@dataclass
class RelapseLoop:
    signal: str
    interpretation: str
    recommended_posture: str
    evidence: list[str] = field(default_factory=list)


@dataclass
class DangerousMoleculeAlert:
    molecule: str
    unmet_need: str
    risk: str
    safer_redirects: list[str] = field(default_factory=list)
    status: str = "educational_only_never_recommend"


@dataclass
class StabilizationPlan:
    dominant_layers: list[DysregulationLayer] = field(default_factory=list)
    phases: list[StabilizationPhase] = field(default_factory=list)
    bridge_tools: list[BridgeTool] = field(default_factory=list)
    medication_transitions: list[MedicationTransition] = field(default_factory=list)
    relapse_loops: list[RelapseLoop] = field(default_factory=list)
    dangerous_molecule_alerts: list[DangerousMoleculeAlert] = field(default_factory=list)
    success_metrics: list[str] = field(default_factory=list)
    suppression_warnings: list[str] = field(default_factory=list)
    conceptual_cautions: list[str] = field(default_factory=list)


@dataclass
class SegmentalResonance:
    level: str
    organ: str
    emotional_load: str
    facet_symptom: str
    confidence: float
    evidence: list[str] = field(default_factory=list)


@dataclass
class DegenerativeStage:
    stage: str
    pattern: str
    tissue: str
    interpretation: str
    action: str = ""
    confidence: float = 0.0


@dataclass
class DuRenBalance:
    du_mai_state: str
    ren_mai_state: str
    interpretation: str
    anterior_chain_priority: bool = False


@dataclass
class SpinalPlan:
    active: bool = False
    red_flags: list[str] = field(default_factory=list)
    referral_required: bool = False
    probable_patterns: list[str] = field(default_factory=list)
    degenerative_stage: DegenerativeStage | None = None
    segmental_resonance: list[SegmentalResonance] = field(default_factory=list)
    du_ren_balance: DuRenBalance | None = None
    fascia_organ_model: JsonDict = field(default_factory=dict)
    movement_guidance: list[str] = field(default_factory=list)
    pbm_targets: list[str] = field(default_factory=list)
    cautions: list[str] = field(default_factory=list)
    educational_framing: str = ""


@dataclass
class EngineResult:
    safety: SafetyDecision
    patterns: list[PatternScore]
    contradictions: list[Contradiction]
    terrain: TerrainInterpretation
    graph: GraphAnalysis
    state_transitions: list[StateTransition]
    restoration: RestorationPlan
    onboarding: list[OnboardingPath]
    stabilization: StabilizationPlan
    spinal: SpinalPlan
    axis_scores: list[AxisScore]
    interventions: list[InterventionCandidate]
    llm_context: JsonDict
    facts: JsonDict
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> JsonDict:
        return _clean(asdict(self))


def _coerce_string_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, (list, tuple, set)):
        return [str(item) for item in value if item is not None and str(item).strip()]
    return [str(value)]


def _clean(value: Any) -> Any:
    if isinstance(value, float):
        return round(value, 4)
    if isinstance(value, list):
        return [_clean(item) for item in value]
    if isinstance(value, dict):
        return {normalize_term(key) if isinstance(key, str) else key: _clean(child) for key, child in value.items()}
    return value


def merge_unique(*groups: list[str]) -> list[str]:
    return unique_preserve(item for group in groups for item in group)
