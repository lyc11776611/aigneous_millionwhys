#!/usr/bin/env python3
"""Retranslate all questions to Chinese using DeepSeek API with full context."""

import json
import glob
import os
import time
from openai import OpenAI

# Initialize DeepSeek client
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    print("Error: DEEPSEEK_API_KEY not set")
    exit(1)

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# Character limits (relaxed for clarity)
LIMITS = {
    'question_zh': 35,
    'choice_zh': 25,
}

def translate_question_with_context(question: dict) -> dict:
    """Translate entire question with full context using DeepSeek.

    Translates question, choices, and explanations together to maintain
    context and coherence.

    Returns:
        Dict with 'question', 'choices', 'explanations' keys
    """
    correct_idx = question['correct_answer']

    # Build structured prompt with full context
    prompt = f"""请将以下科普问答翻译成简体中文。这是"十万个为什么"风格的科普问题，目标读者是对科学好奇的普通大众。

翻译要求：
1. 使用生动、有趣、吸引人的语言风格
2. 保持科学准确性，但用通俗易懂的表达
3. 所有选项必须与问题紧密相关，确保语义连贯
4. 问题不超过{LIMITS['question_zh']}字
5. 每个选项不超过{LIMITS['choice_zh']}字
6. 解释可以适当放宽字数，保证清晰易懂

请按以下JSON格式返回（只返回JSON，不要其他文字）：

{{
  "question": "问题翻译",
  "choices": ["选项1", "选项2", "选项3", "选项4"],
  "explanations": ["解释1", "解释2", "解释3", "解释4"]
}}

原文：

**问题：** {question['question_en']}

**选项：**
1. {question['choices_en'][0]}
2. {question['choices_en'][1]}
3. {question['choices_en'][2]}
4. {question['choices_en'][3]}

**解释：**
1. {question['explanations_en'][0]}
2. {question['explanations_en'][1]}
3. {question['explanations_en'][2]}
4. {question['explanations_en'][3]}

（正确答案是选项 {correct_idx + 1}）
"""

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": "你是一位优秀的科普翻译专家，擅长将英文科学知识翻译成生动有趣、通俗易懂的中文。你的翻译风格活泼、吸引人，同时保持科学严谨性。"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,  # Slightly higher for more natural/engaging language
            response_format={"type": "json_object"}
        )

        result_text = response.choices[0].message.content.strip()
        translation = json.loads(result_text)

        # Validate structure
        if not all(key in translation for key in ['question', 'choices', 'explanations']):
            raise ValueError("Translation missing required keys")

        if len(translation['choices']) != 4 or len(translation['explanations']) != 4:
            raise ValueError("Translation must have exactly 4 choices and 4 explanations")

        return translation

    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return None

def retranslate_file(filepath: str, timestamp_filter: str = None):
    """Retranslate all questions in a file."""
    with open(filepath) as f:
        data = json.load(f)

    filename = os.path.basename(filepath)
    questions = data.get('questions', [])

    # Filter questions by timestamp if specified
    if timestamp_filter:
        questions_to_translate = [q for q in questions if q.get('created_at', '').startswith(timestamp_filter)]
    else:
        questions_to_translate = questions

    if not questions_to_translate:
        print(f"{filename}: No questions to translate")
        return

    print(f"\n{'='*60}")
    print(f"Processing: {filename} ({len(questions_to_translate)} questions)")
    print('='*60)

    for i, q in enumerate(questions_to_translate):
        qid = q.get('id', f'#{i}')
        print(f"\n[{i+1}/{len(questions_to_translate)}] {qid}: {q['question_en'][:40]}...")

        # Translate with full context
        print("  🇨🇳 Translating (with context)...")
        translation = translate_question_with_context(q)

        if translation:
            q['question_zh'] = translation['question']
            q['choices_zh'] = translation['choices']
            q['explanations_zh'] = translation['explanations']
            print(f"  ✅ Done")
        else:
            print(f"  ❌ Failed - keeping old translation")

        time.sleep(0.5)  # Rate limit delay

    # Save updated file
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Saved {filename}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Retranslate questions using DeepSeek with contextual translation')
    parser.add_argument('--file', help='Specific file to translate (e.g., animals.json)')
    parser.add_argument('--timestamp', default='2025-11-20T00:07', help='Only translate questions with this timestamp prefix')
    parser.add_argument('--all', action='store_true', help='Translate ALL questions regardless of timestamp')
    args = parser.parse_args()

    print("\n" + "="*60)
    print("🚀 Contextual Translation Mode")
    print("="*60)
    print("Using improved translation with:")
    print("  ✓ Full context (question + choices + explanations)")
    print("  ✓ Fun, engaging '十万个为什么' style")
    print("  ✓ Relaxed limits (question: 30字, choices: 20字)")
    print("="*60)

    if args.file:
        filepath = f"src/data/questions/{args.file}"
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        retranslate_file(filepath, None if args.all else args.timestamp)
    else:
        files = sorted(glob.glob('src/data/questions/*.json'))
        for filepath in files:
            retranslate_file(filepath, None if args.all else args.timestamp)

    print("\n" + "="*60)
    print("✅ All translations complete!")
    print("="*60)

if __name__ == '__main__':
    main()
