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
