from __future__ import annotations

from collections import defaultdict, deque
from typing import Any

from .knowledge_base import KnowledgeBase
from .models import EngineInput, GraphActivation, GraphAnalysis, GraphEdge, PatternScore
from .utils import match_strength, normalize_term, unique_preserve


ELEMENTS = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"]
GENERATING_CYCLE = ["WOOD", "FIRE", "EARTH", "METAL", "WATER", "WOOD"]
CONTROLLING_CYCLE = ["WOOD", "EARTH", "WATER", "FIRE", "METAL", "WOOD"]
DESTROYING_CYCLE = ["FIRE", "EARTH", "METAL", "WATER", "WOOD", "FIRE"]


class FiveElementGraphEngine:
    """Graph reasoning layer, separate from UI canvas specifications."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base
        self.edges = self._build_edges()

    def analyze(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> GraphAnalysis:
        activations = self._activate_nodes(case, patterns, facts)
        active_nodes = [activation.node for activation in activations if activation.activation > 0]
        root_nodes = self._root_nodes(active_nodes)
        downstream = self._reachable(root_nodes, "destroying") if root_nodes else []
        upstream = self._upstream(active_nodes, "destroying")
        cascades = self._cascade_predictions(root_nodes, active_nodes)
        pathological_cycles = []

        if {"FIRE", "EARTH", "METAL"}.issubset(set(active_nodes)):
            pathological_cycles.append(
                "FIRE -> EARTH -> METAL destroying-cycle activation may reflect neural overactivity, neuroinflammatory load, and mitochondrial collapse."
            )
        if len(active_nodes) >= 3 and self._has_destroying_chain(active_nodes):
            pathological_cycles.append("Multiple active nodes align with a pathological cascade; prioritize root-node stabilization.")

        return GraphAnalysis(
            active_nodes=activations,
            edges=self.edges,
            root_nodes=root_nodes,
            upstream_nodes=upstream,
            downstream_nodes=downstream,
            cascade_predictions=cascades,
            pathological_cycles=unique_preserve(pathological_cycles),
            ui_payload=self._ui_payload(),
        )

    def _build_edges(self) -> list[GraphEdge]:
        edges: list[GraphEdge] = []
        edges.extend(_cycle_edges(GENERATING_CYCLE, "generating"))
        edges.extend(_cycle_edges(CONTROLLING_CYCLE, "controlling"))
        edges.extend(_cycle_edges(DESTROYING_CYCLE, "destroying"))

        controlling = self.kb.pattern("five_element_controlling_cycle")
        for pair in controlling.get("controlling_pairs", []) or []:
            edges.append(
                GraphEdge(
                    source=str(pair.get("controller", "")),
                    target=str(pair.get("controlled", "")),
                    relationship="controlling",
                    mechanism=str(pair.get("mechanism", "")),
                    label=str(pair.get("label", "")),
                )
            )
        return _dedupe_edges(edges)

    def _activate_nodes(self, case: EngineInput, patterns: list[PatternScore], facts: dict[str, Any]) -> list[GraphActivation]:
        terms = case.all_terms()
        panel_nodes = self.kb.five_element_node_panel_data.get("nodes", {})
        evidence_by_node: dict[str, list[str]] = defaultdict(list)
        raw: dict[str, float] = defaultdict(float)

        requested = case.observations.get("five_element_node_affected") or case.flags.get("five_element_node_affected")
        if requested:
            for node in _coerce_nodes(requested):
                raw[node] += 2.0
                evidence_by_node[node].append("explicit five_element_node_affected input")

        for key, value in facts.items():
            if value and key.startswith("five_element_node_") and key.endswith("_pathology"):
                node = key.replace("five_element_node_", "").replace("_pathology", "").upper()
                raw[node] += 1.6
                evidence_by_node[node].append(key)

        for node, payload in panel_nodes.items():
            for syndrome in payload.get("typical_syndromes", []) or []:
                strength = max((match_strength(term, syndrome) for term in terms), default=0.0)
                if strength:
                    raw[node] += strength
                    evidence_by_node[node].append(str(syndrome))
            correlate = payload.get("neuro_pain_correlate", "")
            strength = max((match_strength(term, correlate) for term in terms), default=0.0)
            if strength:
                raw[node] += 0.7 * strength
                evidence_by_node[node].append(str(correlate))

        for score in patterns:
            if score.name == "five_element_destroying_cycle":
                for node in self._nodes_from_evidence(score):
                    raw[node] += 0.45 * score.confidence
                    evidence_by_node[node].append("five_element_destroying_cycle pattern")

        total = sum(raw.values()) or 1.0
        activations: list[GraphActivation] = []
        for node, weight in sorted(raw.items(), key=lambda item: item[1], reverse=True):
            payload = panel_nodes.get(node, {})
            activations.append(
                GraphActivation(
                    node=node,
                    activation=min(1.0, weight / total if total > weight else weight / max(weight, 1.0)),
                    evidence=unique_preserve(evidence_by_node[node])[:6],
                    clinical_correlates=list(payload.get("typical_syndromes") or []),
                )
            )
        return activations

    def _nodes_from_evidence(self, score: PatternScore) -> list[str]:
        found = []
        for evidence in score.evidence:
            normal = normalize_term(evidence.value)
            for node in ELEMENTS:
                if normalize_term(node) in normal:
                    found.append(node)
        return unique_preserve(found)

    def _root_nodes(self, active_nodes: list[str]) -> list[str]:
        if not active_nodes:
            return []
        active = set(active_nodes)
        roots = []
        for node in active_nodes:
            incoming_active = [
                edge.source
                for edge in self.edges
                if edge.relationship == "destroying" and edge.target == node and edge.source in active
            ]
            if not incoming_active:
                roots.append(node)
        return roots or [active_nodes[0]]

    def _reachable(self, roots: list[str], relationship: str) -> list[str]:
        adjacency: dict[str, list[str]] = defaultdict(list)
        for edge in self.edges:
            if edge.relationship == relationship:
                adjacency[edge.source].append(edge.target)
        out: list[str] = []
        queue: deque[str] = deque(roots)
        seen = set(roots)
        while queue:
            node = queue.popleft()
            for target in adjacency.get(node, []):
                if target in seen:
                    continue
                seen.add(target)
                out.append(target)
                queue.append(target)
        return out

    def _upstream(self, active_nodes: list[str], relationship: str) -> list[str]:
        active = set(active_nodes)
        upstream = []
        for edge in self.edges:
            if edge.relationship == relationship and edge.target in active and edge.source not in active:
                upstream.append(edge.source)
        return unique_preserve(upstream)

    def _cascade_predictions(self, roots: list[str], active_nodes: list[str]) -> list[str]:
        if not roots:
            return []
        predictions = []
        active = set(active_nodes)
        for root in roots:
            chain = [root] + self._reachable([root], "destroying")[:2]
            missing = [node for node in chain if node not in active]
            if missing:
                predictions.append(
                    f"{root} root activation could spread through the destroying cycle toward {' -> '.join(missing)} if not stabilized."
                )
        return predictions

    def _has_destroying_chain(self, active_nodes: list[str]) -> bool:
        active = set(active_nodes)
        return any(edge.source in active and edge.target in active for edge in self.edges if edge.relationship == "destroying")

    def _ui_payload(self) -> dict[str, Any]:
        return {
            "node_panel_data": self.kb.five_element_node_panel_data,
            "ui_architecture_spec": self.kb.ui_architecture_spec,
        }


def _cycle_edges(cycle: list[str], relationship: str) -> list[GraphEdge]:
    return [
        GraphEdge(source=cycle[index], target=cycle[index + 1], relationship=relationship)
        for index in range(len(cycle) - 1)
    ]


def _dedupe_edges(edges: list[GraphEdge]) -> list[GraphEdge]:
    seen: set[tuple[str, str, str, str]] = set()
    out: list[GraphEdge] = []
    for edge in edges:
        key = (edge.source, edge.target, edge.relationship, edge.mechanism)
        if key in seen:
            continue
        seen.add(key)
        out.append(edge)
    return out


def _coerce_nodes(value: Any) -> list[str]:
    if isinstance(value, str):
        raw = [part.strip() for part in value.replace("/", ",").split(",")]
    elif isinstance(value, (list, tuple, set)):
        raw = [str(item).strip() for item in value]
    else:
        raw = [str(value)]
    return [node.upper() for node in raw if node and node.upper() in ELEMENTS]

