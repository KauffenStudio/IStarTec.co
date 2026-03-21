import { setRequestLocale } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { NavBar } from '@/components/NavBar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ServiceCatalog } from '@/components/ServiceCatalog';
import { ContactSection } from '@/components/ContactSection';
import type { Service, VehicleSurcharge } from '@/types/database';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const { data: surcharges, error: surchargesError } = await supabase
    .from('vehicle_surcharges')
    .select('*');

  // Log errors server-side but render page with empty arrays (graceful degradation)
  if (servicesError) {
    console.error('[HomePage] Failed to fetch services:', servicesError.message);
  }
  if (surchargesError) {
    console.error('[HomePage] Failed to fetch surcharges:', surchargesError.message);
  }

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServiceCatalog
          services={(services as Service[]) ?? []}
          surcharges={(surcharges as VehicleSurcharge[]) ?? []}
          locale={locale}
          id="services"
        />
        <ContactSection />
      </main>
    </>
  );
}
