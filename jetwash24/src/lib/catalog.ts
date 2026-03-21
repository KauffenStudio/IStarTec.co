import type { Service } from '@/types/database';

export const SLUG_CATEGORY: Record<string, 'interior' | 'exterior' | 'pacotes'> = {
  'interior-express': 'interior',
  'interior-premium': 'interior',
  'exterior-express': 'exterior',
  'exterior-premium': 'exterior',
  'exterior-interior': 'pacotes',
  'full-detailing': 'pacotes',
};

export const PACKAGE_COMPONENTS: Record<string, string[]> = {
  'exterior-interior': ['exterior-express', 'interior-express'],
  'full-detailing': ['exterior-premium', 'interior-premium'],
};

export function calculatePrice(service: Pick<Service, 'base_price'>, surcharge: number): number {
  return service.base_price + surcharge;
}

export function calculateSavings(
  packageSlug: string,
  allServices: Pick<Service, 'slug' | 'base_price'>[],
  surcharge: number
): number {
  const componentSlugs = PACKAGE_COMPONENTS[packageSlug];
  if (!componentSlugs) return 0;
  const individualTotal = componentSlugs.reduce((sum, slug) => {
    const svc = allServices.find(s => s.slug === slug);
    return sum + (svc ? svc.base_price + surcharge : 0);
  }, 0);
  const bundlePrice = allServices.find(s => s.slug === packageSlug)?.base_price ?? 0;
  const saving = individualTotal - (bundlePrice + surcharge);
  return Math.max(0, Math.round(saving));
}
