import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabs } from './src/odat/components';
import { initialExpenses, initialMeals, initialTasks, initialWeight, phoneUsage } from './src/odat/data';
import { styles } from './src/odat/styles';
import type { Expense, FocusConfig, Food, MainTab, MealEntry, Route, Task, WeightPoint } from './src/odat/types';
import { makeId } from './src/odat/utils';
import {
  AddExpenseScreen,
  AddFoodScreen,
  AddTaskScreen,
  BugunScreen,
  DistractedScreen,
  ExpensesScreen,
  FocusTimerScreen,
  IshlarScreen,
  OnboardingScreen,
  OvqatScreen,
  PulReportScreen,
  PulScreen,
  TelefonFocusScreen,
  TelefonScreen,
  WeightScreen,
} from './src/odat/screens';

const mainRoutes: Route[] = ['bugun', 'pul', 'ishlar', 'telefon', 'ovqat'];

function AppInner() {
  const insets = useSafeAreaInsets();
  const [started, setStarted] = useState(false);
  const [route, setRoute] = useState<Route>('onboarding');
  const [activeTab, setActiveTab] = useState<MainTab>('bugun');
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [meals, setMeals] = useState<MealEntry[]>(initialMeals);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [weightPoints, setWeightPoints] = useState<WeightPoint[]>(initialWeight);
  const [focusConfig, setFocusConfig] = useState<FocusConfig>({
    title: '30 daqiqa ingliz tili',
    minutes: 25,
  });

  const bottomSafe = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 14);
  const tabBarBottom = bottomSafe + 6;
  const isMainRoute = started && mainRoutes.includes(route);

  const openTab = (tab: MainTab) => {
    setStarted(true);
    setActiveTab(tab);
    setRoute(tab);
  };

  const goBack = () => {
    if (route.startsWith('pul-')) openTab('pul');
    else if (route.startsWith('ishlar-') || route === 'focus-timer') openTab('ishlar');
    else if (route.startsWith('telefon-')) openTab('telefon');
    else if (route.startsWith('ovqat-')) openTab('ovqat');
    else openTab(activeTab);
  };

  const saveExpense = (expense: Expense) => {
    setExpenses((current) => [expense, ...current]);
    openTab('pul');
  };

  const saveTask = (task: Task) => {
    setTasks((current) => [...current, task]);
    openTab('ishlar');
  };

  const toggleTask = (taskId: string) => {
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task
    )));
  };

  const openFocusTimer = (title: string, minutes = 25) => {
    setFocusConfig({ title, minutes });
    setRoute('focus-timer');
  };

  const saveFood = (food: Food) => {
    setMeals((current) => [
      ...current,
      {
        id: makeId('meal'),
        meal: 'Snack',
        name: food.name,
        calories: food.calories,
      },
    ]);
    openTab('ovqat');
  };

  const addWater = () => {
    setWaterGlasses((current) => Math.min(current + 1, 8));
  };

  const addWeight = () => {
    setWeightPoints((current) => {
      const last = current[current.length - 1]?.value ?? 82.4;
      const nextDay = String(12 + current.length);
      return [...current.slice(-6), { day: nextDay, value: Math.max(last - 0.1, 40) }];
    });
  };

  const renderScreen = () => {
    if (!started || route === 'onboarding') {
      return <OnboardingScreen onStart={() => openTab('bugun')} />;
    }

    if (route === 'bugun') {
      return (
        <BugunScreen
          expenses={expenses}
          tasks={tasks}
          meals={meals}
          waterGlasses={waterGlasses}
          onTab={openTab}
        />
      );
    }

    if (route === 'pul') {
      return (
        <PulScreen
          expenses={expenses}
          onAdd={() => setRoute('pul-add')}
          onExpenses={() => setRoute('pul-expenses')}
          onReport={() => setRoute('pul-report')}
        />
      );
    }

    if (route === 'pul-add') return <AddExpenseScreen onBack={goBack} onSave={saveExpense} />;
    if (route === 'pul-expenses') return <ExpensesScreen expenses={expenses} onBack={goBack} onAdd={() => setRoute('pul-add')} />;
    if (route === 'pul-report') return <PulReportScreen onBack={goBack} />;

    if (route === 'ishlar') {
      return (
        <IshlarScreen
          tasks={tasks}
          onToggle={toggleTask}
          onAdd={() => setRoute('ishlar-add')}
          onFocus={openFocusTimer}
        />
      );
    }

    if (route === 'ishlar-add') return <AddTaskScreen onBack={goBack} onSave={saveTask} />;
    if (route === 'focus-timer') return <FocusTimerScreen config={focusConfig} onBack={goBack} />;

    if (route === 'telefon') {
      return (
        <TelefonScreen
          usage={phoneUsage}
          onFocus={() => setRoute('telefon-focus')}
          onDistracted={() => setRoute('telefon-distracted')}
        />
      );
    }

    if (route === 'telefon-focus') {
      return (
        <TelefonFocusScreen
          onBack={goBack}
          onStart={(config) => {
            setFocusConfig(config);
            setRoute('focus-timer');
          }}
        />
      );
    }

    if (route === 'telefon-distracted') {
      return (
        <DistractedScreen
          onBack={goBack}
          onStartFocus={() => openFocusTimer('5 daqiqa ishni boshlash', 5)}
        />
      );
    }

    if (route === 'ovqat') {
      return (
        <OvqatScreen
          meals={meals}
          waterGlasses={waterGlasses}
          onAddFood={() => setRoute('ovqat-add')}
          onWater={addWater}
          onWeight={() => setRoute('ovqat-weight')}
        />
      );
    }

    if (route === 'ovqat-add') return <AddFoodScreen onBack={goBack} onSave={saveFood} />;
    if (route === 'ovqat-weight') return <WeightScreen points={weightPoints} onBack={goBack} onAddWeight={addWeight} />;

    return null;
  };

  if (!started || route === 'onboarding') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.onboardingContent,
            { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 30 },
          ]}
        >
          {renderScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.appRoot}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.screenContent,
            {
              paddingTop: insets.top + 12,
              paddingBottom: isMainRoute ? tabBarBottom + 90 : bottomSafe + 28,
            },
          ]}
        >
          {renderScreen()}
        </ScrollView>
        {isMainRoute ? <BottomTabs active={activeTab} bottom={tabBarBottom} onChange={openTab} /> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppInner />
    </SafeAreaProvider>
  );
}
