# Automated Question Generation with Multi-Layer Validation

## 🎯 Overview

This document describes the **automated 3-layer validation workflow** for creating scientifically accurate questions.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Manual Review Agent (during generation)          │
│  ↓ Built into SKILL.md workflow                            │
│  ↓ AI reviews own content for scientific accuracy          │
│  ↓ Self-correction loop until HIGH confidence               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Automated Structure Validation                   │
│  ↓ validate_facts.py                                        │
│  ↓ Checks format, lengths, consistency, red flags          │
│  ↓ BLOCKS if critical issues found                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: AI Fact-Check with Web Search                    │
│  ↓ ai_fact_check.py                                         │
│  ↓ Verifies facts against authoritative sources            │
│  ↓ Generates detailed fact-check report                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                 ✅ VALIDATED QUESTION
```

## 📋 Complete Workflow

### When Creating New Questions

**Step 1: Generate Question (with Layer 1 validation)**

Use the curious-minds skill which includes built-in Review Agent:

```
User: "Generate 3 chemistry questions about cooking"

Skill:
  1. ✍️  Generate question, choices, explanations
  2. 🔍 LAYER 1: Review Agent activates
  3. ✓  Fact-check scientific accuracy
  4. ✓  Verify correct answer is correct
  5. ✓  Check for misconceptions
  6. 🔄 Self-correction loop if issues found
  7. ✅ Only accept HIGH confidence content
  8. 💾 Save to chemistry.json
```

**Step 2: Auto-Validate (Layer 2 + 3)**

Immediately after saving, run automatic validation:

```bash
# Validate the file (from repository root)
python3 scripts/auto_validate.py chemistry.json --ai-check
```

This will:
- ✓ **Layer 2**: Check structure, format, consistency
- ✓ **Layer 3**: Generate AI fact-check prompts
- ⚠️  BLOCK if critical issues found

**Step 3: AI Fact-Check (if needed)**

If Layer 3 prompts are generated, run them through Claude:

```bash
# Get fact-check prompt for specific question (from repository root)
python3 scripts/ai_fact_check.py --file chemistry.json --question chem_004
```

Copy the prompt → Run through Claude with web search → Review findings

**Step 4: Fix Issues (Self-Correction)**

If any layer found issues:

```
1. Review the issue details
2. Fix the question content
3. Re-run validation: python3 scripts/auto_validate.py chemistry.json
4. Repeat until ✅ PASSED
```

## 🤖 Automatic Options

### Option 1: Git Pre-Commit Hook (Recommended)

Automatically validate before every commit:

```bash
# One-time setup (from repository root)
bash scripts/install_git_hook.sh

# Now validation runs automatically on commit
git add src/data/questions/chemistry.json
git commit -m "Add new questions"
# → Validation runs automatically
# → Commit blocked if issues found!
```

**Benefits:**
- ✅ Can't accidentally commit invalid questions
- ✅ Team members protected from mistakes
- ✅ Zero extra effort after setup

### Option 2: Watch Mode

Auto-validate whenever files change:

```bash
# Start watch mode (from repository root)
python3 scripts/auto_validate.py --watch

# Now edit src/data/questions/chemistry.json in another window
# → Validation runs automatically on save!
```

**Benefits:**
- ✅ Immediate feedback while editing
- ✅ Catches issues in real-time
- ✅ Great for development

### Option 3: Validate All (Pre-Release)

Before releasing, validate everything:

```bash
# Validate all question files (from repository root)
python3 scripts/auto_validate.py --all

# With AI fact-check prompts
python3 scripts/auto_validate.py --all --ai-check
```

## 🔧 Integration with Skill

The SKILL.md has been updated with the complete workflow:

### Updated Generation Process

```markdown
**Phase 1: Planning**
1. Ask user for topic, difficulty, count

**Phase 2: Generation**
2. Generate question, choices, explanations

**Phase 3: Layer 1 - Manual Review Agent (BUILT-IN)**
3. ✓ Activate Review Agent
4. ✓ Fact-check scientific accuracy
5. ✓ Verify correct/wrong answers
6. ✓ Check for misconceptions
7. 🔄 Self-correction if needed
8. ✅ Only accept HIGH confidence

**Phase 4: Save & Auto-Validate**
9. 💾 Save to .json file
10. 🤖 Auto-run Layer 2 validation (structure)
11. 📊 Report: PASSED or issues found

**Phase 5: Layer 3 - AI Fact-Check (if requested)**
12. 🧠 Generate fact-check prompts
13. 🔍 User runs through Claude with web search
14. ✅ Verify against authoritative sources

