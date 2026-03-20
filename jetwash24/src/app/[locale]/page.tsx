import {getTranslations} from 'next-intl/server';
import {setRequestLocale} from 'next-intl/server';

type Props = {params: Promise<{locale: string}>};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-brand-cyan mb-4">{t('title')}</h1>
      <p className="text-xl text-brand-white/80 mb-8">{t('subtitle')}</p>
      <button className="bg-brand-cyan text-brand-navy font-semibold px-8 py-3 rounded-lg hover:bg-brand-cyan-dark transition-colors">
        {t('cta')}
      </button>
    </main>
  );
}
