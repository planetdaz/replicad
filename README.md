# Replicad TypeScript 3D Modeling Workflow

This repository contains a TypeScript-based workflow for creating 3D models using [Replicad](https://replicad.xyz/) - a code-first CAD library. The goal is to procedurally define 3D shapes in TypeScript and export them as STL files for 3D printing, without needing traditional CAD software.

## 🎯 Workflow Overview

1. **Write TypeScript** - Define 3D shapes procedurally in `.ts` files
2. **Auto-compile** - TypeScript watch mode compiles to JavaScript automatically
3. **Visualize** - Copy/paste JavaScript code into Replicad Studio online
4. **Export STL** - Download STL files for 3D printing

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- TypeScript configured (already set up in this repo)

### Setup
```bash
# Install dependencies (if not already done)
npm install

# Start TypeScript watch mode
npm run watch
```

### Creating a New 3D Model

1. **Create a new `.ts` file** (e.g., `my-part.ts`)
2. **Follow the pattern:**
```typescript
// For replicad studio: main function receives the replicad library
const main = (replicad: any) => {
    const { drawCircle } = replicad;
    
    // Your 3D model code here
    const result = drawCircle(25).sketchOnPlane().extrude(10);
    
    return result;
};
```

3. **Important:** Only ONE file can have a `main` function at a time
   - Rename other `main` functions to something else (e.g., `mainTest`, `mainOld`)
   - The active file should have the function named `main`

4. **Build:** Save the file - TypeScript watch will auto-compile to `.js`

## 🌐 Using Replicad Studio

### Current Workflow (Copy/Paste)
1. Open [Replicad Studio Workbench](https://studio.replicad.xyz/workbench)
2. Copy the compiled JavaScript code from your `.js` file
3. Paste into the online editor
4. View the 3D model in real-time
5. Export as STL for 3D printing

### Alternative Online Tool
There's another online tool where you can directly open files from the web UI, but the exact URL needs to be located.

## 📁 Current Files

- **`test.ts`** - Custom hexagon example (120mm x 60mm with triangular extensions)
- **`vent-ring.ts`** - Ring/cylinder example (configurable inner/outer diameter and height)
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - Node.js dependencies and scripts

## 🔧 Available Scripts

```bash
npm run build    # One-time compilation
npm run watch    # Auto-compile on file changes (recommended)
npm run dev      # Alias for watch mode
```

## 🎨 Example Models

### Vent Ring
```typescript
const main = (replicad: any) => {
    const { drawCircle } = replicad;
    
    const outerRadius = 47.9 / 2;
    const innerRadius = 46.1 / 2;
    const height = 5;
    
    const outer = drawCircle(outerRadius).sketchOnPlane().extrude(height);
    const inner = drawCircle(innerRadius).sketchOnPlane().extrude(height);
    
    return outer.cut(inner); // Creates hollow ring
};
```

### Custom Hexagon
```typescript
const main = (replicad: any) => {
    const { draw } = replicad;
    
    const points = [
        [-60, 0], [60, 0], [90, 30],
        [60, 60], [-60, 60], [-90, 30]
    ];
    
    let hexagon = draw(points[0]);
    for (let i = 1; i < points.length; i++) {
        hexagon = hexagon.lineTo(points[i]);
    }
    
    return hexagon.close().sketchOnPlane().extrude(1);
};
```

## 🚀 Future Improvements

- **Local Replicad Server** - Run Replicad locally in VS Code as a hosted Node.js app
- **Direct STL Export** - Export STL files directly without online tools
- **Multiple Model Management** - Better workflow for managing multiple models
- **AI-Assisted Design** - Use AI agents to quickly describe shapes in English and generate code

## 🤖 AI-Assisted Workflow

The beauty of this approach is that you can describe shapes in plain English to an AI assistant, and it can generate the TypeScript code for you. For example:

> "Create a hexagon that's 120mm wide, 60mm tall, with triangular extensions making it 180mm at the widest point"

The AI can translate this into precise Replicad TypeScript code, making complex 3D modeling accessible without deep CAD knowledge.

## 📚 Resources

- [Replicad Documentation](https://replicad.xyz/docs)
- [Replicad Studio](https://studio.replicad.xyz/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
