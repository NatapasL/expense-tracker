/**
 * Formats a number as currency with 2 decimal places and commas as thousand separators.
 * As per requirements, no currency symbol is included.
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

/**
 * Formats a date string or object to 'DD MMM YYYY, ddd' (e.g., '14 Mar 2026, Sun').
 */
export function formatDateLong(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		weekday: 'short'
	};

	// Format: "Sun, Mar 14, 2026" (default en-US)
	// We need "14 Mar 2026, Sun"
	
	const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(d);
	const day = parts.find(p => p.type === 'day')?.value;
	const month = parts.find(p => p.type === 'month')?.value;
	const year = parts.find(p => p.type === 'year')?.value;
	const weekday = parts.find(p => p.type === 'weekday')?.value;

	return `${day} ${month} ${year}, ${weekday}`;
}
