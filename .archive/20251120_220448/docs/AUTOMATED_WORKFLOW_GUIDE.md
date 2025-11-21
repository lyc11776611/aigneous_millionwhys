# Fully Automated Workflow Guide
## Zero-Confirmation Question Creation with Claude + DeepSeek

**Version:** 2.0
**Date:** 2025-11-20
**Status:** ✅ Production Ready

---

## Overview

The new automated workflow eliminates ALL manual confirmations and uses:
- **Claude (Anthropic)** - English generation & fact-checking
- **DeepSeek** - Chinese translation
- **NO OpenAI** - Removed from creation workflow
- **NO manual confirmations** - Fully automated

---

## Quick Start (Fully Automated)

```bash
# 1. Create your question list (English only)
cp questions/drafts/template_v2.yaml questions/drafts/new_batch.yaml
nano questions/drafts/new_batch.yaml  # Fill in English questions

# 2. Run automated pipeline (NO confirmations needed)
python scripts/add_questions.py --draft questions/drafts/new_batch.yaml

# That's it! Questions are:
# ✅ Generated (Claude)
# ✅ Fact-checked & corrected (Claude)
# ✅ Translated (DeepSeek)
# ✅ Validated (3 layers)
# ✅ Added to JSON files
# ✅ Master list updated
# ✅ Ready to commit
```

---

## New Workflow (Requests 1 & 2 Implemented)

### Workflow Steps (All Automatic):

```
1. User creates English question draft
   ↓
2. Claude generates English explanations
   ↓
3. Claude fact-checks & auto-corrects
   ↓
4. DeepSeek translates to Chinese
   ↓
5. Timestamps added (created_at, last_modified_at)
   ↓
6. Layer 1: Format validation (auto)
   ↓
7. Layer 2: Fact checking (auto)
   ↓
8. Layer 3: AI validation (auto)
   ↓
9. Questions added to JSON (auto)
   ↓
10. Master list updated (auto)
   ↓
DONE - No confirmations needed!
```

### What's Automatic:

✅ **English Content Generation** - Claude creates explanations
✅ **Fact-Checking** - Claude verifies accuracy
✅ **Self-Correction** - Claude fixes issues automatically
✅ **Chinese Translation** - DeepSeek translates everything
✅ **Timestamp Addition** - Created/modified times added
✅ **Format Validation** - Automatic structure checks
✅ **Fact Validation** - Automatic accuracy checks
✅ **AI Validation** - Automatic quality checks
✅ **File Updates** - JSON files updated automatically
✅ **Master List** - Documentation updated automatically

### What's NOT Automatic (User Control):

🔒 **Git Commit** - User reviews and commits when ready
🔒 **Git Push** - User pushes to remote when ready

---

## Input Format (Minimal English Only)

```yaml
category: Animals

questions:
  - question_en: "Why do cats have whiskers?"
    correct_answer: 0
    choices_en:
      - "To sense surroundings and navigate"
      - "To attract mates"
      - "To keep insects away"
      - "For decoration only"
    difficulty: easy

# That's ALL you need!
# Everything else is automatic:
# - English explanations (Claude generates)
# - Fact-checking (Claude verifies)
# - Chinese translation (DeepSeek translates)
# - Timestamps (added automatically)
```

---

## Configuration (.automation_config.json)

The system uses `.automation_config.json` for automation settings:

```json
{
  "auto_mode": {
    "enabled": true,  // Enable full automation
    "skip_manual_confirmations": true,  // No prompts
    "auto_proceed_on_warnings": true,  // Continue on warnings
    "auto_proceed_on_validation_pass": true  // Auto-add on pass
  },
  "validation": {
    "continue_on_warnings": true,  // Don't stop for warnings
    "skip_validation": false  // Still validate (recommended)
  },
  "workflows": {
    "use_claude_for_generation": true,  // Claude for English
    "use_deepseek_for_translation": true,  // DeepSeek for Chinese
    "add_timestamps": true,  // Add created_at/last_modified_at
    "auto_fact_check": true,  // Auto fact-check with Claude
    "auto_correct": true  // Auto-correct if issues found
  }
}
```

---

## API Keys Required

Set these environment variables (in `~/.zprofile` or `~/.bashrc`):

```bash
# Required for automation
export ANTHROPIC_API_KEY="sk-ant-..."  # Claude (generation & fact-check)
export DEEPSEEK_API_KEY="sk-..."       # DeepSeek (Chinese translation)

# NOT used in new workflow
# export OPENAI_API_KEY="..."  # Not needed for question creation
```

---

## Complete Example

### Input (questions/drafts/animals_whiskers.yaml):

```yaml
category: Animals

questions:
  - question_en: "Why do cats have whiskers?"
    correct_answer: 0
    choices_en:
      - "To sense surroundings and navigate"
      - "To attract mates"
      - "To keep insects away"
      - "For decoration only"
    difficulty: easy
```

### Command:

```bash
python scripts/add_questions.py --draft questions/drafts/animals_whiskers.yaml
```

### Output (Fully Automatic):

