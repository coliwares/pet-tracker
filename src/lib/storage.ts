/**
 * Supabase Storage Helpers
 * Funciones para subir/eliminar archivos en Supabase Storage
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'pet-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Valida un archivo antes de subirlo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no permitido. Solo JPG, PNG o WebP'
    };
  }

  return { valid: true };
}

/**
 * Sube una foto de mascota a Supabase Storage
 *
 * @param file - Archivo a subir
 * @param userId - ID del usuario
 * @param petId - ID de la mascota
 * @param type - Tipo de archivo ('photo' o 'license')
 * @returns URL pública del archivo o null si falla
 */
export async function uploadPetPhoto(
  file: File,
  userId: string,
  petId: string,
  type: 'photo' | 'license'
): Promise<string | null> {
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generar nombre único: userId/petId-type-timestamp.ext
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${petId}-${type}-${timestamp}.${fileExt}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
}

/**
 * Elimina una foto del storage
 *
 * @param url - URL completa del archivo
 */
export async function deletePetPhoto(url: string): Promise<boolean> {
  try {
    // Extraer path del URL
    const urlObj = new URL(url);
    const path = urlObj.pathname.split(`/${BUCKET_NAME}/`)[1];

    if (!path) {
      console.error('Invalid URL format');
      return false;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
}

/**
 * Comprime una imagen antes de subirla (opcional)
 * Útil para reducir tamaño de archivos grandes
 */
export async function compressImage(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar si es muy grande
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85 // Calidad 85%
        );
      };
    };
  });
}
