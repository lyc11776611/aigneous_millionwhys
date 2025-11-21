#!/usr/bin/env python3
"""
Question Builder V2 - Claude-based Generation with DeepSeek Translation

New Workflow:
1. Generate questions in English (using Claude/Anthropic API)
2. Self fact-check and correct (using Claude)
3. Translate to Chinese (using DeepSeek API)
4. Add timestamps (created_at, last_modified_at)
"""

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import anthropic

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


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


class QuestionBuilderV2:
    """Builds complete questions using Claude for generation and DeepSeek for translation"""

    # Character limits
    LIMITS = {
        'question_en': 45,
        'question_zh': 25,
        'choice_en': 35,
        'choice_zh': 15,
    }

    def __init__(self, use_claude: bool = True, use_deepseek: bool = True):
        """
        Initialize Question Builder V2

        Args:
            use_claude: Use Claude for generation and fact-checking (recommended)
            use_deepseek: Use DeepSeek for Chinese translation (recommended)
        """
        self.use_claude = use_claude
        self.use_deepseek = use_deepseek

        # Initialize Claude client (Anthropic API)
        if use_claude:
            claude_key = os.getenv('ANTHROPIC_API_KEY')
            if not claude_key:
                raise ValueError(
                    "ANTHROPIC_API_KEY environment variable required. "
                    "Get your key at: https://console.anthropic.com/"
                )
            self.claude_client = anthropic.Anthropic(api_key=claude_key)
        else:
            self.claude_client = None

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
                        print(f"⚠️  DeepSeek API initialization failed: {e}")
                        self.deepseek_client = None
                else:
                    print("ℹ️  DEEPSEEK_API_KEY not found - Chinese translation will be skipped")
                    self.deepseek_client = None
        else:
            self.deepseek_client = None

    def complete_question(self, draft: QuestionDraft, category: str) -> Dict:
        """
        Complete a question draft following the new workflow:
        1. Generate English explanations (Claude)
        2. Self fact-check and correct (Claude)
        3. Translate to Chinese (DeepSeek)
        4. Add timestamps

        Args:
            draft: QuestionDraft with English content
            category: Category name for context

        Returns:
            Complete question dict with timestamps
        """
        print(f"\n🔨 Processing: {draft.question_en}")

        # Step 1: Validate English content
        self._validate_draft(draft)

        # Step 2: Generate English explanations if missing (using Claude)
        if not draft.explanations_en:
            print("  📝 Generating English explanations...")
            draft.explanations_en = self._generate_explanations_claude(draft, category)

        # Step 3: Self fact-check and correct (using Claude)
        print("  🔬 Fact-checking with Claude...")
        draft = self._fact_check_and_correct(draft, category)

        # Step 4: Translate to Chinese (using DeepSeek)
        if not draft.question_zh:
            print("  🇨🇳 Translating to Chinese with DeepSeek...")
            draft.question_zh = self._translate_to_chinese_deepseek(draft.question_en)

        if not draft.choices_zh:
            draft.choices_zh = [
                self._translate_to_chinese_deepseek(choice)
                for choice in draft.choices_en
            ]

        if not draft.explanations_zh:
            draft.explanations_zh = [
                self._translate_to_chinese_deepseek(exp)
                for exp in draft.explanations_en
            ]

        # Step 5: Validate character limits
        self._validate_lengths(draft)

        # Step 6: Add timestamps
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

    def _generate_explanations_claude(self, draft: QuestionDraft, category: str) -> List[str]:
        """Generate 4 educational explanations using Claude"""
        if not self.claude_client:
            return [f"[Explanation {i} - Claude disabled]" for i in range(4)]

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
   - Length: 100-150 words

2. For WRONG answers:
   - Start with "Wrong."
   - Explain why this answer is incorrect
   - Clarify the misconception
   - Mention what's actually true
   - Length: 80-120 words

3. All explanations should be:
   - Scientifically accurate
   - Age-appropriate for general audiences
   - Educational even when wrong
   - Clear and concise

