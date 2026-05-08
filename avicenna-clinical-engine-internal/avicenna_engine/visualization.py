from __future__ import annotations

from .knowledge_base import KnowledgeBase


class VisualizationSpec:
    """Read-only access to UI architecture, intentionally outside clinical logic."""

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def payload(self) -> dict:
        return {
            "ui_architecture_spec": self.kb.ui_architecture_spec,
            "five_element_node_panel_data": self.kb.five_element_node_panel_data,
            "metabolic_rhythm_card": self.kb.metabolic_rhythm_card,
        }

