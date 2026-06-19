import { useState } from 'react';
import { User } from 'lucide-react';
import { PrimaryButton, InputField, C } from './shared';

interface NameEntryProps {
  onSubmit: (input: { fullName: string }) => Promise<void>;
  switchLabel: string;
  onSwitch: () => void;
  loading?: boolean;
  error?: string;
  notice?: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
}

function NameEntryScreen({
  onSubmit,
  switchLabel,
  onSwitch,
  loading = false,
  error = '',
  notice = '',
  title,
  subtitle,
  buttonLabel,
}: NameEntryProps) {
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    setLocalError('');
    const fullName = name.trim();

    if (fullName.length < 2) {
      setLocalError('Ismingizni kiriting.');
      return;
    }

    await onSubmit({ fullName });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 'calc(176px + env(safe-area-inset-top, 0px))',
        background: `linear-gradient(160deg, #2D9162, ${C.primary})`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 24px 24px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -44, right: -36, width: 156, height: 156, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -28, left: 110, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 32, marginBottom: 8, color: '#fff', fontWeight: 700 }}>Salom</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {subtitle}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px calc(32px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{
          background: C.card,
          borderRadius: 20,
          padding: '24px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <InputField
            label="Ism"
            placeholder="Masalan: Samandar"
            value={name}
            onChange={setName}
            icon={<User size={18} />}
          />

          {(localError || error || notice) && (
            <div style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: localError || error ? C.redMed : C.primary,
              background: localError || error ? C.redSoft : C.primaryLight,
              borderRadius: 12,
              padding: '10px 12px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              {localError || error || notice}
            </div>
          )}

          <PrimaryButton onClick={handleSubmit} fullWidth disabled={loading || !name.trim()}>
            {loading ? 'Kirilmoqda...' : buttonLabel}
          </PrimaryButton>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onSwitch} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: C.primary,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {switchLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterScreen({
  onRegister, onLogin, loading = false, error = '', notice = '',
}: {
  onRegister: (input: { fullName: string }) => Promise<void>;
  onLogin: () => void;
  loading?: boolean;
  error?: string;
  notice?: string;
}) {
  return (
    <NameEntryScreen
      onSubmit={onRegister}
      onSwitch={onLogin}
      switchLabel="Oldin kirgan bo'lsangiz, shu yerdan davom eting"
      loading={loading}
      error={error}
      notice={notice}
      title="Odatlyga kirish"
      subtitle="Boshlash uchun faqat ismingizni kiriting"
      buttonLabel="Davom etish"
    />
  );
}

export function LoginScreen({
  onLogin, onRegister, loading = false, error = '', notice = '',
}: {
  onLogin: (input: { fullName: string }) => Promise<void>;
  onRegister: () => void;
  loading?: boolean;
  error?: string;
  notice?: string;
}) {
  return (
    <NameEntryScreen
      onSubmit={onLogin}
      onSwitch={onRegister}
      switchLabel="Boshqa ism bilan kirish"
      loading={loading}
      error={error}
      notice={notice}
      title="Xush kelibsiz"
      subtitle="Davom etish uchun ismingizni yozing"
      buttonLabel="Kirish"
    />
  );
}
