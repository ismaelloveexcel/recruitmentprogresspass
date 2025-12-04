export const POSITION_STATUSES = [
  { value: "sourcing", label: "Sourcing", accent: "sky", order: 1 },
  { value: "screening", label: "Screening", accent: "cyan", order: 2 },
  { value: "interview", label: "Interviews", accent: "amber", order: 3 },
  { value: "offer", label: "Offer", accent: "violet", order: 4 },
  { value: "hired", label: "Hired", accent: "emerald", order: 5 },
  { value: "on_hold", label: "On hold", accent: "zinc", order: 6 },
] as const;

export const PASS_PRIORITIES = {
  low: { label: "Low", accent: "emerald" },
  medium: { label: "Medium", accent: "amber" },
  high: { label: "High", accent: "rose" },
} as const;

export const PANEL_DECISIONS = {
  advance: { label: "Advance", color: "text-emerald-600" },
  hold: { label: "Hold", color: "text-amber-600" },
  reject: { label: "Reject", color: "text-rose-600" },
} as const;

export type PositionStatus = (typeof POSITION_STATUSES)[number]["value"];
export type PassPriority = keyof typeof PASS_PRIORITIES;
export type PanelDecision = keyof typeof PANEL_DECISIONS;

export const DEFAULT_PAGE_SIZE = 8;
