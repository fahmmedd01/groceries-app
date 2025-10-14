import { formatPrice, formatDate } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(10.99)).toBe('$10.99');
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(0.99)).toBe('$0.99');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan/);
      expect(formatted).toMatch(/1[45]/); // Accept either 14 or 15 due to timezone
      expect(formatted).toMatch(/2024/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });
});

