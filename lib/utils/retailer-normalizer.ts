/**
 * Normalize retailer names from natural language to our standard IDs
 * Handles variations, spaces, apostrophes, etc.
 */
export function normalizeRetailerName(retailerInput: string | null | undefined): string | null {
  if (!retailerInput) return null;
  
  // Convert to lowercase and remove extra spaces
  const normalized = retailerInput.toLowerCase().trim().replace(/\s+/g, '');
  
  // Map common variations to our standard IDs
  const retailerMap: Record<string, string> = {
    // Warehouse Clubs
    'costco': 'costco',
    'samsclub': 'samsclub',
    'sam\'sclub': 'samsclub',
    'sams': 'samsclub',
    'bjs': 'bjs',
    'bj\'s': 'bjs',
    'bjswholesale': 'bjs',
    
    // Supermarkets
    'walmart': 'walmart',
    'target': 'target',
    'kroger': 'kroger',
    'krogers': 'kroger',
    'publix': 'publix',
    'safeway': 'safeway',
    'albertsons': 'albertsons',
    'albertson\'s': 'albertsons',
    'heb': 'heb',
    'h-e-b': 'heb',
    'meijer': 'meijer',
    'meijers': 'meijer',
    'wegmans': 'wegmans',
    'wegman\'s': 'wegmans',
    'gianteagle': 'gianteagle',
    'foodlion': 'foodlion',
    'stopandshop': 'stopandshop',
    'stop&shop': 'stopandshop',
    'giantfood': 'giantfood',
    'giant': 'giantfood',
    'marianos': 'marianos',
    'mariano\'s': 'marianos',
    'harristeeter': 'harristeeter',
    'harris-teeter': 'harristeeter',
    'shoprite': 'shoprite',
    'ralphs': 'ralphs',
    'ralph\'s': 'ralphs',
    'fredmeyer': 'fredmeyer',
    'fred-meyer': 'fredmeyer',
    'qfc': 'qfc',
    'kingsoopers': 'kingsoopers',
    'king-soopers': 'kingsoopers',
    'smiths': 'smiths',
    'smith\'s': 'smiths',
    'frys': 'frys',
    'fry\'s': 'frys',
    'dillons': 'dillons',
    'dillon\'s': 'dillons',
    'marketbasket': 'marketbasket',
    'market-basket': 'marketbasket',
    'wincofoods': 'wincofoods',
    'winco': 'wincofoods',
    'lidl': 'lidl',
    
    // Specialty Grocers
    'wholefoods': 'wholefoods',
    'whole-foods': 'wholefoods',
    'wholefoodsmarket': 'wholefoods',
    'traderjoes': 'traderjoes',
    'trader-joes': 'traderjoes',
    'traderjoe\'s': 'traderjoes',
    'tj\'s': 'traderjoes',
    'tjs': 'traderjoes',
    'aldi': 'aldi',
    'sprouts': 'sprouts',
    'sproutsfarmersmarket': 'sprouts',
    'freshthyme': 'freshthyme',
    'fresh-thyme': 'freshthyme',
    
    // Pharmacies
    'cvs': 'cvs',
    'cvspharmacy': 'cvs',
    'walgreens': 'walgreens',
    'walgreen\'s': 'walgreens',
    'riteaid': 'riteaid',
    'rite-aid': 'riteaid',
    'duanereade': 'duanereade',
    'duane-reade': 'duanereade',
  };
  
  // Check if we have a direct match
  if (retailerMap[normalized]) {
    return retailerMap[normalized];
  }
  
  // Try with spaces removed from input
  const withoutSpaces = retailerInput.toLowerCase().replace(/[\s\-']/g, '');
  if (retailerMap[withoutSpaces]) {
    return retailerMap[withoutSpaces];
  }
  
  // If no match found, return the normalized version (will be treated as 'other')
  return normalized || null;
}

/**
 * Validate if a retailer ID is in our known list
 */
export function isKnownRetailer(retailerId: string | null | undefined): boolean {
  if (!retailerId) return false;
  
  const knownRetailers = [
    'costco', 'samsclub', 'bjs',
    'walmart', 'target', 'kroger', 'publix', 'safeway', 'albertsons',
    'heb', 'meijer', 'wegmans', 'gianteagle', 'foodlion', 'stopandshop',
    'giantfood', 'marianos', 'harristeeter', 'shoprite', 'ralphs',
    'fredmeyer', 'qfc', 'kingsoopers', 'smiths', 'frys', 'dillons',
    'marketbasket', 'wincofoods', 'lidl',
    'wholefoods', 'traderjoes', 'aldi', 'sprouts', 'freshthyme',
    'cvs', 'walgreens', 'riteaid', 'duanereade',
    'other',
  ];
  
  return knownRetailers.includes(retailerId.toLowerCase());
}



