'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ServiceCard } from '@/components/ServiceCard';
import { ExtrasPanel } from '@/components/ExtrasPanel';
import { PackageCard } from '@/components/PackageCard';
import { calculatePrice, calculateSavings, SLUG_CATEGORY } from '@/lib/catalog';
import type { Service, VehicleSurcharge, VehicleType } from '@/types/database';

type Props = {
  services: Service[];
  surcharges: VehicleSurcharge[];
  locale: string;
  id?: string;
};

export function ServiceCatalog({ services, surcharges, locale, id }: Props) {
  const t = useTranslations('Services');
  const [vehicleType, setVehicleType] = useState<VehicleType>('citadino');

  const surchargeMap = Object.fromEntries(
    surcharges.map((s) => [s.vehicle_type, s.surcharge])
  ) as Record<VehicleType, number>;

  const currentSurcharge = surchargeMap[vehicleType] ?? 0;

  const interiorServices = services.filter((s) => SLUG_CATEGORY[s.slug] === 'interior');
  const exteriorServices = services.filter((s) => SLUG_CATEGORY[s.slug] === 'exterior');
  const pacotesServices = services.filter((s) => SLUG_CATEGORY[s.slug] === 'pacotes');

  return (
    <section id={id} className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-brand-white mb-8">
          {t('tab_interior')}
        </h2>

        <VehicleSelector selected={vehicleType} onChange={setVehicleType} />

        <Tabs defaultValue="interior" className="mt-6">
          <TabsList className="bg-brand-navy-light border-b border-brand-cyan/20 w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="interior"
              className="data-[state=active]:text-brand-cyan data-[state=active]:border-b-2 data-[state=active]:border-brand-cyan data-[state=inactive]:text-brand-gray rounded-none px-4 py-3 min-h-[44px] bg-transparent"
            >
              {t('tab_interior')}
            </TabsTrigger>
            <TabsTrigger
              value="exterior"
              className="data-[state=active]:text-brand-cyan data-[state=active]:border-b-2 data-[state=active]:border-brand-cyan data-[state=inactive]:text-brand-gray rounded-none px-4 py-3 min-h-[44px] bg-transparent"
            >
              {t('tab_exterior')}
            </TabsTrigger>
            <TabsTrigger
              value="pacotes"
              className="data-[state=active]:text-brand-cyan data-[state=active]:border-b-2 data-[state=active]:border-brand-cyan data-[state=inactive]:text-brand-gray rounded-none px-4 py-3 min-h-[44px] bg-transparent"
            >
              {t('tab_pacotes')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interior">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {interiorServices.map((service) => {
                const isExpressInterior = service.slug === 'interior-express';
                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    price={calculatePrice(service, currentSurcharge)}
                    locale={locale}
                  >
                    {isExpressInterior && <ExtrasPanel />}
                  </ServiceCard>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="exterior">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {exteriorServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  price={calculatePrice(service, currentSurcharge)}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pacotes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pacotesServices.map((service) => (
                <PackageCard
                  key={service.id}
                  service={service}
                  price={calculatePrice(service, currentSurcharge)}
                  saving={calculateSavings(service.slug, services, currentSurcharge)}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {services.length === 0 && (
          <p className="text-brand-gray text-center py-8">{t('emptyState')}</p>
        )}
      </div>
    </section>
  );
}
