# 🧪 Guía de Testing - Carnet Veterinario

**Versión:** 1.3.0  
**Última actualización:** 2026-04-12  
**Estado:** Actualizado con mejoras de diseño y seguridad

---

## 📋 Índice

1. [Preparación](#preparación)
2. [Autenticación](#1-autenticación)
3. [Mascotas (CRUD)](#2-mascotas-crud)
4. [Eventos Médicos (CRUD)](#3-eventos-médicos-crud)
5. [UI/UX y Diseño](#4-uiux-y-diseño)
6. [Seguridad](#5-seguridad)
7. [Testing con Datos Reales](#testing-con-datos-reales)

---

## Preparación

### ⚠️ IMPORTANTE: Rate Limiting en Testing

**Problema:** Supabase limita intentos de signup a **3-5 por hora por email**.

**Soluciones:**

```bash
# Opción 1: Truco de Gmail (RECOMENDADO)
test+1@gmail.com
test+2@gmail.com
test+3@gmail.com
# Todos llegan al mismo inbox

# Opción 2: Generador automático (ya implementado en dev)
# test@gmail.com → test+dev123456@gmail.com

# Opción 3: Esperar 1 hora
```

**Ver detalles completos en:** [../archive/RATE_LIMIT_FIX.md](../archive/RATE_LIMIT_FIX.md)

---

## 1. Autenticación

### TC-AUTH-001: Registro de Usuario (Diseño Nuevo)
- [ ] Ir a `/signup`
- [ ] **Verificar diseño moderno:**
  - ✅ Fondo con gradiente (azul → púrpura → rosa)
  - ✅ Ícono verde con símbolo de usuario + sombra
  - ✅ Título con gradiente: "Crear cuenta gratis"
  - ✅ Card blanco con bordes gruesos (border-2)
  - ✅ Labels con emojis: 📧 Email, 🔒 Contraseña, ✅ Confirmar
  - ✅ Hints debajo de inputs (texto gris pequeño)
- [ ] Ingresar email válido: `test+1@gmail.com`
- [ ] Ingresar contraseña: `123456`
- [ ] Confirmar contraseña: `123456`
- [ ] Click en "🚀 Crear cuenta gratis"
- **Resultado esperado:**
  - Spinner SVG animado mientras procesa
  - Redirige a `/dashboard` vacío
  - Header muestra email con punto verde pulsante

### TC-AUTH-002: Validación de Email (Con Diseño)
- [ ] Ir a `/signup`
- [ ] Ingresar email inválido: `invalido`
- [ ] Click en "Crear cuenta"
- **Resultado esperado:**
  - Error con gradiente rojo → rosa
  - Mensaje: "⚠️ Email inválido"
  - Animación fade-in
  - Borde grueso (border-2)

### TC-AUTH-003: Validación de Contraseña Corta
- [ ] Ir a `/signup`
- [ ] Ingresar contraseña: `123` (menos de 6)
- [ ] Click en "Crear cuenta"
- **Resultado esperado:**
  - Error: "⚠️ La contraseña debe tener al menos 6 caracteres"
  - Hint visible debajo del input: "Al menos 6 caracteres"

### TC-AUTH-004: Contraseñas No Coinciden
- [ ] Ir a `/signup`
- [ ] Password: `password123`
- [ ] Confirmar: `different`
- [ ] Click en "Crear cuenta"
- **Resultado esperado:** Error: "⚠️ Las contraseñas no coinciden"

### TC-AUTH-005: Login Exitoso (Diseño Nuevo)
- [ ] Ir a `/login`
- [ ] **Verificar diseño:**
  - Ícono azul → púrpura con candado
  - Título: "Bienvenido de vuelta"
  - Labels: 📧 Email, 🔒 Contraseña
- [ ] Email: `test+1@gmail.com`
- [ ] Password: `123456`
- [ ] Click "✨ Ingresar a mi cuenta"
- **Resultado esperado:**
  - Spinner animado
  - Redirige a `/dashboard`
  - Header sticky con logo con gradiente

### TC-AUTH-006: Login Fallido
- [ ] `/login`
- [ ] Email correcto, password incorrecto
- [ ] Click "Ingresar"
- **Resultado esperado:**
  - Error con gradiente
  - Rate limiter cuenta intento

### TC-AUTH-007: Logout
- [ ] Click botón "Salir" en header
- **Resultado esperado:**
  - Badge con email desaparece
  - Redirige a landing `/`

### TC-AUTH-008: Persistencia de Sesión
- [ ] Login exitoso
- [ ] F5 (refresh)
- **Resultado esperado:**
  - Sigue logueado
  - Dashboard carga correctamente

### TC-AUTH-009: Protección de Rutas
- [ ] Logout
- [ ] URL manual: `/dashboard`
- **Resultado esperado:** Redirect a `/login`

### 🆕 TC-AUTH-010: Rate Limiting
- [ ] Ir a `/signup`
- [ ] Intentar 4 registros en <1 minuto (emails diferentes)
- **Resultado esperado:**
  - Intento 4: "⏱️ Demasiados intentos. Espera X segundos"

### 🆕 TC-AUTH-011: Honeypot Anti-Bot
- [ ] DevTools (F12) → Elements
- [ ] Buscar `input[name="website"]`
- [ ] Verificar: `position: absolute; left: -9999px`
- [ ] Llenar manualmente y submit
- **Resultado esperado:**
  - Console: "🤖 Bot detected"
  - No crea usuario

---

## 2. Mascotas (CRUD)

### TC-PET-001: Crear Mascota Completa (Diseño Nuevo)
- [ ] Login → Dashboard
- [ ] Click "Nueva Mascota" (botón con gradiente)
- [ ] **Verificar página:**
  - Fondo con gradiente
  - Ícono azul → púrpura con símbolo +
  - Título: "Agregar Nueva Mascota"
  - Banner info: 💡 "Tip: Los campos marcados con * son obligatorios"
- [ ] **Llenar formulario con emojis:**
  - 🐾 Nombre: "Max"
  - 🏷️ Especie: Perro
  - 🐕 Raza: "Labrador"
  - 📅 Fecha: 2020-01-15
  - ⚖️ Peso: 25.5
  - 💬 Notas: "Alérgico a pollo"
- [ ] **Verificar hints:**
  - Debajo de Raza: "Opcional - Si conoces la raza específica"
  - Debajo de Fecha: "Calcularemos automáticamente la edad"
- [ ] Click "✨ Crear Mascota"
- **Resultado esperado:**
  - Spinner animado
  - Redirige a detalle de Max
  - Info completa con badges de colores

### TC-PET-002: Crear Mascota Mínima
- [ ] Dashboard → "+ Nueva Mascota"
- [ ] Nombre: "Luna"
- [ ] Especie: Gato
- [ ] Otros campos vacíos
- [ ] Click "Crear Mascota"
- **Resultado esperado:** Mascota creada sin errores

### TC-PET-003: Validación Nombre Requerido
- [ ] Nueva mascota
- [ ] Nombre vacío
- [ ] Submit
- **Resultado esperado:** Error: "⚠️ El nombre es obligatorio"

### TC-PET-004: Listar Mascotas (Dashboard Rediseñado)
- [ ] Crear 3 mascotas
- [ ] Ir a `/dashboard`
- [ ] **Verificar diseño:**
  - Fondo con gradiente
  - Título con gradiente: "Mis Mascotas"
  - Contador: "3 mascotas registradas"
  - Grid responsive (1/2/3 columnas)
- [ ] **Verificar cards:**
  - Avatar con gradiente (si no hay foto)
  - Badges de edad y peso con colores
  - Hover: scale transform
  - Sombras dinámicas
- **Resultado esperado:** 3 cards ordenadas por fecha DESC

### TC-PET-005: Ver Detalle (Página Rediseñada)
- [ ] Click en card de mascota
- [ ] **Verificar:**
  - Avatar grande (w-40 h-40) con ring de color
  - Título gigante (text-4xl)
  - Badges: Especie (azul), Raza (púrpura)
  - Emojis: 📅 Edad, ⚖️ Peso, 💬 Notas
  - Timeline en card blanco con bordes
  - Botones: Editar (secundario), Eliminar (rojo)
- **Resultado esperado:** Toda la info visible y bien formateada

### TC-PET-006: Cálculo de Edad
- [ ] Mascota con nacimiento hace 3 años
- [ ] Ver detalle
- **Resultado esperado:**
  - Badge: "3 años"
  - Emoji 📅 presente

### TC-PET-007: Editar Mascota (Diseño Nuevo)
- [ ] Detalle → Click "Editar"
- [ ] **Verificar página:**
  - Ícono ámbar → naranja
  - Título: "Editar información de {nombre}"
  - Form pre-llenado
  - Banner de tip visible
- [ ] Cambiar nombre a "Max Jr."
- [ ] Cambiar peso a 30
- [ ] Click "✨ Guardar Cambios"
- **Resultado esperado:**
  - Spinner animado
  - Redirige a detalle
  - Cambios aplicados

### TC-PET-008: Eliminar Mascota (Modal Mejorado)
- [ ] Detalle → Click "Eliminar"
- [ ] **Verificar modal:**
  - Overlay oscuro con blur
  - Card blanca centrada
  - Título: "Eliminar Mascota"
  - Mensaje claro con nombre en bold
  - Advertencia de eventos asociados
- [ ] Click "Cancelar"
- **Resultado esperado:**
  - Modal cierra
  - Mascota NO eliminada

### TC-PET-009: Eliminar Confirmado
- [ ] Detalle → "Eliminar" → "Eliminar"
- **Resultado esperado:**
  - Redirige a dashboard
  - Mascota no aparece

### TC-PET-010: Cascade Delete
- [ ] Mascota con 2 eventos
- [ ] Eliminar mascota
- [ ] Verificar en Supabase Table Editor
- **Resultado esperado:** Eventos también eliminados

---

## 3. Eventos Médicos (CRUD)

### TC-EVENT-001: Crear Vacuna (Diseño Nuevo)
- [ ] Detalle mascota → "+ Agregar Evento"
- [ ] **Verificar página:**
  - Ícono esmeralda → verde
  - Título: "Registrar Evento Médico"
  - Banner dinámico: "💉 Registrando: Vacuna"
- [ ] **Formulario con emojis:**
  - 📌 Tipo: 💉 Vacuna
  - ✏️ Título: "Antirrábica"
  - 📅 Fecha: 2026-01-15
  - 📝 Descripción: "Primera dosis"
  - ⏰ Próxima: 2027-01-15
  - 💬 Notas: "Sin reacciones"
- [ ] **Verificar hints:**
  - "¿Cuándo ocurrió o está programado?"
  - "Opcional - Para recordatorios futuros"
- [ ] Click "✨ Crear Evento"
- **Resultado esperado:**
  - Timeline muestra evento con:
    - Badge azul con gradiente: "💉 Vacuna"
    - Título en grande
    - Badge amarillo: "⏰ Próxima dosis: ..."

### TC-EVENT-002: Crear Visita Veterinaria
- [ ] Agregar evento tipo "🏥 Visita Veterinaria"
- [ ] Título: "Chequeo anual"
- [ ] Fecha: hoy
- [ ] Submit
- **Resultado esperado:**
  - Badge verde con gradiente
  - Orden correcto en timeline (DESC)

### TC-EVENT-003: Crear Medicina
- [ ] Tipo: "💊 Medicina"
- [ ] Título: "Antibiótico"
- [ ] Submit
- **Resultado esperado:** Badge naranja

### TC-EVENT-004: Validación Título
- [ ] Evento sin título
- [ ] Submit
- **Resultado esperado:** "⚠️ El título es obligatorio"

### TC-EVENT-005: Validación Fecha
- [ ] Evento sin fecha
- [ ] Submit
- **Resultado esperado:** "⚠️ La fecha es obligatoria"

### TC-EVENT-006: Timeline Ordenada
- [ ] Crear 3 eventos:
  - 2026-01-01
  - 2026-03-15
  - 2026-02-10
- [ ] Ver timeline
- **Resultado esperado:** Orden: 03-15, 02-10, 01-01

### TC-EVENT-007: Colores por Tipo
- [ ] Crear uno de cada tipo
- [ ] **Verificar colores:**
  - 💉 Vacuna: Azul con gradiente
  - 🏥 Visita: Verde esmeralda
  - 💊 Medicina: Naranja
  - 📋 Otro: Gris
- **Resultado esperado:** Cada uno con su gradiente único

### TC-EVENT-008: Editar Evento (Diseño Nuevo)
- [ ] Timeline → Click "Editar"
- [ ] **Verificar página:**
  - Ícono púrpura → rosa
  - Título: "Editar Evento Médico"
  - Form pre-llenado
  - Banner cambia según tipo
- [ ] Cambiar título
- [ ] Click "Guardar Cambios"
- **Resultado esperado:** Cambio aplicado en timeline

### TC-EVENT-009: Eliminar Evento (Modal)
- [ ] Timeline → "Eliminar"
- [ ] **Verificar modal:**
  - Título del evento visible
  - Fecha mostrada
  - Advertencia "no se puede deshacer"
- [ ] Click "Cancelar"
- **Resultado esperado:** Evento NO eliminado

### TC-EVENT-010: Eliminar Confirmado
- [ ] "Eliminar" → "Eliminar"
- **Resultado esperado:**
  - Página recarga
  - Evento desaparece

---

## 4. UI/UX y Diseño

### TC-UI-001: Landing Page Moderna
- [ ] Ir a `/`
- [ ] **Verificar elementos:**
  - Fondo con gradiente diagonal
  - Ícono pata con blur pulsante
  - Título con gradiente multicolor
  - 3 cards de features con hover effects
  - Íconos en gradientes diferentes
  - CTA final con fondo gradiente
  - Emojis: 🐾 🚀 🎉 🔒
- **Resultado esperado:** Diseño premium y moderno

### TC-UI-002: Header Sticky
- [ ] Login
- [ ] Scroll down en cualquier página
- **Resultado esperado:**
  - Header permanece arriba
  - Backdrop blur visible
  - Logo con gradiente
  - Badge con email y punto verde

### TC-UI-003: Responsive Mobile
- [ ] DevTools → iPhone (375px)
- [ ] Navegar toda la app
- [ ] **Verificar:**
  - Layout adaptado
  - Grid 1 columna
  - Botones touch-friendly (min 44px)
  - Sin scroll horizontal
- **Resultado esperado:** Todo funciona en móvil

### TC-UI-004: Empty State Dashboard
- [ ] Nueva cuenta sin mascotas
- [ ] Ver dashboard
- [ ] **Verificar:**
  - Ícono grande con gradiente
  - Título: "No tienes mascotas registradas"
  - Descripción clara
  - Botón: "✨ Agregar mi primera mascota"
- **Resultado esperado:** Diseño atractivo y claro

### TC-UI-005: Empty State Timeline
- [ ] Mascota sin eventos
- [ ] Ver detalle
- [ ] **Verificar:**
  - Ícono SVG documento
  - Mensaje: "No hay eventos registrados"
  - Sugerencia visible
- **Resultado esperado:** Estado vacío bien diseñado

### TC-UI-006: Loading States
- [ ] Login (observar spinner)
- [ ] Dashboard (carga mascotas)
- [ ] **Verificar:**
  - Doble spinner (circular)
  - Texto: "Cargando..."
  - Centrado y bien espaciado
- **Resultado esperado:** Feedback visual claro

### TC-UI-007: Animaciones
- [ ] Navegar entre páginas
- [ ] **Verificar:**
  - Fade-in en headers de formulario
  - Scale en hover de cards
  - Pulse en punto verde (online)
  - Slide-in en toasts (si hay)
  - Transform en flechas de volver
- **Resultado esperado:** Transiciones suaves

### TC-UI-008: Gradientes
- [ ] Verificar gradientes en:
  - Títulos de páginas
  - Botones primarios
  - Íconos de headers
  - Badges de eventos
  - Fondos de páginas
- **Resultado esperado:** Consistencia visual

### TC-UI-009: Emojis
- [ ] **Verificar emojis en:**
  - Labels de formularios
  - Badges de tipos de evento
  - Banners informativos
  - Botones de acción
  - Mensajes de error
- **Resultado esperado:** Mejora la legibilidad

### TC-UI-010: Breadcrumbs
- [ ] Dashboard → Mascota → Editar
- [ ] **Verificar:**
  - Flecha con hover effect
  - Texto claro: "Volver a {nombre}"
  - Color change en hover
  - Transform en flecha
- **Resultado esperado:** Navegación clara

---

## 5. Seguridad

### TC-SEC-001: Rate Limiting en Signup
- [ ] Ir a `/signup`
- [ ] Intentar 4 registros rápidos (30 segundos)
- [ ] En el 4to intento:
- **Resultado esperado:**
  - Error: "⏱️ Demasiados intentos. Espera X segundos"
  - Contador visible
  - Botón deshabilitado temporalmente

### TC-SEC-002: Rate Limiting en Login
- [ ] Ir a `/login`
- [ ] 6 intentos fallidos en 1 minuto
- [ ] En el 6to:
- **Resultado esperado:**
  - Bloqueado temporalmente
  - Mensaje claro de espera

### TC-SEC-003: Honeypot Detection
- [ ] DevTools → Console
- [ ] Signup form
- [ ] Llenar campo `website` manualmente:
  ```javascript
  document.querySelector('[name="website"]').value = 'spam'
  ```
- [ ] Submit
- **Resultado esperado:**
  - Console: "🤖 Bot detected - honeypot filled"
  - No crea usuario
  - Muestra error genérico (no revela detección)

### TC-SEC-004: Aislamiento por Usuario
- [ ] Crear cuenta A con mascota "Max"
- [ ] Logout
- [ ] Crear cuenta B con mascota "Luna"
- [ ] Dashboard de B
- **Resultado esperado:** Solo "Luna" visible (no "Max")

### TC-SEC-005: URL Directa Protegida
- [ ] Login con cuenta A
- [ ] Copiar ID de mascota de A (desde URL)
- [ ] Logout
- [ ] Login con cuenta B
- [ ] URL manual: `/dashboard/{id_mascota_A}`
- **Resultado esperado:**
  - No carga o error
  - RLS bloquea acceso

### TC-SEC-006: JWT Expiration
- [ ] Login
- [ ] Esperar 1 hora sin actividad
- [ ] Intentar navegar
- **Resultado esperado:**
  - Session expirada
  - Redirect a login

### TC-SEC-007: Password en DB
- [ ] Crear usuario
- [ ] Supabase → Table Editor → auth.users
- [ ] Ver campo `encrypted_password`
- **Resultado esperado:**
  - Hash (no texto plano)
  - Formato: `$2a$10$...`

---

## 6. Casos Edge

### TC-EDGE-001: Mascota sin foto
- [ ] Crear mascota sin foto
- [ ] Ver card y detalle
- **Resultado esperado:**
  - Avatar placeholder con gradiente azul → púrpura
  - Ícono pata blanco centrado

### TC-EDGE-002: Evento sin descripción
- [ ] Crear evento solo con título
- [ ] Ver timeline
- **Resultado esperado:** Muestra solo título (sin error)

### TC-EDGE-003: Muchas Mascotas
- [ ] Crear 10+ mascotas
- [ ] Dashboard
- **Resultado esperado:**
  - Grid responsive
  - Scroll suave
  - Sin lag

### TC-EDGE-004: Timeline Larga
- [ ] Crear 20+ eventos
- [ ] Scroll timeline
- **Resultado esperado:**
  - Renderiza bien
  - Sin lag
  - Orden correcto

### TC-EDGE-005: Caracteres Especiales
- [ ] Nombre: "Max & Luna's Friend"
- [ ] Notas: "Alérgico a: pollo, pescado, etc."
- [ ] Submit
- **Resultado esperado:**
  - Guarda correctamente
  - Muestra sin sanitizar incorrectamente

### TC-EDGE-006: Password Débil
- [ ] Signup con: `123456`
- **Resultado esperado:**
  - Acepta (solo valida longitud mín 6)
  - Hint sugiere password fuerte

### TC-EDGE-007: Email Temporal
- [ ] Signup con: `test@temp-mail.org`
- **Resultado esperado:**
  - Acepta (sin validación de dominio temporal aún)
  - Nota: Mejorar en fase 2

### TC-EDGE-008: Navegador sin JS
- [ ] Deshabilitar JS en browser
- [ ] Intentar usar app
- **Resultado esperado:**
  - Mensaje: App requiere JavaScript
  - O funcionalidad limitada

---

## Testing con Datos Reales

### Escenario: Dueño con 2 Mascotas

**Setup:**
```
Usuario: maria+test@gmail.com
Password: miperro123

Mascota 1: Max
- Especie: Perro
- Raza: Golden Retriever
- Edad: 5 años (nacimiento: 2021-01-10)
- Peso: 30 kg
- Notas: "Alérgico a pollo, toma glucosamina diaria"
- Eventos:
  ✓ Vacuna antirrábica (2025-01-10) → Próxima: 2026-01-10
  ✓ Consulta rutina (2026-03-15)
  ✓ Desparasitación (2026-04-01)

Mascota 2: Luna
- Especie: Gato
- Raza: Siamés
- Edad: 2 años (nacimiento: 2024-02-20)
- Peso: 4.5 kg
- Notas: "Esterilizada, indoor"
- Eventos:
  ✓ Vacuna triple felina (2026-02-20)
  ✓ Esterilización (2024-08-15)
```

**Objetivo:** Verificar flujo completo con datos realistas

**Tests:**
- [ ] Crear usuario María
- [ ] Agregar Max con todos los datos
- [ ] Agregar 3 eventos a Max
- [ ] Verificar timeline ordenada
- [ ] Verificar cálculo de edad (5 años)
- [ ] Agregar Luna
- [ ] Agregar 2 eventos a Luna
- [ ] Navegar entre ambas mascotas
- [ ] Editar peso de Max (30 → 31)
- [ ] Logout y login de nuevo
- [ ] Verificar persistencia de datos

---

## 📊 Matriz de Cobertura

| Área | Tests | Críticos | Opcionales |
|------|-------|----------|------------|
| **Autenticación** | 11 | 9 | 2 |
| **Mascotas CRUD** | 10 | 8 | 2 |
| **Eventos CRUD** | 10 | 8 | 2 |
| **UI/UX** | 10 | 5 | 5 |
| **Seguridad** | 7 | 7 | 0 |
| **Edge Cases** | 8 | 3 | 5 |
| **TOTAL** | **56** | **40** | **16** |

---

## ✅ Checklist Final Pre-Deploy

### Funcionalidad
- [ ] Todas las funcionalidades básicas funcionan
- [ ] CRUD completo de mascotas
- [ ] CRUD completo de eventos
- [ ] Timeline ordenada correctamente
- [ ] Autenticación completa

### UI/UX
- [ ] Diseño moderno implementado
- [ ] Gradientes en todos los elementos clave
- [ ] Emojis en formularios y labels
- [ ] Animaciones suaves
- [ ] Responsive en móvil (375px)
- [ ] Loading states presentes
- [ ] Empty states diseñados

### Seguridad
- [ ] Rate limiting activo
- [ ] Honeypot implementado
- [ ] RLS funcionando (usuarios aislados)
- [ ] Contraseñas hasheadas
- [ ] JWT expiration funcional
- [ ] Variables de entorno configuradas

### Técnico
- [ ] No hay errores en consola
- [ ] TypeScript compila sin errores
- [ ] Build exitoso (`npm run build`)
- [ ] Git configurado
- [ ] .env.local ignorado

### Documentación
- [ ] README actualizado
- [ ] TESTING_GUIDE actualizado
- [ ] RATE_LIMIT_FIX disponible
- [ ] SECURITY_IMPROVEMENTS documentado
- [ ] DESIGN_UPDATE completo

---

## 🐛 Reportar Bugs

Si encuentras errores, documenta:

1. **Pasos para reproducir:**
   ```
   1. Ir a /signup
   2. Llenar email: test@gmail.com
   3. Click en Crear cuenta
   ```

2. **Resultado esperado:**
   ```
   Debería crear cuenta y redirigir
   ```

3. **Resultado actual:**
   ```
   Muestra error: "email rate limit exceeded"
   ```

4. **Screenshot:** (si aplica)

5. **Console log:** (F12 → Console)
   ```
   Error: rate limit exceeded...
   ```

6. **Ambiente:**
   ```
   Browser: Chrome 120
   OS: Windows 11
   URL: http://localhost:3000/signup
   ```

---

**Fecha de última actualización:** 2026-04-12  
**Versión:** 1.3.0  
**Casos de prueba totales:** 56  
**Cobertura estimada:** ~95% del MVP
