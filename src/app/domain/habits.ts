export const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const;
export type DayLabel = (typeof DAY_LABELS)[number];

export type HabitLogStatus = 'done' | 'missed';
export type HabitTodayStatus = HabitLogStatus | 'pending' | 'not_scheduled';

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: string;
  category: string;
  color: string;
  reminderTime: string;
  days: DayLabel[];
  active: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: HabitLogStatus;
  durationMinutes: number;
  note: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewHabitInput {
  name: string;
  description: string;
  icon: string;
  target: string;
  category: string;
  color: string;
  reminderTime: string;
  days: DayLabel[];
}

export interface HabitDailyView extends Habit {
  completed: boolean;
  streak: number;
  longestStreak: number;
  todayStatus: HabitTodayStatus;
  todayDurationMinutes: number;
}

export interface RangeStats {
  planned: number;
  done: number;
  missed: number;
  pending: number;
  completionRate: number;
  totalDurationMinutes: number;
  averageDurationMinutes: number;
}

const JS_DAY_TO_LABEL: Record<number, DayLabel> = {
  0: 'Yak',
  1: 'Du',
  2: 'Se',
  3: 'Cho',
  4: 'Pa',
  5: 'Ju',
  6: 'Sha',
};

const MONTH_NAMES = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function createId(prefix: string) {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${id}`;
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function dayLabel(date: Date): DayLabel {
  return JS_DAY_TO_LABEL[date.getDay()];
}

export function formatShortDate(dateOrKey: Date | string) {
  const date = typeof dateOrKey === 'string' ? fromDateKey(dateOrKey) : dateOrKey;
  return `${date.getDate()}-${MONTH_NAMES[date.getMonth()]}`;
}

export function formatMonthYear(date: Date) {
  const month = MONTH_NAMES[date.getMonth()];
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) return '0 daqiqa';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} daqiqa`;
  if (mins === 0) return `${hours} soat`;
  return `${hours} soat ${mins} daqiqa`;
}

export function parseDurationMinutes(value: string) {
  const normalized = value.trim().replace(',', '.');
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

export function isHabitScheduledOn(habit: Habit, date: Date) {
  return habit.active && habit.days.includes(dayLabel(date));
}

export function getPlannedHabits(habits: Habit[], date: Date) {
  return habits.filter((habit) => isHabitScheduledOn(habit, date));
}

export function getLogForDate(logs: HabitLog[], habitId: string, date: Date | string) {
  const key = typeof date === 'string' ? date : dateKey(date);
  return logs.find((log) => log.habitId === habitId && log.date === key);
}

export function getTodayStatus(habit: Habit, logs: HabitLog[], date: Date): HabitTodayStatus {
  if (!isHabitScheduledOn(habit, date)) return 'not_scheduled';
  return getLogForDate(logs, habit.id, date)?.status ?? 'pending';
}

export function getCompletionSummary(habits: Habit[], logs: HabitLog[], date: Date): RangeStats {
  return getRangeStats(habits, logs, date, date, date);
}

export function getRangeStats(
  habits: Habit[],
  logs: HabitLog[],
  start: Date,
  end: Date,
  today = new Date(),
): RangeStats {
  const todayKey = dateKey(today);
  let planned = 0;
  let done = 0;
  let missed = 0;
  let pending = 0;
  let totalDurationMinutes = 0;

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    if (dateKey(cursor) > todayKey) continue;

    const plannedHabits = getPlannedHabits(habits, cursor);
    for (const habit of plannedHabits) {
      planned += 1;
      const log = getLogForDate(logs, habit.id, cursor);

      if (log?.status === 'done') {
        done += 1;
        totalDurationMinutes += log.durationMinutes;
      } else if (log?.status === 'missed' || dateKey(cursor) < todayKey) {
        missed += 1;
      } else {
        pending += 1;
      }
    }
  }

  return {
    planned,
    done,
    missed,
    pending,
    completionRate: planned === 0 ? 0 : Math.round((done / planned) * 100),
    totalDurationMinutes,
    averageDurationMinutes: done === 0 ? 0 : Math.round(totalDurationMinutes / done),
  };
}

export function getHabitRangeStats(habit: Habit, logs: HabitLog[], start: Date, end: Date, today = new Date()) {
  return getRangeStats([habit], logs, start, end, today);
}

