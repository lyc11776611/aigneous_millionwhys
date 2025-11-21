# Claude Code Workflow Guide
## Interactive Fact-Checking with Automated Translation

**Version:** 3.0
**Date:** 2025-11-20
**Status:** ✅ Production Ready

---

## Overview

The new workflow uses **Claude Code for fact-checking** and **DeepSeek for translation**:

- **Claude Code** - Interactive fact-checking in conversation (NO API key needed)
- **DeepSeek** - Chinese translation (API key required)
- **NO Anthropic API** - Fact-checking happens in Claude Code conversation
- **NO manual confirmations** - Fully automated once fact-checked

---

## Quick Start

### Step 1: Create & Fact-Check with Claude Code

```
YOU: "I want to create a question about why cats purr"

CLAUDE CODE: "Great! Here's a fact-checked question:

Question: Why do cats purr?
Correct Answer: 1
Choices:
  0. "Only when they're happy"
  1. "For comfort and healing"
  2. "To call their kittens"
  3. "Breathing through their nose"

Explanations (fact-checked):
  0. "Wrong. Cats purr for many reasons, not just happiness..."
  1. "Correct! Cats purr for self-soothing and healing..."
  2. "Wrong. Cats use different vocalizations to call kittens..."
  3. "Wrong. Purring is a separate mechanism from breathing..."

✅ This content has been fact-checked for accuracy.
Now save it to a YAML file!"
```

### Step 2: Save to YAML File

```yaml
category: Animals

questions:
  - question_en: "Why do cats purr?"
    correct_answer: 1
    choices_en:
      - "Only when they're happy"
      - "For comfort and healing"
      - "To call their kittens"
      - "Breathing through their nose"
    explanations_en:
      - "Wrong. Cats purr for many reasons..."
      - "Correct! Cats purr for self-soothing..."
      - "Wrong. Cats use different vocalizations..."
      - "Wrong. Purring is a separate mechanism..."
    difficulty: medium
```

### Step 3: Run Automated Script

```bash
python scripts/add_questions.py --draft questions/drafts/my_questions.yaml

# Output:
# ✅ DeepSeek API available for Chinese translation
# 🔨 Processing: Why do cats purr?
#   🇨🇳 Translating question to Chinese...
#   🇨🇳 Translating choices to Chinese...
#   🇨🇳 Translating explanations to Chinese...
#   ✅ Question completed successfully
#   ✓ Translated to Chinese (DeepSeek)
#   ✓ Added timestamps (created_at, last_modified_at)
# ✅ Success! Added 1 questions to Animals
```

**That's it! No API key for Claude, no confirmations, fully automated!**

---

## Workflow Diagram

```
┌─────────────────────────────────────────────┐
│ Step 1: Create Questions in English        │
│ (You or Claude Code in conversation)       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Step 2: Claude Code Fact-Checks            │
│ (Interactive conversation - NO API)        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Step 3: Save Fact-Checked Content to YAML  │
│ (Manual copy-paste to .yaml file)          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Step 4: Run Automated Script               │
│ python scripts/add_questions.py --draft ... │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Script Automatically:                       │
│ ✅ Translates to Chinese (DeepSeek)        │
│ ✅ Adds timestamps                          │
│ ✅ Validates format                         │
│ ✅ Runs 3-layer validation                  │
│ ✅ Adds to JSON file                        │
│ ✅ Updates master list                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ DONE! Review and commit when ready         │
└─────────────────────────────────────────────┘
```

---

## API Keys Required

```bash
# Add to ~/.zprofile (macOS) or ~/.bashrc (Linux)

# Required for translation
export DEEPSEEK_API_KEY="sk-your-deepseek-key"

# Reload
source ~/.zprofile  # or source ~/.bashrc
```

**That's all!** No Anthropic API key needed.

---

## Complete Example

### Conversation with Claude Code:

