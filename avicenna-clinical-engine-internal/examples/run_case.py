from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from avicenna_engine import AvicennaClinicalEngine


engine = AvicennaClinicalEngine.from_json()

case = {
    "diagnoses": ["Chronic Pelvic Pain", "Irritable Bowel Syndrome (IBS)"],
    "symptoms": [
        "cold sensation lower abdomen",
        "worse cold better heat",
        "urinary frequency",
        "palpitations",
        "insomnia",
        "bloating",
    ],
    "observations": {
        "thermal_sensation": "upper heat with lower cold",
        "response_to_heat": "better",
        "tongue_coating": "white",
    },
    "flags": {
        "digestive_sensitivity_flag": True,
    },
}

result = engine.evaluate(case)
print(json.dumps(result.to_dict(), indent=2))

batch2_case = {
    "diagnoses": ["Visceral Obesity / Central Weight Gain (40+)"],
    "symptoms": ["central weight gain", "poor sleep quality", "fatigue", "low back pain"],
    "flags": {
        "age_40_plus_flag": True,
        "central_weight_gain": True,
        "circadian_drift_flag": True,
    },
}

batch2_result = engine.evaluate(batch2_case)
print(json.dumps(batch2_result.to_dict()["onboarding"], indent=2))
print(json.dumps(batch2_result.to_dict()["restoration"], indent=2))
