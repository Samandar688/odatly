import { C } from './shared';

const tabs = [
  { id: 'home', label: 'Bugun', icon: HomeIcon },
  { id: 'habits', label: 'Odatlar', icon: ListIcon },
  { id: 'stats', label: 'Statistika', icon: ChartIcon },
  { id: 'calendar', label: 'Kalendar', icon: CalIcon },
  { id: 'profile', label: 'Profil', icon: UserIcon },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? C.primary : 'none'}
      stroke={active ? C.primary : C.grayMed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? C.primary : C.grayMed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1" fill={active ? C.primaryLight : 'none'} />
      <rect x="3" y="13" width="6" height="6" rx="1" fill={active ? C.primaryLight : 'none'} />
      <line x1="13" y1="8" x2="21" y2="8" />
      <line x1="13" y1="16" x2="21" y2="16" />
    </svg>
  );
}
function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? C.primary : C.grayMed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function CalIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? C.primary : C.grayMed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      {active && <circle cx="12" cy="16" r="1.5" fill={C.primary} stroke="none" />}
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? C.primary : C.grayMed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" fill={active ? C.primaryLight : 'none'} />
    </svg>
  );
}

export function BottomTabBar({
  activeTab, onTabChange,
}: {
  activeTab: string; onTabChange: (t: string) => void;
}) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
      background: '#fff', borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'flex-start', paddingTop: 8,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      zIndex: 40,
    }}>
      {tabs.map(t => {
        const active = activeTab === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          }}>
            <div style={{
              width: 40, height: 28, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? C.primaryLight : 'transparent', transition: 'background 0.2s',
            }}>
              <Icon active={active} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color: active ? C.primary : C.grayMed, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
