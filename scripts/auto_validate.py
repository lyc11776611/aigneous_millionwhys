#!/usr/bin/env python3
"""
Automatic Multi-Layer Validation System for Curious Minds Questions

This script provides automated validation with 3 layers:
1. Structure validation (format, length, completeness)
2. Logic validation (consistency, red flags)
3. AI fact-checking (scientific accuracy via web search)

It can run automatically when questions are created/modified.

Usage:
    # Validate specific file
    python3 auto_validate.py chemistry.json

    # Validate all files
    python3 auto_validate.py --all

    # Watch mode (auto-validate on file changes)
    python3 auto_validate.py --watch

Features:
    - Runs all validation layers automatically
    - Blocks if critical issues found
    - Generates AI fact-check prompts
    - Can integrate with git hooks
"""

import json
import sys
import os
import time
from pathlib import Path
from typing import Dict, List, Tuple
import subprocess

# Import our validators
try:
    from validate_facts import FactChecker
except ImportError:
    print("Warning: validate_facts.py not found in same directory")
    FactChecker = None

class AutoValidator:
    """Orchestrates all validation layers"""

    def __init__(self, strict_mode=True):
        self.strict_mode = strict_mode  # Block on critical issues
        self.validation_results = []

    def validate_file(self, filepath: str, run_ai_check: bool = False) -> Tuple[bool, Dict]:
        """
        Run complete validation on a file

        Returns:
            (passed: bool, results: Dict)
        """
        print(f"\n{'='*70}")
        print(f"🔍 AUTOMATED VALIDATION: {os.path.basename(filepath)}")
        print(f"{'='*70}\n")

        results = {
            'file': filepath,
            'layers': {},
            'overall_passed': False,
            'critical_issues': 0,
            'warnings': 0,
            'requires_ai_check': []
        }

        # Layer 1: Structure & Format Validation
        print("📋 Layer 1: Structure & Format Validation")
        print("─" * 70)
        layer1_passed, layer1_results = self._run_structure_validation(filepath)
        results['layers']['structure'] = layer1_results

        if not layer1_passed:
            print("❌ FAILED Layer 1: Critical structure issues found!\n")
            if self.strict_mode:
                print("🚫 BLOCKING: Fix critical issues before proceeding.\n")
                return False, results
        else:
            print("✅ PASSED Layer 1: Structure is valid\n")

        # Layer 2: Automated Fact Checker
        print("🤖 Layer 2: Automated Validation (Logic & Red Flags)")
        print("─" * 70)
        layer2_passed, layer2_results = self._run_automated_validation(filepath)
        results['layers']['automated'] = layer2_results

        if not layer2_passed:
            print("⚠️  Layer 2: Issues found (see details above)\n")
        else:
            print("✅ PASSED Layer 2: No critical issues\n")

        # Layer 3: AI Fact-Check (if requested)
        if run_ai_check:
            print("🧠 Layer 3: AI Fact-Check Preparation")
            print("─" * 70)
            layer3_prompts = self._prepare_ai_fact_check(filepath)
            results['layers']['ai_check'] = layer3_prompts
            results['requires_ai_check'] = layer3_prompts

            if layer3_prompts:
                print(f"📝 Generated {len(layer3_prompts)} AI fact-check prompts")
                print("   (Run these through Claude with web search)\n")

        # Overall assessment
        critical_count = results['layers']['automated'].get('critical_issues', 0)
        warning_count = results['layers']['automated'].get('warnings', 0)

        results['critical_issues'] = critical_count
        results['warnings'] = warning_count
        results['overall_passed'] = critical_count == 0

        return results['overall_passed'], results

    def _run_structure_validation(self, filepath: str) -> Tuple[bool, Dict]:
        """Layer 1: Basic structure validation"""
        results = {
            'passed': False,
            'issues': []
        }

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            results['issues'].append({
                'severity': 'critical',
                'message': f'Invalid JSON: {e}'
            })
            print(f"❌ Invalid JSON: {e}")
            return False, results

        except FileNotFoundError:
            results['issues'].append({
                'severity': 'critical',
                'message': f'File not found: {filepath}'
            })
            print(f"❌ File not found: {filepath}")
            return False, results

        # Check required top-level fields
        if 'category_en' not in data or 'category_zh' not in data:
            results['issues'].append({
                'severity': 'critical',
                'message': 'Missing category_en or category_zh'
            })
            print("❌ Missing category fields")
            return False, results

        if 'questions' not in data or not isinstance(data['questions'], list):
            results['issues'].append({
                'severity': 'critical',
                'message': 'Missing or invalid questions array'
            })
            print("❌ Missing or invalid questions array")
            return False, results

        if len(data['questions']) == 0:
            results['issues'].append({
                'severity': 'warning',
                'message': 'No questions in file'
            })
            print("⚠️  No questions in file")

        print(f"✓ Valid JSON structure")
        print(f"✓ Category: {data.get('category_en')}")
        print(f"✓ Questions: {len(data.get('questions', []))}")

        results['passed'] = True
        return True, results

    def _run_automated_validation(self, filepath: str) -> Tuple[bool, Dict]:
        """Layer 2: Run validate_facts.py"""
        if FactChecker is None:
            print("⚠️  FactChecker not available, skipping automated validation")
            return True, {'skipped': True}

        checker = FactChecker(verbose=False)
        file_results = checker.validate_file(filepath)

        # Count issues
        critical_count = 0
        warning_count = 0

        for result in file_results:
            for issue in result.issues:
                if issue.severity == 'critical':
                    critical_count += 1
                elif issue.severity == 'warning':
                    warning_count += 1

        results = {
            'passed': critical_count == 0,
            'critical_issues': critical_count,
            'warnings': warning_count,
            'question_results': file_results
        }

        return critical_count == 0, results

    def _prepare_ai_fact_check(self, filepath: str) -> List[Dict]:
        """Layer 3: Prepare AI fact-check prompts"""
        prompts = []

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except:
            return prompts

        category = data.get('category_en', 'Unknown')
        questions = data.get('questions', [])

        for q in questions:
            q_id = q.get('id', 'unknown')
            prompts.append({
                'question_id': q_id,
                'category': category,
                'needs_fact_check': True,
                'prompt_file': f'{q_id}_fact_check.txt'
            })

        return prompts

    def print_summary(self, all_results: List[Dict]):
        """Print validation summary for all files"""
        print(f"\n{'='*70}")
        print("📊 VALIDATION SUMMARY")
        print(f"{'='*70}\n")

        total_files = len(all_results)
        passed_files = sum(1 for r in all_results if r['overall_passed'])
        failed_files = total_files - passed_files

        total_critical = sum(r['critical_issues'] for r in all_results)
        total_warnings = sum(r['warnings'] for r in all_results)

        print(f"Files validated: {total_files}")
        print(f"✅ Passed: {passed_files}")
        print(f"❌ Failed: {failed_files}")
        print(f"\n🔴 Total critical issues: {total_critical}")
        print(f"🟡 Total warnings: {total_warnings}")

        if failed_files > 0:
            print(f"\n⚠️  VALIDATION FAILED!")
            print(f"Files with critical issues:")
            for r in all_results:
                if not r['overall_passed']:
                    print(f"  - {os.path.basename(r['file'])}: {r['critical_issues']} critical issues")
            print(f"\n🚫 Please fix critical issues before release.")
        else:
            print(f"\n✅ ALL FILES PASSED!")
            if total_warnings > 0:
                print(f"⚠️  {total_warnings} warnings found - review recommended")

        print(f"\n{'='*70}\n")


