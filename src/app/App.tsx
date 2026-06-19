import { useState, useEffect, type CSSProperties } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { RegisterScreen, LoginScreen } from './components/AuthScreens';
import { HomeScreen } from './components/HomeScreen';
import { HabitsScreen } from './components/HabitsScreen';
import { AddHabitScreen } from './components/AddHabitScreen';
import { HabitDetailScreen } from './components/HabitDetailScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { CheckInModal } from './components/CheckInModal';
import { BottomTabBar } from './components/BottomTabBar';
import { useAuth } from './state/authStore';
import { useHabitStore } from './state/habitStore';
import type { NewHabitInput } from './domain/habits';

type Screen = 'splash' | 'onboarding' | 'register' | 'login' | 'main' | 'addHabit' | 'habitDetail';

export default function App() {
  const { user, profile, loading: authLoading, authError, signIn, signOut, signUp } = useAuth();
  const { addHabit, habits, storeError } = useHabitStore();
  const isNativeShell = typeof window !== 'undefined'
    && Boolean((window as Window & { Capacitor?: unknown }).Capacitor);
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInHabitId, setCheckInHabitId] = useState('habit_1');
  const [selectedHabitId, setSelectedHabitId] = useState('habit_1');
  const [authNotice, setAuthNotice] = useState('');

  // Auto-advance splash screen
  useEffect(() => {
    if (screen === 'splash' && !authLoading) {
      const t = setTimeout(() => setScreen(user ? 'main' : 'onboarding'), 1200);
      return () => clearTimeout(t);
    }
  }, [authLoading, screen, user]);

  useEffect(() => {
    if (habits.length > 0 && !habits.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habits[0].id);
      setCheckInHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  useEffect(() => {
    if (!authLoading && !user && screen === 'main') {
      setScreen('onboarding');
    }
  }, [authLoading, screen, user]);

  const navigate = (to: Screen) => setScreen(to);

  const openCheckIn = (habitId: string) => {
    setSelectedHabitId(habitId);
    setCheckInHabitId(habitId);
    setShowCheckIn(true);
  };

  const openHabitDetail = (habitId: string) => {
    setSelectedHabitId(habitId);
    navigate('habitDetail');
  };

  const handleRegister = async (input: { fullName: string; email: string; password: string }) => {
    setAuthNotice('');
    const result = await signUp(input);
    if (!result.ok) return;

    if (result.needsEmailConfirmation) {
      setAuthNotice(result.message ?? '');
      navigate('login');
      return;
    }

    setActiveTab('home');
    navigate('main');
  };

  const handleLogin = async (input: { email: string; password: string }) => {
    setAuthNotice('');
    const result = await signIn(input);
    if (result.ok) {
      setActiveTab('home');
      navigate('main');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('home');
    navigate('onboarding');
  };

  const handleSaveHabit = async (input: NewHabitInput) => {
    try {
      const habit = await addHabit(input);
      setSelectedHabitId(habit.id);
      setActiveTab('habits');
      navigate('main');
    } catch {
      // The store exposes the concrete error for UI surfaces that need it.
    }
  };

  const isMain = screen === 'main';
  const outerStyle: CSSProperties = isNativeShell
    ? {
      minHeight: '100vh',
      width: '100vw',
      height: '100vh',
      background: '#F0F4F1',
      overflow: 'hidden',
    }
    : {
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0f172a 0%, #1a2740 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    };
  const phoneStyle: CSSProperties = isNativeShell
    ? {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      borderRadius: 0,
      overflow: 'hidden',
      background: '#F0F4F1',
    }
    : {
      position: 'relative',
      width: 390,
      height: 844,
      borderRadius: 50,
      overflow: 'hidden',
      background: '#F0F4F1',
      boxShadow: [
        '0 0 0 2px rgba(255,255,255,0.08)',
        '0 0 0 8px rgba(255,255,255,0.04)',
        '0 40px 80px rgba(0,0,0,0.7)',
        '0 8px 32px rgba(0,0,0,0.4)',
      ].join(', '),
      flexShrink: 0,
    };

  return (
    <div style={outerStyle}>
      {/* Phone frame */}
      <div style={phoneStyle}>
        {/* Dynamic Island / Notch */}
        {!isNativeShell && <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 34, borderRadius: 20, background: '#000',
          zIndex: 200,
        }} />}

        {/* ── Screens ── */}
        {screen === 'splash' && <SplashScreen />}

        {screen === 'onboarding' && (
          <OnboardingScreen
            onStart={() => navigate('register')}
            onLogin={() => navigate('login')}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            onRegister={handleRegister}
            onLogin={() => navigate('login')}
            loading={authLoading}
            error={authError}
            notice={authNotice}
          />
        )}

        {screen === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            onRegister={() => navigate('register')}
            loading={authLoading}
            error={authError}
            notice={authNotice}
          />
        )}

        {screen === 'main' && (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onCheckIn={openCheckIn}
                onHabitDetail={openHabitDetail}
                onAddHabit={() => navigate('addHabit')}
              />
            )}
            {activeTab === 'habits' && (
              <HabitsScreen
                onAddHabit={() => navigate('addHabit')}
                onHabitDetail={openHabitDetail}
              />
            )}
            {activeTab === 'stats' && <StatisticsScreen />}
            {activeTab === 'calendar' && <CalendarScreen />}
            {activeTab === 'profile' && <ProfileScreen onLogout={handleLogout} />}
          </>
        )}

        {screen === 'addHabit' && (
          <AddHabitScreen
            onBack={() => navigate('main')}
            onSave={handleSaveHabit}
            error={storeError}
          />
        )}

        {screen === 'habitDetail' && (
          <HabitDetailScreen
            habitId={selectedHabitId}
            onBack={() => navigate('main')}
            onCheckIn={openCheckIn}
          />
        )}

        {/* Bottom Tab Bar — only on main tab screens */}
        {isMain && (
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* Check-in modal — always rendered for smooth animation */}
        <CheckInModal
          isOpen={showCheckIn}
          onClose={() => setShowCheckIn(false)}
          habitId={checkInHabitId}
        />

        {/* Screen navigation quick-access overlay (dev helper) */}
        {!isNativeShell && (screen === 'splash' || screen === 'onboarding') && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6, zIndex: 300,
          }}>
            {(['register', 'login', 'main'] as Screen[]).map(s => (
              <button key={s} onClick={() => navigate(s)} style={{
                padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 10,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                backdropFilter: 'blur(8px)',
              }}>
                {s === 'register' ? "Ro'yxat" : s === 'login' ? 'Kirish' : 'Asosiy'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Screen selector pills below phone */}
      {!isNativeShell && isMain && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, background: 'rgba(0,0,0,0.5)',
          padding: '8px 12px', borderRadius: 24, backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 500,
        }}>
          {['home', 'habits', 'stats', 'calendar', 'profile'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 11,
              background: activeTab === t ? '#3CB878' : 'transparent',
              color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.55)',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600,
              transition: 'all 0.2s',
            }}>
              {t === 'home' ? 'Bugun' : t === 'habits' ? 'Odatlar' : t === 'stats' ? 'Statistika' : t === 'calendar' ? 'Kalendar' : 'Profil'}
            </button>
          ))}
        </div>
      )}
      {!isNativeShell && isMain && (
        <div style={{ position: 'fixed', bottom: 62, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 500 }}>
          {(['addHabit', 'habitDetail'] as Screen[]).map(s => (
            <button key={s} onClick={() => navigate(s)} style={{
              padding: '3px 10px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)', fontSize: 10,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', backdropFilter: 'blur(8px)',
            }}>
              {s === 'addHabit' ? '+ Odat qo\'shish' : 'Odat tafsiloti'}
            </button>
          ))}
          <button onClick={() => setShowCheckIn(true)} style={{
            padding: '3px 10px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)', fontSize: 10,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', backdropFilter: 'blur(8px)',
          }}>
            Check-in modal
          </button>
        </div>
      )}
    </div>
  );
}
