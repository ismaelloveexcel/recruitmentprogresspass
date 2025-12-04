import type { PanelDecision, PassPriority, PositionStatus } from "./constants";

export type HealthSignal = "healthy" | "attention" | "critical";

export interface PanelMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  availability?: "available" | "ooo" | "limited";
}

export interface FeedbackEntry {
  id: string;
  positionId: string;
  panelist: PanelMember;
  decision: PanelDecision;
  highlights: string;
  concerns?: string;
  score: number;
  submittedAt: string;
  nextStep?: string;
}

export interface PositionRole {
  id: string;
  title: string;
  openings: number;
  status: PositionStatus;
  location: string;
  pipeline: Array<{ label: string; value: number }>;
  nextStep: string;
  hiringManager: string;
  panel: PanelMember[];
  feedback: FeedbackEntry[];
  lastUpdated: string;
  health: HealthSignal;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  status: PositionStatus;
  positionId: string;
  actor: string;
  label: string;
  notes?: string;
}

export interface RecruitmentPass {
  id: string;
  passNumber: string;
  owner: string;
  department: string;
  objective: string;
  createdAt: string;
  expiresOn: string;
  priority: PassPriority;
  progress: number;
  health: HealthSignal;
  watchers: string[];
  metrics: {
    totalCandidates: number;
    interviewsThisWeek: number;
    timeToFill: number;
    satisfaction: number;
  };
  positions: PositionRole[];
  statusHistory: ActivityEvent[];
}

export interface SummaryMetrics {
  totalPasses: number;
  activePositions: number;
  interviewsThisWeek: number;
  avgTimeToFill: number;
  satisfaction: number;
  riskCount: number;
  completedPasses: number;
  throughput: number;
  busiestDepartment: string;
  hasSlaRisk: boolean;
}

export interface PassFilter {
  search?: string;
  status?: PositionStatus | "all";
  priority?: PassPriority | "all";
  owner?: string;
  department?: string;
  limit?: number;
  offset?: number;
}

export interface PassCollection {
  items: RecruitmentPass[];
  total: number;
  nextOffset: number | null;
}

export interface TimelineInsight {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "flat";
  description: string;
}

export interface StatusUpdatePayload {
  passId: string;
  positionId: string;
  status: PositionStatus;
  note?: string;
}

export interface FeedbackPayload {
  passId: string;
  positionId: string;
  panelist: PanelMember;
  highlights: string;
  concerns?: string;
  decision: PanelDecision;
  score: number;
  nextStep?: string;
}
