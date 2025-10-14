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