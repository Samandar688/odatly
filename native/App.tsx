import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#EEF4F0',
  bgSoft: '#F8FBF8',
  card: '#FFFFFF',
  primary: '#3CB878',
  primaryDark: '#2D9162',
  primaryLight: '#E8F5EE',
  orange: '#FF8B36',
  orangeLight: '#FFF0E6',
  teal: '#00A6B4',
  tealLight: '#E5F8FA',
  purple: '#6C63FF',
  purpleLight: '#EFEEFF',
  red: '#F87171',
  redLight: '#FFE8E8',
  ink: '#1C2035',
  muted: '#7B8088',
  faint: '#B8BBC4',
  border: 'rgba(28,32,53,0.08)',
};

const PROFILE_KEY = 'odatly.native.profile.v1';
const DATA_PREFIX = 'odatly.native.data.v1';
const DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const;
const TABS = ['today', 'habits', 'calendar', 'stats', 'profile'] as const;
const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const CATEGORIES = ["Sog'liq", 'Sport', "O'qish", 'Ish', 'Boshqa'];
const TARGET_PRESETS = ['10 daqiqa', '30 daqiqa', '1 marta', '2 litr'];
const HABIT_COLORS = [C.primary, C.orange, C.teal, C.purple, C.red];
const MOODS = ['Yaxshi', 'Normal', 'Qiyin'];

type Day = (typeof DAYS)[number];
type Tab = (typeof TABS)[number];
type LogStatus = 'done' | 'missed' | 'skipped';

interface Profile {
  id: string;
  fullName: string;
}

