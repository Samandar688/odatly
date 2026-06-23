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
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  C,
  CATEGORIES,
  DAYS,
  HABIT_COLORS,
  MOODS,
  PROFILE_KEY,
  TARGET_PRESETS,
} from './src/constants';
import type { Day, Habit, HabitData, HabitLog, LogStatus, Profile, Tab } from './src/types';
import { completionStats, dataKey, logForToday, makeId, slugName, todayKey } from './src/utils';
import { Chip, StatusChoice, TabButton, statusLabel, statusStyle, statusTextStyle } from './src/components';
import {
  CalendarScreen,
  HabitDetailScreen,
  HabitsScreen,
  ProfileScreen,
  StatsScreen,
  TodayScreen,
} from './src/screens';
import { styles } from './src/styles';
import { requestPermissionsAsync, scheduleHabitNotifications, cancelHabitNotifications } from './src/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [habitCategory, setHabitCategory] = useState("Sog'liq");
  const [habitColor, setHabitColor] = useState(HABIT_COLORS[0]);
  const [habitDays, setHabitDays] = useState<Day[]>(['Du', 'Se', 'Cho', 'Pa', 'Ju']);

  useEffect(() => {
    const load = async () => {
      await requestPermissionsAsync();
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
  const checkExistingLog = useMemo(
    () => (checkHabit ? logForToday(logs, checkHabit.id) : undefined),
    [checkHabit, logs],
  );
  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId),
    [selectedHabitId, habits],
  );
  const bottomSafe = Math.max(insets.bottom, Platform.OS === 'android' ? 28 : 16);
  const tabBarBottom = bottomSafe + 6;
  const tabContentBottom = tabBarBottom + 82;

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

  const saveHabit = async () => {
    const trimmedName = habitName.trim();
    if (!trimmedName || habitDays.length === 0) return;

    if (screen === 'edit' && editingHabitId) {
      const oldHabit = habits.find((h) => h.id === editingHabitId);
      if (oldHabit?.notificationIds) {
        await cancelHabitNotifications(oldHabit.notificationIds);
      }
      
      const draftHabit: Habit = {
        ...oldHabit!,
        name: trimmedName,
        target: habitTarget.trim() || '1 marta',
        category: habitCategory,
        reminderTime: habitTime.trim(),
        days: habitDays,
        color: habitColor,
      };
      
      const newNotificationIds = draftHabit.active ? await scheduleHabitNotifications(draftHabit) : [];

      setHabits((current) => current.map((habit) => (
        habit.id === editingHabitId
          ? { ...draftHabit, notificationIds: newNotificationIds }
          : habit
      )));
      resetHabitForm();
      setTab('habits');
      setScreen('main');
      return;
    }

    const draftHabit: Habit = {
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
    const newNotificationIds = await scheduleHabitNotifications(draftHabit);
    const nextHabit = { ...draftHabit, notificationIds: newNotificationIds };

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
          onPress: async () => {
            const habit = habits.find(h => h.id === habitId);
            if (habit?.notificationIds) {
              await cancelHabitNotifications(habit.notificationIds);
            }
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
    const nextStatus = status;
    const existingDuration = nextStatus === existing?.status ? existing?.durationMinutes : undefined;
    setCheckHabitId(habitId);
    setCheckStatus(nextStatus);
    setCheckDuration(String(existingDuration ?? (nextStatus === 'done' ? 30 : 0)));
    setCheckMood(existing?.mood || MOODS[0]);
    setCheckNote(existing?.note || '');
  };

  const updateCheckStatus = (status: LogStatus) => {
    setCheckStatus(status);
    setCheckDuration((current) => (status === 'done' ? (current === '0' ? '30' : current) : '0'));
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
    const duration = checkStatus === 'done' ? Math.max(0, Number.parseInt(checkDuration, 10) || 0) : undefined;
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

  const toggleActive = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    
    let newNotificationIds = habit.notificationIds;
    
    if (habit.active) {
      if (habit.notificationIds) {
        await cancelHabitNotifications(habit.notificationIds);
      }
      newNotificationIds = [];
    } else {
      newNotificationIds = await scheduleHabitNotifications({ ...habit, active: true });
    }

    setHabits((current) => current.map((h) => (
      h.id === habitId ? { ...h, active: !h.active, notificationIds: newNotificationIds } : h
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
    const canSaveHabit = habitName.trim().length > 0 && habitDays.length > 0;

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

          <View style={[styles.formPreviewCard, { borderColor: `${habitColor}66` }]}>
            <View style={[styles.habitColorRail, { backgroundColor: habitColor }]} />
            <View style={styles.habitHeader}>
              <View style={[styles.habitIcon, { backgroundColor: `${habitColor}1F` }]}>
                <Text style={[styles.habitIconText, { color: habitColor }]}>
                  {(habitName.trim() || 'O').slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.habitName}>{habitName.trim() || 'Yangi odat'}</Text>
                <Text numberOfLines={1} style={styles.muted}>{habitCategory} - {habitTarget || 'Maqsad'}</Text>
              </View>
              <View style={[styles.statusPill, styles.successSoft]}>
                <Text style={[styles.statusText, styles.successText]}>Faol</Text>
              </View>
            </View>
            <View style={styles.habitMetaRow}>
              <Text numberOfLines={1} style={styles.habitMetaText}>{habitDays.length ? habitDays.join(', ') : 'Kun tanlanmagan'}</Text>
              <Text numberOfLines={1} style={styles.habitMetaText}>{habitTime || "eslatma yo'q"}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formSectionHeader}>
              <Text style={styles.sectionTitle}>Asosiy ma'lumot</Text>
              <Text style={styles.formStep}>1/3</Text>
            </View>
            <Text style={styles.label}>Odat nomi</Text>
            <TextInput
              value={habitName}
              onChangeText={setHabitName}
              placeholder="Masalan: Ertalab yurish"
              placeholderTextColor="#9AA1A9"
              style={styles.input}
              returnKeyType="next"
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
            <Pressable onPress={() => setShowTimePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
              <Text style={{ color: habitTime ? C.ink : '#9AA1A9', fontSize: 15 }}>{habitTime || "07:00"}</Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [h, m] = (habitTime || "07:00").split(':');
                  const d = new Date();
                  d.setHours(Number(h) || 7, Number(m) || 0, 0, 0);
                  return d;
                })()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, date) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && date) {
                    const h = date.getHours().toString().padStart(2, '0');
                    const m = date.getMinutes().toString().padStart(2, '0');
                    setHabitTime(`${h}:${m}`);
                    if (Platform.OS === 'android') setShowTimePicker(false);
                  } else if (event.type === 'dismissed') {
                    setShowTimePicker(false);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formCard}>
            <View style={styles.formSectionHeader}>
              <Text style={styles.sectionTitle}>Ko'rinish</Text>
              <Text style={styles.formStep}>2/3</Text>
            </View>
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
            <View style={styles.formSectionHeader}>
              <Text style={styles.sectionTitle}>Jadval</Text>
              <Text style={styles.formStep}>3/3</Text>
            </View>
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
            <View style={styles.quickTargetRow}>
              <Chip
                label="Ish kunlari"
                active={habitDays.length === 5 && ['Du', 'Se', 'Cho', 'Pa', 'Ju'].every((day) => habitDays.includes(day as Day))}
                onPress={() => setHabitDays(['Du', 'Se', 'Cho', 'Pa', 'Ju'])}
              />
              <Chip
                label="Har kuni"
                active={habitDays.length === DAYS.length}
                onPress={() => setHabitDays([...DAYS])}
              />
              <Chip
                label="Dam olish"
                active={habitDays.length === 2 && habitDays.includes('Sha') && habitDays.includes('Yak')}
                onPress={() => setHabitDays(['Sha', 'Yak'])}
              />
            </View>
          </View>

          <Pressable
            onPress={saveHabit}
            disabled={!canSaveHabit}
            style={({ pressed }) => [
              styles.primaryButton,
              !canSaveHabit && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>{isEditing ? 'Yangilash' : 'Saqlash'}</Text>
          </Pressable>
          {!canSaveHabit && (
            <Text style={styles.formHint}>Saqlash uchun odat nomi va kamida bitta kun tanlanishi kerak.</Text>
          )}

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
    <View style={[styles.flex, styles.appRoot]}>
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: screen === 'main' ? tabContentBottom + 12 : bottomSafe + 28,
          },
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
        {screen === 'main' && tab === 'profile' && <ProfileScreen profile={profile} habits={habits} logs={logs} onSignOut={signOut} />}
      </ScrollView>

      {screen === 'main' && (
        <View style={[styles.tabBar, { bottom: tabBarBottom }]}>
          <TabButton label="Asosiy" active={tab === 'today'} onPress={() => setTab('today')} />
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

              <View style={styles.sheetContextCard}>
                <View style={styles.flex}>
                  <Text style={styles.sheetContextLabel}>{checkExistingLog ? 'Bugungi log yangilanmoqda' : 'Bugun uchun yangi log'}</Text>
                  <Text style={styles.sheetContextText}>{checkHabit?.target || 'Maqsad kiritilmagan'}</Text>
                </View>
                <View style={[styles.statusPill, statusStyle(checkExistingLog?.status)]}>
                  <Text style={[styles.statusText, statusTextStyle(checkExistingLog?.status)]}>
                    {statusLabel(checkExistingLog?.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.statusSegment}>
                <StatusChoice label="Bajardim" value="done" active={checkStatus === 'done'} onPress={() => updateCheckStatus('done')} />
                <StatusChoice label="Bajarmadim" value="missed" active={checkStatus === 'missed'} onPress={() => updateCheckStatus('missed')} />
                <StatusChoice label="Skip" value="skipped" active={checkStatus === 'skipped'} onPress={() => updateCheckStatus('skipped')} />
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
                    editable={checkStatus === 'done'}
                    style={[styles.input, checkStatus !== 'done' && styles.inputDisabled]}
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
              {checkStatus !== 'done' && (
                <Text style={styles.sheetHint}>Bajarilmagan yoki skip qilingan odatda daqiqa hisoblanmaydi.</Text>
              )}

              <Text style={styles.label}>Izoh</Text>
              <TextInput
                value={checkNote}
                onChangeText={setCheckNote}
                placeholder="Masalan: bugun yengilroq bajardim"
                placeholderTextColor="#9AA1A9"
                style={[styles.input, styles.noteInput]}
                multiline
              />

              <Pressable
                onPress={submitCheckIn}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>{checkExistingLog ? 'Check-inni yangilash' : 'Check-inni saqlash'}</Text>
              </Pressable>
              <Pressable onPress={closeCheckIn} style={styles.sheetCancelButton}>
                <Text style={styles.sheetCancelText}>Bekor qilish</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}



export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppInner />
    </SafeAreaProvider>
  );
}
