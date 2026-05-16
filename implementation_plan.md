# Análisis de Fallos en el Programa de Asistencia

He revisado en detalle toda la lógica del sistema de asistencia (ingresos manuales, ingresos por QR, cálculos de "En Sala", y manejo de fechas/zonas horarias). He encontrado varios problemas importantes que pueden estar causando comportamientos inesperados en la plataforma.

## Problemas Detectados

### 1. El Bug de la Zona Horaria (Horas Desfasadas 5 horas)
**El problema:** La función `getColombiaISOString()` genera la hora de Colombia pero le añade una `Z` al final (indicando UTC). Por ejemplo, si alguien entra a las **17:30 (5:30 PM) hora de Colombia**, se guarda como `2024-05-08T17:30:00.000Z`. 
Cuando la interfaz intenta mostrar esa fecha usando `formatInColombiaTime()`, JavaScript interpreta que son las 17:30 en Londres (UTC) y **le resta 5 horas** para adaptarlo a Colombia, mostrando **12:30 PM**.
Esto significa que **todos los registros de asistencia muestran una hora 5 horas menor a la real** en la pantalla.

### 2. Discrepancia entre Asistencia Manual y QR (Ingresos Múltiples)
**El problema:** 
- Si un staff usa el **Registro Manual** (`registrarAsistenciaCliente`), el sistema cuenta cuántas asistencias tiene el cliente hoy (`count > 0`). Si ya vino, **bloquea el acceso**, incluso si ya registró su salida.
- Sin embargo, si el cliente usa el **Código QR**, el sistema solo verifica si tiene un registro "abierto" (sin hora de salida). Si ya salió, le **permite volver a entrar**.
*Esta inconsistencia significa que el QR permite doble jornada (mañana y tarde), pero la recepción manual no.*

### 3. Falla en el cálculo de "En Sala" cruzando la medianoche
**El problema:** En la tabla de búsqueda manual (`buscarClientesAsistencia`), el sistema asume que alguien está "En Sala" solo si su entrada ocurrió **hoy**.
Si un gimnasio opera 24 horas (o hasta tarde) y un cliente entró a las 11:50 PM de ayer y no ha salido, el recepcionista no lo verá como "En Sala" hoy, y el sistema podría intentar crearle una entrada nueva en lugar de marcarle la salida.

## User Review Required

> [!CAUTION]
> **Decisión de Negocio Crítica:** ¿El gimnasio permite que un cliente entre múltiples veces el mismo día (por ejemplo, en la mañana y luego en la noche)?
> - Si **SÍ**: Debemos modificar el registro manual para que se comporte como el QR y permita entrar de nuevo si ya registraron salida.
> - Si **NO**: Debemos bloquear el QR para que no permita un segundo ingreso en el mismo día.

## Proposed Changes

### Archivos de Lógica Core (Fechas y Hora)

#### [MODIFY] `src/lib/date-utils.ts`
- **Cambio:** Ajustar cómo mostramos la hora. Dado que toda la base de datos ya está guardando las horas con el truco de la "Z" (almacenando la hora local explícita en UTC), si cambiamos la forma de guardar, se romperán los registros viejos y las consultas de fechas.
- **Solución Segura:** En `formatInColombiaTime()`, interceptaremos la fecha. En lugar de pedirle al navegador que la convierta, le quitaremos la `Z` y forzaremos a JavaScript a leerla como hora local exacta sin restar las 5 horas.

### Lógica de Asistencia y Base de Datos

#### [MODIFY] `src/lib/supabase/actions/asistencia.ts`
1. **Regla de Doble Ingreso:**
   - En `registrarAsistenciaCliente`, cambiaremos la validación. En lugar de rechazar si el cliente tiene registros hoy, rechazaremos **solo si tiene un registro abierto (En Sala)** o aplicaremos la regla de negocio que decidas (bloquear ingresos múltiples vs permitirlos).
2. **Corrección de "En Sala":**
   - En `buscarClientesAsistencia`, quitaremos el filtro de `gte('fecha_hora_entrada', hoyStr)` al buscar sesiones abiertas. Si no hay fecha de salida, está "En Sala", sin importar qué día entró.

### Panel del Socio (QR)

#### [MODIFY] `src/lib/supabase/actions/portal.ts`
- Si decides que solo haya un ingreso por día, agregaremos validación en `registrarAsistenciaQR` para evitar el reingreso.

## Verification Plan

1. Modificaremos un registro de asistencia o haremos un ingreso de prueba para asegurar que si entro a las 5:00 PM, la interfaz muestra exactamente "5:00 PM" y no "12:00 PM".
2. Haremos un ingreso, le daremos salida, e intentaremos ingresarlo de nuevo (tanto manual como por QR) para asegurar que el comportamiento de reingreso (doble jornada) sea el que esperas.
3. Simularemos un ingreso "ayer" sin salida, para validar que la recepción pueda registrar la salida correctamente hoy.
