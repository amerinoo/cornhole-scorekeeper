export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function getFirestoreDate(value: unknown): Date | null {
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

  return candidate.toDate() as Date;
}

export function tryFormatFirestoreDate(value: unknown): string | null {
  const date = getFirestoreDate(value);
  return date ? formatDate(date) : null;
}

export function formatRelativeMinutes(value: unknown): string | null {
  const date = getFirestoreDate(value);

  if (!date) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'hace menos de 1 min';
  }

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}
