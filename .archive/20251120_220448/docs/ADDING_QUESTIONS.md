# Adding Questions Tutorial

Step-by-step guide to adding new questions to curious-minds.

## Prerequisites

**For AI-powered features (recommended):**
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

Get your API key at: https://console.anthropic.com/

**For manual mode (no AI):**
No setup needed, use `--no-ai` flag.

## Step 1: Copy the Template

```bash
cp questions/drafts/template.yaml questions/drafts/my_questions.yaml
```

## Step 2: Fill in Your Questions

Open `questions/drafts/my_questions.yaml` and edit:

```yaml
category: Animals  # Choose your category

questions:
  # Question 1
  - question_en: "Why do cats purr?"
    correct_answer: 2
    choices_en:
      - "To communicate with other cats"
      - "To show they are hungry"
      - "To show contentment and self-soothe"
      - "To warn of danger"
    difficulty: easy

  # Question 2
  - question_en: "Why do dogs wag their tails?"
    correct_answer: 0
    choices_en:
      - "To communicate emotions"
      - "To keep balance"
      - "To attract attention"
      - "To cool down"
    difficulty: easy
```

**That's it!** The system will:
- Auto-assign IDs (anim_021, anim_022)
- Translate to Chinese
- Generate explanations
- Validate everything
- Update all files

## Step 3: Preview Your Questions

**Always preview first with dry run:**

```bash
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml --dry-run
```

Review the output to make sure it looks good.

## Step 4: Add the Questions

**If preview looks good, run for real:**

```bash
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml
```

**The tool will:**
1. ✅ Assign IDs automatically
2. ✅ Generate Chinese translations
3. ✅ Create detailed explanations
4. ✅ Validate format and facts
5. ✅ Update JSON file
6. ✅ Update master list
7. ✅ Show you what to do next

## Step 5: Review and Commit

**Check the files:**
```bash
# View the updated JSON
cat src/data/questions/animals.json | tail -50

# View the master list
tail -20 ALL_QUESTIONS_MASTER_LIST.md
```

**Commit if everything looks good:**
```bash
git add .
git commit -m "Add 2 new Animals questions (anim_021, anim_022)"
git push origin feature/peng/add-more-questions2
```

## Common Tasks

### Adding Chemistry Questions

```yaml
category: Chemistry

questions:
  - question_en: "Why does ice float on water?"
    correct_answer: 1
    choices_en:
      - "Ice is made of different molecules"
      - "Ice is less dense than liquid water"
      - "Ice contains trapped air bubbles"
      - "Water pressure pushes ice up"
    difficulty: medium
```

### Adding Astronomy Questions

```yaml
category: Astronomy

questions:
  - question_en: "Why is Mars red?"
    correct_answer: 2
    choices_en:
      - "Reflected light from the sun"
      - "Volcanic activity"
      - "Iron oxide (rust) on surface"
      - "Red gases in atmosphere"
    difficulty: easy
```

### Providing Your Own Chinese Translation

If you want to provide Chinese yourself (AI will still generate explanations):

```yaml
category: Animals

questions:
  - question_en: "Why do elephants have trunks?"
    question_zh: "大象为什么有长鼻子？"
    correct_answer: 0
    choices_en:
      - "Multi-purpose tool for survival"
      - "To breathe underwater"
      - "To fight predators"
      - "To attract mates"
    choices_zh:
      - "生存的多功能工具"
      - "在水下呼吸"
      - "对抗捕食者"
      - "吸引配偶"
    difficulty: medium
```

### Adding Questions Without AI

If you have all content ready and want to skip AI:

```bash
# 1. Fill in ALL fields in your YAML (including explanations)
# 2. Use --no-ai flag
python scripts/add_questions.py --draft my_questions.yaml --no-ai
```

## Tips for Writing Good Questions

### 1. Keep It Short

Remember the character limits:
- **Question (English):** 45 characters max
- **Question (Chinese):** 25 characters max
- **Choices (English):** 35 characters max
- **Choices (Chinese):** 15 characters max

**Good:**
```yaml
question_en: "Why do cats have vertical pupils?"  # 39 chars ✓
```

**Too long:**
```yaml
question_en: "Why do cats have vertical-shaped pupils instead of round ones?"  # 70 chars ✗
```

