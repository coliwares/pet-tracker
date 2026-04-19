# 🔧 Solución: Email Rate Limit Exceeded

## ❌ Error Actual

```
email rate limit exceeded
```

Este error aparece cuando excedes los límites de Supabase Auth durante desarrollo/testing.

---

## ⚡ Soluciones Rápidas

### **1. Esperar 1 hora** ⏰
```
El límite se resetea automáticamente
Tiempo: ~60 minutos
```

### **2. Usar email diferente** 📧
```javascript
// En lugar de:
test@gmail.com

// Usa:
test2@gmail.com
test3@gmail.com
miusuario+1@gmail.com  // Gmail ignora el +numero
miusuario+2@gmail.com
```

**Truco de Gmail:**
```
Todos estos van al mismo inbox:
- tumail@gmail.com
- tumail+1@gmail.com
- tumail+test@gmail.com
- tumail+dev@gmail.com

Pero Supabase los ve como emails diferentes ✅
```

### **3. Cambiar IP** 🌐
```bash
# Windows
ipconfig /release
ipconfig /renew

# Mac/Linux
sudo ifconfig en0 down
sudo ifconfig en0 up

# O simplemente:
1. Desconectar WiFi
2. Esperar 10 segundos
3. Reconectar
```

### **4. Usar VPN gratuita** 🔐
```
ProtonVPN (gratis): https://protonvpn.com
Windscribe (gratis): https://windscribe.com

1. Instalar VPN
2. Conectar a servidor diferente
3. Tu IP cambia → Rate limit reseteado
```

---

## 🛠️ Soluciones para Desarrollo

### **Opción A: Variables de entorno para bypass (Temporal)**

```typescript
// src/lib/supabase.ts

// Crear cliente con configuración de desarrollo
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // En desarrollo, aumentar timeout
      ...(process.env.NODE_ENV === 'development' && {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      })
    }
  }
);
```

### **Opción B: Hook de desarrollo que bypasea rate limit**

```typescript
// src/hooks/useDevBypass.ts
export function useDevBypass() {
  const isDev = process.env.NODE_ENV === 'development';
  
  // En desarrollo, agregar timestamp al email
  const transformEmail = (email: string) => {
    if (!isDev) return email;
    
    const [name, domain] = email.split('@');
    const timestamp = Date.now();
    return `${name}+dev${timestamp}@${domain}`;
  };
  
  return { transformEmail };
}

// Uso en SignupForm:
import { useDevBypass } from '@/hooks/useDevBypass';

const { transformEmail } = useDevBypass();

const handleSubmit = async (e) => {
  const finalEmail = transformEmail(email); // test@gmail.com → test+dev1712345@gmail.com
  await signUp(finalEmail, password);
};
```

### **Opción C: Usar emails temporales para testing**

```
Servicios gratuitos:
- https://temp-mail.org
- https://10minutemail.com
- https://guerrillamail.com

Usar para testing rápido (no para producción)
```

---

## 🔍 Ver Rate Limits actuales en Supabase

### **En Supabase Dashboard:**

```
1. Ir a: https://app.supabase.com
2. Tu proyecto → Authentication → Rate Limits
3. Ver:
   - Email signup: X intentos/hora
   - SMS signup: X intentos/hora  
   - Email login: X intentos/hora

Default:
- Email signup: 4-5/hora por email
- Login: 60/hora por IP
```

### **Límites no son configurables en Free Tier:**
```
❌ No puedes cambiar 4 intentos/hora a más
✅ Puedes usar múltiples emails
✅ Puedes cambiar de IP
✅ Puedes esperar 1 hora
```

---

## 🎯 Estrategia para Testing

### **Durante Desarrollo:**

```javascript
// Lista de emails para testing
const TEST_EMAILS = [
  'test1@gmail.com',
  'test2@gmail.com', 
  'test3@gmail.com',
  'test4@gmail.com',
  'test5@gmail.com'
];

// Rotar entre ellos
let currentEmailIndex = 0;

function getNextTestEmail() {
  const email = TEST_EMAILS[currentEmailIndex];
  currentEmailIndex = (currentEmailIndex + 1) % TEST_EMAILS.length;
  return email;
}

// Uso:
const email = getNextTestEmail();
await signUp(email, 'test123');
```

### **Usar extension de email +alias:**

