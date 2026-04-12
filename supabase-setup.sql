-- Carnet Veterinario Digital - Supabase Setup Script
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla pets
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  photo_url TEXT,
  license_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pets_user_id ON pets(user_id);

-- Tabla events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_pet_id ON events(pet_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies para pets
CREATE POLICY "Users can view own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para events (heredan via pet_id)
CREATE POLICY "Users can view pet events"
  ON events FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pet events"
  ON events FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pet events"
  ON events FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pet events"
  ON events FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE CONFIGURATION
-- ============================================
-- IMPORTANTE: Los buckets de Storage se crean desde el Dashboard de Supabase
-- Ve a: Storage → Create bucket → Nombre: "pet-photos"
-- Configuración:
--   - Public bucket: NO (privado)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

-- Después de crear el bucket, ejecuta estas policies:

-- Policy: Usuarios pueden subir sus propias fotos
CREATE POLICY "Users can upload own pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Usuarios pueden ver sus propias fotos
CREATE POLICY "Users can view own pet photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Usuarios pueden actualizar sus propias fotos
CREATE POLICY "Users can update own pet photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Usuarios pueden eliminar sus propias fotos
CREATE POLICY "Users can delete own pet photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
