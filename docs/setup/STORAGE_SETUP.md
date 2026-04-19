# Configuracion de Supabase Storage

Esta guia explica como configurar Supabase Storage para subir fotos de mascotas y licencias de registro.

---

## Objetivo

Permitir a los usuarios:
- Subir foto de su mascota
- Subir foto de la licencia municipal de registro
- Mostrar imagenes directamente desde URLs publicas del bucket

---

## Pasos de Configuracion

### 1. Crear el bucket en Supabase

1. Ve a tu proyecto en Supabase Dashboard.
2. En la barra lateral, entra a `Storage`.
3. Crea un bucket nuevo.
4. Usa esta configuracion:

```txt
Nombre: pet-photos

Configuracion:
- Public bucket: SI
- File size limit: 5 MB
- Allowed MIME types: image/jpeg, image/png, image/webp
```

5. Guarda el bucket.

### 2. Configurar policies

Aunque el bucket sea publico para servir imagenes por URL, conviene mantener policies para que cada usuario solo pueda subir, actualizar o eliminar sus propios archivos.

Ve a `Storage > pet-photos > Policies` y crea estas 4 policies:

#### Policy 1: Insert

```sql
CREATE POLICY "Users can upload own pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 2: Select

```sql
CREATE POLICY "Users can view own pet photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 3: Update

```sql
CREATE POLICY "Users can update own pet photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 4: Delete

```sql
CREATE POLICY "Users can delete own pet photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. Actualizar Base de Datos

Si ya tienes la tabla `pets` creada, agrega el campo `license_url`:

```sql
ALTER TABLE pets ADD COLUMN license_url TEXT;
```

Si estas creando la base desde cero, `supabase/supabase-setup.sql` ya incluye este campo.

---

## Verificar Configuracion

### Verificar el bucket

1. Ve a `Storage`.
2. Confirma que existe `pet-photos`.
3. Verifica que este marcado como `Public`.

### Verificar policies

En `Storage > pet-photos > Policies` deberias ver estas 4 policies:
- `Users can upload own pet photos`
- `Users can view own pet photos`
- `Users can update own pet photos`
- `Users can delete own pet photos`

---

## Probar el Upload

### Desde la app

1. Inicia sesion.
2. Ve a `Dashboard > Nueva Mascota`.
3. Completa los datos basicos.
4. Selecciona una imagen.
5. Guarda la mascota.

Deberias ver:
- `Subiendo foto de mascota...`
- `Guardando informacion...`
- Redireccion al detalle de la mascota
- La foto visible en card y detalle

### En Supabase

1. Ve a `Storage > pet-photos`.
2. Deberias ver una carpeta con tu `user_id`.
3. Dentro, archivos con formato tipo `petId-photo-timestamp.jpg`.

---

## Estructura de Archivos

```txt
pet-photos/
|- {user_id_1}/
|  |- {petId_1}-photo-1234567890.jpg
|  |- {petId_1}-license-1234567891.jpg
|  |- {petId_2}-photo-1234567892.jpg
|  \- {petId_2}-license-1234567893.jpg
\- {user_id_2}/
   |- {petId_3}-photo-1234567894.jpg
   \- {petId_3}-license-1234567895.jpg
```

Ventajas:
- Las imagenes se renderizan directo con la URL guardada
- Aislamiento por usuario mediante carpetas
- Facil de organizar
- Facil de buscar por `petId`
- Policies basadas en carpeta = `user_id`

---

## Troubleshooting

### Error: `Bucket does not exist`

Causa: el bucket no fue creado.

Solucion: crea `pet-photos` en `Storage`.

### Error: `new row violates row-level security policy`

Causa: falta alguna policy.

Solucion: revisa que las 4 policies esten creadas y activas.

### Error: `File size exceeds maximum`

Causa: archivo mayor a 5MB.

Solucion:
- la app ya comprime automaticamente
- si aun falla, reduce el archivo antes de subirlo

### Error: `Invalid file type`

Causa: formato no permitido.

Solucion: usar solo JPG, PNG o WebP.

### La imagen no se muestra despues de subir

1. Revisa en la tabla `pets` que `photo_url` tenga una URL.
2. Abre esa URL en el navegador.
3. Si no carga, revisa el bucket y la URL generada.
4. Si carga, el problema esta en el frontend.

---

## Mantenimiento

### Limpiar archivos huerfanos

Si eliminas mascotas, los archivos pueden quedar en Storage. Puedes revisarlos con algo como:

```sql
SELECT *
FROM storage.objects
WHERE bucket_id = 'pet-photos'
AND NOT EXISTS (
  SELECT 1
  FROM pets
  WHERE photo_url LIKE '%' || name || '%'
);
```

Luego puedes eliminarlos manualmente desde Storage.

### Ver uso total

```sql
SELECT
  bucket_id,
  COUNT(*) AS total_files,
  SUM(metadata->>'size')::bigint / 1024 / 1024 AS total_mb
FROM storage.objects
WHERE bucket_id = 'pet-photos'
GROUP BY bucket_id;
```

---

## Limites del Plan Free

| Recurso | Limite Free | Recomendacion |
|---|---:|---|
| Storage | 1 GB | Comprimir imagenes |
| Bandwidth | 2 GB/mes | Usar CDN si escala |
| Archivos | Ilimitados | Limpiar huerfanos periodicamente |

---

## Checklist

- [ ] Bucket `pet-photos` creado
- [ ] Bucket configurado como `Public`
- [ ] 4 policies creadas y activas
- [ ] Campo `license_url` agregado a tabla `pets`
- [ ] Probado upload de foto desde la app
- [ ] Probado upload de licencia desde la app
- [ ] Verificado que los archivos se guardan correctamente
- [ ] Verificado que las imagenes se muestran en card y detalle

---

Ultima actualizacion: 2026-04-19
Version: 1.1.0
