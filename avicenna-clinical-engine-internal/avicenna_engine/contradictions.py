from __future__ import annotations

from typing import Any

from .models import Contradiction, EngineInput
from .utils import normalize_term


def detect_contradictions(case: EngineInput, facts: dict[str, Any]) -> list[Contradiction]:
    contradictions: list[Contradiction] = []

    if facts.get("heat_dominant_flag") and facts.get("cold_dominant_flag"):
        contradictions.append(
            Contradiction(
                kind="mixed_thermal_state",
                severity="moderate",
                explanation=(
                    "Heat and cold signals are both present. Interpret this as a mixed terrain rather than forcing a single thermal label."
                ),
                implicated_flags=["heat_dominant_flag", "cold_dominant_flag"],
            )
        )

    if facts.get("upper_heat") and facts.get("lower_cold"):
        contradictions.append(
            Contradiction(
                kind="vertical_dissociation",
                severity="high",
                explanation=(
                    "Upper heat with lower cold suggests a possible vertical autonomic dissociation; lower anchoring strategies should be considered before aggressive clearing."
                ),
                implicated_flags=["upper_heat", "lower_cold"],
            )
        )

    if facts.get("acute_inflammatory_flare") and facts.get("cold_dominant_flag"):
        contradictions.append(
            Contradiction(
                kind="flare_on_cold_background",
                severity="high",
                explanation=(
                    "An acute inflammatory flare can sit on top of a cold or depleted baseline. The flare layer should constrain warming enthusiasm."
                ),
                implicated_flags=["acute_inflammatory_flare", "cold_dominant_flag"],
            )
        )

    response_to_heat = _observation(case, "response_to_heat")
    response_to_cold = _observation(case, "response_to_cold")
    if facts.get("heat_dominant_flag") and _positive_response(response_to_heat):
        contradictions.append(
            Contradiction(
                kind="heat_label_but_heat_relief",
                severity="low",
                explanation=(
                    "Heat-dominant markers coexist with relief from warmth. This may reflect cold-depletion underneath a hot compensatory layer."
                ),
                implicated_flags=["heat_dominant_flag", "response_to_heat"],
            )
        )
    if facts.get("cold_dominant_flag") and _positive_response(response_to_cold):
        contradictions.append(
            Contradiction(
                kind="cold_label_but_cold_relief",
                severity="low",
                explanation=(
                    "Cold-dominant markers coexist with relief from cold. Recheck whether inflammatory heat or swelling is driving part of the presentation."
                ),
                implicated_flags=["cold_dominant_flag", "response_to_cold"],
            )
        )
    return contradictions


def _observation(case: EngineInput, key: str) -> str:
    return str(case.observations.get(key) or case.flags.get(key) or "")


def _positive_response(value: str) -> bool:
    normal = normalize_term(value)
    return any(marker in normal for marker in ("better", "relief", "improves", "helps", "positive"))

