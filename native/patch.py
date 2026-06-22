import sys

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { completionStats, dataKey, logForToday, makeId, slugName, todayKey } from './src/utils';",
    "import { completionStats, dataKey, logForToday, makeId, slugName, todayKey, formatTimeInput } from './src/utils';"
)
content = content.replace(
    "import { styles } from './src/styles';",
    "import { styles } from './src/styles';\nimport { requestPermissionsAsync, scheduleHabitNotifications, cancelHabitNotifications } from './src/notifications';"
)

# 2. Permissions
content = content.replace(
    "    const load = async () => {\n      const rawProfile = await AsyncStorage.getItem(PROFILE_KEY);",
    "    const load = async () => {\n      await requestPermissionsAsync();\n      const rawProfile = await AsyncStorage.getItem(PROFILE_KEY);"
)

# 3. TextInput for time
content = content.replace(
    '            <TextInput\n              value={habitTime}\n              onChangeText={setHabitTime}\n              placeholder="07:00"\n              placeholderTextColor="#9AA1A9"',
    '            <TextInput\n              value={habitTime}\n              onChangeText={(val) => setHabitTime(formatTimeInput(val))}\n              placeholder="07:00"\n              maxLength={5}\n              placeholderTextColor="#9AA1A9"'
)

# 4. saveHabit
old_saveHabit = '''  const saveHabit = () => {
    const trimmedName = habitName.trim();
    if (!trimmedName || habitDays.length === 0) return;

    if (screen === 'edit' && editingHabitId) {
      setHabits((current) => current.map((habit) => (
        habit.id === editingHabitId
          ? {
            ...habit,
            name: trimmedName,
            target: habitTarget.trim() || '1 marta',
            category: habitCategory,
            reminderTime: habitTime.trim(),
            days: habitDays,
            color: habitColor,
          }
          : habit
      )));
      resetHabitForm();
      setTab('habits');
      setScreen('main');
      return;
    }

    const nextHabit: Habit = {
      id: makeId('habit'),
      name: trimmedName,
      target: habitTarget.trim() || '1 marta',
      category: habitCategory,
      reminderTime: habitTime.trim(),
      days: habitDays,
      color: habitColor,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setHabits((current) => [nextHabit, ...current]);
    resetHabitForm();
    setTab('habits');
    setScreen('main');
  };'''

new_saveHabit = '''  const saveHabit = async () => {
    const trimmedName = habitName.trim();
    if (!trimmedName || habitDays.length === 0) return;

    if (screen === 'edit' && editingHabitId) {
      const oldHabit = habits.find((h) => h.id === editingHabitId);
      if (oldHabit?.notificationIds) {
        await cancelHabitNotifications(oldHabit.notificationIds);
      }
      
      const draftHabit: Habit = {
        ...oldHabit!,
        name: trimmedName,
        target: habitTarget.trim() || '1 marta',
        category: habitCategory,
        reminderTime: habitTime.trim(),
        days: habitDays,
        color: habitColor,
      };
      
      const newNotificationIds = draftHabit.active ? await scheduleHabitNotifications(draftHabit) : [];

      setHabits((current) => current.map((habit) => (
        habit.id === editingHabitId
          ? { ...draftHabit, notificationIds: newNotificationIds }
          : habit
      )));
      resetHabitForm();
      setTab('habits');
      setScreen('main');
      return;
    }

    const draftHabit: Habit = {
      id: makeId('habit'),
      name: trimmedName,
      target: habitTarget.trim() || '1 marta',
      category: habitCategory,
      reminderTime: habitTime.trim(),
      days: habitDays,
      color: habitColor,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const newNotificationIds = await scheduleHabitNotifications(draftHabit);
    const nextHabit = { ...draftHabit, notificationIds: newNotificationIds };

    setHabits((current) => [nextHabit, ...current]);
    resetHabitForm();
    setTab('habits');
    setScreen('main');
  };'''
content = content.replace(old_saveHabit, new_saveHabit)

# 5. deleteHabit
old_deleteHabit = '''  const deleteHabit = (habitId: string) => {
    Alert.alert(
      "Odatni o'chirish",
      "Bu odat va unga tegishli barcha loglar o'chadi.",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => {
            setHabits((current) => current.filter((habit) => habit.id !== habitId));
            setLogs((current) => current.filter((log) => log.habitId !== habitId));
            resetHabitForm();
            setSelectedHabitId(null);
            setScreen('main');
            setTab('habits');
          },
        },
      ],
    );
  };'''

new_deleteHabit = '''  const deleteHabit = (habitId: string) => {
    Alert.alert(
      "Odatni o'chirish",
      "Bu odat va unga tegishli barcha loglar o'chadi.",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            const habit = habits.find(h => h.id === habitId);
            if (habit?.notificationIds) {
              await cancelHabitNotifications(habit.notificationIds);
            }
            setHabits((current) => current.filter((habit) => habit.id !== habitId));
            setLogs((current) => current.filter((log) => log.habitId !== habitId));
            resetHabitForm();
            setSelectedHabitId(null);
            setScreen('main');
            setTab('habits');
          },
        },
      ],
    );
  };'''
content = content.replace(old_deleteHabit, new_deleteHabit)

# 6. toggleActive
old_toggleActive = '''  const toggleActive = (habitId: string) => {
    setHabits((current) => current.map((habit) => (
      habit.id === habitId ? { ...habit, active: !habit.active } : habit
    )));
  };'''

new_toggleActive = '''  const toggleActive = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    
    let newNotificationIds = habit.notificationIds;
    
    if (habit.active) {
      if (habit.notificationIds) {
        await cancelHabitNotifications(habit.notificationIds);
      }
      newNotificationIds = [];
    } else {
      newNotificationIds = await scheduleHabitNotifications({ ...habit, active: true });
    }

    setHabits((current) => current.map((h) => (
      h.id === habitId ? { ...h, active: !h.active, notificationIds: newNotificationIds } : h
    )));
  };'''
content = content.replace(old_toggleActive, new_toggleActive)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
