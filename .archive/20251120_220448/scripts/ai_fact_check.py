#!/usr/bin/env python3
"""
AI-Powered Fact-Checker with OpenAI and DeepSeek

This script uses OpenAI and DeepSeek APIs to verify:
1. Scientific accuracy (OpenAI)
2. English language quality (OpenAI)
3. Chinese language quality and accuracy (OpenAI + DeepSeek)

Requirements:
    - OPENAI_API_KEY environment variable
    - DEEPSEEK_API_KEY environment variable (optional, for additional Chinese validation)
    - openai Python package: pip install openai

Usage:
    python3 ai_fact_check.py [--file FILENAME] [--question QUESTION_ID]
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple
import time

try:
    from openai import OpenAI
except ImportError:
    print("❌ Error: openai package not installed")
    print("   Install with: pip install openai")
    sys.exit(1)


class AIFactChecker:
    """Uses OpenAI and DeepSeek to fact-check questions"""

    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.checked_questions = []

        # Initialize OpenAI client
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.openai_client = OpenAI(api_key=openai_key)

        # Initialize DeepSeek client (optional)
        deepseek_key = os.getenv('DEEPSEEK_API_KEY')
        self.deepseek_client = None
        if deepseek_key:
            try:
                self.deepseek_client = OpenAI(
                    api_key=deepseek_key,
                    base_url="https://api.deepseek.com"
                )
                if self.verbose:
                    print("✅ DeepSeek API available for Chinese validation")
            except Exception as e:
                if self.verbose:
                    print(f"⚠️  DeepSeek API not available: {e}")
        else:
            if self.verbose:
                print("ℹ️  DeepSeek API key not found (optional)")

    def fact_check_question(self, question: Dict, category: str) -> Dict:
        """
        Comprehensive fact-check using OpenAI and DeepSeek

        Returns:
            Dict with validation results including:
            - accuracy_check: Scientific accuracy validation
            - english_check: English language quality
            - chinese_check: Chinese language and accuracy
            - overall_verdict: PASS/FAIL/WARNING
        """
        q_id = question.get('id', 'unknown')
        q_text_en = question.get('question_en', '')
        q_text_zh = question.get('question_zh', '')

        if self.verbose:
            print(f"\n{'='*70}")
            print(f"AI FACT-CHECK: {q_id}")
            print(f"{'='*70}")
            print(f"EN: {q_text_en}")
            print(f"ZH: {q_text_zh}")
            print(f"Category: {category}")
        else:
            # In quiet mode, show minimal progress
            print(f"Checking {q_id}...", end=' ', flush=True)

        results = {
            'question_id': q_id,
            'accuracy_check': None,
            'english_check': None,
            'chinese_check': None,
            'deepseek_check': None,
            'overall_verdict': 'PENDING',
            'issues': [],
            'warnings': []
        }

        # 1. Check scientific accuracy with OpenAI
        if self.verbose:
            print("\n🔬 Checking scientific accuracy...")
        try:
            accuracy = self._check_accuracy_openai(question, category)
            results['accuracy_check'] = accuracy
            if accuracy['verdict'] == 'INACCURATE':
                results['issues'].append(f"Accuracy issue: {accuracy.get('issue', 'Unknown')}")
            elif accuracy['verdict'] == 'NEEDS_REVIEW':
                results['warnings'].append(f"Accuracy warning: {accuracy.get('issue', 'Unknown')}")
        except Exception as e:
            results['warnings'].append(f"Accuracy check failed: {str(e)}")

        # 2. Check English language quality with OpenAI
        if self.verbose:
            print("📝 Checking English language quality...")
        try:
            english = self._check_english_openai(question)
            results['english_check'] = english
            if english['verdict'] == 'POOR':
                results['issues'].append(f"English quality issue: {english.get('issue', 'Unknown')}")
            elif english['verdict'] == 'FAIR':
                results['warnings'].append(f"English quality warning: {english.get('issue', 'Unknown')}")
        except Exception as e:
            results['warnings'].append(f"English check failed: {str(e)}")

        # 3. Check Chinese with OpenAI
        if self.verbose:
            print("🇨🇳 Checking Chinese language and accuracy...")
        try:
            chinese = self._check_chinese_openai(question)
            results['chinese_check'] = chinese
            if chinese['verdict'] == 'POOR':
                results['issues'].append(f"Chinese quality issue: {chinese.get('issue', 'Unknown')}")
            elif chinese['verdict'] == 'FAIR':
                results['warnings'].append(f"Chinese quality warning: {chinese.get('issue', 'Unknown')}")
        except Exception as e:
            results['warnings'].append(f"Chinese check failed: {str(e)}")

        # 4. Additional Chinese check with DeepSeek (if available)
        if self.deepseek_client:
            if self.verbose:
                print("🔍 Additional Chinese validation with DeepSeek...")
            try:
                deepseek = self._check_chinese_deepseek(question)
                results['deepseek_check'] = deepseek
                if deepseek['verdict'] == 'POOR':
                    results['warnings'].append(f"DeepSeek concern: {deepseek.get('issue', 'Unknown')}")
            except Exception as e:
                results['warnings'].append(f"DeepSeek check failed: {str(e)}")

        # Determine overall verdict
        if results['issues']:
            results['overall_verdict'] = 'FAIL'
        elif results['warnings']:
            results['overall_verdict'] = 'WARNING'
        else:
            results['overall_verdict'] = 'PASS'

        # In quiet mode, show result
        if not self.verbose:
            verdict_emoji = {'PASS': '✅', 'WARNING': '⚠️', 'FAIL': '❌'}
            print(verdict_emoji.get(results['overall_verdict'], '❓'))

        # Print summary
        if self.verbose:
            self._print_check_summary(results)

        return results

    def _check_accuracy_openai(self, question: Dict, category: str) -> Dict:
        """Check scientific accuracy using OpenAI"""
        q_text = question.get('question_en', '')
        correct_idx = question.get('correct_answer', 0)
        choices = question.get('choices_en', [])
        explanations = question.get('explanations_en', [])

        prompt = f"""You are a scientific fact-checker. Verify the accuracy of this educational question.

