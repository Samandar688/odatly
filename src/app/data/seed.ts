import {
  type Habit,
  type HabitLog,
  addDays,
  createId,
  dateKey,
  isHabitScheduledOn,
} from '../domain/habits';

export interface SeedData {
  habits: Habit[];
  logs: HabitLog[];
}

const baseHabits = (today: Date): Habit[] => {
  const createdAt = dateKey(addDays(today, -28));

  return [
    {
      id: 'habit_1',
      name: 'Badantarbiya',
      description: 'Har kuni tanani harakatga keltirish',
      icon: '🏃',
      target: '30 daqiqa',
      category: 'Sport',
      color: '#3CB878',
      reminderTime: '07:00',
      days: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'],
      active: true,
      createdAt,
    },
    {
      id: 'habit_2',
      name: "Kitob o'qish",
      description: 'Kunlik mutolaa',
      icon: '📚',
      target: '20 daqiqa',
      category: "O'qish",
      color: '#6C63FF',
      reminderTime: '20:00',
      days: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'],
      active: true,
      createdAt,
    },
    {
      id: 'habit_3',
      name: 'Ingliz tili',
      description: "Yangi so'zlar va listening mashqi",
      icon: '🌐',
      target: '30 daqiqa',
      category: "O'qish",
      color: '#FF6B9D',
      reminderTime: '18:00',
      days: ['Du', 'Se', 'Cho', 'Pa'],
      active: true,
      createdAt,
    },
    {
      id: 'habit_4',
      name: 'Suv ichish',
      description: 'Kun davomida yetarli suv ichish',
      icon: '💧',
      target: '8 stakan',
      category: "Sog'liq",
      color: '#00B4D8',
      reminderTime: '09:00',
      days: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'],
      active: true,
      createdAt,
    },
    {
      id: 'habit_5',
      name: 'Meditatsiya',
      description: 'Nafas va diqqat mashqi',
      icon: '🧘',
      target: '10 daqiqa',
      category: 'Ruhiy rivojlanish',
      color: '#A855F7',
      reminderTime: '06:30',
      days: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'],
      active: true,
      createdAt,
    },
    {
      id: 'habit_6',
      name: 'Yugurish',
      description: 'Haftasiga uch marta yugurish',
      icon: '🚴',
      target: '5 km',
      category: 'Sport',
      color: '#F59E0B',
      reminderTime: '06:00',
      days: ['Du', 'Cho', 'Ju'],
      active: false,
      createdAt,
    },
  ];
};

function shouldLogDone(habitId: string, offset: number) {
  if (offset === 0) return ['habit_1', 'habit_4', 'habit_5'].includes(habitId);
  if (habitId === 'habit_1') return ![2, 9, 16].includes(offset);
  if (habitId === 'habit_2') return ![1, 5, 12, 19].includes(offset);
  if (habitId === 'habit_3') return ![3, 10, 17].includes(offset);
  if (habitId === 'habit_4') return ![7, 14].includes(offset);
  if (habitId === 'habit_5') return ![4, 11, 18].includes(offset);
  return false;
}

function durationForHabit(habitId: string, offset: number) {
  const base: Record<string, number> = {
    habit_1: 30,
    habit_2: 20,
    habit_3: 30,
    habit_4: 8,
    habit_5: 10,
  };
  return (base[habitId] ?? 15) + (offset % 3) * 5;
}

export function createSeedData(today = new Date()): SeedData {
  const habits = baseHabits(today);
  const logs: HabitLog[] = [];
  const now = new Date().toISOString();

  for (let offset = 0; offset < 21; offset += 1) {
    const date = addDays(today, -offset);
    const key = dateKey(date);

    for (const habit of habits.filter((item) => item.active)) {
      if (!isHabitScheduledOn(habit, date)) continue;
      if (offset === 0 && !shouldLogDone(habit.id, offset)) continue;

      const done = shouldLogDone(habit.id, offset);
      logs.push({
        id: createId('log'),
        habitId: habit.id,
        date: key,
        status: done ? 'done' : 'missed',
        durationMinutes: done ? durationForHabit(habit.id, offset) : 0,
        note: done ? 'Reja bo‘yicha bajarildi.' : 'Bugun ulgurilmadi.',
        mood: done ? (offset % 2 === 0 ? "Zo'r" : 'Yaxshi') : '',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { habits, logs };
}