```
📖 Reading draft: questions/drafts/animals_whiskers.yaml
============================================================
📝 Category: Animals
📊 Questions to add: 1
📂 File: animals.json
🔢 Current questions: 20
🆔 Next ID: anim_021

🔨 Building questions...
------------------------------------------------------------

[1/1] Why do cats have whiskers?
    ID: anim_021 | Difficulty: easy
    🤖 Processing with Claude + DeepSeek...

🔨 Processing: Why do cats have whiskers?
  📝 Generating English explanations...
  🔬 Fact-checking with Claude...
  ✅ Fact-check passed (confidence: HIGH)
  🇨🇳 Translating to Chinese with DeepSeek...
✅ DeepSeek API available for Chinese translation
  ✅ Question completed successfully
    ✓ Generated English explanations (Claude)
    ✓ Fact-checked and corrected (Claude)
    ✓ Translated to Chinese (DeepSeek)
    ✓ Added timestamps (created_at, last_modified_at)

💾 Updating JSON file...
✅ Added 1 questions to animals.json

✅ Running validation pipeline...
------------------------------------------------------------
🔍 Running 3-Layer Validation Pipeline...
============================================================

📋 Layer 1: Format Validation (auto_validate.py)
✅ ALL FILES PASSED!

🔬 Layer 2: Fact Checking (validate_facts.py)
✅ Passed: Critical Issues: 0

🤖 Layer 3: AI Fact Check (ai_fact_check.py)
   Note: Required if OpenAI API key is available
Checking anim_021... ✅
✅ All validations passed!

📋 Updating master list...
✅ Added 1 questions to master list
✅ Updated master list totals to 187

============================================================
✨ Success! Added 1 questions to Animals
============================================================

📌 Next steps:
   1. Review: src/data/questions/animals.json
   2. Commit: git add . && git commit -m 'Add 1 Animals questions'
   3. Push: git push origin feature/peng/add-more-questions2
```

### Result JSON (with timestamps):

```json
{
  "id": "anim_021",
  "question_en": "Why do cats have whiskers?",
  "question_zh": "为什么猫有胡须？",
  "choices_en": [
    "To sense surroundings and navigate",
    "To attract mates",
    "To keep insects away",
    "For decoration only"
  ],
  "choices_zh": [
    "感知周围环境和导航",
    "吸引配偶",
    "驱赶昆虫",
    "仅用于装饰"
  ],
  "correct_answer": 0,
  "explanations_en": [
    "Correct! Cat whiskers (vibrissae) are highly sensitive touch receptors...",
    "Wrong. Whiskers are not for attracting mates...",
    "Wrong. Whiskers don't keep insects away...",
    "Wrong. Whiskers serve important sensory functions..."
  ],
  "explanations_zh": [
    "正确！猫的胡须（触须）是高度敏感的触觉感受器...",
    "错误。胡须不是用来吸引配偶的...",
    "错误。胡须不能驱赶昆虫...",
    "错误。胡须具有重要的感官功能..."
  ],
  "difficulty": "easy",
  "created_at": "2025-11-20T12:34:56.789012+00:00",
  "last_modified_at": "2025-11-20T12:34:56.789012+00:00"
}
```

---

## No Confirmations Needed

The system proceeds automatically through ALL steps:

### ✅ Automatic Processes:
- English generation
- Fact-checking
- Error correction
- Chinese translation
- Validation (all 3 layers)
- File updates
- Master list updates

### 🔒 User-Controlled:
- Git commit (review changes first)
- Git push (when ready)

---

## Error Handling

If errors occur, the system provides clear messages and exits:

```bash
# Error Example:
❌ Initialization error: ANTHROPIC_API_KEY environment variable required.

💡 Tip: Set ANTHROPIC_API_KEY environment variable for Claude-based generation
   Set DEEPSEEK_API_KEY for Chinese translation
   Or use --no-ai flag to skip AI generation
```

Fix the issue and re-run. No state is lost.

---

## Batch Processing

Add multiple questions at once:

```yaml
category: Animals

questions:
  - question_en: "Why do cats have whiskers?"
    correct_answer: 0
    choices_en: [...]
    difficulty: easy

  - question_en: "Why do dogs wag their tails?"
    correct_answer: 1
    choices_en: [...]
    difficulty: medium

  - question_en: "Why do birds sing?"
    correct_answer: 2
    choices_en: [...]
    difficulty: medium

# ... add as many as you want!
```

All questions processed automatically with NO confirmations.

---

## Comparison: Old vs New

| Feature | Old Workflow | New Workflow |
|---------|--------------|--------------|
| English Generation | Anthropic Claude | ✅ Anthropic Claude |
| Fact-Checking | OpenAI gpt-4o-mini | ✅ Claude (self-check) |
| Chinese Translation | OpenAI/Manual | ✅ DeepSeek |
| Timestamps | ❌ No | ✅ Yes (auto) |
| Manual Confirmations | Sometimes | ✅ Never |
| API Dependencies | Anthropic + OpenAI | ✅ Anthropic + DeepSeek |
| Auto-Correction | ❌ No | ✅ Yes |
| Input Required | English + sometimes Chinese | ✅ English only |

---

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable required"

**Solution:**
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zprofile
source ~/.zprofile
```

### "DEEPSEEK_API_KEY not found"

**Solution:**
```bash
echo 'export DEEPSEEK_API_KEY="sk-..."' >> ~/.zprofile
source ~/.zprofile
```

### "Validation failed"

Check the error output. Common issues:
- Character limits exceeded (shorten text)
- Invalid category name (check spelling)
- Missing required fields (add them)

### Process seems stuck

Claude/DeepSeek API calls take a few seconds each. Be patient. Progress is shown in real-time.

---

## Summary

✅ **Request 1 & 2 Complete:**
1. New workflow uses Claude + DeepSeek (NO OpenAI)
2. Fact-checking & self-correction built-in
3. Chinese translation automated
4. Timestamps added automatically
5. ZERO manual confirmations needed
6. Fully automated pipeline

**Result:** Create questions faster with higher quality and less effort!

---

**End of Guide**
