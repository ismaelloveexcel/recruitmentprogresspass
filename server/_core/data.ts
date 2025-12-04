import { differenceInCalendarDays } from "date-fns";
import { nanoid } from "nanoid";
import {
  DEFAULT_PAGE_SIZE,
  POSITION_STATUSES,
  type PositionStatus,
} from "../../shared/constants";
import type {
  ActivityEvent,
  FeedbackEntry,
  PassCollection,
  PassFilter,
  PanelMember,
  RecruitmentPass,
  SummaryMetrics,
  TimelineInsight,
} from "../../shared/types";
import type { FeedbackInput, StatusUpdateInput } from "../../shared/schemas";

const statusDictionary = POSITION_STATUSES.reduce<Record<PositionStatus, string>>(
  (dictionary, status) => {
    dictionary[status.value as PositionStatus] = status.label;
    return dictionary;
  },
  {} as Record<PositionStatus, string>,
);

const statusOrder = POSITION_STATUSES.reduce<Record<PositionStatus, number>>((order, item, index) => {
  order[item.value as PositionStatus] = index;
  return order;
}, {} as Record<PositionStatus, number>);

const roster: PanelMember[] = [
  { id: "panel-zainab", name: "Zainab Al-Hosani", role: "Head of Cyber Defense", availability: "available" },
  { id: "panel-ali", name: "Ali Rahman", role: "HR Business Partner", availability: "available" },
  { id: "panel-samira", name: "Samira Al Kendi", role: "Director, Talent Acquisition", availability: "limited" },
  { id: "panel-lina", name: "Lina Zhang", role: "Director, Digital Workplace", availability: "available" },
  { id: "panel-daniel", name: "Daniel Vora", role: "Product Lead, Collaboration", availability: "ooo" },
  { id: "panel-oliver", name: "Oliver Reed", role: "Head of Data Platform", availability: "available" },
  { id: "panel-fatima", name: "Fatima Al Noor", role: "HRBP - Technology", availability: "available" },
  { id: "panel-joana", name: "Joana Ribeiro", role: "Sr. Talent Partner", availability: "limited" },
];

const panelById = Object.fromEntries(roster.map((member) => [member.id, member])) as Record<
  string,
  PanelMember
>;
const pickPanel = (...ids: Array<keyof typeof panelById>) => ids.map((id) => panelById[id]);

