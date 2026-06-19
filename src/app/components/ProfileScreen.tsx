import { ChevronRight, Globe, Moon, Bell, Settings, LogOut, User, Award } from 'lucide-react';
import { ProgressRing, C, ScreenScroll } from './shared';
import { useAuth } from '../state/authStore';
import { useHabitStore } from '../state/habitStore';
import { getCurrentStreak, getRangeStats, startOfMonth } from '../domain/habits';

const settings = [
  { icon: Globe, label: 'Til', value: "O'zbek", color: '#6C63FF' },
  { icon: Moon, label: 'Tema', value: "Yorug'", color: C.charcoal },
  { icon: Bell, label: 'Bildirishnomalar', value: 'Yoqilgan', color: C.orange },
  { icon: Settings, label: 'Hisob sozlamalari', value: '', color: C.primary },
];

function SettingRow({ icon: Icon, label, value, color, onPress, danger = false }: {
  icon: any; label: string; value: string; color: string;
  onPress?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onPress} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
      textAlign: 'left',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: danger ? '#FFE8E8' : `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={danger ? '#F87171' : color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? '#F87171' : C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</div>
        {value && <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 1 }}>{value}</div>}
      </div>
      <ChevronRight size={16} color={C.grayLight} />
    </button>
  );
}

export function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { profile, user, isRemoteAuth } = useAuth();
  const { habits, logs } = useHabitStore();
  const today = new Date();
  const fullName = profile?.fullName || user?.email?.split('@')[0] || 'Odatly user';
  const email = profile?.email || user?.email || '';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'OU';
  const currentStreak = habits.reduce((max, habit) => Math.max(max, getCurrentStreak(habit, logs, today)), 0);
  const monthStats = getRangeStats(habits, logs, startOfMonth(today), today, today);
  const completionRate = monthStats.completionRate;
  const achievements = [
    { emoji: '🔥', label: `${currentStreak} kun streak`, earned: currentStreak > 0 },
    { emoji: '⭐', label: 'Birinchi odat', earned: habits.length > 0 },
    { emoji: '🏆', label: '30 kun', earned: currentStreak >= 30 },
    { emoji: '💎', label: '100 kun', earned: currentStreak >= 100 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <ScreenScroll bottom={80} paddingBottom={32}>
        {/* Header */}
        <div style={{ padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Profil</div>
        </div>

        {/* User card */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: `linear-gradient(145deg, ${C.primary}, ${C.primaryDark})`,
            borderRadius: 20, padding: '20px',
            boxShadow: `0 8px 28px ${C.primary}33`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                border: '2px solid rgba(255,255,255,0.4)',
              }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{fullName}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 2 }}>{email}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  {[
                    { val: String(habits.length), lbl: 'Odatlar' },
                    { val: String(currentStreak), lbl: 'Streak' },
                    { val: `${completionRate}%`, lbl: 'Daraja' },
                  ].map(s => (
                    <div key={s.lbl} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level & progress */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ProgressRing progress={62} size={64} strokeWidth={7}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16 }}>🌟</div>
                </div>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Silver daraja</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: C.primaryLight, padding: '2px 8px', borderRadius: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {isRemoteAuth ? 'Cloud sync' : 'Lokal saqlash'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.grayMed, marginTop: 4, marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Bu oy bajarilish darajasi</div>
                <div style={{ height: 8, background: C.primaryLight, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${completionRate}%`, height: '100%', background: `linear-gradient(90deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>
              🏅 Yutuqlar
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {achievements.map(a => (
                <div key={a.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    background: a.earned ? C.orangeLight : '#F5F5F8',
                    filter: a.earned ? 'none' : 'grayscale(1)',
                    opacity: a.earned ? 1 : 0.5,
                    border: a.earned ? `2px solid ${C.orange}40` : 'none',
                  }}>
                    {a.emoji}
                  </div>
                  <div style={{ fontSize: 9, color: a.earned ? C.charcoal : C.grayMed, fontWeight: 600, textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            {settings.map((s, i) => (
              <div key={s.label}>
                <SettingRow icon={s.icon} label={s.label} value={s.value} color={s.color} />
                {i < settings.length - 1 && <div style={{ height: 1, background: C.border }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <SettingRow icon={LogOut} label="Chiqish" value="" color="#F87171" danger onPress={onLogout} />
          </div>
        </div>

        {/* Version */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 12, color: C.grayLight, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Odatly v1.0.0 • 2026</div>
        </div>
      </ScreenScroll>
    </div>
  );
}
