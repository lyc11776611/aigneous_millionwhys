# Question Automation Guide

Complete guide to the automated question management system for curious-minds.

## Overview

The automation system allows you to add questions with minimal effort:
- **Input**: Simple YAML file with just English question + choices
- **Output**: Complete bilingual question with AI-generated translations, explanations, and validation

## Quick Start

```bash
# 1. API keys are already set in ~/.zprofile
# - OPENAI_API_KEY: for accuracy & language validation
# - DEEPSEEK_API_KEY: for Chinese native validation
# - ANTHROPIC_API_KEY: for content generation (optional)

# 2. Create a draft file
cp questions/drafts/template.yaml questions/drafts/my_questions.yaml

# 3. Edit your draft (fill in questions)

# 4. Add questions to the system (runs all 3 validation layers automatically)
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml

# 5. Review and commit
git add .
git commit -m "Add 5 new Animals questions"
```

## System Architecture

### Components

1. **YAML Draft System** (`questions/drafts/`)
   - Simple input format
   - Minimal required fields
   - Optional manual translations

2. **ID Manager** (`scripts/utils/id_manager.py`)
   - Auto-assigns sequential IDs
   - Prevents duplicates
   - Maps categories to prefixes

3. **Question Builder** (`scripts/question_builder.py`)
   - AI-powered content generation
   - Translates English → Chinese
   - Generates 4 educational explanations
   - Validates character limits

4. **Validation Pipeline** (`scripts/utils/validation.py`)
   - Layer 1: Format validation
   - Layer 2: Fact checking
   - Layer 3: AI fact check (optional)

5. **Master List Updater** (`scripts/utils/master_list.py`)
   - Auto-updates ALL_QUESTIONS_MASTER_LIST.md
   - Keeps documentation in sync
   - Updates totals automatically

6. **Main CLI** (`scripts/add_questions.py`)
   - User-facing tool
   - Ties everything together
   - Provides clear feedback

## Usage Guide

### Adding Questions from a Draft

**Basic Usage:**
```bash
python scripts/add_questions.py --draft questions/drafts/animals.yaml
```

**Preview without writing (dry run):**
```bash
python scripts/add_questions.py --draft questions/drafts/animals.yaml --dry-run
```

**Skip AI generation (manual content only):**
```bash
python scripts/add_questions.py --draft questions/drafts/animals.yaml --no-ai
```

**Skip validation (not recommended):**
```bash
python scripts/add_questions.py --draft questions/drafts/animals.yaml --skip-validation
```

### Creating a New Category

```bash
python scripts/add_questions.py \
  --new-category "Marine Biology" \
  --name-zh "海洋生物学"
```

This creates:
- Empty JSON file: `src/data/questions/marine-biology.json`
- Ready for questions to be added

### Updating Master List Only

If you manually edited JSON files and need to sync the master list:

```bash
python scripts/add_questions.py --update-master-list
```

## Draft File Format

### Minimal Input (Recommended)

Let AI do the heavy lifting:

```yaml
category: Animals

questions:
  - question_en: "Why do cats have vertical pupils?"
    correct_answer: 1
    choices_en:
      - "To see in the dark better"
      - "Better depth perception for hunting"
      - "Protect eyes from bright sun"
      - "See ultraviolet light"
    difficulty: medium
```

AI will generate:
- Chinese question and choices
- 4 detailed explanations (English + Chinese)
- Validate all character limits

### Partial Input (Manual Chinese)

If you already have Chinese translations:

```yaml
category: Animals

questions:
  - question_en: "Why do sloths move so slowly?"
    question_zh: "为什么树懒动作这么慢？"
    correct_answer: 2
    choices_en:
      - "They are always tired"
      - "Their muscles are weak"
      - "Low metabolism saves energy"
      - "They move slowly to hide"
    choices_zh:
      - "它们总是很累"
      - "它们的肌肉很弱"
      - "低代谢节省能量"
      - "慢动作用于隐藏"
    difficulty: medium
```

