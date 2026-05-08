from __future__ import annotations

import unittest

from avicenna_engine import AvicennaClinicalEngine
from avicenna_engine.llm_hooks import coerce_llm_payload


class AvicennaClinicalEngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = AvicennaClinicalEngine.from_json()

    def test_diagnosis_map_and_mixed_thermal_detection(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Irritable Bowel Syndrome (IBS)"],
                "symptoms": ["cold hands warm chest", "alternating constipation diarrhoea", "palpitations"],
            }
        )
        names = [score.name for score in result.patterns[:3]]
        self.assertIn("shaoyang_taiyin_dissonance", names)
        self.assertTrue(any(item.kind == "mixed_thermal_state" for item in result.contradictions))

    def test_pregnancy_rule_blocks_named_blood_movers(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Chronic Pelvic Pain"],
                "symptoms": ["cold pelvis", "menstrual cramps", "worse cold better heat"],
                "flags": {"pregnancy_flag": True},
            }
        )
        self.assertIn("Chuan Niu Xi", result.safety.exclusions)
        blocked_names = {candidate.name for candidate in result.interventions if candidate.status == "blocked_by_safety"}
        self.assertIn("Chuan Niu Xi", blocked_names)

    def test_active_cancer_forces_supportive_framing(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Pancreatic Cancer Pain"],
                "symptoms": ["cancer pain", "visceral pain", "fatigue"],
                "flags": {"active_cancer": True},
            }
        )
        self.assertIn("supportive_pain_modulation_only", result.safety.required_framing)
        self.assertIn("no_disease_treatment_claim", result.safety.required_framing)

    def test_inflammatory_flare_avoids_warming_protocol(self) -> None:
        result = self.engine.evaluate(
            {
                "symptoms": ["red swollen pelvic pain", "burning pain"],
                "labs": {"CRP": 18, "WBC": 13},
                "flags": {"acute_inflammatory_flare": True},
            }
        )
        self.assertTrue(any("acute_inflammatory_flare" in hit.condition for hit in result.safety.active_rules))
        self.assertIn("warming_protocol", result.safety.avoid_categories)

    def test_llm_payload_hook(self) -> None:
        case = coerce_llm_payload(
            {
                "free_text": "Wired tired insomnia with cold feet and warm head.",
                "symptoms": ["cold feet", "insomnia"],
                "flags": {"frailty_flag": False},
            }
        )
        result = self.engine.evaluate(case)
        self.assertTrue(result.patterns)
        self.assertIn("contract", result.llm_context)


if __name__ == "__main__":
    unittest.main()

