-- ============================================
-- SUPABASE STORAGE - CONFIGURACIÓN COMPLETA
-- ============================================
-- IMPORTANTE: Antes de ejecutar este script:
-- 1. Crear bucket "pet-photos" desde el Dashboard de Supabase (Storage → New Bucket)
-- 2. Configurar como PRIVATE (no público)
-- 3. Luego ejecutar este script en SQL Editor

-- ============================================
-- 1. AGREGAR CAMPO A TABLA PETS
-- ============================================

ALTER TABLE pets ADD COLUMN IF NOT EXISTS license_url TEXT;

-- ============================================
-- 2. POLICIES PARA STORAGE
-- ============================================

-- Policy 1: Upload (INSERT)
-- Permite a usuarios subir archivos solo a su propia carpeta
CREATE POLICY "Users can upload own pet photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: View (SELECT)
-- Permite a usuarios ver solo sus propios archivos
CREATE POLICY "Users can view own pet photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Update (UPDATE)
-- Permite a usuarios actualizar solo sus propios archivos
CREATE POLICY "Users can update own pet photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Delete (DELETE)
-- Permite a usuarios eliminar solo sus propios archivos
CREATE POLICY "Users can delete own pet photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 3. VERIFICACIÓN
-- ============================================

-- Ver todas las policies de storage
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%pet photos%';

-- Ver buckets existentes
SELECT id, name, public FROM storage.buckets;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 4 policies creadas con nombres:
--   1. Users can upload own pet photos (INSERT)
--   2. Users can view own pet photos (SELECT)
--   3. Users can update own pet photos (UPDATE)
--   4. Users can delete own pet photos (DELETE)
--
-- 1 bucket visible:
--   - pet-photos (public: false)
-- ============================================