AI will generate:
- 4 detailed explanations (English + Chinese)

### Full Input (No AI)

If you have all content ready:

```yaml
category: Animals

questions:
  - question_en: "Why do fireflies glow?"
    question_zh: "萤火虫为什么会发光？"
    correct_answer: 0
    choices_en:
      - "Chemical reaction creates light"
      - "Reflect moonlight"
      - "Store sunlight during day"
      - "Electric charge in body"
    choices_zh:
      - "化学反应产生光"
      - "反射月光"
      - "白天储存阳光"
      - "体内电荷"
    explanations_en:
      - "Correct! Fireflies produce light through bioluminescence..."
      - "Wrong. Fireflies don't reflect moonlight..."
      - "Wrong. Fireflies don't store sunlight..."
      - "Wrong. Firefly light is not produced by electricity..."
    explanations_zh:
      - "正确！萤火虫通过生物发光产生光..."
      - "错误。萤火虫不反射月光..."
      - "错误。萤火虫不储存阳光..."
      - "错误。萤火虫的光不是由电产生的..."
    difficulty: medium
```

Use `--no-ai` flag to skip AI generation entirely.

## Character Limits

The system enforces mobile-friendly character limits:

| Field | English | Chinese |
|-------|---------|---------|
| Question | 45 chars | 25 chars |
| Choice | 35 chars | 15 chars |
| Explanation | No limit | No limit |

The AI is trained to respect these limits. If manual content exceeds limits, validation will fail.

## Validation Layers

### Layer 1: Format Validation
- File structure correctness
- Required fields present
- Character limits met
- JSON syntax valid
- ID format correct

**Script:** `scripts/auto_validate.py`

### Layer 2: Fact Checking
- No duplicate questions
- No duplicate IDs
- Correct answer in range [0-3]
- Exactly 4 choices
- Explanations count matches

**Script:** `scripts/validate_facts.py`

### Layer 3: AI Fact Check (Enhanced with OpenAI + DeepSeek)
**4 comprehensive checks:**

1. **Scientific Accuracy** (OpenAI gpt-4o-mini)
   - Verifies correct answer is scientifically accurate
   - Checks explanation completeness
   - Validates numerical claims and facts
   - Confidence scoring (HIGH/MEDIUM/LOW)

2. **English Language Quality** (OpenAI gpt-4o-mini)
   - Grammar and clarity
   - Age-appropriate vocabulary
   - Style consistency
   - Readability scoring (1-10)

3. **Chinese Translation & Quality** (OpenAI gpt-4o-mini)
   - Translation accuracy vs English
   - Natural Chinese expression
   - Scientific terminology correctness
   - General audience appropriateness

4. **Chinese Native Check** (DeepSeek - optional)
   - Native Chinese speaker validation
   - Idiomatic expression naturalness
   - Additional accuracy verification
   - Educational context appropriateness

**Script:** `scripts/ai_fact_check.py`

**API Keys Required:**
- `OPENAI_API_KEY` (required) - checks accuracy, English, and Chinese
- `DEEPSEEK_API_KEY` (optional) - additional Chinese validation

**Note:** Layer 3 is optional and won't block the workflow if it fails, but provides critical quality assurance for content accuracy.

## Workflow Example

### Complete Workflow

```bash
# 1. Create draft file
cat > questions/drafts/ocean_animals.yaml << 'EOF'
category: Animals

questions:
  - question_en: "Why do octopuses have three hearts?"
    correct_answer: 1
    choices_en:
      - "To pump blood faster"
      - "Two pump blood to gills, one to body"
      - "Backup in case one fails"
      - "To control multiple tentacles"
    difficulty: hard

  - question_en: "Why do whale sharks have spots?"
    correct_answer: 2
    choices_en:
      - "To attract mates"
      - "To confuse predators"
      - "Camouflage from above and below"
      - "Store excess pigment"
    difficulty: medium
EOF

# 2. Preview first (dry run)
python scripts/add_questions.py \
  --draft questions/drafts/ocean_animals.yaml \
  --dry-run

# 3. Review the preview output
# 4. If looks good, run for real
python scripts/add_questions.py \
  --draft questions/drafts/ocean_animals.yaml

# 5. Review generated files
# - src/data/questions/animals.json (updated)
# - ALL_QUESTIONS_MASTER_LIST.md (updated)

# 6. Commit changes
git add .
git commit -m "Add 2 ocean animal questions (anim_021, anim_022)"
git push origin feature/peng/add-more-questions2
```

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable required"

