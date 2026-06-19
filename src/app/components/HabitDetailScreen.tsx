import { ProgressRing, PrimaryButton, C, ScreenScroll, EmptyState } from './shared';
import { useHabitStore } from '../state/habitStore';
import {
  formatDuration,
  formatShortDate,
  fromDateKey,
  getHabitRangeStats,
  getHabitWeekStatuses,
  getRecentLogsForHabit,
  startOfMonth,
  toHabitDailyView,
} from '../domain/habits';

export function HabitDetailScreen({
  habitId, onBack, onCheckIn,
}: {
  habitId: string;
  onBack: () => void;
  onCheckIn: (id: string) => void;
}) {
  const { habits, logs } = useHabitStore();
  const today = new Date();
  const baseHabit = habits.find((item) => item.id === habitId) ?? habits[0];

  if (!baseHabit) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
        <ScreenScroll paddingBottom={32}>
          <EmptyState icon="🌱" title="Odat topilmadi" description="Ro‘yxatdan odat tanlang yoki yangi odat qo‘shing." />
        </ScreenScroll>
      </div>
    );
  }

  const habit = toHabitDailyView(baseHabit, logs, today);
  const monthStats = getHabitRangeStats(baseHabit, logs, startOfMonth(today), today, today);
  const totalStats = getHabitRangeStats(baseHabit, logs, fromDateKey(baseHabit.createdAt.slice(0, 10)), today, today);
  const weekData = getHabitWeekStatuses(baseHabit, logs, today);
  const recentLogs = getRecentLogsForHabit(logs, habit.id, 6);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <ScreenScroll paddingBottom={32}>
        <div style={{
          background: `linear-gradient(145deg, ${habit.color}CC, ${habit.color})`,
          padding: 'calc(14px + env(safe-area-inset-top, 0px)) 20px 28px', position: 'relative', overflow: 'hidden',
        }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
              {habit.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '2px 10px', borderRadius: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {habit.category}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.target}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: C.card, borderRadius: 20, padding: '20px',
            marginTop: -14, marginBottom: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            {[
              { label: 'Joriy streak', value: `🔥 ${habit.streak} kun`, color: C.orange },
              { label: 'Eng uzun streak', value: `🏆 ${habit.longestStreak} kun`, color: C.purple },
              { label: 'Bu oy', value: `📅 ${monthStats.done}/${monthStats.planned} kun`, color: C.primary },
              { label: 'Umumiy vaqt', value: `⏱ ${formatDuration(totalStats.totalDurationMinutes)}`, color: C.teal },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Oylik ko'rsatkich</div>
              <ProgressRing progress={monthStats.completionRate} size={56} strokeWidth={6}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.charcoal }}>{monthStats.completionRate}%</span>
              </ProgressRing>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: 'space-between' }}>
              {weekData.map(w => (
                <div key={w.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <div style={{
                    width: '100%', height: 32, borderRadius: 6,
                    background: w.status === 'done' ? habit.color : w.status === 'missed' ? C.redSoft : w.status === 'skipped' ? C.orangeLight : C.primaryLight,
                    maxWidth: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {w.status === 'done' && <span style={{ fontSize: 12, color: '#fff' }}>✓</span>}
                    {w.status === 'missed' && <span style={{ fontSize: 12, color: C.redMed }}>×</span>}
                    {w.status === 'skipped' && <span style={{ fontSize: 12, color: C.orange }}>-</span>}
                  </div>
                  <span style={{ fontSize: 10, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 14 }}>So'nggi yozuvlar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentLogs.map((log, i) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < recentLogs.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: log.status === 'done' ? habit.color : log.status === 'skipped' ? C.orange : C.redMed,
                    boxShadow: `0 0 0 3px ${log.status === 'done' ? habit.color + '25' : log.status === 'skipped' ? C.orange + '25' : C.redMed + '25'}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatShortDate(log.date)}</div>
                    <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {log.status === 'done' ? `${formatDuration(log.durationMinutes)}${log.mood ? ` • ${log.mood}` : ''}` : log.status === 'skipped' ? "O'tkazildi" : 'Bajarilmadi'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: log.status === 'done' ? C.primaryLight : log.status === 'skipped' ? C.orangeLight : C.redSoft,
                    color: log.status === 'done' ? C.primary : log.status === 'skipped' ? C.orange : C.redMed,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}>
                    {log.status === 'done' ? '✓' : log.status === 'skipped' ? '-' : '✗'}
                  </span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div style={{ padding: '14px 0', color: C.grayMed, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Hali check-in yozuvi yo‘q.
                </div>
              )}
            </div>
          </div>

          <PrimaryButton onClick={() => onCheckIn(habit.id)} fullWidth>Bugun belgilash</PrimaryButton>
        </div>
      </ScreenScroll>
    </div>
  );
}
