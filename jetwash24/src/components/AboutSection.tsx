import { getTranslations } from 'next-intl/server';

export async function AboutSection() {
  const t = await getTranslations('HomePage');

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-brand-navy-light rounded-lg p-6 lg:p-8">
          <p className="text-base text-brand-white leading-relaxed">
            {t('about')}
          </p>
        </div>
      </div>
    </section>
  );
}
