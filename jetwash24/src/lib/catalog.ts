import type { Service } from '@/types/database';

export const SLUG_CATEGORY: Record<string, 'interior' | 'exterior' | 'pacotes'> = {};

export const PACKAGE_COMPONENTS: Record<string, string[]> = {};

export function calculatePrice(service: Pick<Service, 'base_price'>, surcharge: number): number {
  throw new Error('Not implemented');
}

export function calculateSavings(
  packageSlug: string,
  allServices: Pick<Service, 'slug' | 'base_price'>[],
  surcharge: number
): number {
  throw new Error('Not implemented');
}
