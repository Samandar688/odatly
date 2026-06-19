import { Plus } from 'lucide-react';
import { ProgressRing, HabitCard, C, ScreenScroll, EmptyState } from './shared';
import { useAuth } from '../state/authStore';
import { useHabitStore } from '../state/habitStore';
import {
  formatShortDate,
  getCompletionSummary,
  getPlannedHabits,
  toHabitDailyView,
} from '../domain/habits';

export function HomeScreen({
  onCheckIn, onHabitDetail, onAddHabit,
}: {
  onCheckIn: (id: string) => void;
  onHabitDetail: (id: string) => void;
  onAddHabit: () => void;
}) {
  const { profile, user } = useAuth();
  const { habits, logs } = useHabitStore();
  const today = new Date();
  const firstName = (profile?.fullName || user?.email?.split('@')[0] || "do'stim").split(' ')[0];
  const todayHabits = getPlannedHabits(habits, today).map((habit) => toHabitDailyView(habit, logs, today));
  const summary = getCompletionSummary(habits, logs, today);
  const completed = summary.done;
  const total = summary.planned;
  const pct = summary.completionRate;
  const bestStreak = todayHabits.reduce((max, habit) => Math.max(max, habit.streak), 0);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <ScreenScroll bottom={80} paddingBottom={100}>
        {/* Hero greeting card */}
        <div style={{
          margin: '0 0 0 0',
          background: `linear-gradient(145deg, #2D9162 0%, ${C.primary} 60%, #5CC896 100%)`,
          padding: 'calc(24px + env(safe-area-inset-top, 0px)) 24px 28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

          <div style={{ marginBottom: 2, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Bugun, {formatShortDate(today)}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>
            Salom, {firstName}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.5 }}>
            Bugun kichik qadam — ertaga katta natija.
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* Progress card */}
          <div style={{
            background: C.card, borderRadius: 20, padding: '20px',
            marginTop: -16, marginBottom: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <ProgressRing progress={pct} size={90} strokeWidth={9}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{pct}%</div>
              </div>
            </ProgressRing>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>Bugungi progress</div>
              <div style={{ fontSize: 13, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>
                {total === 0 ? 'Bugun reja yo‘q' : `${completed}/${total} odat bajarildi`}
              </div>
              {/* Mini progress bar */}
              <div style={{ height: 8, background: C.primaryLight, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: C.primary, borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>

          {/* Streak banner */}
          {bestStreak > 0 && (
            <div style={{
              background: `linear-gradient(135deg, ${C.orangeLight}, #FFF8EC)`,
              borderRadius: 16, padding: '14px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12,
              border: `1px solid rgba(255,139,54,0.15)`,
            }}>
              <div style={{ fontSize: 32 }}>🔥</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#B85C00', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{bestStreak} kunlik streak!</div>
                <div style={{ fontSize: 12, color: '#CC7020', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Davom eting, ajoyib ketayapsiz!</div>
              </div>
            </div>
          )}

          {/* Today's habits */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Bugungi odatlar</div>
            <span style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{completed}/{total} bajarildi</span>
          </div>

          {todayHabits.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="Bugun odat rejalashtirilmagan"
              description="Yangi odat qo‘shing yoki mavjud odat kunlarini tahrirlang."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayHabits.map(h => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  onCheckIn={() => onCheckIn(h.id)}
                  onPress={() => onHabitDetail(h.id)}
                />
              ))}
            </div>
          )}

          {/* Motivational footer */}
          <div style={{
            background: C.card, borderRadius: 18, padding: '16px 20px', marginTop: 16,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 28 }}>💡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 2 }}>Kunlik maslahat</div>
              <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.5 }}>
                "Har kuni 1% yaxshilaning — yil oxirida 37 marta yaxshilangan bo'lasiz."
              </div>
            </div>
          </div>
        </div>
      </ScreenScroll>

      {/* Floating + button */}
      <button onClick={onAddHabit} style={{
        position: 'absolute', bottom: 96, right: 20, width: 56, height: 56,
        borderRadius: 18, border: 'none', cursor: 'pointer',
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        boxShadow: `0 6px 20px ${C.primary}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 30,
      }}>
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </button>
    </div>
  );
}
