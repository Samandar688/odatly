import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Apple,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  Car,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Coffee,
  Droplets,
  Dumbbell,
  HeartPulse,
  Home,
  House,
  ListTodo,
  PieChart,
  Play,
  Scale,
  Search,
  Settings,
  Shirt,
  Smartphone,
  Timer,
  Utensils,
  Wallet,
  Wifi,
} from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  COLORS,
  distractionReasons,
  expenseCategories,
  focusDurations,
  focusPurposes,
  foods,
  taskCategories,
  taskPriorities,
} from './data';
import type {
  Expense,
  ExpenseFilter,
  FocusConfig,
  Food,
  FoodTab,
  MealEntry,
  MainTab,
  PhoneUsage,
  ReportPeriod,
  Task,
  TaskPriority,
  WeightPoint,
} from './types';
import { formatKcal, formatMinutes, formatMoney, formatTimer, makeId, percent } from './utils';
import {
  AppHeader,
  Card,
  CategoryChip,
  CircularProgress,
  DonutChart,
  type IconComponent,
  ListItem,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  StatCard,
  SummaryCard,
  WeightLineChart,
} from './components';
import { styles } from './styles';

const expenseIcons: Record<string, IconComponent> = {
  Ovqat: Utensils,
  Transport: Car,
  'Kofe / Shirinlik': Coffee,
  'Internet / Aloqa': Wifi,
  Kiyim: Shirt,
  Uy: House,
  Aloqa: Wifi,
  "Sog'liq": HeartPulse,
  Boshqa: CircleHelp,
};

const taskIcons: Record<string, IconComponent> = {
  Ish: BriefcaseBusiness,
  "O'qish": BookOpen,
  Sport: Dumbbell,
  Shaxsiy: Home,
  Boshqa: CircleHelp,
};

const foodIcons: Record<string, IconComponent> = {
  Nonushta: Coffee,
  Tushlik: Utensils,
  'Kechki ovqat': Utensils,
  Snack: Apple,
};

function expenseIcon(item: Expense) {
  return expenseIcons[item.title] ?? expenseIcons[item.category] ?? Wallet;
}

function taskIcon(task: Task) {
  return taskIcons[task.category] ?? ListTodo;
}

function mealIcon(meal: MealEntry) {
  return foodIcons[meal.meal] ?? Utensils;
}

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <View style={{ flex: 1, gap: 22 }}>
      <View style={{ alignItems: 'center', gap: 18 }}>
        <View style={styles.heroLogo}>
          <View style={styles.heroLogoStem}>
            <CheckSquare color={COLORS.green} size={30} strokeWidth={2.4} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={styles.titleLarge}>Odat</Text>
          <Text style={[styles.muted, { textAlign: 'center', fontSize: 15 }]}>
            O'zingni nazorat qil, hayotingni o'zgartir.
          </Text>
        </View>
      </View>

      <View style={styles.heroIllustration}>
        <View style={[styles.floatTile, { left: 28, top: 28 }]}>
          <Wallet color={COLORS.green} size={23} strokeWidth={2.3} />
        </View>
        <View style={[styles.floatTile, { right: 28, top: 44 }]}>
          <CheckSquare color={COLORS.blue} size={23} strokeWidth={2.3} />
        </View>
        <View style={[styles.floatTile, { left: 44, bottom: 26 }]}>
          <Smartphone color={COLORS.purple} size={23} strokeWidth={2.3} />
        </View>
        <View style={[styles.floatTile, { right: 44, bottom: 22 }]}>
          <Utensils color={COLORS.orange} size={23} strokeWidth={2.3} />
        </View>
        <View style={styles.phoneMock}>
          <View style={styles.phoneLine} />
          <View style={[styles.phoneLine, { width: 30, backgroundColor: COLORS.blue }]} />
          <View style={[styles.phoneLine, { width: 48, backgroundColor: COLORS.orange }]} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <PrimaryButton title="Boshlash" color={COLORS.green} onPress={onStart} />
        <SecondaryButton title="Kirish" onPress={onStart} />
      </View>
    </View>
  );
}

