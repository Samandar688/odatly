import { useState } from 'react';
import { PrimaryButton, SecondaryButton, C } from './shared';

const slides = [
  {
    emoji: '🌱',
    title: 'Yangi odatlarni\nshakllantiring',
    desc: 'Kundalik yaxshi odatlarni bosqichma-bosqich rivojlantiring va hayotingizni yaxshilang.',
    bg: `linear-gradient(160deg, #E8F5EE 0%, #F0F9F4 100%)`,
    color: C.primary,
  },
  {
    emoji: '✅',
    title: 'Har kuni bajarilganini\nbelgilang',
    desc: 'Bir tugma bilan odatingizni bajarganingizni qayd eting va davomiyligini saqlang.',
    bg: `linear-gradient(160deg, #FFF0E6 0%, #FFF8F3 100%)`,
    color: C.orange,
  },
  {
    emoji: '📊',
    title: 'Rivojlanishingizni\nstatistikada kuzating',
    desc: "Haftalik va oylik statistika orqali o'sishingizni ko'ring, motivatsiyangizni oshiring.",
    bg: `linear-gradient(160deg, #EEF0FF 0%, #F5F6FF 100%)`,
    color: C.purple,
  },
];

export function OnboardingScreen({
  onStart, onLogin,
}: {
  onStart: () => void; onLogin: () => void;
}) {
  const [page, setPage] = useState(0);
  const slide = slides[page];

  return (
    <div style={{ position: 'absolute', inset: 0, background: slide.bg, transition: 'background 0.5s', display: 'flex', flexDirection: 'column' }}>
      {/* Skip button */}
      {page < 2 && (
        <div style={{ position: 'absolute', top: 'calc(16px + env(safe-area-inset-top, 0px))', right: 20 }}>
          <button onClick={() => setPage(2)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>O'tkazib yuborish</button>
        </div>
      )}

      {/* Illustration area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'calc(44px + env(safe-area-inset-top, 0px)) 32px 0',
      }}>
        {/* Big icon card */}
        <div style={{
          width: 180, height: 180, borderRadius: 50, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 20px 60px ${slide.color}25, 0 4px 20px rgba(0,0,0,0.08)`,
          fontSize: 80, marginBottom: 40,
          transition: 'all 0.4s',
        }}>
          {slide.emoji}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 26, fontWeight: 800, color: C.charcoal, lineHeight: 1.25,
            marginBottom: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
            whiteSpace: 'pre-line',
          }}>
            {slide.title}
          </div>
          <div style={{ fontSize: 15, color: C.grayMed, lineHeight: 1.6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {slide.desc}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ padding: '24px 28px calc(40px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setPage(i)} style={{
              width: i === page ? 24 : 8, height: 8, borderRadius: 4,
              background: i === page ? slide.color : '#D5D8E0',
              transition: 'all 0.3s', cursor: 'pointer',
            }} />
          ))}
        </div>

        {page < 2 ? (
          <button onClick={() => setPage(p => p + 1)} style={{
            background: slide.color, color: '#fff', border: 'none', borderRadius: 14,
            height: 52, width: '100%', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            boxShadow: `0 4px 16px ${slide.color}44`, fontFamily: 'Plus Jakarta Sans, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Keyingisi →
          </button>
        ) : (
          <>
            <PrimaryButton onClick={onStart} fullWidth>Boshlash</PrimaryButton>
            <SecondaryButton onClick={onLogin} fullWidth>Kirish</SecondaryButton>
          </>
        )}
      </div>
    </div>
  );
}
