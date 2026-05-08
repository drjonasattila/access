from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .utils import flatten_strings, normalize_term


DEFAULT_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "avicenna_engine_batch1.json"


@dataclass(frozen=True)
class PatternMarker:
    pattern: str
    field: str
    value: str
    weight: float


class KnowledgeBase:
    """Loaded JSON batch plus indexes needed by the reasoning layers."""

    def __init__(self, payload: dict[str, Any]):
        self.payload = payload
        self.meta = dict(payload.get("meta") or {})
        self.input_variables = list(payload.get("input_variables") or [])
        self.patterns = list(payload.get("patterns") or [])
        self.pattern_by_name = {pattern["name"]: pattern for pattern in self.patterns}
        self.diagnosis_map = list(payload.get("diagnosis_map") or [])
        self.rules = list(payload.get("rules") or [])
        self.five_element_map = dict(payload.get("five_element_map") or {})
        self.axis_prediction_module = dict(payload.get("axis_prediction_module") or {})
        self.notes = list(payload.get("notes") or [])
        self._pattern_markers = self._build_pattern_markers()

    @classmethod
    def load(cls, path: str | Path | None = None) -> "KnowledgeBase":
        data_path = Path(path) if path else DEFAULT_DATA_PATH
        with data_path.open("r", encoding="utf-8") as handle:
            return cls(json.load(handle))

    def pattern_markers(self) -> list[PatternMarker]:
        return list(self._pattern_markers)

    def pattern(self, name: str) -> dict[str, Any]:
        return self.pattern_by_name.get(name, {})

    def associated_patterns_for_diagnosis(self, diagnosis: str) -> list[tuple[str, str, str]]:
        normal = normalize_term(diagnosis)
        matches: list[tuple[str, str, str]] = []
        for row in self.diagnosis_map:
            row_diagnosis = row.get("diagnosis", "")
            row_normal = normalize_term(row_diagnosis)
            if normal == row_normal or normal in row_normal or row_normal in normal:
                note = row.get("notes", "")
                for pattern_name in row.get("associated_patterns", []):
                    matches.append((pattern_name, row_diagnosis, note))
        return matches

    def _build_pattern_markers(self) -> list[PatternMarker]:
        markers: list[PatternMarker] = []
        for pattern in self.patterns:
            name = pattern.get("name", "")
            for path, value in flatten_strings(pattern):
                if not value or path.endswith(".name"):
                    continue
                weight = _field_weight(path)
                if weight <= 0:
                    continue
                markers.append(PatternMarker(pattern=name, field=path, value=value, weight=weight))
        return markers


def _field_weight(path: str) -> float:
    path = path.lower()
    if ".interventions" in path or path.startswith("interventions"):
        return 0.0
    if "contraindications" in path:
        return 0.0
    if "red_flags" in path:
        return 0.2
    if "symptoms" in path:
        return 1.0
    if "primary_uses" in path:
        return 0.85
    if "switch_logic" in path:
        return 0.7
    if "triggers" in path:
        return 0.65
    if "aliases" in path:
        return 0.55
    if "subtypes" in path:
        return 0.45
    if "western_physiology" in path or "field_model" in path or "tcm_axis" in path:
        return 0.35
    if "description" in path:
        return 0.35
    return 0.15
