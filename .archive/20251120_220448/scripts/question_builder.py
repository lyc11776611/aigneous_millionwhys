#!/usr/bin/env python3
"""
Question Builder - Completes question drafts with AI assistance

This module takes minimal question drafts and uses Claude AI to:
- Translate English to Chinese
- Generate detailed explanations
- Validate character limits
- Ensure scientific accuracy
"""

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import anthropic


@dataclass
class QuestionDraft:
    """Represents a question draft with minimal required fields"""
    question_en: str
    correct_answer: int
    choices_en: List[str]
    difficulty: str = "medium"
    question_zh: Optional[str] = None
    choices_zh: Optional[List[str]] = None
    explanations_en: Optional[List[str]] = None
    explanations_zh: Optional[List[str]] = None


class QuestionBuilder:
    """Builds complete questions from drafts using AI"""

    # Character limits
    LIMITS = {
        'question_en': 45,
        'question_zh': 25,
        'choice_en': 35,
        'choice_zh': 15,
    }

    def __init__(self, use_ai: bool = True, api_key: Optional[str] = None):
        """
        Initialize Question Builder

        Args:
            use_ai: Whether to use AI for generation (requires ANTHROPIC_API_KEY)
            api_key: Optional API key (uses env var if not provided)
        """
        self.use_ai = use_ai

        if use_ai:
            api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
            if not api_key:
                raise ValueError(
                    "ANTHROPIC_API_KEY environment variable required when use_ai=True. "
                    "Get your key at: https://console.anthropic.com/"
                )
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            self.client = None

    def complete_question(self, draft: QuestionDraft, category: str) -> Dict:
        """
        Complete a question draft with all required fields

        Args:
            draft: QuestionDraft with minimal fields
            category: Category name for context

        Returns:
            Complete question dict ready for JSON

        Raises:
            ValueError: If character limits exceeded or validation fails
        """
        # Validate required fields
        self._validate_draft(draft)

        # Generate missing Chinese translations
        if not draft.question_zh and self.use_ai:
            draft.question_zh = self._translate_to_chinese(draft.question_en)

        if not draft.choices_zh and self.use_ai:
            draft.choices_zh = [
                self._translate_to_chinese(choice, max_length=self.LIMITS['choice_zh'])
                for choice in draft.choices_en
            ]

        # Generate explanations if missing
        if not draft.explanations_en and self.use_ai:
            draft.explanations_en = self._generate_explanations(draft, category)

        if not draft.explanations_zh and self.use_ai:
            draft.explanations_zh = self._translate_explanations(draft.explanations_en)

        # Validate all character limits
        self._validate_lengths(draft)

        # Convert to dict (without ID - that's added by CLI)
        return {
            'question_en': draft.question_en,
            'question_zh': draft.question_zh,
            'choices_en': draft.choices_en,
            'choices_zh': draft.choices_zh,
            'correct_answer': draft.correct_answer,
            'explanations_en': draft.explanations_en,
            'explanations_zh': draft.explanations_zh,
            'difficulty': draft.difficulty
        }

    def _translate_to_chinese(self, text: str, max_length: Optional[int] = None) -> str:
        """
        Translate English text to Chinese

        Args:
            text: English text to translate
            max_length: Optional character limit for Chinese text

        Returns:
            Chinese translation
        """
        if not self.client:
            return "[Chinese translation - AI disabled]"

        constraint = f" Keep it under {max_length} Chinese characters." if max_length else ""

        prompt = f"""Translate this to natural, concise Chinese:{constraint}

English: {text}

Return ONLY the Chinese translation, nothing else."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-haiku-20241022",  # Fast model for translation
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            print(f"Warning: Translation failed: {e}")
            return f"[Translation needed: {text}]"

    def _generate_explanations(self, draft: QuestionDraft, category: str) -> List[str]:
        """
        Generate 4 educational explanations using AI

        Args:
            draft: Question draft
            category: Category for context

        Returns:
            List of 4 explanations (one for each choice)
        """
        if not self.client:
            return [f"[Explanation {i} - AI disabled]" for i in range(4)]

        choices_text = "\n".join([f"{i}. {c}" for i, c in enumerate(draft.choices_en)])

        prompt = f"""Generate 4 educational explanations for this multiple-choice question in the "{category}" category.

