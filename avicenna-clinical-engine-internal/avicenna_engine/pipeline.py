from __future__ import annotations

from pathlib import Path
from typing import Any

from .contradictions import detect_contradictions
from .interventions import collect_interventions
from .knowledge_base import KnowledgeBase
from .llm_hooks import build_llm_context
from .models import EngineInput, EngineResult
from .safety import SafetyLayer
from .scoring import AxisPredictionEngine, WeightedPatternEngine
from .terrain import interpret_terrain


class AvicennaClinicalEngine:
    """Internal symbolic/probabilistic terrain engine.

    This class intentionally produces state interpretations and safety-filtered
    modulation categories. It does not produce diagnoses or treatment claims.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base
        self.pattern_engine = WeightedPatternEngine(knowledge_base)
        self.axis_engine = AxisPredictionEngine(knowledge_base)
        self.safety_layer = SafetyLayer(knowledge_base)

    @classmethod
    def from_json(cls, path: str | Path | None = None) -> "AvicennaClinicalEngine":
        return cls(KnowledgeBase.load(path))

    def evaluate(self, case_data: dict[str, Any] | EngineInput) -> EngineResult:
        case = EngineInput.from_mapping(case_data)
        patterns = self.pattern_engine.score(case)
        safety, facts = self.safety_layer.evaluate(case, patterns)
        contradictions = detect_contradictions(case, facts)
        terrain = interpret_terrain(case, self.kb, patterns, facts, contradictions)
        axis_scores = self.axis_engine.score(case)
        interventions = collect_interventions(self.kb, patterns, safety)

        result = EngineResult(
            safety=safety,
            patterns=patterns,
            contradictions=contradictions,
            terrain=terrain,
            axis_scores=axis_scores,
            interventions=interventions,
            llm_context={},
            facts=facts,
            notes=self.kb.notes,
        )
        result.llm_context = build_llm_context(result)
        return result

