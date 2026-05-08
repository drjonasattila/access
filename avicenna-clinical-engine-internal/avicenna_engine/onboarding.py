from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import EngineInput, OnboardingPath, PatternScore
from .utils import text_contains_any, unique_preserve


class OnboardingEngine:
    """Entry-program logic kept separate from advanced terrain reconstruction."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def evaluate(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> list[OnboardingPath]:
        card = self.kb.metabolic_rhythm_card
        if not card:
            return []

        text = case.all_text()
        entry = card.get("clinical_entry_point", {})
        reasons = []
        for marker in entry.get("who_fits", []) or []:
            if facts.get(marker) or text_contains_any(text, [marker]):
                reasons.append(marker)

        pattern_hit = next((score for score in patterns if score.name == "metabolic_rhythm_disruption"), None)
        if pattern_hit and pattern_hit.confidence >= 0.35:
            reasons.append("metabolic_rhythm_disruption_probability")

        exclusions = []
        for marker in entry.get("exclusions", []) or []:
            if facts.get(marker) or text_contains_any(text, [marker]):
                exclusions.append(marker)
        if facts.get("structural_abdominal_defect"):
            exclusions.append("structural_abdominal_defect")
        if facts.get("advanced_metabolic_disease"):
            exclusions.append("advanced_metabolic_disease")

        eligible = len(unique_preserve(reasons)) >= 2 and not exclusions
        primary = card.get("measurable_outcomes", {}).get("primary", []) or []
        return [
            OnboardingPath(
                name=card.get("name", "Metabolic Rhythm Restoration Program"),
                level="beginner_foundational",
                eligible=eligible,
                reasons=unique_preserve(reasons),
                exclusions=unique_preserve(exclusions),
                primary_metrics=list(primary),
                next_depth="advanced_terrain_reconstruction_after_sleep_energy_stabilize",
            )
        ]

