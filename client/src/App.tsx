import { useDeferredValue, useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity, AlertTriangle, ArrowUpRight, Clock3, Filter, Gauge, Search, Users } from "lucide-react";
import type {
  PassCollection,
  PassFilter,
  PositionRole,
  RecruitmentPass,
  SummaryMetrics,
  TimelineInsight,
} from "@shared/types";
import {
  POSITION_STATUSES,
  PASS_PRIORITIES,
  type PanelDecision,
  type PassPriority,
  type PositionStatus,
} from "@shared/constants";
import { formatDate, formatRelative, formatStatusLabel, statusAccentClass } from "./lib/format";
import { trpc } from "./lib/trpc";
import { Toaster, toast } from "sonner";
import "sonner/dist/index.css";

type FiltersState = {
  search: string;
  status: PassFilter["status"];
  priority: PassFilter["priority"];
};

const statusFilters = [{ value: "all", label: "All stages" }, ...POSITION_STATUSES];
const priorityFilters = [{ value: "all", label: "All priorities" }, ...Object.entries(PASS_PRIORITIES).map(([value, meta]) => ({ value, label: meta.label }))];

const formatPriorityBadge = (priority: keyof typeof PASS_PRIORITIES) => {
  const accent = PASS_PRIORITIES[priority].accent;
  const palette: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return palette[accent] ?? "bg-slate-50 text-slate-700 border-slate-100";
};

