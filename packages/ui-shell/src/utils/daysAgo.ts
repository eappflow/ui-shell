/** Calendar days, in local time, from `iso` back from `now`: 0 today, 1 yesterday... */
export function daysAgo(iso: string, now = new Date()): number {
  const midnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  // Rounded, as a day with a DST change is 23 or 25 hours long
  return Math.round((midnight(now) - midnight(new Date(iso))) / 86_400_000);
}
