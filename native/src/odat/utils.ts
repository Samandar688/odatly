export function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return clamp(Math.round((value / total) * 100));
}

export function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} so'm`;
}

export function formatKcal(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} kcal`;
}

export function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} daqiqa`;
  if (minutes === 0) return `${hours} soat`;
  return `${hours} soat ${minutes} daq`;
}

export function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
