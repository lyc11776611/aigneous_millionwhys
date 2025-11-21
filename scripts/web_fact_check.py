#!/usr/bin/env python3
"""
Web-based fact verification using Wikipedia, NASA, NIH, and web search.
No AI API keys required.
"""

import json
import glob
import re
import time
import urllib.parse
import urllib.request
from typing import Optional, Dict, List, Tuple

# Category to source mapping
CATEGORY_SOURCES = {
    'Astronomy & Space': ['nasa.gov', 'wikipedia'],
    'Animal Behavior': ['wikipedia', 'nationalgeographic'],
    'Chemistry Around Us': ['wikipedia', 'sciencedirect'],
    'Earth Science': ['wikipedia', 'usgs.gov'],
    'Human Biology': ['nih.gov', 'wikipedia', 'mayoclinic'],
    'Health & Medicine': ['nih.gov', 'cdc.gov', 'mayoclinic', 'wikipedia'],
    'Physics in Daily Life': ['wikipedia', 'physics.org'],
    'Plant Science': ['wikipedia', 'britannica'],
    'Weather & Climate': ['wikipedia', 'noaa.gov'],
    'Technology': ['wikipedia'],
    'Psychology & Behavior': ['wikipedia', 'apa.org'],
    'Food & Nutrition': ['nih.gov', 'wikipedia'],
    'Economics & Money': ['wikipedia', 'investopedia'],
    'Marine Life': ['wikipedia', 'noaa.gov'],
    'Insects': ['wikipedia'],
    'Household Science': ['wikipedia'],
    'Sports & Exercise': ['wikipedia', 'nih.gov'],
    'Music & Sound': ['wikipedia'],
    'Transportation': ['wikipedia'],
}


def fetch_url(url: str, timeout: int = 10) -> Optional[str]:
    """Fetch URL content with error handling."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (educational fact-checker)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None


def query_wikipedia(topic: str) -> Optional[Dict]:
    """Query Wikipedia API for a topic summary."""
    base_url = "https://en.wikipedia.org/api/rest_v1/page/summary/"
    encoded_topic = urllib.parse.quote(topic.replace(' ', '_'))
    url = base_url + encoded_topic

    content = fetch_url(url)
    if content:
        try:
            data = json.loads(content)
            return {
                'title': data.get('title', ''),
                'extract': data.get('extract', ''),
                'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
            }
        except json.JSONDecodeError:
            return None
    return None


def search_wikipedia(query: str, limit: int = 3) -> List[str]:
    """Search Wikipedia for relevant articles."""
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        'action': 'opensearch',
        'search': query,
        'limit': limit,
        'format': 'json'
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"

    content = fetch_url(url)
    if content:
        try:
            data = json.loads(content)
            return data[1] if len(data) > 1 else []
        except (json.JSONDecodeError, IndexError):
            return []
    return []


def extract_key_terms(question: str, explanation: str) -> List[str]:
    """Extract key scientific terms from question and explanation."""
    # Combine question and correct explanation
    text = f"{question} {explanation}".lower()

    # Remove common words
    stop_words = {'why', 'do', 'does', 'the', 'a', 'an', 'is', 'are', 'we', 'our',
                  'when', 'what', 'how', 'this', 'that', 'it', 'its', 'they', 'their',
                  'because', 'correct', 'wrong', 'actually', 'really', 'just', 'only',
                  'make', 'makes', 'help', 'helps', 'cause', 'causes', 'called'}

    # Extract potential terms (words and phrases)
    words = re.findall(r'\b[a-z]{4,}\b', text)
    terms = [w for w in words if w not in stop_words]

    # Count frequency and return top terms
    from collections import Counter
    freq = Counter(terms)
    return [term for term, _ in freq.most_common(5)]


def verify_with_wikipedia(question: str, correct_explanation: str, key_terms: List[str]) -> Dict:
    """Verify facts using Wikipedia."""
    results = {
        'verified': False,
        'confidence': 'low',
        'sources': [],
        'notes': []
    }

    matches = 0
    total_checks = 0

    for term in key_terms[:3]:  # Check top 3 terms
        # Search Wikipedia
        articles = search_wikipedia(term)
        if not articles:
            continue

        # Get summary of first article
        wiki_data = query_wikipedia(articles[0])
        if not wiki_data or not wiki_data.get('extract'):
            continue

        total_checks += 1
        extract = wiki_data['extract'].lower()
        explanation_lower = correct_explanation.lower()

        # Check if key concepts from explanation appear in Wikipedia
        explanation_words = set(re.findall(r'\b[a-z]{5,}\b', explanation_lower))
        wiki_words = set(re.findall(r'\b[a-z]{5,}\b', extract))

        overlap = explanation_words & wiki_words
        if len(overlap) >= 3:
            matches += 1
            results['sources'].append({
                'term': term,
                'article': wiki_data['title'],
                'url': wiki_data['url'],
                'overlap_words': list(overlap)[:5]
            })

    # Calculate confidence
    if total_checks > 0:
        ratio = matches / total_checks
        if ratio >= 0.7:
            results['verified'] = True
            results['confidence'] = 'high'
        elif ratio >= 0.4:
            results['verified'] = True
            results['confidence'] = 'medium'
        else:
            results['confidence'] = 'low'
            results['notes'].append('Limited Wikipedia coverage found')
    else:
        results['notes'].append('No Wikipedia articles found for key terms')

    return results


def check_question(question_data: Dict, category: str) -> Dict:
    """Check a single question's facts."""
    question = question_data['question_en']
    correct_idx = question_data['correct_answer']
    correct_explanation = question_data['explanations_en'][correct_idx]

    # Extract key terms
    key_terms = extract_key_terms(question, correct_explanation)

    # Verify with Wikipedia
    result = verify_with_wikipedia(question, correct_explanation, key_terms)
    result['question'] = question
    result['key_terms'] = key_terms

    return result


