import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C, ScreenScroll } from './shared';
import { useHabitStore } from '../state/habitStore';
import {
  DAY_LABELS,
  dateKey,
  endOfMonth,
  formatMonthYear,
  formatShortDate,
  fromDateKey,
  getCalendarDayStatus,
  getLogForDate,
  getPlannedHabits,
  getRangeStats,
  startOfMonth,
} from '../domain/habits';

export function CalendarScreen() {
  const { habits, logs } = useHabitStore();
  const today = new Date();
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [selectedKey, setSelectedKey] = useState(() => dateKey(today));
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const monthStats = getRangeStats(habits, logs, monthStart, monthEnd, today);

  const firstDayShift = (new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayShift).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDate = fromDateKey(selectedKey);
  const todayKey = dateKey(today);
  const selectedHabits = getPlannedHabits(habits, selectedDate).map((habit) => {
    const log = getLogForDate(logs, habit.id, selectedKey);
    return {
      ...habit,
      status: log?.status ?? (selectedKey < todayKey ? 'missed' : 'pending'),
      durationMinutes: log?.durationMinutes ?? 0,
    };
  });
  const doneCnt = selectedHabits.filter(h => h.status === 'done').length;

  const changeMonth = (delta: number) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
    setMonthDate(next);
    setSelectedKey(dateKey(next));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <ScreenScroll bottom={80} paddingBottom={32}>
        <div style={{ padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kalendar</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.charcoal, display: 'flex' }}>
                <ChevronLeft size={22} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: 112, textAlign: 'center' }}>{formatMonthYear(monthDate)}</span>
              <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.charcoal, display: 'flex' }}>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {monthStats.done} bajarildi • {monthStats.missed} bajarilmadi
            {monthStats.skipped > 0 ? ` • ${monthStats.skipped} o'tkazildi` : ''} • {monthStats.pending} kutilmoqda
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 20, padding: '16px 12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '0 0 6px' }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;

                const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                const key = dateKey(cellDate);
                const status = getCalendarDayStatus(habits, logs, cellDate, today);
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;

                const bgColor = isSelected ? C.primary
                  : status === 'done' ? C.primaryLight
                    : status === 'missed' ? '#FFE8E8'
                      : status === 'partial' ? C.orangeLight
                        : 'transparent';

                const textColor = isSelected ? '#fff'
                  : status === 'done' ? C.primary
                    : status === 'missed' ? '#F87171'
                      : isToday ? C.primary
                        : C.charcoal;

                return (
                  <button key={key} onClick={() => setSelectedKey(key)} style={{
                    width: '100%', paddingBottom: '100%', position: 'relative',
                    background: 'none', border: 'none', cursor: 'pointer', borderRadius: 10,
                  }}>
                    <div style={{
                      position: 'absolute', inset: 2,
                      background: bgColor, borderRadius: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      outline: isToday && !isSelected ? `2px solid ${C.primary}` : 'none',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500, color: textColor, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>
                        {day}
                      </span>
                      {!isSelected && status !== 'future' && status !== 'none' && (
                        <div style={{
                          width: 4, height: 4, borderRadius: 2, marginTop: 2,
                          background: status === 'done' ? C.primary
                            : status === 'missed' ? '#F87171'
                              : C.orange,
                        }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatShortDate(selectedDate)}</div>
                <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {selectedHabits.length > 0 ? `${doneCnt}/${selectedHabits.length} odat bajarildi` : "Ma'lumot yo'q"}
                </div>
              </div>
              {selectedHabits.length > 0 && (
                <div style={{ fontSize: 24, fontWeight: 800, color: C.primary, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {Math.round(doneCnt / selectedHabits.length * 100)}%
                </div>
              )}
            </div>

            {selectedHabits.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {selectedHabits.map((h, i) => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: i < selectedHabits.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 16 }}>{h.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{h.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: h.status === 'done' ? C.primaryLight : h.status === 'missed' ? '#FFE8E8' : h.status === 'skipped' ? C.orangeLight : '#F0F0F5',
                      color: h.status === 'done' ? C.primary : h.status === 'missed' ? '#F87171' : h.status === 'skipped' ? C.orange : C.grayMed,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}>
                      {h.status === 'done' ? '✓ Bajarildi' : h.status === 'missed' ? '✗ Bajarilmadi' : h.status === 'skipped' ? "O'tkazildi" : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0', color: C.grayMed, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Bu kun uchun rejalashtirilgan odat yo‘q
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {[
              { color: C.primary, label: 'Bajarildi' },
              { color: '#F87171', label: 'Bajarilmadi' },
              { color: C.orange, label: 'Qisman' },
              { color: '#DDE0E8', label: 'Kutilmoqda' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 11, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}
