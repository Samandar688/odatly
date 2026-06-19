import { useMemo, useState } from 'react';
import { Plus, Bell, ToggleLeft, ToggleRight } from 'lucide-react';
import { CategoryChip, PrimaryButton, C, ScreenScroll, StatusBar, EmptyState, type HabitDailyView } from './shared';
import { useHabitStore } from '../state/habitStore';
import { toHabitDailyView } from '../domain/habits';

function HabitListCard({
  habit, onPress, onToggle,
}: {
  habit: HabitDailyView;
  onPress?: () => void;
  onToggle: () => void;
}) {
  return (
    <div onClick={onPress} style={{
      background: '#fff', borderRadius: 18, padding: '14px 16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `${habit.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>
          {habit.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.name}</span>
            <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: habit.active ? C.primary : C.grayLight }}>
              {habit.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${habit.color}18`, color: habit.color,
            }}>{habit.category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.grayMed }}>
              <Bell size={12} />
              <span style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.reminderTime}</span>
            </div>
            <span style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>• {habit.target}</span>
          </div>
        </div>
      </div>

      {/* Progress bar for today */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 5, background: '#EEF0EE', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: habit.completed ? '100%' : '0%', height: '100%', background: habit.color, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        {habit.streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.streak}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HabitsScreen({
  onAddHabit, onHabitDetail,
}: {
  onAddHabit: () => void; onHabitDetail: (id: string) => void;
}) {
  const { habits, logs, toggleHabitActive } = useHabitStore();
  const [filter, setFilter] = useState('Barchasi');
  const today = new Date();
  const filters = useMemo(() => (
    ['Barchasi', ...Array.from(new Set(habits.map((habit) => habit.category)))]
  ), [habits]);
  const habitViews = habits.map((habit) => toHabitDailyView(habit, logs, today));

  const filtered = filter === 'Barchasi'
    ? habitViews
    : habitViews.filter(h => h.category === filter);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <StatusBar />
      <ScreenScroll top={44} bottom={80} paddingBottom={32}>
        {/* Header */}
        <div style={{ background: C.bg, padding: '16px 20px 0', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Odatlarim</div>
              <div style={{ fontSize: 13, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habits.length} ta odat</div>
            </div>
            <button onClick={onAddHabit} style={{
              width: 44, height: 44, borderRadius: 14, border: 'none',
              background: C.primary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${C.primary}44`,
            }}>
              <Plus size={22} color="#fff" strokeWidth={2.5} />
            </button>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
            {filters.map(f => (
              <CategoryChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </div>
        </div>

        <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="Hozircha odat yo'q"
              description="Bu kategoriyada odat qo'shing."
            />
          ) : (
            filtered.map(h => (
              <HabitListCard
                key={h.id}
                habit={h}
                onPress={() => onHabitDetail(h.id)}
                onToggle={() => toggleHabitActive(h.id)}
              />
            ))
          )}

          {/* Add button at bottom */}
          <div style={{ marginTop: 8 }}>
            <PrimaryButton onClick={onAddHabit} fullWidth>
              <Plus size={18} strokeWidth={2.5} />
              Yangi odat qo'shish
            </PrimaryButton>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}