```
USER: "Create a question about why octopuses have blue blood"

CLAUDE CODE: "Great topic! Here's a fact-checked question:

**Question:** Why do octopuses have blue blood?

**Correct Answer:** 1 (Hemocyanin uses copper)

**Choices:**
0. "They live in cold water"
1. "Hemocyanin uses copper, not iron"
2. "They absorb blue from ocean"
3. "Genetic mutation from evolution"

**Explanations (fact-checked for accuracy):**

0. "Wrong. While octopuses do live in various water temperatures,
   blood color is determined by the oxygen-carrying molecule,
   not temperature. Cold water doesn't make blood blue."

1. "Correct! Octopuses use hemocyanin instead of hemoglobin to
   carry oxygen. Hemocyanin contains copper atoms which turn
   blue when oxygenated, unlike iron-based hemoglobin which is red.
   This is more efficient in cold, low-oxygen environments."

2. "Wrong. Blood color comes from internal chemistry, not external
   absorption. The ocean's color doesn't affect blood color.
   The copper in hemocyanin makes it blue."

3. "Wrong. Blue blood isn't a mutation but an adaptation. Many
   mollusks and arthropods have hemocyanin-based blood. It's an
   evolutionary advantage for their marine environment."

**Difficulty:** hard

✅ **All facts verified:**
- Hemocyanin is copper-based ✓
- Turns blue when oxygenated ✓
- More efficient in low-oxygen water ✓
- Common in mollusks and arthropods ✓

This content is fact-checked and ready to use!"
```

### Save to YAML:

Create `questions/drafts/octopus_blood.yaml`:

```yaml
category: Animals

questions:
  - question_en: "Why do octopuses have blue blood?"
    correct_answer: 1
    choices_en:
      - "They live in cold water"
      - "Hemocyanin uses copper, not iron"
      - "They absorb blue from ocean"
      - "Genetic mutation from evolution"
    explanations_en:
      - "Wrong. While octopuses do live in various water temperatures, blood color is determined by the oxygen-carrying molecule, not temperature. Cold water doesn't make blood blue."
      - "Correct! Octopuses use hemocyanin instead of hemoglobin to carry oxygen. Hemocyanin contains copper atoms which turn blue when oxygenated, unlike iron-based hemoglobin which is red. This is more efficient in cold, low-oxygen environments."
      - "Wrong. Blood color comes from internal chemistry, not external absorption. The ocean's color doesn't affect blood color. The copper in hemocyanin makes it blue."
      - "Wrong. Blue blood isn't a mutation but an adaptation. Many mollusks and arthropods have hemocyanin-based blood. It's an evolutionary advantage for their marine environment."
    difficulty: hard
```

### Run Script:

```bash
python scripts/add_questions.py --draft questions/drafts/octopus_blood.yaml
```

### Output:

```
📖 Reading draft: questions/drafts/octopus_blood.yaml
============================================================
📝 Category: Animals
📊 Questions to add: 1
✅ DeepSeek API available for Chinese translation
📂 File: animals.json
🔢 Current questions: 20
🆔 Next ID: anim_021

🔨 Building questions...
------------------------------------------------------------

[1/1] Why do octopuses have blue blood?
    ID: anim_021 | Difficulty: hard
    🤖 Processing with DeepSeek translation...

🔨 Processing: Why do octopuses have blue blood?
  🇨🇳 Translating question to Chinese...
  🇨🇳 Translating choices to Chinese...
  🇨🇳 Translating explanations to Chinese...
  ✅ Question completed successfully
    ✓ Translated to Chinese (DeepSeek)
    ✓ Added timestamps (created_at, last_modified_at)

💾 Updating JSON file...
✅ Added 1 questions to animals.json

✅ Running validation pipeline...
------------------------------------------------------------
🔍 Running 2-Layer Validation Pipeline...
============================================================

📋 Layer 1: Format Validation
✅ ALL FILES PASSED!

🔬 Layer 2: Fact Checking
✅ Passed: Critical Issues: 0

✅ All validations passed!

📋 Updating master list...
✅ Added 1 questions to master list

============================================================
✨ Success! Added 1 questions to Animals
============================================================

📌 Next steps:
   1. Review: src/data/questions/animals.json
   2. Commit: git add . && git commit -m 'Add 1 Animals questions'
   3. Push: git push
```

### Result (in animals.json):

```json
{
  "id": "anim_021",
  "question_en": "Why do octopuses have blue blood?",
  "question_zh": "为什么章鱼有蓝色的血液？",
  "choices_en": [
    "They live in cold water",
    "Hemocyanin uses copper, not iron",
    "They absorb blue from ocean",
    "Genetic mutation from evolution"
  ],
  "choices_zh": [
    "它们生活在冷水中",
    "血蓝蛋白含铜而非铁",
    "它们从海洋中吸收蓝色",
    "进化的基因突变"
  ],
  "correct_answer": 1,
  "explanations_en": [
    "Wrong. While octopuses do live in various water temperatures...",
    "Correct! Octopuses use hemocyanin instead of hemoglobin...",
    "Wrong. Blood color comes from internal chemistry...",
    "Wrong. Blue blood isn't a mutation but an adaptation..."
  ],
  "explanations_zh": [
    "错误。虽然章鱼确实生活在各种水温中...",
    "正确！章鱼使用血蓝蛋白而不是血红蛋白...",
    "错误。血液颜色来自内部化学反应...",
    "错误。蓝色血液不是突变而是适应..."
  ],
  "difficulty": "hard",
  "created_at": "2025-11-20T12:34:56.789012+00:00",
  "last_modified_at": "2025-11-20T12:34:56.789012+00:00"
}
```

