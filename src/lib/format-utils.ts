/**
 * Utility functions for formatting values in the GymControl application.
 */

/**
 * Formats a number as Colombian Pesos (COP).
 * @param value The numeric value to format.
 * @returns A string formatted as currency (e.g., "$ 50.000").
 */
export const formatCOP = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return '$0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0';
  
  // Formateamos y normalizamos removiendo cualquier espacio para consistencia visual
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
  
  // Normalizar: "$ 50.000" → "$50.000", "\u00a050.000" → "$50.000"
  return formatted.replace(/\$\s*/g, '$').replace(/COP\s*/g, '$');
};

/**
 * Formats a date string or object into a human-readable format.
 * @param date The date to format.
 * @returns A formatted date string.
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculates age from a birth date string.
 * @param birthDate Birth date string (YYYY-MM-DD).
 * @returns Age as a number.
 */
export const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