export function BugunScreen({
  expenses,
  tasks,
  meals,
  waterGlasses,
  onTab,
}: {
  expenses: Expense[];
  tasks: Task[];
  meals: MealEntry[];
  waterGlasses: number;
  onTab: (tab: MainTab) => void;
}) {
  const moneyTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const mealTotal = meals.reduce((sum, item) => sum + item.calories, 0);
  const score = 72;

  return (
    <>
      <AppHeader title="Bugun" subtitle="Salom, Azamat! Bugun o'zing uchun zo'r kun!" accent={COLORS.green} rightIcon={Calendar} />
      <Card style={{ gap: 14 }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.muted}>Bugungi Odat ball</Text>
            <Text style={styles.valueLarge}>{score}<Text style={[styles.muted, { fontSize: 14 }]}> /100</Text></Text>
            <Text style={styles.muted}>Ajoyib! Davom et!</Text>
          </View>
          <CircularProgress value={score} color={COLORS.green} size={88}>
            <Text style={[styles.smallStrong, { color: COLORS.green }]}>{score}%</Text>
          </CircularProgress>
        </View>
      </Card>

      <View style={styles.grid2}>
        <SummaryCard
          title="Pul"
          value={`${formatMoney(moneyTotal)} / ${formatMoney(100000)}`}
          detail={`${formatMoney(100000 - moneyTotal)} qoldi`}
          percent={percent(moneyTotal, 100000)}
          color={COLORS.green}
          icon={Wallet}
          onPress={() => onTab('pul')}
        />
        <SummaryCard
          title="Ishlar"
          value={`${doneTasks} / ${tasks.length}`}
          detail={`${tasks.length - doneTasks} ta ish qoldi`}
          percent={percent(doneTasks, tasks.length)}
          color={COLORS.blue}
          icon={ListTodo}
          onPress={() => onTab('ishlar')}
        />
        <SummaryCard
          title="Telefon"
          value="2 soat 10 daq / 3 soat"
          detail="50 daqiqa qoldi"
          percent={70}
          color={COLORS.purple}
          icon={Smartphone}
          onPress={() => onTab('telefon')}
        />
        <SummaryCard
          title="Ovqat"
          value={`${formatKcal(mealTotal)} / ${formatKcal(2200)}`}
          detail={`Suv: ${waterGlasses} / 8 stakan`}
          percent={percent(mealTotal, 2200)}
          color={COLORS.orange}
          icon={Utensils}
          onPress={() => onTab('ovqat')}
        />
      </View>

      <View style={[styles.softCard, { backgroundColor: '#F0FDF4' }]}>
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Kichik qadamlar - katta o'zgarishlar sari.</Text>
      </View>
    </>
  );
}

