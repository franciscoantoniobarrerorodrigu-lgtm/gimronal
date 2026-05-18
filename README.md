# 🏋️ GIMRONAL (GymControl)

GIMRONAL es una suite de administración inteligente y portal de socios premium diseñada para gimnasios modernos. Ofrece control de membresías, asistencia con códigos QR en tiempo real, tableros interactivos para administradores, facturación, control de caja y portal exclusivo para socios.

---

## 🚀 Enlaces de Producción

* 🌐 **Sitio Web de Producción**: [https://gymcontrol-peach.vercel.app](https://gymcontrol-peach.vercel.app)
* ⚙️ **Panel de Vercel**: [https://vercel.com](https://vercel.com)

---

## ⚡ Despliegue Automático (CI/CD)

El proyecto está enlazado directamente con **Vercel**. Cualquier cambio que subas a tu repositorio de GitHub se compilará y desplegará en vivo de forma 100% automática.

### Flujo de Trabajo para Publicar Cambios:
1. **Prepara tus cambios locales**:
   ```bash
   git add .
   ```
2. **Crea una confirmación con un mensaje descriptivo**:
   ```bash
   git commit -m "feat: descripción de tu cambio"
   ```
3. **Sube los cambios a GitHub** (esto activa el despliegue automático en la nube):
   ```bash
   git push origin main
   ```

---

## 🛠️ Tecnologías Utilizadas

* **Frontend**: Next.js (App Router, React 19, TypeScript)
* **Estilos**: Tailwind CSS, Framer Motion (para micro-animaciones premium)
* **Base de Datos**: Supabase (Postgres, Realtime)
* **Comunicaciones**: Integración oficial con WhatsApp y Resend Email
* **Componentes**: Radix UI, Lucide Icons, Shadcn/ui

---

## 📁 Estructura del Proyecto

* `src/app/` — Rutas y vistas de la aplicación (Mora, Caja, Clases, Clientes, Asistencia, etc.)
* `src/components/` — Componentes reutilizables, modales y layouts de administración.
* `src/lib/` — Utilidades del sistema, integraciones y consultas a Supabase.
* `vercel.json` — Configuración del build y Cron Jobs de Vercel (cierre automático de asistencia).

---

## 🔧 Configuración Local

### 1. Clonar el repositorio:
```bash
git clone https://github.com/franciscoantoniobarrerorodrigu-lgtm/gimronal.git
cd gimronal
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Crear archivo `.env.local` con las credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=tu_resend_key
ADMIN_EMAIL=tu_email
```

### 4. Correr servidor de desarrollo:
```bash
npm run dev
```

---

## 🛡️ Características Destacadas Implementadas

* **Doble Entrada Inteligente (Re-Entry)**: Permite que los socios entren múltiples veces al gimnasio el mismo día si ya han cerrado sesión, ideal para dobles turnos de entrenamiento.
* **Cruce de Medianoche**: Soporte completo para sesiones nocturnas prolongadas y cálculos de aforo precisos que se actualizan de forma transparente.
* **Cierre Automático**: Función programada (cron) integrada en Vercel para cerrar de forma segura cualquier asistencia activa pendiente al finalizar la jornada.
* **Portal de Socios**: Consulta rápida de membresías vigentes, clases y horarios estructurados de entrenadores.
