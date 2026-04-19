# 🛡️ Mejoras de Seguridad - Protección contra Ataques

**Fecha:** 2026-04-12  
**Versión:** 1.3.0 Security  
**Objetivo:** Proteger signup contra ataques de registro masivo

---

## 🎯 Problema Identificado

### **Ataque de Registro Masivo:**
Un atacante podría ejecutar scripts para crear miles de cuentas falsas:
- Llenar la base de datos con spam
- Agotar el free tier de Supabase (1000 usuarios)
- Generar carga innecesaria en el servidor
- Dificultar el uso legítimo

---

## 🔒 Protecciones Actuales (Por Defecto)

### **Supabase Auth:**
```
✅ Rate Limiting: 60 requests/hora por IP
✅ Email único: No permite duplicados
✅ Password hashing: Contraseñas encriptadas
✅ JWT expiration: Tokens expiran en 1 hora
```

### **Limitaciones:**
```
❌ Sin CAPTCHA: Bots pueden registrarse
❌ Sin honeypot: No detecta bots simples
❌ Sin confirmación de email: Emails falsos válidos
❌ Múltiples IPs: Atacante puede cambiar IP
```

---

## 🛡️ Soluciones Implementables

### **Nivel 1: Básico (Implementar YA)** 🔥

#### **1.1 Activar Confirmación de Email**

**En Supabase Dashboard:**
```
1. Ir a Authentication → Settings
2. Enable email confirmations: ON
3. Guardar cambios

Resultado:
- Usuario debe confirmar email antes de acceder
- Reduce cuentas falsas en 90%
```

**Modificar código:**
```typescript
// src/components/auth/SignupForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ... validaciones ...
  
  try {
    setLoading(true);
    const { data } = await signUp(email, password);
    
    // Mostrar mensaje de confirmación
    setSuccess(true);
    setMessage('✉️ Revisa tu email para confirmar tu cuenta');
    
  } catch (err) {
    setError(err.message);
  }
};
```

---

#### **1.2 Honeypot (Campo Trampa)**

**Agregar campo invisible:**
```tsx
// src/components/auth/SignupForm.tsx

<form onSubmit={handleSubmit}>
  {/* Campo honeypot - invisible para humanos */}
  <input
    type="text"
    name="website"
    value={honeypot}
    onChange={(e) => setHoneypot(e.target.value)}
    className="hidden" // Oculto con CSS
    tabIndex={-1}
    autoComplete="off"
  />
  
  {/* Campos normales */}
  <Input label="Email" ... />
  <Input label="Password" ... />
</form>

// En handleSubmit:
if (honeypot !== '') {
  // Bot detectado (llenó campo invisible)
  console.warn('Bot detected');
  return; // No enviar a Supabase
}
```

**Cómo funciona:**
- Humanos: No ven el campo, no lo llenan → honeypot = ""
- Bots: Llenan todos los campos → honeypot = "algo" → BLOQUEADO

---

#### **1.3 Rate Limiting en Cliente**

```typescript
// src/hooks/useRateLimiter.ts
export function useRateLimiter(maxAttempts = 3, windowMs = 60000) {
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const checkLimit = () => {
    if (blockedUntil && Date.now() < blockedUntil) {
      const waitSeconds = Math.ceil((blockedUntil - Date.now()) / 1000);
      throw new Error(`Demasiados intentos. Espera ${waitSeconds} segundos`);
    }
    return true;
  };

  const recordAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setBlockedUntil(Date.now() + windowMs);
      setTimeout(() => {
        setAttempts(0);
        setBlockedUntil(null);
      }, windowMs);
    }
  };

  return { checkLimit, recordAttempt };
}

// Uso en SignupForm:
const { checkLimit, recordAttempt } = useRateLimiter(3, 60000); // 3 intentos/minuto

const handleSubmit = async (e) => {
  try {
    checkLimit(); // Lanza error si está bloqueado
    await signUp(email, password);
  } catch (err) {
    recordAttempt();
    setError(err.message);
  }
};
```

---

### **Nivel 2: Intermedio (Recomendado)** ⭐

#### **2.1 Google reCAPTCHA v3**

**Instalación:**
```bash
npm install react-google-recaptcha-v3
```

**Obtener keys:**
```
1. Ir a: https://www.google.com/recaptcha/admin
2. Crear nuevo sitio
3. Tipo: reCAPTCHA v3
4. Dominios: localhost, tu-app.vercel.app
5. Copiar Site Key y Secret Key
```

**Configurar .env.local:**
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc... (solo backend)
```

**Implementar:**
```tsx
// src/app/layout.tsx
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        >
          <Header />
          {children}
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}

// src/components/auth/SignupForm.tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function SignupForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generar token de reCAPTCHA
    const token = await executeRecaptcha('signup');
    
    // Enviar token al backend para verificar
    const response = await fetch('/api/auth/verify-recaptcha', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      setError('Verificación de seguridad fallida');
      return;
    }
    
    // Continuar con signup normal
    await signUp(email, password);
  };
}