def verify_file(filepath: str, verbose: bool = True) -> Dict:
    """Verify all questions in a JSON file."""
    with open(filepath) as f:
        data = json.load(f)

    filename = filepath.split('/')[-1]
    category = data.get('category_en', filename)
    questions = data.get('questions', [])

    results = {
        'file': filename,
        'category': category,
        'total': len(questions),
        'verified_high': 0,
        'verified_medium': 0,
        'unverified': 0,
        'details': []
    }

    if verbose:
        print(f"\n{'='*60}")
        print(f"Verifying: {category} ({len(questions)} questions)")
        print('='*60)

    for i, q in enumerate(questions):
        qid = q.get('id', f'#{i}')

        if verbose:
            print(f"\n[{i+1}/{len(questions)}] {qid}: {q['question_en'][:40]}...")

        result = check_question(q, category)
        result['id'] = qid
        results['details'].append(result)

        if result['confidence'] == 'high':
            results['verified_high'] += 1
            status = '✓ HIGH'
        elif result['confidence'] == 'medium':
            results['verified_medium'] += 1
            status = '~ MEDIUM'
        else:
            results['unverified'] += 1
            status = '? LOW'

        if verbose:
            print(f"   Confidence: {status}")
            if result['sources']:
                print(f"   Sources: {len(result['sources'])} Wikipedia articles")

        time.sleep(0.5)  # Rate limiting

    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Web-based fact verification')
    parser.add_argument('--file', help='Specific file to verify (e.g., astronomy.json)')
    parser.add_argument('--category', help='Verify specific category')
    parser.add_argument('--question', help='Verify single question by ID')
    parser.add_argument('--summary', action='store_true', help='Show summary only')
    parser.add_argument('--output', help='Save results to JSON file')
    args = parser.parse_args()

    all_results = []

    if args.file:
        filepath = f"src/data/questions/{args.file}"
        results = verify_file(filepath, verbose=not args.summary)
        all_results.append(results)
    else:
        files = sorted(glob.glob('src/data/questions/*.json'))
        for filepath in files:
            results = verify_file(filepath, verbose=not args.summary)
            all_results.append(results)

    # Print summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)

    total_high = sum(r['verified_high'] for r in all_results)
    total_medium = sum(r['verified_medium'] for r in all_results)
    total_low = sum(r['unverified'] for r in all_results)
    total = total_high + total_medium + total_low

    print(f"\nTotal questions: {total}")
    print(f"  ✓ High confidence:   {total_high} ({100*total_high/total:.1f}%)")
    print(f"  ~ Medium confidence: {total_medium} ({100*total_medium/total:.1f}%)")
    print(f"  ? Low confidence:    {total_low} ({100*total_low/total:.1f}%)")

    print("\nBy category:")
    for r in all_results:
        total_cat = r['total']
        high_pct = 100 * r['verified_high'] / total_cat if total_cat > 0 else 0
        print(f"  {r['category']}: {r['verified_high']}/{total_cat} high ({high_pct:.0f}%)")

    # Save results if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(all_results, f, indent=2)
        print(f"\nResults saved to {args.output}")

    print("\nNote: Low confidence doesn't mean incorrect - just that Wikipedia")
    print("coverage was limited. Manual review recommended for low confidence items.")


if __name__ == '__main__':
    main()