**Category**: {category}
**Question**: {q_text}

**Marked Correct Answer (index {correct_idx})**: {choices[correct_idx] if correct_idx < len(choices) else 'N/A'}
**Explanation**: {explanations[correct_idx] if correct_idx < len(explanations) else 'N/A'}

**Task**: Verify:
1. Is the marked answer scientifically correct?
2. Is the explanation accurate and complete?
3. Are there any factual errors or misconceptions?
4. Are any numbers, percentages, or scientific facts verifiable?

**Respond in JSON format**:
{{
    "verdict": "ACCURATE|NEEDS_REVIEW|INACCURATE",
    "confidence": "HIGH|MEDIUM|LOW",
    "issue": "Brief description if any issue found",
    "suggestion": "How to improve if needed"
}}"""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            return {
                "verdict": "ERROR",
                "confidence": "LOW",
                "issue": str(e),
                "suggestion": "Manual review required"
            }

    def _check_english_openai(self, question: Dict) -> Dict:
        """Check English language quality using OpenAI"""
        q_text = question.get('question_en', '')
        choices = question.get('choices_en', [])
        explanations = question.get('explanations_en', [])

        prompt = f"""You are an English language expert. Review this educational content for language quality.

**Question**: {q_text}

**Choices**:
{chr(10).join(f'{i}. {c}' for i, c in enumerate(choices))}

**Explanations**:
{chr(10).join(f'[{i}] {e[:100]}...' for i, e in enumerate(explanations))}

**Evaluate**:
1. Grammar and clarity
2. Age-appropriate vocabulary (general audience)
3. Consistency in style
4. Readability

**Respond in JSON format**:
{{
    "verdict": "GOOD|FAIR|POOR",
    "clarity_score": "1-10",
    "issue": "Brief description if any issue found",
    "suggestion": "How to improve if needed"
}}"""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            return {
                "verdict": "ERROR",
                "clarity_score": "0",
                "issue": str(e),
                "suggestion": "Manual review required"
            }

    def _check_chinese_openai(self, question: Dict) -> Dict:
        """Check Chinese language quality and translation accuracy using OpenAI"""
        q_text_en = question.get('question_en', '')
        q_text_zh = question.get('question_zh', '')
        choices_en = question.get('choices_en', [])
        choices_zh = question.get('choices_zh', [])
        explanations_en = question.get('explanations_en', [])
        explanations_zh = question.get('explanations_zh', [])

        prompt = f"""你是中文语言专家。请评估这个教育内容的中文质量。