Question: {draft.question_en}

Choices:
{choices_text}

Correct answer: {draft.correct_answer}
Difficulty: {draft.difficulty}

Requirements:
1. For the CORRECT answer (index {draft.correct_answer}):
   - Start with "Correct!"
   - Explain the scientific reasoning in detail
   - Include specific facts, numbers, or mechanisms
   - Make it educational and engaging

2. For WRONG answers:
   - Start with "Wrong."
   - Explain why this answer is incorrect
   - Clarify the misconception
   - Optionally mention what's actually true

3. Each explanation should be:
   - Clear and concise (100-150 words)
   - Scientifically accurate
   - Age-appropriate for general audiences
   - Educational even when wrong

Return as a JSON array of exactly 4 strings, in order [explanation_0, explanation_1, explanation_2, explanation_3]."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",  # Better model for content generation
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            # Parse JSON response
            text = response.content[0].text.strip()

            # Try to extract JSON if wrapped in markdown
            if text.startswith("```"):
                # Remove markdown code block
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if len(lines) > 2 else text

            explanations = json.loads(text)

            if not isinstance(explanations, list) or len(explanations) != 4:
                raise ValueError("Expected array of 4 explanations")

            return explanations

        except Exception as e:
            print(f"Warning: Explanation generation failed: {e}")
            return [
                f"Explanation for choice {i}: [Generation failed - please write manually]"
                for i in range(4)
            ]

    def _translate_explanations(self, explanations_en: List[str]) -> List[str]:
        """
        Translate explanations to Chinese

        Args:
            explanations_en: English explanations

        Returns:
            Chinese translations
        """
        if not self.client:
            return ["[Chinese explanation - AI disabled]"] * 4

        return [self._translate_to_chinese(exp) for exp in explanations_en]

    def _validate_draft(self, draft: QuestionDraft):
        """Validate draft has required fields"""
        if not draft.question_en:
            raise ValueError("question_en is required")

        if not draft.choices_en or len(draft.choices_en) != 4:
            raise ValueError("choices_en must have exactly 4 items")

        if draft.correct_answer not in [0, 1, 2, 3]:
            raise ValueError("correct_answer must be 0, 1, 2, or 3")

        if draft.difficulty not in ['easy', 'medium', 'hard']:
            raise ValueError("difficulty must be easy, medium, or hard")

    def _validate_lengths(self, draft: QuestionDraft):
        """Validate all character limits"""
        errors = []

        # Check English question
        if len(draft.question_en) > self.LIMITS['question_en']:
            errors.append(
                f"question_en too long: {len(draft.question_en)} > {self.LIMITS['question_en']} chars"
            )

        # Check Chinese question
        if draft.question_zh and len(draft.question_zh) > self.LIMITS['question_zh']:
            errors.append(
                f"question_zh too long: {len(draft.question_zh)} > {self.LIMITS['question_zh']} chars"
            )

        # Check English choices
        for i, choice in enumerate(draft.choices_en):
            if len(choice) > self.LIMITS['choice_en']:
                errors.append(
                    f"choices_en[{i}] too long: {len(choice)} > {self.LIMITS['choice_en']} chars"
                )

        # Check Chinese choices
        if draft.choices_zh:
            for i, choice in enumerate(draft.choices_zh):
                if len(choice) > self.LIMITS['choice_zh']:
                    errors.append(
                        f"choices_zh[{i}] too long: {len(choice)} > {self.LIMITS['choice_zh']} chars"
                    )

        if errors:
            raise ValueError("Character limit violations:\n" + "\n".join(errors))


# CLI for testing
if __name__ == '__main__':
    # Test with a sample question
    draft = QuestionDraft(
        question_en="Why do cats have vertical pupils?",
        correct_answer=1,
        choices_en=[
            "To see in the dark better",
            "Better depth perception for hunting",
            "Protect eyes from bright sun",
            "See ultraviolet light"
        ],
        difficulty="medium"
    )

    builder = QuestionBuilder(use_ai=True)
    result = builder.complete_question(draft, "Animals")

    print("Generated Question:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
