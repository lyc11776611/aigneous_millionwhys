# AIgneous Million Whys - MVP Landing Page

A minimal MVP landing page for AIgneous, featuring interactive volcano effects and knowledge graph visualizations.

## Features

- 🌋 **Interactive Volcano Effect** - Click anywhere to create volcanic animations with particle physics
- 🕸️ **Knowledge Graph Background** - Animated network visualization that responds to mouse movements
- 🎨 **Modern Design** - Clean, responsive layout with AIgneous brand colors
- ⚡ **Next.js 15** - Built with the latest Next.js and React 19

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build

```bash
npm run build
npm start
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
