'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pet } from '@/lib/types';
import { supabase, getPets, createPet, updatePet, deletePet } from '@/lib/supabase';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const data = await getPets(user.id);
      setPets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching pets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchPets();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchPets]);

  const add = async (pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
    const newPet = await createPet(pet);
    setPets((current) => [newPet, ...current]);
    return newPet;
  };

  const update = async (petId: string, updates: Partial<Pet>) => {
    const updated = await updatePet(petId, updates);
    setPets((current) => current.map((pet) => (pet.id === petId ? updated : pet)));
    return updated;
  };

  const remove = async (petId: string) => {
    await deletePet(petId);
    setPets((current) => current.filter((pet) => pet.id !== petId));
  };

  return { pets, loading, error, fetchPets, add, update, remove };
}
