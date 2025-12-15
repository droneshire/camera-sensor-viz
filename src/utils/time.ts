const HOURS = 60*60*1000;

export const DEFAULT_ALERT_START: Date = new Date(Date.UTC(2023, 1, 1, 8, 30, 0));
export const DEFAULT_ALERT_END: Date = new Date(Date.UTC(2023, 1, 1, 16, 30, 0));
export const DEFAULT_ALERT_START_MINUTES: number =
  getMinutesFromMidnight(DEFAULT_ALERT_START);
export const DEFAULT_ALERT_END_MINUTES: number =
  getMinutesFromMidnight(DEFAULT_ALERT_END);

export function addHour(hours: number) {
  return HOURS * hours;
}

export function getFixedTimeFromMinutes(fixedDate: Date, minutes: number): Date {
  const new_date: Date = new Date(Math.floor(fixedDate.getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000));
  new_date.setFullYear(fixedDate.getFullYear());
  new_date.setMonth(fixedDate.getMonth());
  new_date.setDate(fixedDate.getDate());
  // convert minutes to hours and minutes
  const hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  new_date.setHours(hours, minutes, 0, 0);
  return new_date;
}

export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getNumbersThatAreFullyDivisible(num: number): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < num; i++) {
    if (num % i === 0) {
      numbers.push(i);
    }
  }
  return numbers;
}
