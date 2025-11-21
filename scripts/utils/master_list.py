#!/usr/bin/env python3
"""
Master List Updater - Automatically updates ALL_QUESTIONS_MASTER_LIST.md

Updates the master list with new questions to maintain single source of truth.
"""

import re
from pathlib import Path
from typing import List, Dict, Optional


class MasterListUpdater:
    """Updates ALL_QUESTIONS_MASTER_LIST.md with new questions"""

    def __init__(self, master_list_path: Optional[Path] = None):
        """
        Initialize master list updater

        Args:
            master_list_path: Path to master list file. If None, uses default.
        """
        if master_list_path is None:
            project_root = Path(__file__).parent.parent.parent
            self.master_list_path = project_root / 'ALL_QUESTIONS_MASTER_LIST.md'
        else:
            self.master_list_path = Path(master_list_path)

        if not self.master_list_path.exists():
            raise ValueError(f"Master list not found: {self.master_list_path}")

    def add_questions(self, category: str, questions: List[Dict], dry_run: bool = False) -> int:
        """
        Add new questions to the master list

        Args:
            category: Category name
            questions: List of question dicts (with 'id' and 'question_en')
            dry_run: If True, don't write changes

        Returns:
            Number of questions added

        Raises:
            ValueError: If category not found in master list
        """
        # Read current content
        with open(self.master_list_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Find the category section (format: ## Category Name (count))
        category_line_idx = None

        for i, line in enumerate(lines):
            # Match "## Category" or "## Category (count)" format
            if line.startswith('## ') and category in line:
                category_line_idx = i
                break

        if category_line_idx is None:
            raise ValueError(f"Category '{category}' not found in master list")

        # Find where to insert (after the last question in this category)
        insert_idx = None
        current_idx = category_line_idx + 1

        # Skip until we find the "New (N):" section or end of category
        while current_idx < len(lines):
            line = lines[current_idx]

            # Check if we've hit the next category
            if line.startswith('## ') and category not in line:
                # Insert before the separator
                insert_idx = current_idx - 2
                break

            # Check for end of questions (summary section or end of file)
            if line.startswith('## Summary') or current_idx == len(lines) - 1:
                insert_idx = current_idx - 2
                break

            # Check if this is a question line
            if re.match(r'^\d+\.', line):
                last_question_idx = current_idx

            current_idx += 1

        if insert_idx is None:
            # Use last question position + 1
            try:
                insert_idx = last_question_idx + 1
            except:
                raise ValueError(f"Could not find insertion point for category '{category}'")

        # Get current highest number in the file
        highest_num = 0
        for line in lines:
            match = re.match(r'^(\d+)\.', line)
            if match:
                num = int(match.group(1))
                highest_num = max(highest_num, num)

        # Prepare new question lines
        new_lines = []
        next_num = highest_num + 1

        for question in questions:
            q_id = question['id']
            q_text = question['question_en']
            q_file = self._get_category_filename(category)

            line = f"{next_num}. {q_text} | {category} | ✅ Complete | {q_file} | {q_id}\n"
            new_lines.append(line)
            next_num += 1

        if dry_run:
            print("DRY RUN - Would add these lines:")
            for line in new_lines:
                print(f"  {line.rstrip()}")
            return len(new_lines)

        # Insert new lines
        lines[insert_idx:insert_idx] = new_lines

        # Write back
        with open(self.master_list_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        print(f"✅ Added {len(new_lines)} questions to master list")
        return len(new_lines)

    def update_totals(self, dry_run: bool = False) -> bool:
        """
        Update the total counts in the master list header and summary

        Args:
            dry_run: If True, don't write changes

        Returns:
            True if updates were made
        """
        # Read current content
        with open(self.master_list_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Count total questions
        question_pattern = r'^\d+\.\s+.+\|.+\|.+\|.+\|.+$'
        total_questions = len(re.findall(question_pattern, content, re.MULTILINE))

        if dry_run:
            print(f"DRY RUN - Would update total to: {total_questions}")
            return False

        # Update header
        content = re.sub(
            r'# Master Question List - All \d+ Questions',
            f'# Master Question List - All {total_questions} Questions',
            content
        )

        content = re.sub(
            r'\*\*Total Questions\*\*: \d+',
            f'**Total Questions**: {total_questions}',
            content
        )

        # Write back
        with open(self.master_list_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Updated master list totals to {total_questions}")
        return True

    def _get_category_filename(self, category: str) -> str:
        """Get the JSON filename for a category"""
        filename_map = {
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
        return filename_map.get(category, f"{category.lower().replace(' ', '-')}.json")


# CLI for testing
if __name__ == '__main__':
    updater = MasterListUpdater()

    # Test with dummy questions
    test_questions = [
        {
            'id': 'test_001',
            'question_en': 'Test question 1?'
        },
        {
            'id': 'test_002',
            'question_en': 'Test question 2?'
        }
    ]

    print("Testing master list updater (dry run)...")
    updater.add_questions('Animals', test_questions, dry_run=True)
    updater.update_totals(dry_run=True)
