export const C = {
  bg: '#EEF4F0',
  bgSoft: '#F8FBF8',
  card: '#FFFFFF',
  primary: '#3CB878',
  primaryDark: '#2D9162',
  primaryLight: '#E8F5EE',
  orange: '#FF8B36',
  orangeLight: '#FFF0E6',
  teal: '#00A6B4',
  tealLight: '#E5F8FA',
  purple: '#6C63FF',
  purpleLight: '#EFEEFF',
  red: '#F87171',
  redLight: '#FFE8E8',
  ink: '#1C2035',
  muted: '#7B8088',
  faint: '#B8BBC4',
  border: 'rgba(28,32,53,0.08)',
};

export const PROFILE_KEY = 'odatly.native.profile.v1';
export const DATA_PREFIX = 'odatly.native.data.v1';
export const DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const;
export const TABS = ['today', 'habits', 'calendar', 'stats', 'profile'] as const;
export const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
export const CATEGORIES = ["Sog'liq", 'Sport', "O'qish", 'Ish', 'Boshqa'];
export const TARGET_PRESETS = ['10 daqiqa', '30 daqiqa', '1 marta', '2 litr'];
export const HABIT_COLORS = [C.primary, C.orange, C.teal, C.purple, C.red];
export const MOODS = ['Yaxshi', 'Normal', 'Qiyin'];
export const MOTIVATION_SLIDES = [
  {
    tag: '1% qoida',
    title: "Kichik o'sish katta natija beradi",
    text: "Har kuni 1% yaxshilansangiz, yil oxirida natija taxminan 37 baravar kuchayadi.",
  },
  {
    tag: 'Bugungi fokus',
    title: 'Mukammallik emas, davomiylik',
    text: 'Bugun bitta odatni bajarsangiz ham tizim ishlayapti degani. Muhimi zanjir uzilmasin.',
  },
  {
    tag: 'Ritm',
    title: 'Odat qaror emas, muhit',
    text: "Eslatma, aniq vaqt va kichik maqsad odatni yengil qiladi. Bugungi rejangizni sodda tuting.",
  },
  {
    tag: 'Progress',
    title: "Ko'rinadigan natija kechroq keladi",
    text: "Har kuni kichik belgi qo'yish miyaga g'alabani eslatadi. Progressni ko'rish davom etishga yordam beradi.",
  },
];
