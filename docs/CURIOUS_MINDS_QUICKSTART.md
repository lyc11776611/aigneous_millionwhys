# Curious Minds - Quick Start Guide

## What is Curious Minds?

A bilingual (English/Chinese) Q&A question database for mobile apps, featuring:
- 31 scientifically validated questions across 10 topics
- Mobile-optimized format (iPhone SE compatible)
- 3-layer automated validation system
- Git pre-commit hook for quality control

## Quick Commands

### Validate Questions
```bash
# Validate single file
python3 scripts/validation/auto_validate.py chemistry.json

# Validate all files
python3 scripts/validation/auto_validate.py --all

# Validate with AI fact-check prompts
python3 scripts/validation/auto_validate.py chemistry.json --ai-check
```

### Generate New Questions (Claude Code Skill)
```
/curious-minds
```

## Project Structure

```
data/questions/          # 10 JSON question files (31 questions total)
scripts/validation/      # Validation scripts + git hook installer
docs/questions/          # Detailed documentation
.claude/skills/          # Claude Code skill definition
```

## Question Format (MVP)

Each question includes:
- Bilingual question text (EN/ZH)
- 4 multiple choice options
- Correct answer index
- 4 explanations (1 for correct, 3 for wrong answers)
- Difficulty level (easy/medium/hard)

Example:
```json
{
  "id": "chem_001",
  "question_en": "Why do onions make us cry?",
  "question_zh": "为什么洋葱会让我们流泪？",
  "choices_en": ["...", "...", "...", "..."],
  "choices_zh": ["...", "...", "...", "..."],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. Explanation why choice 0 is incorrect...",
    "Correct! Explanation why choice 1 is right...",
    "Wrong. Explanation why choice 2 is incorrect...",
    "Wrong. Explanation why choice 3 is incorrect..."
  ],
  "explanations_zh": ["...", "...", "...", "..."],
  "difficulty": "easy"
}
```

## 3-Layer Validation System

**Layer 1**: Manual Review Agent (built into skill)
- AI self-reviews during generation
- Fact-checks scientific accuracy
- Self-correction loop

**Layer 2**: Automated Validation (`auto_validate.py`)
- JSON structure validation
- Character limit enforcement
- Logical consistency checks
- Red flag detection

**Layer 3**: AI Fact-Check (`ai_fact_check.py`)
- Web search verification
- Source documentation
- Generates verification prompts

## Character Limits (Mobile-Optimized)

| Element | English | Chinese |
|---------|---------|---------|
| Question | ≤45 chars | ≤25 chars |
| Each choice | ≤35 chars | ≤15 chars |
| Total explanations | ~400 chars | ~180 chars |

## Git Hook

Pre-commit hook automatically validates changed question files:
- Installed at: `.git/hooks/pre-commit`
- Blocks commits if validation fails
- Bypass (emergency): `git commit --no-verify`

## Available Topics

1. Astronomy & Space (天文与太空) - 3 questions
2. Weather & Climate (天气与气候) - 3 questions
3. Human Biology (人体生物学) - 3 questions
4. Physics in Daily Life (日常物理) - 3 questions
5. Chemistry Around Us (身边的化学) - 4 questions
6. Animal Behavior (动物行为) - 3 questions
7. Plant Science (植物科学) - 3 questions
8. Psychology & Behavior (心理与行为) - 3 questions
9. Economics & Money (经济与金融) - 3 questions
10. Technology (技术) - 3 questions

## Common Tasks

### Adding a New Question
1. Use Claude Code skill: `/curious-minds`
2. Choose existing topic or create new category
3. Specify number of questions
4. Review and approve generated questions
5. Validation runs automatically
6. Commit changes (git hook validates)

### Modifying Existing Question
1. Edit the JSON file in `data/questions/`
2. Run validation: `python3 scripts/validation/auto_validate.py [file].json`
3. Fix any issues reported
4. Commit changes

### Creating New Category
1. Use Claude Code skill: `/curious-minds`
2. Specify new category name (EN + ZH)
3. Generate 3+ questions for the new category
4. New JSON file created automatically

## For Developers

### Integrate Questions in Your App
```javascript
// Load questions from JSON
import questions from './data/questions/chemistry.json';

// questions.category_en => "Chemistry Around Us"
// questions.category_zh => "身边的化学"
// questions.questions => Array of question objects
```

### Validation in CI/CD
```yaml
# Example GitHub Actions
- name: Validate Questions
  run: python3 scripts/validation/auto_validate.py --all
```

## Need Help?

- Full documentation: `docs/questions/README.md`
- Workflow guide: `docs/questions/generate_with_validation.md`
- Migration details: `docs/MIGRATION_SUMMARY.md`
- Skill definition: `.claude/skills/curious-minds/SKILL.md`

---

**Last Updated**: 2025-11-18
**Total Questions**: 31
**Status**: Production-ready ✅
