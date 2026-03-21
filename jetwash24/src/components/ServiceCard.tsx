'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Droplets, Car, Package } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SLUG_CATEGORY } from '@/lib/catalog';
import type { Service } from '@/types/database';

type Props = {
  service: Service;
  price: number;
  locale: string;
  children?: React.ReactNode;
};

const categoryIcons = {
  interior: Droplets,
  exterior: Car,
  pacotes: Package,
} as const;

export function ServiceCard({ service, price, locale, children }: Props) {
  const t = useTranslations('Services');
  const category = SLUG_CATEGORY[service.slug] ?? 'interior';
  const Icon = categoryIcons[category];
  const name = locale === 'pt' ? service.name_pt : service.name_en;
  const description = locale === 'pt' ? service.desc_pt : service.desc_en;

  return (
    <Card className="bg-brand-navy-light border border-brand-cyan/20 rounded-lg hover:border-brand-cyan/50 transition-colors duration-150">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon size={24} className="text-brand-cyan flex-shrink-0" />
          <span className="text-xl font-semibold text-brand-white">{name}</span>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-brand-gray text-sm mb-3">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="bg-brand-navy text-brand-gray border border-brand-cyan/20"
          >
            {t('duration', { min: service.duration_min })}
          </Badge>
          <span className="text-2xl font-semibold text-brand-white">
            {price.toFixed(0)}€
          </span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
