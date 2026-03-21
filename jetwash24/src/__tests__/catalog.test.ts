import { describe, it, expect } from 'vitest';
import {
  calculatePrice,
  calculateSavings,
  SLUG_CATEGORY,
  PACKAGE_COMPONENTS,
} from '@/lib/catalog';

const MOCK_SERVICES = [
  { slug: 'interior-express', base_price: 15 },
  { slug: 'exterior-express', base_price: 15 },
  { slug: 'exterior-premium', base_price: 30 },
  { slug: 'exterior-interior', base_price: 25 },
  { slug: 'interior-premium', base_price: 75 },
  { slug: 'full-detailing', base_price: 110 },
];

describe('calculatePrice', () => {
  it('returns base_price when surcharge is 0', () => {
    expect(calculatePrice({ base_price: 15 }, 0)).toBe(15);
  });

  it('returns base_price + surcharge when surcharge is 5', () => {
    expect(calculatePrice({ base_price: 15 }, 5)).toBe(20);
  });

  it('returns base_price + surcharge for higher values', () => {
    expect(calculatePrice({ base_price: 110 }, 15)).toBe(125);
  });

  it('handles surcharge of 10', () => {
    expect(calculatePrice({ base_price: 30 }, 10)).toBe(40);
  });
});

describe('calculateSavings', () => {
  it('returns 5 for exterior-interior with surcharge 0', () => {
    // exterior-express(15) + interior-express(15) = 30, bundle=25, saving=5
    expect(calculateSavings('exterior-interior', MOCK_SERVICES, 0)).toBe(5);
  });

  it('returns 10 for exterior-interior with surcharge 5', () => {
    // (15+5)+(15+5)=40, bundle=(25+5)=30, saving=10
    expect(calculateSavings('exterior-interior', MOCK_SERVICES, 5)).toBe(10);
  });

  it('returns 0 for full-detailing with surcharge 0 (negative clamped)', () => {
    // exterior-premium(30)+interior-premium(75)=105, bundle=110, saving=-5 -> 0
    expect(calculateSavings('full-detailing', MOCK_SERVICES, 0)).toBe(0);
  });

  it('returns 5 for full-detailing with surcharge 10', () => {
    // (30+10)+(75+10)=125, bundle=(110+10)=120, saving=5
    expect(calculateSavings('full-detailing', MOCK_SERVICES, 10)).toBe(5);
  });

  it('returns 0 for nonexistent package slug', () => {
    expect(calculateSavings('nonexistent', MOCK_SERVICES, 0)).toBe(0);
  });
});

describe('SLUG_CATEGORY', () => {
  it('maps interior-express to interior', () => {
    expect(SLUG_CATEGORY['interior-express']).toBe('interior');
  });

  it('maps interior-premium to interior', () => {
    expect(SLUG_CATEGORY['interior-premium']).toBe('interior');
  });

  it('maps exterior-express to exterior', () => {
    expect(SLUG_CATEGORY['exterior-express']).toBe('exterior');
  });

  it('maps exterior-premium to exterior', () => {
    expect(SLUG_CATEGORY['exterior-premium']).toBe('exterior');
  });

  it('maps exterior-interior to pacotes', () => {
    expect(SLUG_CATEGORY['exterior-interior']).toBe('pacotes');
  });

  it('maps full-detailing to pacotes', () => {
    expect(SLUG_CATEGORY['full-detailing']).toBe('pacotes');
  });
});

describe('PACKAGE_COMPONENTS', () => {
  it('returns correct components for exterior-interior', () => {
    expect(PACKAGE_COMPONENTS['exterior-interior']).toEqual(['exterior-express', 'interior-express']);
  });

  it('returns correct components for full-detailing', () => {
    expect(PACKAGE_COMPONENTS['full-detailing']).toEqual(['exterior-premium', 'interior-premium']);
  });
});
