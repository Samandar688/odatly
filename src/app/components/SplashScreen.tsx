import { C } from './shared';

export function SplashScreen() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(160deg, #2D9162 0%, #3CB878 50%, #5CC896 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', bottom: 80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', top: 120, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28, background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontSize: 46 }}>🌱</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -0.5, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Odatly
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', marginTop: 6, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 400 }}>
            Har kuni yaxshiroq bo'ling
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div style={{ position: 'absolute', bottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className={`odatly-dot-${i}`} style={{
              width: 8, height: 8, borderRadius: 4, background: '#fff',
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Yuklanmoqda...</span>
      </div>

      <style>{`
        @keyframes odatlyDot { 0%,80%,100%{opacity:0.35;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }
        .odatly-dot-0 { animation: odatlyDot 1.2s 0s ease-in-out infinite; }
        .odatly-dot-1 { animation: odatlyDot 1.2s 0.2s ease-in-out infinite; }
        .odatly-dot-2 { animation: odatlyDot 1.2s 0.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
