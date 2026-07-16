export const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function sumByMonth(records, dateGetter, valueGetter, year = new Date().getFullYear()) {
  const sums = Array(12).fill(0);
  for (const record of records) {
    const date = dateGetter(record);
    if (date.getFullYear() !== year) continue;
    sums[date.getMonth()] += valueGetter(record);
  }
  return sums;
}

export function isSameMonth(date, reference = new Date()) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function isSameDay(date, reference = new Date()) {
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}
