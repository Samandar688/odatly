import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type Habit,
  type HabitLog,
  type HabitLogStatus,
  type NewHabitInput,
  createId,
  dateKey,
} from '../domain/habits';
import { mapHabit, mapHabitLog, supabase, type HabitLogRow, type HabitRow } from '../lib/supabase';
import { useAuth } from './authStore';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
}

interface UpsertLogInput {
  habitId: string;
  date?: string;
  status: HabitLogStatus;
  durationMinutes: number;
  note: string;
  mood: string;
}

interface HabitStoreValue extends HabitState {
  loading: boolean;
  storeError: string;
  isRemoteStore: boolean;
  addHabit: (input: NewHabitInput) => Promise<Habit>;
  toggleHabitActive: (habitId: string) => Promise<void>;
  upsertHabitLog: (input: UpsertLogInput) => Promise<HabitLog>;
  refresh: () => Promise<void>;
  clearLocalData: () => void;
  clearStoreError: () => void;
}

const EMPTY_STATE: HabitState = { habits: [], logs: [] };
const STORAGE_PREFIX = 'odatly.local.habits.v2';

const HabitStoreContext = createContext<HabitStoreValue | null>(null);

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}.${userId}`;
}

function loadInitialState(userId?: string): HabitState {
  if (typeof window === 'undefined' || !userId) return EMPTY_STATE;

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) return EMPTY_STATE;

  try {
    const parsed = JSON.parse(raw) as HabitState;
    if (!Array.isArray(parsed.habits) || !Array.isArray(parsed.logs)) {
      return EMPTY_STATE;
    }
    return parsed;
  } catch {
    return EMPTY_STATE;
  }
}

function saveLocalState(state: HabitState, userId?: string) {
  if (!supabase && userId) {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
  }
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<HabitState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);
  const [storeError, setStoreError] = useState('');

  const loadRemoteData = async () => {
    if (!supabase || !user) {
      if (supabase && !user) setState({ habits: [], logs: [] });
      return;
    }

    setLoading(true);
    setStoreError('');

    try {
      const [{ data: habitsData, error: habitsError }, { data: logsData, error: logsError }] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false }),
      ]);

      if (habitsError) throw habitsError;
      if (logsError) throw logsError;

      setState({
        habits: ((habitsData ?? []) as HabitRow[]).map(mapHabit),
        logs: ((logsData ?? []) as HabitLogRow[]).map(mapHabitLog),
      });
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : 'Ma’lumotlarni yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      void loadRemoteData();
      return;
    }

    setState(loadInitialState(user?.id));
  }, [user?.id]);

  useEffect(() => {
    saveLocalState(state, user?.id);
  }, [state, user?.id]);

  const value = useMemo<HabitStoreValue>(() => ({
    ...state,
    loading,
    storeError,
    isRemoteStore: Boolean(supabase),
    async addHabit(input) {
      setStoreError('');

      if (supabase) {
        if (!user) throw new Error('Avval login qiling.');

        const { data, error } = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            name: input.name,
            description: input.description,
            icon: input.icon,
            target: input.target,
            category: input.category,
            color: input.color,
            reminder_time: input.reminderTime,
            days_of_week: input.days,
            is_active: true,
          })
          .select('*')
          .single();

        if (error) {
          setStoreError(error.message);
          throw error;
        }

        const habit = mapHabit(data as HabitRow);
        setState((current) => ({ ...current, habits: [habit, ...current.habits] }));
        return habit;
      }

      const now = new Date().toISOString();
      const habit: Habit = {
        ...input,
        id: createId('habit'),
        active: true,
        createdAt: now,
      };

      setState((current) => ({
        ...current,
        habits: [habit, ...current.habits],
      }));

      return habit;
    },
    async toggleHabitActive(habitId) {
      setStoreError('');
      const existing = state.habits.find((habit) => habit.id === habitId);
      if (!existing) return;

      if (supabase) {
        const { data, error } = await supabase
          .from('habits')
          .update({ is_active: !existing.active })
          .eq('id', habitId)
          .select('*')
          .single();

        if (error) {
          setStoreError(error.message);
          throw error;
        }

        const updated = mapHabit(data as HabitRow);
        setState((current) => ({
          ...current,
          habits: current.habits.map((habit) => (habit.id === habitId ? updated : habit)),
        }));
        return;
      }

      setState((current) => ({
        ...current,
        habits: current.habits.map((habit) => (
          habit.id === habitId ? { ...habit, active: !habit.active } : habit
        )),
      }));
    },
    async upsertHabitLog(input) {
      setStoreError('');
      const targetDate = input.date ?? dateKey(new Date());

      if (supabase) {
        if (!user) throw new Error('Avval login qiling.');

        const payload = {
          user_id: user.id,
          habit_id: input.habitId,
          log_date: targetDate,
          status: input.status,
          duration_minutes: input.status === 'done' ? input.durationMinutes : 0,
          note: input.note,
          mood: input.status === 'done' ? input.mood : '',
        };

        const { data, error } = await supabase
          .from('habit_logs')
          .upsert(payload, { onConflict: 'habit_id,log_date' })
          .select('*')
          .single();

        if (error) {
          setStoreError(error.message);
          throw error;
        }

        const savedLog = mapHabitLog(data as HabitLogRow);
        setState((current) => {
          const exists = current.logs.some((log) => log.id === savedLog.id);
          return {
            ...current,
            logs: exists
              ? current.logs.map((log) => (log.id === savedLog.id ? savedLog : log))
              : [savedLog, ...current.logs],
          };
        });

        return savedLog;
      }

      const now = new Date().toISOString();
      let savedLog: HabitLog | undefined;

      setState((current) => {
        const existing = current.logs.find(
          (log) => log.habitId === input.habitId && log.date === targetDate,
        );

        savedLog = {
          id: existing?.id ?? createId('log'),
          habitId: input.habitId,
          date: targetDate,
          status: input.status,
          durationMinutes: input.status === 'done' ? input.durationMinutes : 0,
          note: input.note,
          mood: input.status === 'done' ? input.mood : '',
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

        const logs = existing
          ? current.logs.map((log) => (log.id === existing.id ? savedLog! : log))
          : [savedLog!, ...current.logs];

        return { ...current, logs };
      });

      return savedLog!;
    },
    async refresh() {
      await loadRemoteData();
    },
    clearLocalData() {
      if (supabase) return;
      if (user?.id) window.localStorage.removeItem(storageKey(user.id));
      setState(EMPTY_STATE);
    },
    clearStoreError() {
      setStoreError('');
    },
  }), [loading, state, storeError, user]);

  return (
    <HabitStoreContext.Provider value={value}>
      {children}
    </HabitStoreContext.Provider>
  );
}

export function useHabitStore() {
  const value = useContext(HabitStoreContext);
  if (!value) {
    throw new Error('useHabitStore must be used inside HabitProvider');
  }
  return value;
}
