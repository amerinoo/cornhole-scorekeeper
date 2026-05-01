export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function tryFormatFirestoreDate(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (!('toDate' in value)) {
    return null;
  }

  const candidate = value as { toDate?: unknown };

  if (typeof candidate.toDate !== 'function') {
    return null;
  }

  return formatDate(candidate.toDate() as Date);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}
