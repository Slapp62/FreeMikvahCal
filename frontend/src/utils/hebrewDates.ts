import { HDate } from '@hebcal/core';

/**
 * Converts a JavaScript Date to a Hebrew date string
 * @param date - The Gregorian date to convert
 * @param format - Optional format: 'full' (default), 'short', or 'numeric'
 * @returns Hebrew date string (e.g., "15 Shevat 5785", "15 Shevat", or "15")
 */
export function getHebrewDateString(date: Date, format: 'full' | 'short' | 'numeric' = 'short'): string {
  const hDate = new HDate(date);

  if (format === 'numeric') {
    return hDate.getDate().toString();
  }

  const day = hDate.getDate();
  const monthName = hDate.getMonthName();

  if (format === 'short') {
    return `${day} ${monthName}`;
  }

  // format === 'full'
  const year = hDate.getFullYear();
  return `${day} ${monthName} ${year}`;
}

/**
 * Gets the Hebrew month name for a given Gregorian date
 * @param date - The Gregorian date
 * @returns Hebrew month name (e.g., "Shevat")
 */
export function getHebrewMonthName(date: Date): string {
  const hDate = new HDate(date);
  return hDate.getMonthName();
}

/**
 * Gets the Hebrew day of month for a given Gregorian date
 * @param date - The Gregorian date
 * @returns Hebrew day of month (1-30)
 */
export function getHebrewDay(date: Date): number {
  const hDate = new HDate(date);
  return hDate.getDate();
}

/**
 * Gets the Hebrew year for a given Gregorian date
 * @param date - The Gregorian date
 * @returns Hebrew year (e.g., 5785)
 */
export function getHebrewYear(date: Date): number {
  const hDate = new HDate(date);
  return hDate.getFullYear();
}

/**
 * Checks if a given date is a Hebrew month start (Rosh Chodesh)
 * @param date - The Gregorian date to check
 * @returns True if it's Rosh Chodesh
 */
export function isRoshChodesh(date: Date): boolean {
  const hDate = new HDate(date);
  return hDate.getDate() === 1;
}

/**
 * Gets the Hebrew month range for a given Gregorian month
 * @param date - Any date within the Gregorian month
 * @returns Hebrew month range string (e.g., "Tevet-Shvat") and year
 */
export function getHebrewMonthRange(date: Date): { months: string; year: number } {
  // Get the first and last day of the Gregorian month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstHDate = new HDate(firstDay);
  const lastHDate = new HDate(lastDay);

  const firstMonth = firstHDate.getMonthName();
  const lastMonth = lastHDate.getMonthName();
  const hebrewYear = lastHDate.getFullYear(); // Use the year from the end of the month

  if (firstMonth === lastMonth) {
    return { months: firstMonth, year: hebrewYear };
  }

  return { months: `${firstMonth}-${lastMonth}`, year: hebrewYear };
}
