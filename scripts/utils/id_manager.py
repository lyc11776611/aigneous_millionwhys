#!/usr/bin/env python3
"""
ID Manager - Automatically assigns next available question IDs

This utility scans existing JSON files and determines the next available
ID for each category to prevent conflicts.
"""

import json
from pathlib import Path
from typing import Dict, Optional


class IDManager:
    """Manages automatic ID assignment for questions"""

    # Category name to prefix mapping
    CATEGORY_PREFIXES = {
        'Animals': 'anim',
        'Astronomy': 'astro',
        'Chemistry': 'chem',
        'Economics': 'econ',
        'Human Biology': 'bio',
        'Physics': 'phys',
        'Plants': 'plant',
        'Psychology': 'psych',
        'Technology': 'tech',
        'Weather': 'weather',
        'Food & Nutrition': 'food',
        'Earth Science': 'earth',
        'Marine Life': 'marine',
        'Insects': 'insect',
        'Household Science': 'house',
        'Sports & Exercise': 'sport',
        'Health & Medicine': 'health',
        'Music & Sound': 'music',
        'Transportation': 'transport',
    }

    # Category name to filename mapping
    CATEGORY_FILES = {
        'Animals': 'animals.json',
        'Astronomy': 'astronomy.json',
        'Chemistry': 'chemistry.json',
        'Economics': 'economics.json',
        'Human Biology': 'human-biology.json',
        'Physics': 'physics.json',
        'Plants': 'plants.json',
        'Psychology': 'psychology.json',
        'Technology': 'technology.json',
        'Weather': 'weather.json',
        'Food & Nutrition': 'food-nutrition.json',
        'Earth Science': 'earth-science.json',
        'Marine Life': 'marine-life.json',
        'Insects': 'insects.json',
        'Household Science': 'household-science.json',
        'Sports & Exercise': 'sports-exercise.json',
        'Health & Medicine': 'health-medicine.json',
        'Music & Sound': 'music-sound.json',
        'Transportation': 'transportation.json',
    }

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize ID Manager

        Args:
            data_dir: Path to questions directory. If None, uses default.
        """
        if data_dir is None:
            # Default to src/data/questions from project root
            self.data_dir = Path(__file__).parent.parent.parent / 'src' / 'data' / 'questions'
        else:
            self.data_dir = Path(data_dir)

        if not self.data_dir.exists():
            raise ValueError(f"Data directory not found: {self.data_dir}")

    def get_next_id(self, category: str) -> str:
        """
        Get the next available ID for a category

        Args:
            category: Category name (e.g., "Animals", "Chemistry")

        Returns:
            Next available ID (e.g., "anim_021")

        Raises:
            ValueError: If category is not recognized
        """
        if category not in self.CATEGORY_PREFIXES:
            raise ValueError(f"Unknown category: {category}. Valid categories: {list(self.CATEGORY_PREFIXES.keys())}")

        prefix = self.CATEGORY_PREFIXES[category]
        json_file = self._get_category_file(category)

        # If file doesn't exist, start with 001
        if not json_file.exists():
            return f"{prefix}_001"

        # Read existing questions
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            questions = data.get('questions', [])

        # If no questions, start with 001
        if not questions:
            return f"{prefix}_001"

        # Find highest number
        max_num = 0
        for q in questions:
            q_id = q.get('id', '')
            if q_id.startswith(prefix):
                try:
                    num = int(q_id.split('_')[1])
                    max_num = max(max_num, num)
                except (IndexError, ValueError):
                    continue

        # Return next number
        return f"{prefix}_{max_num + 1:03d}"

    def get_next_n_ids(self, category: str, count: int) -> list[str]:
        """
        Get the next N available IDs for a category

        Args:
            category: Category name
            count: Number of IDs needed

        Returns:
            List of IDs (e.g., ["anim_021", "anim_022", "anim_023"])
        """
        first_id = self.get_next_id(category)
        prefix = self.CATEGORY_PREFIXES[category]

        # Extract number from first ID
        num = int(first_id.split('_')[1])

        # Generate sequence
        return [f"{prefix}_{num + i:03d}" for i in range(count)]

    def _get_category_file(self, category: str) -> Path:
        """Get the JSON file path for a category"""
        if category not in self.CATEGORY_FILES:
            raise ValueError(f"Unknown category: {category}")

        return self.data_dir / self.CATEGORY_FILES[category]

    def get_all_categories(self) -> list[str]:
        """Get list of all supported categories"""
        return list(self.CATEGORY_PREFIXES.keys())

    def validate_category(self, category: str) -> bool:
        """Check if category is valid"""
        return category in self.CATEGORY_PREFIXES

    def get_category_info(self, category: str) -> Dict:
        """
        Get information about a category

        Returns:
            Dict with prefix, filename, next_id, question_count
        """
        if not self.validate_category(category):
            raise ValueError(f"Unknown category: {category}")

        prefix = self.CATEGORY_PREFIXES[category]
        filename = self.CATEGORY_FILES[category]
        filepath = self._get_category_file(category)

        # Count existing questions
        question_count = 0
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                question_count = len(data.get('questions', []))

        return {
            'category': category,
            'prefix': prefix,
            'filename': filename,
            'filepath': str(filepath),
            'exists': filepath.exists(),
            'question_count': question_count,
            'next_id': self.get_next_id(category)
        }


# CLI for testing
if __name__ == '__main__':
    import sys

    manager = IDManager()

    if len(sys.argv) > 1:
        category = sys.argv[1]
        try:
            info = manager.get_category_info(category)
            print(f"Category: {info['category']}")
            print(f"Prefix: {info['prefix']}")
            print(f"File: {info['filename']}")
            print(f"Exists: {info['exists']}")
            print(f"Questions: {info['question_count']}")
            print(f"Next ID: {info['next_id']}")

            if len(sys.argv) > 2:
                count = int(sys.argv[2])
                ids = manager.get_next_n_ids(category, count)
                print(f"\nNext {count} IDs:")
                for i, qid in enumerate(ids, 1):
                    print(f"  {i}. {qid}")
        except ValueError as e:
            print(f"Error: {e}")
            sys.exit(1)
    else:
        print("All Categories:")
        for cat in manager.get_all_categories():
            info = manager.get_category_info(cat)
            print(f"  {cat:20} → {info['next_id']:12} ({info['question_count']} questions)")
