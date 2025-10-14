import { GroceryItem, RetailerProduct, Retailer } from '../types';
import { searchProductsByName, getAllProducts } from '../mock-data/products';

interface MatchScore {
  product: RetailerProduct;
  score: number;
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple string matching algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Word overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word)).length;
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords / totalWords * 0.6;
}

/**
 * Match a grocery item to retailer products
 * Returns top matches sorted by relevance
 */
export function matchGroceryItem(
  item: GroceryItem,
  maxResults: number = 5
): RetailerProduct[] {
  // First, try to find exact product match
  const mockProduct = searchProductsByName(item.name);
  
  if (mockProduct) {
    // Filter by brand if specified
    let matches = mockProduct.variants;
    
    if (item.brand) {
      const brandMatches = matches.filter(variant => 
        variant.brand.toLowerCase().includes(item.brand!.toLowerCase())
      );
      if (brandMatches.length > 0) {
        matches = brandMatches;
      }
    }
    
    // Filter by size if specified (soft match)
    if (item.size) {
      const sizeMatches = matches.filter(variant => 
        variant.size.toLowerCase().includes(item.size!.toLowerCase()) ||
        item.size!.toLowerCase().includes(variant.size.toLowerCase())
      );
      if (sizeMatches.length > 0) {
        matches = sizeMatches;
      }
    }
    
    // Sort by price (ascending)
    return matches.sort((a, b) => a.price - b.price).slice(0, maxResults);
  }
  
  // Fallback: fuzzy search across all products
  const allProducts = getAllProducts();
  const scoredMatches: MatchScore[] = allProducts.map(product => ({
    product,
    score: calculateSimilarity(item.name, product.title),
  }));
  
  // Filter matches with score > 0.3 and sort by score
  const filteredMatches = scoredMatches
    .filter(match => match.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  return filteredMatches.map(match => match.product);
}

/**
 * Match multiple grocery items to retailer products
 */
export function matchGroceryList(
  items: GroceryItem[]
): Map<string, RetailerProduct[]> {
  const matchMap = new Map<string, RetailerProduct[]>();
  
  items.forEach(item => {
    const matches = matchGroceryItem(item);
    matchMap.set(item.name, matches);
  });
  
  return matchMap;
}

/**
 * Get best price match for each item
 */
export function getBestPriceMatches(
  items: GroceryItem[]
): Map<string, RetailerProduct> {
  const bestPriceMap = new Map<string, RetailerProduct>();
  
  items.forEach(item => {
    const matches = matchGroceryItem(item, 10);
    if (matches.length > 0) {
      // Find cheapest match considering quantity
      const bestMatch = matches.reduce((best, current) => {
        return current.price < best.price ? current : best;
      });
      bestPriceMap.set(item.name, bestMatch);
    }
  });
  
  return bestPriceMap;
}

/**
 * Group matches by retailer
 */
export function groupMatchesByRetailer(
  matchMap: Map<string, RetailerProduct[]>
): Map<Retailer, RetailerProduct[]> {
  const retailerMap = new Map<Retailer, RetailerProduct[]>();
  
  matchMap.forEach(matches => {
    matches.forEach(match => {
      const existing = retailerMap.get(match.retailer) || [];
      retailerMap.set(match.retailer, [...existing, match]);
    });
  });
  
  return retailerMap;
}

/**
 * Calculate total price for a list of products
 */
export function calculateTotalPrice(products: RetailerProduct[]): number {
  return products.reduce((sum, product) => sum + product.price, 0);
}

/**
 * Find the cheapest retailer combination for a grocery list
 */
export function findBestRetailerCombination(
  items: GroceryItem[]
): {
  retailer: Retailer;
  products: RetailerProduct[];
  totalPrice: number;
}[] {
  const matchMap = matchGroceryList(items);
  const retailers: Retailer[] = ['walmart', 'walgreens', 'marianos', 'costco', 'samsclub'];
  
  const retailerOptions = retailers.map(retailer => {
    const products: RetailerProduct[] = [];
    let totalPrice = 0;
    
    matchMap.forEach((matches) => {
      const retailerMatch = matches.find(m => m.retailer === retailer);
      if (retailerMatch) {
        products.push(retailerMatch);
        totalPrice += retailerMatch.price;
      }
    });
    
    return { retailer, products, totalPrice };
  });
  
  // Sort by total price (ascending)
  return retailerOptions
    .filter(option => option.products.length > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);
}

