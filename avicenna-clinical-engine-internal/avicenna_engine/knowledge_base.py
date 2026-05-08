from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .utils import flatten_strings, normalize_term


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_DATA_PATH = DATA_DIR / "avicenna_engine_batch1.json"


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
        self.sources = list(payload.get("_sources") or [])
        self.input_variables = list(payload.get("input_variables") or [])
        self.patterns = list(payload.get("patterns") or [])
        self.pattern_by_name = {pattern["name"]: pattern for pattern in self.patterns}
        self.diagnosis_map = list(payload.get("diagnosis_map") or [])
        self.rules = list(payload.get("rules") or [])
        self.five_element_map = dict(payload.get("five_element_map") or {})
        self.five_element_node_panel_data = dict(payload.get("five_element_node_panel_data") or {})
        self.axis_prediction_module = dict(payload.get("axis_prediction_module") or {})
        self.metabolic_rhythm_card = dict(payload.get("metabolic_rhythm_card") or {})
        self.ui_architecture_spec = dict(payload.get("ui_architecture_spec") or {})
        self.ayurveda_tcm_cellular_crosswalk = dict(payload.get("ayurveda_tcm_cellular_crosswalk") or {})
        self.western_medication_compatibility = list(payload.get("western_medication_compatibility") or [])
        self.tens_protocol = dict(payload.get("tens_protocol") or {})
        self.laser_protocol = dict(payload.get("laser_protocol") or {})
        self.mitochondrial_field_model = dict(payload.get("mitochondrial_field_model") or {})
        self.dangerous_molecules_reference = dict(payload.get("dangerous_molecules_reference") or {})
        self.frontend_patient_language = dict(payload.get("frontend_patient_language") or {})
        self.segmental_organ_map = dict(payload.get("segmental_organ_map") or {})
        self.degenerative_progression_model = dict(payload.get("degenerative_progression_model") or {})
        self.fascia_organ_functional_model = dict(payload.get("fascia_organ_functional_model") or {})
        self.western_acute_treatment = dict(payload.get("western_acute_treatment") or {})
        self.notes = list(payload.get("notes") or [])
        self._pattern_markers = self._build_pattern_markers()

    @classmethod
    def load(cls, path: str | Path | list[str | Path] | tuple[str | Path, ...] | None = None) -> "KnowledgeBase":
        paths = _resolve_paths(path)
        payloads: list[tuple[Path, dict[str, Any]]] = []
        for data_path in paths:
            with data_path.open("r", encoding="utf-8") as handle:
                payloads.append((data_path, json.load(handle)))
        return cls(_merge_payloads(payloads))

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
            if name in {"five_element_generating_cycle_intact", "five_element_controlling_cycle"}:
                continue
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
    if "primary_outcomes" in path:
        return 0.75
    if "clinical_manifestations" in path:
        return 0.8
    if "progression_stages" in path or "collapse_chain" in path:
        return 0.65
    if "restoration_stages" in path:
        return 0.25
    if "core_hypothesis" in path:
        return 0.45
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


def _resolve_paths(path: str | Path | list[str | Path] | tuple[str | Path, ...] | None) -> list[Path]:
    if path is None:
        discovered = sorted(DATA_DIR.glob("avicenna_engine_batch*.json"))
        return discovered or [DEFAULT_DATA_PATH]
    if isinstance(path, (list, tuple)):
        return [Path(item) for item in path]
    return [Path(path)]


def _merge_payloads(payloads: list[tuple[Path, dict[str, Any]]]) -> dict[str, Any]:
    if len(payloads) == 1:
        path, payload = payloads[0]
        merged = dict(payload)
        merged["_sources"] = [str(path)]
        return merged

    merged: dict[str, Any] = {
        "_sources": [str(path) for path, _ in payloads],
        "meta": {"version": "multi-batch", "batches": []},
        "input_variables": [],
        "patterns": [],
        "diagnosis_map": [],
        "rules": [],
        "notes": [],
        "five_element_map": {},
        "five_element_node_panel_data": {},
        "axis_prediction_module": {},
        "metabolic_rhythm_card": {},
        "ui_architecture_spec": {},
        "ayurveda_tcm_cellular_crosswalk": {},
        "western_medication_compatibility": [],
        "tens_protocol": {},
        "laser_protocol": {},
        "mitochondrial_field_model": {},
        "dangerous_molecules_reference": {},
        "frontend_patient_language": {},
        "segmental_organ_map": {},
        "degenerative_progression_model": {},
        "fascia_organ_functional_model": {},
        "western_acute_treatment": {},
    }
    seen_inputs: set[str] = set()
    seen_patterns: set[str] = set()
    for path, payload in payloads:
        meta = dict(payload.get("meta") or {})
        meta["source_path"] = str(path)
        merged["meta"]["batches"].append(meta)
        for variable in payload.get("input_variables") or []:
            if variable not in seen_inputs:
                seen_inputs.add(variable)
                merged["input_variables"].append(variable)
        for pattern in payload.get("patterns") or []:
            name = pattern.get("name")
            if name in seen_patterns:
                continue
            seen_patterns.add(name)
            merged["patterns"].append(pattern)
        merged["diagnosis_map"].extend(payload.get("diagnosis_map") or [])
        merged["rules"].extend(payload.get("rules") or [])
        merged["notes"].extend(payload.get("notes") or [])
        merged["five_element_map"].update(payload.get("five_element_map") or {})
        merged["five_element_node_panel_data"].update(payload.get("five_element_node_panel_data") or {})
        if payload.get("axis_prediction_module"):
            merged["axis_prediction_module"] = payload["axis_prediction_module"]
        if payload.get("metabolic_rhythm_card"):
            merged["metabolic_rhythm_card"] = payload["metabolic_rhythm_card"]
        if payload.get("ui_architecture_spec"):
            merged["ui_architecture_spec"] = payload["ui_architecture_spec"]
        merged["ayurveda_tcm_cellular_crosswalk"].update(payload.get("ayurveda_tcm_cellular_crosswalk") or {})
        merged["western_medication_compatibility"].extend(payload.get("western_medication_compatibility") or [])
        if payload.get("tens_protocol"):
            merged["tens_protocol"] = payload["tens_protocol"]
        if payload.get("laser_protocol"):
            merged["laser_protocol"] = payload["laser_protocol"]
        if payload.get("mitochondrial_field_model"):
            merged["mitochondrial_field_model"] = payload["mitochondrial_field_model"]
        if payload.get("dangerous_molecules_reference"):
            merged["dangerous_molecules_reference"] = payload["dangerous_molecules_reference"]
        if payload.get("frontend_patient_language"):
            merged["frontend_patient_language"] = payload["frontend_patient_language"]
        if payload.get("segmental_organ_map"):
            merged["segmental_organ_map"] = payload["segmental_organ_map"]
        if payload.get("degenerative_progression_model"):
            merged["degenerative_progression_model"] = payload["degenerative_progression_model"]
        if payload.get("fascia_organ_functional_model"):
            merged["fascia_organ_functional_model"] = payload["fascia_organ_functional_model"]
        if payload.get("western_acute_treatment"):
            merged["western_acute_treatment"] = payload["western_acute_treatment"]
    return merged
