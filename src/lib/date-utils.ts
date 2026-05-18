// src/lib/date-utils.ts
import { logger } from '@/lib/logger';

/**
 * Zona horaria oficial para Colombia.
 */
export const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Retorna la fecha y hora actual ajustada a la zona horaria de Colombia
 * en formato Date (solo útil para manipulaciones locales si no importa la zona interna del objeto Date).
 */
export function getColombiaDate(): Date {
  // Cuando usamos toLocaleString con America/Bogota nos aseguramos de que los valores representen
  // el tiempo actual en Colombia. Lo parseamos de vuelta a un Date() temporal.
  const colDateStr = new Date().toLocaleString('en-US', { timeZone: COLOMBIA_TIMEZONE });
  return new Date(colDateStr);
}

/**
 * Retorna la fecha actual de Colombia en formato YYYY-MM-DD.
 * Ideal para búsquedas en la base de datos o almacenamiento en campos DATE de Postgres.
 */
export function getColombiaDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  // 'en-CA' formatter returns YYYY-MM-DD
  return formatter.format(new Date());
}

/**
 * Retorna la hora actual de Colombia en formato ISO sin sufijo de timezone.
 * 
 * CONVENCIÓN DE ZONA HORARIA DEL PROYECTO:
 * ─────────────────────────────────────────
 * Todas las columnas TIMESTAMPTZ en Supabase almacenan la hora local de Colombia
 * como si fuera UTC. Esto significa que si son las 8:00 PM en Colombia, se guarda
 * "20:00:00" (no "01:00:00" del día siguiente que sería el UTC real).
 * 
 * Esta convención funciona porque:
 * 1. getColombiaISOString() genera la hora Colombia SIN sufijo de timezone
 * 2. Postgres (en servidor UTC) interpreta valores sin offset como UTC → los guarda literalmente
 * 3. Las queries comparan con el mismo formato (hoyStr + 'T00:00:00')
 * 4. formatInColombiaTime() lee los valores numéricos directamente del string
 * 
 * ⚠️ NO usar funciones SQL como AT TIME ZONE sobre estos valores — el resultado sería incorrecto.
 * 
 * Ejemplo: Si son las 20:30 en Colombia → retorna "2024-05-08T20:30:00.000"
 */
export function getColombiaISOString(): string {
  const colDate = getColombiaDate();
  const year = colDate.getFullYear();
  const month = String(colDate.getMonth() + 1).padStart(2, '0');
  const day = String(colDate.getDate()).padStart(2, '0');
  const hours = String(colDate.getHours()).padStart(2, '0');
  const minutes = String(colDate.getMinutes()).padStart(2, '0');
  const seconds = String(colDate.getSeconds()).padStart(2, '0');
  
  // Sin sufijo de timezone — Postgres en UTC lo almacena tal cual como valor literal.
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`; 
}

/**
 * Formatea una fecha ISO en hora local de Colombia para mostrar en la interfaz.
 */
export function formatInColombiaTime(dateStr: string | null | undefined, pattern: 'date' | 'time' | 'full' | 'shortDate' = 'full'): string {
  if (!dateStr) return '';
  
  try {
    // La BD de Supabase puede devolver la fecha con la Z (e.g. "2024-05-08T17:30:00.000Z")
    // Como getColombiaISOString guarda la hora local literal con una Z, 
    // no podemos usar new Date() + Intl.DateTimeFormat porque el servidor/navegador
    // creerá que es UTC y le restará 5 horas al mostrarlo.
    
    // Solución: Parsear manualmente la cadena asumiendo que los números YA SON la hora local correcta.
    const cleanStr = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
    const [datePart, timePart] = cleanStr.split('T');
    
    if (!datePart) return dateStr;
    
    const [year, month, day] = datePart.split('-').map(Number);
    
    let hours = 0;
    let minutes = 0;
    
    if (timePart) {
      const timeClean = timePart.split('.')[0]; // remove milliseconds
      const timeParts = timeClean.split(':');
      hours = parseInt(timeParts[0] || '0', 10);
      minutes = parseInt(timeParts[1] || '0', 10);
    }
    
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    // Función helper para formato 12 horas
    const formatTime = (h: number, m: number) => {
      const ampm = h >= 12 ? 'p. m.' : 'a. m.';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    if (pattern === 'time') {
      return formatTime(hours, minutes);
    } 
    
    if (pattern === 'date') {
      return `${day} de ${meses[month - 1]} de ${year}`;
    }

    if (pattern === 'shortDate') {
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
    
    // full
    return `${day} de ${meses[month - 1]} de ${year}, ${formatTime(hours, minutes)}`;

  } catch (error) {
    logger.error('Error formatting date manually:', { error });
    return dateStr;
  }
}
