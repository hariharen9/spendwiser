// Centralized timezone management
export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: '+05:30' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', offset: '+10:00' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: '+04:00' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)', offset: '+08:00' },
];

export class TimezoneManager {
  private static userTimezone: string = 'Asia/Kolkata'; // Default to IST

  static setUserTimezone(timezone: string) {
    this.userTimezone = timezone;
  }

  static getUserTimezone(): string {
    return this.userTimezone;
  }

  // Get current date in user's timezone
  static now(): Date {
    return new Date();
  }

  // Get today's date at 00:00:00 in user's timezone
  static today(): Date {
    const now = new Date();
    // Get the date in user's timezone
    const userDateString = now.toLocaleDateString('en-CA', { timeZone: this.userTimezone }); // YYYY-MM-DD format
    const [year, month, day] = userDateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Format date for display in user's timezone
  static formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      timeZone: this.userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    });
  }

  // Format datetime for display in user's timezone
  static formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      timeZone: this.userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  }

  // Convert date to YYYY-MM-DD format in user's timezone
  static toDateString(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Use toLocaleDateString with 'en-CA' locale to get YYYY-MM-DD format directly
    return dateObj.toLocaleDateString('en-CA', { timeZone: this.userTimezone });
  }

  // Parse date string in user's timezone
  static parseDate(dateString: string): Date {
    // Assume dateString is in YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Get date for input fields (YYYY-MM-DD format)
  static getInputDate(date?: Date): string {
    const dateObj = date || this.today();
    return this.toDateString(dateObj);
  }

  // Add days to a date in user's timezone
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Add months to a date in user's timezone
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // Add years to a date in user's timezone
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  // Check if two dates are the same day in user's timezone
  static isSameDay(date1: Date | string, date2: Date | string): boolean {
    return this.toDateString(date1) === this.toDateString(date2);
  }

  /**
   * BACKWARD COMPATIBLE: Normalize any date format to YYYY-MM-DD string.
   * Handles:
   * - Full ISO timestamps: "2026-01-30T18:30:00.000Z" -> "2026-01-30"
   * - Date-only strings: "2026-01-30" -> "2026-01-30"
   * - Date objects
   *
   * For legacy ISO timestamps, we extract just the date portion WITHOUT
   * timezone conversion to preserve what the user originally intended.
   * For new dates, we respect the user's timezone.
   */
  static normalizeDate(date: Date | string): string {
    if (typeof date === 'string') {
      // Check if it's already a YYYY-MM-DD format (10 chars, no 'T')
      if (date.length === 10 && !date.includes('T')) {
        return date;
      }
      // It's a full ISO timestamp - extract the date part as-is
      // This preserves legacy data without shifting dates
      if (date.includes('T')) {
        // For legacy ISO strings, convert to user's timezone to get the correct local date
        const dateObj = new Date(date);
        return this.toDateString(dateObj);
      }
      // Fallback: try to parse and convert
      return this.toDateString(new Date(date));
    }
    // It's a Date object
    return this.toDateString(date);
  }

  /**
   * Compare two dates for filtering purposes.
   * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   * Works with any date format (backward compatible).
   */
  static compareDates(date1: Date | string, date2: Date | string): number {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * Check if a date falls within a range (inclusive).
   * All dates are normalized before comparison.
   */
  static isDateInRange(date: Date | string, startDate?: string | null, endDate?: string | null): boolean {
    const normalizedDate = this.normalizeDate(date);
    if (startDate && normalizedDate < startDate) return false;
    if (endDate && normalizedDate > endDate) return false;
    return true;
  }

  /**
   * Format date for display in a user-friendly format.
   * Uses the user's configured timezone.
   */
  static formatDisplayDate(date: Date | string, style: 'short' | 'medium' | 'long' = 'medium'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.userTimezone
    };

    switch (style) {
      case 'short':
        options.month = 'short';
        options.day = 'numeric';
        break;
      case 'medium':
        options.month = 'short';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
      case 'long':
        options.weekday = 'long';
        options.month = 'long';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
    }

    return dateObj.toLocaleDateString('en-US', options);
  }

  /**
   * Format date for CSV export (DD/MM/YYYY format).
   * Normalizes the date first to handle legacy formats.
   */
  static formatForExport(date: Date | string): string {
    const normalized = this.normalizeDate(date);
    const [year, month, day] = normalized.split('-');
    return `${day}/${month}/${year}`;
  }

  // Get next occurrence date for recurring transactions
  static getNextOccurrence(lastDate: Date | string, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date {
    const date = typeof lastDate === 'string' ? this.parseDate(lastDate) : new Date(lastDate);
    
    switch (frequency) {
      case 'daily':
        return this.addDays(date, 1);
      case 'weekly':
        return this.addDays(date, 7);
      case 'monthly':
        return this.addMonths(date, 1);
      case 'yearly':
        return this.addYears(date, 1);
      default:
        return date;
    }
  }
}