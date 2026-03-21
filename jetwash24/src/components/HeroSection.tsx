import { getTranslations } from 'next-intl/server';
import { Droplets, Car, Package } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

export async function HeroSection() {
  const t = await getTranslations('HomePage');

  return (
    <section
      className="min-h-[600px] lg:min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'linear-gradient(135deg, #0B1F3A 60%, #009BB0 100%)' }}
    >
      <Logo variant="white" width={200} height={60} className="mb-8" />

      <h1 className="text-5xl font-semibold text-brand-white leading-tight mb-4">
        {t('tagline')}
      </h1>

      <Button
        asChild
        className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan-dark px-8 py-3 text-base font-semibold"
      >
        <a href="#services">{t('catalogCta')}</a>
      </Button>

      <div className="flex gap-8 flex-wrap justify-center mt-8">
        <div className="flex items-center gap-2">
          <Droplets size={24} className="text-brand-cyan" />
          <span className="text-brand-white text-sm">{t('badge_interior')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car size={24} className="text-brand-cyan" />
          <span className="text-brand-white text-sm">{t('badge_exterior')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package size={24} className="text-brand-cyan" />
          <span className="text-brand-white text-sm">{t('badge_pacotes')}</span>
        </div>
      </div>
    </section>
  );
}
