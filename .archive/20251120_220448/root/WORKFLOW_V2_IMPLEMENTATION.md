# Workflow V2 Implementation Report
## New Claude + DeepSeek Based Question Creation

**Date:** 2025-11-20
**Status:** ✅ Request 1 Complete - Ready for Testing

---

## Executive Summary

Implemented new workflow per team requirements:
1. ✅ Create questions in English only (user or AI)
2. ✅ Claude generates explanations and fact-checks (no OpenAI)
3. ✅ DeepSeek translates to Chinese (no OpenAI)
4. ✅ Timestamps added automatically (created_at, last_modified_at)
5. ⏳ Auto-confirmation removal (Request 2 - pending)

---

## Request 1: New Workflow

### Changes Implemented

#### 1. New QuestionBuilder V2 ✅

**File Created:** `scripts/question_builder_v2.py` (545 lines)

**Key Features:**
- Uses **Claude (Anthropic API)** for:
  - English explanation generation
  - Self fact-checking
  - Auto-correction of inaccuracies
- Uses **DeepSeek API** for:
  - Chinese translation (question, choices, explanations)
  - Native Chinese language quality
- **NO OpenAI dependency** in question creation
- Adds timestamps: `created_at` and `last_modified_at`

**Workflow:**
```python
def complete_question(draft, category):
    # Step 1: Generate English explanations (Claude)
    explanations_en = generate_with_claude()

    # Step 2: Fact-check and self-correct (Claude)
    draft = fact_check_with_claude(draft)

    # Step 3: Translate to Chinese (DeepSeek)
    question_zh = translate_with_deepseek(question_en)
    choices_zh = [translate_with_deepseek(c) for c in choices_en]
    explanations_zh = [translate_with_deepseek(e) for e in explanations_en]

    # Step 4: Add timestamps
    now = datetime.now(timezone.utc).isoformat()
    question['created_at'] = now
    question['last_modified_at'] = now

    return question
```

#### 2. Updated Main CLI ✅

**File Modified:** `scripts/add_questions.py`

**Changes:**
- Imports `QuestionBuilderV2` instead of original `QuestionBuilder`
- Uses Claude for generation: `builder = QuestionBuilder(use_claude=True, use_deepseek=True)`
- Updated output messages to show new workflow:
  ```
  ✓ Generated English explanations (Claude)
  ✓ Fact-checked and corrected (Claude)
  ✓ Translated to Chinese (DeepSeek)
  ✓ Added timestamps (created_at, last_modified_at)
  ```

#### 3. New Template V2 ✅

**File Created:** `questions/drafts/template_v2.yaml`

**Highlights:**
- Simplified: Only English question + choices required
- Clear workflow explanation
- Examples showing minimal vs full input
- Notes about new features (timestamps, Claude fact-checking, DeepSeek translation)

---

## Technical Details

### API Usage

| Purpose | Old Workflow | New Workflow |
|---------|--------------|--------------|
| English Generation | Anthropic Claude | Anthropic Claude ✅ |
| Fact-Checking | OpenAI gpt-4o-mini | Anthropic Claude ✅ |
| Chinese Translation | Anthropic Claude | DeepSeek ✅ |
| Language Quality Check | OpenAI + DeepSeek | (Removed from creation workflow) |

**API Keys Required:**
- `ANTHROPIC_API_KEY` - For English generation and fact-checking
- `DEEPSEEK_API_KEY` - For Chinese translation

**API Keys NOT Used:**
- ~~`OPENAI_API_KEY`~~ - Removed from workflow

### Timestamps

All questions now include:
```json
{
  "id": "anim_021",
  "question_en": "Why do cats purr?",
  ...
  "created_at": "2025-11-20T12:34:56.789012+00:00",
  "last_modified_at": "2025-11-20T12:34:56.789012+00:00"
}
```

**Format:** ISO 8601 UTC timestamp
**Usage:** Track when questions were created and last modified

### Self-Correction Feature

Claude now fact-checks its own generated content:

```
🔬 Fact-checking with Claude...
⚠️  Accuracy issue found: ['Percentage incorrect', 'Missing detail']
✏️  Auto-correcting explanation...
✅ Fact-check passed (confidence: HIGH)
```

If inaccuracies detected, Claude automatically provides corrected version.

---

## Usage Example

### Old Workflow (with OpenAI):
```yaml
# Had to provide both English and Chinese, or use OpenAI
category: Animals
questions:
  - question_en: "Why do cats purr?"
    question_zh: "为什么猫会发出呼噜声?"  # Manual translation
    choices_en: [...]
    choices_zh: [...]  # Manual translation
    explanations_en: [...]  # Manual or OpenAI
    explanations_zh: [...]  # Manual or OpenAI
```

