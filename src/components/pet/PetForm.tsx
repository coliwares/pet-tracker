'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Pet, Species } from '@/lib/types';
import { SPECIES } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadPetPhoto, deletePetPhoto, validateFile, compressImage } from '@/lib/storage';

export interface PetFormSubmitOptions {
  mode: 'create' | 'update';
  petId?: string;
}

interface PetFormProps {
  pet?: Pet;
  userId: string;
  onSubmit: (data: Partial<Pet>, options: PetFormSubmitOptions) => Promise<Pet>;
  onSuccess?: (pet: Pet) => void | Promise<void>;
  submitLabel?: string;
}

export function PetForm({ pet, userId, onSubmit, onSuccess, submitLabel = 'Guardar' }: PetFormProps) {
  const [name, setName] = useState(pet?.name || '');
  const [species, setSpecies] = useState<Species>(pet?.species || 'Perro');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [birthDate, setBirthDate] = useState(pet?.birth_date || '');
  const [weight, setWeight] = useState(pet?.weight?.toString() || '');
  const [notes, setNotes] = useState(pet?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para archivos
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photo_url || null);
  const [licensePreview, setLicensePreview] = useState<string | null>(pet?.license_url || null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const licenseAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  const isPdfFile = (file: File | null) => file?.type === 'application/pdf';
  const isPdfUrl = (url: string | null) => Boolean(url?.toLowerCase().includes('.pdf'));

  // Manejar selección de foto de mascota
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  // Manejar selección de registro
  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, licenseAllowedTypes);
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setLicenseFile(file);
    setLicensePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    const previousPhotoUrl = pet?.photo_url || null;
    const previousLicenseUrl = pet?.license_url || null;
    let photoUrl = pet?.photo_url || null;
    let licenseUrl = pet?.license_url || null;
    const uploadedUrlsToCleanup: string[] = [];

    try {
      setLoading(true);
      let savedPet: Pet;
      const basePetData = {
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birth_date: birthDate || null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes.trim() || null,
      };

      if (!pet) {
        setUploadProgress(photoFile || licenseFile ? 'Creando mascota...' : 'Guardando información...');

        savedPet = await onSubmit(
          {
            ...basePetData,
            photo_url: null,
            license_url: null,
          },
          { mode: 'create' }
        );

        if (photoFile) {
          setUploadProgress('Subiendo foto de mascota...');
          const compressed = await compressImage(photoFile, 1200);
          const uploadedUrl = await uploadPetPhoto(
            compressed,
            userId,
            savedPet.id,
            'photo'
          );
          if (uploadedUrl) {
            photoUrl = uploadedUrl;
            uploadedUrlsToCleanup.push(uploadedUrl);
          } else {
            throw new Error('Error al subir foto de mascota');
          }
        }

        if (licenseFile) {
          setUploadProgress('Subiendo registro nacional de mascotas...');
          const uploadableFile = isPdfFile(licenseFile) ? licenseFile : await compressImage(licenseFile, 1200);
          const uploadedUrl = await uploadPetPhoto(
            uploadableFile,
            userId,
            savedPet.id,
            'license'
          );
          if (uploadedUrl) {
            licenseUrl = uploadedUrl;
            uploadedUrlsToCleanup.push(uploadedUrl);
          } else {
            throw new Error('Error al subir el registro nacional de mascotas');
          }
        }

        if (photoUrl || licenseUrl) {
          setUploadProgress('Guardando información...');
          savedPet = await onSubmit(
            {
              photo_url: photoUrl,
              license_url: licenseUrl,
            },
            { mode: 'update', petId: savedPet.id }
          );
        }

        await onSuccess?.(savedPet);
        return;
      }

      // Subir foto de mascota si se seleccionó
      if (photoFile) {
        setUploadProgress('Subiendo foto de mascota...');
        const compressed = await compressImage(photoFile, 1200);
        const uploadedUrl = await uploadPetPhoto(
          compressed,
          userId,
          pet?.id || 'temp-' + Date.now(),
          'photo'
        );
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
          uploadedUrlsToCleanup.push(uploadedUrl);
        } else {
          throw new Error('Error al subir foto de mascota');
        }
      }

      // Subir registro si se seleccionó
      if (licenseFile) {
        setUploadProgress('Subiendo registro nacional de mascotas...');
        const uploadableFile = isPdfFile(licenseFile) ? licenseFile : await compressImage(licenseFile, 1200);
        const uploadedUrl = await uploadPetPhoto(
          uploadableFile,
          userId,
          pet?.id || 'temp-' + Date.now(),
          'license'
        );
        if (uploadedUrl) {
          licenseUrl = uploadedUrl;
          uploadedUrlsToCleanup.push(uploadedUrl);
        } else {
          throw new Error('Error al subir el registro nacional de mascotas');
        }
      }

      setUploadProgress('Guardando información...');

      const updatedPet = await onSubmit({
        ...basePetData,
        photo_url: photoUrl,
        license_url: licenseUrl,
      }, {
        mode: 'update',
        petId: pet.id,
      });
      await onSuccess?.(updatedPet);

      if (photoFile && previousPhotoUrl && previousPhotoUrl !== photoUrl) {
        setUploadProgress('Limpiando foto anterior...');
        const deleted = await deletePetPhoto(previousPhotoUrl);
        if (!deleted) {
          console.warn('No se pudo eliminar la foto anterior de la mascota');
        }
      }

      if (licenseFile && previousLicenseUrl && previousLicenseUrl !== licenseUrl) {
        setUploadProgress('Limpiando registro anterior...');
        const deleted = await deletePetPhoto(previousLicenseUrl);
        if (!deleted) {
          console.warn('No se pudo eliminar la licencia anterior de la mascota');
        }
      }
    } catch (err) {
      await Promise.all(
        uploadedUrlsToCleanup.map(async (url) => {
          if (url !== previousPhotoUrl && url !== previousLicenseUrl) {
            await deletePetPhoto(url);
          }
        })
      );
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700">
          Tip: <span className="text-blue-600">los campos marcados con *</span> son obligatorios
        </p>
      </div>

      <div className="space-y-1">
        <Input
          label="Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej.: Max, Luna, Rocky..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Especie *
        </label>
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value as Species)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base font-medium bg-white hover:border-gray-300"
          required
        >
          {SPECIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Input
          label="Raza"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Ej.: Labrador, Persa, etc."
        />
        <p className="text-xs text-gray-500 ml-1">Opcional. Si conoces la raza específica.</p>
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="Fecha de nacimiento"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <p className="text-xs text-gray-500 ml-1">Calcularemos automáticamente la edad.</p>
      </div>

      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          label="Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ej.: 5.5, 12.3, 30.0"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notas adicionales
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alergias, condiciones especiales, observaciones importantes..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base bg-white hover:border-gray-300 resize-none"
        />
        <p className="text-xs text-gray-500 ml-1">Ej.: Alérgico al pollo, toma medicamentos diarios, etc.</p>
      </div>

      {/* Sección de archivos */}
      <div className="border-t-2 border-gray-100 pt-6 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Imágenes
        </h3>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Foto de la mascota
          </label>

          {photoPreview && (
            <div className="relative inline-block">
              <Image
                src={photoPreview}
                alt="Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                unoptimized
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-2 file:border-blue-200
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50
              file:text-blue-700
              hover:file:bg-blue-100 hover:file:border-blue-300
              file:cursor-pointer file:transition-all"
          />
          <p className="text-xs text-gray-500">
            Opcional · Máximo 1 archivo · JPG, PNG o WebP · Máximo 5 MB · Se comprimirá automáticamente
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Registro nacional de mascotas
          </label>

          {licensePreview && (
            <div className="relative inline-block">
              {isPdfFile(licenseFile) || (licenseFile === null && isPdfUrl(licensePreview)) ? (
                <a
                  href={licensePreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-32 flex-col items-center gap-2 rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-5 text-center text-slate-700 transition-colors hover:border-purple-300 hover:text-purple-700"
                >
                  <FileText className="h-8 w-8" />
                  <span className="text-xs font-semibold">Ver PDF</span>
                </a>
              ) : (
                <Image
                  src={licensePreview}
                  alt="Preview registro nacional de mascotas"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setLicenseFile(null);
                  setLicensePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleLicenseChange}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-2 file:border-purple-200
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-purple-50 file:to-pink-50
              file:text-purple-700
              hover:file:bg-purple-100 hover:file:border-purple-300
              file:cursor-pointer file:transition-all"
          />
          <p className="text-xs text-gray-500">
            Opcional · Máximo 1 archivo · Sube una foto, captura o PDF del registro nacional de mascotas si ya lo tienes
          </p>
          <a
            href="https://registratumascota.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs font-semibold text-purple-700 transition-colors hover:text-purple-800"
          >
            ¿Aún no lo tienes? Obtenlo acá
          </a>
        </div>
      </div>

      {uploadProgress && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl font-medium animate-fade-in flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full text-lg py-4 mt-8" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        ) : (
          <span>{submitLabel}</span>
        )}
      </Button>
    </form>
  );
}