**Problem:** AI content generation requires Anthropic API key.

**Solution 1 - Set environment variable:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Solution 2 - Use --no-ai flag (provide content manually):**
```bash
python scripts/add_questions.py --draft my_draft.yaml --no-ai
```

### "OPENAI_API_KEY environment variable not set"

**Problem:** AI fact-checking (Layer 3) requires OpenAI API key.

**Solution:**
```bash
# Add to ~/.zprofile or ~/.bashrc
export OPENAI_API_KEY="sk-..."
export DEEPSEEK_API_KEY="sk-..."  # Optional, for Chinese validation

# Then reload
source ~/.zprofile
```

**Note:** Your keys are already in ~/.zprofile, so they should be automatically loaded.

### "Character limit violations"

**Problem:** Your content exceeds mobile-friendly limits.

**Solution:** Shorten the text:
- Question EN: ≤45 chars
- Question ZH: ≤25 chars
- Choice EN: ≤35 chars
- Choice ZH: ≤15 chars

### "Category not found"

**Problem:** Category name doesn't match existing categories.

**Solution 1 - Use exact category name:**
```
Animals, Astronomy, Chemistry, Economics, Human Biology,
Physics, Plants, Psychology, Technology, Weather,
Food & Nutrition, Earth Science
```

**Solution 2 - Create new category first:**
```bash
python scripts/add_questions.py \
  --new-category "Marine Biology" \
  --name-zh "海洋生物学"
```

### "Validation failed"

**Problem:** Format or fact checking found issues.

**Review the error output carefully:**
- Format errors: Check JSON syntax, required fields
- Fact errors: Check for duplicates, correct_answer range
- Fix issues and try again

**Skip validation (not recommended):**
```bash
python scripts/add_questions.py --draft my_draft.yaml --skip-validation
```

### AI generation failed

**Problem:** API request failed or timed out.

**The system handles this gracefully:**
- Falls back to placeholder text
- You can provide content manually
- Or fix API issue and try again

## Best Practices

### 1. Use Dry Run First

Always preview with `--dry-run` before committing:
```bash
python scripts/add_questions.py --draft new.yaml --dry-run
```

### 2. Start Small

Add 2-3 questions first to verify the workflow works.

### 3. Review AI Output

AI is good but not perfect. Always review:
- Chinese translations for naturalness
- Explanations for accuracy
- Character limits compliance

### 4. Use Version Control

- Create feature branches for new questions
- Commit frequently with clear messages
- Use descriptive commit messages

### 5. Keep Drafts Organized

```
questions/drafts/
  ├── template.yaml
  ├── animals_batch1.yaml
  ├── chemistry_acids.yaml
  └── astronomy_planets.yaml
```

### 6. Validate Regularly

Run validation even without adding questions:
```bash
python scripts/auto_validate.py
python scripts/validate_facts.py
```

## Advanced Usage

### Custom Validation Only

```bash
cd scripts/utils
python validation.py
```

### Manual ID Assignment

Not recommended, but if needed:
```bash
cd scripts/utils
python id_manager.py <category>
```

### Direct Master List Update

```bash
cd scripts/utils
python master_list.py
```

### Test AI Fact-Checking on Existing Questions

```bash
# Check a specific file with comprehensive AI validation
python scripts/ai_fact_check.py --file src/data/questions/animals.json

# Check a specific question only
python scripts/ai_fact_check.py --file animals.json --question anim_001

# Check all files (runs all 3 AI checks on every question)
python scripts/ai_fact_check.py

# Quiet mode (less verbose output)
python scripts/ai_fact_check.py --file animals.json --quiet
```

