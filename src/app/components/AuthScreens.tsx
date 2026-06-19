import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { StatusBar, PrimaryButton, InputField, C } from './shared';

// ─── Register ──────────────────────────────────────────────────────────────────

export function RegisterScreen({
  onRegister, onLogin, loading = false, error = '', notice = '',
}: {
  onRegister: (input: { fullName: string; email: string; password: string }) => Promise<void>;
  onLogin: () => void;
  loading?: boolean;
  error?: string;
  notice?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    if (!name.trim()) {
      setLocalError('Ism kiriting.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email kiriting.');
      return;
    }
    if (pass.length < 6) {
      setLocalError('Parol kamida 6 ta belgi bo‘lishi kerak.');
      return;
    }
    if (pass !== pass2) {
      setLocalError('Parollar mos emas.');
      return;
    }

    await onRegister({ fullName: name.trim(), email: email.trim(), password: pass });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Header gradient */}
      <div style={{
        height: 160, background: `linear-gradient(160deg, #2D9162, ${C.primary})`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 24px 24px', flexShrink: 0,
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Ro'yxatdan o'tish
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Odatly bilan sog'lom hayot boshlang
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ background: C.card, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField label="Ism" placeholder="Ismingizni kiriting" value={name} onChange={setName}
            icon={<User size={18} />} />
          <InputField label="Email" placeholder="email@misol.com" type="email" value={email} onChange={setEmail}
            icon={<Mail size={18} />} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Parol</label>
            <div style={{ position: 'relative', background: '#F6F7F9', borderRadius: 12, border: '1.5px solid transparent', transition: 'border-color 0.2s' }}
              onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = C.primary; }}
              onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.grayMed, display: 'flex' }}><Lock size={18} /></div>
              <input type={showPass ? 'text' : 'password'} placeholder="Kamida 6 ta belgi" value={pass}
                onChange={e => setPass(e.target.value)}
                style={{ width: '100%', height: 52, background: 'transparent', border: 'none', outline: 'none', padding: '0 44px', fontSize: 15, color: C.charcoal, borderRadius: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
              <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.grayMed, display: 'flex' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <InputField label="Parolni takrorlash" placeholder="Parolni qayta kiriting" type="password" value={pass2} onChange={setPass2}
            icon={<Lock size={18} />} />

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

          <div style={{ marginTop: 4 }}>
            <PrimaryButton onClick={handleRegister} fullWidth disabled={loading}>
              {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
            </PrimaryButton>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 14, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Allaqachon akkauntingiz bormi?{' '}
          </span>
          <button onClick={onLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Kirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────────────

export function LoginScreen({
  onLogin, onRegister, loading = false, error = '', notice = '',
}: {
  onLogin: (input: { email: string; password: string }) => Promise<void>;
  onRegister: () => void;
  loading?: boolean;
  error?: string;
  notice?: string;
}) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    if (!email.trim()) {
      setLocalError('Email kiriting.');
      return;
    }
    if (!pass) {
      setLocalError('Parol kiriting.');
      return;
    }

    await onLogin({ email: email.trim(), password: pass });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      <div style={{
        height: 180, background: `linear-gradient(160deg, #2D9162, ${C.primary})`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 24px 24px', flexShrink: 0,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 120, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Xush kelibsiz!</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Akkauntingizga kiring</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ background: C.card, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField label="Email" placeholder="email@misol.com" type="email" value={email} onChange={setEmail}
            icon={<Mail size={18} />} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Parol</label>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Parolni unutdingizmi?
              </button>
            </div>
            <div style={{ position: 'relative', background: '#F6F7F9', borderRadius: 12, border: '1.5px solid transparent', transition: 'border-color 0.2s' }}
              onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = C.primary; }}
              onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.grayMed, display: 'flex' }}><Lock size={18} /></div>
              <input type={showPass ? 'text' : 'password'} placeholder="Parolingiz" value={pass}
                onChange={e => setPass(e.target.value)}
                style={{ width: '100%', height: 52, background: 'transparent', border: 'none', outline: 'none', padding: '0 44px', fontSize: 15, color: C.charcoal, borderRadius: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
              <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.grayMed, display: 'flex' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

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

          <div style={{ marginTop: 4 }}>
            <PrimaryButton onClick={handleLogin} fullWidth disabled={loading}>
              {loading ? 'Yuklanmoqda...' : 'Kirish'}
            </PrimaryButton>
          </div>

          {/* Social divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>yoki</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Google sign-in */}
          <button style={{
            height: 52, borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 600, color: C.charcoal,
          }}>
            <span style={{ fontSize: 20 }}>🔍</span>
            Google bilan kirish
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 14, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Akkauntingiz yo'qmi?{' '}</span>
          <button onClick={onRegister} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.primary, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Ro'yxatdan o'tish
          </button>
        </div>
      </div>
    </div>
  );
}
