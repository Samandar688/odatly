import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { TrendingUp, Flame, Target, Clock } from 'lucide-react';
import { StatCard, ProgressRing, C, ScreenScroll, StatusBar } from './shared';
import { useHabitStore } from '../state/habitStore';
import {
  formatDuration,
  fromDateKey,
  getCurrentStreak,
  getHabitRangeStats,
  getLongestStreak,
  getMonthWeekBars,
  getRangeStats,
  getWeekBars,
  startOfMonth,
  startOfWeek,
} from '../domain/habits';

const TABS = ['Haftalik', 'Oylik', 'Umumiy'];

export function StatisticsScreen() {
  const { habits, logs } = useHabitStore();
  const [tab, setTab] = useState('Haftalik');
  const today = new Date();
  const totalStart = habits.length > 0
    ? habits
      .map((habit) => fromDateKey(habit.createdAt.slice(0, 10)))
      .sort((a, b) => a.getTime() - b.getTime())[0]
    : startOfMonth(today);

  const todayStats = getRangeStats(habits, logs, today, today, today);
  const weekStats = getRangeStats(habits, logs, startOfWeek(today), today, today);
  const monthStats = getRangeStats(habits, logs, startOfMonth(today), today, today);
  const totalStats = getRangeStats(habits, logs, totalStart, today, today);
  const chartData = tab === 'Haftalik' ? getWeekBars(habits, logs, today) : getMonthWeekBars(habits, logs, today);
  const chartPct = tab === 'Haftalik'
    ? weekStats.completionRate
    : tab === 'Oylik'
      ? monthStats.completionRate
      : totalStats.completionRate;
  const currentStreak = habits.reduce((max, habit) => Math.max(max, getCurrentStreak(habit, logs, today)), 0);
  const longestStreak = habits.reduce((max, habit) => Math.max(max, getLongestStreak(habit, logs, today)), 0);
  const bestHabits = habits
    .map((habit) => {
      const stats = getHabitRangeStats(habit, logs, startOfMonth(today), today, today);
      return { ...habit, pct: stats.completionRate };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const yMax = tab === 'Haftalik' ? Math.max(1, ...chartData.map((item) => item.total)) : 100;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <StatusBar />
      <ScreenScroll top={44} bottom={80} paddingBottom={32}>
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>Statistika</div>
          <div style={{ fontSize: 13, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Odatlar bo‘yicha real natijalar</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 16px 0' }}>
          <StatCard title="Bugun bajarildi" value={`${todayStats.done}/${todayStats.planned}`} subtitle={`${todayStats.completionRate}% muvaffaqiyat`} icon={<Target size={16} />} color={C.primary} />
          <StatCard title="Haftalik natija" value={`${weekStats.completionRate}%`} subtitle={`${weekStats.pending} ta kutilmoqda`} icon={<TrendingUp size={16} />} color={C.purple} />
          <StatCard title="Joriy streak" value={`🔥 ${currentStreak} kun`} subtitle={`Rekord: ${longestStreak} kun`} icon={<Flame size={16} />} color={C.orange} />
          <StatCard title="Umumiy vaqt" value={formatDuration(monthStats.totalDurationMinutes)} subtitle="Bu oy" icon={<Clock size={16} />} color={C.teal} />
        </div>

        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', background: C.card, borderRadius: 14, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === t ? C.primary : 'transparent',
                color: tab === t ? '#fff' : C.grayMed,
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '16px 16px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {tab === 'Haftalik' ? 'Haftalik bajarilishi' : tab === 'Oylik' ? 'Oylik dinamika' : 'Umumiy ko‘rsatkich'}
                </div>
                <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {tab === 'Haftalik' ? 'Bajarilgan odatlar / kun' : 'Bajarilish foizi / hafta'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{chartPct}%</div>
                <div style={{ fontSize: 11, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>o‘rtacha</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <XAxis dataKey="label"
                  axisLine={false} tickLine={false}
                  tick={{ fill: C.grayMed, fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                <YAxis hide domain={[0, yMax]} />
                <Tooltip
                  contentStyle={{ background: C.charcoal, border: 'none', borderRadius: 10, fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#fff' }}
                  cursor={{ fill: 'transparent' }}
                  formatter={(v: number, _name, payload) => [
                    tab === 'Haftalik' ? `${v}/${payload.payload.total} odat` : `${v}%`,
                    '',
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 4, 4]}>
                  {chartData.map((entry, i) => (
                    <Cell key={entry.label} fill={i === chartData.length - 1 ? C.primaryDark : C.primary} opacity={entry.value === 0 ? 0.35 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 14 }}>Eng yaxshi odatlar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bestHabits.map((h, i) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, fontSize: 12, fontWeight: 700, color: i < 3 ? C.orange : C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${h.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {h.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{h.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: h.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{h.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: '#EEF0EE', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${h.pct}%`, height: '100%', background: h.color, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: `linear-gradient(135deg, ${C.primaryLight}, #F8FFF8)`, borderRadius: 18, padding: '20px', display: 'flex', alignItems: 'center', gap: 20, border: `1px solid ${C.primaryLight}` }}>
            <ProgressRing progress={totalStats.completionRate} size={80} strokeWidth={9}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.charcoal }}>{totalStats.completionRate}%</div>
              </div>
            </ProgressRing>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>Umumiy bajarilish darajasi</div>
              <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.5 }}>
                {totalStats.done}/{totalStats.planned} rejalashtirilgan<br />check-in bajarildi
              </div>
            </div>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}
