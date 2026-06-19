import { useEffect, useState } from 'react';
import { Clock, FileText } from 'lucide-react';
import { BottomSheet, PrimaryButton, InputField, C } from './shared';
import { getLogForDate, parseDurationMinutes } from '../domain/habits';
import { useHabitStore } from '../state/habitStore';

const MOODS = [
  { label: "Zo'r", emoji: '😄', color: C.primary },
  { label: 'Yaxshi', emoji: '🙂', color: '#6C63FF' },
  { label: "O'rtacha", emoji: '😐', color: C.orange },
  { label: 'Charchadim', emoji: '😓', color: '#F87171' },
];

export function CheckInModal({
  isOpen, onClose, habitId,
}: {
  isOpen: boolean; onClose: () => void; habitId: string;
}) {
  const { habits, logs, upsertHabitLog } = useHabitStore();
  const habit = habits.find(h => h.id === habitId);
  const [done, setDone] = useState<boolean | null>(null);
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!isOpen || !habit) return;

    const todayLog = getLogForDate(logs, habit.id, new Date());
    setDone(todayLog ? todayLog.status === 'done' : null);
    setDuration(todayLog?.durationMinutes ? String(todayLog.durationMinutes) : '');
    setNote(todayLog?.note ?? '');
    setMood(todayLog?.mood ?? '');
  }, [habit, isOpen, logs]);

  const handleSave = async () => {
    if (!habit || done === null) return;

    setSaving(true);
    setLocalError('');
    try {
      await upsertHabitLog({
        habitId: habit.id,
        status: done ? 'done' : 'missed',
        durationMinutes: done ? parseDurationMinutes(duration) : 0,
        note: note.trim(),
        mood,
      });

      setDone(null);
      setDuration('');
      setNote('');
      setMood('');
      onClose();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Check-in saqlanmadi.');
    } finally {
      setSaving(false);
    }
  };

  if (!habit) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '8px 20px 32px' }}>
        {/* Habit info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${habit.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            {habit.icon}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.name}</div>
            <div style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{habit.target} • {habit.category}</div>
          </div>
        </div>

        {/* Question */}
        <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>
          Bugun bajardingizmi?
        </div>

        {/* Yes / No */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Ha, bajardim', value: true, color: C.primary, bg: C.primaryLight, emoji: '✅' },
            { label: "Yo'q, bajarmadim", value: false, color: '#F87171', bg: '#FFE8E8', emoji: '❌' },
          ].map(opt => (
            <button key={String(opt.value)} onClick={() => setDone(opt.value)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 14, border: `2px solid ${done === opt.value ? opt.color : 'transparent'}`,
              background: done === opt.value ? `${opt.color}18` : '#F5F6FA',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 22 }}>{opt.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: done === opt.value ? opt.color : C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {done === true && (
          <>
            {/* Duration */}
            <div style={{ marginBottom: 16 }}>
              <InputField
                label="Qancha vaqt bajardingiz?"
                placeholder="Masalan: 30"
                type="number"
                value={duration}
                onChange={setDuration}
                icon={<Clock size={18} />}
              />
            </div>

            {/* Mood */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10 }}>Kayfiyat</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {MOODS.map(m => (
                  <button key={m.label} onClick={() => setMood(m.label)} style={{
                    flex: 1, padding: '10px 4px', borderRadius: 12, border: `2px solid ${mood === m.label ? m.color : 'transparent'}`,
                    background: mood === m.label ? `${m.color}15` : '#F5F6FA',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    transition: 'all 0.18s',
                  }}>
                    <span style={{ fontSize: 20 }}>{m.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: mood === m.label ? m.color : C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>
            Izoh qo'shish
          </div>
          <div style={{ position: 'relative', background: '#F6F7F9', borderRadius: 12 }}>
            <div style={{ position: 'absolute', left: 14, top: 14, color: C.grayMed, display: 'flex' }}>
              <FileText size={18} />
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Bugun qanday kechdi? (ixtiyoriy)"
              rows={3}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                padding: '14px 14px 14px 44px', fontSize: 14, color: C.charcoal, resize: 'none',
                borderRadius: 12, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.5,
              }} />
          </div>
        </div>

        {localError && (
          <div style={{
            fontSize: 12,
            color: C.redMed,
            background: C.redSoft,
            borderRadius: 12,
            padding: '10px 12px',
            marginBottom: 12,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {localError}
          </div>
        )}

        <PrimaryButton onClick={handleSave} fullWidth disabled={done === null || saving}>
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
