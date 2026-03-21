'use client';

import { useTranslations } from 'next-intl';
import type { VehicleType } from '@/types/database';

type Props = {
  selected: VehicleType;
  onChange: (v: VehicleType) => void;
};

const VEHICLE_TYPES: VehicleType[] = ['citadino', 'berlina', 'suv', 'carrinha'];

export function VehicleSelector({ selected, onChange }: Props) {
  const t = useTranslations('Services');

  return (
    <div className="flex flex-wrap gap-2">
      {VEHICLE_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={
            type === selected
              ? 'min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 bg-brand-cyan text-brand-navy'
              : 'min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 bg-brand-navy-light text-brand-white border border-brand-cyan/30 hover:border-brand-cyan/50'
          }
        >
          {t(`vehicle_${type}` as `vehicle_${VehicleType}`)}
        </button>
      ))}
    </div>
  );
}
