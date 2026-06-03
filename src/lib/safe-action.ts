import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  handleServerError(e: unknown) {
    // Manejo global de errores inesperados
    if (e instanceof Error) {
      return e.message;
    }
    return "Ocurrió un error inesperado en el servidor";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  // Aquí podemos agregar middleware futuro para requerir sesión
  return next();
});
