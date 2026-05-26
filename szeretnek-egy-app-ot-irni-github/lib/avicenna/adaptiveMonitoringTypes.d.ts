export type HydrationTerrain = "dry" | "balanced" | "damp";
export type ThermalTendency = "cold" | "neutral" | "heat";
export type EnergeticReserve = "depleted" | "stable" | "overcharged";
export type NervousSystemState = "collapsed" | "stable" | "hyperexcitable";
export type FascialTensionState = "relaxed" | "stagnant" | "locked";
export type AutonomicStability = "stable" | "unstable";

export interface AdaptiveMonitoringRawInput {
  symptoms?: string[];
  goals?: string[];
  user_goals?: string[];
  interventions?: string[];
  interventions_used?: string[];
  safety_flags?: string[];
  free_text?: string;
  notes?: string;
  terrain_notes?: string;
  device_data?: Record<string, unknown>;
  raman_data?: Record<string, unknown>;
}

export interface ExtractedFeature {
  id: string;
  label: string;
  interpreted_as: string;
  evidence: string[];
}

export interface TerrainDimensions {
  hydration: HydrationTerrain;
  thermal_tendency: ThermalTendency;
  energetic_reserve: EnergeticReserve;
  nervous_system: NervousSystemState;
  fascial_tension: FascialTensionState;
  autonomic_stability: AutonomicStability;
}

export interface InterventionRisk {
  id?: string;
  label?: string;
  risk?: string;
}

export interface UnresolvedUncertainty {
  id: string;
  label: string;
  question: string;
}

export type MonitoringFieldType = "scale" | "quantity" | "intervention_log" | "text" | "boolean";

export interface GeneratedMonitoringField {
  id: string;
  label: string;
  type: MonitoringFieldType;
  scale?: string;
  unit?: string;
  prompt: string;
  cadence: "daily" | "each use" | "weekly" | "as needed";
  required: boolean;
}

export interface EducationalSummary {
  headline: string;
  interpretation: string;
  monitoring_focus: string;
  validation_note: "Human professional validation is advised.";
}

export interface AdaptiveMonitoringSchema {
  version: "adaptive-monitoring-v1";
  disease_independent: true;
  flow: [
    "raw_input",
    "feature_extraction",
    "terrain_dimensions",
    "adaptive_questions",
    "generated_monitoring_schema",
    "educational_summary"
  ];
  raw_input: AdaptiveMonitoringRawInput;
  extracted_features: ExtractedFeature[];
  terrain_dimensions: TerrainDimensions;
  symptom_clusters: string[];
  unresolved_uncertainty: UnresolvedUncertainty[];
  intervention_risks: string[];
  user_goals: string[];
  adaptive_questions: string[];
  monitoring_schema: {
    fields: GeneratedMonitoringField[];
    generated_from: {
      terrain_dimensions: TerrainDimensions;
      symptom_clusters: string[];
      unresolved_uncertainty: string[];
      intervention_risks: string[];
      user_goals: string[];
    };
  };
  educational_summary: EducationalSummary;
  evidence: string[];
}

export function generateAdaptiveMonitoringSchema(
  rawInput?: AdaptiveMonitoringRawInput
): AdaptiveMonitoringSchema;
