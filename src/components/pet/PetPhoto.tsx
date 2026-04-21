'use client';

import Image from 'next/image';
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
    <Image
      src={photoUrl}
      alt={name}
      width={160}
      height={160}
      className={`${sizeClassName} ${imageClassName}`}
      onError={() => setImageError(true)}
      unoptimized
    />
  );
}
