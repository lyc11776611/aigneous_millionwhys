# Cleanup Guide - Removing Old Workflow Files

**Date:** 2025-11-20
**Current Version:** V3 (Claude Code Fact-Checking Workflow)

---

## Overview

After implementing the V3 workflow, several files from V1 and V2 are now obsolete and should be removed to avoid confusion.

---

## Files to Remove

### 🗑️ Old Question Builders (Scripts)

| File | Reason to Remove |
|------|------------------|
| `scripts/question_builder.py` | Original version (pre-V2), replaced by V3 |
| `scripts/question_builder_v2.py` | Incorrect implementation with Anthropic API calls, replaced by V3 |

**Keep:**
- ✅ `scripts/question_builder_v3.py` - Current version (DeepSeek translation only)

---

### 🗑️ Old Templates

| File | Reason to Remove |
|------|------------------|
| `questions/drafts/template.yaml` | Original template, outdated workflow |
| `questions/drafts/template_v2.yaml` | V2 template (Anthropic API workflow), incorrect |

**Keep:**
- ✅ `questions/drafts/template_v3.yaml` - Current template (Claude Code fact-checking)

---

### 🗑️ Old Documentation (Root Directory)

| File | Reason to Remove |
|------|------------------|
| `WORKFLOW_V2_IMPLEMENTATION.md` | V2 implementation details, obsolete |
| `IMPLEMENTATION_STATUS.md` | V2 status report, obsolete |

**Keep:**
- ✅ `IMPLEMENTATION_V3_FINAL.md` - Current implementation report

---

### 🗑️ Old Documentation (docs/ Directory)

| File | Reason to Remove |
|------|------------------|
| `docs/AUTOMATED_WORKFLOW_GUIDE.md` | V2 workflow guide, replaced by CLAUDE_CODE_WORKFLOW_GUIDE.md |

**Check these (may have old workflow info):**
- ⚠️ `docs/AUTOMATION_GUIDE.md` - Review and update if needed
- ⚠️ `docs/ADDING_QUESTIONS.md` - Review and update if needed

**Keep:**
- ✅ `docs/CLAUDE_CODE_WORKFLOW_GUIDE.md` - Current workflow guide

---

### 🗑️ Old Test Files

| File | Reason to Remove |
|------|------------------|
| `questions/drafts/test_new_workflow.yaml` | V2 test file |
| `questions/drafts/test_automation.yaml` | Old test file |
| `questions/drafts/test_complete.yaml` | Old test file |

**Keep:**
- ✅ `questions/drafts/test_with_explanations.yaml` - Works with V3, useful for testing

---

## How to Clean Up

### Option 1: Safe Archive (Recommended)

Run the cleanup script to move old files to an archive folder:

```bash
./cleanup_old_files.sh
```

**What it does:**
- Creates `.archive/YYYYMMDD_HHMMSS/` folder
- Moves all old files there (organized by type)
- Keeps them safe in case you need to reference them
- Leaves only V3 files in the working directory

**Output:**
```
🗑️  Cleaning up old workflow files (V1 and V2)...
📂 Archiving old scripts...
  📦 Archiving: scripts/question_builder.py -> .archive/20251120_123456/scripts/
  📦 Archiving: scripts/question_builder_v2.py -> .archive/20251120_123456/scripts/
📂 Archiving old templates...
  ...
✅ Cleanup complete!
📦 Archived files are in: .archive/20251120_123456
```

**To permanently delete later:**
```bash
rm -rf .archive/
```

**To restore a file:**
```bash
mv .archive/20251120_123456/<path>/<file> <original-location>
```

---

### Option 2: Direct Removal (Permanent)

If you're sure you don't need the old files:

```bash
# Remove old builders
rm scripts/question_builder.py
rm scripts/question_builder_v2.py

# Remove old templates
rm questions/drafts/template.yaml
rm questions/drafts/template_v2.yaml

# Remove old test files
rm questions/drafts/test_new_workflow.yaml
rm questions/drafts/test_automation.yaml
rm questions/drafts/test_complete.yaml

# Remove old documentation
rm WORKFLOW_V2_IMPLEMENTATION.md
rm IMPLEMENTATION_STATUS.md
rm docs/AUTOMATED_WORKFLOW_GUIDE.md
```

