# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIgneous Million Whys - A bilingual (English/Chinese) educational quiz application built with Next.js 15, featuring 300 scientifically validated "十万个为什么" (One Hundred Thousand Whys) style questions across 19 categories.

**Tech Stack:** Next.js 15.1.4, React 19, TypeScript 5.8.3, Tailwind CSS 3.4.1

## Development Commands

### Next.js Application
```bash
# Development (hot reload)
npm run dev                    # Runs at http://localhost:3000

# Production build
npm run build                  # Type-checks and builds for production
npm start                      # Runs production server

# Linting
npm run lint
```

### Docker Deployment
```bash
./docker-start.sh              # Development mode (hot reload) at :8004
./docker-start.sh standalone   # Production build without nginx at :8004
./docker-start.sh prod         # Production with nginx-proxy
./docker-start.sh help         # Show all options

# Docker utilities
docker logs -f millionwhys-frontend
docker exec -it millionwhys-frontend sh
```

### Question Database Management
```bash
# Validate all questions (pre-commit hook)
npm run validate               # Runs 2-layer validation pipeline

# Validate single category
npm run validate:single chemistry.json

# Watch mode
npm run validate:watch

# Add new questions (V3 workflow - see below)
python3 scripts/add_questions.py --draft questions/drafts/my_questions.yaml

# Retranslate questions (contextual Chinese translation)
python3 scripts/retranslate_questions.py --all
```

## High-Level Architecture

### Question Management Workflow (V3)

**The repository uses a specialized two-phase workflow for creating questions:**

1. **Interactive Phase** - Claude Code fact-checks questions in conversation (no API key needed)
2. **Automation Phase** - Python scripts handle translation, validation, and file updates

**Critical Understanding:** When users ask to create questions, you should:
- Fact-check content interactively in the conversation
- Generate all 4 explanations with scientific accuracy
- Save fact-checked content to YAML format
- The user runs `python3 scripts/add_questions.py` to automate the rest

**Do NOT** attempt to call OpenAI/Anthropic APIs - fact-checking happens in your conversation with the user.

### Category Name Mapping

**JSON category names** (used in YAML drafts and JSON files) differ from **display names** (used in master list):

| JSON Name (code) | Display Name (master list) | File |
|------------------|---------------------------|------|
| Animals | Animal Behavior | animals.json |
| Astronomy | Astronomy & Space | astronomy.json |
| Chemistry | Chemistry Around Us | chemistry.json |
| Economics | Economics & Money | economics.json |
| Physics | Physics in Daily Life | physics.json |
| Plants | Plant Science | plants.json |
| Psychology | Psychology & Behavior | psychology.json |
| Weather | Weather & Climate | weather.json |

The `MasterListUpdater` in `scripts/utils/master_list.py` handles this mapping via `_get_category_display_name()`.

### Translation System (Contextual)

**Character Limits:**
- `question_en`: 45 chars, `question_zh`: 35 chars
- `choice_en`: 35 chars, `choice_zh`: 25 chars
- `explanation_en`: unlimited, `explanation_zh`: unlimited

**Translation Strategy:**
- **V3 uses contextual translation** - translates question + all 4 choices + all 4 explanations in **one API call** to DeepSeek
- This maintains semantic coherence (choices relate to question, explanations reference choices)
- Uses "十万个为什么" style prompt - fun, engaging, scientifically accurate Chinese
- Temperature: 0.5 (higher than basic translation for more natural language)
- JSON mode for structured output

**Files:**
- `scripts/question_builder_v3.py` - Main question builder with `_translate_question_with_context()`
- `scripts/retranslate_questions.py` - Batch retranslation tool

### Validation Pipeline (2-Layer)

**Automatic validation runs before commits via git hook:**

1. **Layer 1: Format Validation** (`scripts/auto_validate.py`)
   - JSON structure, required fields, character limits
   - Question format: 4 choices, 1 correct answer (0-3), difficulty (easy/medium/hard)

2. **Layer 2: Fact Checking** (`scripts/validate_facts.py`)
   - Rule-based scientific accuracy checks
   - Consistency validation

**Validation Runner:** `scripts/utils/validation.py` orchestrates both layers.

### Master List Management

`ALL_QUESTIONS_MASTER_LIST.md` tracks all 300 questions in human-readable format:

**Format:**
```markdown
## Animal Behavior (28)

1. Why do cats purr? [medium]
2. Why do dogs wag their tails? [easy]
...
```

**Automated Updates:**
- `scripts/utils/master_list.py::add_questions()` - Adds new questions
- `scripts/utils/master_list.py::update_totals()` - Updates question counts
- Called automatically by `add_questions.py` after adding questions

**Pattern Matching:**
- Questions: `^\d+\.\s+.+\s+\[(easy|medium|hard)\]`
- Categories: `## Category Name (count)`
- Total count: `^Total questions: \d+`

### Admin Dashboard Authentication

