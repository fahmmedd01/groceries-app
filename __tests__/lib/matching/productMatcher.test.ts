import { matchGroceryItem, getBestPriceMatches, calculateTotalPrice } from '@/lib/matching/productMatcher';
import { GroceryItem } from '@/lib/types';

describe('Product Matcher', () => {
  describe('matchGroceryItem', () => {
    it('should match exact product name', () => {
      const item: GroceryItem = {
        name: 'eggs',
        quantity: 2,
      };

      const matches = matchGroceryItem(item);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].title.toLowerCase()).toContain('egg');
    });

    it('should filter by brand when specified', () => {
      const item: GroceryItem = {
        name: 'eggs',
        quantity: 2,
        brand: 'Kirkland',
      };

      const matches = matchGroceryItem(item);
      const hasKirkland = matches.some(m => m.brand === 'Kirkland');
      expect(hasKirkland).toBe(true);
    });

    it('should return multiple retailer options', () => {
      const item: GroceryItem = {
        name: 'milk',
        quantity: 1,
      };

      const matches = matchGroceryItem(item, 10);
      expect(matches.length).toBeGreaterThan(1);
      
      const uniqueRetailers = new Set(matches.map(m => m.retailer));
      expect(uniqueRetailers.size).toBeGreaterThan(1);
    });
  });

  describe('getBestPriceMatches', () => {
    it('should return cheapest option for each item', () => {
      const items: GroceryItem[] = [
        { name: 'eggs', quantity: 2 },
        { name: 'milk', quantity: 1 },
      ];

      const bestPrices = getBestPriceMatches(items);
      expect(bestPrices.size).toBe(2);

      const eggsMatch = bestPrices.get('eggs');
      expect(eggsMatch).toBeDefined();
      expect(eggsMatch!.price).toBeGreaterThan(0);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total correctly', () => {
      const item: GroceryItem = {
        name: 'eggs',
        quantity: 2,
      };

      const matches = matchGroceryItem(item, 3);
      const total = calculateTotalPrice(matches);
      
      expect(total).toBeGreaterThan(0);
      expect(typeof total).toBe('number');
    });
  });
});

