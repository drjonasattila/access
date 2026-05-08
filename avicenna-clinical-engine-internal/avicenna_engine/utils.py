from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable, Iterator, Mapping
from typing import Any


STOPWORDS = {
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "of",
    "or",
    "the",
    "to",
    "with",
    "without",
    "plus",
    "minus",
    "true",
    "false",
}


SYNONYM_EXPANSIONS = {
    "ibs": ["irritable bowel syndrome", "bowel pattern changes", "alternating constipation diarrhoea"],
    "me_cfs": ["chronic fatigue syndrome", "post viral fatigue"],
    "long_covid": ["post viral fatigue", "post viral dysautonomia"],
    "tachycardia": ["palpitations", "unexplained tachycardia"],
    "pelvic_pain": ["chronic pelvic pain", "cold sensation lower abdomen", "sacral lumbar pain"],
    "burnout": ["long term burnout", "fatigue", "deep yin exhaustion"],
}


def strip_accents(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def normalize_term(value: Any) -> str:
    """Return a stable snake_case-ish token for loose symbolic matching."""
    text = strip_accents(str(value)).lower()
    text = text.replace("—", " ").replace("–", " ").replace("/", " ")
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return re.sub(r"_+", "_", text).strip("_")


def words(value: Any) -> set[str]:
    token = normalize_term(value)
    return {part for part in token.split("_") if part and part not in STOPWORDS}


def humanize_token(value: str) -> str:
    return normalize_term(value).replace("_", " ")


def flatten_strings(value: Any, path: str = "") -> Iterator[tuple[str, str]]:
    """Yield string-like leaves from nested JSON while preserving a dotted path."""
    if value is None:
        return
    if isinstance(value, str):
        yield path, value
        return
    if isinstance(value, bool):
        yield path, str(value).lower()
        return
    if isinstance(value, (int, float)):
        yield path, str(value)
        return
    if isinstance(value, Mapping):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else str(key)
            yield from flatten_strings(child, child_path)
        return
    if isinstance(value, Iterable) and not isinstance(value, (bytes, bytearray)):
        for index, child in enumerate(value):
            child_path = f"{path}[{index}]" if path else f"[{index}]"
            yield from flatten_strings(child, child_path)


def unique_preserve(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        key = normalize_term(value)
        if key and key not in seen:
            seen.add(key)
            out.append(value)
    return out


def expand_terms(terms: Iterable[Any]) -> list[str]:
    expanded: list[str] = []
    for term in terms:
        if term is None:
            continue
        if isinstance(term, bool):
            continue
        text = str(term).strip()
        if not text:
            continue
        expanded.append(text)
        normal = normalize_term(text)
        expanded.extend(SYNONYM_EXPANSIONS.get(normal, []))
    return unique_preserve(expanded)


def match_strength(query: Any, candidate: Any) -> float:
    """Loose symbolic matcher.

    It rewards exact normalized matches, containment, and meaningful token overlap.
    It intentionally remains conservative for short fragments.
    """
    q_norm = normalize_term(query)
    c_norm = normalize_term(candidate)
    if not q_norm or not c_norm:
        return 0.0
    if q_norm == c_norm:
        return 1.0
    if len(q_norm) >= 5 and q_norm in c_norm:
        return 0.82
    if len(c_norm) >= 5 and c_norm in q_norm:
        return 0.76

    q_words = words(q_norm)
    c_words = words(c_norm)
    if not q_words or not c_words:
        return 0.0
    overlap = q_words & c_words
    if not overlap:
        return 0.0

    coverage = len(overlap) / max(len(q_words), len(c_words))
    query_coverage = len(overlap) / len(q_words)
    if coverage >= 0.66:
        return 0.72
    if query_coverage >= 0.75 and len(overlap) >= 2:
        return 0.64
    if len(overlap) >= 2 and coverage >= 0.35:
        return 0.42
    return 0.0


def text_contains_any(text: str, markers: Iterable[str]) -> bool:
    normal_text = normalize_term(text)
    return any(normalize_term(marker) in normal_text for marker in markers)

