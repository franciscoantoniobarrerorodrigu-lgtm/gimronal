const COLOMBIA_TIMEZONE = 'America/Bogota';

function getColombiaDate() {
  const colDateStr = new Date().toLocaleString('en-US', { timeZone: COLOMBIA_TIMEZONE });
  console.log("colDateStr:", colDateStr);
  return new Date(colDateStr);
}

function getColombiaISOString() {
  const colDate = getColombiaDate();
  console.log("colDate internal:", colDate.toISOString());
  const year = colDate.getFullYear();
  const month = String(colDate.getMonth() + 1).padStart(2, '0');
  const day = String(colDate.getDate()).padStart(2, '0');
  const hours = String(colDate.getHours()).padStart(2, '0');
  const minutes = String(colDate.getMinutes()).padStart(2, '0');
  const seconds = String(colDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`; 
}

console.log("RESULT:", getColombiaISOString());
