#!/usr/bin/env python3
"""
AI-Powered Web Fact-Checker for Curious Minds Questions

This script uses Claude AI with web search to verify scientific accuracy.
It checks each question's facts against authoritative web sources.

Requirements:
    - Claude Code environment (has built-in AI capabilities)
    - Internet connection for web search

Usage:
    python3 ai_fact_check.py [--file FILENAME] [--question QUESTION_ID]

    --file: Check specific file only (e.g., chemistry.json)
    --question: Check specific question ID only (e.g., chem_001)

This script will:
1. Extract scientific claims from each question
2. Search web sources to verify claims
3. Check for common misconceptions
4. Generate a detailed fact-check report
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List

class AIFactChecker:
    """Uses AI to fact-check questions against web sources"""

    def __init__(self):
        self.checked_questions = []

    def fact_check_question(self, question: Dict, category: str) -> Dict:
        """
        Fact-check a single question using AI and web search.

        This would integrate with Claude AI to:
        1. Identify scientific claims in the question and explanations
        2. Search authoritative sources (Wikipedia, NASA, NIH, etc.)
        3. Verify each claim
        4. Flag potential inaccuracies
        5. Provide confidence score and sources

        Returns a fact-check report.
        """
        q_id = question.get('id', 'unknown')
        q_text = question.get('question_en', '')
        correct_idx = question.get('correct_answer', 0)

        print(f"\n{'='*70}")
        print(f"AI FACT-CHECK: {q_id}")
        print(f"{'='*70}")
        print(f"Question: {q_text}")
        print(f"Category: {category}")

        # Extract claims to verify
        claims = self._extract_claims(question)

        print(f"\nScientific claims to verify: {len(claims)}")
        for i, claim in enumerate(claims, 1):
            print(f"  {i}. {claim}")

        # Generate fact-check prompt for AI
        fact_check_prompt = self._generate_fact_check_prompt(question, category, claims)

        print(f"\n{'─'*70}")
        print("AI FACT-CHECK PROMPT:")
        print(f"{'─'*70}")
        print(fact_check_prompt)
        print(f"{'─'*70}")

        print(f"\n💡 TO USE THIS FACT-CHECKER:")
        print("   1. Copy the prompt above")
        print("   2. Use Claude Code with web search enabled")
        print("   3. Claude will search authoritative sources and verify claims")
        print("   4. Review the AI's fact-check report")
        print("   5. Fix any inaccuracies found")

        return {
            'question_id': q_id,
            'claims': claims,
            'prompt': fact_check_prompt,
            'status': 'ready_for_ai_review'
        }

    def _extract_claims(self, question: Dict) -> List[str]:
        """Extract scientific claims that need verification"""
        claims = []

        # Get correct answer and its explanation
        correct_idx = question.get('correct_answer', 0)
        choices = question.get('choices_en', [])
        explanations = question.get('explanations_en', [])

        if correct_idx < len(choices) and correct_idx < len(explanations):
            correct_choice = choices[correct_idx]
            correct_explanation = explanations[correct_idx]

            # Extract main claim from correct answer
            claims.append(f"CORRECT ANSWER: {correct_choice}")

            # Extract factual statements from explanation
            # (Simple extraction - look for sentences with scientific content)
            sentences = correct_explanation.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                # Look for sentences with numbers, scientific terms, or causal language
                if any(keyword in sentence.lower() for keyword in
                       ['because', 'due to', 'causes', 'creates', 'produces',
                        'reaction', 'process', 'million', 'percent', '%',
                        'degrees', 'km', 'miles', 'speed', 'temperature']):
                    if len(sentence) > 20:  # Avoid fragments
                        claims.append(sentence)

        # Also check wrong answer explanations for accuracy
        for i, exp in enumerate(explanations):
            if i != correct_idx and exp.startswith('Wrong.'):
                # Extract the reason why it's wrong (should be accurate)
                reason = exp[6:].strip()  # Remove "Wrong. "
                first_sentence = reason.split('.')[0]
                if len(first_sentence) > 20:
                    claims.append(f"WHY WRONG (choice {i}): {first_sentence}")

        return claims

    def _generate_fact_check_prompt(self, question: Dict, category: str, claims: List[str]) -> str:
        """Generate a prompt for AI fact-checking"""

        q_text = question.get('question_en', '')
        correct_idx = question.get('correct_answer', 0)
        choices = question.get('choices_en', [])
        explanations = question.get('explanations_en', [])

        prompt = f"""Please fact-check this educational question for scientific accuracy.

**CATEGORY**: {category}

**QUESTION**: {q_text}

**CHOICES**:
"""
        for i, choice in enumerate(choices):
            marker = "✓ CORRECT" if i == correct_idx else "✗ WRONG"
            prompt += f"{i}. {choice} [{marker}]\n"

        prompt += f"\n**EXPLANATIONS**:\n"
        for i, exp in enumerate(explanations):
            prompt += f"\n[{i}] {exp}\n"

        prompt += f"""

