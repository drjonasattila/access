from __future__ import annotations

import re
from typing import Any

from .knowledge_base import KnowledgeBase
from .models import EngineInput, PatternScore, SafetyDecision, SafetyRuleHit
from .utils import normalize_term, text_contains_any, unique_preserve


HEAT_MARKERS = [
    "heat",
    "hot",
    "warm chest",
    "burning",
    "night sweats",
    "inflammatory flare",
    "red swollen",
    "crp elevated",
    "wbc elevated",
    "dry eyes",
    "tinnitus",
    "insomnia",
]
COLD_MARKERS = [
    "cold",
    "cold feet",
    "cold pelvis",
    "cold hands",
    "better heat",
    "worse cold",
    "low libido",
    "fatigue",
    "collapse",
]
UPPER_HEAT_MARKERS = ["head warmth", "warm chest", "dry eyes", "tinnitus", "insomnia", "palpitations", "migraine"]
LOWER_COLD_MARKERS = ["cold feet", "cold legs", "cold pelvis", "cold sensation lower abdomen", "nocturia"]
DEFICIENCY_MARKERS = ["fatigue", "exhaustion", "burnout", "depletion", "collapse", "hypotension", "frailty"]
STASIS_MARKERS = ["stasis", "fixed pain", "pain worse at rest", "adhesion", "dark tongue", "blood stasis"]
ORGAN_REMOVAL_MARKERS = ["cholecystectomy", "hysterectomy", "appendectomy", "nephrectomy", "organ removed"]
CENTRAL_WEIGHT_MARKERS = ["central weight gain", "increased waist", "waist circumference", "visceral obesity"]
SLEEP_POOR_MARKERS = ["poor sleep", "sleep fragmentation", "insomnia", "circadian drift", "low sleep quality"]
STRUCTURAL_ABDOMINAL_MARKERS = ["hernia", "diastasis", "structural abdominal wall defect"]


