# Question Database - Curious Minds

## Overview

This directory contains bilingual (English/Chinese) Q&A questions for the Curious Minds mobile app. Each question is designed to be scientifically accurate, mobile-friendly, and educational.

## Current Status

**Total questions**: 34
**Topics covered**: 10/10 ✅ COMPLETE
**Format**: MVP (Simplified) ✅
**Validation**: 3-layer automated system ✅

## Topics

1. **Astronomy & Space** (天文与太空) - 3 questions
2. **Weather & Climate** (天气与气候) - 3 questions
3. **Human Biology** (人体生物学) - 3 questions
4. **Physics in Daily Life** (日常物理) - 3 questions
5. **Chemistry Around Us** (身边的化学) - 4 questions
6. **Animal Behavior** (动物行为) - 3 questions
7. **Plant Science** (植物科学) - 3 questions
8. **Psychology & Behavior** (心理与行为) - 3 questions
9. **Economics & Money** (经济与金融) - 3 questions
10. **Technology** (技术) - 3 questions

## MVP Format Structure

Each topic file follows this simplified structure:

```json
{
  "category_en": "Category Name",
  "category_zh": "分类名称",
  "questions": [
    {
      "id": "category_###",
      "question_en": "Why does X happen?",
      "question_zh": "为什么会发生X？",
      "choices_en": [
        "Reason 1",
        "Reason 2",
        "Reason 3",
        "Reason 4"
      ],
      "choices_zh": [
        "原因1",
        "原因2",
        "原因3",
        "原因4"
      ],
      "correct_answer": 1,
      "explanations_en": [
        "Wrong. Explanation why choice 0 is incorrect...",
        "Correct! Explanation why choice 1 is right...",
        "Wrong. Explanation why choice 2 is incorrect...",
        "Wrong. Explanation why choice 3 is incorrect..."
      ],
      "explanations_zh": [
        "错误。解释为什么选项0不正确...",
        "正确！解释为什么选项1正确...",
        "错误。解释为什么选项2不正确...",
        "错误。解释为什么选项3不正确..."
      ],
      "difficulty": "easy|medium|hard"
    }
  ]
}
```

### Required Fields

**Per question:**
- `id`: Unique identifier (format: `category_###`)
- `question_en`: Question in English (≤45 chars)
- `question_zh`: Question in Chinese (≤25 chars)
- `choices_en`: Array of 4 choices in English (each ≤35 chars)
- `choices_zh`: Array of 4 choices in Chinese (each ≤15 chars)
- `correct_answer`: Index (0-3) of the correct choice
- `explanations_en`: Array of 4 explanations in English
  - Correct answer starts with "Correct!"
  - Wrong answers start with "Wrong."
  - Total combined ~400 chars for mobile display
- `explanations_zh`: Array of 4 explanations in Chinese (total ~180 chars)
- `difficulty`: "easy", "medium", or "hard"

### Why This Format?

**Simplified for MVP:**
- Removed overlapping fields (subtopic overlaps with category)
- Focus on core learning: explaining WHY answers are right/wrong
- Mobile-optimized character limits
- Scientifically accurate and validated

## Content Requirements

### Mobile Optimization (iPhone SE compatible - 320px width)

| Element | English | Chinese | Purpose |
|---------|---------|---------|---------|
| Question | ≤45 chars | ≤25 chars | Fits 1-2 lines |
| Each choice | ≤35 chars | ≤15 chars | Fits 1 line per choice |
| Total explanations | ~400 chars | ~180 chars | Minimal scroll |

### Timing Constraints
- **Question + Choices**: Readable in 20 seconds
- **Explanations**: Readable in 30-40 seconds
- **Total**: ~60 seconds per question

### Content Guidelines

1. **Questions should be:**
   - About everyday phenomena people encounter
   - Curiosity-sparking ("I've always wondered about that!")
   - Clear and accessible to general audience
   - Free of jargon and technical terms
   - Self-contained (no context needed)

2. **Choices should be:**
   - Exactly 4 options (1 correct, 3 plausible but wrong)
   - Grammatically parallel
   - Concise and clear
   - Mix of obviously wrong and subtly incorrect
   - Front-loaded (key differentiating words early)

3. **Explanations should:**
   - **Correct answer**: Start with "Correct!" + explain WHY it's right (2-3 sentences)
   - **Wrong answers**: Start with "Wrong." + explain WHY it's incorrect (1-2 sentences each)
   - Use plain language
   - Be scientifically accurate
   - Include interesting facts
   - Avoid absolutes ("always", "never") unless accurate

## Difficulty Levels

- **Easy**: Common observations, simple concepts everyone can understand
- **Medium**: Requires some thought, intermediate scientific concepts
- **Hard**: Less obvious phenomena, complex mechanisms

## Validation System

All questions are validated through a **3-layer system**:

### Layer 1: Manual Review Agent (Built into SKILL.md)
- AI self-reviews during generation
- Fact-checks scientific accuracy
- Verifies correct/wrong answers
- Self-correction loop
- Only accepts HIGH confidence content

### Layer 2: Automated Validation (`auto_validate.py`)
- JSON structure validation
- Required field checks
- Character limit enforcement
- Explanation format (Correct!/Wrong. prefixes)
- Logical consistency checks
- Red flag detection (absolutes, misconceptions)

### Layer 3: AI Fact-Check (`ai_fact_check.py`)
- Generates verification prompts
- Web search against authoritative sources
- Detailed fact-check reports
- Source documentation

**All questions must pass all 3 layers before release.**

## Validation Scripts

Located in this directory:

- **`validate_facts.py`**: Structure and format validation
- **`ai_fact_check.py`**: AI-powered fact verification
- **`auto_validate.py`**: Master validation orchestrator
- **`install_git_hook.sh`**: Git pre-commit hook installer

### Quick Validation

```bash
# Validate single file
python3 auto_validate.py chemistry.json

# Validate all files
python3 auto_validate.py --all

# With AI fact-check prompts
python3 auto_validate.py chemistry.json --ai-check
```

## Adding New Questions

See `../generate_with_validation.md` for complete workflow.

**Quick summary:**
1. Use the curious-minds skill to generate questions
2. Layer 1 Review Agent validates during creation
3. Auto-validation runs (Layer 2)
4. Optional: AI fact-check with web search (Layer 3)
5. Git hook validates on commit

## Scientific Accuracy

**CRITICAL**: All content must be scientifically accurate.

- Verify facts against reliable sources (Wikipedia, NASA, NIH, etc.)
- Check numerical values (speeds, distances, percentages)
- Avoid common misconceptions
- Use current scientific understanding
- Chinese translations must be scientifically equivalent

## File Organization

```
questions/
├── README.md (this file)
├── animals.json
├── astronomy.json
├── chemistry.json
├── economics.json
├── human-biology.json
├── physics.json
├── plants.json
├── psychology.json
├── technology.json
├── weather.json
├── validate_facts.py
├── ai_fact_check.py
├── auto_validate.py
└── install_git_hook.sh
```

## Version History

- **2025-11-18**: Updated all files to MVP format (removed deprecated fields, added 4-explanation structure)
- **2025-11-18**: Implemented 3-layer automated validation system
- **2025-11-18**: Installed git pre-commit hook for automatic validation
- **2025-11-17**: Created 30 questions across 10 topics
- **2025-11-16**: Initial question database structure

---

**Last updated**: 2025-11-18
**Format version**: MVP 1.0
**Questions**: 34
**Validation**: 3-layer system ✅
**Status**: Production-ready ✅