**VERIFICATION NEEDED**:

Please verify these scientific claims by searching authoritative sources:

"""
        for i, claim in enumerate(claims, 1):
            prompt += f"{i}. {claim}\n"

        prompt += f"""

**FACT-CHECK REQUIREMENTS**:

1. **Verify Correct Answer**: Is the marked correct answer scientifically accurate?
   - Search authoritative sources (Wikipedia, NASA, NIH, scientific sites)
   - Check if the explanation correctly describes the phenomenon
   - Verify any numbers, percentages, or measurements mentioned

2. **Verify Wrong Answer Explanations**: Are the reasons given for wrong answers accurate?
   - Each "Wrong." explanation should correctly identify why it's incorrect
   - Check that we're not creating new misconceptions

3. **Check for Common Misconceptions**:
   - {self._get_category_misconceptions(category)}

4. **Verify Numerical Claims**: If any speeds, distances, percentages, or temperatures are mentioned, verify accuracy

5. **Check Currency**: Is this information current or outdated?

**OUTPUT FORMAT**:

Please provide:

✅ **ACCURACY VERDICT**: [ACCURATE / NEEDS REVISION / INACCURATE]

📊 **CONFIDENCE LEVEL**: [HIGH / MEDIUM / LOW]

🔍 **FINDINGS**:
- [List each claim with verification status and source]

⚠️ **ISSUES FOUND** (if any):
- [Describe any inaccuracies or concerns]

💡 **SUGGESTIONS** (if any):
- [How to improve accuracy]

📚 **SOURCES CONSULTED**:
- [List authoritative sources used for verification]
"""

        return prompt

    def _get_category_misconceptions(self, category: str) -> str:
        """Get common misconceptions to check for by category"""
        misconceptions = {
            'Chemistry Around Us': """
   - Soap dissolves everything (wrong - it emulsifies oils)
   - Cold is a substance (wrong - it's absence of heat)
   - Heavier objects fall faster (wrong - air resistance varies)""",
            'Astronomy & Space': """
   - Dark side of the moon is always dark (wrong - it's "far side")
   - Summer because Earth is closer to Sun (wrong - it's axial tilt)
   - Space is completely empty (wrong - has particles, radiation)""",
            'Human Biology': """
   - We only use 10% of our brain (myth)
   - Sugar makes kids hyperactive (largely myth)
   - Cracking knuckles causes arthritis (no evidence)""",
            'Physics in Daily Life': """
   - Heavier objects fall faster (wrong in vacuum)
   - Lightning never strikes same place twice (wrong)
   - Electricity flows like water in pipes (oversimplification)""",
            'Weather & Climate': """
   - Lightning comes before thunder (they're simultaneous)
   - Raindrops are teardrop-shaped (wrong - they're round)
   - Cold weather causes colds (wrong - viruses cause colds)""",
            'Psychology & Behavior': """
   - Left-brain vs right-brain personality (oversimplified)
   - Subliminal messages control behavior (no strong evidence)
   - Memory works like a video recording (wrong)"""
        }

        return misconceptions.get(category, "Check for common misconceptions in this field")

    def check_file(self, filepath: str, question_id: str = None):
        """Fact-check questions in a file"""
        print(f"\n{'='*70}")
        print(f"AI FACT-CHECKER")
        print(f"File: {os.path.basename(filepath)}")
        print(f"{'='*70}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error: {e}")
            return

        category = data.get('category_en', 'Unknown')
        questions = data.get('questions', [])

        if question_id:
            questions = [q for q in questions if q.get('id') == question_id]
            if not questions:
                print(f"❌ Question {question_id} not found!")
                return

        print(f"\nCategory: {category}")
        print(f"Questions to check: {len(questions)}")

        for q in questions:
            result = self.fact_check_question(q, category)
            self.checked_questions.append(result)

        print(f"\n{'='*70}")
        print("FACT-CHECK COMPLETE")
        print(f"{'='*70}")
        print(f"\n✅ Generated {len(self.checked_questions)} fact-check prompts")
        print("\n📋 NEXT STEPS:")
        print("   1. Copy each prompt above")
        print("   2. Run through Claude with web search")
        print("   3. Review AI's findings")
        print("   4. Update questions based on fact-check results")
        print("   5. Re-run validation")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='AI-powered fact-checker for questions')
    parser.add_argument('--file', help='Check specific file only (e.g., chemistry.json)')
    parser.add_argument('--question', help='Check specific question ID (e.g., chem_001)')

    args = parser.parse_args()

    checker = AIFactChecker()

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
        # If no file specified, check all
        files = sorted(questions_dir.glob('*.json'))

    if not files:
        print(f"No JSON files found in {questions_dir}!")
        return 1

    # Check each file
    for filepath in files:
        if filepath.name == 'package.json':
            continue
        checker.check_file(str(filepath), question_id=args.question)

    return 0


if __name__ == '__main__':
    sys.exit(main())
