import Anthropic from '@anthropic-ai/sdk';
import { GroceryItem, ParsedGroceryList } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const PARSING_PROMPT = `You are a grocery list parser. Your job is to extract structured grocery items from natural language input.

Extract the following for each item:
- name: The grocery item name (lowercase, singular form)
- quantity: How many items (default: 1)
- unit: The unit of measurement (e.g., "carton", "bottle", "lb", "oz") if mentioned
- brand: The brand name if mentioned (null otherwise)
- size: The size or packaging info if mentioned (e.g., "dozen", "gallon", "12 oz")
- notes: Array of special requirements (e.g., ["organic"], ["unsalted"], ["low-fat"])
- retailer: The store name if mentioned using words like "from", "at", "get at", "buy at" (null otherwise, lowercase)

Common retailers: walmart, target, kroger, costco, sams club, bjs, cvs, walgreens, rite aid, whole foods, trader joes, aldi, publix, safeway, albertsons, heb, meijer, wegmans, giant eagle, food lion, stop and shop, marianos, harris teeter, shoprite, ralphs, fred meyer, sprouts, fresh thyme, etc.

Examples:
Input: "eggs from walmart and milk from costco"
Output: {
  "items": [
    {"name": "eggs", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": [], "retailer": "walmart"},
    {"name": "milk", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": [], "retailer": "costco"}
  ]
}

Input: "2 gallons of milk at target and bananas"
Output: {
  "items": [
    {"name": "milk", "quantity": 2, "unit": "gallon", "brand": null, "size": "gallon", "notes": [], "retailer": "target"},
    {"name": "bananas", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": [], "retailer": null}
  ]
}

Input: "organic eggs from whole foods, bread at trader joes, and butter"
Output: {
  "items": [
    {"name": "eggs", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": ["organic"], "retailer": "wholefoods"},
    {"name": "bread", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": [], "retailer": "traderjoes"},
    {"name": "butter", "quantity": 1, "unit": null, "brand": null, "size": null, "notes": [], "retailer": null}
  ]
}

Now parse this grocery input and respond with ONLY valid JSON (no markdown, no explanation):`;

const REFINEMENT_PROMPT = `You are helping refine an existing grocery list based on user commands.

The user will provide:
1. Current list items (JSON array)
2. A refinement command (e.g., "make the eggs organic", "add 2 more milk", "remove Tide")

You should:
- For "make X [attribute]": Update the matching item's notes or properties
- For "add X": Append new items to the list
- For "remove X": Remove matching items from the list
- For quantity changes: Update the quantity field

Respond with the complete updated list as valid JSON (no markdown, no explanation).`;

/**
 * Parse natural language grocery input into structured items
 */
export async function parseGroceryInput(input: string): Promise<ParsedGroceryList> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${PARSING_PROMPT}\n\nInput: "${input}"`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Clean up response (remove markdown code blocks if present)
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText) as ParsedGroceryList;
    
    // Validate structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error('Invalid response structure from Claude');
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing grocery input:', error);
    throw new Error('Failed to parse grocery input. Please try again.');
  }
}

/**
 * Refine existing grocery list based on voice command
 */
export async function refineGroceryList(
  currentItems: GroceryItem[],
  command: string
): Promise<GroceryItem[]> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${REFINEMENT_PROMPT}\n\nCurrent list:\n${JSON.stringify(currentItems, null, 2)}\n\nCommand: "${command}"\n\nProvide the updated list as JSON:`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Clean up response
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsed: { items?: GroceryItem[] } | GroceryItem[];
    
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      throw new Error('Invalid JSON response from Claude');
    }

    // Handle both array and object responses
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    
    if (!items || !Array.isArray(items)) {
      throw new Error('Invalid response structure from Claude');
    }

    return items;
  } catch (error) {
    console.error('Error refining grocery list:', error);
    throw new Error('Failed to refine grocery list. Please try again.');
  }
}

/**
 * Extract quantity from text (helper for voice refinement)
 */
export function extractQuantity(text: string): { quantity: number; remainingText: string } {
  const quantityMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+/i);
  
  if (!quantityMatch) {
    return { quantity: 1, remainingText: text };
  }
  
  const quantityText = quantityMatch[1].toLowerCase();
  const wordToNumber: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  
  const quantity = wordToNumber[quantityText] || parseInt(quantityText, 10);
  const remainingText = text.replace(quantityMatch[0], '').trim();
  
  return { quantity, remainingText };
}

