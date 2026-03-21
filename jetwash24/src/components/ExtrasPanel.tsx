'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const EXTRAS = [
  { id: 'deep-clean', translationKey: 'extras_deepClean', durationMin: 45, priceCents: 5000 },
  { id: 'pet-hair', translationKey: 'extras_petHair', durationMin: 15, priceCents: 1000 },
  { id: 'windows', translationKey: 'extras_windows', durationMin: 10, priceCents: 500 },
  { id: 'ozone', translationKey: 'extras_ozone', durationMin: 20, priceCents: 1000 },
] as const;

type ExtraKey = (typeof EXTRAS)[number]['translationKey'];

export function ExtrasPanel() {
  const t = useTranslations('Services');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedExtras = EXTRAS.filter((e) => checked.has(e.id));
  const totalPrice = selectedExtras.reduce((sum, e) => sum + e.priceCents / 100, 0);
  const totalMin = selectedExtras.reduce((sum, e) => sum + e.durationMin, 0);

  return (
    <div className="mt-4 pt-4 border-t border-brand-cyan/20">
      {EXTRAS.map((extra) => (
        <label
          key={extra.id}
          className="flex items-center gap-3 py-2 cursor-pointer"
        >
          <input
            type="checkbox"
            className="accent-brand-cyan w-4 h-4"
            checked={checked.has(extra.id)}
            onChange={() => toggle(extra.id)}
          />
          <span className="flex-1 text-brand-white text-sm">
            {t(extra.translationKey as ExtraKey)}
          </span>
          <span className="text-brand-gray text-xs">
            {t('extras_addMin', { min: extra.durationMin })}
          </span>
          <span className="text-brand-cyan text-xs">
            {t('extras_addPrice', { price: extra.priceCents / 100 })}
          </span>
        </label>
      ))}

      {checked.size > 0 && (
        <p className="text-brand-cyan font-semibold text-sm mt-2">
          {t('extras_total', { price: totalPrice, min: totalMin })}
        </p>
      )}
    </div>
  );
}