Return ONLY a JSON array of exactly 4 strings, in order [explanation_0, explanation_1, explanation_2, explanation_3].
No additional text, just the JSON array."""

        try:
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            text = response.content[0].text.strip()

            # Try to extract JSON if wrapped in markdown
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
                if text.startswith("json"):
                    text = text[4:].strip()

            explanations = json.loads(text)

            if not isinstance(explanations, list) or len(explanations) != 4:
                raise ValueError("Expected array of 4 explanations")

            return explanations

        except Exception as e:
            print(f"    ⚠️  Warning: Explanation generation failed: {e}")
            return [
                f"Explanation for choice {i}: [Generation failed - please write manually]"
                for i in range(4)
            ]

    def _fact_check_and_correct(self, draft: QuestionDraft, category: str) -> QuestionDraft:
        """
        Self fact-check using Claude and auto-correct if needed
        This replaces the OpenAI-based fact-checking
        """
        if not self.claude_client:
            print("    ℹ️  Claude not available - skipping fact-check")
            return draft

        correct_idx = draft.correct_answer
        correct_choice = draft.choices_en[correct_idx]
        correct_explanation = draft.explanations_en[correct_idx]

        prompt = f"""You are a scientific fact-checker. Review this educational question for accuracy.

**Category**: {category}
**Question**: {draft.question_en}
**Correct Answer (index {correct_idx})**: {correct_choice}
**Explanation**: {correct_explanation}

**Task**:
1. Verify the scientific accuracy of the correct answer
2. Check if the explanation is complete and accurate
3. Identify any factual errors or misconceptions
4. If corrections are needed, provide corrected versions

**Respond in JSON format**:
{{
    "is_accurate": true/false,
    "issues_found": ["list of any issues"],
    "corrected_explanation": "corrected version if needed (or null if accurate)",
    "confidence": "HIGH|MEDIUM|LOW"
}}"""

        try:
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )

            text = response.content[0].text.strip()

            # Extract JSON
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
                if text.startswith("json"):
                    text = text[4:].strip()

            result = json.loads(text)

            if not result.get('is_accurate', True):
                print(f"    ⚠️  Accuracy issue found: {result.get('issues_found', [])}")
                if result.get('corrected_explanation'):
                    print(f"    ✏️  Auto-correcting explanation...")
                    draft.explanations_en[correct_idx] = result['corrected_explanation']
            else:
                print(f"    ✅ Fact-check passed (confidence: {result.get('confidence', 'N/A')})")

            return draft

        except Exception as e:
            print(f"    ⚠️  Fact-check error: {e}")
            return draft

    def _translate_to_chinese_deepseek(self, text: str) -> str:
        """Translate English to Chinese using DeepSeek"""
        if not self.deepseek_client:
            return "[Chinese translation - DeepSeek not available]"

        # Determine max length based on text type
        if len(text) <= 50:  # Likely a question or choice
            max_chars = 25 if len(text) <= 45 else 15
            constraint = f"请保持在{max_chars}个中文字符以内。"
        else:  # Likely an explanation
            constraint = "保持简洁清晰。"

        prompt = f"""请将以下英文翻译成自然、流畅的中文。{constraint}

英文：{text}

要求：
1. 翻译准确传达原意
2. 中文表达自然地道
3. 科学术语翻译准确
4. 适合普通读者阅读

只返回中文翻译，不要其他内容。"""

        try:
            response = self.deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )

            translation = response.choices[0].message.content.strip()

            # Remove quotes if present
            if translation.startswith('"') and translation.endswith('"'):
                translation = translation[1:-1]
            if translation.startswith('"') and translation.endswith('"'):
                translation = translation[1:-1]

            return translation

        except Exception as e:
            print(f"    ⚠️  Translation error: {e}")
            return f"[Translation failed: {text[:30]}...]"

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
            # Try to shorten it
            if self.deepseek_client:
                print(f"    ⚠️  Question too long ({len(draft.question_zh)} chars), shortening...")
                draft.question_zh = self._translate_to_chinese_deepseek(draft.question_en)
            else:
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
                    # Try to shorten it
                    if self.deepseek_client:
                        print(f"    ⚠️  Choice {i} too long ({len(choice)} chars), shortening...")
                        draft.choices_zh[i] = self._translate_to_chinese_deepseek(draft.choices_en[i])
                    else:
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

    builder = QuestionBuilderV2(use_claude=True, use_deepseek=True)
    result = builder.complete_question(draft, "Animals")

    print("\n" + "="*70)
    print("Generated Question:")
    print("="*70)
    print(json.dumps(result, indent=2, ensure_ascii=False))