**英文问题**: {q_text_en}
**中文问题**: {q_text_zh}

**英文选项**:
{chr(10).join(f'{i}. {c}' for i, c in enumerate(choices_en))}

**中文选项**:
{chr(10).join(f'{i}. {c}' for i, c in enumerate(choices_zh))}

**评估要点**:
1. 中文翻译是否准确传达了英文原意？
2. 中文表达是否自然、流畅？
3. 科学术语翻译是否准确？
4. 是否适合普通读者阅读？
5. 语法和用词是否正确？

**用JSON格式回复**:
{{
    "verdict": "GOOD|FAIR|POOR",
    "translation_accuracy": "ACCURATE|MOSTLY_ACCURATE|INACCURATE",
    "issue": "如发现问题请简要说明",
    "suggestion": "如需改进请提供建议"
}}"""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            return {
                "verdict": "ERROR",
                "translation_accuracy": "UNKNOWN",
                "issue": str(e),
                "suggestion": "需要人工审核"
            }

    def _check_chinese_deepseek(self, question: Dict) -> Dict:
        """Additional Chinese validation using DeepSeek (Chinese-native model)"""
        q_text_zh = question.get('question_zh', '')
        choices_zh = question.get('choices_zh', [])
        explanations_zh = question.get('explanations_zh', [])
        correct_idx = question.get('correct_answer', 0)

        prompt = f"""请作为中文母语专家，评估这个教育问题的中文质量和科学准确性。

**问题**: {q_text_zh}

**选项**:
{chr(10).join(f'{i}. {c}' for i, c in enumerate(choices_zh))}

**正确答案**: 选项 {correct_idx}

**解释** (仅显示正确答案的解释):
{explanations_zh[correct_idx] if correct_idx < len(explanations_zh) else 'N/A'}

**请评估**:
1. 中文表达是否地道自然？
2. 科学表述是否准确？
3. 是否有语法或用词错误？
4. 是否适合教育场景？