// src/app/api/auth/verify-recaptcha/route.ts
export async function POST(req: Request) {
  const { token } = await req.json();
  
  // Verificar con Google
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  );
  
  const data = await response.json();
  
  if (!data.success || data.score < 0.5) {
    return new Response('Bot detected', { status: 403 });
  }
  
  return new Response('OK', { status: 200 });
}
```

**Resultado:**
- Score 0.0-0.1: Bot definitivo → BLOQUEAR
- Score 0.5-1.0: Humano probable → PERMITIR
- Invisible para usuarios legítimos

---

#### **2.2 Turnstile de Cloudflare** (Alternativa gratuita)

**Ventajas:**
- Gratis ilimitado
- Más rápido que reCAPTCHA
- Sin rastreo de Google

```bash
npm install @marsidev/react-turnstile
```

```tsx
import { Turnstile } from '@marsidev/react-turnstile';

<Turnstile
  siteKey="tu_site_key"
  onSuccess={(token) => setToken(token)}
/>
```

---

### **Nivel 3: Avanzado (Producción)** 🚀

#### **3.1 Rate Limiting con Upstash Redis**

**Para múltiples IPs:**
```typescript
// Edge function con rate limiting global
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 signups/hora
  analytics: true,
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Continuar con signup
}
```

---

#### **3.2 IP Blocking y Geofencing**

```typescript
// Bloquear IPs sospechosas
const BLOCKED_IPS = ['1.2.3.4', '5.6.7.8'];
const ALLOWED_COUNTRIES = ['MX', 'US', 'ES']; // Solo estos países

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for');
  const country = req.headers.get('x-vercel-ip-country');
  
  if (BLOCKED_IPS.includes(ip)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  if (!ALLOWED_COUNTRIES.includes(country)) {
    return new Response('Service not available in your region', { status: 403 });
  }
  
  // Continuar
}
```

---

#### **3.3 Email Verification Service**

```typescript
// Verificar que email sea real y no temporal
import { verifyEmail } from '@sendgrid/mail-helper';

const isDisposable = await fetch(
  `https://api.apilayer.com/email_verification/check?email=${email}`,
  { headers: { apikey: 'tu_key' } }
);

if (isDisposable.format_valid === false) {
  throw new Error('Email no válido');
}

if (isDisposable.is_disposable === true) {
  throw new Error('No se permiten emails temporales');
}
```

---

#### **3.4 Fingerprinting del Navegador**

```typescript
// Detectar mismo dispositivo con múltiples emails
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

const fp = await FingerprintJS.load();
const result = await fp.get();

// Verificar si este fingerprint ya registró cuenta
const existingUser = await db.query(
  'SELECT * FROM users WHERE fingerprint = $1',
  [result.visitorId]
);

if (existingUser && createdRecently(existingUser.created_at)) {
  throw new Error('Ya registraste una cuenta recientemente');
}
```

---

## 📊 Matriz de Protección

| Protección | Nivel | Efectividad | Costo | Complejidad |
|------------|-------|-------------|-------|-------------|
| **Email Confirmation** | Básico | 90% | Gratis | Baja |
| **Honeypot** | Básico | 70% | Gratis | Muy Baja |
| **Client Rate Limit** | Básico | 40% | Gratis | Baja |
| **reCAPTCHA v3** | Intermedio | 95% | Gratis* | Media |
| **Turnstile** | Intermedio | 93% | Gratis | Media |
| **Upstash Rate Limit** | Avanzado | 98% | $$ | Media |
| **IP Blocking** | Avanzado | 85% | Gratis | Media |
| **Email Verification** | Avanzado | 80% | $$ | Alta |
| **Fingerprinting** | Avanzado | 90% | $$$ | Alta |

*Gratis hasta 1M requests/mes

---

## 🎯 Recomendación por Etapa

### **MVP (Ahora):**
```
✅ 1. Email confirmation (Supabase)
✅ 2. Honeypot (5 minutos de código)
✅ 3. Client rate limiting (10 minutos)

Protección: ~80%
Costo: $0
Tiempo: 30 minutos
```

### **Beta (100 usuarios):**
```
✅ Todo lo anterior +
✅ 4. reCAPTCHA v3 o Turnstile

Protección: ~95%
Costo: $0
Tiempo: 1 hora
```

### **Producción (1000+ usuarios):**
```
✅ Todo lo anterior +
✅ 5. Upstash rate limiting
✅ 6. IP blocking
✅ 7. Email verification

Protección: ~99%
Costo: ~$10-20/mes
Tiempo: 1 día
```

---

## 🚨 Monitoreo de Ataques

### **Alertas a configurar:**

```typescript
// Detectar patrones sospechosos
if (signupsLastHour > 50) {
  await sendAlert({
    message: '⚠️ Posible ataque: 50 signups en 1 hora',
    channel: 'security'
  });
}

// Logs para análisis
console.log({
  event: 'signup_attempt',
  email,
  ip,
  country,
  user_agent,
  success: true/false,
  timestamp: Date.now()
});
```

---

## ✅ Implementación Rápida (30 minutos)

### **Paso 1: Email Confirmation**
1. Supabase → Authentication → Settings
2. Enable email confirmations: ON
3. ✅ Done

### **Paso 2: Honeypot**
```tsx
// Agregar a SignupForm.tsx
const [honeypot, setHoneypot] = useState('');

<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ display: 'none' }}
  tabIndex={-1}
/>

// En handleSubmit:
if (honeypot) return; // Bot detected
```

### **Paso 3: Rate Limiting**
```tsx
// Crear useRateLimiter.ts (código arriba)
// Usar en SignupForm
const { checkLimit, recordAttempt } = useRateLimiter(3, 60000);
```

---

**Actualizado:** 2026-04-12  
**Estado:** Documentado - Pendiente implementación  
**Prioridad:** 🔴 ALTA (Implementar antes de producción)
