#!/usr/bin/env python3
"""
Automated Question Management Tool

Add questions to the curious-minds skill with automatic:
- ID assignment
- Bilingual content generation (AI-powered)
- Character limit validation
- Scientific fact checking
- Master list updates

Usage:
    # Add questions from YAML draft
    python scripts/add_questions.py --draft questions/drafts/new_animals.yaml

    # Create new category
    python scripts/add_questions.py --new-category "Marine Biology" --name-zh "海洋生物学"

    # Dry run (preview without writing)
    python scripts/add_questions.py --draft new.yaml --dry-run

    # Skip AI generation (manual content only)
    python scripts/add_questions.py --draft new.yaml --no-ai
"""

import argparse
import json
import sys
import yaml
from pathlib import Path
from typing import List, Dict

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from question_builder_v3 import QuestionBuilderV3 as QuestionBuilder, QuestionDraft
from utils.id_manager import IDManager
from utils.validation import ValidationRunner
from utils.master_list import MasterListUpdater


def main():
    parser = argparse.ArgumentParser(
        description='Automated Question Management for curious-minds',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Add questions from draft
  python scripts/add_questions.py --draft questions/drafts/animals.yaml

  # Create new category
  python scripts/add_questions.py --new-category "Marine Biology" --name-zh "海洋生物学"

  # Preview without writing
  python scripts/add_questions.py --draft new.yaml --dry-run

For more info: docs/AUTOMATION_GUIDE.md
        '''
    )

    parser.add_argument(
        '--draft',
        help='YAML file with question drafts',
        type=str
    )

    parser.add_argument(
        '--new-category',
        help='Create a new category',
        type=str
    )

    parser.add_argument(
        '--name-zh',
        help='Chinese name for new category',
        type=str
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview without writing files'
    )

    parser.add_argument(
        '--no-ai',
        action='store_true',
        help='Skip AI generation (manual content only)'
    )

    parser.add_argument(
        '--skip-validation',
        action='store_true',
        help='Skip validation (not recommended)'
    )

    parser.add_argument(
        '--update-master-list',
        action='store_true',
        help='Only update master list totals'
    )

    args = parser.parse_args()

    # Handle different commands
    if args.update_master_list:
        update_master_list_only(args.dry_run)
    elif args.draft:
        add_questions_from_draft(
            args.draft,
            dry_run=args.dry_run,
            use_ai=not args.no_ai,
            skip_validation=args.skip_validation
        )
    elif args.new_category:
        create_category(args.new_category, args.name_zh, args.dry_run)
    else:
        parser.print_help()
        sys.exit(1)


def add_questions_from_draft(
    draft_file: str,
    dry_run: bool = False,
    use_ai: bool = True,
    skip_validation: bool = False
):
    """Add questions from YAML draft file"""

    print(f"\n📖 Reading draft: {draft_file}")
    print("=" * 60)

    # Load draft file
    try:
        with open(draft_file, 'r', encoding='utf-8') as f:
            draft_data = yaml.safe_load(f)
    except Exception as e:
        print(f"❌ Error reading draft file: {e}")
        sys.exit(1)

    # Validate draft structure
    if 'category' not in draft_data or 'questions' not in draft_data:
        print("❌ Invalid draft format. Must have 'category' and 'questions' fields.")
        print("   See questions/drafts/template.yaml for example")
        sys.exit(1)

    category = draft_data['category']
    question_drafts = draft_data['questions']

    print(f"📝 Category: {category}")
    print(f"📊 Questions to add: {len(question_drafts)}")

    # Initialize tools
    try:
        # New workflow: DeepSeek for translation only
        # Fact-checking done by Claude Code in conversation
        builder = QuestionBuilder(use_deepseek=use_ai)
        id_manager = IDManager()
        validator = ValidationRunner()
        master_list = MasterListUpdater()
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        if "DEEPSEEK_API_KEY" in str(e):
            print("\n💡 Tip: Set DEEPSEEK_API_KEY environment variable for Chinese translation")
            print("   Or use --no-ai flag to skip AI translation")
        sys.exit(1)

    # Validate category
    if not id_manager.validate_category(category):
        print(f"❌ Unknown category: {category}")
        print(f"   Valid categories: {', '.join(id_manager.get_all_categories())}")
        sys.exit(1)

    # Get category info
    cat_info = id_manager.get_category_info(category)
    print(f"📂 File: {cat_info['filename']}")
    print(f"🔢 Current questions: {cat_info['question_count']}")
    print(f"🆔 Next ID: {cat_info['next_id']}")

    # Build complete questions
    print(f"\n🔨 Building questions...")
    print("-" * 60)

    completed_questions = []
    question_ids = id_manager.get_next_n_ids(category, len(question_drafts))

    for i, (draft_dict, q_id) in enumerate(zip(question_drafts, question_ids), 1):
        try:
            # Create draft object
            draft = QuestionDraft(**draft_dict)

            print(f"\n[{i}/{len(question_drafts)}] {draft.question_en}")
            print(f"    ID: {q_id} | Difficulty: {draft.difficulty}")

            # Complete the question with new workflow
            if use_ai:
                print(f"    🤖 Processing with DeepSeek translation...")
            question = builder.complete_question(draft, category)
            question['id'] = q_id

            completed_questions.append(question)

            # Show what was generated (new workflow)
            if use_ai:
                if not draft_dict.get('question_zh'):
                    print(f"    ✓ Translated to Chinese (DeepSeek)")
                print(f"    ✓ Added timestamps (created_at, last_modified_at)")

            # Note about fact-checking
            if not draft_dict.get('explanations_en'):
                print(f"    ⚠️  Missing explanations - should be fact-checked in Claude Code conversation")

        except Exception as e:
            print(f"    ❌ Error: {e}")
            sys.exit(1)

    # Preview
    if dry_run:
        print("\n" + "=" * 60)
        print("🔍 DRY RUN - Preview of generated questions:")
        print("=" * 60)
        for q in completed_questions:
            print(f"\n{q['id']}: {q['question_en']}")
            print(f"  ZH: {q['question_zh']}")
            print(f"  Difficulty: {q['difficulty']}")
            print(f"  Correct: {q['correct_answer']}")
        print("\n💡 Remove --dry-run flag to actually add these questions")
        return

    # Update JSON file
    print(f"\n💾 Updating JSON file...")
    try:
        update_category_file(category, completed_questions)
        print(f"✅ Added {len(completed_questions)} questions to {cat_info['filename']}")
    except Exception as e:
        print(f"❌ Error updating file: {e}")
        sys.exit(1)

    # Run validation
    if not skip_validation:
        print(f"\n✅ Running validation pipeline...")
        print("-" * 60)
        passed, results = validator.run_all_validations(verbose=True)

        if not passed:
            print("\n❌ Validation failed! Please review errors above.")
            print("   Fix issues and try again, or use --skip-validation (not recommended)")
            sys.exit(1)
    else:
        print("\n⚠️  Skipping validation (--skip-validation flag)")

    # Update master list
    print(f"\n📋 Updating master list...")
    try:
        master_list.add_questions(category, completed_questions)
        master_list.update_totals()
    except Exception as e:
        print(f"⚠️  Warning: Could not update master list: {e}")
        print("   You may need to update it manually")

    # Success summary
    print("\n" + "=" * 60)
    print(f"✨ Success! Added {len(completed_questions)} questions to {category}")
    print("=" * 60)
    print("\n📌 Next steps:")
    print(f"   1. Review: src/data/questions/{cat_info['filename']}")
    print(f"   2. Commit: git add . && git commit -m 'Add {len(completed_questions)} {category} questions'")
    print(f"   3. Push: git push origin feature/peng/add-more-questions2")


def create_category(name_en: str, name_zh: str, dry_run: bool = False):
    """Create a new category"""

    if not name_zh:
        print("❌ Error: --name-zh required for new category")
        sys.exit(1)

    print(f"\n🆕 Creating new category")
    print("=" * 60)
    print(f"   English: {name_en}")
    print(f"   Chinese: {name_zh}")

    # Create category file structure
    category_data = {
        "category_en": name_en,
        "category_zh": name_zh,
        "questions": []
    }

    filename = name_en.lower().replace(' ', '-').replace('&', 'and') + '.json'
    filepath = Path('src/data/questions') / filename

    if dry_run:
        print("\n🔍 DRY RUN - Would create:")
        print(f"   File: {filepath}")
        print(f"   Content:")
        print(json.dumps(category_data, indent=2, ensure_ascii=False))
        return

    # Check if file exists
    if filepath.exists():
        print(f"❌ Error: Category file already exists: {filepath}")
        sys.exit(1)

    # Write file
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(category_data, f, indent=2, ensure_ascii=False)
            f.write('\n')  # Add final newline

        print(f"\n✅ Created: {filepath}")
        print(f"\n📌 Next steps:")
        print(f"   1. Create draft: questions/drafts/{name_en.lower().replace(' ', '_')}.yaml")
        print(f"   2. Add questions: python scripts/add_questions.py --draft <your-draft>.yaml")

    except Exception as e:
        print(f"❌ Error creating category: {e}")
        sys.exit(1)


def update_category_file(category: str, new_questions: List[Dict]):
    """Add questions to existing category JSON file"""

    # Get file path
    id_manager = IDManager()
    cat_info = id_manager.get_category_info(category)
    filepath = Path(cat_info['filepath'])

    # Read existing data
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Add new questions
    if 'questions' not in data:
        data['questions'] = []

    data['questions'].extend(new_questions)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')  # Add final newline


def update_master_list_only(dry_run: bool = False):
    """Update master list totals without adding questions"""

    print("\n📋 Updating master list totals...")

    try:
        updater = MasterListUpdater()
        updater.update_totals(dry_run=dry_run)

        if not dry_run:
            print("✅ Master list updated")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
