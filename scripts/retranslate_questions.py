#!/usr/bin/env python3
"""Retranslate all questions to Chinese using DeepSeek API."""

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

def translate(text: str, max_chars: int = None) -> str:
    """Translate English text to Chinese using DeepSeek."""
    prompt = "Translate this to Chinese (Simplified)"
    if max_chars:
        prompt += f" (max {max_chars} characters)"
    prompt += f":\n\n{text}\n\nProvide ONLY the Chinese translation, nothing else."

    try:
        response = client.chat.completions.create(
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
        print(f"  Error: {e}")
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

        # Translate question
        print("  Translating question...")
        q['question_zh'] = translate(q['question_en'], max_chars=25)

        # Translate choices
        print("  Translating choices...")
        q['choices_zh'] = [translate(c, max_chars=15) for c in q['choices_en']]

        # Translate explanations
        print("  Translating explanations...")
        q['explanations_zh'] = [translate(e) for e in q['explanations_en']]

        print(f"  ✓ Done")
        time.sleep(0.1)  # Small delay to avoid rate limits

    # Save updated file
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Saved {filename}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Retranslate questions using DeepSeek')
    parser.add_argument('--file', help='Specific file to translate (e.g., animals.json)')
    parser.add_argument('--timestamp', default='2025-11-20T00:07', help='Only translate questions with this timestamp prefix')
    parser.add_argument('--all', action='store_true', help='Translate ALL questions regardless of timestamp')
    args = parser.parse_args()

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
    print("All translations complete!")

if __name__ == '__main__':
    main()