export function PulScreen({
  expenses,
  onAdd,
  onExpenses,
  onReport,
}: {
  expenses: Expense[];
  onAdd: () => void;
  onExpenses: () => void;
  onReport: () => void;
}) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const limit = 100000;
  const progress = percent(total, limit);

  return (
    <>
      <AppHeader title="Pul" accent={COLORS.green} rightIcon={Settings} />
      <LinearGradient
        colors={['#16A34A', '#0F8B45']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.softCard, { gap: 12 }]}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.muted, { color: '#DFFBE8' }]}>Kunlik limit</Text>
            <Text style={[styles.valueLarge, { color: '#FFFFFF' }]}>{formatMoney(limit)}</Text>
          </View>
          <View style={[styles.summaryIcon, styles.iconSoft]}>
            <Wallet color={COLORS.green} size={22} strokeWidth={2.4} />
          </View>
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.smallStrong, { color: '#DFFBE8' }]}>Qoldi: {formatMoney(limit - total)}</Text>
          <Text style={[styles.smallStrong, { color: '#FFFFFF' }]}>{progress}%</Text>
        </View>
        <ProgressBar value={progress} color="#FFFFFF" />
      </LinearGradient>

      <PrimaryButton title="Xarajat qo'shish" color={COLORS.green} icon={Wallet} onPress={onAdd} />

      <Card style={{ gap: 8 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bugungi xarajatlar</Text>
          <Text style={styles.smallStrong}>{formatMoney(total)}</Text>
        </View>
        {expenses.map((item, index) => (
          <View key={item.id}>
            <ListItem title={item.title} subtitle={item.category} value={formatMoney(item.amount)} color={COLORS.green} icon={expenseIcon(item)} />
            {index < expenses.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.flex}>
            <SecondaryButton title="Barchasi" icon={Wallet} color={COLORS.green} onPress={onExpenses} />
          </View>
          <View style={styles.flex}>
            <SecondaryButton title="Hisobot" icon={BarChart3} color={COLORS.green} onPress={onReport} />
          </View>
        </View>
      </Card>
    </>
  );
}

export function AddExpenseScreen({ onBack, onSave }: { onBack: () => void; onSave: (expense: Expense) => void }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ovqat');
  const [note, setNote] = useState('');
  const numericAmount = Number(amount.replace(/\s/g, ''));
  const canSave = numericAmount > 0;

  return (
    <>
      <AppHeader title="Xarajat qo'shish" accent={COLORS.green} onBack={onBack} />
      <Card style={{ gap: 14 }}>
        <View>
          <Text style={styles.label}>Summa</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="0 so'm"
            placeholderTextColor={COLORS.faint}
            style={styles.input}
          />
        </View>
        <View>
          <Text style={styles.label}>Kategoriya</Text>
          <View style={styles.chipWrap}>
            {expenseCategories.map((item) => (
              <CategoryChip key={item} label={item} active={category === item} color={COLORS.green} onPress={() => setCategory(item)} />
            ))}
          </View>
        </View>
        <View>
          <Text style={styles.label}>Izoh</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Izoh yozing..."
            placeholderTextColor={COLORS.faint}
            style={[styles.input, styles.textarea]}
            multiline
          />
        </View>
        <View>
          <Text style={styles.label}>Sana</Text>
          <View style={[styles.input, styles.inputIconRow]}>
            <Calendar color={COLORS.green} size={19} strokeWidth={2.3} />
            <Text style={styles.listTitle}>18.05.2024</Text>
          </View>
        </View>
      </Card>
      <PrimaryButton
        title="Saqlash"
        color={COLORS.green}
        disabled={!canSave}
        onPress={() => onSave({
          id: makeId('expense'),
          title: category,
          category,
          amount: numericAmount,
          time: '19:10',
          note: note.trim(),
        })}
      />
      {!canSave ? <Text style={styles.errorText}>Summani to'g'ri kiriting.</Text> : null}
    </>
  );
}

export function ExpensesScreen({
  expenses,
  onBack,
  onAdd,
}: {
  expenses: Expense[];
  onBack: () => void;
  onAdd: () => void;
}) {
  const [filter, setFilter] = useState<ExpenseFilter>('Kun');
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <AppHeader title="Xarajatlar" accent={COLORS.green} onBack={onBack} />
      <View style={styles.rowBetween}>
        <ChevronLeft color={COLORS.muted} size={22} strokeWidth={2.2} />
        <Text style={styles.sectionTitle}>18 may, 2024</Text>
        <ChevronRight color={COLORS.muted} size={22} strokeWidth={2.2} />
      </View>
      <View style={styles.chipWrap}>
        {(['Kun', 'Hafta', 'Oy'] as ExpenseFilter[]).map((item) => (
          <CategoryChip key={item} label={item} active={filter === item} color={COLORS.green} onPress={() => setFilter(item)} />
        ))}
      </View>
      <Card>
        <Text style={styles.muted}>Jami xarajat</Text>
        <Text style={styles.valueLarge}>{formatMoney(total)}</Text>
      </Card>
      <Card style={{ gap: 8 }}>
        {expenses.map((item, index) => (
          <View key={item.id}>
            <ListItem title={item.title} subtitle={item.time} value={formatMoney(item.amount)} color={COLORS.green} icon={expenseIcon(item)} />
            {index < expenses.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </Card>
      <PrimaryButton title="Xarajat qo'shish" color={COLORS.green} icon={Wallet} onPress={onAdd} />
    </>
  );
}

export function PulReportScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<ReportPeriod>('Hafta');
  const chart = [
    { label: 'Ovqat', value: 35, color: COLORS.orange },
    { label: 'Transport', value: 20, color: COLORS.blue },
    { label: 'Kiyim', value: 15, color: COLORS.purple },
    { label: 'Aloqa', value: 10, color: COLORS.green },
    { label: 'Boshqa', value: 20, color: COLORS.warning },
  ];

  return (
    <>
      <AppHeader title="Hisobot" accent={COLORS.green} icon={PieChart} onBack={onBack} />
      <View style={styles.chipWrap}>
        {(['Hafta', 'Oy'] as ReportPeriod[]).map((item) => (
          <CategoryChip key={item} label={item} active={period === item} color={COLORS.green} onPress={() => setPeriod(item)} />
        ))}
      </View>
      <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>12 may - 18 may</Text>
      <View style={styles.statGrid}>
        <StatCard label="Jami xarajat" value={formatMoney(620000)} />
        <StatCard label="O'sish" value="+12%" />
      </View>
      <Card style={{ gap: 12 }}>
        <ListItem title="Eng ko'p xarajat" subtitle="Ovqat" value={formatMoney(220000)} color={COLORS.orange} icon={Utensils} />
      </Card>
      <Card style={{ gap: 16 }}>
        <View style={styles.chartBox}>
          <DonutChart data={chart} />
        </View>
        {chart.map((item) => (
          <View key={item.label} style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: item.color }} />
              <Text style={styles.listTitle}>{item.label}</Text>
            </View>
            <Text style={styles.smallStrong}>{item.value}%</Text>
          </View>
        ))}
      </Card>
    </>
  );
}

export function IshlarScreen({
  tasks,
  onToggle,
  onAdd,
  onFocus,
}: {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAdd: () => void;
  onFocus: (title: string, minutes?: number) => void;
}) {
  const done = tasks.filter((task) => task.status === 'done').length;
  const progress = percent(done, tasks.length);

  return (
    <>
      <AppHeader title="Ishlar" accent={COLORS.blue} rightIcon={Calendar} />
      <Card style={{ gap: 12, backgroundColor: COLORS.blueSoft }}>
        <Text style={styles.smallStrong}>Bugungi 3 ta muhim ish</Text>
        <Text style={[styles.valueLarge, { color: COLORS.blue }]}>{done} <Text style={styles.muted}>/ {tasks.length} bajarildi</Text></Text>
        <ProgressBar value={progress} color={COLORS.blue} />
      </Card>
      <PrimaryButton title="Yangi ish qo'shish" color={COLORS.blue} icon={ListTodo} onPress={onAdd} />
      <Card style={{ gap: 4 }}>
        {tasks.map((task, index) => {
          const isDone = task.status === 'done';
          const TaskIcon = taskIcon(task);
          return (
            <View key={task.id}>
              <View style={styles.taskRow}>
                <Pressable
                  onPress={() => onToggle(task.id)}
                  style={[styles.checkbox, { borderColor: isDone ? COLORS.success : COLORS.border, backgroundColor: isDone ? COLORS.success : 'transparent' }]}
                >
                  {isDone ? <Check color="#FFFFFF" size={17} strokeWidth={3} /> : null}
                </Pressable>
                <View style={[styles.listIcon, { backgroundColor: `${COLORS.blue}12` }]}>
                  <TaskIcon color={COLORS.blue} size={18} strokeWidth={2.3} />
                </View>
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[styles.listTitle, isDone && { color: COLORS.faint }]}>{task.title}</Text>
                  <Text style={styles.muted}>{isDone ? 'Bajarildi' : task.priority}</Text>
                </View>
                {!isDone ? (
                  <Pressable onPress={() => onFocus(task.title, 25)} style={[styles.chip, { borderColor: COLORS.blue }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Play color={COLORS.blue} size={15} strokeWidth={2.5} />
                      <Text style={[styles.chipText, { color: COLORS.blue }]}>Boshlash</Text>
                    </View>
                  </Pressable>
                ) : (
                  <Check color={COLORS.success} size={19} strokeWidth={3} />
                )}
              </View>
              {index < tasks.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </Card>
      <View style={[styles.softCard, { backgroundColor: '#EFF6FF' }]}>
        <Text style={styles.sectionTitle}>Kun yakuni</Text>
        <Text style={styles.muted}>Kun oxiri hisobotini to'ldirish</Text>
      </View>
    </>
  );
}

export function AddTaskScreen({ onBack, onSave }: { onBack: () => void; onSave: (task: Task) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>("O'rta");
  const [category, setCategory] = useState('Ish');
  const canSave = title.trim().length > 0;

  return (
    <>
      <AppHeader title="Ish qo'shish" accent={COLORS.blue} onBack={onBack} />
      <Card style={{ gap: 14 }}>
        <View>
          <Text style={styles.label}>Ish nomi</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ish nomini yozing"
            placeholderTextColor={COLORS.faint}
            style={styles.input}
          />
        </View>
        <View>
          <Text style={styles.label}>Muhimlik</Text>
          <View style={styles.chipWrap}>
            {taskPriorities.map((item) => (
              <CategoryChip key={item} label={item} active={priority === item} color={COLORS.blue} onPress={() => setPriority(item)} />
            ))}
          </View>
        </View>
        <View>
          <Text style={styles.label}>Kategoriya</Text>
          <View style={styles.chipWrap}>
            {taskCategories.map((item) => (
              <CategoryChip key={item} label={item} active={category === item} color={COLORS.blue} onPress={() => setCategory(item)} />
            ))}
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.inputMetaRow}>
            <View style={[styles.listIcon, { backgroundColor: `${COLORS.blue}12` }]}>
              <Bell color={COLORS.blue} size={18} strokeWidth={2.3} />
            </View>
            <View>
              <Text style={styles.listTitle}>Eslatma vaqti</Text>
              <Text style={styles.muted}>Eslatma o'rnatish</Text>
            </View>
          </View>
          <Text style={[styles.smallStrong, { color: COLORS.blue }]}>Tanlash</Text>
        </View>
      </Card>
      <PrimaryButton
        title="Saqlash"
        color={COLORS.blue}
        disabled={!canSave}
        onPress={() => onSave({ id: makeId('task'), title: title.trim(), status: 'todo', priority, category })}
      />
      {!canSave ? <Text style={styles.errorText}>Ish nomini yozing.</Text> : null}
    </>
  );
}

export function FocusTimerScreen({ config, onBack }: { config: FocusConfig; onBack: () => void }) {
  const totalSeconds = config.minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setRemaining(totalSeconds);
    setRunning(true);
  }, [totalSeconds, config.title]);

  useEffect(() => {
    if (!running || remaining <= 0) return undefined;
    const timer = setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [running, remaining]);

  const progress = 100 - percent(remaining, totalSeconds);

  return (
    <>
      <AppHeader title="Fokus timer" accent={COLORS.blue} icon={Timer} onBack={onBack} />
      <Card style={{ gap: 8 }}>
        <Text style={styles.muted}>Ish</Text>
        <Text style={styles.sectionTitle}>{config.title}</Text>
      </Card>
      <View style={styles.timerCircleWrap}>
        <CircularProgress value={progress} color={COLORS.blue} size={230} strokeWidth={14} />
        <Text style={styles.timerNumber}>{formatTimer(remaining)}</Text>
        <Text style={styles.timerTarget}>{config.minutes}:00</Text>
      </View>
      <PrimaryButton title={running ? 'Pauza' : 'Davom etish'} color={COLORS.blue} icon={Timer} onPress={() => setRunning((current) => !current)} />
      <SecondaryButton title="Tugatish" icon={CheckSquare} color={COLORS.blue} onPress={onBack} />
      {remaining === 0 ? (
        <View style={[styles.softCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.sectionTitle}>Zo'r! Fokus tugadi.</Text>
          <Text style={styles.muted}>Endi natijani Ishlar bo'limida belgilashingiz mumkin.</Text>
        </View>
      ) : null}
    </>
  );
}

export function TelefonScreen({
  usage,
  onFocus,
  onDistracted,
}: {
  usage: PhoneUsage[];
  onFocus: () => void;
  onDistracted: () => void;
}) {
  const total = usage.reduce((sum, item) => sum + item.minutes, 0);
  const limit = 180;
  const progress = percent(total, limit);

  return (
    <>
      <AppHeader title="Telefon" accent={COLORS.purple} rightIcon={Settings} />
      <Card style={{ gap: 12, backgroundColor: COLORS.purpleSoft }}>
        <Text style={styles.muted}>Bugungi limit</Text>
        <Text style={styles.valueLarge}>{formatMinutes(limit)}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>Qoldi: {formatMinutes(Math.max(limit - total, 0))}</Text>
          <Text style={[styles.smallStrong, { color: COLORS.purple }]}>{progress}%</Text>
        </View>
        <ProgressBar value={progress} color={COLORS.purple} />
      </Card>
      <PrimaryButton title="Focus rejimini boshlash" color={COLORS.purple} icon={Timer} onPress={onFocus} />
      <SecondaryButton title="Hozir chalg'iyapman" icon={Smartphone} color={COLORS.purple} onPress={onDistracted} />
      <Card style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>Ilovalar bo'yicha vaqt</Text>
        {usage.map((item) => (
          <View key={item.id} style={{ gap: 7 }}>
            <ListItem title={item.app} value={formatMinutes(item.minutes)} color={item.color} icon={Smartphone} />
            <ProgressBar value={percent(item.minutes, 60)} color={COLORS.purple} />
          </View>
        ))}
        <SecondaryButton title="Barchasi" icon={Smartphone} color={COLORS.purple} onPress={() => undefined} />
      </Card>
    </>
  );
}

export function TelefonFocusScreen({ onBack, onStart }: { onBack: () => void; onStart: (config: FocusConfig) => void }) {
  const [duration, setDuration] = useState(25);
  const [purpose, setPurpose] = useState('Ish / Oqish');
  const [dnd, setDnd] = useState(true);

  return (
    <>
      <AppHeader title="Focus rejim" accent={COLORS.purple} icon={Timer} onBack={onBack} />
      <Card style={{ gap: 14 }}>
        <View>
          <Text style={styles.label}>Vaqt</Text>
          <View style={styles.chipWrap}>
            {focusDurations.map((item) => (
              <CategoryChip key={item} label={`${item} daqiqa`} active={duration === item} color={COLORS.purple} onPress={() => setDuration(item)} />
            ))}
          </View>
        </View>
        <View>
          <Text style={styles.label}>Nimani qilmoqchisiz?</Text>
          <View style={styles.chipWrap}>
            {focusPurposes.map((item) => (
              <CategoryChip key={item} label={item} active={purpose === item} color={COLORS.purple} onPress={() => setPurpose(item)} />
            ))}
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.listTitle}>Bezovta qilmasin</Text>
            <Text style={styles.muted}>Faqat visual holat</Text>
          </View>
          {/* MVP: this is a visual switch only; it does not call any OS-level DND API. */}
          <Pressable
            onPress={() => setDnd((current) => !current)}
            style={[styles.toggle, { backgroundColor: dnd ? COLORS.purple : COLORS.border, alignItems: dnd ? 'flex-end' : 'flex-start' }]}
          >
            <View style={styles.toggleKnob} />
          </Pressable>
        </View>
      </Card>
      <PrimaryButton title="Boshlash" color={COLORS.purple} icon={Timer} onPress={() => onStart({ title: purpose, minutes: duration })} />
    </>
  );
}

export function DistractedScreen({ onBack, onStartFocus }: { onBack: () => void; onStartFocus: () => void }) {
  const [selected, setSelected] = useState('');

  return (
    <>
      <AppHeader title="Chalg'iyapman" accent={COLORS.purple} icon={Smartphone} onBack={onBack} />
      <Text style={[styles.titleLarge, { fontSize: 26 }]}>Nimadan qochyapsan?</Text>
      <Card style={{ gap: 10 }}>
        {distractionReasons.map((reason) => (
          <Pressable
            key={reason}
            onPress={() => setSelected(reason)}
            style={[
              styles.compactCard,
              selected === reason && { borderColor: COLORS.purple, backgroundColor: COLORS.purpleSoft },
            ]}
          >
            <Text style={styles.listTitle}>{reason}</Text>
          </Pressable>
        ))}
      </Card>
      {selected ? (
        <View style={[styles.softCard, { backgroundColor: COLORS.purpleSoft }]}>
          <Text style={styles.sectionTitle}>3 daqiqa kut. Keyin qaror qilamiz.</Text>
          <Text style={styles.muted}>Hozir impulsni sezdik. Endi bitta kichik ishga qaytamiz.</Text>
        </View>
      ) : null}
      <PrimaryButton title="5 daqiqa ishni boshlash" color={COLORS.purple} icon={Timer} disabled={!selected} onPress={onStartFocus} />
    </>
  );
}

export function OvqatScreen({
  meals,
  waterGlasses,
  onAddFood,
  onWater,
  onWeight,
}: {
  meals: MealEntry[];
  waterGlasses: number;
  onAddFood: () => void;
  onWater: () => void;
  onWeight: () => void;
}) {
  const total = meals.reduce((sum, item) => sum + item.calories, 0);
  const target = 2200;
  const progress = percent(total, target);

  return (
    <>
      <AppHeader title="Ovqat" accent={COLORS.orange} rightIcon={Settings} />
      <Card style={{ gap: 12, backgroundColor: COLORS.orangeSoft }}>
        <Text style={styles.muted}>Kunlik maqsad</Text>
        <Text style={styles.valueLarge}>{formatKcal(target)}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>Qoldi: {formatKcal(Math.max(target - total, 0))}</Text>
          <Text style={[styles.smallStrong, { color: COLORS.orange }]}>{progress}%</Text>
        </View>
        <ProgressBar value={progress} color={COLORS.orange} />
      </Card>
      <PrimaryButton title="Ovqat qo'shish" color={COLORS.orange} icon={Utensils} onPress={onAddFood} />
      <Card style={{ gap: 8 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bugungi ovqatlar</Text>
          <Text style={styles.smallStrong}>{formatKcal(total)}</Text>
        </View>
        {meals.map((meal, index) => (
          <View key={meal.id}>
            <ListItem title={meal.meal} subtitle={meal.name} value={formatKcal(meal.calories)} color={COLORS.orange} icon={mealIcon(meal)} />
            {index < meals.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </Card>
      <View style={styles.statGrid}>
        <Pressable onPress={onWater} style={[styles.statCard, { gap: 8 }]}>
          <Droplets color={COLORS.blue} size={22} strokeWidth={2.3} />
          <Text style={styles.muted}>Suv</Text>
          <Text style={styles.value}>{waterGlasses} / 8 stakan</Text>
          <ProgressBar value={percent(waterGlasses, 8)} color={COLORS.blue} />
        </Pressable>
        <Pressable onPress={onWeight} style={[styles.statCard, { gap: 8 }]}>
          <Scale color={COLORS.orange} size={22} strokeWidth={2.3} />
          <Text style={styles.muted}>Vazn</Text>
          <Text style={styles.value}>82.4 kg</Text>
          <Text style={styles.smallStrong}>Trendni ko'rish</Text>
        </Pressable>
      </View>
    </>
  );
}

export function AddFoodScreen({ onBack, onSave }: { onBack: () => void; onSave: (food: Food) => void }) {
  const [tab, setTab] = useState<FoodTab>('Ommabop');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleFoods = foods.filter((food) => {
    const matchesTab = tab === 'Barchasi' || food.popular;
    const matchesQuery = food.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesQuery;
  });
  const selected = foods.find((food) => food.id === selectedId);

  return (
    <>
      <AppHeader title="Ovqat qo'shish" accent={COLORS.orange} onBack={onBack} />
      <View style={styles.chipWrap}>
        {(['Ommabop', 'Barchasi'] as FoodTab[]).map((item) => (
          <CategoryChip key={item} label={item} active={tab === item} color={COLORS.orange} onPress={() => setTab(item)} />
        ))}
      </View>
      <View style={styles.inputIconRow}>
        <Search color={COLORS.orange} size={19} strokeWidth={2.3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ovqat qidirish"
          placeholderTextColor={COLORS.faint}
          style={styles.inputPlain}
        />
      </View>
      <Card style={{ gap: 8 }}>
        {visibleFoods.length === 0 ? (
          <Text style={styles.muted}>Natija topilmadi.</Text>
        ) : (
          visibleFoods.map((food) => (
            <Pressable
              key={food.id}
              onPress={() => setSelectedId(food.id)}
              style={[
                styles.compactCard,
                selectedId === food.id && { borderColor: COLORS.orange, backgroundColor: COLORS.orangeSoft },
              ]}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.listTitle}>{food.name}</Text>
                  <Text style={styles.muted}>{food.portion}</Text>
                </View>
                <Text style={styles.smallStrong}>{formatKcal(food.calories)}</Text>
              </View>
            </Pressable>
          ))
        )}
      </Card>
      <SecondaryButton title="Boshqa ovqat qo'shish" onPress={() => setQuery('')} />
      <PrimaryButton title="Qo'shish" color={COLORS.orange} disabled={!selected} onPress={() => selected && onSave(selected)} />
    </>
  );
}

export function WeightScreen({
  points,
  onBack,
  onAddWeight,
}: {
  points: WeightPoint[];
  onBack: () => void;
  onAddWeight: () => void;
}) {
  const current = points[points.length - 1]?.value ?? 0;
  const min = useMemo(() => Math.min(...points.map((point) => point.value)), [points]);

  return (
    <>
      <AppHeader title="Vazn" accent={COLORS.blue} icon={Scale} onBack={onBack} />
      <Card style={{ gap: 8 }}>
        <Text style={styles.muted}>Vazn (kg)</Text>
        <Text style={styles.valueLarge}>{current.toFixed(1)} kg</Text>
      </Card>
      <View style={styles.rowBetween}>
        <View style={styles.iconButton}>
          <ChevronLeft color={COLORS.muted} size={22} strokeWidth={2.3} />
        </View>
        <Text style={styles.sectionTitle}>18 may, 2024</Text>
        <View style={styles.iconButton}>
          <ChevronRight color={COLORS.muted} size={22} strokeWidth={2.3} />
        </View>
      </View>
      <WeightLineChart points={points} />
      <View style={styles.statGrid}>
        <StatCard label="Eng past" value={`${min.toFixed(1)} kg`} />
        <StatCard label="Oxirgi" value={`${current.toFixed(1)} kg`} />
      </View>
      <PrimaryButton title="Vazn qo'shish" color={COLORS.blue} icon={Scale} onPress={onAddWeight} />
    </>
  );
}