**用JSON格式回复**:
{{
    "verdict": "GOOD|FAIR|POOR",
    "naturalness": "HIGH|MEDIUM|LOW",
    "issue": "如有问题请说明",
    "suggestion": "改进建议"
}}"""

        try:
            response = self.deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )

            content = response.choices[0].message.content
            # Try to parse as JSON, fallback if not
            try:
                result = json.loads(content)
            except:
                result = {
                    "verdict": "GOOD",
                    "naturalness": "HIGH",
                    "issue": "",
                    "suggestion": ""
                }

            return result
        except Exception as e:
            return {
                "verdict": "ERROR",
                "naturalness": "UNKNOWN",
                "issue": str(e),
                "suggestion": "需要人工审核"
            }

    def _print_check_summary(self, results: Dict):
        """Print validation summary"""
        print(f"\n{'─'*70}")
        print("VALIDATION SUMMARY")
        print(f"{'─'*70}")

        verdict_emoji = {
            'PASS': '✅',
            'WARNING': '⚠️',
            'FAIL': '❌'
        }

        print(f"\n{verdict_emoji.get(results['overall_verdict'], '❓')} Overall: {results['overall_verdict']}")

        if results['accuracy_check']:
            acc = results['accuracy_check']
            print(f"\n  🔬 Accuracy: {acc.get('verdict', 'N/A')} (confidence: {acc.get('confidence', 'N/A')})")
            if acc.get('issue'):
                print(f"     Issue: {acc['issue']}")

        if results['english_check']:
            eng = results['english_check']
            print(f"\n  📝 English: {eng.get('verdict', 'N/A')} (clarity: {eng.get('clarity_score', 'N/A')}/10)")
            if eng.get('issue'):
                print(f"     Issue: {eng['issue']}")

        if results['chinese_check']:
            chi = results['chinese_check']
            print(f"\n  🇨🇳 Chinese: {chi.get('verdict', 'N/A')} (translation: {chi.get('translation_accuracy', 'N/A')})")
            if chi.get('issue'):
                print(f"     Issue: {chi['issue']}")

        if results['deepseek_check']:
            ds = results['deepseek_check']
            print(f"\n  🔍 DeepSeek: {ds.get('verdict', 'N/A')} (naturalness: {ds.get('naturalness', 'N/A')})")
            if ds.get('issue'):
                print(f"     Issue: {ds['issue']}")

        if results['issues']:
            print(f"\n❌ Critical Issues ({len(results['issues'])}):")
            for issue in results['issues']:
                print(f"   - {issue}")

        if results['warnings']:
            print(f"\n⚠️  Warnings ({len(results['warnings'])}):")
            for warning in results['warnings']:
                print(f"   - {warning}")

    def check_file(self, filepath: str, question_id: str = None) -> Tuple[bool, List[Dict]]:
        """
        Fact-check questions in a file

        Returns:
            Tuple of (all_passed, results_list)
        """
        if self.verbose:
            print(f"\n{'='*70}")
            print(f"AI FACT-CHECKER")
            print(f"File: {os.path.basename(filepath)}")
            print(f"{'='*70}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error: {e}")
            return False, []

        category = data.get('category_en', 'Unknown')
        questions = data.get('questions', [])

        if question_id:
            questions = [q for q in questions if q.get('id') == question_id]
            if not questions:
                print(f"❌ Question {question_id} not found!")
                return False, []

        if self.verbose:
            print(f"\nCategory: {category}")
            print(f"Questions to check: {len(questions)}")

        all_passed = True
        for q in questions:
            result = self.fact_check_question(q, category)
            self.checked_questions.append(result)

            if result['overall_verdict'] == 'FAIL':
                all_passed = False

            # Rate limit: brief pause between API calls
            time.sleep(1)

        # Final summary
        if self.verbose:
            print(f"\n{'='*70}")
            print("FACT-CHECK COMPLETE")
            print(f"{'='*70}")

            passed = sum(1 for r in self.checked_questions if r['overall_verdict'] == 'PASS')
            warnings = sum(1 for r in self.checked_questions if r['overall_verdict'] == 'WARNING')
            failed = sum(1 for r in self.checked_questions if r['overall_verdict'] == 'FAIL')

            print(f"\n✅ Passed: {passed}")
            print(f"⚠️  Warnings: {warnings}")
            print(f"❌ Failed: {failed}")

            if not all_passed:
                print("\n⚠️  Some questions have critical issues that need to be fixed!")

        return all_passed, self.checked_questions


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='AI-powered fact-checker with OpenAI and DeepSeek')
    parser.add_argument('--file', help='Check specific file only (e.g., chemistry.json)')
    parser.add_argument('--question', help='Check specific question ID (e.g., chem_001)')
    parser.add_argument('--quiet', action='store_true', help='Reduce output verbosity')

    args = parser.parse_args()

    try:
        checker = AIFactChecker(verbose=not args.quiet)
    except ValueError as e:
        print(f"❌ {e}")
        print("\n💡 Set environment variables:")
        print("   export OPENAI_API_KEY='your-key-here'")
        print("   export DEEPSEEK_API_KEY='your-key-here'  # optional")
        return 1

    # Find question files
    script_dir = Path(__file__).parent
    questions_dir = script_dir.parent / 'src' / 'data' / 'questions'

    if not questions_dir.exists():
        questions_dir = script_dir.parent / 'data' / 'questions'
    if not questions_dir.exists():
        questions_dir = script_dir

    if args.file:
        filepath = Path(args.file)
        # If absolute path, use as-is
        if filepath.is_absolute():
            files = [filepath]
        # If file exists in current dir, use it
        elif filepath.exists():
            files = [filepath]
        # Otherwise, look in questions_dir
        else:
            # Just use the filename, not the full path
            filename = filepath.name
            files = [questions_dir / filename]
    else:
        files = sorted(questions_dir.glob('*.json'))
        files = [f for f in files if f.name != 'package.json']

    if not files:
        print(f"❌ No JSON files found in {questions_dir}!")
        return 1

    # Check each file
    all_passed = True
    for filepath in files:
        passed, _ = checker.check_file(str(filepath), question_id=args.question)
        if not passed:
            all_passed = False

    return 0 if all_passed else 1


if __name__ == '__main__':
    sys.exit(main())
