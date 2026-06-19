import { useState } from 'react';
import { Bell, Clock, AlignLeft } from 'lucide-react';
import { StatusBar, PrimaryButton, SecondaryButton, CategoryChip, DayChip, InputField, C } from './shared';
import type { DayLabel, NewHabitInput } from '../domain/habits';

const DAYS: DayLabel[] = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'];
const CATEGORIES = ["Sog'liq", 'Sport', "O'qish", 'Ish', 'Moliyaviy', 'Ruhiy rivojlanish', 'Boshqa'];
const COLORS = ['#3CB878', '#6C63FF', '#FF6B9D', '#00B4D8', '#F59E0B', '#A855F7', '#FF8B36', '#10B981'];
const ICONS = ['🏃', '📚', '🌐', '💧', '🧘', '🚴', '💪', '🎯', '✍️', '🎨', '🎵', '🧠', '💰', '🌿', '☀️', '🍎'];

export function AddHabitScreen({
  onBack, onSave, error = '',
}: {
  onBack: () => void;
  onSave: (input: NewHabitInput) => Promise<void>;
  error?: string;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Sport');
  const [days, setDays] = useState<DayLabel[]>(['Du', 'Se', 'Cho', 'Pa', 'Ju']);
  const [color, setColor] = useState('#3CB878');
  const [icon, setIcon] = useState('🏃');
  const [targetTime, setTargetTime] = useState('30 daqiqa');
  const [reminderTime, setReminderTime] = useState('07:00');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');

  const toggleDay = (d: DayLabel) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleSave = async () => {
    setLocalError('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError('Odat nomini kiriting.');
      return;
    }
    if (days.length === 0) {
      setLocalError('Kamida bitta hafta kunini tanlang.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: trimmedName,
        description: desc.trim(),
        category,
        days,
        color,
        icon,
        target: targetTime.trim() || '1 daqiqa',
        reminderTime: reminderTime.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Header */}
      <div style={{
        background: C.bg, padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 12,
        marginTop: 44, flexShrink: 0, borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none', background: C.card,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.charcoal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', flex: 1 }}>Yangi odat</span>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {/* Preview card */}
        <div style={{
          background: `${color}15`, borderRadius: 18, padding: '16px',
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
          border: `2px solid ${color}30`,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {name || "Odat nomi"}
            </div>
            <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{targetTime} • {category}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name & desc */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <InputField label="Odat nomi" placeholder="Masalan: Badantarbiya" value={name} onChange={setName} />
            <InputField label="Tavsif" placeholder="Qisqacha izoh (ixtiyoriy)" value={desc} onChange={setDesc} icon={<AlignLeft size={18} />} />
          </div>

          {/* Category */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>Kategoriya</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(c => (
                <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} color={color} />
              ))}
            </div>
          </div>

          {/* Time & reminder */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Maqsad vaqt" placeholder="30 daqiqa" value={targetTime} onChange={setTargetTime} icon={<Clock size={18} />} />
            <InputField label="Eslatma vaqti" placeholder="07:00" value={reminderTime} onChange={setReminderTime} icon={<Bell size={18} />} />
          </div>

          {/* Days */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>Haftaning kunlari</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DAYS.map(d => (
                <DayChip key={d} label={d} active={days.includes(d)} onClick={() => toggleDay(d)} />
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>Rang</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {COLORS.map(cl => (
                <button key={cl} onClick={() => setColor(cl)} style={{
                  width: 36, height: 36, borderRadius: 10, border: `3px solid ${cl === color ? C.charcoal : 'transparent'}`,
                  background: cl, cursor: 'pointer', transition: 'border 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cl === color && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>Ikonka</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} style={{
                  width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 22,
                  background: ic === icon ? `${color}20` : '#F5F5F8',
                  outline: ic === icon ? `2px solid ${color}` : 'none',
                  transition: 'all 0.15s',
                }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {(localError || error) && (
              <div style={{
                fontSize: 12,
                color: C.redMed,
                background: C.redSoft,
                borderRadius: 12,
                padding: '10px 12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {localError || error}
              </div>
            )}
            <PrimaryButton onClick={handleSave} fullWidth disabled={saving || !name.trim() || days.length === 0}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </PrimaryButton>
            <SecondaryButton onClick={onBack} fullWidth>Bekor qilish</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