export function getCurrentStreak(habit: Habit, logs: HabitLog[], asOf = new Date()) {
  const todayKey = dateKey(asOf);
  let streak = 0;

  for (let i = 0; i < 730; i += 1) {
    const cursor = addDays(asOf, -i);
    const key = dateKey(cursor);

    if (!isHabitScheduledOn({ ...habit, active: true }, cursor)) continue;

    const log = getLogForDate(logs, habit.id, key);
    if (log?.status === 'done') {
      streak += 1;
      continue;
    }

    if (key === todayKey && !log) continue;
    break;
  }

  return streak;
}

export function getLongestStreak(habit: Habit, logs: HabitLog[], asOf = new Date()) {
  const createdAt = habit.createdAt ? fromDateKey(habit.createdAt.slice(0, 10)) : addDays(asOf, -180);
  const todayKey = dateKey(asOf);
  let current = 0;
  let longest = 0;

  for (let cursor = createdAt; cursor <= asOf; cursor = addDays(cursor, 1)) {
    const key = dateKey(cursor);
    if (!isHabitScheduledOn({ ...habit, active: true }, cursor)) continue;

    const log = getLogForDate(logs, habit.id, key);
    if (log?.status === 'done') {
      current += 1;
      longest = Math.max(longest, current);
    } else if (key !== todayKey || log?.status === 'missed') {
      current = 0;
    }
  }

  return longest;
}

export function toHabitDailyView(habit: Habit, logs: HabitLog[], date = new Date()): HabitDailyView {
  const log = getLogForDate(logs, habit.id, date);
  return {
    ...habit,
    completed: log?.status === 'done',
    streak: getCurrentStreak(habit, logs, date),
    longestStreak: getLongestStreak(habit, logs, date),
    todayStatus: getTodayStatus(habit, logs, date),
    todayDurationMinutes: log?.durationMinutes ?? 0,
  };
}

export function getRecentLogsForHabit(logs: HabitLog[], habitId: string, limit = 5) {
  return logs
    .filter((log) => log.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getWeekDates(date: Date) {
  const start = startOfWeek(date);
  return DAY_LABELS.map((_, index) => addDays(start, index));
}

export function getWeekBars(habits: Habit[], logs: HabitLog[], date = new Date()) {
  return getWeekDates(date).map((day) => {
    const stats = getRangeStats(habits, logs, day, day, date);
    return {
      label: dayLabel(day),
      value: stats.done,
      total: stats.planned,
      pct: stats.completionRate,
    };
  });
}

export function getMonthWeekBars(habits: Habit[], logs: HabitLog[], date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const bars = [];
  let weekNo = 1;

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 7)) {
    const weekEnd = addDays(cursor, 6) > end ? end : addDays(cursor, 6);
    const stats = getRangeStats(habits, logs, cursor, weekEnd, date);
    bars.push({
      label: `H${weekNo}`,
      value: stats.completionRate,
      total: 100,
      pct: stats.completionRate,
    });
    weekNo += 1;
  }

  return bars;
}

export function getHabitWeekStatuses(habit: Habit, logs: HabitLog[], date = new Date()) {
  const todayKey = dateKey(date);
  return getWeekDates(date).map((day) => {
    const key = dateKey(day);
    const log = getLogForDate(logs, habit.id, key);
    const scheduled = isHabitScheduledOn({ ...habit, active: true }, day);
    const status: HabitTodayStatus = !scheduled
      ? 'not_scheduled'
      : log?.status ?? (key < todayKey ? 'missed' : 'pending');

    return {
      day: dayLabel(day),
      date: key,
      status,
      done: status === 'done',
    };
  });
}

export function getCalendarDayStatus(habits: Habit[], logs: HabitLog[], date: Date, today = new Date()) {
  const key = dateKey(date);
  if (key > dateKey(today)) return 'future';

  const planned = getPlannedHabits(habits, date);
  if (planned.length === 0) return 'none';

  const doneCount = planned.filter((habit) => getLogForDate(logs, habit.id, key)?.status === 'done').length;
  const missedCount = planned.filter((habit) => getLogForDate(logs, habit.id, key)?.status === 'missed').length;

  if (doneCount === planned.length) return 'done';
  if (doneCount > 0) return 'partial';
  if (missedCount > 0 || key < dateKey(today)) return 'missed';
  return 'none';
}
