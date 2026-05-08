from __future__ import annotations

from typing import Any

from .knowledge_base import KnowledgeBase
from .models import InterventionCandidate, PatternScore, SafetyDecision
from .utils import normalize_term, unique_preserve


WARMING_MARKERS = {
    "warm",
    "warming",
    "rekindle",
    "lower_fire",
    "yang_rekindle",
    "rou_gui",
    "hu_lu_ba",
    "yin_yang_huo",
    "fu_zi",
    "ba_ji_tian",
}
COOLING_MARKERS = {"cool", "cooling", "clear_heat", "huang_bai", "long_dan", "berberine", "mu_dan_pi"}
BLOOD_MOVER_MARKERS = {"dan_shen", "san_qi", "chuan_xiong", "chuan_niu_xi", "yi_mu_cao", "yu_jin"}


def collect_interventions(
    knowledge_base: KnowledgeBase,
    patterns: list[PatternScore],
    safety: SafetyDecision,
    limit_per_pattern: int = 40,
) -> list[InterventionCandidate]:
    candidates: list[InterventionCandidate] = []
    for score in patterns[:4]:
        pattern = knowledge_base.pattern(score.name)
        raw_candidates = _flatten_pattern_interventions(score.name, pattern)
        candidates.extend(raw_candidates[:limit_per_pattern])

    return _apply_safety(candidates, safety)


def _flatten_pattern_interventions(pattern_name: str, pattern: dict[str, Any]) -> list[InterventionCandidate]:
    candidates: list[InterventionCandidate] = []
    interventions = pattern.get("interventions")
    if interventions:
        _walk_intervention_tree(pattern_name, interventions, "interventions", candidates)
    for top_key in ("device", "lifestyle", "preparation", "western_treatment"):
        if top_key in pattern:
            candidates.append(
                InterventionCandidate(
                    pattern=pattern_name,
                    category=top_key,
                    name=top_key,
                    role=str(pattern.get(top_key, "")),
                )
            )
    return candidates


def _walk_intervention_tree(
    pattern_name: str,
    value: Any,
    category: str,
    out: list[InterventionCandidate],
) -> None:
    if value is None:
        return
    if isinstance(value, dict):
        display_name = value.get("name") or value.get("point") or value.get("add") or value.get("condition")
        if display_name:
            out.append(
                InterventionCandidate(
                    pattern=pattern_name,
                    category=category,
                    name=str(display_name),
                    role=str(value.get("role") or value.get("function") or value.get("description") or value.get("condition") or ""),
                    notes=str(value.get("notes", "")),
                )
            )
            return
        for key, child in value.items():
            _walk_intervention_tree(pattern_name, child, f"{category}.{key}", out)
        return
    if isinstance(value, list):
        for item in value:
            _walk_intervention_tree(pattern_name, item, category, out)
        return
    if isinstance(value, str):
        out.append(InterventionCandidate(pattern=pattern_name, category=category, name=category.split(".")[-1], role=value))


def _apply_safety(candidates: list[InterventionCandidate], safety: SafetyDecision) -> list[InterventionCandidate]:
    exclusion_keys = {normalize_term(name) for name in safety.exclusions}
    avoid = {normalize_term(category) for category in safety.avoid_categories}
    filtered: list[InterventionCandidate] = []
    seen: set[str] = set()

    for candidate in candidates:
        marker_text = normalize_term(" ".join([candidate.category, candidate.name, candidate.role, candidate.notes]))
        status = "candidate"
        reason = ""

        candidate_name = normalize_term(candidate.name)
        if candidate_name in exclusion_keys:
            status = "blocked_by_safety"
            reason = "excluded_by_active_rule"
        elif "fat_loss_protocol" in avoid and _has_any(marker_text, {"fat_burning", "fat_loss", "visceral_fat_targeting"}):
            status = "blocked_by_safety"
            reason = "fat_loss_protocol_avoided"
        elif "aggressive_hiit" in avoid and "hiit" in marker_text:
            status = "blocked_by_safety"
            reason = "aggressive_hiit_avoided"
        elif "caloric_restriction" in avoid and "caloric_restriction" in marker_text:
            status = "blocked_by_safety"
            reason = "caloric_restriction_avoided"
        elif "cryolipolysis" in avoid and "cryolipolysis" in marker_text:
            status = "blocked_by_safety"
            reason = "cryolipolysis_avoided"
        elif "aggressive_yang_stimulation" in avoid and _has_any(marker_text, {"fu_zi", "yang", "stimulation"}):
            status = "caution"
            reason = "aggressive_yang_stimulation_avoided"
        elif "berberine" in avoid and "berberine" in marker_text:
            status = "blocked_by_safety"
            reason = "berberine_switch_off"
        elif "warming" in avoid and _has_any(marker_text, WARMING_MARKERS):
            status = "blocked_by_safety"
            reason = "warming_avoided_by_active_rule"
        elif ("cooling_herbs" in avoid or "cold_only" in avoid) and _has_any(marker_text, COOLING_MARKERS):
            status = "caution"
            reason = "cooling_or_cold_only_strategy_constrained"
        elif safety.modifiers.get("berberine") == "off" and "berberine" in marker_text:
            status = "blocked_by_safety"
            reason = "berberine_off"

        if safety.required_framing and "cancer" in marker_text:
            status = "caution"
            reason = "supportive_adjunctive_only"

        key = normalize_term(f"{candidate.pattern}:{candidate.category}:{candidate.name}:{candidate.role}")
        if key in seen:
            continue
        seen.add(key)
        candidate.status = status
        candidate.safety_reason = reason
        filtered.append(candidate)

    return filtered


def _has_any(text: str, markers: set[str]) -> bool:
    return any(marker in text for marker in markers)


def summarise_allowed_categories(candidates: list[InterventionCandidate]) -> list[str]:
    return unique_preserve(candidate.category for candidate in candidates if candidate.status != "blocked_by_safety")