⚠️ **Warning:** This permanently deletes files. Use Option 1 to archive first.

---

### Option 3: Manual Review

Review and remove files one by one:

```bash
# View file before deleting
cat scripts/question_builder_v2.py
# If you're sure, delete it
rm scripts/question_builder_v2.py
```

---

## After Cleanup

### ✅ Active Files (V3 Workflow)

**Core Scripts:**
- `scripts/question_builder_v3.py` - Builder with DeepSeek translation
- `scripts/add_questions.py` - Main CLI (uses V3 builder)

**Templates:**
- `questions/drafts/template_v3.yaml` - Current template

**Documentation:**
- `docs/CLAUDE_CODE_WORKFLOW_GUIDE.md` - User guide for V3 workflow
- `IMPLEMENTATION_V3_FINAL.md` - Implementation details

**Configuration:**
- `.automation_config.json` - Automation settings

**Test Files:**
- `questions/drafts/test_with_explanations.yaml` - V3-compatible test

---

## Verification

After cleanup, verify only V3 files remain:

```bash
# Check builders
ls -1 scripts/question_builder*.py
# Should show only: question_builder_v3.py

# Check templates
ls -1 questions/drafts/template*.yaml
# Should show only: template_v3.yaml

# Check workflow docs
ls -1 *WORKFLOW*.md
# Should show only: (none in root) or check docs/

# Check implementation docs
ls -1 *IMPLEMENTATION*.md
# Should show only: IMPLEMENTATION_V3_FINAL.md
```

---

## Files to Review/Update

These files may reference the old workflow and should be reviewed:

### 1. `docs/AUTOMATION_GUIDE.md`

**Check for:**
- References to Anthropic API in scripts
- Old workflow steps
- V2 builder usage

**Update to:**
- V3 workflow (Claude Code fact-checking)
- DeepSeek-only API requirement
- New template_v3.yaml

---

### 2. `docs/ADDING_QUESTIONS.md`

**Check for:**
- Old workflow instructions
- V2 template references
- API key requirements (Anthropic)

**Update to:**
- V3 workflow steps
- Claude Code interactive fact-checking
- Only DEEPSEEK_API_KEY needed

---

### 3. Main README (if exists)

**Check for:**
- Workflow overview
- API requirements
- Quick start guide

**Update to:**
- V3 workflow summary
- Link to `docs/CLAUDE_CODE_WORKFLOW_GUIDE.md`
- Correct API requirements

---

## Git Considerations

After cleanup, commit the changes:

```bash
# Review changes
git status

# Add removed files
git add -A

# Commit
git commit -m "Clean up old workflow files (V1/V2), keep only V3

- Removed old question builders (v1, v2)
- Removed old templates (v1, v2)
- Removed old documentation (V2 guides)
- Removed old test files
- Kept only V3 workflow files
- Archived old files in .archive/ (not committed)
"

# Add .archive/ to .gitignore
echo ".archive/" >> .gitignore
git add .gitignore
git commit -m "Add .archive/ to .gitignore"
```

---

## Summary

### Before Cleanup:
- 3 question builders (original, v2, v3)
- 3 templates (original, v2, v3)
- Multiple workflow docs (V2 and V3)
- Old test files

### After Cleanup:
- ✅ 1 question builder (v3)
- ✅ 1 template (v3)
- ✅ 1 workflow guide (Claude Code)
- ✅ 1 implementation doc (V3)
- ✅ Clean, focused codebase

### Benefits:
- ✅ No confusion about which files to use
- ✅ Clear workflow (V3 only)
- ✅ Easier maintenance
- ✅ Reduced codebase size
- ✅ Single source of truth

---

**Recommended Next Step:**

```bash
# Run safe archive cleanup
./cleanup_old_files.sh

# Review archived files
ls -la .archive/*/

# If satisfied, commit the cleanup
git add -A
git commit -m "Clean up old workflow files, keep only V3"

# Later, permanently delete archive if no longer needed
rm -rf .archive/
```

---

**End of Guide**
