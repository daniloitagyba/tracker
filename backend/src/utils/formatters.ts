export function parseTrackingDate(dateStr: string, timeStr: string = '00:00'): Date {
  const [day, month, year] = dateStr.split('/');
  const [hour, minute] = timeStr.split(':');
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour) || 0,
    parseInt(minute) || 0
  );
}
