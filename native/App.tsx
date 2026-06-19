import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
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
  bg: '#F0F4F1',
  card: '#FFFFFF',
  primary: '#3CB878',
  primaryDark: '#2D9162',
  primaryLight: '#E8F5EE',
  orange: '#FF8B36',
  orangeLight: '#FFF0E6',
  red: '#F87171',
  redLight: '#FFE8E8',
  ink: '#1C2035',
  muted: '#7B8088',
  border: 'rgba(28,32,53,0.08)',
};

const PROFILE_KEY = 'odatly.native.profile.v1';
const DATA_PREFIX = 'odatly.native.data.v1';
const DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const;
const TABS = ['today', 'habits', 'stats', 'profile'] as const;

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
  createdAt: string;
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

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayDay(): Day {
  const index = new Date().getDay();
  return DAYS[index === 0 ? 6 : index - 1];
}

function isPlannedToday(habit: Habit) {
  return habit.active && habit.days.includes(todayDay());
}

function logForToday(logs: HabitLog[], habitId: string) {
  const key = todayKey();
  return logs.find((log) => log.habitId === habitId && log.date === key);
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

function AppInner() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [tab, setTab] = useState<Tab>('today');
  const [screen, setScreen] = useState<'main' | 'add'>('main');
  const [nameInput, setNameInput] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState('30 daqiqa');
  const [habitTime, setHabitTime] = useState('07:00');
  const [habitCategory, setHabitCategory] = useState("Sog'liq");
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
  const activeHabits = useMemo(() => habits.filter((habit) => habit.active), [habits]);

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
  };

  const addHabit = () => {
    const trimmedName = habitName.trim();
    if (!trimmedName || habitDays.length === 0) return;

    const nextHabit: Habit = {
      id: makeId('habit'),
      name: trimmedName,
      target: habitTarget.trim() || '1 marta',
      category: habitCategory,
      reminderTime: habitTime.trim(),
      days: habitDays,
      color: C.primary,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setHabits((current) => [nextHabit, ...current]);
    setHabitName('');
    setHabitTarget('30 daqiqa');
    setHabitTime('07:00');
    setHabitCategory("Sog'liq");
    setHabitDays(['Du', 'Se', 'Cho', 'Pa', 'Ju']);
    setTab('habits');
    setScreen('main');
  };

  const toggleDay = (day: Day) => {
    setHabitDays((current) => (
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    ));
  };

  const checkIn = (habitId: string, status: LogStatus) => {
    const key = todayKey();
    const existing = logs.find((log) => log.habitId === habitId && log.date === key);
    const nextLog: HabitLog = {
      id: existing?.id ?? makeId('log'),
      habitId,
      date: key,
      status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    setLogs((current) => (
      existing
        ? current.map((log) => (log.id === existing.id ? nextLog : log))
        : [nextLog, ...current]
    ));
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
            <Text style={styles.authBrand}>Odatly</Text>
            <Text style={styles.authTitle}>Ismingiz bilan boshlang</Text>
            <Text style={styles.authText}>
              Hozircha ortiqcha ro'yxatdan o'tish yo'q. Odatlaringizni qo'shing va bugungi natijani belgilang.
            </Text>
          </View>

          <View style={styles.card}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'add') {
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
            <Pressable onPress={() => setScreen('main')} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Yangi odat</Text>
          </View>

          <View style={styles.card}>
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
            <Text style={styles.label}>Eslatma vaqti</Text>
            <TextInput
              value={habitTime}
              onChangeText={setHabitTime}
              placeholder="07:00"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Kategoriya</Text>
            <View style={styles.chipWrap}>
              {["Sog'liq", 'Sport', "O'qish", 'Ish', 'Boshqa'].map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={habitCategory === item}
                  onPress={() => setHabitCategory(item)}
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
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
            onPress={addHabit}
            disabled={!habitName.trim() || habitDays.length === 0}
            style={({ pressed }) => [
              styles.primaryButton,
              (!habitName.trim() || habitDays.length === 0) && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Saqlash</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 92 },
        ]}
      >
        {tab === 'today' && (
          <TodayScreen
            profile={profile}
            habits={habits}
            logs={logs}
            stats={stats}
            onAdd={() => setScreen('add')}
            onCheckIn={checkIn}
          />
        )}
        {tab === 'habits' && (
          <HabitsScreen
            habits={habits}
            logs={logs}
            onAdd={() => setScreen('add')}
            onToggle={toggleActive}
          />
        )}
        {tab === 'stats' && <StatsScreen habits={habits} logs={logs} />}
        {tab === 'profile' && <ProfileScreen profile={profile} habits={habits} onSignOut={signOut} />}
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TabButton label="Bugun" active={tab === 'today'} onPress={() => setTab('today')} />
        <TabButton label="Odatlar" active={tab === 'habits'} onPress={() => setTab('habits')} />
        <TabButton label="Stat" active={tab === 'stats'} onPress={() => setTab('stats')} />
        <TabButton label="Profil" active={tab === 'profile'} onPress={() => setTab('profile')} />
      </View>
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
}: {
  profile: Profile;
  habits: Habit[];
  logs: HabitLog[];
  stats: ReturnType<typeof completionStats>;
  onAdd: () => void;
  onCheckIn: (habitId: string, status: LogStatus) => void;
}) {
  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroOverline}>Bugun, {todayKey()}</Text>
        <Text style={styles.heroTitle}>Salom, {profile.fullName.split(' ')[0]}</Text>
        <Text style={styles.heroText}>Kichik qadamlar odatga aylanadi.</Text>
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
  onToggle,
}: {
  habits: Habit[];
  logs: HabitLog[];
  onAdd: () => void;
  onToggle: (habitId: string) => void;
}) {
  return (
    <>
      <SectionHeader title="Odatlarim" action="Yangi" onPress={onAdd} />
      {habits.length === 0 ? (
        <EmptyState title="Ro'yxat bo'sh" text="Odat qo'shsangiz, shu yerda ko'rinadi." action="Odat qo'shish" onPress={onAdd} />
      ) : (
        habits.map((habit) => (
          <View key={habit.id} style={[styles.card, !habit.active && styles.inactiveCard]}>
            <View style={styles.habitHeader}>
              <View style={styles.habitIcon}><Text style={styles.habitIconText}>{habit.name.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.muted}>{habit.target} · {habit.days.join(', ')}</Text>
              </View>
              <Pressable onPress={() => onToggle(habit.id)} style={[styles.smallButton, habit.active ? styles.successSoft : styles.neutralSoft]}>
                <Text style={[styles.smallButtonText, habit.active ? styles.successText : styles.mutedText]}>
                  {habit.active ? 'Faol' : 'Off'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.muted}>Bugun: {statusLabel(logForToday(logs, habit.id)?.status)}</Text>
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

  return (
    <>
      <Text style={styles.pageTitle}>Statistika</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Bugun" value={`${stats.done}/${stats.planned.length}`} />
        <StatCard label="Foiz" value={`${stats.pct}%`} />
        <StatCard label="Jami done" value={String(doneLogs)} />
        <StatCard label="Missed" value={String(missedLogs)} />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Umumiy loglar</Text>
        <Text style={styles.muted}>Bajarildi: {doneLogs}</Text>
        <Text style={styles.muted}>Bajarilmadi: {missedLogs}</Text>
        <Text style={styles.muted}>O'tkazildi: {skippedLogs}</Text>
      </View>
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
  return (
    <>
      <Text style={styles.pageTitle}>Profil</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.fullName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <Text style={styles.profileSub}>{habits.length} ta odat</Text>
        </View>
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
}: {
  habit: Habit;
  log?: HabitLog;
  onCheckIn: (habitId: string, status: LogStatus) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.habitHeader}>
        <View style={styles.habitIcon}><Text style={styles.habitIconText}>{habit.name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.muted}>{habit.target} · {habit.reminderTime || "eslatma yo'q"}</Text>
        </View>
        <View style={[styles.statusPill, statusStyle(log?.status)]}>
          <Text style={[styles.statusText, statusTextStyle(log?.status)]}>{statusLabel(log?.status)}</Text>
        </View>
      </View>
      <View style={styles.checkRow}>
        <ActionButton label="Bajardim" tone="success" onPress={() => onCheckIn(habit.id, 'done')} />
        <ActionButton label="Bajarmadim" tone="danger" onPress={() => onCheckIn(habit.id, 'missed')} />
        <ActionButton label="Skip" tone="warn" onPress={() => onCheckIn(habit.id, 'skipped')} />
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
    <Pressable onPress={onPress} style={styles.tabButton}>
      <View style={[styles.tabDot, active && styles.tabDotActive]} />
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
  if (status === 'missed') return 'Missed';
  if (status === 'skipped') return 'Skip';
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
    gap: 8,
  },
  authBrand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
  screenContent: {
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  iconButtonText: {
    color: C.ink,
    fontSize: 32,
    lineHeight: 34,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.ink,
  },
  hero: {
    backgroundColor: C.primary,
    borderRadius: 26,
    padding: 22,
    gap: 4,
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
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
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
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
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
  },
  smallButtonText: {
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
  profileCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  tabDot: {
    width: 36,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  tabDotActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: C.primary,
  },
});
