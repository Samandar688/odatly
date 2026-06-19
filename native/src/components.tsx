import { Pressable, Text, View } from 'react-native';

import type { HistoryTone, LogStatus } from './types';
import { styles } from './styles';

export function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.linkText}>{action}</Text>
      </Pressable>
    </View>
  );
}

export function EmptyState({
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

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        style={[styles.tabText, active && styles.tabTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function StatusChoice({
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

export function LegendDot({ label, tone }: { label: string; tone: 'done' | 'partial' | 'missed' }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, calendarToneStyle(tone)]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export function HistoryLegend({ label, tone }: { label: string; tone: HistoryTone }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, historyToneStyle(tone)]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export function MiniMetric({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'warn' | 'danger' }) {
  return (
    <View style={[styles.miniMetric, tone === 'warn' && styles.warnSoft, tone === 'danger' && styles.dangerSoft]}>
      <Text style={[styles.miniMetricValue, tone === 'warn' && styles.warnText, tone === 'danger' && styles.dangerText]}>{value}</Text>
      <Text style={styles.miniMetricLabel}>{label}</Text>
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function BreakdownRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: 'success' | 'danger' | 'warn';
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const fillStyle = tone === 'success' ? styles.breakdownSuccess : tone === 'danger' ? styles.breakdownDanger : styles.breakdownWarn;

  return (
    <View style={styles.breakdownRow}>
      <View style={styles.weekHeader}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={styles.breakdownValue}>{value} - {pct}%</Text>
      </View>
      <View style={styles.breakdownTrack}>
        <View style={[styles.breakdownFill, fillStyle, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export function ProfileRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Text style={[styles.profileRowValue, muted && styles.mutedText]}>{value}</Text>
    </View>
  );
}

export function statusLabel(status?: LogStatus) {
  if (status === 'done') return 'Bajarildi';
  if (status === 'missed') return 'Bajarilmadi';
  if (status === 'skipped') return 'Skip qilindi';
  return 'Kutilmoqda';
}

export function statusStyle(status?: LogStatus) {
  if (status === 'done') return styles.successSoft;
  if (status === 'missed') return styles.dangerSoft;
  if (status === 'skipped') return styles.warnSoft;
  return styles.neutralSoft;
}

export function statusTextStyle(status?: LogStatus) {
  if (status === 'done') return styles.successText;
  if (status === 'missed') return styles.dangerText;
  if (status === 'skipped') return styles.warnText;
  return styles.mutedText;
}

export function calendarToneStyle(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return styles.calendarDone;
  if (tone === 'partial') return styles.calendarPartial;
  if (tone === 'missed') return styles.calendarMissed;
  if (tone === 'future') return styles.calendarFuture;
  return styles.calendarNone;
}

export function calendarToneSoftStyle(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return styles.successSoft;
  if (tone === 'partial') return styles.warnSoft;
  if (tone === 'missed') return styles.dangerSoft;
  return styles.neutralSoft;
}

export function calendarToneTextStyle(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return styles.successText;
  if (tone === 'partial') return styles.warnText;
  if (tone === 'missed') return styles.dangerText;
  return styles.mutedText;
}

export function calendarToneLabel(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return 'Bajarildi';
  if (tone === 'partial') return 'Qisman';
  if (tone === 'missed') return 'Bajarilmadi';
  if (tone === 'future') return 'Kelasi kun';
  return "Reja yo'q";
}

export function rhythmFillStyle(tone: 'done' | 'partial' | 'missed' | 'none' | 'future') {
  if (tone === 'done') return styles.rhythmDone;
  if (tone === 'partial') return styles.rhythmPartial;
  if (tone === 'missed') return styles.rhythmMissed;
  if (tone === 'future') return styles.rhythmFuture;
  return styles.rhythmNone;
}

export function historyToneStyle(tone: HistoryTone) {
  if (tone === 'done') return styles.historyDone;
  if (tone === 'missed') return styles.historyMissed;
  if (tone === 'skipped') return styles.historySkipped;
  if (tone === 'pending') return styles.historyPending;
  return styles.historyOff;
}
