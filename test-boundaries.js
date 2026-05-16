const COLOMBIA_TIMEZONE = 'America/Bogota';

// 1. Get current Colombia date (the wall-clock time)
const colDateStr = new Date().toLocaleString('en-US', { timeZone: COLOMBIA_TIMEZONE });
const colDate = new Date(colDateStr);

// 2. Boundaries for "Today" in Colombia time
// We create dates assuming local timezone of the machine is the same? NO.
// If the machine is UTC, new Date(2024, 4, 8) will be midnight UTC.
// We need to create a Date object that represents Midnight Colombia Time.

// A foolproof way to get UTC boundaries for Colombia's "Today":
// Colombia is UTC-5.
// Midnight Colombia (00:00:00) is 05:00:00 UTC.
// 23:59:59 Colombia is 04:59:59 UTC (next day).

console.log("Colombia Wall Clock Date:", colDate);

const year = colDate.getFullYear();
const month = colDate.getMonth();
const date = colDate.getDate();

// Date.UTC creates a timestamp for the exact UTC time.
// Since Colombia is UTC-5, midnight Colombia is year, month, date, 5 (hours UTC)
const startOfTodayUTC = new Date(Date.UTC(year, month, date, 5, 0, 0, 0));
const endOfTodayUTC = new Date(Date.UTC(year, month, date + 1, 4, 59, 59, 999));

console.log("Start of Today (UTC string for Supabase):", startOfTodayUTC.toISOString());
console.log("End of Today (UTC string for Supabase):", endOfTodayUTC.toISOString());

// If we do this, we can query Supabase correctly using true UTC.
