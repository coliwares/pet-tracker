# Storage Setup

## Objetivo

Configurar el bucket de imagenes para fotos de mascotas y documentos asociados.

## Bucket esperado

- Nombre: `pet-photos`
- Publico para lectura por URL
- Limite sugerido: 5 MB
- MIME permitidos: `image/jpeg`, `image/png`, `image/webp`

## Policies recomendadas

Crear policies para:

- Insert
- Select
- Update
- Delete

Todas deben validar:

- `bucket_id = 'pet-photos'`
- El primer segmento de la ruta coincide con `auth.uid()`

## Ruta esperada

Los archivos se guardan por usuario y mascota, por lo que el ownership depende de la estructura del path.

## Checklist

- Bucket creado
- MIME correctos
- Size limit configurado
- Policies aplicadas
- Upload de prueba exitoso

## Nota

Si cambias naming o estructura de carpetas, revisa tambien `src/lib/storage.ts`.