---

## Benefits of This Workflow

### ✅ No API Costs for Fact-Checking
- Claude Code fact-checks in conversation (FREE)
- Only pay for DeepSeek translation (~$0.001 per question)
- No Anthropic API charges

### ✅ Interactive Review
- Discuss questions with Claude Code before creating
- Get explanations improved in real-time
- Ask follow-up questions during fact-checking
- Iterate until perfect

### ✅ High Quality
- Human-in-the-loop verification
- Claude Code provides scientific sources
- You can challenge or request changes
- Full control over content

### ✅ Fully Automated Script
- No confirmations after fact-checking
- Automatic translation
- Automatic validation
- Automatic file updates

---

## Workflow Comparison

| Feature | Old Workflow | New Workflow (V3) |
|---------|--------------|-------------------|
| Fact-Checking | OpenAI API | ✅ Claude Code (conversation) |
| English Generation | Anthropic API | ✅ Claude Code (conversation) |
| Chinese Translation | OpenAI/Manual | ✅ DeepSeek API |
| Timestamps | ❌ No | ✅ Yes (automatic) |
| API Keys Required | 2 (OpenAI + Anthropic) | ✅ 1 (DeepSeek only) |
| Cost per Question | ~$0.019 | ✅ ~$0.001 (95% cheaper) |
| Manual Confirmations | Sometimes | ✅ Never |
| Interactive Review | ❌ No | ✅ Yes (with Claude Code) |
| Quality Control | Automated only | ✅ Interactive + Automated |

---

## Character Limits

The script validates these automatically:

| Field | English | Chinese |
|-------|---------|---------|
| Question | 45 chars | 25 chars |
| Choice | 35 chars | 15 chars |

If Chinese translation exceeds limits, the script automatically retries with length constraints.

---

## Validation Layers

All automatic, no confirmations:

1. **Layer 1: Format Validation**
   - JSON structure
   - Required fields
   - Character limits

2. **Layer 2: Fact Checking**
   - Scientific accuracy (already done in conversation)
   - Cross-references
   - Consistency

---

## Troubleshooting

### "DEEPSEEK_API_KEY not found"

```bash
echo 'export DEEPSEEK_API_KEY="sk-your-key"' >> ~/.zprofile
source ~/.zprofile
```

### "Missing explanations - should be fact-checked in Claude Code"

You need to provide all 4 explanations in your YAML file. Ask Claude Code to generate them first.

### "Character limit violations"

Claude Code will help you shorten text. Ask: "Make this explanation shorter to fit 35 characters"

### Chinese translation too long

The script automatically retries with length constraints. If it still fails, ask Claude Code to simplify the English version.

---

## Tips for Best Results

### 1. Ask Claude Code for Help

```
"Create a question about photosynthesis with fact-checked explanations"
"Review this question for scientific accuracy"
"Make these explanations more educational"
"Ensure all facts are correct for a middle school level"
```

### 2. Iterate in Conversation

```
YOU: "Is this explanation accurate?"
CLAUDE: "Almost! The percentage should be 21%, not 20%..."
YOU: "Fix it please"
CLAUDE: "Here's the corrected version..."
```

### 3. Use Templates

Copy `questions/drafts/template_v3.yaml` and fill in the fact-checked content from your conversation.

### 4. Batch Creation

Create multiple questions in one conversation, then save them all to one YAML file and run the script once.

---

## Summary

### Workflow Steps:
1. **Create** questions with Claude Code (interactive conversation)
2. **Fact-check** with Claude Code (immediate feedback)
3. **Save** to YAML file (copy-paste from conversation)
4. **Run** script (automatic translation + validation + file updates)
5. **Commit** when ready (your control)

### Requirements:
- ✅ DEEPSEEK_API_KEY (for translation)
- ❌ NO Anthropic API key needed
- ❌ NO OpenAI API key needed
- ❌ NO manual confirmations

### Cost:
- ~$0.001 per question (DeepSeek translation only)
- 95% cheaper than API-based fact-checking

### Quality:
- Interactive fact-checking with Claude Code
- Automated translation and validation
- Full human control and review
- High-quality bilingual content

---

**End of Guide**
