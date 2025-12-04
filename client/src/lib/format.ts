import { format, formatDistanceToNow } from "date-fns";
import { POSITION_STATUSES } from "@shared/constants";
import type { PositionStatus } from "@shared/constants";

const statusLookup = Object.fromEntries(
  POSITION_STATUSES.map((status) => [status.value, status]),
) as Record<PositionStatus, (typeof POSITION_STATUSES)[number]>;

const statusAccentMap: Record<PositionStatus, string> = {
  sourcing: "bg-sky-50 text-sky-700 border-sky-100",
  screening: "bg-cyan-50 text-cyan-700 border-cyan-100",
  interview: "bg-amber-50 text-amber-700 border-amber-100",
  offer: "bg-violet-50 text-violet-700 border-violet-100",
  hired: "bg-emerald-50 text-emerald-700 border-emerald-100",
  on_hold: "bg-zinc-50 text-zinc-700 border-zinc-100",
};

export const formatStatusLabel = (status: PositionStatus) => statusLookup[status]?.label ?? status;

export const statusAccentClass = (status: PositionStatus) =>
  statusAccentMap[status] ?? "bg-slate-50 text-slate-700 border-slate-100";

export const formatDate = (value: string) => format(new Date(value), "dd MMM, yyyy");

export const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true });
