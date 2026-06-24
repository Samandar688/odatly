export type MainTab = 'bugun' | 'pul' | 'ishlar' | 'telefon' | 'ovqat';

export type Route =
  | 'onboarding'
  | MainTab
  | 'pul-add'
  | 'pul-expenses'
  | 'pul-report'
  | 'ishlar-add'
  | 'focus-timer'
  | 'telefon-focus'
  | 'telefon-distracted'
  | 'ovqat-add'
  | 'ovqat-weight';

export type ExpenseFilter = 'Kun' | 'Hafta' | 'Oy';
export type ReportPeriod = 'Hafta' | 'Oy';
export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'Yuqori' | "O'rta" | 'Past';
export type FoodTab = 'Ommabop' | 'Barchasi';

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  time: string;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
}

export interface PhoneUsage {
  id: string;
  app: string;
  minutes: number;
  color: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  portion: string;
  popular: boolean;
}

export interface MealEntry {
  id: string;
  meal: string;
  name: string;
  calories: number;
}

export interface WeightPoint {
  day: string;
  value: number;
}

export interface FocusConfig {
  title: string;
  minutes: number;
}
