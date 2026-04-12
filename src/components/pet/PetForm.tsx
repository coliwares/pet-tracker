'use client';

import { useState } from 'react';
import { Pet, Species } from '@/lib/types';
import { SPECIES } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PetFormProps {
  pet?: Pet;
  onSubmit: (data: Partial<Pet>) => Promise<void>;
  submitLabel?: string;
}

export function PetForm({ pet, onSubmit, submitLabel = 'Guardar' }: PetFormProps) {
  const [name, setName] = useState(pet?.name || '');
  const [species, setSpecies] = useState<Species>(pet?.species || 'Perro');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [birthDate, setBirthDate] = useState(pet?.birth_date || '');
  const [weight, setWeight] = useState(pet?.weight?.toString() || '');
  const [notes, setNotes] = useState(pet?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birth_date: birthDate || null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700">
          💡 <span className="text-blue-600">Tip:</span> Los campos marcados con * son obligatorios
        </p>
      </div>

      <div className="space-y-1">
        <Input
          label="🐾 Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Max, Luna, Rocky..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🏷️ Especie *
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
          label="🐕 Raza"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Ej: Labrador, Persa, etc."
        />
        <p className="text-xs text-gray-500 ml-1">Opcional - Si conoces la raza específica</p>
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="📅 Fecha de nacimiento"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <p className="text-xs text-gray-500 ml-1">Calcularemos automáticamente la edad</p>
      </div>

      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          label="⚖️ Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ej: 5.5, 12.3, 30.0"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          💬 Notas adicionales
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alergias, condiciones especiales, observaciones importantes..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base bg-white hover:border-gray-300 resize-none"
        />
        <p className="text-xs text-gray-500 ml-1">Ej: Alérgico al pollo, toma medicamentos diarios, etc.</p>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          ⚠️ {error}
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
          <span>✨ {submitLabel}</span>
        )}
      </Button>
    </form>
  );
}
