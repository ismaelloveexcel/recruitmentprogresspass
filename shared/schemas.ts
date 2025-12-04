import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  PANEL_DECISIONS,
  PASS_PRIORITIES,
  POSITION_STATUSES,
  type PanelDecision,
  type PassPriority,
  type PositionStatus,
} from "./constants";

const statusValues = POSITION_STATUSES.map((status) => status.value) as [
  PositionStatus,
  ...PositionStatus[],
];
const priorityValues = Object.keys(PASS_PRIORITIES) as [PassPriority, ...PassPriority[]];
const decisionValues = Object.keys(PANEL_DECISIONS) as [PanelDecision, ...PanelDecision[]];

export const passFilterSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, "Search input is capped to protect the API")
    .optional(),
  status: z.union([z.literal("all"), z.enum(statusValues)]).optional(),
  priority: z.union([z.literal("all"), z.enum(priorityValues)]).optional(),
  owner: z.string().trim().optional(),
  department: z.string().trim().optional(),
  limit: z
    .number()
    .int()
    .positive()
    .max(40, "We cap pages to avoid massive payloads")
    .optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const statusUpdateSchema = z.object({
  passId: z.string().min(1),
  positionId: z.string().min(1),
  status: z.enum(statusValues),
  note: z.string().trim().max(400).optional(),
});

export const feedbackSchema = z.object({
  passId: z.string().min(1),
  positionId: z.string().min(1),
  panelist: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }),
  highlights: z.string().min(10).max(500),
  concerns: z.string().max(500).optional(),
  decision: z.enum(decisionValues),
  score: z.number().min(1).max(5),
  nextStep: z.string().max(180).optional(),
});

export type PassFilterInput = z.infer<typeof passFilterSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