const seededPasses: RecruitmentPass[] = [
  {
    id: "pass-cyber-01",
    passNumber: "RP-24018",
    owner: "mohammad.sudally@baynunah.ae",
    department: "Cybersecurity",
    objective: "Stand up the 24/7 incident response tower ahead of Expo 2025.",
    createdAt: new Date("2024-10-02T10:00:00Z").toISOString(),
    expiresOn: new Date("2025-01-25T18:00:00Z").toISOString(),
    priority: "high",
    progress: 0.64,
    health: "healthy",
    watchers: ["ciso@baynunah.ae", "talentops@baynunah.ae"],
    metrics: {
      totalCandidates: 58,
      interviewsThisWeek: 7,
      timeToFill: 32,
      satisfaction: 4.7,
    },
    positions: [
      {
        id: "pos-ir-lead",
        title: "Incident Response Lead",
        openings: 1,
        status: "interview",
        location: "Abu Dhabi HQ",
        pipeline: [
          { label: "Screening", value: 8 },
          { label: "Interviews", value: 4 },
          { label: "Offer", value: 1 },
        ],
        nextStep: "Final panel loop with CIO",
        hiringManager: "Zainab Al-Hosani",
        panel: pickPanel("panel-zainab", "panel-ali", "panel-samira"),
        feedback: [
          {
            id: "feed-ir-1",
            positionId: "pos-ir-lead",
            panelist: panelById["panel-zainab"],
            decision: "advance",
            highlights: "Strong crisis communication and clearly owned global incidents.",
            concerns: "Need concrete playbooks for APAC coverage.",
            score: 5,
            submittedAt: new Date("2024-11-28T09:15:00Z").toISOString(),
            nextStep: "Share revised follow-the-sun runbook",
          },
        ],
        lastUpdated: new Date("2024-11-30T16:00:00Z").toISOString(),
        health: "healthy",
      },
      {
        id: "pos-soc-automation",
        title: "SOC Automation Engineer",
        openings: 2,
        status: "screening",
        location: "Remote first",
        pipeline: [
          { label: "Applied", value: 21 },
          { label: "Screening", value: 6 },
          { label: "Interviews", value: 2 },
        ],
        nextStep: "Async challenge distribution",
        hiringManager: "Zainab Al-Hosani",
        panel: pickPanel("panel-ali", "panel-samira"),
        feedback: [],
        lastUpdated: new Date("2024-11-26T12:45:00Z").toISOString(),
        health: "attention",
      },
      {
        id: "pos-threat-hunter",
        title: "Threat Hunting Analyst",
        openings: 1,
        status: "offer",
        location: "Hybrid Dubai",
        pipeline: [
          { label: "Screening", value: 9 },
          { label: "Interviews", value: 3 },
          { label: "Offer", value: 1 },
        ],
        nextStep: "Extend revised compensation",
        hiringManager: "Zainab Al-Hosani",
        panel: pickPanel("panel-zainab", "panel-fatima"),
        feedback: [
          {
            id: "feed-threat-1",
            positionId: "pos-threat-hunter",
            panelist: panelById["panel-fatima"],
            decision: "advance",
            highlights: "Understands compliance implications and negotiated fairly.",
            score: 4,
            submittedAt: new Date("2024-11-25T14:40:00Z").toISOString(),
          },
        ],
        lastUpdated: new Date("2024-12-01T08:30:00Z").toISOString(),
        health: "healthy",
      },
    ],
    statusHistory: [
      {
        id: "evt-ir-1",
        timestamp: new Date("2024-11-30T16:00:00Z").toISOString(),
        status: "interview",
        positionId: "pos-ir-lead",
        actor: "Samira Al Kendi",
        label: "Executive panel loop scheduled",
        notes: "Ensuring VP security can join.",
      },
      {
        id: "evt-soc-1",
        timestamp: new Date("2024-11-26T12:45:00Z").toISOString(),
        status: "screening",
        positionId: "pos-soc-automation",
        actor: "Ali Rahman",
        label: "Shared take-home challenge",
      },
      {
        id: "evt-threat-1",
        timestamp: new Date("2024-11-24T09:20:00Z").toISOString(),
        status: "offer",
        positionId: "pos-threat-hunter",
        actor: "Fatima Al Noor",
        label: "Offer draft prepared",
      },
    ],
  },
  {
    id: "pass-modern-workplace",
    passNumber: "RP-24019",
    owner: "mohammad.sudally@baynunah.ae",
    department: "Modern Workplace",
    objective: "Ship Microsoft 365 sprint squads to scale Copilot adoption.",
    createdAt: new Date("2024-09-14T08:00:00Z").toISOString(),
    expiresOn: new Date("2025-02-18T18:00:00Z").toISOString(),
    priority: "medium",
    progress: 0.52,
    health: "attention",
    watchers: ["cio.office@baynunah.ae"],
    metrics: {
      totalCandidates: 41,
      interviewsThisWeek: 5,
      timeToFill: 29,
      satisfaction: 4.2,
    },
    positions: [
      {
        id: "pos-m365-arch",
        title: "M365 Solution Architect",
        openings: 1,
        status: "interview",
        location: "Abu Dhabi HQ",
        pipeline: [
          { label: "Applied", value: 14 },
          { label: "Screening", value: 6 },
          { label: "Interviews", value: 3 },
        ],
        nextStep: "Architecture whiteboard session",
        hiringManager: "Lina Zhang",
        panel: pickPanel("panel-lina", "panel-daniel", "panel-ali"),
        feedback: [
          {
            id: "feed-m365-1",
            positionId: "pos-m365-arch",
            panelist: panelById["panel-lina"],
            decision: "advance",
            highlights: "Understands Copilot extensibility and security guardrails.",
            score: 5,
            submittedAt: new Date("2024-11-22T11:30:00Z").toISOString(),
          },
        ],
        lastUpdated: new Date("2024-11-29T10:05:00Z").toISOString(),
        health: "healthy",
      },
      {
        id: "pos-adoption-lead",
        title: "Digital Adoption Lead",
        openings: 1,
        status: "screening",
        location: "Remote",
        pipeline: [
          { label: "Applied", value: 18 },
          { label: "Screening", value: 5 },
          { label: "Interviews", value: 1 },
        ],
        nextStep: "Select candidates for live workshop",
        hiringManager: "Lina Zhang",
        panel: pickPanel("panel-lina", "panel-joana"),
        feedback: [],
        lastUpdated: new Date("2024-11-25T09:10:00Z").toISOString(),
        health: "attention",
      },
    ],
    statusHistory: [
      {
        id: "evt-m365-1",
        timestamp: new Date("2024-11-29T10:05:00Z").toISOString(),
        status: "interview",
        positionId: "pos-m365-arch",
        actor: "Lina Zhang",
        label: "Live whiteboard assessments locked",
      },
      {
        id: "evt-adoption-1",
        timestamp: new Date("2024-11-25T09:10:00Z").toISOString(),
        status: "screening",
        positionId: "pos-adoption-lead",
        actor: "Joana Ribeiro",
        label: "Shortlist refined",
        notes: "Need more Arabic speaking candidates",
      },
    ],
  },
  {
    id: "pass-data-platform",
    passNumber: "RP-24021",
    owner: "mohammad.sudally@baynunah.ae",
    department: "Data Platform",
    objective: "Stand up unified analytics hub for talent insights.",
    createdAt: new Date("2024-10-20T09:00:00Z").toISOString(),
    expiresOn: new Date("2025-03-12T18:00:00Z").toISOString(),
    priority: "high",
    progress: 0.33,
    health: "attention",
    watchers: ["chiefdata@baynunah.ae"],
    metrics: {
      totalCandidates: 37,
      interviewsThisWeek: 3,
      timeToFill: 41,
      satisfaction: 3.9,
    },
    positions: [
      {
        id: "pos-data-quality",
        title: "Data Quality Manager",
        openings: 1,
        status: "sourcing",
        location: "Abu Dhabi HQ",
        pipeline: [
          { label: "Applied", value: 7 },
          { label: "Screening", value: 3 },
        ],
        nextStep: "Identify senior profiles from Microsoft network",
        hiringManager: "Oliver Reed",
        panel: pickPanel("panel-oliver", "panel-ali", "panel-joana"),
        feedback: [],
        lastUpdated: new Date("2024-11-23T13:00:00Z").toISOString(),
        health: "attention",
      },
      {
        id: "pos-analytics-engineer",
        title: "Analytics Engineer",
        openings: 2,
        status: "screening",
        location: "Hybrid Dubai",
        pipeline: [
          { label: "Applied", value: 22 },
          { label: "Screening", value: 5 },
          { label: "Interviews", value: 1 },
        ],
        nextStep: "Send SQL automation assessment",
        hiringManager: "Oliver Reed",
        panel: pickPanel("panel-oliver", "panel-fatima"),
        feedback: [],
        lastUpdated: new Date("2024-11-27T15:05:00Z").toISOString(),
        health: "attention",
      },
    ],
    statusHistory: [
      {
        id: "evt-data-1",
        timestamp: new Date("2024-11-27T15:05:00Z").toISOString(),
        status: "screening",
        positionId: "pos-analytics-engineer",
        actor: "Oliver Reed",
        label: "Assessment invites prepared",
      },
      {
        id: "evt-data-2",
        timestamp: new Date("2024-11-23T13:00:00Z").toISOString(),
        status: "sourcing",
        positionId: "pos-data-quality",
        actor: "Joana Ribeiro",
        label: "Pipeline refresh requested",
      },
    ],
  },
];

