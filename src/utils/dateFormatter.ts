function parseDate(dateInput?: string): { date: Date | null; raw: string } {
  if (!dateInput || typeof dateInput !== 'string') {
    return { date: null, raw: dateInput ? String(dateInput) : '' };
  }

  const trimmed = dateInput.trim();
  if (!trimmed) return { date: null, raw: '' };

  let date: Date | null = null;

  const timestampMatch = trimmed.match(/Timestamp\s*\(\s*(\d+)/i);
  if (timestampMatch && timestampMatch[1]) {
    const sec = Number(timestampMatch[1]);
    if (!isNaN(sec)) {
      date = sec < 1e11 ? new Date(sec * 1000) : new Date(sec);
    }
  } else {
    const num = Number(trimmed);
    if (!isNaN(num)) {
      date = num < 1e11 ? new Date(num * 1000) : new Date(num);
    } else {
      date = new Date(trimmed);
    }
  }

  if (!date || isNaN(date.getTime())) {
    return { date: null, raw: trimmed };
  }

  return { date, raw: '' };
}

export function formatGMT6Date(dateInput?: string): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatGMT6Time(dateInput?: string): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
