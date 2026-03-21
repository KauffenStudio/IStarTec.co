import { getTranslations } from 'next-intl/server';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';

export async function ContactSection() {
  const t = await getTranslations('Contact');

  return (
    <section id="contact" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-brand-white mb-8">
          {t('title')}
        </h2>
        <div className="bg-brand-navy-light rounded-lg p-6 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="tel:+351928380478"
              className="flex items-center gap-3 min-h-[44px] text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              <Phone size={16} className="text-brand-cyan flex-shrink-0" />
              <span>{t('phone')}</span>
            </a>
            <a
              href="mailto:jetwash24detailing@gmail.com"
              className="flex items-center gap-3 min-h-[44px] text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              <Mail size={16} className="text-brand-cyan flex-shrink-0" />
              <span>{t('email')}</span>
            </a>
            <a
              href="https://www.google.com/maps/search/Guia,+Portugal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-h-[44px] text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              <MapPin size={16} className="text-brand-cyan flex-shrink-0" />
              <span>{t('address')}</span>
            </a>
            <a
              href="https://www.instagram.com/jetwash24detailing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-h-[44px] text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              <Instagram size={16} className="text-brand-cyan flex-shrink-0" />
              <span>{t('instagram')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