**Next.js 15 Layout Export Restrictions:**
- Layouts (`src/app/admin/layout.tsx`) cannot export named functions
- Auth context moved to separate file: `src/app/admin/auth-context.tsx`
- Components import `useAuth` from `auth-context.tsx`, not from `layout.tsx`

**Key Files:**
- `src/app/admin/auth-context.tsx` - AuthContext and useAuth hook
- `src/app/admin/layout.tsx` - Admin layout (imports AuthContext)
- `src/app/admin/stats/page.tsx` - Analytics dashboard
- `src/app/admin/questions/page.tsx` - Question bank viewer

### Data Flow

```
User conversation with Claude Code
  ↓ (fact-checked English content)
YAML draft (questions/drafts/*.yaml)
  ↓ (python scripts/add_questions.py)
Question Builder V3
  ↓ (DeepSeek API - contextual translation)
JSON files (src/data/questions/*.json)
  ↓ (validation pipeline)
Master List (ALL_QUESTIONS_MASTER_LIST.md)
  ↓ (Next.js app reads JSON)
Quiz Application (/quiz route)
```

## Environment Variables

Required for question automation:
```bash
DEEPSEEK_API_KEY="sk-..."           # For Chinese translation (required)
ADMIN_PASSWORD="your-password"      # For /admin dashboard (required)
```

No Anthropic API key needed - Claude Code handles fact-checking in conversation.

## Key Files & Modules

### Python Scripts (Question Automation)
- `scripts/add_questions.py` - Main CLI for adding questions
- `scripts/question_builder_v3.py` - Question builder with contextual translation
- `scripts/retranslate_questions.py` - Batch retranslation with context
- `scripts/utils/id_manager.py` - Question ID management (e.g., anim_001, phys_024)
- `scripts/utils/master_list.py` - Master list updater with category mapping
- `scripts/utils/validation.py` - 2-layer validation runner

### Next.js Application
- `src/app/quiz/page.tsx` - Main quiz interface
- `src/app/admin/*` - Admin dashboard (password-protected)
- `src/data/questions/*.json` - Question database (19 categories, 300 questions)
- `src/types/questions.ts` - TypeScript type definitions

### Configuration
- `questions/drafts/template_v3.yaml` - Template for new questions
- `.env` - Environment variables (DEEPSEEK_API_KEY, ADMIN_PASSWORD)
- `ALL_QUESTIONS_MASTER_LIST.md` - Human-readable question index

## Common Workflows

### Adding New Questions
1. User asks Claude Code to create questions about a topic
2. Claude Code fact-checks content interactively in conversation
3. Save fact-checked content to YAML file (copy from conversation)
4. User runs: `python3 scripts/add_questions.py --draft questions/drafts/my_questions.yaml`
5. Script automatically translates, validates, updates JSON + master list

### Retranslating Questions
```bash
# All questions with contextual translation
python3 scripts/retranslate_questions.py --all

# Specific category
python3 scripts/retranslate_questions.py --file animals.json --all

# Only questions with specific timestamp
python3 scripts/retranslate_questions.py --timestamp 2025-11-20
```

### Type Assertions for JSON Imports
When importing question JSON files in TypeScript, use double type assertion to avoid strict tuple checking:
```typescript
import chemistryData from '@/data/questions/chemistry.json';
const chemistry: QuestionCategory = chemistryData as unknown as QuestionCategory;
```

## Important Patterns

### Category Mapping
Always use `_get_category_display_name()` when searching master list:
```python
# In master_list.py::add_questions()
display_name = self._get_category_display_name(category)  # "Animals" → "Animal Behavior"
if line.startswith('## ') and display_name in line:
    # Found the category section
```

### Contextual Translation
Always translate entire question in one API call for coherence:
```python
# question_builder_v3.py
translation = self._translate_question_with_context(draft)
# Returns: {'question': '...', 'choices': [...], 'explanations': [...]}
```

### Next.js 15 Layout Restrictions
Never export named functions/hooks from layout files:
```typescript
// ❌ BAD - src/app/admin/layout.tsx
export const useAuth = () => useContext(AuthContext);

// ✅ GOOD - src/app/admin/auth-context.tsx
export const useAuth = () => useContext(AuthContext);
```

## Testing & Validation

All questions are validated automatically via git pre-commit hook (installed via `scripts/install_git_hook.sh`).

Manual validation:
```bash
npm run validate              # All categories
npm run validate:single physics.json
```

## Project Structure Notes

- **Admin routes** (`/admin/*`) are password-protected via `src/app/admin/layout.tsx`
- **Data logs** (`data/logs/*.jsonl`) are git-ignored for privacy
- **Question files** use consistent key ordering: question_en, question_zh, choices_en, choices_zh, correct_answer, explanations_en, explanations_zh, difficulty, created_at, last_modified_at
- **Question IDs** follow pattern: `{category_prefix}_{number}` (e.g., anim_001, phys_024)