### 2. Make Choices Clear

Each choice should be distinct and plausible:

**Good:**
```yaml
choices_en:
  - "Better depth perception"      # Correct
  - "See in complete darkness"     # Plausible but wrong
  - "Detect ultraviolet light"     # Plausible but wrong
  - "Protect from bright sunlight" # Plausible but wrong
```

**Bad:**
```yaml
choices_en:
  - "Better hunting"  # Too vague
  - "Better hunting at night"  # Too similar
  - "To hunt better"  # Too similar
  - "None of the above"  # Not educational
```

### 3. Choose Appropriate Difficulty

- **Easy:** Basic facts, common knowledge
- **Medium:** Requires some reasoning, less obvious
- **Hard:** Advanced concepts, surprising facts

### 4. Make It Educational

The goal is to teach, not trick. Wrong answers should clarify common misconceptions.

## Available Categories

Choose one of these for the `category` field:

- Animals
- Astronomy
- Chemistry
- Economics
- Human Biology
- Physics
- Plants
- Psychology
- Technology
- Weather
- Food & Nutrition
- Earth Science

## Creating a New Category

If you need a category that doesn't exist:

```bash
python scripts/add_questions.py \
  --new-category "Marine Biology" \
  --name-zh "海洋生物学"
```

Then add questions to it as normal.

## Troubleshooting

### Error: "ANTHROPIC_API_KEY environment variable required"

**Fix 1 - Set API key:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Fix 2 - Use manual mode:**
```bash
python scripts/add_questions.py --draft my.yaml --no-ai
```

### Error: "question_en too long"

Your question exceeds 45 characters. Shorten it:

**Before:**
```yaml
question_en: "Why do some animals have the ability to change colors?"
```

**After:**
```yaml
question_en: "Why can some animals change color?"
```

### Error: "Category not found"

Make sure category name is exactly one of the available categories (case-sensitive):
```yaml
category: Animals  # ✓ Correct
category: animals  # ✗ Wrong (lowercase)
category: Animal   # ✗ Wrong (singular)
```

### Error: "Validation failed"

Read the error output carefully:
- **Format errors:** Check your YAML syntax
- **Duplicate questions:** Question already exists
- **Duplicate IDs:** Should not happen with auto-assignment

Fix the issues and try again.

## Quick Reference

### Minimal question format:
```yaml
category: <Category Name>

questions:
  - question_en: "<Your question?>"
    correct_answer: <0, 1, 2, or 3>
    choices_en:
      - "<Choice 0>"
      - "<Choice 1>"
      - "<Choice 2>"
      - "<Choice 3>"
    difficulty: <easy, medium, or hard>
```

### Commands:

```bash
# Preview questions
python scripts/add_questions.py --draft <file> --dry-run

# Add questions with AI
python scripts/add_questions.py --draft <file>

# Add questions without AI
python scripts/add_questions.py --draft <file> --no-ai

# Create new category
python scripts/add_questions.py --new-category "<Name>" --name-zh "<中文名>"

# Update master list only
python scripts/add_questions.py --update-master-list
```

### Character limits:
- Question EN: ≤45 chars
- Question ZH: ≤25 chars
- Choice EN: ≤35 chars
- Choice ZH: ≤15 chars

## Example: Complete Workflow

```bash
# 1. Copy template
cp questions/drafts/template.yaml questions/drafts/space.yaml

# 2. Edit the file (add your questions)
nano questions/drafts/space.yaml

# 3. Preview
python scripts/add_questions.py --draft questions/drafts/space.yaml --dry-run

# 4. Add for real
python scripts/add_questions.py --draft questions/drafts/space.yaml

# 5. Review
git diff src/data/questions/astronomy.json

# 6. Commit
git add .
git commit -m "Add 3 astronomy questions about planets"
git push
```

## Getting Help

- **Comprehensive guide:** See `docs/AUTOMATION_GUIDE.md`
- **Template example:** See `questions/drafts/template.yaml`
- **Existing questions:** Look at files in `src/data/questions/`

## Next Steps

Once comfortable with the basics:
1. Read `docs/AUTOMATION_GUIDE.md` for advanced features
2. Learn about the 3-layer validation system
3. Explore the AI explanation generation
4. Consider contributing to the automation tools themselves

Happy question creating! 🎯
