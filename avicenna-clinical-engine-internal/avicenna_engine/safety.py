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
DANGEROUS_MOLECULES = ["DMSO", "EDTA", "methylene blue", "ozone", "CDS", "chlorine dioxide"]
GUT_RELAPSE_MARKERS = ["constipation", "bloating", "reflux", "sleep fragmentation", "emotional overload"]
SIDE_EFFECT_MARKERS = ["fatigue", "cognitive dulling", "dose escalation", "side effects increasing"]
RED_FLAG_MARKERS = ["rapid motor loss", "severe trophic skin changes", "suicidal ideation", "uncontrolled infection"]


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
        facts["digestive_sensitivity"] = facts.get("digestive_sensitivity", False) or facts.get("digestive_sensitivity_flag", False)
        facts["fatigue"] = facts.get("fatigue", False) or text_contains_any(text, ["fatigue", "chronic fatigue", "low energy"])
        facts["current_medications"] = _current_medications(case)
        facts["crps_type"] = normalize_term(case.observations.get("crps_type") or case.flags.get("crps_type") or "")
        facts["dominant_layer"] = normalize_term(case.observations.get("dominant_layer") or case.flags.get("dominant_layer") or "")
        facts["pain_character"] = normalize_term(case.observations.get("pain_character") or case.flags.get("pain_character") or "")
        facts["tens_response"] = normalize_term(case.observations.get("tens_response") or case.flags.get("tens_response") or "")
        facts["medication_exit_trigger_count"] = _as_float(
            case.observations.get("medication_exit_trigger_count") or case.flags.get("medication_exit_trigger_count")
        ) or 0
        facts["gut_symptoms_count"] = _count_markers(case, GUT_RELAPSE_MARKERS)
        facts["digestive_flow_impaired"] = facts.get("digestive_flow_impaired", False) or text_contains_any(
            text, ["slow digestion", "poor elimination", "sluggish GI transit", "constipation", "bloating"]
        )
        facts["side_effects_present"] = facts.get("side_effects_present", False) or text_contains_any(text, SIDE_EFFECT_MARKERS)
        facts["red_flags_present"] = facts.get("red_flags_present", False) or text_contains_any(text, RED_FLAG_MARKERS)
        facts["user_searches_dangerous_molecule"] = text_contains_any(text, DANGEROUS_MOLECULES)
        facts["tens_only_while_on"] = facts.get("tens_only_while_on", False) or (
            "only" in facts["tens_response"] and "on" in facts["tens_response"]
        )
        facts["post_viral"] = facts.get("post_viral", False) or text_contains_any(text, ["post viral", "post-viral", "long covid"])
        facts["resilience_low"] = facts.get("resilience_low", False) or text_contains_any(text, ["low resilience", "poor recovery"])
        facts["dryness"] = facts.get("dryness", False) or text_contains_any(text, ["dryness", "dry", "brittle nails"])
        facts["brittle_nails"] = facts.get("brittle_nails", False) or text_contains_any(text, ["brittle nails"])
        facts["pallor"] = facts.get("pallor", False) or text_contains_any(text, ["pallor", "pale"])
        facts["oxidative_sensitivity"] = facts.get("oxidative_sensitivity", False) or text_contains_any(text, ["oxidative sensitivity"])
        facts["yin_deficiency"] = facts.get("yin_deficiency", False) or text_contains_any(text, ["yin deficiency", "dryness", "poor recovery"])
        facts["laser_available"] = facts.get("laser_available", False) or text_contains_any(text, ["laser available", "summus"])
        facts["dampness_pattern"] = facts.get("dampness_pattern", False) or text_contains_any(
            text, ["dampness", "heaviness", "sluggish gi", "poor elimination"]
        )
        facts["paradox_hyperalgesia"] = facts.get("paradox_hyperalgesia", False) or text_contains_any(text, ["paradox hyperalgesia"])
        facts["gi_slowing"] = facts.get("gi_slowing", False) or text_contains_any(text, ["gi slowing", "constipation", "sluggish gi"])
        facts["emotional_flattening"] = facts.get("emotional_flattening", False) or text_contains_any(text, ["emotional flattening"])
        facts["crps_returning_post_treatment"] = facts.get("crps_returning_post_treatment", False) or text_contains_any(
            text, ["crps returning post treatment", "ketamine relief fades", "relief fades rapidly"]
        )
        facts["inflammation_reduced_but_crps_persists"] = facts.get("inflammation_reduced_but_crps_persists", False) or text_contains_any(
            text, ["inflammation reduced but crps persists"]
        )
        facts["dose_escalating"] = facts.get("dose_escalating", False) or text_contains_any(text, ["dose escalating", "dose escalation"])

        top_names = {score.name for score in patterns if score.confidence >= 0.35}
        facts["jueyin_depletion_detected"] = "jueyin_depletion" in top_names or text_contains_any(text, ["jueyin depletion"])
        facts["mitochondrial_decoherence"] = "mitochondrial_decoherence" in top_names or text_contains_any(
            text, ["mitochondrial decoherence", "mitochondrial field collapse"]
        )
        facts["dampness_pattern"] = facts.get("dampness_pattern", False) or "dampness_biofilm" in top_names
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
    meds = set(facts.get("current_medications") or [])
    if "crps_type_crps_i" in normal:
        return facts.get("crps_type") == "crps_i"
    if "crps_type_crps_ii" in normal:
        return facts.get("crps_type") == "crps_ii"
    if "dominant_layer_mixed_or_pain_character_fluctuating" in normal:
        return facts.get("dominant_layer") == "mixed" or facts.get("pain_character") == "fluctuating"
    if normal == "dominant_layer_mixed":
        return facts.get("dominant_layer") == "mixed"
    if "gut_symptoms_2" in normal:
        return facts.get("gut_symptoms_count", 0) >= 2
    if "medication_exit_trigger_count_2" in normal:
        return facts.get("medication_exit_trigger_count", 0) >= 2
    if "current_medication_gabapentin" in normal or "pregabalin_and_side_effects_present" in normal:
        return bool({"gabapentin", "pregabalin"} & meds and facts.get("side_effects_present"))
    if "current_medication_opioid" in normal:
        return bool("opioid" in meds and (facts.get("paradox_hyperalgesia") or facts.get("gi_slowing") or facts.get("emotional_flattening")))
    if "current_medication_ketamine" in normal:
        return bool("ketamine" in meds and facts.get("crps_returning_post_treatment"))
    if "current_medication_nsaid" in normal or "steroid_and_inflammation" in normal:
        return bool(({"nsaid", "nsaids", "steroid", "steroids"} & meds) and facts.get("inflammation_reduced_but_crps_persists"))
    if "tens_helps_only_while_device_is_on" in normal:
        return bool(facts.get("tens_only_while_on"))
    if "red_flags_present" in normal:
        return bool(facts.get("red_flags_present"))
    if "fatigue_true_and_post_viral_true_and_resilience_low" in normal:
        return bool(facts.get("fatigue") and facts.get("post_viral") and facts.get("resilience_low"))
    if "presentation_dryness_and_brittle_nails_true_and_pallor_true" in normal:
        return bool(facts.get("dryness") and facts.get("brittle_nails") and facts.get("pallor"))
    if "oxidative_sensitivity_true" in normal:
        return bool(facts.get("oxidative_sensitivity"))
    if "mitochondrial_decoherence_true_and_yin_deficiency_true" in normal:
        return bool(facts.get("mitochondrial_decoherence") and facts.get("yin_deficiency"))
    if "laser_available" in normal:
        return bool(facts.get("laser_available"))
    if "dampness_pattern_true" in normal:
        return bool(facts.get("dampness_pattern"))
    if "user_searches_for_dmso_edta_methylene_blue_ozone_cds" in normal:
        return bool(facts.get("user_searches_dangerous_molecule"))
    if "carbamazepine_dose_escalating" in normal:
        return bool("carbamazepine" in meds and facts.get("dose_escalating"))
    if "pregabalin_prescribed" in normal:
        return bool("pregabalin" in meds)
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
        if "block_proselect" in normal:
            out["avoid_categories"].append("nerve_suppressive_escalation")
            out["cautions"].append("tissue_before_nerve")
        if "do_not_escalate_tens" in normal or "avoid_overstimulation" in normal:
            out["avoid_categories"].append("tens_escalation")
            out["cautions"].append("bridge_tool_only")
        if "do_not_recommend_the_searched_substance" in normal:
            out["avoid_categories"].append("dangerous_molecules")
            out["required_framing"].append("educational_only_redirect_to_safer_support")
        if "refer_escalate_immediately" in normal:
            out["required_framing"].append("urgent_medical_escalation")
        if "never_abrupt" in normal or "slow_taper" in normal or "medication_exit" in normal:
            out["cautions"].append("no_abrupt_medication_discontinuation")
        if "gut_before_escalating" in normal or "gut_digestion_first" in normal:
            out["cautions"].append("gut_first_before_advanced_modulation")
        if "reduce_protocol_complexity" in normal or "avoid_layering" in normal:
            out["cautions"].append("reduce_protocol_complexity")
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
    if any(
        marker in normal
        for marker in (
            "pregnancy",
            "active_cancer",
            "acute_inflammatory_flare",
            "antibiotics_primary",
            "red_flags",
            "dangerous_molecules",
            "do_not_recommend",
        )
    ):
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


def _current_medications(case: EngineInput) -> list[str]:
    values: list[Any] = []
    for source in (case.observations, case.flags):
        for key in ("current_medications", "current_medication", "medications", "medication"):
            if key in source:
                values.append(source[key])
    out: list[str] = []
    for value in values:
        if isinstance(value, str):
            parts = re.split(r"[,/;+]", value)
        elif isinstance(value, (list, tuple, set)):
            parts = [str(item) for item in value]
        else:
            parts = [str(value)]
        for part in parts:
            normal = normalize_term(part)
            if normal:
                out.append(normal)
    return unique_preserve(out)


def _count_markers(case: EngineInput, markers: list[str]) -> int:
    text = case.all_text()
    return sum(1 for marker in markers if text_contains_any(text, [marker]))
