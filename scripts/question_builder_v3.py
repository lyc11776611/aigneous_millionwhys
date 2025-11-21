#!/usr/bin/env python3
"""
Question Builder V3 - DeepSeek Translation Only (Fact-checking done by Claude Code)

New Workflow:
1. User or Claude Code creates questions in English (with fact-checking in conversation)
2. Script translates to Chinese (using DeepSeek API)
3. Script adds timestamps (created_at, last_modified_at)
4. No Anthropic API needed - fact-checking happens in Claude Code conversation
"""

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timezone

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


@dataclass
class QuestionDraft:
    """Represents a question draft with required fields"""
    question_en: str
    correct_answer: int
    choices_en: List[str]
    explanations_en: List[str]  # Required - fact-checked by Claude Code
    difficulty: str = "medium"
    question_zh: Optional[str] = None
    choices_zh: Optional[List[str]] = None
    explanations_zh: Optional[List[str]] = None


class QuestionBuilderV3:
    """Builds complete questions using DeepSeek for translation only"""

    # Character limits
    LIMITS = {
        'question_en': 45,
        'question_zh': 25,
        'choice_en': 35,
        'choice_zh': 15,
    }

    def __init__(self, use_deepseek: bool = True):
        """
        Initialize Question Builder V3

        Args:
            use_deepseek: Use DeepSeek for Chinese translation (recommended)

        Note: English explanations should be provided in the draft,
              fact-checked by Claude Code in the conversation
        """
        self.use_deepseek = use_deepseek

        # Initialize DeepSeek client (for Chinese translation only)
        if use_deepseek:
            if OpenAI is None:
                print("⚠️  Warning: openai package not installed. Install with: pip install openai")
                self.deepseek_client = None
            else:
                deepseek_key = os.getenv('DEEPSEEK_API_KEY')
                if deepseek_key:
                    try:
                        self.deepseek_client = OpenAI(
                            api_key=deepseek_key,
                            base_url="https://api.deepseek.com"
                        )
                        print("✅ DeepSeek API available for Chinese translation")
                    except Exception as e:
                        print(f"⚠️  Warning: Could not initialize DeepSeek client: {e}")
                        self.deepseek_client = None
                else:
                    print("⚠️  Warning: DEEPSEEK_API_KEY not found - Chinese translation will be skipped")
                    self.deepseek_client = None
        else:
            self.deepseek_client = None

    def complete_question(self, draft: QuestionDraft, category: str) -> Dict:
        """
        Complete a question draft:
        1. Validate English content (should be fact-checked by Claude Code already)
        2. Translate to Chinese (DeepSeek)
        3. Add timestamps

        Args:
            draft: QuestionDraft with fact-checked English content
            category: Category name for context

        Returns:
            Complete question dict with timestamps
        """
        print(f"\n🔨 Processing: {draft.question_en}")

        # Step 1: Validate English content
        self._validate_draft(draft)

        # Step 2: Ensure we have explanations (fact-checked by Claude Code)
        if not draft.explanations_en or len(draft.explanations_en) != 4:
            raise ValueError(
                "English explanations required (4 explanations). "
                "These should be fact-checked by Claude Code before running this script."
            )

        # Step 3: Translate to Chinese (using DeepSeek)
        if not draft.question_zh:
            print("  🇨🇳 Translating question to Chinese...")
            draft.question_zh = self._translate_to_chinese_deepseek(draft.question_en)

        if not draft.choices_zh:
            print("  🇨🇳 Translating choices to Chinese...")
            draft.choices_zh = [
                self._translate_to_chinese_deepseek(choice)
                for choice in draft.choices_en
            ]

        if not draft.explanations_zh:
            print("  🇨🇳 Translating explanations to Chinese...")
            draft.explanations_zh = [
                self._translate_to_chinese_deepseek(exp)
                for exp in draft.explanations_en
            ]

        # Step 4: Validate character limits
        self._validate_lengths(draft)

        # Step 5: Add timestamps
        now = datetime.now(timezone.utc).isoformat()

        # Convert to dict with timestamps
        question = {
            'question_en': draft.question_en,
            'question_zh': draft.question_zh,
            'choices_en': draft.choices_en,
            'choices_zh': draft.choices_zh,
            'correct_answer': draft.correct_answer,
            'explanations_en': draft.explanations_en,
            'explanations_zh': draft.explanations_zh,
            'difficulty': draft.difficulty,
            'created_at': now,
            'last_modified_at': now
        }

        print("  ✅ Question completed successfully")
        return question

    def _translate_to_chinese_deepseek(self, text: str, max_chars: Optional[int] = None) -> str:
        """Translate English text to Chinese using DeepSeek"""
        if not self.deepseek_client:
            return f"[Translation pending: {text[:30]}...]"

        try:
            prompt = f"Translate this to Chinese (Simplified)"
            if max_chars:
                prompt += f" (max {max_chars} characters)"
            prompt += f":\n\n{text}\n\nProvide ONLY the Chinese translation, nothing else."

            response = self.deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a translator. Provide only the translation, no explanations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            translation = response.choices[0].message.content.strip()
            # Remove quotes if present
            if translation.startswith('"') and translation.endswith('"'):
                translation = translation[1:-1]
            if translation.startswith("'") and translation.endswith("'"):
                translation = translation[1:-1]

            return translation

        except Exception as e:
            print(f"    ⚠️  Translation error: {e}")
            return f"[Translation failed: {text[:30]}...]"

    def _validate_draft(self, draft: QuestionDraft):
        """Validate basic draft structure"""
        if len(draft.choices_en) != 4:
            raise ValueError(f"Must have exactly 4 choices (got {len(draft.choices_en)})")

        if draft.correct_answer not in [0, 1, 2, 3]:
            raise ValueError(f"correct_answer must be 0-3 (got {draft.correct_answer})")

        if draft.difficulty not in ['easy', 'medium', 'hard']:
            raise ValueError(f"difficulty must be easy/medium/hard (got {draft.difficulty})")

    def _validate_lengths(self, draft: QuestionDraft):
        """Validate character limits"""
        errors = []

        # Check English
        if len(draft.question_en) > self.LIMITS['question_en']:
            errors.append(
                f"question_en too long: {len(draft.question_en)} > {self.LIMITS['question_en']} chars"
            )

        for i, choice in enumerate(draft.choices_en):
            if len(choice) > self.LIMITS['choice_en']:
                errors.append(
                    f"choices_en[{i}] too long: {len(choice)} > {self.LIMITS['choice_en']} chars"
                )

        # Check Chinese (only if translated)
        if draft.question_zh:
            if len(draft.question_zh) > self.LIMITS['question_zh']:
                # Try to re-translate with length constraint
                if self.deepseek_client:
                    print(f"    ⚠️  Chinese question too long ({len(draft.question_zh)} chars), retrying with constraint...")
                    draft.question_zh = self._translate_to_chinese_deepseek(
                        draft.question_en,
                        max_chars=self.LIMITS['question_zh']
                    )
                    if len(draft.question_zh) > self.LIMITS['question_zh']:
                        errors.append(
                            f"question_zh too long even after retry: {len(draft.question_zh)} > {self.LIMITS['question_zh']} chars"
                        )
                else:
                    errors.append(
                        f"question_zh too long: {len(draft.question_zh)} > {self.LIMITS['question_zh']} chars"
                    )

        if draft.choices_zh:
            for i, choice in enumerate(draft.choices_zh):
                if len(choice) > self.LIMITS['choice_zh']:
                    # Try to re-translate with length constraint
                    if self.deepseek_client:
                        print(f"    ⚠️  Chinese choice {i} too long, retrying...")
                        draft.choices_zh[i] = self._translate_to_chinese_deepseek(
                            draft.choices_en[i],
                            max_chars=self.LIMITS['choice_zh']
                        )
                        if len(draft.choices_zh[i]) > self.LIMITS['choice_zh']:
                            errors.append(
                                f"choices_zh[{i}] too long even after retry: {len(choice)} > {self.LIMITS['choice_zh']} chars"
                            )
                    else:
                        errors.append(
                            f"choices_zh[{i}] too long: {len(choice)} > {self.LIMITS['choice_zh']} chars"
                        )

        if errors:
            raise ValueError("Character limit violations:\n" + "\n".join(errors))


# CLI for testing
if __name__ == '__main__':
    # Test with a sample question (with fact-checked explanations)
    draft = QuestionDraft(
        question_en="Why do cats have vertical pupils?",
        correct_answer=1,
        choices_en=[
            "To look scary",
            "To hunt small prey precisely",
            "To see in the dark better",
            "Because they're related to snakes"
        ],
        explanations_en=[
            "Wrong. While vertical pupils might look intimidating, their primary purpose is hunting precision, not intimidation.",
            "Correct! Vertical slit pupils help cats judge distances accurately when hunting small prey at ground level. They can narrow their pupils to fine slits in bright light while expanding them wide in darkness.",
            "Wrong. While cats see well in darkness, that's due to their reflective layer (tapetum lucidum) and rod-rich retinas, not the pupil shape.",
            "Wrong. Snakes have different eye structures. Cats have vertical pupils because they're ambush predators hunting small prey."
        ],
        difficulty="medium"
    )

    builder = QuestionBuilderV3(use_deepseek=True)
    result = builder.complete_question(draft, "Animals")

    print("\n" + "="*60)
    print("Complete Question:")
    print("="*60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
