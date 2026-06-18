export const DASHBOARD_RANGES = [
  "Today",
  "Yesterday",
  "Last 3 days",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
  "Month to date",
  "Last month",
  "Year to date",
  "This Past Year"
] as const;

export type DashboardRange = typeof DASHBOARD_RANGES[number];

export type DashboardRangeWindow = {
  start: Date;
  end: Date;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isDashboardRange(value: string | null | undefined): value is DashboardRange {
  return Boolean(value && DASHBOARD_RANGES.includes(value as DashboardRange));
}

export function dashboardRangeWindow(range: DashboardRange, now = new Date()): DashboardRangeWindow {
  const today = startOfDay(now);

  if (range === "Today") return { start: today, end: now };
  if (range === "Yesterday") return { start: addDays(today, -1), end: today };
  if (range === "Last 3 days") return { start: addDays(today, -2), end: now };
  if (range === "Last 7 days") return { start: addDays(today, -6), end: now };
  if (range === "Last 14 days") return { start: addDays(today, -13), end: now };
  if (range === "Last 30 days") return { start: addDays(today, -29), end: now };
  if (range === "Last 60 days") return { start: addDays(today, -59), end: now };
  if (range === "Last 90 days") return { start: addDays(today, -89), end: now };
  if (range === "Month to date") return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
  if (range === "Last month") return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 1) };
  if (range === "Year to date") return { start: new Date(now.getFullYear(), 0, 1), end: now };
  return { start: new Date(now.getFullYear(), now.getMonth() - 11, 1), end: now };
}

export function isWithinDashboardRange(value: string | null | undefined, range: DashboardRange, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const { start, end } = dashboardRangeWindow(range, now);
  return date >= start && date <= end;
}
