import { DAYS, TABS } from './constants';

export type Day = (typeof DAYS)[number];
export type Tab = (typeof TABS)[number];
export type LogStatus = 'done' | 'missed' | 'skipped';
export type HistoryTone = LogStatus | 'pending' | 'off';

export interface Profile {
  id: string;
  fullName: string;
}

export interface Habit {
  id: string;
  name: string;
  target: string;
  category: string;
  reminderTime: string;
  days: Day[];
  color: string;
  active: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: LogStatus;
  durationMinutes?: number;
  mood?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HabitData {
  habits: Habit[];
  logs: HabitLog[];
}
