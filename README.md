# AIgneous Million Whys - MVP Landing Page

A minimal MVP landing page for AIgneous, featuring interactive volcano effects and knowledge graph visualizations.

## Recent Major Changes

### Interactive Quiz Application
- **Quiz Interface** - Full-featured quiz experience at `/quiz`
  - Random question selection from 186-question bank
  - Bilingual support (English/Chinese toggle)
  - Instant feedback with detailed explanations
  - Share functionality (Web Share API + Clipboard)
  - Session-based tracking (no user accounts required)
  - Mobile-optimized responsive design

### Analytics & Admin Dashboard
- **Admin Dashboard** - Comprehensive analytics interface at `/admin`
  - Password-protected access (ADMIN_PASSWORD in .env)
  - Real-time quiz answer tracking with accuracy metrics
  - Share analytics (by method, category, difficulty)
  - Top 10 active users leaderboard
  - Recent 100 answers and 50 shares tracking
  - Read-only question bank viewer with inline explanations
- **Privacy Protection** - User data logged to `data/logs/` (git-ignored)
- **SEO Protection** - Admin routes blocked via `robots.txt`

### Question Bank Management
- **186 Questions** - Expanded from 31 to 186 scientifically validated questions
- **Secure Storage** - Questions stored in `src/data/questions/` (not publicly accessible)
- **Admin Interface** - Browse all questions with clickable answer explanations
- **Data Tracking** - JSONL-based logging for answers and shares (append-only, privacy-safe)

## Features

- 🌋 **Interactive Volcano Effect** - Click anywhere to create volcanic animations with particle physics
- 🕸️ **Knowledge Graph Background** - Animated network visualization that responds to mouse movements
- 🎨 **Modern Design** - Clean, responsive layout with AIgneous brand colors
- ⚡ **Next.js 15** - Built with the latest Next.js and React 19
- 📚 **Curious Minds Questions** - 186 scientifically validated Q&A questions in 10 categories

## Questions Database

This repository includes a comprehensive bilingual (English/Chinese) Q&A database for educational purposes.

### Features

- **31+ Questions** across 10 topics (Astronomy, Chemistry, Physics, Biology, etc.)
- **Scientifically Validated** - All questions verified through 3-layer validation system
- **Bilingual** - Full English and Chinese translations
- **Mobile Optimized** - Character limits designed for small screens
- **Type-Safe** - Full TypeScript support with type definitions

### Quick Usage

```typescript
import type { Question, QuestionCategory } from '@/types/questions';
import chemistryData from '@/data/questions/chemistry.json';

export default function QuizPage() {
  const questions = chemistryData.questions;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>
          <h2>{q.question_en}</h2>
          {q.choices_en.map((choice, i) => (
            <button key={i}>{choice}</button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Available Categories

- Animals (动物行为) - 3 questions
- Astronomy (天文与太空) - 3 questions
- Chemistry (身边的化学) - 4 questions
- Economics (经济与金融) - 3 questions
- Human Biology (人体生物学) - 3 questions
- Physics (日常物理) - 3 questions
- Plants (植物科学) - 3 questions
- Psychology (心理与行为) - 3 questions
- Technology (技术) - 3 questions
- Weather (天气与气候) - 3 questions

### Validation

All questions are automatically validated before commits:

```bash
# Validate all questions
npm run validate

# Validate specific category
npm run validate:single chemistry.json

# Watch for changes
npm run validate:watch
```

### Documentation

- [Quick Start Guide](docs/CURIOUS_MINDS_QUICKSTART.md) - Get started with questions
- [Type Definitions](src/types/questions.ts) - TypeScript types and helpers
- [Usage Examples](src/examples/QuestionUsageExamples.tsx) - Component examples
- [Complete Documentation](docs/questions/README.md) - Full question database docs

## Getting Started

This project uses Docker for consistent development and deployment environments.

### Prerequisites

- Docker and Docker Compose installed
- Copy `.env.example` to `.env` (optional, uses defaults if not present)

### Quick Start

**Development Mode** (Hot Reload):
```bash
./docker-start.sh dev
# or simply
./docker-start.sh
```
Access at: http://localhost:8004

**Standalone Production** (No nginx):
```bash
./docker-start.sh standalone
```
Access at: http://localhost:8004

**Production with Nginx** (Requires nginx-proxy):
```bash
./docker-start.sh prod
```
Access at: https://whys.igneous-ai.com

### Available Commands

```bash
./docker-start.sh help          # Show all available options
./docker-start.sh dev           # Start development server
./docker-start.sh standalone    # Build and run standalone production
./docker-start.sh prod          # Build and run with nginx proxy
```

### Useful Docker Commands

```bash
# View logs
docker logs -f millionwhys-frontend

# Stop container
docker compose down

# Restart container
docker restart millionwhys-frontend

# Enter container shell
docker exec -it millionwhys-frontend sh
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ClickVolcanoEffect.tsx    # Interactive volcano animation
│   │   └── KnowledgeGraphBackground.tsx  # Canvas-based graph visualization
│   ├── globals.css                    # Global styles and animations
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Main landing page
├── data/
│   └── questions/                     # Q&A database (10 categories, 31+ questions)
├── types/
│   ├── questions.ts                   # TypeScript type definitions
│   └── index.ts                       # Type exports
└── examples/
    └── QuestionUsageExamples.tsx      # Usage examples for questions

scripts/                                # Validation scripts
├── auto_validate.py                   # Automated validation system
├── validate_facts.py                  # Structure validation
├── ai_fact_check.py                   # AI fact-checking
└── install_git_hook.sh                # Git pre-commit hook installer

docs/                                   # Documentation
├── CURIOUS_MINDS_QUICKSTART.md        # Quick start guide
├── questions/                         # Question database docs
└── ...                                # Additional documentation
```

## Key Interactions

- **Click anywhere** to create volcano animations with erupting particles
- **Move your mouse** to interact with the knowledge graph nodes
- **Hover over UI elements** to see smooth gradient animations

## Technologies

- Next.js 15.1.4
- React 19
- TypeScript 5.8.3
- Tailwind CSS 3.4.1

## Design Credits

Inspired by the AIgneous original design with simplified MVP implementation focusing on core interactive elements.
