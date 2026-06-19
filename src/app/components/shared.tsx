import React from 'react';
import { Check, Plus } from 'lucide-react';
import type { Habit, HabitDailyView } from '../domain/habits';

export const C = {
  primary: '#3CB878',
  primaryDark: '#2D9162',
  primaryLight: '#E8F5EE',
  orange: '#FF8B36',
  orangeLight: '#FFF0E6',
  charcoal: '#1C2035',
  grayMed: '#7B8088',
  grayLight: '#B8BBC4',
  bg: '#F0F4F1',
  card: '#FFFFFF',
  redSoft: '#FFE8E8',
  redMed: '#F87171',
  border: 'rgba(0,0,0,0.08)',
  purple: '#6C63FF',
  teal: '#00B4D8',
};

export type { Habit, HabitDailyView };

// ─── Status Bar ───────────────────────────────────────────────────────────────

// ─── Progress Ring ─────────────────────────────────────────────────────────────

export function ProgressRing({
  progress, size = 80, strokeWidth = 8,
  color = C.primary, trackColor = C.primaryLight, children,
}: {
  progress: number; size?: number; strokeWidth?: number;
  color?: string; trackColor?: string; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, progress)) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Primary Button ────────────────────────────────────────────────────────────

export function PrimaryButton({
  children, onClick, fullWidth = false, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void; fullWidth?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.grayLight : `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
      color: '#fff', border: 'none', borderRadius: 14, height: 52,
      padding: '0 24px', width: fullWidth ? '100%' : 'auto',
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: disabled ? 'none' : `0 4px 16px ${C.primary}44`,
      transition: 'opacity 0.2s, transform 0.1s',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ─── Secondary Button ──────────────────────────────────────────────────────────

export function SecondaryButton({
  children, onClick, fullWidth = false,
}: {
  children: React.ReactNode; onClick?: () => void; fullWidth?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      background: C.primaryLight, color: C.primary, border: 'none',
      borderRadius: 14, height: 52, padding: '0 24px',
      width: fullWidth ? '100%' : 'auto', cursor: 'pointer', fontSize: 15, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'opacity 0.2s, transform 0.1s',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────

export function InputField({
  label, placeholder, type = 'text', value, onChange, icon,
}: {
  label: string; placeholder?: string; type?: string;
  value?: string; onChange?: (v: string) => void; icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</label>
      <div style={{ position: 'relative', background: '#F6F7F9', borderRadius: 12, border: '1.5px solid transparent', transition: 'border-color 0.2s' }}
        onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = C.primary; }}
        onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.grayMed, display: 'flex' }}>
            {icon}
          </div>
        )}
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange?.(e.target.value)}
          style={{
            width: '100%', height: 52, background: 'transparent', border: 'none', outline: 'none',
            padding: `0 16px 0 ${icon ? '44px' : '16px'}`, fontSize: 15, color: C.charcoal,
            borderRadius: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }} />
      </div>
    </div>
  );
}

// ─── Habit Card ────────────────────────────────────────────────────────────────

export function HabitCard({
  habit, onCheckIn, onPress,
}: {
  habit: HabitDailyView; onCheckIn?: () => void; onPress?: () => void;
}) {
  const statusText = habit.todayStatus === 'missed'
    ? 'Bajarilmadi'
    : habit.todayStatus === 'skipped'
      ? "O'tkazildi"
      : habit.completed
        ? 'Bajarildi'
        : 'Kutilmoqda';
  const statusColor = habit.todayStatus === 'missed'
    ? C.redMed
    : habit.todayStatus === 'skipped'
      ? C.orange
      : habit.completed
        ? C.primary
        : C.grayMed;
  const statusBg = habit.todayStatus === 'missed'
    ? C.redSoft
    : habit.todayStatus === 'skipped'
      ? C.orangeLight
      : habit.completed
        ? C.primaryLight
        : '#F0F0F5';

  return (
    <div onClick={onPress} style={{
      background: C.card, borderRadius: 18, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: `${habit.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {habit.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{habit.name}</span>
          {habit.streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.orange }}>{habit.streak} kun</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.grayMed }}>{habit.target}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            color: statusColor,
            background: statusBg,
          }}>
            {statusText}
          </span>
        </div>
      </div>
      {onCheckIn && (
        <button onClick={e => { e.stopPropagation(); onCheckIn(); }} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
          background: habit.completed ? C.primary : C.primaryLight,
          color: habit.completed ? '#fff' : C.primary, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {habit.completed ? <Check size={16} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

export function StatCard({
  title, value, subtitle, icon, color = C.primary,
}: {
  title: string; value: string; subtitle?: string;
  icon?: React.ReactNode; color?: string;
}) {
  return (
    <div style={{
      background: C.card, borderRadius: 18, padding: '16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.grayMed }}>{title}</span>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.charcoal, marginBottom: 2 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.grayMed }}>{subtitle}</div>}
    </div>
  );
}

// ─── Category Chip ─────────────────────────────────────────────────────────────

export function CategoryChip({
  label, active, onClick, color,
}: {
  label: string; active?: boolean; onClick?: () => void; color?: string;
}) {
  const ac = color || C.primary;
  return (
    <button onClick={onClick} style={{
      padding: '7px 15px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      background: active ? `${ac}18` : '#EEF0EE',
      color: active ? ac : C.grayMed,
      fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
      transition: 'all 0.18s', fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      {label}
    </button>
  );
}

// ─── Day Chip ──────────────────────────────────────────────────────────────────

export function DayChip({
  label, active, onClick,
}: {
  label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 12, border: 'none',
      background: active ? C.primary : '#EEF0EE',
      color: active ? '#fff' : C.grayMed,
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.18s', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      {label}
    </button>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon, title, description,
}: {
  icon: string; title: string; description: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.charcoal }}>{title}</div>
      <div style={{ fontSize: 14, color: C.grayMed, lineHeight: 1.5 }}>{description}</div>
    </div>
  );
}

// ─── Bottom Sheet ───────────────────────────────────────────────────────────────

export function BottomSheet({
  isOpen, onClose, children,
}: {
  isOpen: boolean; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50,
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.3s',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51,
        background: C.card, borderRadius: '24px 24px 0 0',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDE0E8' }} />
        </div>
        {children}
      </div>
    </>
  );
}

// ─── Screen Scroll Container ────────────────────────────────────────────────────

export function ScreenScroll({
  children, top = 0, bottom = 0, paddingBottom = 24,
}: {
  children: React.ReactNode; top?: number | string; bottom?: number | string; paddingBottom?: number | string;
}) {
  const bottomValue = typeof bottom === 'number'
    ? `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`
    : bottom;

  return (
    <div style={{
      position: 'absolute', top, bottom: bottomValue, left: 0, right: 0,
      overflowY: 'auto', overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ paddingBottom }}>{children}</div>
    </div>
  );
}

// ─── Screen Header ──────────────────────────────────────────────────────────────

export function ScreenHeader({
  title, onBack, rightElement,
}: {
  title: string; onBack?: () => void; rightElement?: React.ReactNode;
}) {
  return (
    <div style={{
      position: 'sticky', top: 0, background: C.bg, zIndex: 10,
      padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: C.card, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.charcoal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      <span style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, flex: 1 }}>{title}</span>
      {rightElement}
    </div>
  );
}