**Phase 6: Self-Correction (if needed)**
15. 🔄 Fix any issues found
16. 🔁 Re-validate until PASSED
17. ✅ Final validation before release
```

## 📊 Validation Criteria

### Layer 1: Manual Review Agent (in SKILL.md)

**Checks:**
- ✓ Scientific accuracy of correct answer
- ✓ Wrong answer explanations are accurate
- ✓ No common misconceptions reinforced
- ✓ Current scientific understanding
- ✓ No contradictions

**Confidence Levels:**
- ✅ HIGH: Established science, verified facts → ACCEPT
- ⚠️ MEDIUM: Generally accepted → NEEDS MORE REVIEW
- ❌ LOW: Uncertain/controversial → REJECT

### Layer 2: Automated Structure Validation

**Checks:**
- ✓ Valid JSON format
- ✓ All required fields present
- ✓ Character limits (mobile optimization)
- ✓ Explanation format (Correct!/Wrong.)
- ✓ Logical consistency
- ✓ Red flag words (always, never, proven)
- ✓ Category-specific misconceptions

**Severity Levels:**
- 🔴 CRITICAL: BLOCKS validation → MUST FIX
- 🟡 WARNING: Should review → RECOMMENDED FIX
- ℹ️ INFO: Nice to know → OPTIONAL

### Layer 3: AI Fact-Check with Web Search

**Checks:**
- ✓ Scientific claims verified against web sources
- ✓ Authoritative sources consulted (NASA, NIH, Wikipedia, journals)
- ✓ Numerical values verified (speeds, percentages, temperatures)
- ✓ Current information (not outdated)
- ✓ No misconceptions created

**Sources by Category:**
- **Astronomy**: NASA, ESA, astronomical databases
- **Chemistry**: Chemistry journals, educational sites
- **Biology**: NIH, medical sites, biology textbooks
- **Physics**: Physics resources, verified sources
- **Psychology**: Peer-reviewed research, APA resources

## 🎓 Best Practices

### For Question Authors

1. **Always use the skill** - it includes Layer 1 validation
2. **Run auto-validation** after creating questions
3. **Fix critical issues** immediately (can't proceed without)
4. **Review warnings** for quality improvement
5. **Fact-check with web search** for high-stakes content
6. **Re-validate after fixes** to ensure correctness

### For Teams

1. **Install git hook** - protects whole team
2. **Code review** - second pair of eyes
3. **Regular validation** - run `--all` before releases
4. **Track metrics** - monitor quality over time
5. **Update validators** - add new checks as needed

### For Specific Topics

**High-Risk Topics** (require extra validation):
- Medical/health information
- Physics formulas and calculations
- Chemical reactions
- Astronomical data
- Economic principles

**For these:**
- ✅ Always run Layer 3 AI fact-check
- ✅ Consider expert review
- ✅ Add source citations

## 🚀 Quick Reference

### Common Commands

```bash
# All commands run from repository root

# Validate single file
python3 scripts/auto_validate.py chemistry.json

# Validate with AI fact-check
python3 scripts/auto_validate.py chemistry.json --ai-check

# Validate all files
python3 scripts/auto_validate.py --all

# Watch mode (auto-validate on changes)
python3 scripts/auto_validate.py --watch

# Install git hook (one-time)
bash scripts/install_git_hook.sh

# Run fact-check on specific question
python3 scripts/ai_fact_check.py --file chemistry.json --question chem_001
```

### Exit Codes

- `0`: All validations passed ✅
- `1`: Critical issues found ❌

### Bypass (Emergency Only)

```bash
# Skip validation in git commit (NOT RECOMMENDED)
git commit --no-verify

# Run without blocking on critical issues
python3 scripts/auto_validate.py --no-strict chemistry.json
```

## 📈 Quality Metrics

Track these over time:

- **Pass Rate**: % of questions passing all layers first try
- **Critical Issue Rate**: Critical issues per 100 questions
- **Fact-Check Success**: % passing AI fact-check
- **Common Issues**: Which validators trigger most often

## 🔮 Future Enhancements

Potential additions to the validation system:

1. **Source Citation Tracking**: Require sources for facts
2. **Plagiarism Detection**: Check against existing questions
3. **User Testing**: Track which questions confuse users
4. **Difficulty Calibration**: Verify difficulty ratings with data
5. **Translation Validation**: Ensure CN/EN equivalence
6. **Accessibility Checks**: Screen reader compatibility
7. **A/B Testing**: Compare question variations

---

## 📞 Getting Help

**Validation failed and not sure why?**

1. Read the detailed error message
2. Check against SKILL.md requirements
3. Run fact-check: `python3 scripts/ai_fact_check.py --file [file]`
4. Review with Claude using the generated prompt
5. Fix and re-validate

**Need to add custom validation?**

Edit `validate_facts.py` and add to:
- `_check_accuracy_markers()` for red flags
- `_get_manual_verification_notes()` for category checks
- `misconception_checks` dict for topic-specific issues

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Status**: Ready for Production ✅
