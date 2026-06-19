import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DAYS, MONTHS, MOTIVATION_SLIDES } from './constants';
import type { Habit, HabitLog, LogStatus, Profile } from './types';
import {
  completionForDate,
  completionStats,
  currentStreak,
  currentWeekDays,
  dateKey,
  dayForDate,
  daySummary,
  displayDate,
  habitCompletion,
  habitHistory,
  habitStreak,
  isPlannedToday,
  logForDate,
  logForToday,
  logsForHabit,
  monthGrid,
  periodSummary,
  recentActivity,
  recentDays,
  todayDay,
  todayKey,
  topHabits,
} from './utils';
import {
  BreakdownRow,
  EmptyState,
  FilterChip,
  HistoryLegend,
  LegendDot,
  MiniMetric,
  ProfileRow,
  SectionHeader,
  StatCard,
  calendarToneStyle,
  calendarToneLabel,
  calendarToneSoftStyle,
  calendarToneTextStyle,
  historyToneStyle,
  rhythmFillStyle,
  statusLabel,
  statusStyle,
  statusTextStyle,
} from './components';
import { styles } from './styles';

export function TodayScreen({
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
  const weekly = currentWeekDays();
  const weeklySummary = weekly.reduce(
    (acc, date) => {
      const summary = daySummary(habits, logs, date);
      acc.planned += summary.planned.length;
      acc.done += summary.done;
      return acc;
    },
    { planned: 0, done: 0 },
  );
  const weeklyPct = weeklySummary.planned === 0 ? 0 : Math.round((weeklySummary.done / weeklySummary.planned) * 100);
  const [motivationIndex, setMotivationIndex] = useState(0);
  const motivation = MOTIVATION_SLIDES[motivationIndex];
  const remaining = Math.max(stats.planned.length - stats.done - stats.skipped - stats.missed, 0);
  const heroFocusText = stats.planned.length === 0
    ? "Bugun reja yo'q. Yangi odat qo'shing."
    : remaining === 0
      ? 'Bugungi reja yopildi. Ritmni saqlaymiz.'
      : `Bugun: ${remaining} ta odat navbatda.`;

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((current) => (current + 1) % MOTIVATION_SLIDES.length);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const showPreviousMotivation = () => {
    setMotivationIndex((current) => (current === 0 ? MOTIVATION_SLIDES.length - 1 : current - 1));
  };

  const showNextMotivation = () => {
    setMotivationIndex((current) => (current + 1) % MOTIVATION_SLIDES.length);
  };

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.flex}>
            <Text style={styles.heroOverline}>Bugun, {displayDate(new Date())}</Text>
            <Text style={styles.heroTitle}>Salom, {firstName}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.heroText}>{heroFocusText}</Text>
          </View>
          <View style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>{stats.pct}%</Text>
            <Text style={styles.heroScoreLabel}>bugun</Text>
          </View>
        </View>

        <View style={styles.heroProgressTrack}>
          <View style={[styles.heroProgressFill, { width: `${stats.pct}%` }]} />
        </View>

        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Text style={styles.motivationTag}>{motivation.tag}</Text>
            <Text style={styles.motivationCount}>{motivationIndex + 1}/{MOTIVATION_SLIDES.length}</Text>
          </View>
          <Text style={styles.motivationTitle}>{motivation.title}</Text>
          <Text style={styles.motivationText}>{motivation.text}</Text>
          <View style={styles.motivationControls}>
            <Pressable onPress={showPreviousMotivation} style={styles.motivationNavButton}>
              <Text style={styles.motivationNavText}>{'<'}</Text>
            </Pressable>
            <View style={styles.motivationDots}>
              {MOTIVATION_SLIDES.map((item, index) => (
                <Pressable
                  key={item.tag}
                  onPress={() => setMotivationIndex(index)}
                  style={[styles.motivationDot, motivationIndex === index && styles.motivationDotActive]}
                />
              ))}
            </View>
            <Pressable onPress={showNextMotivation} style={styles.motivationNavButton}>
              <Text style={styles.motivationNavText}>{'>'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{stats.done}/{stats.planned.length}</Text>
            <Text style={styles.heroMetaLabel}>bajarildi</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{remaining}</Text>
            <Text style={styles.heroMetaLabel}>navbatda</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{streak}</Text>
            <Text style={styles.heroMetaLabel}>streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.todaySummaryCard}>
        <View style={styles.todaySummaryTop}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Bugungi progress</Text>
            <Text style={styles.muted}>
              {stats.planned.length === 0 ? "Bugun odat yo'q" : `${stats.done}/${stats.planned.length} odat bajarildi`}
            </Text>
          </View>
          <View style={styles.compactPercent}>
            <Text style={styles.compactPercentText}>{stats.pct}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats.pct}%` }]} />
        </View>
        <View style={styles.compactMetricRow}>
          <MiniMetric label="Kutilmoqda" value={String(stats.pending)} tone="neutral" />
          <MiniMetric label="Skip" value={String(stats.skipped)} tone="warn" />
          <MiniMetric label="Bajarilmadi" value={String(stats.missed)} tone="danger" />
        </View>
      </View>

      <View style={styles.todayWeekCard}>
        <View style={styles.weekHeader}>
          <View>
            <Text style={styles.sectionTitle}>Haftalik ritm</Text>
            <Text style={styles.muted}>Dushanbadan yakshanbagacha</Text>
          </View>
          <View style={styles.weekSummaryPill}>
            <Text style={styles.weekSummaryText}>{weeklySummary.done}/{weeklySummary.planned}</Text>
          </View>
        </View>
        <View style={styles.weekProgressTrack}>
          <View style={[styles.weekProgressFill, { width: `${weeklyPct}%` }]} />
        </View>
        <View style={styles.todayWeekRow}>
          {weekly.map((date) => {
            const summary = daySummary(habits, logs, date);
            const key = dateKey(date);
            const isToday = key === todayKey();
            const pct = summary.planned.length === 0 ? 0 : Math.round((summary.done / summary.planned.length) * 100);
            const barHeight = summary.planned.length === 0 ? 0 : Math.max(pct, 10);

            return (
              <View key={key} style={[styles.weekDay, isToday && styles.weekDayToday]}>
                <Text style={[styles.weekDayText, isToday && styles.weekDayTextToday]}>{dayForDate(date)}</Text>
                <View style={[styles.todayWeekBarTrack, isToday && styles.todayWeekBarTrackToday]}>
                  <View style={[styles.weekBarFill, rhythmFillStyle(summary.tone), { height: `${barHeight}%` }]} />
                </View>
                <Text style={[styles.weekDayCount, isToday && styles.weekDayCountToday]}>
                  {summary.planned.length ? `${summary.done}/${summary.planned.length}` : '-'}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.weekLegendRow}>
          <HistoryLegend label="Bajarildi" tone="done" />
          <HistoryLegend label="Qisman" tone="skipped" />
          <HistoryLegend label="Reja yo'q" tone="off" />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bugungi odatlar</Text>
      </View>

      {stats.planned.length === 0 ? (
        <EmptyState
          title="Hozircha odat yo'q"
          text="Birinchi odatingizni qo'shing va bugundan boshlang."
          action="Odat qo'shish"
          onPress={onAdd}
        />
      ) : (
        <View style={styles.todayTasksList}>
          {stats.planned.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              log={logForToday(logs, habit.id)}
              onCheckIn={onCheckIn}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </View>
      )}
    </>
  );
}

export function HabitsScreen({
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
  const [filter, setFilter] = useState<'all' | 'today' | 'active' | 'paused'>('all');
  const activeCount = habits.filter((habit) => habit.active).length;
  const todayCount = habits.filter(isPlannedToday).length;
  const pausedCount = habits.length - activeCount;
  const filteredHabits = habits.filter((habit) => {
    if (filter === 'today') return isPlannedToday(habit);
    if (filter === 'active') return habit.active;
    if (filter === 'paused') return !habit.active;
    return true;
  });

  return (
    <>
      <View style={styles.habitsHero}>
        <View style={styles.habitsHeroTop}>
          <View>
            <Text style={styles.pageHeroTitle}>Odatlarim</Text>
            <Text style={styles.pageHeroText}>{activeCount} ta faol odat, jami {habits.length} ta reja.</Text>
          </View>
          <Pressable onPress={onAdd} style={styles.heroAddButton}>
            <Text style={styles.heroAddText}>+</Text>
          </Pressable>
        </View>
        <View style={styles.habitsSummaryRow}>
          <MiniMetric label="Bugun" value={String(todayCount)} tone="neutral" />
          <MiniMetric label="Faol" value={String(activeCount)} tone="neutral" />
          <MiniMetric label="Pauza" value={String(pausedCount)} tone="warn" />
        </View>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="Hammasi" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="Bugun" active={filter === 'today'} onPress={() => setFilter('today')} />
        <FilterChip label="Faol" active={filter === 'active'} onPress={() => setFilter('active')} />
        <FilterChip label="Pauza" active={filter === 'paused'} onPress={() => setFilter('paused')} />
      </View>

      <SectionHeader title="Odatlar ro'yxati" action="Yangi" onPress={onAdd} />
      {habits.length === 0 ? (
        <EmptyState title="Ro'yxat bo'sh" text="Odat qo'shsangiz, shu yerda ko'rinadi." action="Odat qo'shish" onPress={onAdd} />
      ) : filteredHabits.length === 0 ? (
        <EmptyState title="Bu filterda odat yo'q" text="Boshqa filter tanlang yoki yangi odat qo'shing." action="Odat qo'shish" onPress={onAdd} />
      ) : (
        filteredHabits.map((habit) => {
          const todayLog = logForToday(logs, habit.id);
          const completion = habitCompletion(habit, logs);
          const streak = habitStreak(habit, logs);

          return (
          <View key={habit.id} style={[styles.habitListCard, !habit.active && styles.inactiveCard]}>
            <View style={[styles.habitColorRail, { backgroundColor: habit.color }]} />
            <View style={styles.habitHeader}>
              <Pressable onPress={() => onOpenDetail(habit)} style={styles.habitMainPress}>
                <View style={[styles.habitIcon, { backgroundColor: `${habit.color}1F` }]}>
                  <Text style={[styles.habitIconText, { color: habit.color }]}>{habit.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.flex}>
                  <View style={styles.habitTitleRow}>
                    <Text numberOfLines={1} style={styles.habitName}>{habit.name}</Text>
                    <View style={[styles.statusPill, habit.active ? styles.successSoft : styles.neutralSoft]}>
                      <Text style={[styles.statusText, habit.active ? styles.successText : styles.mutedText]}>
                        {habit.active ? 'Faol' : 'Pauza'}
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.muted}>{habit.category} - {habit.target}</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.habitProgressRow}>
              <View style={styles.habitProgressText}>
                <Text style={styles.habitMetaText}>30 kun: {completion.done}/{completion.planned}</Text>
                <Text style={styles.habitMetaText}>Streak: {streak} kun</Text>
              </View>
              <Text style={styles.habitPercent}>{completion.pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion.pct}%`, backgroundColor: habit.color }]} />
            </View>

            <View style={styles.habitMetaRow}>
              <Text numberOfLines={1} style={styles.habitMetaText}>{habit.days.join(', ')}</Text>
              <Text numberOfLines={1} style={styles.habitMetaText}>{habit.reminderTime || "eslatma yo'q"}</Text>
            </View>

            <View style={styles.statusLine}>
              <Text style={styles.muted}>Bugun</Text>
              <View style={[styles.statusPill, statusStyle(todayLog?.status)]}>
                <Text style={[styles.statusText, statusTextStyle(todayLog?.status)]}>
                  {statusLabel(todayLog?.status)}
                </Text>
              </View>
            </View>

            <View style={styles.habitActionRow}>
              <Pressable onPress={() => onOpenDetail(habit)} style={styles.actionGhostButton}>
                <Text style={styles.actionGhostText}>Batafsil</Text>
              </Pressable>
              <Pressable onPress={() => onEdit(habit)} style={styles.actionGhostButton}>
                <Text style={styles.actionGhostText}>Tahrir</Text>
              </Pressable>
              <Pressable onPress={() => onToggle(habit.id)} style={[styles.actionGhostButton, habit.active ? styles.successSoft : styles.neutralSoft]}>
                <Text style={[styles.actionGhostText, habit.active ? styles.successText : styles.mutedText]}>
                  {habit.active ? 'Pauza' : 'Faollashtir'}
                </Text>
              </Pressable>
            </View>
          </View>
          );
        })
      )}
    </>
  );
}

