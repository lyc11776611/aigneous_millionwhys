TEST
# AIgneous Million Whys - MVP Landing Page

A minimal MVP landing page for AIgneous, featuring interactive volcano effects and knowledge graph visualizations.

## Features

- 🌋 **Interactive Volcano Effect** - Click anywhere to create volcanic animations with particle physics
- 🕸️ **Knowledge Graph Background** - Animated network visualization that responds to mouse movements
- 🎨 **Modern Design** - Clean, responsive layout with AIgneous brand colors
- ⚡ **Next.js 15** - Built with the latest Next.js and React 19

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
