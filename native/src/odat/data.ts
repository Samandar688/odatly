import type { Expense, Food, MainTab, MealEntry, PhoneUsage, Task, WeightPoint } from './types';

export const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E5E7EB',
  green: '#16A34A',
  greenSoft: '#EAF8EF',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  purple: '#7C3AED',
  purpleSoft: '#F3E8FF',
  orange: '#F97316',
  orangeSoft: '#FFF3E6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const TABS: { key: MainTab; label: string; color: string }[] = [
  { key: 'bugun', label: 'Bugun', color: COLORS.green },
  { key: 'pul', label: 'Pul', color: COLORS.green },
  { key: 'ishlar', label: 'Ishlar', color: COLORS.blue },
  { key: 'telefon', label: 'Telefon', color: COLORS.purple },
  { key: 'ovqat', label: 'Ovqat', color: COLORS.orange },
];

export const expenseCategories = [
  'Ovqat',
  'Transport',
  'Kiyim',
  'Uy',
  "Ko'ngilochar",
  'Aloqa',
  "Sog'liq",
  'Boshqa',
];

export const taskPriorities = ['Yuqori', "O'rta", 'Past'] as const;
export const taskCategories = ['Ish', "O'qish", 'Sport', 'Shaxsiy', 'Boshqa'];
export const focusDurations = [15, 25, 50];
export const focusPurposes = ['Ish / Oqish', 'Kitob', 'Sport', 'Dam olish'];
export const distractionReasons = ['Ish / dars', 'Zerikish', 'Stress', 'Charchoq', "Odat bo'lib qolgan", 'Bilmayman'];

export const initialExpenses: Expense[] = [
  { id: 'e1', title: 'Ovqat', category: 'Ovqat', amount: 20000, time: '09:30' },
  { id: 'e2', title: 'Transport', category: 'Transport', amount: 10000, time: '12:15' },
  { id: 'e3', title: 'Kofe / Shirinlik', category: "Ko'ngilochar", amount: 5000, time: '15:40' },
  { id: 'e4', title: 'Internet / Aloqa', category: 'Aloqa', amount: 10000, time: '18:20' },
];

export const initialTasks: Task[] = [
  { id: 't1', title: 'Landing page dizaynini tugatish', status: 'done', priority: 'Yuqori', category: 'Ish' },
  { id: 't2', title: '30 daqiqa ingliz tili', status: 'done', priority: "O'rta", category: "O'qish" },
  { id: 't3', title: 'Sport: 20 daqiqa yurish', status: 'todo', priority: 'Past', category: 'Sport' },
];

export const phoneUsage: PhoneUsage[] = [
  { id: 'p1', app: 'Instagram', minutes: 45, color: '#E1306C' },
  { id: 'p2', app: 'Telegram', minutes: 40, color: '#229ED9' },
  { id: 'p3', app: 'YouTube', minutes: 30, color: '#FF0000' },
  { id: 'p4', app: 'TikTok', minutes: 15, color: '#111827' },
];

export const foods: Food[] = [
  { id: 'f1', name: 'Osh', calories: 650, portion: '1 porsiya', popular: true },
  { id: 'f2', name: "Lag'mon", calories: 550, portion: '1 porsiya', popular: true },
  { id: 'f3', name: 'Somsa', calories: 300, portion: '1 dona', popular: true },
  { id: 'f4', name: 'Manti', calories: 450, portion: '1 porsiya', popular: true },
  { id: 'f5', name: 'Shashlik', calories: 250, portion: '100 g', popular: true },
  { id: 'f6', name: 'Tuxum', calories: 70, portion: '1 dona', popular: false },
  { id: 'f7', name: 'Non', calories: 70, portion: "1 bo'lak", popular: false },
  { id: 'f8', name: 'Qatiq', calories: 120, portion: '200 ml', popular: false },
];

export const initialMeals: MealEntry[] = [
  { id: 'm1', meal: 'Nonushta', name: 'Nonushta', calories: 450 },
  { id: 'm2', meal: 'Tushlik', name: 'Tushlik', calories: 650 },
  { id: 'm3', meal: 'Kechki ovqat', name: 'Kechki ovqat', calories: 450 },
  { id: 'm4', meal: 'Snack', name: 'Snack', calories: 100 },
];

export const initialWeight: WeightPoint[] = [
  { day: '12', value: 84.0 },
  { day: '13', value: 83.4 },
  { day: '14', value: 82.8 },
  { day: '15', value: 82.5 },
  { day: '16', value: 82.7 },
  { day: '17', value: 83.0 },
  { day: '18', value: 82.4 },
];
