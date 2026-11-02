"use client";

import DraggableVinyl from "@/components/ui/DraggableVinyl";
import VinylDisc from "@/components/ui/VinylDisc";
import { useHydrated, useRandomValue } from "@/lib/use-shuffled";

export interface VinylCandidate {
  imageUrl?: string;
  imageAlt: string;
}

export interface RandomVinylProps {
  candidates: VinylCandidate[];
  size?: number;
}

export default function RandomVinyl({ candidates, size = 160 }: RandomVinylProps) {
  const hydrated = useHydrated();
  const randomValue = useRandomValue();
  const picked = hydrated && candidates.length > 0 ? candidates[Math.floor(randomValue * candidates.length)] : null;

  return (
    <div className="mb-8 flex min-h-[160px] justify-center">
      {picked && (
        <DraggableVinyl>
          <VinylDisc size={size} imageUrl={picked.imageUrl} imageAlt={picked.imageAlt} />
        </DraggableVinyl>
      )}
    </div>
  );
}
