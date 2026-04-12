# 📦 Configuración de Supabase Storage

Este documento explica cómo configurar Supabase Storage para subir fotos de mascotas y licencias de registro.

---

## 🎯 Objetivo

Permitir a los usuarios:
- 📸 Subir foto de su mascota
- 📄 Subir foto de la licencia municipal de registro
- 🔒 Mantener archivos privados (solo accesibles por el dueño)

---

## 📋 Pasos de Configuración

### **1. Crear el Bucket en Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)

2. En la barra lateral, click en **Storage**

3. Click en **"Create a new bucket"** (o "New Bucket")

4. **Configuración del bucket:**
   ```
   Nombre: pet-photos
   
   Configuración:
   - ✅ Public bucket: NO (debe ser privado)
   - ✅ File size limit: 5 MB
   - ✅ Allowed MIME types: image/jpeg, image/png, image/webp
   ```

5. Click **"Create bucket"**

---

### **2. Configurar Policies de Seguridad**

Después de crear el bucket, necesitas configurar las policies para que cada usuario solo pueda acceder a sus propios archivos.

1. En **Storage**, click en el bucket **"pet-photos"**

2. Ve a la pestaña **"Policies"**

3. Click en **"New Policy"**

4. Crea las siguientes **4 policies**:

#### **Policy 1: Subir archivos (INSERT)**

```sql
-- Nombre: Users can upload own pet photos
-- Operation: INSERT

CREATE POLICY "Users can upload own pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### **Policy 2: Ver archivos (SELECT)**

```sql
-- Nombre: Users can view own pet photos
-- Operation: SELECT

CREATE POLICY "Users can view own pet photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### **Policy 3: Actualizar archivos (UPDATE)**

```sql
-- Nombre: Users can update own pet photos
-- Operation: UPDATE

CREATE POLICY "Users can update own pet photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### **Policy 4: Eliminar archivos (DELETE)**

```sql
-- Nombre: Users can delete own pet photos
-- Operation: DELETE

CREATE POLICY "Users can delete own pet photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### **3. Actualizar Base de Datos**

Si ya tienes la tabla `pets` creada, agrega el campo `license_url`:

```sql
-- Ejecutar en SQL Editor de Supabase

ALTER TABLE pets ADD COLUMN license_url TEXT;
```

Si estás creando la base de datos desde cero, ejecuta el script completo en `supabase-setup.sql` que ya incluye este campo.

---

## 🔍 Verificar Configuración

### **Verificar que el bucket existe:**

1. Ve a **Storage** en Supabase Dashboard
2. Deberías ver el bucket **"pet-photos"**
3. Verifica que está marcado como **Private** (🔒)

### **Verificar policies:**

1. Click en **"pet-photos"** → **Policies**
2. Deberías ver **4 policies** activas:
   - ✅ Users can upload own pet photos (INSERT)
   - ✅ Users can view own pet photos (SELECT)
   - ✅ Users can update own pet photos (UPDATE)
   - ✅ Users can delete own pet photos (DELETE)

---

## 🧪 Probar el Upload

### **Desde la app:**

1. Inicia sesión en tu app
2. Ve a **Dashboard** → **Nueva Mascota**
3. Llena los datos básicos
4. Click en **"Elegir archivo"** en la sección de fotos
5. Selecciona una imagen (JPG, PNG o WebP, máx 5MB)
6. Click en **"Crear Mascota"**
7. Deberías ver:
   - ✅ "Subiendo foto de mascota..."
   - ✅ "Guardando información..."
   - ✅ Redirige al detalle de la mascota
   - ✅ La foto se muestra correctamente

### **Verificar en Supabase:**

1. Ve a **Storage** → **pet-photos**
2. Deberías ver una carpeta con tu `user_id`
3. Dentro, los archivos con formato: `petId-photo-timestamp.jpg`

---

## 📁 Estructura de Archivos

Los archivos se organizan así:

```
pet-photos/
├── {user_id_1}/
│   ├── {petId_1}-photo-1234567890.jpg
│   ├── {petId_1}-license-1234567891.jpg
│   ├── {petId_2}-photo-1234567892.jpg
│   └── {petId_2}-license-1234567893.jpg
├── {user_id_2}/
│   ├── {petId_3}-photo-1234567894.jpg
│   └── {petId_3}-license-1234567895.jpg
```

**Ventajas:**
- 🔒 Aislamiento por usuario (cada carpeta = un usuario)
- 🗂️ Fácil de organizar
- 🔍 Fácil de buscar (por petId)
- 🛡️ Policies automáticas (basadas en carpeta = user_id)

---

## 🚨 Troubleshooting

### **Error: "Bucket does not exist"**
- **Causa:** No creaste el bucket en Supabase
- **Solución:** Ve a Storage → Create bucket → Nombre: "pet-photos"

### **Error: "new row violates row-level security policy"**
- **Causa:** Falta alguna policy
- **Solución:** Verifica que las 4 policies estén creadas y activas

### **Error: "File size exceeds maximum"**
- **Causa:** Archivo mayor a 5MB
- **Solución:** La app comprime automáticamente, pero si sigue fallando:
  - Reducir MAX_FILE_SIZE en `src/lib/storage.ts`
  - O comprimir manualmente antes de subir

### **Error: "Invalid file type"**
- **Causa:** Formato no permitido
- **Solución:** Solo JPG, PNG o WebP están permitidos

### **La imagen no se muestra después de subir**
- **Causa:** URL no se guardó correctamente
- **Solución:** 
  1. Verifica en Supabase Table Editor → pets → photo_url (debería tener una URL)
  2. Copia la URL y pégala en el navegador
  3. Si funciona → problema en el frontend
  4. Si no funciona → problema en Storage

---

## 🔧 Mantenimiento

### **Limpiar archivos huérfanos**

Si eliminas mascotas, los archivos quedan en Storage. Para limpiar:

```sql
-- Ver archivos que no tienen mascota asociada
SELECT * FROM storage.objects 
WHERE bucket_id = 'pet-photos'
AND NOT EXISTS (
  SELECT 1 FROM pets 
  WHERE photo_url LIKE '%' || name || '%'
);

-- Eliminar manualmente desde Storage Dashboard
```

### **Ver tamaño total usado**

```sql
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
FROM storage.objects
WHERE bucket_id = 'pet-photos'
GROUP BY bucket_id;
```

---

## 📊 Límites del Plan Free

| Recurso | Límite Free | Recomendación |
|---------|-------------|---------------|
| **Storage** | 1 GB | Comprimir imágenes (✅ implementado) |
| **Bandwidth** | 2 GB/mes | Usar CDN si escala |
| **Archivos** | Ilimitados | Limpiar huérfanos periódicamente |

---

## ✅ Checklist de Configuración

Antes de hacer deploy, verifica:

- [ ] Bucket "pet-photos" creado
- [ ] Bucket configurado como **Private**
- [ ] 4 policies creadas y activas
- [ ] Campo `license_url` agregado a tabla `pets`
- [ ] Probado upload de foto desde la app
- [ ] Probado upload de licencia desde la app
- [ ] Verificado que los archivos se guardan correctamente
- [ ] Verificado que las imágenes se muestran en el detalle

---

**Última actualización:** 2026-04-12  
**Versión:** 1.0.0