```javascript
// Un solo email real:
const baseEmail = 'mimail@gmail.com';

// Generar variantes infinitas:
function generateTestEmail(base: string) {
  const timestamp = Date.now();
  const [name, domain] = base.split('@');
  return `${name}+test${timestamp}@${domain}`;
}

// Ejemplos generados:
// mimail+test1712345678@gmail.com
// mimail+test1712345890@gmail.com
// mimail+test1712346000@gmail.com

// Todos llegan a: mimail@gmail.com
// Pero Supabase los ve como emails diferentes ✅
```

---

## 🚀 Script de Limpieza (Opcional)

Si tienes acceso a la base de datos de Supabase:

```sql
-- ⚠️ SOLO EN DESARROLLO
-- Eliminar usuarios de prueba

DELETE FROM auth.users 
WHERE email LIKE '%+test%@%' 
   OR email LIKE 'test%@%';

-- Esto libera los emails para reusar
```

**Cómo ejecutar:**
```
1. Supabase Dashboard → SQL Editor
2. Pegar el script
3. Run
```

---

## 📊 Monitoreo de Rate Limits

```typescript
// src/lib/rateLimitLogger.ts

export function logRateLimitError(error: any) {
  if (error.message?.includes('rate limit')) {
    console.warn('🚨 Rate Limit Hit:', {
      time: new Date().toISOString(),
      error: error.message,
      suggestion: 'Use different email or wait 1 hour'
    });
    
    // Opcional: enviar a servicio de logging
    // Sentry.captureMessage('Rate limit exceeded');
  }
}

// Uso en SignupForm:
catch (err) {
  logRateLimitError(err);
  setError(err.message);
}
```

---

## ✅ Checklist de Solución

```
□ ¿Puedes esperar 1 hora?
  → Sí: Esperar y retry
  
□ ¿Necesitas testear ahora?
  → Usar email diferente: test2@gmail.com
  
□ ¿Ya usaste muchos emails?
  → Usar técnica +alias: test+1@gmail.com
  
□ ¿Sigues bloqueado?
  → Cambiar IP (VPN, datos móviles)
  
□ ¿Estás en desarrollo constante?
  → Implementar generador de emails automático
  
□ ¿Es para producción?
  → Los límites son buenos para seguridad, mantenerlos
```

---

## 🔧 Implementación del Generador de Emails

Voy a crear un helper para desarrollo:

```typescript
// src/lib/devUtils.ts

/**
 * Genera email único para testing en desarrollo
 * Ejemplo: test@gmail.com → test+dev1712345@gmail.com
 */
export function generateDevEmail(baseEmail: string): string {
  // Solo en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return baseEmail;
  }
  
  const [name, domain] = baseEmail.split('@');
  const timestamp = Date.now().toString().slice(-6); // últimos 6 dígitos
  
  return `${name}+dev${timestamp}@${domain}`;
}

/**
 * Limpia el email de sufijos de desarrollo
 */
export function cleanDevEmail(email: string): string {
  return email.replace(/\+dev\d+@/, '@');
}

// Uso en SignupForm (opcional):
import { generateDevEmail } from '@/lib/devUtils';

const isDev = process.env.NODE_ENV === 'development';
const finalEmail = isDev ? generateDevEmail(email) : email;

await signUp(finalEmail, password);
```

---

## 📱 Solución Mobile/Desktop

### **Si desarrollas en móvil:**
```
1. Modo avión ON
2. Esperar 5 segundos
3. Modo avión OFF
4. Nueva IP → Rate limit reseteado
```

### **Si usas hotspot:**
```
1. Apagar hotspot
2. Cambiar a WiFi normal
3. Volver a hotspot
4. IP diferente
```

---

## ⚠️ IMPORTANTE

**NO deshabilitar rate limiting en producción:**
```
✅ Desarrollo: OK usar trucos para bypasear
❌ Producción: MANTENER rate limiting activo

Razón: Protege contra ataques reales
```

---

## 🎯 Resumen de Soluciones

| Solución | Tiempo | Dificultad | Efectividad |
|----------|--------|------------|-------------|
| **Esperar 1 hora** | 60 min | Muy fácil | 100% |
| **Email diferente** | 10 seg | Muy fácil | 100% |
| **Técnica +alias** | 30 seg | Fácil | 100% |
| **Cambiar IP** | 1-5 min | Fácil | 100% |
| **VPN** | 2-10 min | Media | 100% |
| **Generador auto** | 5 min | Media | 100% |

---

**Recomendación:** Usa la técnica del +alias (test+1@gmail.com) para desarrollo. Es la más práctica.
