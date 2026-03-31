import { setRequestLocale } from 'next-intl/server';
import { NavBar } from '@/components/NavBar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ServiceCatalog } from '@/components/ServiceCatalog';
import { ContactSection } from '@/components/ContactSection';
import type { Service, VehicleSurcharge } from '@/types/database';

const STATIC_SERVICES: Service[] = [
  { id: '1', slug: 'interior-express',  name_pt: 'Lavagem Interior Express',    name_en: 'Express Interior Wash',       desc_pt: 'Aspiracao + tablier + plasticos',             desc_en: 'Vacuuming + dashboard + plastics',            duration_min: 30,  base_price: 10,  is_active: true, sort_order: 1 },
  { id: '2', slug: 'exterior-express',  name_pt: 'Lavagem Exterior Express',    name_en: 'Express Exterior Wash',       desc_pt: 'Carro completo + jantes + motor',             desc_en: 'Full exterior + rims + engine bay',          duration_min: 45,  base_price: 10,  is_active: true, sort_order: 2 },
  { id: '3', slug: 'exterior-premium',  name_pt: 'Lavagem Exterior Premium',    name_en: 'Premium Exterior Wash',       desc_pt: 'Express + polimento farois + remocao riscos', desc_en: 'Express + headlight polish + scratch removal', duration_min: 90,  base_price: 20,  is_active: true, sort_order: 3 },
  { id: '4', slug: 'exterior-interior', name_pt: 'Exterior + Interior Express', name_en: 'Exterior + Interior Express', desc_pt: 'Ambas as lavagens express',                   desc_en: 'Both express washes combined',               duration_min: 75,  base_price: 16,  is_active: true, sort_order: 4 },
  { id: '5', slug: 'interior-premium',  name_pt: 'Pacote Interior Premium',     name_en: 'Premium Interior Package',    desc_pt: 'Todos os extras incluidos',                   desc_en: 'All extras included',                        duration_min: 120, base_price: 50,  is_active: true, sort_order: 5 },
  { id: '6', slug: 'full-detailing',    name_pt: 'Full Detailing',              name_en: 'Full Detailing',              desc_pt: 'Tudo incluido',                               desc_en: 'Everything included',                        duration_min: 150, base_price: 70,  is_active: true, sort_order: 6 },
];

const STATIC_SURCHARGES: VehicleSurcharge[] = [
  { vehicle_type: 'citadino', surcharge: 0 },
  { vehicle_type: 'berlina',  surcharge: 5 },
  { vehicle_type: 'suv',      surcharge: 10 },
  { vehicle_type: 'carrinha', surcharge: 15 },
];

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let services: Service[] = STATIC_SERVICES;
  let surcharges: VehicleSurcharge[] = STATIC_SURCHARGES;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase');
      const supabase = await createSupabaseServerClient();
      const { data: dbServices } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
      const { data: dbSurcharges } = await supabase.from('vehicle_surcharges').select('*');
      if (dbServices) services = dbServices as Service[];
      if (dbSurcharges) surcharges = dbSurcharges as VehicleSurcharge[];
    } catch (e) {
      console.error('[HomePage] Supabase fetch failed, using static data:', e);
    }
  }

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServiceCatalog
          services={services}
          surcharges={surcharges}
          locale={locale}
          id="services"
        />
        <ContactSection />
      </main>
      <footer className="py-6 text-center">
        <a
          href="https://kauffen.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-light tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300 no-underline"
        >
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" aria-hidden="true">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 6.5" className="animate-[craftedSpinA_12s_linear_infinite] origin-center"/>
            <circle cx="16" cy="16" r="6.5" stroke="currentColor" strokeWidth="1.1" strokeDasharray="5.5 5" className="animate-[craftedSpinB_8s_linear_infinite_reverse] origin-center"/>
            <circle cx="16" cy="16" r="1.6" fill="currentColor"/>
          </svg>
          <span>Crafted by Kauffen Studios</span>
        </a>
      </footer>
    </>
  );
}
