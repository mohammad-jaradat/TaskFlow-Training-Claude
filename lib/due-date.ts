export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    // Date-only strings parse as UTC midnight; format in UTC so the calendar
    // day doesn't shift backwards in timezones west of UTC.
    timeZone: 'UTC',
  });
}
