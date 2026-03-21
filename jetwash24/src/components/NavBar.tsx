import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/Logo';
import { MobileMenu } from '@/components/MobileMenu';

export async function NavBar() {
  const tNav = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');

  return (
    <nav className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo variant="white" width={120} height={36} />

        <div className="hidden md:flex items-center gap-6">
          <a
            href="#services"
            className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
          >
            {tNav('services')}
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
          >
            {tNav('contact')}
          </a>
          <Link
            href="/"
            locale={undefined}
            className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
          >
            {tCommon('locale_switch')}
          </Link>
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
