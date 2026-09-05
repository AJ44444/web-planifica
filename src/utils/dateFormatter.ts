export function formatGMT6Date(dateInput?: number | string | Date): string {
  if (!dateInput) return '';

  let date: Date;
  if (typeof dateInput === 'number') {
    date = dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return String(dateInput);

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
  if (!dateInput) return '';

  let date: Date;
  if (typeof dateInput === 'number') {
    date = dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
