import { useEffect, useState } from 'react';
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
  const {
    user,
    loading: authLoading,
    authError,
    signOut,
    enterWithName,
  } = useAuth();
  const { addHabit, habits, storeError } = useHabitStore();
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInHabitId, setCheckInHabitId] = useState('habit_1');
  const [selectedHabitId, setSelectedHabitId] = useState('habit_1');
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    if (screen === 'splash' && !authLoading) {
      const timeoutId = window.setTimeout(() => setScreen(user ? 'main' : 'onboarding'), 900);
      return () => window.clearTimeout(timeoutId);
    }
  }, [authLoading, screen, user]);

  useEffect(() => {
    if (habits.length > 0 && !habits.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habits[0].id);
      setCheckInHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  useEffect(() => {
    if (!authLoading && !user && (screen === 'main' || screen === 'addHabit' || screen === 'habitDetail')) {
      setActiveTab('home');
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

  const handleNameEntry = async (input: { fullName: string }) => {
    setAuthNotice('');
    const result = await enterWithName(input.fullName);
    if (!result.ok) return;

    setActiveTab('home');
    navigate('main');
  };

  const handleLogout = async () => {
    await signOut();
    setAuthNotice('');
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

  return (
    <div className="odatly-app-shell">
      <div className="odatly-app-surface">
        {screen === 'splash' && <SplashScreen />}

        {screen === 'onboarding' && (
          <OnboardingScreen
            onStart={() => navigate('register')}
            onLogin={() => navigate('login')}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            onRegister={handleNameEntry}
            onLogin={() => navigate('login')}
            loading={authLoading}
            error={authError}
            notice={authNotice}
          />
        )}

        {screen === 'login' && (
          <LoginScreen
            onLogin={handleNameEntry}
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

        {isMain && (
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        <CheckInModal
          isOpen={showCheckIn}
          onClose={() => setShowCheckIn(false)}
          habitId={checkInHabitId}
        />
      </div>
    </div>
  );
}
