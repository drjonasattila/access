from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import (
    DegenerativeStage,
    DuRenBalance,
    EngineInput,
    PatternScore,
    SegmentalResonance,
    SpinalPlan,
)
from .utils import match_strength, normalize_term, text_contains_any, unique_preserve


SPINAL_PATTERNS = {
    "du_mai_yang_overload",
    "du_ren_collapse",
    "yin_structure_calcification",
    "kidney_yin_jing_deficiency",
    "liver_qi_fascia_tension",
    "sympathetic_overdrive_spinal",
}


class SpinalSegmentEngine:
    """Spinal segment / Du-Ren / fascia-organ reasoning overlay.

    This module is not a back-pain diagnosis tool. It stages integrative spinal
    terrain hypotheses only after red-flag safety has been checked.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def evaluate(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> SpinalPlan:
        spinal_scores = [score for score in patterns if score.name in SPINAL_PATTERNS]
        active = bool(spinal_scores or self._has_spinal_input(case, facts))
        if not active and not self.kb.segmental_organ_map:
            return SpinalPlan()

        red_flags = list(facts.get("spinal_red_flags") or [])
        stage = self._degenerative_stage(spinal_scores, facts)
        resonance = self._segmental_resonance(case, facts)
        du_ren = self._du_ren_balance(facts, spinal_scores)
        probable = [score.name for score in spinal_scores[:5]]
        movement = self._movement_guidance(facts)
        targets = self._pbm_targets(facts, resonance)
        cautions = self._cautions(facts, stage, red_flags)

        return SpinalPlan(
            active=active,
            red_flags=red_flags,
            referral_required=bool(red_flags) or (stage.action == "REFER" if stage else False),
            probable_patterns=probable,
            degenerative_stage=stage,
            segmental_resonance=resonance,
            du_ren_balance=du_ren,
            fascia_organ_model=self.kb.fascia_organ_functional_model,
            movement_guidance=movement,
            pbm_targets=targets,
            cautions=cautions,
            educational_framing=(
                "This is an integrative segmental resonance overlay, not established Western anatomy or a replacement for imaging, diagnosis, or urgent care."
            ),
        )

    def _has_spinal_input(self, case: EngineInput, facts: dict[str, Any]) -> bool:
        text = case.all_text()
        return any(
            [
                facts.get("spinal_level"),
                facts.get("pain_worse_on_extension"),
                facts.get("pain_worse_on_extension_rotation"),
                text_contains_any(text, ["facet", "spinal", "paraspinal", "stenosis", "du mai", "ren mai", "huatuojiaji"]),
            ]
        )

    def _degenerative_stage(self, spinal_scores: list[PatternScore], facts: dict[str, Any]) -> DegenerativeStage | None:
        model = self.kb.degenerative_progression_model
        stages = list(model.get("stages") or [])
        if not stages:
            return None

        explicit = facts.get("degenerative_stage")
        if explicit:
            for stage in stages:
                if explicit in normalize_term(stage.get("stage", "")):
                    return _stage_from_payload(stage, 0.9)

        top_names = {score.name: score for score in spinal_scores}
        for stage in stages:
            pattern = stage.get("pattern", "")
            if pattern in top_names:
                return _stage_from_payload(stage, top_names[pattern].confidence)

        if facts.get("structural_changes_present") or facts.get("severe_stenosis") or facts.get("cord_compression"):
            for stage in stages:
                if "late" in normalize_term(stage.get("stage", "")) or stage.get("action") == "REFER":
                    return _stage_from_payload(stage, 0.75)
        if facts.get("pain_worse_on_extension_rotation"):
            return _stage_from_payload(stages[0], 0.65)
        return None

    def _segmental_resonance(self, case: EngineInput, facts: dict[str, Any]) -> list[SegmentalResonance]:
        segments = list(self.kb.segmental_organ_map.get("segments") or [])
        if not segments:
            return []
        terms = case.all_terms()
        requested_level = facts.get("spinal_level", "")
        requested_organ = facts.get("organ_resonance", "")
        matches: list[SegmentalResonance] = []
        for segment in segments:
            level = str(segment.get("level", ""))
            organ = str(segment.get("organ", ""))
            evidence = []
            score = 0.0
            if requested_level and normalize_term(level) == requested_level:
                score += 0.65
                evidence.append("spinal_level")
            if requested_organ and match_strength(requested_organ, organ):
                score += 0.25
                evidence.append("organ_resonance")
            symptom = str(segment.get("facet_symptom", ""))
            symptom_strength = max((match_strength(term, symptom) for term in terms), default=0.0)
            if symptom_strength >= 0.64:
                score += 0.25 * symptom_strength
                evidence.append(symptom)
            if score <= 0:
                continue
            matches.append(
                SegmentalResonance(
                    level=level,
                    organ=organ,
                    emotional_load=str(segment.get("emotional_load", "")),
                    facet_symptom=symptom,
                    confidence=min(0.95, score),
                    evidence=unique_preserve(evidence),
                )
            )
        return sorted(matches, key=lambda item: item.confidence, reverse=True)

    def _du_ren_balance(self, facts: dict[str, Any], spinal_scores: list[PatternScore]) -> DuRenBalance:
        names = {score.name for score in spinal_scores}
        du_state = "overloaded" if "du_mai_yang_overload" in names or facts.get("pain_worse_on_extension_rotation") else "not_dominant"
        ren_low = facts.get("ren_mai_collapse") or facts.get("ren_mai_tone_low") or facts.get("abdominal_wall_tone_low")
        ren_state = "collapsed_or_low_tone" if ren_low or "du_ren_collapse" in names else "not_dominant"
        anterior_priority = bool(ren_low or "du_ren_collapse" in names)
        if anterior_priority:
            interpretation = (
                "Posterior spinal load may be compensating for low anterior-chain containment; Ren/anterior-chain restoration should be considered alongside Du/posterior work."
            )
        elif du_state == "overloaded":
            interpretation = "Posterior Yang conduction appears overloaded; calm sympathetic tone and restore local hydration before stronger stimulation."
        else:
            interpretation = "No strong Du-Ren imbalance signal was detected from the current input."
        return DuRenBalance(
            du_mai_state=du_state,
            ren_mai_state=ren_state,
            interpretation=interpretation,
            anterior_chain_priority=anterior_priority,
        )

    def _movement_guidance(self, facts: dict[str, Any]) -> list[str]:
        guidance = []
        if facts.get("pain_worse_on_extension"):
            guidance.append("avoid_extension_loading_exercises")
            guidance.append("consider_flexion_biased_mobilisation_if_clinically_appropriate")
        if facts.get("pain_improves_with_warmth_and_rotation"):
            guidance.append("gentle_rotation_and_warmth_may_support_du_mai_yang_overload_hypothesis")
        if facts.get("red_flag_present"):
            guidance.append("movement_guidance_deferred_until_western_red_flags_are_cleared")
        return guidance

    def _pbm_targets(self, facts: dict[str, Any], resonance: list[SegmentalResonance]) -> list[str]:
        targets = ["Huatuojiaji at affected segment", "BL line", "GB line"]
        level = facts.get("spinal_level")
        if level:
            targets.append(f"affected segment: {level}")
        for item in resonance[:2]:
            targets.append(f"{item.level} organ resonance zone: {item.organ}")
        if facts.get("ren_mai_collapse") or facts.get("ren_mai_tone_low"):
            targets.append("Ren/anterior chain support zone")
        return unique_preserve(targets)

    def _cautions(
        self,
        facts: dict[str, Any],
        stage: DegenerativeStage | None,
        red_flags: list[str],
    ) -> list[str]:
        cautions = [
            "western_diagnostics_and_red_flags_primary",
            "segmental_resonance_model_is_integrative_not_standard_anatomy",
        ]
        if red_flags:
            cautions.append("refer_or_escalate_before_integrative_protocol")
        if stage and ("late" in normalize_term(stage.stage) or stage.action == "REFER"):
            cautions.append("late_structural_stage_supportive_only")
            cautions.append("avoid_overpromising_reversibility")
        if facts.get("sympathetic_tone_high") or facts.get("paraspinal_spasm"):
            cautions.append("avoid_aggressive_stimulation_in_sensitized_state")
        return unique_preserve(cautions)


def _stage_from_payload(stage: dict[str, Any], confidence: float) -> DegenerativeStage:
    return DegenerativeStage(
        stage=str(stage.get("stage", "")),
        pattern=str(stage.get("pattern", "")),
        tissue=str(stage.get("tissue", "")),
        interpretation=str(stage.get("manifestation") or stage.get("energetic_state") or ""),
        action=str(stage.get("action", "")),
        confidence=confidence,
    )