interface Habit {
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

interface HabitLog {
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

interface HabitData {
  habits: Habit[];
  logs: HabitLog[];
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function slugName(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user';
}

function dataKey(profile: Profile) {
  return `${DATA_PREFIX}.${profile.id}`;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dateKey(new Date());
}

function dayForDate(date: Date): Day {
  const index = date.getDay();
  return DAYS[index === 0 ? 6 : index - 1];
}

function todayDay(): Day {
  return dayForDate(new Date());
}

function isPlannedToday(habit: Habit) {
  return habit.active && habit.days.includes(todayDay());
}

function isPlannedOnDate(habit: Habit, date: Date) {
  return habit.active && habit.days.includes(dayForDate(date));
}

function logForToday(logs: HabitLog[], habitId: string) {
  const key = todayKey();
  return logs.find((log) => log.habitId === habitId && log.date === key);
}

function logForDate(logs: HabitLog[], habitId: string, date: Date) {
  const key = dateKey(date);
  return logs.find((log) => log.habitId === habitId && log.date === key);
}

function displayDate(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function recentDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

function completionForDate(habits: Habit[], logs: HabitLog[], date: Date) {
  const planned = habits.filter((habit) => isPlannedOnDate(habit, date));
  const done = planned.filter((habit) => logForDate(logs, habit.id, date)?.status === 'done').length;
  const pct = planned.length === 0 ? 0 : Math.round((done / planned.length) * 100);
  return { planned: planned.length, done, pct };
}

function currentStreak(habits: Habit[], logs: HabitLog[]) {
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

function completionStats(habits: Habit[], logs: HabitLog[]) {
  const planned = habits.filter(isPlannedToday);
  const done = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'done').length;
  const missed = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'missed').length;
  const skipped = planned.filter((habit) => logForToday(logs, habit.id)?.status === 'skipped').length;
  const pending = Math.max(planned.length - done - missed - skipped, 0);
  const pct = planned.length === 0 ? 0 : Math.round((done / planned.length) * 100);
  return { planned, done, missed, skipped, pending, pct };
}

function monthGrid(reference: Date) {
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

function daySummary(habits: Habit[], logs: HabitLog[], date: Date) {
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

function habitStreak(habit: Habit, logs: HabitLog[]) {
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

function habitCompletion(habit: Habit, logs: HabitLog[], days = 30) {
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

function logsForHabit(logs: HabitLog[], habitId: string) {
  return logs
    .filter((log) => log.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

function AppInner() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [tab, setTab] = useState<Tab>('today');
  const [screen, setScreen] = useState<'main' | 'add' | 'edit' | 'detail'>('main');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayKey());
  const [checkHabitId, setCheckHabitId] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<LogStatus>('done');
  const [checkDuration, setCheckDuration] = useState('30');
  const [checkMood, setCheckMood] = useState(MOODS[0]);
  const [checkNote, setCheckNote] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState('30 daqiqa');
  const [habitTime, setHabitTime] = useState('07:00');
  const [habitCategory, setHabitCategory] = useState("Sog'liq");
  const [habitColor, setHabitColor] = useState(HABIT_COLORS[0]);
  const [habitDays, setHabitDays] = useState<Day[]>(['Du', 'Se', 'Cho', 'Pa', 'Ju']);

  useEffect(() => {
    const load = async () => {
      const rawProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (rawProfile) {
        const parsedProfile = JSON.parse(rawProfile) as Profile;
        setProfile(parsedProfile);

        const rawData = await AsyncStorage.getItem(dataKey(parsedProfile));
        if (rawData) {
          const parsedData = JSON.parse(rawData) as HabitData;
          setHabits(Array.isArray(parsedData.habits) ? parsedData.habits : []);
          setLogs(Array.isArray(parsedData.logs) ? parsedData.logs : []);
        }
      }
      setReady(true);
    };

    void load();
  }, []);

  useEffect(() => {
    if (!ready || !profile) return;
    const data: HabitData = { habits, logs };
    void AsyncStorage.setItem(dataKey(profile), JSON.stringify(data));
  }, [habits, logs, profile, ready]);

  const stats = useMemo(() => completionStats(habits, logs), [habits, logs]);
  const checkHabit = useMemo(
    () => habits.find((habit) => habit.id === checkHabitId),
    [checkHabitId, habits],
  );
  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId),
    [selectedHabitId, habits],
  );

  const enterApp = async () => {
    const fullName = nameInput.trim();
    if (fullName.length < 2) return;

    const nextProfile: Profile = { id: slugName(fullName), fullName };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setHabits([]);
    setLogs([]);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(PROFILE_KEY);
    setProfile(null);
    setNameInput('');
    setHabits([]);
    setLogs([]);
    setTab('today');
    setScreen('main');
    setEditingHabitId(null);
    setSelectedHabitId(null);
    setCheckHabitId(null);
  };

  const resetHabitForm = () => {
    setHabitName('');
    setHabitTarget('30 daqiqa');
    setHabitTime('07:00');
    setHabitCategory("Sog'liq");
    setHabitColor(HABIT_COLORS[0]);
    setHabitDays(['Du', 'Se', 'Cho', 'Pa', 'Ju']);
    setEditingHabitId(null);
  };

  const openAddHabit = () => {
    resetHabitForm();
    setScreen('add');
  };

  const openEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setHabitTarget(habit.target);
    setHabitTime(habit.reminderTime);
    setHabitCategory(habit.category);
    setHabitColor(habit.color);
    setHabitDays(habit.days);
    setScreen('edit');
  };

  const openHabitDetail = (habit: Habit) => {
    setSelectedHabitId(habit.id);
    setScreen('detail');
  };

  const saveHabit = () => {
    const trimmedName = habitName.trim();
    if (!trimmedName || habitDays.length === 0) return;

    if (screen === 'edit' && editingHabitId) {
      setHabits((current) => current.map((habit) => (
        habit.id === editingHabitId
          ? {
            ...habit,
            name: trimmedName,
            target: habitTarget.trim() || '1 marta',
            category: habitCategory,
            reminderTime: habitTime.trim(),
            days: habitDays,
            color: habitColor,
          }
          : habit
      )));
      resetHabitForm();
      setTab('habits');
      setScreen('main');
      return;
    }

    const nextHabit: Habit = {
      id: makeId('habit'),
      name: trimmedName,
      target: habitTarget.trim() || '1 marta',
      category: habitCategory,
      reminderTime: habitTime.trim(),
      days: habitDays,
      color: habitColor,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setHabits((current) => [nextHabit, ...current]);
    resetHabitForm();
    setTab('habits');
    setScreen('main');
  };

  const deleteHabit = (habitId: string) => {
    Alert.alert(
      "Odatni o'chirish",
      "Bu odat va unga tegishli barcha loglar o'chadi.",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => {
            setHabits((current) => current.filter((habit) => habit.id !== habitId));
            setLogs((current) => current.filter((log) => log.habitId !== habitId));
            resetHabitForm();
            setSelectedHabitId(null);
            setScreen('main');
            setTab('habits');
          },
        },
      ],
    );
  };

  const toggleDay = (day: Day) => {
    setHabitDays((current) => (
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    ));
  };

  const openCheckIn = (habitId: string, status: LogStatus = 'done') => {
    const existing = logForToday(logs, habitId);
    setCheckHabitId(habitId);
    setCheckStatus(existing?.status ?? status);
    setCheckDuration(String(existing?.durationMinutes ?? 30));
    setCheckMood(existing?.mood || MOODS[0]);
    setCheckNote(existing?.note || '');
  };

  const closeCheckIn = () => {
    setCheckHabitId(null);
    setCheckStatus('done');
    setCheckDuration('30');
    setCheckMood(MOODS[0]);
    setCheckNote('');
  };

  const submitCheckIn = () => {
    if (!checkHabitId) return;

    const key = todayKey();
    const existing = logs.find((log) => log.habitId === checkHabitId && log.date === key);
    const duration = Math.max(0, Number.parseInt(checkDuration, 10) || 0);
    const nextLog: HabitLog = {
      id: existing?.id ?? makeId('log'),
      habitId: checkHabitId,
      date: key,
      status: checkStatus,
      durationMinutes: duration,
      mood: checkMood,
      note: checkNote.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLogs((current) => (
      existing
        ? current.map((log) => (log.id === existing.id ? nextLog : log))
        : [nextLog, ...current]
    ));
    closeCheckIn();
  };

  const toggleActive = (habitId: string) => {
    setHabits((current) => current.map((habit) => (
      habit.id === habitId ? { ...habit, active: !habit.active } : habit
    )));
  };

  if (!ready) {
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.logo}>Odatly</Text>
        <Text style={styles.muted}>Yuklanmoqda...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.authContent, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.authHero}>
            <View style={styles.authTopRow}>
              <Text style={styles.authBrand}>Odatly</Text>
              <View style={styles.authBadge}>
                <Text style={styles.authBadgeText}>Bugun</Text>
              </View>
            </View>
            <Text style={styles.authTitle}>Bugungi odatlaringizni tartiblang</Text>
            <Text style={styles.authText}>
              Ismingizni kiriting, birinchi odatingizni qo'shing va bugungi progressni kuzating.
            </Text>
            <View style={styles.authPreview}>
              <View style={styles.previewLineWide} />
              <View style={styles.previewLine} />
              <View style={styles.previewRow}>
                <View style={styles.previewDot} />
                <View style={styles.previewBar} />
              </View>
            </View>
          </View>

          <View style={styles.authPanel}>
            <Text style={styles.label}>Ism</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Masalan: Samandar"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={enterApp}
            />
            <Pressable
              onPress={enterApp}
              disabled={nameInput.trim().length < 2}
              style={({ pressed }) => [
                styles.primaryButton,
                nameInput.trim().length < 2 && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Davom etish</Text>
            </Pressable>
            <Text style={styles.authFootnote}>Parol kerak emas. Odatlaringiz shu qurilmada saqlanadi.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'add' || screen === 'edit') {
    const isEditing = screen === 'edit' && editingHabitId !== null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.screenContent, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => {
                resetHabitForm();
                setScreen('main');
              }}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>{'<'}</Text>
            </Pressable>
            <View style={styles.flex}>
              <Text style={styles.pageTitle}>{isEditing ? 'Odatni tahrirlash' : 'Yangi odat'}</Text>
              <Text style={styles.muted}>{isEditing ? "Odat ma'lumotlarini yangilang." : 'Reja, kunlar va eslatma vaqtini belgilang.'}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Odat nomi</Text>
            <TextInput
              value={habitName}
              onChangeText={setHabitName}
              placeholder="Masalan: Ertalab yurish"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
            />
            <Text style={styles.label}>Maqsad</Text>
            <TextInput
              value={habitTarget}
              onChangeText={setHabitTarget}
              placeholder="30 daqiqa"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
            />
            <View style={styles.quickTargetRow}>
              {TARGET_PRESETS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={habitTarget === item}
                  onPress={() => setHabitTarget(item)}
                />
              ))}
            </View>
            <Text style={styles.label}>Eslatma vaqti</Text>
            <TextInput
              value={habitTime}
              onChangeText={setHabitTime}
              placeholder="07:00"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Kategoriya</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={habitCategory === item}
                  onPress={() => setHabitCategory(item)}
                />
              ))}
            </View>
            <Text style={styles.label}>Rang</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setHabitColor(item)}
                  style={[styles.colorSwatch, { backgroundColor: item }, habitColor === item && styles.colorSwatchActive]}
                />
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Haftaning kunlari</Text>
            <View style={styles.dayRow}>
              {DAYS.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, habitDays.includes(day) && styles.dayChipActive]}
                >
                  <Text style={[styles.dayText, habitDays.includes(day) && styles.dayTextActive]}>{day}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={saveHabit}
            disabled={!habitName.trim() || habitDays.length === 0}
            style={({ pressed }) => [
              styles.primaryButton,
              (!habitName.trim() || habitDays.length === 0) && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>{isEditing ? 'Yangilash' : 'Saqlash'}</Text>
          </Pressable>

          {isEditing && (
            <Pressable onPress={() => editingHabitId && deleteHabit(editingHabitId)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Odatni o'chirish</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 118 },
        ]}
      >
        {screen === 'detail' && selectedHabit && (
          <HabitDetailScreen
            habit={selectedHabit}
            logs={logs}
            onBack={() => {
              setSelectedHabitId(null);
              setScreen('main');
            }}
            onEdit={() => openEditHabit(selectedHabit)}
            onCheckIn={() => openCheckIn(selectedHabit.id, 'done')}
            onToggle={() => toggleActive(selectedHabit.id)}
            onDelete={() => deleteHabit(selectedHabit.id)}
          />
        )}
        {screen === 'main' && tab === 'today' && (
          <TodayScreen
            profile={profile}
            habits={habits}
            logs={logs}
            stats={stats}
            onAdd={openAddHabit}
            onCheckIn={openCheckIn}
            onOpenDetail={openHabitDetail}
          />
        )}
        {screen === 'main' && tab === 'habits' && (
          <HabitsScreen
            habits={habits}
            logs={logs}
            onAdd={openAddHabit}
            onEdit={openEditHabit}
            onOpenDetail={openHabitDetail}
            onToggle={toggleActive}
          />
        )}
        {screen === 'main' && tab === 'calendar' && (
          <CalendarScreen
            habits={habits}
            logs={logs}
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
            onAdd={openAddHabit}
            onOpenDetail={openHabitDetail}
            onCheckIn={openCheckIn}
          />
        )}
        {screen === 'main' && tab === 'stats' && <StatsScreen habits={habits} logs={logs} />}
        {screen === 'main' && tab === 'profile' && <ProfileScreen profile={profile} habits={habits} onSignOut={signOut} />}
      </ScrollView>

      {screen === 'main' && tab !== 'profile' && (
        <Pressable
          onPress={openAddHabit}
          style={({ pressed }) => [
            styles.fab,
            { bottom: Math.max(insets.bottom, 10) + 74 },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {screen === 'main' && (
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TabButton label="Bugun" active={tab === 'today'} onPress={() => setTab('today')} />
          <TabButton label="Odatlar" active={tab === 'habits'} onPress={() => setTab('habits')} />
          <TabButton label="Kalendar" active={tab === 'calendar'} onPress={() => setTab('calendar')} />
          <TabButton label="Stat" active={tab === 'stats'} onPress={() => setTab('stats')} />
          <TabButton label="Profil" active={tab === 'profile'} onPress={() => setTab('profile')} />
        </View>
      )}

      <Modal visible={Boolean(checkHabit)} transparent animationType="slide" onRequestClose={closeCheckIn}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDim} onPress={closeCheckIn} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetWrap}
          >
            <View style={[styles.checkSheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={[styles.habitIcon, { backgroundColor: `${checkHabit?.color || C.primary}1F` }]}>
                  <Text style={[styles.habitIconText, { color: checkHabit?.color || C.primary }]}>
                    {checkHabit?.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.sheetTitle}>{checkHabit?.name}</Text>
                  <Text style={styles.muted}>Bugungi check-in</Text>
                </View>
              </View>

              <View style={styles.statusSegment}>
                <StatusChoice label="Bajardim" value="done" active={checkStatus === 'done'} onPress={() => setCheckStatus('done')} />
                <StatusChoice label="Bajarmadim" value="missed" active={checkStatus === 'missed'} onPress={() => setCheckStatus('missed')} />
                <StatusChoice label="O'tkazdim" value="skipped" active={checkStatus === 'skipped'} onPress={() => setCheckStatus('skipped')} />
              </View>

              <View style={styles.sheetFieldRow}>
                <View style={styles.sheetField}>
                  <Text style={styles.label}>Daqiqa</Text>
                  <TextInput
                    value={checkDuration}
                    onChangeText={setCheckDuration}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor="#9AA1A9"
                    style={styles.input}
                  />
                </View>
                <View style={styles.sheetField}>
                  <Text style={styles.label}>Kayfiyat</Text>
                  <View style={styles.moodRow}>
                    {MOODS.map((mood) => (
                      <Chip
                        key={mood}
                        label={mood}
                        active={checkMood === mood}
                        onPress={() => setCheckMood(mood)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Izoh</Text>
              <TextInput
                value={checkNote}
                onChangeText={setCheckNote}
                placeholder="Masalan: bugun yengilroq bajardim"
                placeholderTextColor="#9AA1A9"
                style={[styles.input, styles.noteInput]}
                multiline
              />

              <Pressable onPress={submitCheckIn} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Check-inni saqlash</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function TodayScreen({
  profile,
  habits,
  logs,
  stats,
  onAdd,
  onCheckIn,
  onOpenDetail,
}: {
  profile: Profile;
  habits: Habit[];
  logs: HabitLog[];
  stats: ReturnType<typeof completionStats>;
  onAdd: () => void;
  onCheckIn: (habitId: string, status: LogStatus) => void;
  onOpenDetail: (habit: Habit) => void;
}) {
  const firstName = profile.fullName.split(' ')[0];
  const streak = currentStreak(habits, logs);
  const weekly = recentDays(7);

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroOverline}>Bugun, {displayDate(new Date())}</Text>
            <Text style={styles.heroTitle}>Salom, {firstName}</Text>
          </View>
          <View style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>{stats.pct}%</Text>
            <Text style={styles.heroScoreLabel}>progress</Text>
          </View>
        </View>
        <Text style={styles.heroText}>Kichik qadamlar bugun boshlanadi. Rejadagi odatlarni birma-bir belgilang.</Text>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{stats.done}/{stats.planned.length}</Text>
            <Text style={styles.heroMetaLabel}>bajarildi</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{streak}</Text>
            <Text style={styles.heroMetaLabel}>streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>{stats.pct}%</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>Bugungi progress</Text>
          <Text style={styles.muted}>
            {stats.planned.length === 0 ? "Bugun odat yo'q" : `${stats.done}/${stats.planned.length} odat bajarildi`}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats.pct}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <MiniMetric label="Kutilmoqda" value={String(stats.pending)} tone="neutral" />
        <MiniMetric label="O'tkazildi" value={String(stats.skipped)} tone="warn" />
        <MiniMetric label="Bajarilmadi" value={String(stats.missed)} tone="danger" />
      </View>

      <View style={styles.weekCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Haftalik ritm</Text>
          <Text style={styles.muted}>Oxirgi 7 kun</Text>
        </View>
        <View style={styles.weekRow}>
          {weekly.map((date) => {
            const dayStats = completionForDate(habits, logs, date);
            return (
              <View key={dateKey(date)} style={styles.weekDay}>
                <View style={styles.weekBarTrack}>
                  <View style={[styles.weekBarFill, { height: `${Math.max(dayStats.pct, dayStats.planned ? 10 : 0)}%` }]} />
                </View>
                <Text style={styles.weekDayText}>{dayForDate(date)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <SectionHeader title="Bugungi odatlar" action="Qo'shish" onPress={onAdd} />
      {stats.planned.length === 0 ? (
        <EmptyState
          title="Hozircha odat yo'q"
          text="Birinchi odatingizni qo'shing va bugundan boshlang."
          action="Odat qo'shish"
          onPress={onAdd}
        />
      ) : (
        stats.planned.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            log={logForToday(logs, habit.id)}
            onCheckIn={onCheckIn}
            onOpenDetail={onOpenDetail}
          />
        ))
      )}
    </>
  );
}

function HabitsScreen({
  habits,
  logs,
  onAdd,
  onEdit,
  onOpenDetail,
  onToggle,
}: {
  habits: Habit[];
  logs: HabitLog[];
  onAdd: () => void;
  onEdit: (habit: Habit) => void;
  onOpenDetail: (habit: Habit) => void;
  onToggle: (habitId: string) => void;
}) {
  const activeCount = habits.filter((habit) => habit.active).length;

  return (
    <>
      <View style={styles.pageHero}>
        <Text style={styles.pageHeroTitle}>Odatlarim</Text>
        <Text style={styles.pageHeroText}>{activeCount} ta faol odat, jami {habits.length} ta reja.</Text>
      </View>

      <SectionHeader title="Odatlarim" action="Yangi" onPress={onAdd} />
      {habits.length === 0 ? (
        <EmptyState title="Ro'yxat bo'sh" text="Odat qo'shsangiz, shu yerda ko'rinadi." action="Odat qo'shish" onPress={onAdd} />
      ) : (
        habits.map((habit) => (
          <View key={habit.id} style={[styles.habitListCard, !habit.active && styles.inactiveCard]}>
            <View style={[styles.habitColorRail, { backgroundColor: habit.color }]} />
            <View style={styles.habitHeader}>
              <View style={[styles.habitIcon, { backgroundColor: `${habit.color}1F` }]}>
                <Text style={[styles.habitIconText, { color: habit.color }]}>{habit.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.muted}>{habit.category} - {habit.target}</Text>
              </View>
              <View style={styles.habitActions}>
                <Pressable onPress={() => onOpenDetail(habit)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Batafsil</Text>
                </Pressable>
                <Pressable onPress={() => onEdit(habit)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Tahrir</Text>
                </Pressable>
                <Pressable onPress={() => onToggle(habit.id)} style={[styles.smallButton, habit.active ? styles.successSoft : styles.neutralSoft]}>
                  <Text style={[styles.smallButtonText, habit.active ? styles.successText : styles.mutedText]}>
                    {habit.active ? 'Faol' : 'Pauza'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.habitMetaRow}>
              <Text style={styles.habitMetaText}>{habit.days.join(', ')}</Text>
              <Text style={styles.habitMetaText}>{habit.reminderTime || "eslatma yo'q"}</Text>
            </View>
            <View style={styles.statusLine}>
              <Text style={styles.muted}>Bugun</Text>
              <View style={[styles.statusPill, statusStyle(logForToday(logs, habit.id)?.status)]}>
                <Text style={[styles.statusText, statusTextStyle(logForToday(logs, habit.id)?.status)]}>
                  {statusLabel(logForToday(logs, habit.id)?.status)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </>
  );
}

function StatsScreen({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const stats = completionStats(habits, logs);
  const doneLogs = logs.filter((log) => log.status === 'done').length;
  const missedLogs = logs.filter((log) => log.status === 'missed').length;
  const skippedLogs = logs.filter((log) => log.status === 'skipped').length;
  const streak = currentStreak(habits, logs);
  const weekly = recentDays(7);

  return (
    <>
      <View style={styles.pageHero}>
        <Text style={styles.pageHeroTitle}>Statistika</Text>
        <Text style={styles.pageHeroText}>Bugungi progress va oxirgi 7 kunlik ritm.</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Bugun" value={`${stats.done}/${stats.planned.length}`} />
        <StatCard label="Foiz" value={`${stats.pct}%`} />
        <StatCard label="Streak" value={`${streak} kun`} />
        <StatCard label="Jami bajarildi" value={String(doneLogs)} />
      </View>

      <View style={styles.weekCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>7 kunlik chart</Text>
          <Text style={styles.muted}>Bajarilish foizi</Text>
        </View>
        <View style={styles.weekRow}>
          {weekly.map((date) => {
            const dayStats = completionForDate(habits, logs, date);
            return (
              <View key={dateKey(date)} style={styles.weekDay}>
                <View style={styles.weekBarTrack}>
                  <View style={[styles.weekBarFill, { height: `${Math.max(dayStats.pct, dayStats.planned ? 10 : 0)}%` }]} />
                </View>
                <Text style={styles.weekDayText}>{dayForDate(date)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Umumiy loglar</Text>
        <View style={styles.logRow}>
          <Text style={styles.muted}>Bajarildi</Text>
          <Text style={styles.logValue}>{doneLogs}</Text>
        </View>
        <View style={styles.logRow}>
          <Text style={styles.muted}>Bajarilmadi</Text>
          <Text style={styles.logValue}>{missedLogs}</Text>
        </View>
        <View style={styles.logRow}>
          <Text style={styles.muted}>O'tkazildi</Text>
          <Text style={styles.logValue}>{skippedLogs}</Text>
        </View>
      </View>
    </>
  );
}

function CalendarScreen({
  habits,
  logs,
  selectedDate,
  onSelectDate,
  onAdd,
  onOpenDetail,
  onCheckIn,
}: {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
  onOpenDetail: (habit: Habit) => void;
  onCheckIn: (habitId: string, status: LogStatus) => void;
}) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  const days = monthGrid(selected);
  const selectedSummary = daySummary(habits, logs, selected);
  const monthTitle = `${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`;

  return (
    <>
      <View style={styles.pageHero}>
        <Text style={styles.pageHeroTitle}>Kalendar</Text>
        <Text style={styles.pageHeroText}>Kunlar real check-in holati bo'yicha ranglanadi.</Text>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>{monthTitle}</Text>
          <Text style={styles.muted}>{selectedSummary.done}/{selectedSummary.planned.length} bajarildi</Text>
        </View>
        <View style={styles.calendarWeekdays}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.calendarWeekday}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {days.map((date) => {
            const summary = daySummary(habits, logs, date);
            const key = dateKey(date);
            const isCurrentMonth = date.getMonth() === selected.getMonth();
            const isSelected = key === selectedDate;

            return (
              <Pressable
                key={key}
                onPress={() => onSelectDate(key)}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                  !isCurrentMonth && styles.calendarDayMuted,
                ]}
              >
                <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{date.getDate()}</Text>
                <View style={[styles.calendarDot, calendarToneStyle(summary.tone)]} />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.calendarLegend}>
          <LegendDot label="Bajarildi" tone="done" />
          <LegendDot label="Qisman" tone="partial" />
          <LegendDot label="Bajarilmadi" tone="missed" />
        </View>
      </View>

      <SectionHeader title={`${displayDate(selected)} rejasi`} action="Yangi" onPress={onAdd} />
      {selectedSummary.planned.length === 0 ? (
        <EmptyState
          title="Bu kunda reja yo'q"
          text="Haftalik kunlarga mos odat qo'shsangiz, kalendarda ko'rinadi."
          action="Odat qo'shish"
          onPress={onAdd}
        />
      ) : (
        selectedSummary.planned.map((habit) => {
          const log = logForDate(logs, habit.id, selected);
          const isToday = selectedDate === todayKey();

          return (
            <View key={habit.id} style={styles.calendarHabitCard}>
              <Pressable onPress={() => onOpenDetail(habit)} style={styles.habitMainPress}>
                <View style={[styles.habitIcon, { backgroundColor: `${habit.color}1F` }]}>
                  <Text style={[styles.habitIconText, { color: habit.color }]}>{habit.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.muted}>{habit.target} - {habit.reminderTime || "eslatma yo'q"}</Text>
                </View>
              </Pressable>
              <View style={[styles.statusPill, statusStyle(log?.status)]}>
                <Text style={[styles.statusText, statusTextStyle(log?.status)]}>{statusLabel(log?.status)}</Text>
              </View>
              {isToday && (
                <Pressable onPress={() => onCheckIn(habit.id, 'done')} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Check-in</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </>
  );
}

function HabitDetailScreen({
  habit,
  logs,
  onBack,
  onEdit,
  onCheckIn,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  logs: HabitLog[];
  onBack: () => void;
  onEdit: () => void;
  onCheckIn: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const completion = habitCompletion(habit, logs);
  const streak = habitStreak(habit, logs);
  const recent = logsForHabit(logs, habit.id);

  return (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>{'<'}</Text>
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.pageTitle}>Odat tafsiloti</Text>
          <Text style={styles.muted}>Schedule, progress va check-in tarixi.</Text>
        </View>
      </View>

      <View style={[styles.detailHero, { backgroundColor: habit.color }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.flex}>
            <Text style={styles.detailCategory}>{habit.category}</Text>
            <Text style={styles.detailTitle}>{habit.name}</Text>
            <Text style={styles.detailText}>{habit.target} - {habit.reminderTime || "eslatma yo'q"}</Text>
          </View>
          <View style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>{completion.pct}%</Text>
            <Text style={styles.heroScoreLabel}>30 kun</Text>
          </View>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{streak}</Text>
            <Text style={styles.heroMetaLabel}>streak</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{completion.done}/{completion.planned}</Text>
            <Text style={styles.heroMetaLabel}>bajarildi</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailActions}>
        <Pressable onPress={onCheckIn} style={[styles.primaryButton, styles.detailActionButton]}>
          <Text style={styles.primaryButtonText}>Bugun check-in</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={[styles.smallButton, styles.detailSmallAction]}>
          <Text style={styles.smallButtonText}>Tahrir</Text>
        </Pressable>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Haftalik reja</Text>
        <View style={styles.dayRow}>
          {DAYS.map((day) => (
            <View key={day} style={[styles.dayChip, habit.days.includes(day) && { backgroundColor: habit.color }]}>
              <Text style={[styles.dayText, habit.days.includes(day) && styles.dayTextActive]}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Joriy streak" value={`${streak} kun`} />
        <StatCard label="30 kun foiz" value={`${completion.pct}%`} />
      </View>

      <View style={styles.formCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Oxirgi check-inlar</Text>
          <Pressable onPress={onToggle} style={[styles.smallButton, habit.active ? styles.successSoft : styles.neutralSoft]}>
            <Text style={[styles.smallButtonText, habit.active ? styles.successText : styles.mutedText]}>
              {habit.active ? 'Faol' : 'Pauza'}
            </Text>
          </Pressable>
        </View>
        {recent.length === 0 ? (
          <Text style={styles.muted}>Hali check-in yo'q.</Text>
        ) : (
          recent.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.flex}>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.muted}>
                  {log.durationMinutes ? `${log.durationMinutes} daqiqa` : "Daqiqa yo'q"} - {log.mood || "kayfiyat yo'q"}
                </Text>
                {Boolean(log.note) && <Text style={styles.logPreviewNote}>{log.note}</Text>}
              </View>
              <View style={[styles.statusPill, statusStyle(log.status)]}>
                <Text style={[styles.statusText, statusTextStyle(log.status)]}>{statusLabel(log.status)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Pressable onPress={onDelete} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Odatni o'chirish</Text>
      </Pressable>
    </>
  );
}

function ProfileScreen({
  profile,
  habits,
  onSignOut,
}: {
  profile: Profile;
  habits: Habit[];
  onSignOut: () => void;
}) {
  const activeCount = habits.filter((habit) => habit.active).length;

  return (
    <>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.fullName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <Text style={styles.profileSub}>{habits.length} ta odat</Text>
        </View>
      </View>
      <View style={styles.profileStatsRow}>
        <MiniMetric label="Faol" value={String(activeCount)} tone="neutral" />
        <MiniMetric label="Jami" value={String(habits.length)} tone="neutral" />
        <MiniMetric label="Arxiv" value={String(Math.max(habits.length - activeCount, 0))} tone="neutral" />
      </View>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Profil holati</Text>
        <Text style={styles.muted}>Data shu qurilmada saqlanmoqda. Chiqish qilsangiz faqat profil sessiyasi yopiladi.</Text>
      </View>
      <Pressable onPress={onSignOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Chiqish</Text>
      </Pressable>
    </>
  );
}

function HabitCard({
  habit,
  log,
  onCheckIn,
  onOpenDetail,
}: {
  habit: Habit;
  log?: HabitLog;
  onCheckIn: (habitId: string, status: LogStatus) => void;
  onOpenDetail: (habit: Habit) => void;
}) {
  return (
    <View style={styles.habitTaskCard}>
      <View style={[styles.habitColorRail, { backgroundColor: habit.color }]} />
      <View style={styles.habitHeader}>
        <Pressable onPress={() => onOpenDetail(habit)} style={styles.habitMainPress}>
          <View style={[styles.habitIcon, { backgroundColor: `${habit.color}1F` }]}>
            <Text style={[styles.habitIconText, { color: habit.color }]}>{habit.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.muted}>{habit.category} - {habit.target}</Text>
          </View>
        </Pressable>
        <View style={[styles.statusPill, statusStyle(log?.status)]}>
          <Text style={[styles.statusText, statusTextStyle(log?.status)]}>{statusLabel(log?.status)}</Text>
        </View>
      </View>
      <View style={styles.habitMetaRow}>
        <Text style={styles.habitMetaText}>{habit.reminderTime || "eslatma yo'q"}</Text>
        <Text style={styles.habitMetaText}>{habit.days.join(', ')}</Text>
      </View>
      {log && (
        <View style={styles.logPreview}>
          <Text style={styles.logPreviewText}>
            {log.durationMinutes ? `${log.durationMinutes} daqiqa` : 'Daqiqa kiritilmagan'} - {log.mood || "Kayfiyat yo'q"}
          </Text>
          {Boolean(log.note) && <Text style={styles.logPreviewNote}>{log.note}</Text>}
        </View>
      )}
      <View style={styles.checkRow}>
        <ActionButton label="Bajardim" tone="success" onPress={() => onCheckIn(habit.id, 'done')} />
        <ActionButton label="Bajarmadim" tone="danger" onPress={() => onCheckIn(habit.id, 'missed')} />
        <ActionButton label="O'tkazdim" tone="warn" onPress={() => onCheckIn(habit.id, 'skipped')} />
      </View>
    </View>
  );
}

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.linkText}>{action}</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({
  title,
  text,
  action,
  onPress,
}: {
  title: string;
  text: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>+</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      <Pressable onPress={onPress} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{action}</Text>
      </Pressable>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, tone, onPress }: { label: string; tone: 'success' | 'danger' | 'warn'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, tone === 'success' && styles.successSoft, tone === 'danger' && styles.dangerSoft, tone === 'warn' && styles.warnSoft]}>
      <Text style={[styles.actionText, tone === 'success' && styles.successText, tone === 'danger' && styles.dangerText, tone === 'warn' && styles.warnText]}>{label}</Text>
    </Pressable>
  );
}

function StatusChoice({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: LogStatus;
  active: boolean;
  onPress: () => void;
}) {
  const toneStyle = value === 'done' ? styles.successText : value === 'missed' ? styles.dangerText : styles.warnText;

  return (
    <Pressable onPress={onPress} style={[styles.statusChoice, active && styles.statusChoiceActive]}>
      <Text style={[styles.statusChoiceText, active && toneStyle]}>{label}</Text>
    </Pressable>
  );
}

function LegendDot({ label, tone }: { label: string; tone: 'done' | 'partial' | 'missed' }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, calendarToneStyle(tone)]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'warn' | 'danger' }) {
  return (
    <View style={[styles.miniMetric, tone === 'warn' && styles.warnSoft, tone === 'danger' && styles.dangerSoft]}>
      <Text style={[styles.miniMetricValue, tone === 'warn' && styles.warnText, tone === 'danger' && styles.dangerText]}>{value}</Text>
      <Text style={styles.miniMetricLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function statusLabel(status?: LogStatus) {
  if (status === 'done') return 'Bajarildi';
  if (status === 'missed') return 'Bajarilmadi';
  if (status === 'skipped') return "O'tkazildi";
  return 'Kutilmoqda';
}

function statusStyle(status?: LogStatus) {
  if (status === 'done') return styles.successSoft;
  if (status === 'missed') return styles.dangerSoft;
  if (status === 'skipped') return styles.warnSoft;
  return styles.neutralSoft;
}

function statusTextStyle(status?: LogStatus) {
  if (status === 'done') return styles.successText;
  if (status === 'missed') return styles.dangerText;
  if (status === 'skipped') return styles.warnText;
  return styles.mutedText;
}

function calendarToneStyle(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return styles.calendarDone;
  if (tone === 'partial') return styles.calendarPartial;
  if (tone === 'missed') return styles.calendarMissed;
  if (tone === 'future') return styles.calendarFuture;
  return styles.calendarNone;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    gap: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: C.primary,
  },
  authContent: {
    flexGrow: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 20,
  },
  authHero: {
    backgroundColor: C.primary,
    borderRadius: 28,
    padding: 24,
    gap: 12,
    shadowColor: C.primaryDark,
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  authTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authBrand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  authBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  authBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  authTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  authText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
  authPreview: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  previewLineWide: {
    width: '72%',
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  previewLine: {
    width: '48%',
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewDot: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  previewBar: {
    flex: 1,
    height: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  authPanel: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  authFootnote: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  screenContent: {
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  iconButtonText: {
    color: C.ink,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '900',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.ink,
  },
  hero: {
    backgroundColor: C.primary,
    borderRadius: 28,
    padding: 22,
    gap: 14,
    shadowColor: C.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroOverline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
  heroScore: {
    minWidth: 74,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  heroScoreValue: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
  },
  heroScoreLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '700',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetaPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 12,
  },
  heroMetaValue: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  pageHero: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  pageHeroTitle: {
    color: C.ink,
    fontSize: 23,
    fontWeight: '900',
  },
  pageHeroText: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  formCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.62,
  },
  progressCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  progressCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: C.primaryLight,
    borderWidth: 8,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: C.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 8,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniMetric: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniMetricValue: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  miniMetricLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  weekCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 104,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  weekBarTrack: {
    width: '100%',
    height: 72,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  weekBarFill: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  weekDayText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: C.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  linkText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#F6F7F9',
    color: C.ink,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickTargetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: C.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: C.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: C.red,
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  muted: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  mutedText: {
    color: C.muted,
  },
  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    color: C.primary,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
  emptyTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 6,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitMainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitTaskCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 16,
    paddingLeft: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  habitListCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 16,
    paddingLeft: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  habitColorRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIconText: {
    color: C.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  habitName: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  habitMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: C.bgSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  habitMetaText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  habitActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  checkRow: {
    flexDirection: 'row',
    gap: 8,
  },
  logPreview: {
    backgroundColor: C.bgSoft,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  logPreviewText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  logPreviewNote: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  successSoft: { backgroundColor: C.primaryLight },
  dangerSoft: { backgroundColor: C.redLight },
  warnSoft: { backgroundColor: C.orangeLight },
  neutralSoft: { backgroundColor: '#EEF0EE' },
  successText: { color: C.primary },
  dangerText: { color: C.red },
  warnText: { color: C.orange },
  smallButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF0EE',
  },
  smallButtonText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#EEF0EE',
  },
  chipActive: {
    backgroundColor: C.primaryLight,
  },
  chipText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: C.primary,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: C.ink,
    transform: [{ scale: 1.04 }],
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 13,
    backgroundColor: '#EEF0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: C.primary,
  },
  dayText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  dayTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  statValue: {
    color: C.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  logRow: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: C.bgSoft,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logValue: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  logDate: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  calendarCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarWeekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: C.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
  },
  calendarDaySelected: {
    backgroundColor: C.primaryLight,
  },
  calendarDayMuted: {
    opacity: 0.35,
  },
  calendarDayText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  calendarDayTextSelected: {
    color: C.primaryDark,
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  calendarDone: {
    backgroundColor: C.primary,
  },
  calendarPartial: {
    backgroundColor: C.orange,
  },
  calendarMissed: {
    backgroundColor: C.red,
  },
  calendarFuture: {
    backgroundColor: C.faint,
  },
  calendarNone: {
    backgroundColor: 'transparent',
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  calendarHabitCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  detailHero: {
    borderRadius: 28,
    padding: 22,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  detailCategory: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontWeight: '800',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 2,
  },
  detailText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailActionButton: {
    flex: 1,
  },
  detailSmallAction: {
    minHeight: 52,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  profileCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: C.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  profileName: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  profileSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 2,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28,32,53,0.36)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  checkSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DCE1E0',
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  statusSegment: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: C.bgSoft,
    borderRadius: 18,
    padding: 6,
  },
  statusChoice: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  statusChoiceActive: {
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusChoiceText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  sheetFieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetField: {
    flex: 1,
    gap: 8,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  noteInput: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: C.primaryLight,
  },
  tabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  tabTextActive: {
    color: C.primary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primaryDark,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  fabText: {
    color: '#fff',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
});
