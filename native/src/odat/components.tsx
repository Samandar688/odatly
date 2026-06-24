import type { ComponentType, ReactNode } from 'react';
import {
  Apple,
  ChevronLeft,
  Home,
  LayoutDashboard,
  ListTodo,
  Plus,
  Scale,
  Smartphone,
  Timer,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Polyline } from 'react-native-svg';

import { COLORS, TABS } from './data';
import type { MainTab } from './types';
import { clamp } from './utils';
import { styles } from './styles';

export type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const headerIcons: Record<string, IconComponent> = {
  Bugun: LayoutDashboard,
  Pul: Wallet,
  Ishlar: ListTodo,
  Telefon: Smartphone,
  Ovqat: Utensils,
  Xarajatlar: Wallet,
  Hisobot: LayoutDashboard,
  'Xarajat qo\'shish': Wallet,
  'Ish qo\'shish': ListTodo,
  'Fokus timer': Timer,
  'Focus rejim': Timer,
  "Chalg'iyapman": Smartphone,
  "Ovqat qo'shish": Apple,
  Vazn: Scale,
};

const tabIcons: Record<MainTab, IconComponent> = {
  bugun: Home,
  pul: Wallet,
  ishlar: ListTodo,
  telefon: Smartphone,
  ovqat: Utensils,
};

export function AppHeader({
  title,
  subtitle,
  accent = COLORS.green,
  onBack,
  icon,
  rightIcon: RightIcon,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  onBack?: () => void;
  icon?: IconComponent;
  rightIcon?: IconComponent;
}) {
  const HeaderIcon = icon ?? headerIcons[title] ?? LayoutDashboard;
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <ChevronLeft color={COLORS.text} size={22} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={[styles.summaryIcon, { backgroundColor: `${accent}16` }]}>
            <HeaderIcon color={accent} size={21} strokeWidth={2.4} />
          </View>
        )}
        <View style={styles.flex}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {RightIcon ? (
        <View style={styles.iconButton}>
          <RightIcon color={accent} size={20} strokeWidth={2.3} />
        </View>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object | object[];
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  title,
  color,
  onPress,
  disabled = false,
  icon: Icon,
}: {
  title: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconComponent;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: color },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {Icon ? <Icon color="#FFFFFF" size={19} strokeWidth={2.4} /> : null}
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  icon: Icon,
  color = COLORS.text,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconComponent;
  color?: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {Icon ? <Icon color={color} size={18} strokeWidth={2.3} /> : null}
      <Text style={[styles.secondaryButtonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamp(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function CircularProgress({
  value,
  color,
  size = 112,
  strokeWidth = 10,
  children,
}: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamp(value) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

export function SummaryCard({
  title,
  value,
  detail,
  percent,
  color,
  icon: Icon,
  onPress,
}: {
  title: string;
  value: string;
  detail: string;
  percent: number;
  color: string;
  icon: IconComponent;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.summaryCard, pressed && styles.pressed]}>
      <View style={styles.summaryTop}>
        <View style={[styles.summaryIcon, { backgroundColor: `${color}16` }]}>
          <Icon color={color} size={20} strokeWidth={2.4} />
        </View>
        <Text style={[styles.smallStrong, { color }]}>{percent}%</Text>
      </View>
      <View style={{ gap: 5 }}>
        <Text style={styles.muted}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text numberOfLines={1} style={styles.muted}>{detail}</Text>
      </View>
      <ProgressBar value={percent} color={color} />
    </Pressable>
  );
}

export function ListItem({
  title,
  subtitle,
  value,
  color,
  icon: Icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  color: string;
  icon: IconComponent;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.listRow}>
      <View style={[styles.listIcon, { backgroundColor: `${color}16` }]}>
        <Icon color={color} size={19} strokeWidth={2.4} />
      </View>
      <View style={styles.listBody}>
        <Text numberOfLines={1} style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.listValue}>{value}</Text> : null}
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>{content}</Pressable>;
}

export function CategoryChip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: color, borderColor: color },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, text, action, color, onPress }: {
  title: string;
  text: string;
  action: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Card style={{ gap: 12, alignItems: 'flex-start' }}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}16` }]}>
        <Plus color={color} size={20} strokeWidth={2.4} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.muted}>{text}</Text>
      <PrimaryButton title={action} color={color} onPress={onPress} />
    </Card>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function BottomTabs({
  active,
  bottom,
  onChange,
}: {
  active: MainTab;
  bottom: number;
  onChange: (tab: MainTab) => void;
}) {
  return (
    <View style={[styles.tabBar, { bottom }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tabButton, isActive && { backgroundColor: `${tab.color}14` }]}
          >
            {(() => {
              const TabIcon = tabIcons[tab.key];
              return <TabIcon color={isActive ? tab.color : COLORS.faint} size={22} strokeWidth={isActive ? 2.5 : 2.1} />;
            })()}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              style={[styles.tabLabel, { color: isActive ? tab.color : COLORS.muted }]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DonutChart({
  data,
  size = 138,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
          {data.map((item) => {
            const segment = (item.value / total) * circumference;
            const dashOffset = -offset;
            offset += segment;
            return (
              <Circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${segment} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export function WeightLineChart({ points, color = COLORS.blue }: { points: { day: string; value: number }[]; color?: string }) {
  const width = 300;
  const height = 140;
  const min = Math.min(...points.map((point) => point.value)) - 0.4;
  const max = Math.max(...points.map((point) => point.value)) + 0.4;
  const scaleY = (value: number) => height - ((value - min) / (max - min || 1)) * height;
  const step = width / Math.max(points.length - 1, 1);
  const polyline = points.map((point, index) => `${index * step},${scaleY(point.value)}`).join(' ');

  return (
    <View style={styles.weightChart}>
      <Svg width="100%" height={150} viewBox={`0 0 ${width} ${height + 10}`}>
        <Polyline points={polyline} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <Circle key={`${point.day}-${point.value}`} cx={index * step} cy={scaleY(point.value)} r="4" fill={color} />
        ))}
      </Svg>
      <View style={styles.rowBetween}>
        {points.map((point) => (
          <Text key={point.day} style={styles.muted}>{point.day}</Text>
        ))}
      </View>
    </View>
  );
}
