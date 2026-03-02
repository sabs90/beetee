export function calcMinutesBetween(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  let mins1 = h1 * 60 + m1;
  let mins2 = h2 * 60 + m2;
  // Handle crossing midnight
  if (mins2 < mins1) mins2 += 24 * 60;
  return mins2 - mins1;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}
