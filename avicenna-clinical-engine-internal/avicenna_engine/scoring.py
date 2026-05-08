from __future__ import annotations

import math
from collections import defaultdict

from .knowledge_base import KnowledgeBase
from .models import AxisScore, EngineInput, Evidence, PatternScore
from .utils import match_strength, normalize_term, unique_preserve


class WeightedPatternEngine:
    """Probabilistic pattern recognizer over symbolic terrain markers."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def score(self, case: EngineInput) -> list[PatternScore]:
        terms = case.all_terms()
        text = case.all_text()
        evidence_by_pattern: dict[str, list[Evidence]] = defaultdict(list)
        raw_scores: dict[str, float] = defaultdict(float)

        for diagnosis in case.diagnoses:
            for pattern_name, mapped_diagnosis, note in self.kb.associated_patterns_for_diagnosis(diagnosis):
                evidence = Evidence(
                    source="diagnosis_map",
                    field="diagnosis",
                    value=mapped_diagnosis,
                    weight=1.4,
                    reason=note or "Diagnosis map associated this conventional label with the pattern.",
                )
                evidence_by_pattern[pattern_name].append(evidence)
                raw_scores[pattern_name] += evidence.weight

        for marker in self.kb.pattern_markers():
            strength = self._best_marker_strength(marker.value, terms, text)
            if strength <= 0:
                continue
            weight = marker.weight * strength
            evidence = Evidence(
                source="pattern_marker",
                field=marker.field,
                value=marker.value,
                weight=weight,
                reason=f"Matched case input against {marker.field}.",
            )
            evidence_by_pattern[marker.pattern].append(evidence)
            raw_scores[marker.pattern] += weight

        total = sum(raw_scores.values())
        scores: list[PatternScore] = []
        for name, raw in sorted(raw_scores.items(), key=lambda item: item[1], reverse=True):
            if raw <= 0:
                continue
            pattern = self.kb.pattern(name)
            confidence = min(0.95, 1 - math.exp(-raw / 2.4))
            probability = raw / total if total else 0.0
            evidence = sorted(evidence_by_pattern[name], key=lambda item: item.weight, reverse=True)[:8]
            scores.append(
                PatternScore(
                    name=name,
                    probability=probability,
                    confidence=confidence,
                    raw_score=raw,
                    evidence=evidence,
                    aliases=list(pattern.get("aliases") or []),
                    tcm_axis=pattern.get("tcm_axis"),
                    field_model=pattern.get("field_model") or pattern.get("description"),
                )
            )
        return scores

    def _best_marker_strength(self, marker_value: str, terms: list[str], text: str) -> float:
        marker_norm = normalize_term(marker_value)
        text_norm = normalize_term(text)
        if marker_norm and len(marker_norm) >= 5 and marker_norm in text_norm:
            return 1.0
        strengths = [match_strength(term, marker_value) for term in terms]
        return max(strengths, default=0.0)


class AxisPredictionEngine:
    """Scores the seven-axis module as an auxiliary probability surface."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def score(self, case: EngineInput) -> list[AxisScore]:
        terms = case.all_terms()
        blocks = list(self.kb.axis_prediction_module.get("input_blocks") or [])
        raw_by_block: dict[str, float] = {}
        matched: dict[str, list[str]] = {}

        for block in blocks:
            block_name = block.get("block", "")
            raw = 0.0
            block_matches: list[str] = []
            for symptom in block.get("symptoms", []):
                strength = max((match_strength(term, symptom) for term in terms), default=0.0)
                if strength:
                    raw += strength
                    block_matches.append(symptom)
            for flag in block.get("flags", []):
                strength = max((match_strength(term, flag) for term in terms), default=0.0)
                if strength:
                    raw += 0.75 * strength
                    block_matches.append(flag)
            if raw:
                raw_by_block[block_name] = raw
                matched[block_name] = unique_preserve(block_matches)

        total = sum(raw_by_block.values())
        scores: list[AxisScore] = []
        for block_name, raw in sorted(raw_by_block.items(), key=lambda item: item[1], reverse=True):
            scores.append(
                AxisScore(
                    name=block_name,
                    probability=raw / total if total else 0.0,
                    confidence=min(0.9, 1 - math.exp(-raw / 2)),
                    matched_symptoms=matched.get(block_name, []),
                )
            )
        return scores

