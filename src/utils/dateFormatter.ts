function parseDate(dateInput?: any): { date: Date | null; raw: string } {
  if (dateInput === undefined || dateInput === null || dateInput === '') {
    return { date: null, raw: '' };
  }

  let date: Date | null = null;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput);
  } else if (typeof dateInput === 'object') {
    const sec = dateInput.seconds ?? dateInput._seconds ?? dateInput.seconds_ ?? dateInput._seconds_;
    if (sec !== undefined && sec !== null) {
      const numSec = Number(sec);
      if (!isNaN(numSec)) {
        date = numSec < 1e11 ? new Date(numSec * 1000) : new Date(numSec);
      }
    }
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    const timestampMatch = trimmed.match(/Timestamp\s*\(\s*(\d+)/i);
    if (timestampMatch && timestampMatch[1]) {
      const sec = Number(timestampMatch[1]);
      if (!isNaN(sec)) {
        date = sec < 1e11 ? new Date(sec * 1000) : new Date(sec);
      }
    } else {
      const num = Number(trimmed);
      if (!isNaN(num) && trimmed !== '') {
        date = num < 1e11 ? new Date(num * 1000) : new Date(num);
      } else {
        date = new Date(trimmed);
      }
    }
  }

  if (!date || isNaN(date.getTime())) {
    return { date: null, raw: typeof dateInput === 'object' ? JSON.stringify(dateInput) : String(dateInput) };
  }

  return { date, raw: '' };
}

export function formatGMT6Date(dateInput?: any): string {
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

export function formatGMT6Time(dateInput?: any): string {
  const { date, raw } = parseDate(dateInput);
  if (!date) return raw;

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