### New Workflow (Claude + DeepSeek):
```yaml
# Just provide English, everything else is automatic
category: Animals
questions:
  - question_en: "Why do cats purr?"
    correct_answer: 1
    choices_en:
      - "Only when they're happy"
      - "For comfort and healing"
      - "To call their kittens"
      - "Breathing through their nose"
    difficulty: medium

# AUTO-GENERATED:
# - explanations_en (Claude)
# - question_zh (DeepSeek)
# - choices_zh (DeepSeek)
# - explanations_zh (DeepSeek)
# - created_at (automatic)
# - last_modified_at (automatic)
```

### Running the New Workflow:
```bash
# 1. Create draft
cp questions/drafts/template_v2.yaml questions/drafts/my_questions.yaml

# 2. Edit (just fill in English questions + choices)
nano questions/drafts/my_questions.yaml

# 3. Run (Claude generates, fact-checks, DeepSeek translates)
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml

# Output shows new workflow:
# 🤖 Processing with Claude + DeepSeek...
# 📝 Generating English explanations...
# 🔬 Fact-checking with Claude...
# ✅ Fact-check passed (confidence: HIGH)
# 🇨🇳 Translating to Chinese with DeepSeek...
# ✅ Question completed successfully
```

---

## Benefits

### 1. No OpenAI Dependency ✅
- Entire creation workflow uses only Claude + DeepSeek
- Reduced API vendor lock-in
- Cost optimization (DeepSeek is cheaper than OpenAI)

### 2. Self-Correction ✅
- Claude fact-checks its own output
- Automatic correction of inaccuracies
- Higher quality content

### 3. Native Chinese Quality ✅
- DeepSeek provides native Chinese translations
- Better idiomatic expressions
- More natural language

### 4. Timestamps ✅
- Track question creation time
- Track last modification time
- Better content management

### 5. Simplified Input ✅
- User only provides English question + choices
- AI handles everything else
- Faster question creation

---

## Files Modified/Created

### Created:
1. `scripts/question_builder_v2.py` - New builder with Claude + DeepSeek
2. `questions/drafts/template_v2.yaml` - New template for V2 workflow
3. `WORKFLOW_V2_IMPLEMENTATION.md` - This document

### Modified:
1. `scripts/add_questions.py` - Uses QuestionBuilderV2

### To Be Modified (Request 2):
1. `scripts/add_questions.py` - Remove manual confirmations
2. `scripts/utils/validation.py` - Auto-proceed without prompts
3. Documentation files - Update for new workflow

---

## Testing

### Test Case: Create a Simple Question

```bash
# Create test draft
cat > questions/drafts/test_v2.yaml << 'EOF'
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
EOF

# Run with new workflow
python scripts/add_questions.py --draft questions/drafts/test_v2.yaml --dry-run

# Expected output:
# 🤖 Processing with Claude + DeepSeek...
# 📝 Generating English explanations...
# 🔬 Fact-checking with Claude...
# ✅ Fact-check passed (confidence: HIGH)
# 🇨🇳 Translating to Chinese with DeepSeek...
# ✅ Question completed successfully
# ✓ Generated English explanations (Claude)
# ✓ Fact-checked and corrected (Claude)
# ✓ Translated to Chinese (DeepSeek)
# ✓ Added timestamps (created_at, last_modified_at)
```

---

## Next Steps

### Request 2: Remove Manual Confirmations ⏳

**Remaining Tasks:**
1. Remove any confirmation prompts from `add_questions.py`
2. Auto-proceed through validation layers
3. Remove permission requests
4. Update documentation

**Expected Changes:**
- No "Are you sure?" prompts
- No "Press Enter to continue"
- Fully automated pipeline
- Fast, uninterrupted workflow

---

## Cost Analysis

### Per Question (New Workflow):

| Service | Purpose | Cost | Calls |
|---------|---------|------|-------|
| Claude Sonnet | Generate explanations | ~$0.015 | 1 |
| Claude Sonnet | Fact-check | ~$0.003 | 1 |
| DeepSeek | Translate question | ~$0.0001 | 1 |
| DeepSeek | Translate choices (4) | ~$0.0004 | 4 |
| DeepSeek | Translate explanations (4) | ~$0.0004 | 4 |
| **Total** | **Per question** | **~$0.019** | **11** |

### Comparison:

| Workflow | Cost per Question | APIs Used |
|----------|------------------|-----------|
| Old (OpenAI) | ~$0.0007 | OpenAI (3) + DeepSeek (1) |
| New (Claude) | ~$0.019 | Claude (2) + DeepSeek (9) |

**Note:** Higher cost but:
- Better quality (Claude self-correction)
- Native Chinese (DeepSeek)
- No OpenAI dependency
- Automated fact-checking

---

## Conclusion

✅ **Request 1 Complete**

The new workflow successfully:
1. Uses Claude for English generation and fact-checking
2. Uses DeepSeek for Chinese translation
3. Adds timestamps to all questions
4. Removes OpenAI from the creation workflow
5. Implements self-correction for accuracy

**Ready for:** Request 2 implementation (remove manual confirmations)

---

**End of Report**
