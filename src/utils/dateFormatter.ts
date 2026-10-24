// ponytail: Cache Intl.DateTimeFormat instances once at module level to avoid expensive ICU instantiation per item
const gmt6DateFormat = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const gmt6TimeFormat = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function parseDate(dateInput?: string): { date: Date | null; raw: string } {
  if (!dateInput || typeof dateInput !== 'string') {
    return { date: null, raw: dateInput ? String(dateInput) : '' };
  }

  const trimmed = dateInput.trim();
  if (!trimmed) return { date: null, raw: '' };

  const normalized = (trimmed.includes(' ') && !trimmed.includes('T'))
    ? trimmed.replace(' ', 'T')
    : trimmed;

  const date = new Date(normalized);

  if (isNaN(date.getTime())) {
    return { date: null, raw: trimmed };
  }

  return { date, raw: '' };
}

export function formatGMT6Date(dateInput?: string): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;
  return gmt6DateFormat.format(date);
}

export function formatGMT6Time(dateInput?: string): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;
  return gmt6TimeFormat.format(date);
}