export function StatsScreen({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const stats = completionStats(habits, logs);
  const doneLogs = logs.filter((log) => log.status === 'done').length;
  const missedLogs = logs.filter((log) => log.status === 'missed').length;
  const skippedLogs = logs.filter((log) => log.status === 'skipped').length;
  const streak = currentStreak(habits, logs);
  const weekly = recentDays(7);
  const month = periodSummary(habits, logs, 30);
  const bestHabits = topHabits(habits, logs);
  const activity = recentActivity(habits, logs);
  const totalLogs = doneLogs + missedLogs + skippedLogs;

  return (
    <>
      <View style={styles.statsHero}>
        <View style={styles.habitsHeroTop}>
          <View>
            <Text style={styles.pageHeroTitle}>Statistika</Text>
            <Text style={styles.pageHeroText}>Bugungi, haftalik va 30 kunlik ritm.</Text>
          </View>
          <View style={styles.compactPercent}>
            <Text style={styles.compactPercentText}>{month.pct}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${month.pct}%` }]} />
        </View>
        <View style={styles.habitsSummaryRow}>
          <MiniMetric label="30 kun reja" value={String(month.planned)} tone="neutral" />
          <MiniMetric label="Bajarildi" value={String(month.done)} tone="neutral" />
          <MiniMetric label="Streak" value={String(streak)} tone="warn" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Bugun" value={`${stats.done}/${stats.planned.length}`} />
        <StatCard label="Bugun foiz" value={`${stats.pct}%`} />
        <StatCard label="Streak" value={`${streak} kun`} />
        <StatCard label="Jami log" value={String(totalLogs)} />
      </View>

      <View style={styles.statsChartCard}>
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

      <View style={styles.statsBreakdownCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Status breakdown</Text>
          <Text style={styles.muted}>Jami {totalLogs}</Text>
        </View>
        <BreakdownRow label="Bajarildi" value={doneLogs} total={totalLogs} tone="success" />
        <BreakdownRow label="Bajarilmadi" value={missedLogs} total={totalLogs} tone="danger" />
        <BreakdownRow label="Skip qilingan" value={skippedLogs} total={totalLogs} tone="warn" />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Eng yaxshi odatlar</Text>
        {bestHabits.length === 0 ? (
          <Text style={styles.muted}>Hali odat yo'q.</Text>
        ) : (
          bestHabits.map(({ habit, completion, streak: habitStreakValue }, index) => (
            <View key={habit.id} style={styles.topHabitRow}>
              <Text style={styles.topHabitRank}>{index + 1}</Text>
              <View style={[styles.habitIcon, { backgroundColor: `${habit.color}1F` }]}>
                <Text style={[styles.habitIconText, { color: habit.color }]}>{habit.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.muted}>{completion.done}/{completion.planned} - {habitStreakValue} kun streak</Text>
              </View>
              <Text style={styles.habitPercent}>{completion.pct}%</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Oxirgi activity</Text>
        {activity.length === 0 ? (
          <Text style={styles.muted}>Hali check-in yo'q.</Text>
        ) : (
          activity.map(({ log, habit }) => (
            <View key={log.id} style={styles.activityRow}>
              <View style={[styles.activityDot, statusStyle(log.status)]} />
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.logDate}>{habit?.name || "O'chirilgan odat"}</Text>
                <Text style={styles.muted}>{log.date} - {log.durationMinutes || 0} daqiqa</Text>
              </View>
              <View style={[styles.statusPill, statusStyle(log.status)]}>
                <Text style={[styles.statusText, statusTextStyle(log.status)]}>{statusLabel(log.status)}</Text>
              </View>
            </View>
          ))
        )}
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
          <Text style={styles.muted}>Skip qilingan</Text>
          <Text style={styles.logValue}>{skippedLogs}</Text>
        </View>
      </View>
    </>
  );
}

export function CalendarScreen({
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
  const [visibleMonth, setVisibleMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const days = monthGrid(visibleMonth);
  const selectedSummary = daySummary(habits, logs, selected);
  const monthTitle = `${MONTHS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;
  const monthSummary = days
    .filter((date) => date.getMonth() === visibleMonth.getMonth())
    .reduce(
      (acc, date) => {
        const summary = daySummary(habits, logs, date);
        acc.planned += summary.planned.length;
        acc.done += summary.done;
        acc.missed += summary.missed;
        acc.skipped += summary.skipped;
        return acc;
      },
      { planned: 0, done: 0, missed: 0, skipped: 0 },
    );
  const monthPct = monthSummary.planned === 0 ? 0 : Math.round((monthSummary.done / monthSummary.planned) * 100);
  const changeMonth = (delta: number) => {
    const next = new Date(visibleMonth);
    next.setMonth(visibleMonth.getMonth() + delta);
    setVisibleMonth(next);
  };

  return (
    <>
      <View style={styles.calendarHero}>
        <View style={styles.habitsHeroTop}>
          <View>
            <Text style={styles.pageHeroTitle}>Kalendar</Text>
            <Text style={styles.pageHeroText}>Kunlar real check-in holati bo'yicha ranglanadi.</Text>
          </View>
          <View style={styles.compactPercent}>
            <Text style={styles.compactPercentText}>{monthPct}%</Text>
          </View>
        </View>
        <View style={styles.habitsSummaryRow}>
          <MiniMetric label="Reja" value={String(monthSummary.planned)} tone="neutral" />
          <MiniMetric label="Bajarildi" value={String(monthSummary.done)} tone="neutral" />
          <MiniMetric label="Missed" value={String(monthSummary.missed)} tone="danger" />
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavText}>{'<'}</Text>
          </Pressable>
          <View style={styles.calendarHeaderCenter}>
            <Text style={styles.sectionTitle}>{monthTitle}</Text>
            <Text style={styles.muted}>Oy bo'yicha {monthSummary.done}/{monthSummary.planned} bajarildi</Text>
          </View>
          <Pressable onPress={() => changeMonth(1)} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavText}>{'>'}</Text>
          </Pressable>
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
                  key === todayKey() && styles.calendarToday,
                  !isCurrentMonth && styles.calendarDayMuted,
                ]}
              >
                <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{date.getDate()}</Text>
                {summary.planned.length > 0 && <Text style={styles.calendarTinyText}>{summary.done}/{summary.planned.length}</Text>}
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

      <View style={styles.selectedDayCard}>
        <View style={styles.weekHeader}>
          <View>
            <Text style={styles.sectionTitle}>{displayDate(selected)}</Text>
            <Text style={styles.muted}>{dayForDate(selected)} - {selectedSummary.planned.length} ta reja</Text>
          </View>
          <View style={[styles.statusPill, calendarToneSoftStyle(selectedSummary.tone)]}>
            <Text style={[styles.statusText, calendarToneTextStyle(selectedSummary.tone)]}>{calendarToneLabel(selectedSummary.tone)}</Text>
          </View>
        </View>
        <View style={styles.compactMetricRow}>
          <MiniMetric label="Done" value={String(selectedSummary.done)} tone="neutral" />
          <MiniMetric label="Skip" value={String(selectedSummary.skipped)} tone="warn" />
          <MiniMetric label="Missed" value={String(selectedSummary.missed)} tone="danger" />
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
              <View style={[styles.habitColorRail, { backgroundColor: habit.color }]} />
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

export function HabitDetailScreen({
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
  const history = habitHistory(habit, logs, 21);
  const todayLog = logForToday(logs, habit.id);
  const todayPlanned = habit.days.includes(todayDay());
  const canCheckInToday = habit.active && (todayPlanned || Boolean(todayLog));
  const totalMinutes = recent.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
  const lastLog = recent[0];

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
            <Text style={styles.detailCategory}>{habit.category} - {habit.active ? 'Faol odat' : 'Pauzadagi odat'}</Text>
            <Text style={styles.detailTitle}>{habit.name}</Text>
            <Text style={styles.detailText}>
              {habit.target} - {habit.days.length} kun/hafta - {habit.reminderTime || "eslatma yo'q"}
            </Text>
          </View>
          <View style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>{completion.pct}%</Text>
            <Text style={styles.heroScoreLabel}>30 kun</Text>
          </View>
        </View>
        <View style={styles.detailHeroTrack}>
          <View style={[styles.detailHeroFill, { width: `${completion.pct}%` }]} />
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
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaValue}>{totalMinutes}</Text>
            <Text style={styles.heroMetaLabel}>daqiqa</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailActions}>
        <Pressable
          onPress={onCheckIn}
          disabled={!canCheckInToday}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.detailActionButton,
            !canCheckInToday && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{todayLog ? 'Bugungi logni yangilash' : 'Bugun check-in'}</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={[styles.smallButton, styles.detailSmallAction]}>
          <Text style={styles.smallButtonText}>Tahrir</Text>
        </Pressable>
      </View>

      <View style={styles.detailTodayCard}>
        <View style={styles.weekHeader}>
          <View>
            <Text style={styles.sectionTitle}>Bugungi holat</Text>
            <Text style={styles.muted}>
              {todayPlanned ? 'Bugun reja ichida.' : "Bugun bu odat rejalashtirilmagan."}
            </Text>
          </View>
          <View style={[styles.statusPill, statusStyle(todayLog?.status)]}>
            <Text style={[styles.statusText, statusTextStyle(todayLog?.status)]}>{statusLabel(todayLog?.status)}</Text>
          </View>
        </View>
        {lastLog ? (
          <View style={styles.detailLastLog}>
            <Text style={styles.logDate}>Oxirgi log: {displayDate(new Date(`${lastLog.date}T00:00:00`))}</Text>
            <Text style={styles.muted}>
              {statusLabel(lastLog.status)} - {lastLog.durationMinutes ? `${lastLog.durationMinutes} daqiqa` : "daqiqa yo'q"} - {lastLog.mood || "kayfiyat yo'q"}
            </Text>
          </View>
        ) : (
          <Text style={styles.muted}>Hali bu odat bo'yicha check-in kiritilmagan.</Text>
        )}
      </View>

      <View style={styles.formCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Haftalik reja</Text>
          <Text style={styles.muted}>{habit.days.length}/7 kun</Text>
        </View>
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
        <StatCard label="30 kun reja" value={String(completion.planned)} />
        <StatCard label="Daqiqa" value={String(totalMinutes)} />
      </View>

      <View style={styles.detailHistoryCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>21 kunlik ritm</Text>
          <Text style={styles.muted}>Ranglar status bo'yicha</Text>
        </View>
        <View style={styles.historyGrid}>
          {history.map((item) => (
            <View key={item.key} style={styles.historyItem}>
              <View
                style={[
                  styles.historyDot,
                  historyToneStyle(item.tone),
                  item.key === todayKey() && styles.historyDotToday,
                ]}
              />
              <Text style={styles.historyDayText}>{dayForDate(item.date)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calendarLegend}>
          <HistoryLegend label="Bajarildi" tone="done" />
          <HistoryLegend label="Bajarilmadi" tone="missed" />
          <HistoryLegend label="Skip" tone="skipped" />
          <HistoryLegend label="Kutilmoqda" tone="pending" />
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Oxirgi check-inlar</Text>
        {recent.length === 0 ? (
          <Text style={styles.muted}>Hali check-in yo'q.</Text>
        ) : (
          recent.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.flex}>
                <Text style={styles.logDate}>{displayDate(new Date(`${log.date}T00:00:00`))}</Text>
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

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Boshqaruv</Text>
        <View style={styles.detailControlRow}>
          <Pressable onPress={onToggle} style={[styles.detailControlButton, habit.active ? styles.warnSoft : styles.successSoft]}>
            <Text style={[styles.detailControlText, habit.active ? styles.warnText : styles.successText]}>
              {habit.active ? 'Pauzaga olish' : 'Faol qilish'}
            </Text>
          </Pressable>
          <Pressable onPress={onDelete} style={[styles.detailControlButton, styles.dangerSoft]}>
            <Text style={[styles.detailControlText, styles.dangerText]}>O'chirish</Text>
          </Pressable>
        </View>
        <Text style={styles.muted}>
          Pauza qilingan odat bugungi reja va statistikaga qo'shilmaydi.
        </Text>
      </View>
    </>
  );
}

export function ProfileScreen({
  profile,
  habits,
  logs,
  onSignOut,
}: {
  profile: Profile;
  habits: Habit[];
  logs: HabitLog[];
  onSignOut: () => void;
}) {
  const activeCount = habits.filter((habit) => habit.active).length;
  const pausedCount = habits.length - activeCount;
  const streak = currentStreak(habits, logs);

  return (
    <>
      <View style={styles.profileHero}>
        <View style={styles.profileHeroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.fullName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileSub}>Odatly foydalanuvchisi</Text>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>Local</Text>
          </View>
        </View>

        <View style={styles.profileHeroStats}>
          <MiniMetric label="Faol" value={String(activeCount)} tone="neutral" />
          <MiniMetric label="Jami" value={String(habits.length)} tone="neutral" />
          <MiniMetric label="Pauza" value={String(pausedCount)} tone="warn" />
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>App holati</Text>
        <ProfileRow label="Data saqlash" value="Telefon xotirasi" />
        <ProfileRow label="Kirish turi" value="Ism orqali" />
        <ProfileRow label="Bugungi streak" value={`${streak} kun`} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Keyingi sozlamalar</Text>
        <ProfileRow label="Eslatmalar" value="Keyingi bosqich" muted />
        <ProfileRow label="Cloud sync" value="Keyingi bosqich" muted />
        <ProfileRow label="Til" value="O'zbek" />
      </View>

      <View style={styles.profileNotice}>
        <Text style={styles.profileNoticeTitle}>Lokal rejim</Text>
        <Text style={styles.profileNoticeText}>Odatlaringiz hozircha shu qurilmada saqlanadi. Keyin account va cloud sync qo'shilganda data qurilmalar orasida almashadi.</Text>
      </View>

      <Pressable onPress={onSignOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Chiqish</Text>
      </Pressable>
    </>
  );
}

export function HabitCard({
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
  const isDone = log?.status === 'done';
  const statusDescription = log
    ? `${statusLabel(log.status)} - ${log.durationMinutes ? `${log.durationMinutes} daqiqa` : "vaqt kiritilmagan"} - ${log.mood || "kayfiyat yo'q"}`
    : "Bugun hali belgilanmagan. Bajargan bo'lsangiz bir bosishda belgilang.";

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

      <View style={styles.habitStatusPanel}>
        <View style={[styles.habitStatusDot, statusStyle(log?.status)]} />
        <View style={styles.flex}>
          <Text style={styles.habitStatusLabel}>Bugungi holat</Text>
          <Text numberOfLines={2} style={styles.habitStatusText}>{statusDescription}</Text>
        </View>
      </View>

      <View style={styles.habitMiniGrid}>
        <View style={styles.habitMiniPill}>
          <Text style={styles.habitMiniLabel}>Vaqt</Text>
          <Text numberOfLines={1} style={styles.habitMiniValue}>{habit.reminderTime || "yo'q"}</Text>
        </View>
        <View style={styles.habitMiniPill}>
          <Text style={styles.habitMiniLabel}>Kunlar</Text>
          <Text numberOfLines={1} style={styles.habitMiniValue}>{habit.days.join(', ')}</Text>
        </View>
      </View>

      {Boolean(log?.note) && <Text style={styles.logPreviewNote}>{log?.note}</Text>}

      <View style={styles.habitCardActions}>
        <Pressable
          onPress={() => onCheckIn(habit.id, 'done')}
          style={({ pressed }) => [
            styles.habitDoneButton,
            isDone && styles.habitDoneButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.habitDoneButtonText, isDone && styles.habitDoneButtonTextActive]}>
            {isDone ? 'Bajarildi' : 'Bajardim'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onCheckIn(habit.id, log?.status ?? 'done')}
          style={({ pressed }) => [styles.habitStateButton, pressed && styles.pressed]}
        >
          <Text style={styles.habitStateButtonText}>Holat</Text>
        </Pressable>
      </View>
    </View>
  );
}