const KanbanIcon = (props: { size?: number; className?: string }) => (
  <svg
    width={props.size ?? 18}
    height={props.size ?? 18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="3" y="4" width="6" height="16" rx="1.5" />
    <rect x="15" y="4" width="6" height="10" rx="1.5" />
  </svg>
);

const initialFilters: FiltersState = {
  search: "",
  status: "all",
  priority: "all",
};

const isRealStatus = (value: FiltersState["status"]): value is PositionStatus =>
  typeof value === "string" && value !== "all";

const isRealPriority = (value: FiltersState["priority"]): value is PassPriority =>
  typeof value === "string" && value !== "all";

type MetricKey =
  | "totalPasses"
  | "activePositions"
  | "interviewsThisWeek"
  | "avgTimeToFill"
  | "throughput"
  | "riskCount";

const metricsGrid: Array<{
  key: MetricKey;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  suffix?: string;
}> = [
  { key: "totalPasses", label: "Active passes", icon: KanbanIcon },
  { key: "activePositions", label: "Roles in flight", icon: Users },
  { key: "interviewsThisWeek", label: "Interviews this week", icon: Activity },
  { key: "avgTimeToFill", label: "Avg. time to fill", icon: Clock3, suffix: "days" },
  { key: "throughput", label: "Offer / hire rate", icon: Gauge, suffix: "%" },
  { key: "riskCount", label: "At-risk roles", icon: AlertTriangle },
];

export default function App() {
  const utils = trpc.useUtils();
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  const queryFilters = useMemo(() => {
    const payload: PassFilter = {
      limit: 8,
    };
    if (isRealStatus(filters.status)) {
      payload.status = filters.status;
    }
    if (isRealPriority(filters.priority)) {
      payload.priority = filters.priority;
    }
    if (deferredSearch.trim()) {
      payload.search = deferredSearch.trim();
    }
    return payload;
  }, [filters, deferredSearch]);

  const summaryQuery = trpc.summary.useQuery(undefined, { refetchOnWindowFocus: false });
  const timelineQuery = trpc.timeline.useQuery(undefined, { refetchOnWindowFocus: false });
  const passesQuery = trpc.passes.list.useQuery(queryFilters, {
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (!passesQuery.data?.items.length) {
      setSelectedPassId(null);
      return;
    }
    const stillVisible = passesQuery.data.items.some((pass) => pass.id === selectedPassId);
    if (!stillVisible) {
      setSelectedPassId(passesQuery.data.items[0].id);
    } else if (!selectedPassId) {
      setSelectedPassId(passesQuery.data.items[0].id);
    }
  }, [passesQuery.data, selectedPassId]);

  const detailQuery = trpc.passes.detail.useQuery(
    { passId: selectedPassId ?? "" },
    { enabled: Boolean(selectedPassId) },
  );

  const statusMutation = trpc.status.update.useMutation({
    onSuccess: async (_data, variables) => {
      toast.success(`Updated stage to ${formatStatusLabel(variables.status)}.`);
      await Promise.all([
        utils.passes.detail.invalidate({ passId: variables.passId }),
        utils.passes.list.invalidate(),
        utils.summary.invalidate(),
      ]);
    },
    onError: () => toast.error("Failed to update stage. Please retry."),
  });

  const feedbackMutation = trpc.feedback.create.useMutation({
    onSuccess: async (_data, variables) => {
      toast.success("Feedback captured.");
      await utils.passes.detail.invalidate({ passId: variables.passId });
    },
    onError: () => toast.error("Could not save feedback."),
  });

  const handleFilters = (next: Partial<FiltersState>) =>
    setFilters((previous) => ({ ...previous, ...next }));

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <header className="glass-panel px-8 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-600 tracking-wide">Baynunah Recruitment Pass</p>
          <h1 className="text-3xl font-semibold text-slate-900">Hiring control tower</h1>
          <p className="text-slate-500 text-sm">
            Consolidated signal for Mohammad Sudally – admin view with live pass health, panels and SLAs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white text-sm font-medium shadow-lg shadow-slate-900/30"
            onClick={() => {
              toast.info("Automated nudges are simulated in this demo build.");
            }}
          >
            <ArrowUpRight size={16} />
            Trigger nudges
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => handleFilters(initialFilters)}
          >
            <Filter size={16} />
            Reset filters
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {metricsGrid.map((metric) => (
          <MetricCard
            key={metric.key}
            label={metric.label}
          icon={metric.icon}
            value={
              summaryQuery.data
                ? summaryQuery.data[metric.key as MetricKey]
                : summaryQuery.isLoading
                ? "…"
                : "-"
            }
            suffix={metric.suffix}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <PassListPanel
          data={passesQuery.data}
          loading={passesQuery.isLoading}
          filters={filters}
          onFiltersChange={handleFilters}
          selectedId={selectedPassId}
          onSelect={setSelectedPassId}
        />
        <div className="lg:col-span-2 space-y-6">
          <TimelinePanel data={timelineQuery.data} loading={timelineQuery.isLoading} />
          <PassDetailPanel
            passData={detailQuery.data}
            loading={detailQuery.isLoading}
            selectedId={selectedPassId}
            onStatusChange={(positionId, status, note) =>
              selectedPassId
                ? statusMutation.mutate({
                    passId: selectedPassId,
                    positionId,
                    status,
                    note,
                  })
                : undefined
            }
            onSubmitFeedback={(payload) => feedbackMutation.mutate(payload)}
            statusBusy={statusMutation.isPending}
            feedbackBusy={feedbackMutation.isPending}
          />
        </div>
      </section>
      <Toaster position="top-right" richColors />
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: number | string;
  suffix?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const MetricCard = ({ label, value, suffix, icon: Icon }: MetricCardProps) => (
  <article className="stat-card p-4">
    <div className="flex items-center justify-between text-slate-400 text-sm">
      <span>{label}</span>
      <Icon size={18} className="text-slate-300" />
    </div>
    <p className="text-2xl font-semibold text-slate-900 mt-2">
      {value}
      {suffix ? <span className="text-base font-medium text-slate-400 ml-1">{suffix}</span> : null}
    </p>
  </article>
);

type PassListPanelProps = {
  data?: PassCollection;
  loading: boolean;
  filters: FiltersState;
  onFiltersChange: (next: Partial<FiltersState>) => void;
  selectedId: string | null;
  onSelect: (next: string) => void;
};

const PassListPanel = ({
  data,
  loading,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
}: PassListPanelProps) => (
  <div className="space-y-4">
    <div className="glass-panel p-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Search pass, department, position…"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((option) => (
          <button
            key={option.value}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filters.status === option.value
                ? "border-sky-600 bg-sky-50 text-sky-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
            onClick={() => onFiltersChange({ status: option.value as FiltersState["status"] })}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {priorityFilters.map((option) => (
          <button
            key={option.value}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filters.priority === option.value
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
            onClick={() => onFiltersChange({ priority: option.value as FiltersState["priority"] })}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-400">
          Loading passes…
        </div>
      )}
      {!loading && !data?.items.length && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-400">
          No passes match the current filters.
        </div>
      )}
      {data?.items.map((pass) => (
        <button
          key={pass.id}
          className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:shadow-lg ${
            selectedId === pass.id ? "border-slate-900 shadow-lg shadow-slate-900/10" : "border-slate-100"
          }`}
          onClick={() => onSelect(pass.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{pass.passNumber}</p>
              <h3 className="text-lg font-semibold text-slate-900">{pass.department}</h3>
              <p className="text-sm text-slate-500">{pass.objective}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${formatPriorityBadge(
                pass.priority,
              )}`}
            >
              {PASS_PRIORITIES[pass.priority].label}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-500">
            <div>
              <p className="text-slate-400">Progress</p>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-sky-500"
                  style={{ width: `${Math.round(pass.progress * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-slate-600 font-semibold">{Math.round(pass.progress * 100)}%</p>
            </div>
            <div>
              <p className="text-slate-400">Positions</p>
              <p className="mt-1 text-slate-900 font-semibold">{pass.positions.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Watchers</p>
              <p className="mt-1 truncate text-slate-900 font-semibold">{pass.watchers.length}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

type TimelinePanelProps = {
  data?: TimelineInsight[];
  loading: boolean;
};

const TimelinePanel = ({ data, loading }: TimelinePanelProps) => (
  <div className="glass-panel p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Operational signal</h2>
        <p className="text-sm text-slate-500">Live view of SLA and capacity drivers.</p>
      </div>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {loading &&
        Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-400"
          >
            Loading insight…
          </div>
        ))}
      {!loading &&
        data?.map((insight) => (
          <div key={insight.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{insight.label}</p>
              <span
                className={`text-xs font-semibold ${
                  insight.trend === "up"
                    ? "text-emerald-600"
                    : insight.trend === "down"
                    ? "text-rose-600"
                    : "text-slate-400"
                }`}
              >
                {insight.trend === "up" && "▲"}
                {insight.trend === "down" && "▼"}
                {insight.trend === "flat" && "▬"}
                &nbsp;goal {insight.target}
                {insight.unit}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {insight.value}
              <span className="text-base font-medium text-slate-400 ml-1">{insight.unit}</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">{insight.description}</p>
          </div>
        ))}
    </div>
  </div>
);

type PassDetailPanelProps = {
  passData?: RecruitmentPass;
  loading: boolean;
  selectedId: string | null;
  onStatusChange: (positionId: string, status: PositionRole["status"], note?: string) => void;
  onSubmitFeedback: (payload: {
    passId: string;
    positionId: string;
    panelist: PositionRole["panel"][number];
    highlights: string;
    concerns?: string;
    decision: PanelDecision;
    score: number;
    nextStep?: string;
  }) => void;
  statusBusy: boolean;
  feedbackBusy: boolean;
};

const PassDetailPanel = ({
  passData,
  loading,
  selectedId,
  onStatusChange,
  onSubmitFeedback,
  statusBusy,
  feedbackBusy,
}: PassDetailPanelProps) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 text-center text-slate-500">
        Select a pass to inspect positions and feedback.
      </div>
    );
  }

  if (!selectedId || !passData) {
    return (
      <div className="glass-panel p-6 text-center text-slate-500">
        Choose a pass to see live panels, notes and health metrics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{passData.passNumber}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{passData.department}</h2>
            <p className="text-sm text-slate-500">{passData.objective}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Owner</p>
            <p className="text-sm font-medium text-slate-800">{passData.owner}</p>
            <p className="text-xs text-slate-400">Watchers</p>
            <p className="text-sm font-medium text-slate-800">{passData.watchers.join(", ")}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-500">
          <div>
            <p className="text-xs font-semibold text-slate-400">Created</p>
            <p className="text-base text-slate-900">{formatDate(passData.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Expires</p>
            <p className="text-base text-slate-900">{formatRelative(passData.expiresOn)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Health</p>
            <p className="text-base capitalize text-slate-900">{passData.health}</p>
          </div>
        </div>
      </div>

      {passData.positions.map((position) => (
        <PositionCard
          key={position.id}
          passId={passData.id}
          position={position}
          onStatusChange={onStatusChange}
          onSubmitFeedback={onSubmitFeedback}
          statusBusy={statusBusy}
          feedbackBusy={feedbackBusy}
        />
      ))}
    </div>
  );
};

type PositionCardProps = {
  position: PositionRole;
  passId: string;
  onStatusChange: PassDetailPanelProps["onStatusChange"];
  onSubmitFeedback: PassDetailPanelProps["onSubmitFeedback"];
  statusBusy: boolean;
  feedbackBusy: boolean;
};

const PositionCard = ({
  passId,
  position,
  onStatusChange,
  onSubmitFeedback,
  statusBusy,
  feedbackBusy,
}: PositionCardProps) => {
  const [feedbackForm, setFeedbackForm] = useState({
    panelistId: position.panel[0]?.id ?? "",
    highlights: "",
    concerns: "",
    decision: "advance" as PanelDecision,
    score: 4,
    nextStep: "",
  });

  const handleStatusClick = (status: PositionRole["status"]) => {
    if (status === position.status || statusBusy) {
      return;
    }
    onStatusChange(position.id, status, position.nextStep);
  };

  const handleFeedbackSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedbackForm.highlights.trim()) {
      toast.error("Share highlights before submitting.");
      return;
    }
    const panelist = position.panel.find((member) => member.id === feedbackForm.panelistId);
    if (!panelist) {
      toast.error("Select a panelist first.");
      return;
    }
    onSubmitFeedback({
      passId,
      positionId: position.id,
      panelist,
      highlights: feedbackForm.highlights.trim(),
      concerns: feedbackForm.concerns.trim() || undefined,
      decision: feedbackForm.decision,
      score: feedbackForm.score,
      nextStep: feedbackForm.nextStep.trim() || undefined,
    });
    setFeedbackForm((prev) => ({ ...prev, highlights: "", concerns: "", nextStep: "" }));
  };

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{position.title}</h3>
          <p className="text-sm text-slate-500">
            {position.location} • Hiring manager {position.hiringManager}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusAccentClass(position.status)}`}>
          {formatStatusLabel(position.status)}
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
        {position.pipeline.map((stage) => (
          <div key={stage.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-xs text-slate-400">{stage.label}</p>
            <p className="text-base font-semibold text-slate-900">{stage.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>Next step: {position.nextStep}</span>
        <span>Last touch {formatRelative(position.lastUpdated)}</span>
        <span className={position.health !== "healthy" ? "text-amber-600 font-semibold" : ""}>
          Health: {position.health}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {POSITION_STATUSES.map((stage) => (
          <button
            key={stage.value}
            className={`rounded-full border px-3 py-1 font-semibold transition ${
              position.status === stage.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
            disabled={statusBusy}
            onClick={() => handleStatusClick(stage.value)}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Panel feedback</h4>
          <div className="mt-3 space-y-3">
            {position.feedback.length === 0 && (
              <p className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-400">
                No feedback logged yet.
              </p>
            )}
            {position.feedback.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-800">{entry.panelist.name}</p>
                  <span className="text-xs text-slate-400">{formatRelative(entry.submittedAt)}</span>
                </div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Decision: {entry.decision} • Score {entry.score.toFixed(1)}
                </p>
                <p className="mt-2 text-sm text-slate-600">{entry.highlights}</p>
                {entry.concerns && (
                  <p className="mt-1 text-xs text-rose-500">Concern: {entry.concerns}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleFeedbackSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">Add quick feedback</h4>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={feedbackForm.panelistId}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, panelistId: event.target.value }))}
          >
            {position.panel.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} • {member.role}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Highlights from interview…"
            value={feedbackForm.highlights}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, highlights: event.target.value }))}
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Risks / concerns (optional)"
            value={feedbackForm.concerns}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, concerns: event.target.value }))}
          />
          <div className="flex gap-2 text-sm">
            <input
              type="range"
              min={1}
              max={5}
              value={feedbackForm.score}
              onChange={(event) =>
                setFeedbackForm((prev) => ({ ...prev, score: Number(event.target.value) }))
              }
              className="flex-1"
            />
            <span className="w-12 text-center font-semibold text-slate-700">{feedbackForm.score}</span>
          </div>
          <div className="flex gap-2">
            {(["advance", "hold", "reject"] as PanelDecision[]).map((decision) => (
              <button
                key={decision}
                type="button"
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                  feedbackForm.decision === decision
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-500"
                }`}
                onClick={() => setFeedbackForm((prev) => ({ ...prev, decision }))}
              >
                {decision}
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Next step / follow-up (optional)"
            value={feedbackForm.nextStep}
            onChange={(event) => setFeedbackForm((prev) => ({ ...prev, nextStep: event.target.value }))}
          />
          <button
            type="submit"
            disabled={feedbackBusy}
            className="w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {feedbackBusy ? "Saving…" : "Submit feedback"}
          </button>
        </form>
      </div>
    </article>
  );
};

