export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function getStatusBadgeColor(status: string | null | undefined): string {
  switch (status) {
    case 'contacted':
      return 'badge-success';
    case 'qualified':
      return 'badge-info';
    case 'in_progress':
      return 'badge-warning';
    case 'closed':
      return 'badge-success';
    case 'rejected':
      return 'badge-danger';
    default:
      return 'badge-gray';
  }
}

export function truncate(value: string | null | undefined, maxLength: number): string {
  if (!value) return '—';
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

export function formatPhoneNumber(value: string | null | undefined): string {
  return value || '—';
}

export function getDomain(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}
