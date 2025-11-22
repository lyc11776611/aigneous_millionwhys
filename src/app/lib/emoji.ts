
// Emoji mapping based on English category keywords
// Note: Always pass English category to this function for consistent matching
export const categoryEmojis: { [key: string]: string } = {
    'animal': '🐾',
    'astronomy': '🌌',
    'chemistry': '⚗️',
    'economics': '💰',
    'biology': '🧬',
    'physics': '⚛️',
    'plant': '🌱',
    'psychology': '🧠',
    'technology': '💻',
    'weather': '🌤️',
};

export function getCategoryEmoji(category: string, question: string): string {
    if (!category) return '❓';

    const lowerCategory = category.toLowerCase();
    for (const [keyword, emoji] of Object.entries(categoryEmojis)) {
        if (lowerCategory.includes(keyword)) {
            return emoji;
        }
    }

    // Fallback to question-based emoji
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('cat') || lowerQuestion.includes('purr')) return '🐱';
    if (lowerQuestion.includes('dog') || lowerQuestion.includes('wag')) return '🐶';
    if (lowerQuestion.includes('bird') || lowerQuestion.includes('migrate')) return '🐦';

    return '❓';
}
