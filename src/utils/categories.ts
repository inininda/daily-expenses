export const CATEGORY_LIST = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'health',
  'bills',
  'education',
  'other',
];

const COLORS: Record<string, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#ec4899',
  entertainment: '#a855f7',
  health: '#22c55e',
  bills: '#ef4444',
  education: '#f59e0b',
  other: '#6b7280',
};

const EMOJIS: Record<string, string> = {
  food: '🍔',
  transport: '🚌',
  shopping: '🛍️',
  entertainment: '🎬',
  health: '💊',
  bills: '📄',
  education: '📚',
  other: '📌',
};

export function getCategoryColor(category: string): string {
  return COLORS[category.toLowerCase()] ?? '#6b7280';
}

export function getCategoryEmoji(category: string): string {
  return EMOJIS[category.toLowerCase()] ?? '💰';
}
