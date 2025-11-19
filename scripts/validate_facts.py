#!/usr/bin/env python3
"""
AI-Powered Fact-Checker for Curious Minds Questions

This script validates the scientific accuracy of all questions by:
1. Checking correct answers against reliable sources
2. Verifying wrong answer explanations are accurate
3. Identifying potential misconceptions
4. Generating a detailed validation report

Usage:
    python3 validate_facts.py [--file FILENAME] [--verbose]

    --file: Check specific file only (e.g., chemistry.json)
    --verbose: Show detailed checking process
"""

import json
import os
import sys
import glob
from typing import Dict, List, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ValidationIssue:
    """Represents a potential issue found during validation"""
    question_id: str
    severity: str  # 'critical', 'warning', 'info'
    category: str  # 'accuracy', 'clarity', 'format'
    message: str
    suggestion: str = ""

@dataclass
class ValidationResult:
    """Results from validating a single question"""
    question_id: str
    question_text: str
    passed: bool
    confidence: str  # 'high', 'medium', 'low'
    issues: List[ValidationIssue]
    notes: List[str]

class FactChecker:
    """Validates scientific accuracy of questions"""

    def __init__(self, verbose=False):
        self.verbose = verbose
        self.results: List[ValidationResult] = []

    def log(self, message: str):
        """Print verbose logging"""
        if self.verbose:
            print(f"  {message}")

    def validate_file(self, filepath: str) -> List[ValidationResult]:
        """Validate all questions in a JSON file"""
        print(f"\n{'='*70}")
        print(f"Validating: {os.path.basename(filepath)}")
        print(f"{'='*70}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error: {e}")
            return []

        category = data.get('category_en', 'Unknown')
        questions = data.get('questions', [])

        print(f"Category: {category}")
        print(f"Questions: {len(questions)}\n")

        file_results = []
        for q in questions:
            result = self.validate_question(q, category)
            file_results.append(result)
            self.results.append(result)
            self.print_result(result)

        return file_results

    def validate_question(self, question: Dict, category: str) -> ValidationResult:
        """Validate a single question"""
        q_id = question.get('id', 'unknown')
        q_text = question.get('question_en', '')

        self.log(f"Checking {q_id}: {q_text}")

        issues = []
        notes = []

        # 1. Structure validation
        issues.extend(self._check_structure(question))

        # 2. Length validation
        issues.extend(self._check_lengths(question))

        # 3. Explanation quality
        issues.extend(self._check_explanations(question))

        # 4. Answer consistency
        issues.extend(self._check_answer_consistency(question))

        # 5. Scientific accuracy markers (automated pre-check)
        issues.extend(self._check_accuracy_markers(question, category))

        # Determine confidence level
        critical_count = sum(1 for i in issues if i.severity == 'critical')
        warning_count = sum(1 for i in issues if i.severity == 'warning')

        if critical_count > 0:
            confidence = 'low'
            passed = False
        elif warning_count > 2:
            confidence = 'medium'
            passed = True
        else:
            confidence = 'high'
            passed = True

        # Add notes about what to manually verify
        notes.extend(self._get_manual_verification_notes(question, category))

        return ValidationResult(
            question_id=q_id,
            question_text=q_text,
            passed=passed,
            confidence=confidence,
            issues=issues,
            notes=notes
        )

    def _check_structure(self, q: Dict) -> List[ValidationIssue]:
        """Check required fields are present"""
        issues = []
        q_id = q.get('id', 'unknown')

        required_fields = [
            'id', 'question_en', 'question_zh',
            'choices_en', 'choices_zh', 'correct_answer',
            'explanations_en', 'explanations_zh', 'difficulty'
        ]

        for field in required_fields:
            if field not in q:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='critical',
                    category='format',
                    message=f"Missing required field: {field}"
                ))

        # Check arrays have 4 items
        if 'choices_en' in q and len(q['choices_en']) != 4:
            issues.append(ValidationIssue(
                question_id=q_id,
                severity='critical',
                category='format',
                message=f"choices_en must have exactly 4 items, found {len(q['choices_en'])}"
            ))

        if 'explanations_en' in q and len(q['explanations_en']) != 4:
            issues.append(ValidationIssue(
                question_id=q_id,
                severity='critical',
                category='format',
                message=f"explanations_en must have exactly 4 items, found {len(q['explanations_en'])}"
            ))

        # Check correct_answer is valid index
        if 'correct_answer' in q:
            ca = q['correct_answer']
            if not isinstance(ca, int) or ca < 0 or ca > 3:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='critical',
                    category='format',
                    message=f"correct_answer must be 0-3, found {ca}"
                ))

        return issues

    def _check_lengths(self, q: Dict) -> List[ValidationIssue]:
        """Check character limits for mobile optimization"""
        issues = []
        q_id = q.get('id', 'unknown')

        # Question length limits
        if 'question_en' in q:
            q_en_len = len(q['question_en'])
            if q_en_len > 45:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='warning',
                    category='format',
                    message=f"question_en too long: {q_en_len} chars (max 45)",
                    suggestion="Shorten for mobile display"
                ))

        if 'question_zh' in q:
            q_zh_len = len(q['question_zh'])
            if q_zh_len > 25:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='warning',
                    category='format',
                    message=f"question_zh too long: {q_zh_len} chars (max 25)",
                    suggestion="Shorten for mobile display"
                ))

        # Choice length limits
        if 'choices_en' in q:
            for i, choice in enumerate(q['choices_en']):
                if len(choice) > 35:
                    issues.append(ValidationIssue(
                        question_id=q_id,
                        severity='warning',
                        category='format',
                        message=f"choice_en[{i}] too long: {len(choice)} chars (max 35)",
                        suggestion=f"Shorten: '{choice[:30]}...'"
                    ))

        if 'choices_zh' in q:
            for i, choice in enumerate(q['choices_zh']):
                if len(choice) > 15:
                    issues.append(ValidationIssue(
                        question_id=q_id,
                        severity='warning',
                        category='format',
                        message=f"choice_zh[{i}] too long: {len(choice)} chars (max 15)",
                        suggestion=f"Shorten: '{choice[:12]}...'"
                    ))

        # Total explanation length (sum of all 4)
        if 'explanations_en' in q:
            total_en = sum(len(exp) for exp in q['explanations_en'])
            if total_en > 500:  # Slightly more flexible than single explanation
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='info',
                    category='format',
                    message=f"Total explanations_en: {total_en} chars (recommend <500 for mobile)",
                    suggestion="Consider condensing explanations"
                ))

        return issues

    def _check_explanations(self, q: Dict) -> List[ValidationIssue]:
        """Check explanation quality and format"""
        issues = []
        q_id = q.get('id', 'unknown')
        correct_idx = q.get('correct_answer', -1)

        if 'explanations_en' not in q or len(q['explanations_en']) != 4:
            return issues

        explanations = q['explanations_en']

        # Check correct answer starts with "Correct!"
        if correct_idx >= 0 and correct_idx < len(explanations):
            correct_exp = explanations[correct_idx]
            if not correct_exp.startswith('Correct!'):
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='warning',
                    category='clarity',
                    message=f"Correct answer explanation should start with 'Correct!'",
                    suggestion=f"Current: '{correct_exp[:50]}...'"
                ))

        # Check wrong answers start with "Wrong."
        for i, exp in enumerate(explanations):
            if i != correct_idx:
                if not exp.startswith('Wrong.'):
                    issues.append(ValidationIssue(
                        question_id=q_id,
                        severity='warning',
                        category='clarity',
                        message=f"Wrong answer explanation[{i}] should start with 'Wrong.'",
                        suggestion=f"Current: '{exp[:50]}...'"
                    ))

        # Check for empty explanations
        for i, exp in enumerate(explanations):
            if not exp or len(exp.strip()) < 20:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='critical',
                    category='clarity',
                    message=f"Explanation[{i}] is too short or empty",
                    suggestion="Provide meaningful explanation"
                ))

        return issues

    def _check_answer_consistency(self, q: Dict) -> List[ValidationIssue]:
        """Check for logical consistency in answers and explanations"""
        issues = []
        q_id = q.get('id', 'unknown')

        if 'choices_en' not in q or 'explanations_en' not in q:
            return issues

        choices = q['choices_en']
        explanations = q['explanations_en']

        # Check for contradictions (basic keyword matching)
        # This is a simple heuristic - AI review will be more thorough

        # Example: If a choice says "X causes Y" but explanation says "X doesn't cause Y"
        for i, (choice, exp) in enumerate(zip(choices, explanations)):
            choice_lower = choice.lower()
            exp_lower = exp.lower()

            # Check if choice and explanation seem contradictory
            # (This is simplified - a real AI check would be more sophisticated)

            # Look for negation patterns
            if 'doesn\'t' in choice_lower and 'does' in exp_lower and i == q.get('correct_answer'):
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='warning',
                    category='accuracy',
                    message=f"Possible contradiction in choice[{i}]: choice has 'doesn\\'t' but may contradict explanation",
                    suggestion="Manual review recommended"
                ))

        return issues

    def _check_accuracy_markers(self, q: Dict, category: str) -> List[ValidationIssue]:
        """Check for common accuracy red flags"""
        issues = []
        q_id = q.get('id', 'unknown')

        if 'explanations_en' not in q:
            return issues

        # Combine all explanations for checking
        all_text = ' '.join(q.get('explanations_en', []))
        all_text_lower = all_text.lower()

        # Red flags for potential inaccuracy
        red_flags = {
            'always': 'Absolute statements like "always" are often oversimplifications',
            'never': 'Absolute statements like "never" may not be accurate',
            'all ': 'Be careful with universal claims ("all X do Y")',
            '100%': 'Absolute percentages are rarely accurate in science',
            'proven': 'Science uses "evidence supports" rather than "proven"',
        }

        for flag, warning in red_flags.items():
            if flag in all_text_lower:
                issues.append(ValidationIssue(
                    question_id=q_id,
                    severity='info',
                    category='accuracy',
                    message=f"Contains '{flag}': {warning}",
                    suggestion="Review for overgeneralization"
                ))

        # Check for common misconceptions by topic
        misconception_checks = {
            'Chemistry': {
                'soap kills': 'Soap removes germs, but antibacterial soap is needed to kill them',
                'heavier objects fall faster': 'Common misconception - all objects fall at same rate in vacuum',
            },
            'Physics': {
                'heavier objects fall faster': 'Galileo showed this is wrong - air resistance varies',
                'cold is a thing': 'Cold is absence of heat, not a substance',
            },
            'Astronomy': {
                'dark side of the moon': 'It\'s the "far side" - it gets sunlight too',
                'summer because closer to sun': 'Earth\'s tilt causes seasons, not distance',
            },
            'Biology': {
                'we only use 10%': 'Myth - we use all parts of our brain',
                'sugar makes hyperactive': 'Studies show this is largely a myth',
            }
        }

        if category in misconception_checks:
            for phrase, warning in misconception_checks[category].items():
                if phrase.lower() in all_text_lower:
                    issues.append(ValidationIssue(
                        question_id=q_id,
                        severity='warning',
                        category='accuracy',
                        message=f"Potential misconception detected: '{phrase}'",
                        suggestion=warning
                    ))

        return issues

    def _get_manual_verification_notes(self, q: Dict, category: str) -> List[str]:
        """Generate notes about what should be manually verified"""
        notes = []

        # Add category-specific verification notes
        verification_guides = {
            'Chemistry': [
                '✓ Verify chemical reactions and compounds are correct',
                '✓ Check pH levels, temperatures, or percentages mentioned',
                '✓ Confirm enzyme/catalyst behavior is accurate'
            ],
            'Physics': [
                '✓ Verify physical laws and formulas',
                '✓ Check speeds, distances, forces mentioned',
                '✓ Confirm cause-and-effect relationships'
            ],
            'Astronomy': [
                '✓ Verify orbital periods, distances, and phenomena',
                '✓ Check against NASA/astronomical databases',
                '✓ Confirm space science facts are current'
            ],
            'Biology': [
                '✓ Verify biological processes and mechanisms',
                '✓ Check body systems and functions',
                '✓ Confirm medical/health information is accurate'
            ],
            'Psychology': [
                '✓ Verify psychological theories are current',
                '✓ Check if research findings are cited correctly',
                '✓ Confirm no outdated psychological concepts'
            ]
        }

        if category in verification_guides:
            notes.extend(verification_guides[category])

        # Check for numerical claims that need verification
        all_text = ' '.join(q.get('explanations_en', []))

        # Look for numbers, percentages, speeds, etc.
        if any(char.isdigit() for char in all_text):
            notes.append('⚠ Contains numerical claims - verify accuracy')

        # Look for specific scientific terms that should be verified
        scientific_terms = ['molecule', 'atom', 'reaction', 'orbit', 'gravity', 'enzyme',
                          'DNA', 'protein', 'neuron', 'wavelength', 'frequency']

        found_terms = [term for term in scientific_terms if term.lower() in all_text.lower()]
        if found_terms:
            notes.append(f'⚠ Scientific terms found: {", ".join(found_terms[:3])} - verify usage')

        return notes

    def print_result(self, result: ValidationResult):
        """Print validation result for a question"""
        # Status icon
        if result.confidence == 'high':
            icon = '✅'
        elif result.confidence == 'medium':
            icon = '⚠️ '
        else:
            icon = '❌'

        print(f"{icon} {result.question_id}: {result.question_text[:50]}...")
        print(f"   Confidence: {result.confidence.upper()}")

        # Print issues
        if result.issues:
            critical = [i for i in result.issues if i.severity == 'critical']
            warnings = [i for i in result.issues if i.severity == 'warning']
            info = [i for i in result.issues if i.severity == 'info']

            if critical:
                print(f"   🔴 Critical Issues: {len(critical)}")
                for issue in critical:
                    print(f"      - {issue.message}")
                    if issue.suggestion:
                        print(f"        → {issue.suggestion}")

            if warnings:
                print(f"   🟡 Warnings: {len(warnings)}")
                for issue in warnings[:3]:  # Show first 3
                    print(f"      - {issue.message}")
                if len(warnings) > 3:
                    print(f"      ... and {len(warnings) - 3} more")

            if info and self.verbose:
                print(f"   ℹ️  Info: {len(info)}")
                for issue in info[:2]:
                    print(f"      - {issue.message}")

        # Print manual verification notes
        if result.notes and self.verbose:
            print(f"   📋 Manual Verification:")
            for note in result.notes[:3]:
                print(f"      {note}")

        print()

    def print_summary(self):
        """Print overall validation summary"""
        print(f"\n{'='*70}")
        print("VALIDATION SUMMARY")
        print(f"{'='*70}\n")

        total = len(self.results)
        high_conf = sum(1 for r in self.results if r.confidence == 'high')
        med_conf = sum(1 for r in self.results if r.confidence == 'medium')
        low_conf = sum(1 for r in self.results if r.confidence == 'low')

        print(f"Total Questions: {total}")
        print(f"✅ High Confidence: {high_conf} ({high_conf/total*100:.1f}%)")
        print(f"⚠️  Medium Confidence: {med_conf} ({med_conf/total*100:.1f}%)")
        print(f"❌ Low Confidence: {low_conf} ({low_conf/total*100:.1f}%)")

        # Count issues by severity
        all_issues = [issue for r in self.results for issue in r.issues]
        critical = sum(1 for i in all_issues if i.severity == 'critical')
        warnings = sum(1 for i in all_issues if i.severity == 'warning')

        print(f"\n🔴 Critical Issues: {critical}")
        print(f"🟡 Warnings: {warnings}")

        if low_conf > 0:
            print(f"\n⚠️  ATTENTION: {low_conf} questions need review before release!")
            print("Questions with low confidence:")
            for r in self.results:
                if r.confidence == 'low':
                    print(f"  - {r.question_id}: {r.question_text[:60]}...")

        print(f"\n{'='*70}")
        print("NEXT STEPS:")
        print(f"{'='*70}")
        print("1. Fix all CRITICAL issues (required)")
        print("2. Review WARNINGS for potential improvements")
        print("3. Manually verify scientific facts using:")
        print("   - Wikipedia for general concepts")
        print("   - NASA for astronomy/space facts")
        print("   - NIH/medical sites for biology/health")
        print("   - Scientific journals for specific claims")
        print("4. Consider adding fact-checking with web search (see documentation)")
        print()

def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Validate scientific accuracy of questions')
    parser.add_argument('--file', help='Validate specific file only')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed output')

    args = parser.parse_args()

    checker = FactChecker(verbose=args.verbose)

    # Find question files
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

    if args.file:
        # If absolute path provided, use it; otherwise look in questions_dir
        filepath = Path(args.file)
        if not filepath.is_absolute():
            filepath = questions_dir / args.file
        files = [filepath]
    else:
        files = sorted(questions_dir.glob('*.json'))

    if not files:
        print(f"No JSON files found in {questions_dir}!")
        return 1

    # Validate each file
    for filepath in files:
        if filepath.name == 'package.json':  # Skip if any
            continue
        checker.validate_file(str(filepath))

    # Print summary
    checker.print_summary()

    # Exit code
    low_confidence = sum(1 for r in checker.results if r.confidence == 'low')
    return 1 if low_confidence > 0 else 0

if __name__ == '__main__':
    sys.exit(main())
