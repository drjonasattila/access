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

    def test_batch2_metabolic_onboarding_and_restoration_metrics(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Visceral Obesity / Central Weight Gain (40+)"],
                "symptoms": ["central weight gain", "poor sleep quality", "fatigue", "low back pain"],
                "flags": {"age_40_plus_flag": True, "central_weight_gain": True, "circadian_drift_flag": True},
            }
        )
        names = [score.name for score in result.patterns[:4]]
        self.assertIn("metabolic_rhythm_disruption", names)
        self.assertIn("fat_loss_protocol", result.safety.avoid_categories)
        self.assertTrue(result.onboarding)
        self.assertTrue(result.onboarding[0].eligible)
        self.assertIn("sleep_quality", result.restoration.success_metrics)

    def test_batch2_cold_heat_complex_restores_lower_first(self) -> None:
        result = self.engine.evaluate(
            {
                "symptoms": ["cold pelvis", "cold lower extremities", "palpitations", "insomnia", "low libido"],
                "flags": {"heat_upper_body_flag": True, "cold_lower_body_flag": True},
            }
        )
        names = [score.name for score in result.patterns[:4]]
        self.assertIn("cold_heat_complex", names)
        self.assertIn("restore_lower_root_before_upper_heat", result.safety.cautions)
        self.assertIn("do_not_attack_upper_heat_first", result.restoration.avoid_first)
        self.assertTrue(any(transition.stage == "lower_dantian_freeze" for transition in result.state_transitions))

    def test_batch2_five_element_destroying_cycle_graph(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Migraine", "CRPS (neuroinflammatory subtype)", "Peripheral Neuropathy / Chronic Fatigue"],
                "flags": {
                    "five_element_node_FIRE_pathology": True,
                    "five_element_node_EARTH_pathology": True,
                    "five_element_node_METAL_pathology": True,
                },
            }
        )
        self.assertEqual(result.graph.root_nodes[:1], ["FIRE"])
        self.assertTrue(result.graph.pathological_cycles)
        self.assertIn("root_element_before_symptom_suppression", result.safety.cautions)
        self.assertIn("graph", result.llm_context)

    def test_ui_architecture_stays_out_of_pattern_scores(self) -> None:
        result = self.engine.evaluate({"symptoms": ["conference mode canvas overlay layers"]})
        names = [score.name for score in result.patterns]
        self.assertNotIn("five_element_generating_cycle_intact", names)
        self.assertNotIn("five_element_controlling_cycle", names)
        self.assertIn("ui_architecture_spec", result.graph.ui_payload)


if __name__ == "__main__":
    unittest.main()
