'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';

interface PetPhotoProps {
  name: string;
  photoUrl?: string | null;
  sizeClassName: string;
  iconClassName: string;
  imageClassName: string;
  fallbackClassName: string;
}

export function PetPhoto({
  name,
  photoUrl,
  sizeClassName,
  iconClassName,
  imageClassName,
  fallbackClassName,
}: PetPhotoProps) {
  const [imageError, setImageError] = useState(false);

  if (!photoUrl || imageError) {
    return (
      <div className={`${sizeClassName} ${fallbackClassName}`}>
        <PawPrint className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={name}
      className={`${sizeClassName} ${imageClassName}`}
      onError={() => setImageError(true)}
    />
  );
}
