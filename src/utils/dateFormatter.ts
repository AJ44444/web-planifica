function parseDate(dateInput?: number | string | Date): { date: Date | null; raw: string } {
  if (!dateInput) return { date: null, raw: '' };
  const date = typeof dateInput === 'number'
    ? (dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput))
    : new Date(dateInput);
  return isNaN(date.getTime()) ? { date: null, raw: String(dateInput) } : { date, raw: '' };
}

export function formatGMT6Date(dateInput?: number | string | Date): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatGMT6Time(dateInput?: number | string | Date): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
