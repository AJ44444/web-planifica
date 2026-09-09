function parseDate(dateInput?: number | string | Date): { date: Date | null; raw: string } {
  if (dateInput === undefined || dateInput === null || dateInput === '') {
    return { date: null, raw: '' };
  }

  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== '') {
      date = num < 1e11 ? new Date(num * 1000) : new Date(num);
    } else {
      date = new Date(trimmed);
    }
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return { date: null, raw: String(dateInput) };
  }

  return { date, raw: '' };
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
