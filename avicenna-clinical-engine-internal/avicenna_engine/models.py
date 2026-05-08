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
class EngineResult:
    safety: SafetyDecision
    patterns: list[PatternScore]
    contradictions: list[Contradiction]
    terrain: TerrainInterpretation
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
