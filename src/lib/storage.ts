/**
 * Supabase Storage Helpers
 * Funciones para subir/eliminar archivos en Supabase Storage
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'pet-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type PetUploadType = 'photo' | 'license';
type EventUploadType = 'attachment';

/**
 * Valida un archivo antes de subirlo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es muy grande. Maximo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no permitido. Solo JPG, PNG o WebP',
    };
  }

  return { valid: true };
}

async function uploadImageAsset(
  file: File,
  userId: string,
  entityId: string,
  type: PetUploadType | EventUploadType
): Promise<string | null> {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${entityId}-${type}-${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

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
 * Sube una foto o licencia de mascota a Supabase Storage
 */
export async function uploadPetPhoto(
  file: File,
  userId: string,
  petId: string,
  type: PetUploadType
): Promise<string | null> {
  return uploadImageAsset(file, userId, petId, type);
}

/**
 * Sube una imagen adjunta para un evento medico
 */
export async function uploadEventAttachment(
  file: File,
  userId: string,
  eventId: string
): Promise<string | null> {
  return uploadImageAsset(file, userId, eventId, 'attachment');
}

/**
 * Elimina un archivo del storage a partir de su URL publica
 */
export async function deletePetPhoto(url: string): Promise<boolean> {
  try {
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

export async function deleteStorageFile(url: string): Promise<boolean> {
  return deletePetPhoto(url);
}

/**
 * Obtiene una URL firmada para un archivo existente
 * Util cuando el bucket es privado y necesitas mostrar imagenes
 */
export async function getSignedUrl(filePath: string): Promise<string | null> {
  try {
    if (!filePath) return null;

    let path = filePath;
    if (filePath.includes('/storage/v1/object/')) {
      const parts = filePath.split(`/${BUCKET_NAME}/`);
      path = parts[1] || filePath;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 31536000);

    if (error || !data) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error in getSignedUrl:', err);
    return null;
  }
}

/**
 * Comprime una imagen antes de subirla
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
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
    };
  });
}