class SafetyLayer:
    """Hard override layer. This is intentionally not probabilistic."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def derive_facts(self, case: EngineInput, patterns: list[PatternScore]) -> dict[str, Any]:
        text = case.all_text()
        facts: dict[str, Any] = {}

        for source in (case.flags, case.observations):
            for key, value in source.items():
                normal_key = normalize_term(key)
                facts[normal_key] = _truthy(value)
                if isinstance(value, str) and value.strip():
                    facts[f"{normal_key}_{normalize_term(value)}"] = True

        facts.update(_lab_facts(case.labs))

        facts["heat_dominant_flag"] = facts.get("heat_dominant_flag", False) or text_contains_any(text, HEAT_MARKERS)
        facts["cold_dominant_flag"] = facts.get("cold_dominant_flag", False) or text_contains_any(text, COLD_MARKERS)
        facts["upper_heat"] = facts.get("upper_heat", False) or text_contains_any(text, UPPER_HEAT_MARKERS)
        facts["lower_cold"] = facts.get("lower_cold", False) or text_contains_any(text, LOWER_COLD_MARKERS)
        facts["upper_heat_flag"] = facts.get("upper_heat_flag", False) or facts["upper_heat"] or facts.get("heat_upper_body_flag", False)
        facts["lower_cold_flag"] = facts.get("lower_cold_flag", False) or facts["lower_cold"] or facts.get("cold_lower_body_flag", False)
        facts["deficiency_pattern"] = facts.get("deficiency_pattern", False) or text_contains_any(text, DEFICIENCY_MARKERS)
        facts["stasis_confidence_high"] = (
            facts.get("stasis_confidence_high", False)
            or facts.get("stasis_confidence", False)
            and normalize_term(str(case.observations.get("stasis_confidence") or case.flags.get("stasis_confidence"))) == "high"
        )
        facts["blood_stasis_flag"] = facts.get("blood_stasis_flag", False) or text_contains_any(text, STASIS_MARKERS)
        facts["biofilm_suspected"] = facts.get("biofilm_suspected", False) or any(
            facts.get(flag, False)
            for flag in ("white_tongue_coating", "recurrent_pelvic_infection", "menstrual_pain_better_heat")
        )
        facts["biofilm_suspected"] = facts["biofilm_suspected"] or text_contains_any(
            text, ["white tongue coating", "recurrent pelvic infection", "biofilm", "menstrual pain better heat"]
        )
        facts["pelvic_pain_cold_type"] = facts.get("pelvic_pain_cold_type", False) or text_contains_any(
            text, ["pelvic pain cold", "cold pelvis", "worse cold better heat"]
        )
        facts["organ_removed"] = facts.get("organ_removed", False) or text_contains_any(text, ORGAN_REMOVAL_MARKERS)
        facts["active_cancer"] = facts.get("active_cancer", False) or text_contains_any(
            " ".join(case.diagnoses), ["cancer", "oncology", "malignancy"]
        )
        facts["age_40_plus"] = facts.get("age_40_plus", False) or facts.get("age_40_plus_flag", False)
        facts["central_weight_gain"] = facts.get("central_weight_gain", False) or text_contains_any(text, CENTRAL_WEIGHT_MARKERS)
        facts["sleep_poor"] = facts.get("sleep_poor", False) or facts.get("sleep_fragmentation_flag", False) or text_contains_any(
            text, SLEEP_POOR_MARKERS
        )
        facts["sleep_fragmentation"] = facts.get("sleep_fragmentation", False) or facts.get("sleep_fragmentation_flag", False)
        facts["circadian_drift"] = facts.get("circadian_drift", False) or facts.get("circadian_drift_flag", False) or text_contains_any(
            text, ["circadian drift", "circadian rhythm collapse"]
        )
        facts["stress_dominance_flag"] = facts.get("stress_dominance_flag", False) or text_contains_any(
            text, ["stress dominance", "cortisol dominance", "sympathetic dominance"]
        )
        facts["cortisol_dominance_flag"] = facts.get("cortisol_dominance_flag", False) or text_contains_any(
            text, ["cortisol dominance"]
        )
        facts["lab_insulin_resistance"] = facts.get("lab_insulin_resistance", False) or facts.get("insulin_resistance_flag", False)
        facts["lab_dyslipidaemia"] = facts.get("lab_dyslipidaemia", False) or facts.get("dyslipidaemia_flag", False)
        facts["blood_stasis_signs"] = facts.get("blood_stasis_signs", False) or facts.get("blood_stasis_flag", False)
        facts["structural_abdominal_defect"] = facts.get("structural_abdominal_defect", False) or text_contains_any(
            text, STRUCTURAL_ABDOMINAL_MARKERS
        )
        facts["advanced_metabolic_disease"] = facts.get("advanced_metabolic_disease", False) or text_contains_any(
            text, ["advanced metabolic disease", "requires pharmacology", "pharmacologic management"]
        )
        facts["snapping_hip_flag"] = facts.get("snapping_hip_flag", False) or text_contains_any(text, ["snapping hip", "coxa saltans"])
        facts["pelvic_yang_compression"] = facts.get("pelvic_yang_compression", False) or text_contains_any(
            text, ["pelvic yang compression", "yang shell", "psoas spasm", "fai", "gluteal bursitis"]
        )
        facts["martial_arts_or_athlete_history"] = facts.get("martial_arts_or_athlete_history", False) or text_contains_any(
            text, ["martial arts", "athlete", "athletic history"]
        )
        facts["lower_dantian_decoupled"] = facts.get("lower_dantian_decoupled", False) or (
            facts.get("upper_heat") and facts.get("lower_cold") and text_contains_any(text, ["anxiety", "low libido", "insomnia"])
        )

        top_names = {score.name for score in patterns if score.confidence >= 0.35}
        facts["jueyin_depletion_detected"] = "jueyin_depletion" in top_names or text_contains_any(text, ["jueyin depletion"])
        facts["berberine_switch"] = facts.get("berberine_switch", False) or "berberine_metabolic_protocol" in top_names
        facts["stasis_confidence"] = facts.get("stasis_confidence", False)
        facts["pain_worse_at_rest"] = facts.get("pain_worse_at_rest", False) or text_contains_any(text, ["pain worse at rest"])
        facts["emotional_constraint_flag"] = facts.get("emotional_constraint_flag", False) or text_contains_any(
            text, ["boundary violation", "repressed emotion", "grief", "emotional constraint", "trauma"]
        )
        return facts

    def evaluate(self, case: EngineInput, patterns: list[PatternScore]) -> tuple[SafetyDecision, dict[str, Any]]:
        facts = self.derive_facts(case, patterns)
        decision = SafetyDecision()
        exclusions: list[str] = []
        avoid_categories: list[str] = []
        required_framing: list[str] = []
        cautions: list[str] = []
        modifiers: dict[str, Any] = {}

        for rule in self.kb.rules:
            condition = str(rule.get("condition", ""))
            action = str(rule.get("action", ""))
            if not _evaluate_condition(condition, facts):
                continue
            severity = _severity(condition, action)
            decision.active_rules.append(SafetyRuleHit(condition=condition, action=action, severity=severity))
            parsed = _parse_action(action)
            exclusions.extend(parsed["exclusions"])
            avoid_categories.extend(parsed["avoid_categories"])
            required_framing.extend(parsed["required_framing"])
            cautions.extend(parsed["cautions"])
            modifiers.update(parsed["modifiers"])

        decision.exclusions = unique_preserve(exclusions)
        decision.avoid_categories = unique_preserve(avoid_categories)
        decision.required_framing = unique_preserve(required_framing)
        decision.cautions = unique_preserve(cautions)
        decision.modifiers = modifiers
        return decision, facts


def _lab_facts(labs: dict[str, Any]) -> dict[str, bool]:
    facts: dict[str, bool] = {}
    for key, value in labs.items():
        key_norm = normalize_term(key)
        value_norm = normalize_term(value)
        numeric = _as_float(value)
        if "crp" in key_norm:
            facts["crp_elevated"] = value_norm in {"high", "elevated", "positive"} or (numeric is not None and numeric > 5)
        if "wbc" in key_norm or "white_blood" in key_norm:
            facts["wbc_elevated"] = value_norm in {"high", "elevated"} or (numeric is not None and numeric > 11)
        if "culture" in key_norm:
            facts["culture_positive"] = value_norm in {"positive", "growth", "detected"}
            facts["culture_negative"] = value_norm in {"negative", "normal", "none"}
        if "insulin" in key_norm or "hba1c" in key_norm or "glucose" in key_norm:
            facts["lab_insulin_resistance"] = value_norm in {"high", "elevated", "positive", "insulin_resistance"} or (
                numeric is not None and (("glucose" in key_norm and numeric > 100) or ("hba1c" in key_norm and numeric > 5.6))
            )
        if "lipid" in key_norm or "ldl" in key_norm or "triglyceride" in key_norm:
            facts["lab_dyslipidaemia"] = value_norm in {"high", "elevated", "positive", "dyslipidaemia"} or (
                numeric is not None and (("ldl" in key_norm and numeric > 130) or ("triglyceride" in key_norm and numeric > 150))
            )
    return facts


def _evaluate_condition(condition: str, facts: dict[str, Any]) -> bool:
    normal = normalize_term(condition)
    if "upper_heat_lower_cold_both_present" in normal:
        return bool(facts.get("upper_heat") and facts.get("lower_cold"))
    if "upper_heat_flag_true_and_lower_cold_flag_true" in normal:
        return bool(facts.get("upper_heat_flag") and facts.get("lower_cold_flag"))
    if "age_40_plus_true_and_central_weight_gain_true_and_sleep_poor_true" in normal:
        return bool(facts.get("age_40_plus") and facts.get("central_weight_gain") and facts.get("sleep_poor"))
    if "blood_stasis_signs" in normal:
        return bool(facts.get("blood_stasis_signs"))
    if "five_element_node_fire_pathology" in normal:
        return bool(
            facts.get("five_element_node_fire_pathology")
            and facts.get("five_element_node_earth_pathology")
            and facts.get("five_element_node_metal_pathology")
        )
    if "lower_dantian_decoupled" in normal:
        return bool(facts.get("lower_dantian_decoupled"))
    if normal.startswith("organ_removed") or "organ_removed" in normal:
        return bool(facts.get("organ_removed"))
    if normal.startswith("biofilm_suspected"):
        return bool(facts.get("biofilm_suspected"))
    if "jueyin_depletion_detected" in normal:
        return bool(facts.get("jueyin_depletion_detected") and facts.get("yang_recovery_tempting"))
    if "berberine_switch" in normal and "reassess_day_3_to_7" in normal:
        return bool(facts.get("berberine_switch") and facts.get("reassess_day_3_to_7"))
    if "stasis_confidence_high" in normal:
        return bool(facts.get("stasis_confidence_high") and facts.get("pain_worse_at_rest"))

    or_groups = re.split(r"\s+OR\s+", condition, flags=re.IGNORECASE)
    return any(_evaluate_and_group(group, facts) for group in or_groups)


def _evaluate_and_group(group: str, facts: dict[str, Any]) -> bool:
    atoms = re.split(r"\s+AND\s+", group, flags=re.IGNORECASE)
    return all(_evaluate_atom(atom, facts) for atom in atoms if atom.strip())


def _evaluate_atom(atom: str, facts: dict[str, Any]) -> bool:
    atom = atom.strip().strip("()")
    if not atom:
        return True
    match = re.match(r"(.+?)\s*=\s*(true|false|high)\b", atom, flags=re.IGNORECASE)
    if match:
        key = normalize_term(match.group(1))
        expected = normalize_term(match.group(2))
        if expected == "true":
            return bool(facts.get(key))
        if expected == "false":
            return not bool(facts.get(key))
        if expected == "high":
            return bool(facts.get(f"{key}_high"))
    return bool(facts.get(normalize_term(atom)))


def _parse_action(action: str) -> dict[str, Any]:
    out = {
        "exclusions": [],
        "avoid_categories": [],
        "required_framing": [],
        "cautions": [],
        "modifiers": {},
    }
    for part in [piece.strip() for piece in action.split(";") if piece.strip()]:
        normal = normalize_term(part)
        if part.lower().startswith(("exclude:", "remove:")):
            names = part.split(":", 1)[1]
            out["exclusions"].extend(_split_names(names))
        if normal.startswith("avoid_"):
            out["avoid_categories"].append(normal.replace("avoid_", ""))
        if "avoid_warming" in normal:
            out["avoid_categories"].append("warming")
        if "avoid_cold" in normal:
            out["avoid_categories"].append("cold_only")
        if "do_not_recommend_fat_loss_protocol" in normal or "fat_loss_protocol" in normal:
            out["avoid_categories"].append("fat_loss_protocol")
        if "avoid_aggressive_hiit" in normal:
            out["avoid_categories"].append("aggressive_hiit")
        if "avoid_caloric_restriction" in normal:
            out["avoid_categories"].append("caloric_restriction")
        if "avoid_cryolipolysis" in normal:
            out["avoid_categories"].append("cryolipolysis")
        if "no_aggressive_yang_stimulation" in normal:
            out["avoid_categories"].append("aggressive_yang_stimulation")
        if "not_in_marketing_or_frontend_output" in normal:
            out["required_framing"].append("clinical_backend_only")
        if "refer_to_appropriate_specialist" in normal:
            out["required_framing"].append("specialist_referral")
        if "do_not_treat_all_symptoms_simultaneously" in normal:
            out["cautions"].append("root_element_before_symptom_suppression")
        if "treat_lower_burner_first" in normal or "do_not_address_upper_heat_directly" in normal:
            out["cautions"].append("restore_lower_root_before_upper_heat")
        if "turn_berberine_off" in normal:
            out["avoid_categories"].append("berberine")
            out["modifiers"]["berberine"] = "off"
        if "activate_berberine_on" in normal:
            out["modifiers"]["berberine"] = "on"
        if "reduce_formula_complexity" in normal:
            out["cautions"].append("reduce_formula_complexity")
        if "specialist_review" in normal:
            out["required_framing"].append("specialist_review")
        if "supportive_pain_modulation_only" in normal:
            out["required_framing"].append("supportive_pain_modulation_only")
        if "no_disease_treatment_claim" in normal:
            out["required_framing"].append("no_disease_treatment_claim")
        if "always_adjunctive_to_oncology" in normal:
            out["required_framing"].append("always_adjunctive_to_oncology")
        if "antibiotics_primary" in normal:
            out["required_framing"].append("conventional_care_primary")
    return out


def _split_names(value: str) -> list[str]:
    cleaned = re.sub(r"\([^)]*\)", "", value)
    return [name.strip() for name in cleaned.split(",") if name.strip()]


def _severity(condition: str, action: str) -> str:
    normal = normalize_term(f"{condition} {action}")
    if any(marker in normal for marker in ("pregnancy", "active_cancer", "acute_inflammatory_flare", "antibiotics_primary")):
        return "hard_override"
    if any(marker in normal for marker in ("exclude", "avoid", "turn_berberine_off")):
        return "override"
    return "caution"


def _truthy(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    normal = normalize_term(value)
    return normal in {"true", "yes", "y", "1", "high", "elevated", "positive", "present", "on"}


def _as_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