def watch_mode(directory: str):
    """Watch for file changes and auto-validate"""
    print(f"\n👀 WATCH MODE: Monitoring {directory} for changes...")
    print("Press Ctrl+C to stop\n")

    validator = AutoValidator(strict_mode=False)
    file_mtimes = {}

    try:
        while True:
            # Check all JSON files
            json_files = Path(directory).glob('*.json')

            for filepath in json_files:
                filepath_str = str(filepath)
                current_mtime = os.path.getmtime(filepath_str)

                # Check if file was modified
                if filepath_str not in file_mtimes or file_mtimes[filepath_str] < current_mtime:
                    file_mtimes[filepath_str] = current_mtime

                    if filepath_str in file_mtimes:  # Skip initial scan
                        print(f"\n🔄 Change detected: {filepath.name}")
                        validator.validate_file(filepath_str, run_ai_check=False)

            time.sleep(2)  # Check every 2 seconds

    except KeyboardInterrupt:
        print("\n\n👋 Watch mode stopped.")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Automated multi-layer validation for questions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Validate single file
  python3 auto_validate.py chemistry.json

  # Validate all files
  python3 auto_validate.py --all

  # Validate with AI fact-check prompts
  python3 auto_validate.py chemistry.json --ai-check

  # Watch mode (auto-validate on changes)
  python3 auto_validate.py --watch
        """
    )

    parser.add_argument('file', nargs='?', help='JSON file to validate')
    parser.add_argument('--all', action='store_true', help='Validate all JSON files')
    parser.add_argument('--ai-check', action='store_true', help='Generate AI fact-check prompts')
    parser.add_argument('--watch', action='store_true', help='Watch for file changes and auto-validate')
    parser.add_argument('--no-strict', action='store_true', help='Continue even with critical issues')

    args = parser.parse_args()

    # Determine script directory and questions directory
    script_dir = Path(__file__).parent

    # Try to find questions directory (support different project structures)
    # Option 1: src/data/questions (Next.js optimized structure)
    questions_dir = script_dir.parent / 'src' / 'data' / 'questions'
    if not questions_dir.exists():
        # Option 2: data/questions (fallback)
        questions_dir = script_dir.parent / 'data' / 'questions'
        if not questions_dir.exists():
            # Option 3: Same directory as script (legacy)
            questions_dir = script_dir

    # Watch mode
    if args.watch:
        watch_mode(str(questions_dir))
        return 0

    # Validate files
    validator = AutoValidator(strict_mode=not args.no_strict)
    all_results = []

    if args.all:
        # Validate all JSON files in questions directory
        json_files = sorted(questions_dir.glob('*.json'))
        if not json_files:
            print(f"No JSON files found in {questions_dir}!")
            return 1

        for filepath in json_files:
            passed, results = validator.validate_file(str(filepath), run_ai_check=args.ai_check)
            all_results.append(results)

    elif args.file:
        # Validate specific file
        filepath = Path(args.file)

        # Try different path resolution strategies
        if filepath.is_absolute() and filepath.exists():
            # Use absolute path as-is
            pass
        elif filepath.exists():
            # Relative path from current directory exists
            pass
        elif (questions_dir / filepath.name).exists():
            # Look for just the filename in questions_dir
            filepath = questions_dir / filepath.name
        else:
            print(f"❌ File not found: {args.file}")
            return 1

        passed, results = validator.validate_file(str(filepath), run_ai_check=args.ai_check)
        all_results.append(results)

    else:
        parser.print_help()
        return 1

    # Print summary
    validator.print_summary(all_results)

    # Exit code
    failed_count = sum(1 for r in all_results if not r['overall_passed'])
    return 1 if failed_count > 0 else 0


if __name__ == '__main__':
    sys.exit(main())
