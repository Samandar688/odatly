import { createClient } from '@supabase/supabase-js';
import type { DayLabel, Habit, HabitLog, HabitLogStatus } from '../domain/habits';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
  : null;

export interface Profile {
  id: string;
  fullName: string;
  email: string;
}

export interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  target: string;
  category: string;
  color: string;
  reminder_time: string;
  days_of_week: string[];
  is_active: boolean;
  created_at: string;
}

export interface HabitLogRow {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  status: HabitLogStatus;
  duration_minutes: number;
  note: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

export function mapProfile(row: { id: string; full_name: string | null; email: string | null }): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? '',
    email: row.email ?? '',
  };
}

export function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    icon: row.icon ?? '🌱',
    target: row.target,
    category: row.category,
    color: row.color,
    reminderTime: row.reminder_time ?? '',
    days: (row.days_of_week ?? []) as DayLabel[],
    active: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapHabitLog(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.log_date,
    status: row.status,
    durationMinutes: row.duration_minutes,
    note: row.note ?? '',
    mood: row.mood ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