const passMap = new Map(seededPasses.map((pass) => [pass.id, pass]));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const computeProgress = (pass: RecruitmentPass) => {
  const maxScore = pass.positions.length * POSITION_STATUSES.length;
  const completedScore = pass.positions.reduce((score, position) => {
    const order = statusOrder[position.status];
    return score + (order + 1);
  }, 0);
  return Number((completedScore / Math.max(1, maxScore)).toFixed(2));
};

const derivePassHealth = (pass: RecruitmentPass) => {
  const riskyPositions = pass.positions.filter((position) => position.health !== "healthy").length;
  if (!riskyPositions) {
    return "healthy";
  }
  if (riskyPositions >= pass.positions.length / 2) {
    return "critical";
  }
  return "attention";
};

const refreshDerivedState = (pass: RecruitmentPass) => {
  pass.progress = computeProgress(pass);
  pass.health = derivePassHealth(pass);
};

passMap.forEach(refreshDerivedState);

const textIncludes = (needle: string, haystack: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

const matchesSearch = (filter: PassFilter, pass: RecruitmentPass) => {
  if (!filter.search) {
    return true;
  }
  const searchValue = filter.search.trim().toLowerCase();
  return (
    textIncludes(searchValue, pass.passNumber) ||
    textIncludes(searchValue, pass.department) ||
    textIncludes(searchValue, pass.objective) ||
    pass.positions.some((position) => textIncludes(searchValue, position.title))
  );
};

const matchesStatus = (filter: PassFilter, pass: RecruitmentPass) => {
  if (!filter.status || filter.status === "all") {
    return true;
  }
  return pass.positions.some((position) => position.status === filter.status);
};

const matchesPriority = (filter: PassFilter, pass: RecruitmentPass) => {
  if (!filter.priority || filter.priority === "all") {
    return true;
  }
  return pass.priority === filter.priority;
};

const matchesOwner = (filter: PassFilter, pass: RecruitmentPass) => {
  if (!filter.owner) {
    return true;
  }
  return pass.owner.toLowerCase() === filter.owner.toLowerCase();
};

const matchesDepartment = (filter: PassFilter, pass: RecruitmentPass) => {
  if (!filter.department) {
    return true;
  }
  return pass.department.toLowerCase() === filter.department.toLowerCase();
};

const getAllPasses = () => Array.from(passMap.values());

const applyFilters = (filter: PassFilter = {}) => {
  const passes = getAllPasses().filter(
    (pass) =>
      matchesSearch(filter, pass) &&
      matchesStatus(filter, pass) &&
      matchesPriority(filter, pass) &&
      matchesOwner(filter, pass) &&
      matchesDepartment(filter, pass),
  );
  return passes.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

const buildSummary = (): SummaryMetrics => {
  const passes = getAllPasses();
  const totalPasses = passes.length;
  const allPositions = passes.flatMap((pass) => pass.positions);
  const activePositions = allPositions.length;
  const riskCount = allPositions.filter((position) => position.health !== "healthy").length;
  const hiredCount = allPositions.filter((position) => position.status === "hired").length;
  const throughput = Math.round((hiredCount / Math.max(1, activePositions)) * 100);
  const completedPasses = passes.filter((pass) =>
    pass.positions.every((position) => position.status === "hired"),
  ).length;

  const busiestDepartment =
    passes
      .map((pass) => ({
        department: pass.department,
        openings: pass.positions.reduce((sum, position) => sum + position.openings, 0),
      }))
      .sort((a, b) => b.openings - a.openings)[0]?.department ?? "N/A";

  const interviewsThisWeek = passes.reduce(
    (sum, pass) => sum + pass.metrics.interviewsThisWeek,
    0,
  );
  const avgTimeToFill = Math.round(
    passes.reduce((sum, pass) => sum + pass.metrics.timeToFill, 0) / Math.max(1, totalPasses),
  );
  const satisfaction = Number(
    (
      passes.reduce((sum, pass) => sum + pass.metrics.satisfaction, 0) / Math.max(1, totalPasses)
    ).toFixed(1),
  );

  const hasSlaRisk = passes.some((pass) => {
    const daysToExpire = differenceInCalendarDays(new Date(pass.expiresOn), new Date());
    return daysToExpire < 14 && pass.positions.some((position) => position.status !== "hired");
  });

  return {
    totalPasses,
    activePositions,
    interviewsThisWeek,
    avgTimeToFill,
    satisfaction,
    riskCount,
    completedPasses,
    throughput,
    busiestDepartment,
    hasSlaRisk,
  };
};

const buildTimelineInsights = (): TimelineInsight[] => {
  const passes = getAllPasses();
  const active = passes.length;
  return [
    {
      id: "velocity",
      label: "Avg. days in stage",
      value: clamp(
        Math.round(
          passes.reduce(
            (sum, pass) =>
              sum + pass.positions.reduce((inner, position) => inner + statusOrder[position.status], 0),
            0,
          ) /
            Math.max(1, passes.length * (passes[0]?.positions.length ?? 1)),
        ),
        4,
        15,
      ),
      target: 8,
      unit: "days",
      trend: "down",
      description: "Tracking below SLA for most high-priority roles",
    },
    {
      id: "panel-load",
      label: "Panel load this week",
      value: passes.reduce((sum, pass) => sum + pass.metrics.interviewsThisWeek, 0),
      target: 12,
      unit: "loops",
      trend: active > 2 ? "up" : "flat",
      description: "Loops concentrated on Cybersecurity pass",
    },
    {
      id: "offer-accept",
      label: "Offer acceptance",
      value: clamp(
        Math.round(
          (passes.reduce(
            (sum, pass) =>
              sum +
              pass.positions.filter((position) => position.status === "hired" || position.status === "offer")
                .length,
            0,
          ) /
            Math.max(1, passes.reduce((sum, pass) => sum + pass.positions.length, 0))) *
            100,
        ),
        45,
        90,
      ),
      target: 75,
      unit: "%",
      trend: "up",
      description: "Improved compared to last sprint of hires",
    },
  ];
};

const findPass = (passId: string) => {
  const pass = passMap.get(passId);
  if (!pass) {
    throw new Error("Pass not found");
  }
  return pass;
};

const findPosition = (pass: RecruitmentPass, positionId: string) => {
  const position = pass.positions.find((item) => item.id === positionId);
  if (!position) {
    throw new Error("Position not found");
  }
  return position;
};

const appendStatusEvent = (pass: RecruitmentPass, event: Omit<ActivityEvent, "id">) => {
  pass.statusHistory.unshift({
    id: nanoid(),
    ...event,
  });
  pass.statusHistory = pass.statusHistory.slice(0, 35);
};

const recalcPassPriority = (pass: RecruitmentPass) => {
  const statusWeight = pass.positions.reduce(
    (sum, position) => sum + statusOrder[position.status] + 1,
    0,
  );
  const normalized = statusWeight / Math.max(1, pass.positions.length * POSITION_STATUSES.length);
  const upcomingExpiry = differenceInCalendarDays(new Date(pass.expiresOn), new Date());
  if (upcomingExpiry < 30 || normalized < 0.3) {
    pass.priority = "high";
  } else if (upcomingExpiry < 60 || normalized < 0.6) {
    pass.priority = "medium";
  } else {
    pass.priority = "low";
  }
};

export const dataStore = {
  list(filter: PassFilter = {}): PassCollection {
    const limit = filter.limit ?? DEFAULT_PAGE_SIZE;
    const offset = filter.offset ?? 0;
    const all = applyFilters(filter);
    const slice = all.slice(offset, offset + limit);

    return {
      items: slice,
      total: all.length,
      nextOffset: offset + slice.length < all.length ? offset + slice.length : null,
    };
  },

  summary(): SummaryMetrics {
    return buildSummary();
  },

  timeline(): TimelineInsight[] {
    return buildTimelineInsights();
  },

  getById(passId: string): RecruitmentPass {
    return findPass(passId);
  },

  updateStatus(input: StatusUpdateInput & { actor: string }) {
    const pass = findPass(input.passId);
    const position = findPosition(pass, input.positionId);

    position.status = input.status;
    position.lastUpdated = new Date().toISOString();
    if (input.note) {
      position.nextStep = input.note;
    }

    appendStatusEvent(pass, {
      actor: input.actor,
      label: `Status set to ${statusDictionary[input.status]}`,
      positionId: position.id,
      status: input.status,
      timestamp: new Date().toISOString(),
      notes: input.note,
    });

    refreshDerivedState(pass);
    recalcPassPriority(pass);

    return { pass, position };
  },

  addFeedback(input: FeedbackInput & { actor: string }) {
    const pass = findPass(input.passId);
    const position = findPosition(pass, input.positionId);

    const feedback: FeedbackEntry = {
      id: nanoid(),
      positionId: position.id,
      panelist: input.panelist,
      decision: input.decision,
      highlights: input.highlights,
      concerns: input.concerns,
      score: input.score,
      submittedAt: new Date().toISOString(),
      nextStep: input.nextStep,
    };

    position.feedback.unshift(feedback);
    if (position.feedback.length > 8) {
      position.feedback.pop();
    }

    appendStatusEvent(pass, {
      actor: input.actor,
      label: `${input.panelist.name} logged feedback`,
      positionId: position.id,
      status: position.status,
      timestamp: new Date().toISOString(),
      notes: feedback.highlights,
    });

    if (input.decision === "advance" && position.status === "screening") {
      position.status = "interview";
    }

    if (input.decision === "reject") {
      position.status = "on_hold";
    }

    refreshDerivedState(pass);
    recalcPassPriority(pass);

    return { pass, position, feedback };
  },
};