**What it checks:**
- ✅ Scientific accuracy (OpenAI)
- ✅ English language quality (OpenAI)
- ✅ Chinese translation & quality (OpenAI)
- ✅ Chinese naturalness (DeepSeek, if available)

**Output example:**
```
======================================================================
AI FACT-CHECK: anim_001
======================================================================
EN: Why do cats purr?
ZH: 猫为什么会打呼噜？
Category: Animal Behavior

🔬 Checking scientific accuracy...
📝 Checking English language quality...
🇨🇳 Checking Chinese language and accuracy...
🔍 Additional Chinese validation with DeepSeek...

──────────────────────────────────────────────────────────────────────
VALIDATION SUMMARY
──────────────────────────────────────────────────────────────────────

✅ Overall: PASS

  🔬 Accuracy: ACCURATE (confidence: HIGH)

  📝 English: GOOD (clarity: 9/10)

  🇨🇳 Chinese: GOOD (translation: ACCURATE)

  🔍 DeepSeek: GOOD (naturalness: HIGH)
```

## File Structure

```
aigneous_millionwhys/
├── scripts/
│   ├── add_questions.py          # Main CLI tool
│   ├── question_builder.py       # AI content generation
│   ├── utils/
│   │   ├── id_manager.py         # Auto-assign IDs
│   │   ├── validation.py         # 3-layer validation
│   │   └── master_list.py        # Auto-update master list
│   └── schemas/
│       └── question_draft.schema.json
├── questions/
│   └── drafts/
│       └── template.yaml          # Copy this to start
├── src/data/questions/
│   ├── animals.json
│   ├── chemistry.json
│   └── ...
├── ALL_QUESTIONS_MASTER_LIST.md   # Auto-updated
└── docs/
    ├── AUTOMATION_GUIDE.md        # This file
    └── ADDING_QUESTIONS.md        # Tutorial
```

## ID System

### Category Prefixes

| Category | Prefix | Example IDs |
|----------|--------|-------------|
| Animals | `anim` | anim_001, anim_002, ... |
| Astronomy | `astro` | astro_001, astro_002, ... |
| Chemistry | `chem` | chem_001, chem_002, ... |
| Economics | `econ` | econ_001, econ_002, ... |
| Human Biology | `bio` | bio_001, bio_002, ... |
| Physics | `phys` | phys_001, phys_002, ... |
| Plants | `plant` | plant_001, plant_002, ... |
| Psychology | `psych` | psych_001, psych_002, ... |
| Technology | `tech` | tech_001, tech_002, ... |
| Weather | `weath` | weath_001, weath_002, ... |
| Food & Nutrition | `food` | food_001, food_002, ... |
| Earth Science | `earth` | earth_001, earth_002, ... |

IDs are auto-assigned sequentially and cannot be reused.

## FAQ

**Q: Can I edit questions after adding them?**
A: Yes, but edit the JSON file directly. The automation is for adding new questions only.

**Q: Can I add questions to multiple categories at once?**
A: No, each draft file is for one category. Create separate drafts for different categories.

**Q: What if I want to translate myself instead of using AI?**
A: Provide `question_zh` and `choices_zh` in your draft. Use `--no-ai` for full manual control.

**Q: How do I know what the next ID will be?**
A: The tool tells you when it runs. Or check the category JSON file for the highest number.

**Q: Can I delete questions?**
A: Not through this tool. Edit JSON files directly and update master list manually.

**Q: What happens if validation fails?**
A: The questions are NOT added. Fix the issues and try again.

## Support

For issues or questions:
1. Check this guide and ADDING_QUESTIONS.md
2. Review error messages carefully
3. Check existing question files for examples
4. Verify your API key if using AI features

## Version History

- **v1.0** (2025-11-20): Initial automation system
  - Auto ID assignment
  - AI-powered content generation
  - 3-layer validation
  - Master list auto-update
