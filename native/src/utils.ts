import { DATA_PREFIX, DAYS, MONTHS } from './constants';
import type { Day, Habit, HabitLog, HistoryTone, Profile } from './types';

export function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function slugName(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user';
}

export function dataKey(profile: Profile) {
  return `${DATA_PREFIX}.${profile.id}`;
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return dateKey(new Date());
}

export function dayForDate(date: Date): Day {
  const index = date.getDay();
  return DAYS[index === 0 ? 6 : index - 1];
}

export function todayDay(): Day {
  return dayForDate(new Date());
}

export function isPlannedToday(habit: Habit) {
  return habit.active && habit.days.includes(todayDay());
}

export function isPlannedOnDate(habit: Habit, date: Date) {
  return habit.active && habit.days.includes(dayForDate(date));
}

export function logForToday(logs: HabitLog[], habitId: string) {
  const key = todayKey();
  return logs.find((log) => log.habitId === habitId && log.date === key);
}

export function logForDate(logs: HabitLog[], habitId: string, date: Date) {
  const key = dateKey(date);
  return logs.find((log) => log.habitId === habitId && log.date === key);
}

export function displayDate(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function recentDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

export function currentWeekDays() {
  const start = new Date();
  const mondayOffset = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setDate(start.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function completionForDate(habits: Habit[], logs: HabitLog[], date: Date) {
  const planned = habits.filter((habit) => isPlannedOnDate(habit, date));
  const done = planned.filter((habit) => logForDate(logs, habit.id, date)?.status === 'done').length;
  const pct = planned.length === 0 ? 0 : Math.round((done / planned.length) * 100);
  return { planned: planned.length, done, pct };
}

export function currentStreak(habits: Habit[], logs: HabitLog[]) {
  let streak = 0;
  for (let index = 0; index < 30; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const summary = completionForDate(habits, logs, date);
    if (summary.planned === 0) continue;
    if (summary.done === summary.planned) streak += 1;
    else break;
  }
  return streak;
}

export function completionStats(habits: Habit[], logs: HabitLog[]) {
  const planned = habits.filter(isPlannedToday);
  const done = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'done').length;
  const missed = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'missed').length;
  const skipped = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'skipped').length;
  const pending = Math.max(planned.length - done - missed - skipped, 0);
  const pct = planned.length === 0 ? 0 : Math.round((done / planned.length) * 100);
  return { planned, done, missed, skipped, pending, pct };
}

export function monthGrid(reference: Date) {
  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const mondayOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function daySummary(habits: Habit[], logs: HabitLog[], date: Date) {
  const key = dateKey(date);
  const planned = habits.filter((habit) => isPlannedOnDate(habit, date));
  const done = planned.filter((habit) => logForDate(logs, habit.id, date)?.status === 'done').length;
  const missed = planned.filter((habit) => logForDate(logs, habit.id, date)?.status === 'missed').length;
  const skipped = planned.filter((habit) => logForDate(logs, habit.id, date)?.status === 'skipped').length;
  const isFuture = key > todayKey();
  let tone: 'done' | 'partial' | 'missed' | 'none' | 'future' = 'none';

  if (isFuture) tone = 'future';
  else if (planned.length === 0) tone = 'none';
  else if (done === planned.length) tone = 'done';
  else if (done > 0 || skipped > 0) tone = 'partial';
  else if (missed > 0) tone = 'missed';

  return { key, planned, done, missed, skipped, pending: Math.max(planned.length - done - missed - skipped, 0), tone };
}

export function habitStreak(habit: Habit, logs: HabitLog[]) {
  let streak = 0;
  for (let index = 0; index < 60; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    if (!habit.days.includes(dayForDate(date))) continue;
    const status = logForDate(logs, habit.id, date)?.status;
    if (status === 'done') streak += 1;
    else break;
  }
  return streak;
}

export function habitCompletion(habit: Habit, logs: HabitLog[], days = 30) {
  let planned = 0;
  let done = 0;
  for (let index = 0; index < days; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    if (!habit.days.includes(dayForDate(date))) continue;
    planned += 1;
    if (logForDate(logs, habit.id, date)?.status === 'done') done += 1;
  }
  return { planned, done, pct: planned === 0 ? 0 : Math.round((done / planned) * 100) };
}

export function logsForHabit(logs: HabitLog[], habitId: string) {
  return logs
    .filter((log) => log.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

export function habitHistory(habit: Habit, logs: HabitLog[], days = 21) {
  return recentDays(days).map((date) => {
    const planned = habit.days.includes(dayForDate(date));
    const log = logForDate(logs, habit.id, date);
    const tone: HistoryTone = planned ? log?.status ?? 'pending' : 'off';

    return {
      key: dateKey(date),
      date,
      planned,
      status: log?.status,
      tone,
    };
  });
}

export function periodSummary(habits: Habit[], logs: HabitLog[], days: number) {
  let planned = 0;
  let done = 0;
  let missed = 0;
  let skipped = 0;
  for (let index = 0; index < days; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const summary = daySummary(habits, logs, date);
    planned += summary.planned.length;
    done += summary.done;
    missed += summary.missed;
    skipped += summary.skipped;
  }
  const pct = planned === 0 ? 0 : Math.round((done / planned) * 100);
  return { planned, done, missed, skipped, pct };
}

export function topHabits(habits: Habit[], logs: HabitLog[]) {
  return habits
    .map((habit) => {
      const completion = habitCompletion(habit, logs);
      return {
        habit,
        completion,
        streak: habitStreak(habit, logs),
      };
    })
    .sort((a, b) => b.completion.pct - a.completion.pct || b.streak - a.streak)
    .slice(0, 3);
}

export function recentActivity(habits: Habit[], logs: HabitLog[]) {
  return logs
    .slice()
    .sort((a, b) => `${b.date}${b.updatedAt || b.createdAt}`.localeCompare(`${a.date}${a.updatedAt || a.createdAt}`))
    .slice(0, 6)
    .map((log) => ({ log, habit: habits.find((habit) => habit.id === log.habitId) }));
}
