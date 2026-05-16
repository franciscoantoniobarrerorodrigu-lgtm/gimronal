const COLOMBIA_TIMEZONE = 'America/Bogota';

const mockDBTime = "2024-05-08T17:30:00.000Z";
console.log("Mock DB Time (which was meant to be 17:30 Colombia time):", mockDBTime);

const date = new Date(mockDBTime);
console.log("Parsed Date toString:", date.toString());
console.log("Parsed Date toISOString:", date.toISOString());

const options = {
    timeZone: COLOMBIA_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
};
const formatted = new Intl.DateTimeFormat('es-CO', options).format(date);
console.log("Formatted for Colombia UI:", formatted);
