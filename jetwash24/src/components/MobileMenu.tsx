'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const tNav = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={tNav('openMenu')}
        className="text-brand-white p-2"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-brand-navy/95 backdrop-blur-sm py-4 z-50">
          <div className="flex flex-col items-center gap-4">
            <a
              href="#services"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              {tNav('services')}
            </a>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              {tNav('contact')}
            </a>
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-brand-white hover:text-brand-cyan transition-colors duration-150"
            >
              {tCommon('locale_switch')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
