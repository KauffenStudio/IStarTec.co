'use client';

import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/database';

type Props = {
  service: Service;
  price: number;
  saving: number;
  locale: string;
};

export function PackageCard({ service, price, saving, locale }: Props) {
  const t = useTranslations('Services');
  const name = locale === 'pt' ? service.name_pt : service.name_en;
  const description = locale === 'pt' ? service.desc_pt : service.desc_en;

  return (
    <Card className="bg-brand-navy-light border border-brand-cyan/20 rounded-lg hover:border-brand-cyan/50 transition-colors duration-150">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package size={24} className="text-brand-cyan flex-shrink-0" />
          <span className="text-xl font-semibold text-brand-white">{name}</span>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-brand-gray text-sm mb-3">{description}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-brand-navy text-brand-gray border border-brand-cyan/20"
          >
            {t('duration', { min: service.duration_min })}
          </Badge>
          <div className="flex items-center gap-1 flex-wrap">
            {saving > 0 && (
              <span className="text-brand-gray text-sm line-through mr-2">
                {(price + saving).toFixed(0)}€
              </span>
            )}
            <span className="text-2xl font-semibold text-brand-white">
              {price.toFixed(0)}€
            </span>
            {saving > 0 && (
              <Badge className="bg-brand-cyan text-brand-navy text-xs font-semibold ml-2">
                {t('saving', { amount: saving })}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
