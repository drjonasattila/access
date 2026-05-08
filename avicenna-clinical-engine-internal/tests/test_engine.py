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

    def test_batch3_tissue_before_nerve_blocks_early_nerve_suppression(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["CRPS I (Complex Regional Pain Syndrome Type I)"],
                "symptoms": ["fluctuating pain type", "swelling", "stiffness", "allodynia"],
                "observations": {"dominant_layer": "mixed", "pain_character": "fluctuating"},
            }
        )
        names = [score.name for score in result.patterns[:5]]
        self.assertIn("mixed_transitional", names)
        self.assertIn("nerve_suppressive_escalation", result.safety.avoid_categories)
        nerve_phase = next(phase for phase in result.stabilization.phases if phase.name == "reduce_neural_overfiring")
        self.assertEqual(nerve_phase.status, "blocked_until_stabilized")
        self.assertIn("tissue_before_nerve", nerve_phase.blocked_by)

    def test_batch3_dangerous_molecules_are_educational_only(self) -> None:
        result = self.engine.evaluate(
            {
                "free_text": "Patient is searching for DMSO and methylene blue for biofilm and energy problems.",
                "diagnoses": ["Chronic infection / biofilm states"],
            }
        )
        self.assertIn("dangerous_molecules", result.safety.avoid_categories)
        self.assertIn("educational_only_redirect_to_safer_support", result.safety.required_framing)
        molecules = {alert.molecule for alert in result.stabilization.dangerous_molecule_alerts}
        self.assertIn("DMSO", molecules)
        self.assertIn("Methylene Blue", molecules)

    def test_batch3_tens_relief_only_while_on_is_relapse_loop(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["CRPS I (Complex Regional Pain Syndrome Type I)"],
                "observations": {"tens_response": "helps only while device is ON"},
            }
        )
        self.assertIn("tens_escalation", result.safety.avoid_categories)
        self.assertTrue(any("TENS helps only" in loop.signal for loop in result.stabilization.relapse_loops))
        self.assertIn("fascia_ecm", [layer.name for layer in result.stabilization.dominant_layers])

    def test_batch3_medication_transition_is_never_abrupt(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Post-ketamine CRPS relapse"],
                "observations": {
                    "current_medications": ["ketamine"],
                    "medication_exit_trigger_count": 2,
                },
                "symptoms": ["ketamine relief fades rapidly", "CRPS returning post treatment"],
            }
        )
        self.assertIn("no_abrupt_medication_discontinuation", result.safety.cautions)
        self.assertTrue(result.stabilization.medication_transitions)
        transition = result.stabilization.medication_transitions[0]
        self.assertIn("never_abrupt_discontinuation", transition.safety_alerts)
        self.assertTrue(any("relief fades rapidly" in loop.signal for loop in result.stabilization.relapse_loops))

    def test_batch3_gut_first_deprioritizes_advanced_modulation(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Chronic infection / biofilm states"],
                "symptoms": ["constipation", "bloating", "reflux", "poor elimination", "fatigue"],
            }
        )
        self.assertIn("gut_first_before_advanced_modulation", result.safety.cautions)
        advanced = [phase for phase in result.stabilization.phases if phase.name in {"reduce_neural_overfiring", "targeted_modulation"}]
        self.assertTrue(all(phase.status in {"deprioritized", "blocked_until_stabilized"} for phase in advanced))
        self.assertIn("digestive_flow", result.stabilization.success_metrics)

    def test_batch4_spinal_red_flags_override_symbolic_reasoning(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Foraminal stenosis / central canal stenosis"],
                "symptoms": ["severe stenosis", "cord compression", "progressive neurological deficit"],
                "observations": {"spinal_level": "L1_L3"},
            }
        )
        self.assertTrue(result.spinal.referral_required)
        self.assertIn("severe stenosis", result.spinal.red_flags)
        self.assertIn("western_red_flag_primary", result.safety.required_framing)

    def test_batch4_early_facet_du_mai_stage_and_extension_guidance(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Facet joint pain (zygapophysial joint pain)"],
                "symptoms": ["pain worse on extension-rotation", "no leg radiation", "morning stiffness", "paraspinal muscle spasm"],
                "observations": {
                    "pain_location": "unilateral_paraspinal",
                    "degenerative_stage": "early",
                },
            }
        )
        self.assertTrue(result.spinal.active)
        self.assertEqual(result.spinal.degenerative_stage.pattern, "du_mai_yang_overload")
        self.assertIn("du_mai_yang_overload", result.spinal.probable_patterns)

    def test_batch4_segmental_liver_resonance_guides_overlay(self) -> None:
        result = self.engine.evaluate(
            {
                "symptoms": ["rib-radiating flank pain", "decision stress", "worsening with stress"],
                "observations": {
                    "spinal_level": "T7_T10",
                    "organ_resonance": "liver_gallbladder",
                },
            }
        )
        self.assertTrue(result.spinal.segmental_resonance)
        top = result.spinal.segmental_resonance[0]
        self.assertEqual(top.level, "T7-T10")
        self.assertEqual(top.organ, "Liver / Gallbladder")
        self.assertIn("T7-T10 organ resonance zone: Liver / Gallbladder", result.spinal.pbm_targets)

    def test_batch4_du_ren_collapse_prioritizes_anterior_chain(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Diastasis recti", "Gastro-oesophageal reflux (GERD)"],
                "symptoms": ["abdominal wall weakness", "reflux", "postural collapse", "hernia tendency"],
                "observations": {
                    "ren_mai_tone": "low",
                    "abdominal_wall_tone": "low",
                    "degenerative_stage": "intermediate",
                },
            }
        )
        self.assertTrue(result.spinal.du_ren_balance.anterior_chain_priority)
        self.assertIn("Ren/anterior chain support zone", result.spinal.pbm_targets)
        self.assertIn("anterior_chain_restoration_required", result.safety.cautions)

    def test_batch4_late_calcification_is_supportive_only(self) -> None:
        result = self.engine.evaluate(
            {
                "diagnoses": ["Osteophyte formation (spinal)", "Synovial cyst (spinal)"],
                "symptoms": ["osteophyte", "synovial cyst", "facet hypertrophy"],
                "observations": {"degenerative_stage": "late"},
            }
        )
        self.assertTrue(result.spinal.active)
        self.assertEqual(result.spinal.degenerative_stage.pattern, "yin_structure_calcification")
        self.assertIn("late_structural_stage_supportive_only", result.spinal.cautions)
        self.assertIn("structural_stage_supportive_only", result.safety.required_framing)


if __name__ == "__main__":
    unittest.main()
