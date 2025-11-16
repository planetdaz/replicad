# Models Directory

This directory contains all the 3D models for the Replicad viewer. Each model is defined in its own JavaScript file.

## 📁 Structure

```
models/
├── index.json          # Registry of all models
├── vent-ring.js        # Vent ring model
├── hexagon.js          # Hexagon model
└── README.md           # This file
```

## ➕ Adding a New Model

### 1. Create a new model file

Create a new `.js` file in this directory (e.g., `my-model.js`):

```javascript
// My Model
// Brief description of what this model is

export default async function build(replicad) {
    const { drawCircle, draw } = replicad;

    // Your model code here
    const shape = drawCircle(10).sketchOnPlane().extrude(5);

    return shape;
}
```

### 2. Register the model in `index.json`

Add an entry to the `index.json` file:

```json
{
    "id": "my-model",
    "name": "My Model",
    "description": "Brief description shown in the viewer",
    "file": "./my-model.js"
}
```

**Important:** The `id` field must match the filename (without `.js` extension).

### 3. That's it!

The viewer will automatically pick up the new model and add it to the dropdown selector.

## 📝 Model File Template

```javascript
// Model Name
// Description

export default async function build(replicad) {
    // Destructure the replicad functions you need
    const { drawCircle, draw, drawRectangle } = replicad;

    // Define your model geometry
    const shape = drawCircle(25).sketchOnPlane().extrude(10);

    // Return the final shape
    return shape;
}
```

## 💡 Tips

- Keep each model in its own file for better organization
- Use descriptive comments at the top of each file
- The `build` function receives the entire `replicad` module
- You can use any replicad functions (see [replicad docs](https://replicad.xyz/docs/api/))
- Models are built on-demand when selected in the viewer
- Changes to model files will hot-reload in the viewer

## 🎨 Examples

See the existing model files for examples:
- `vent-ring.js` - Simple hollow cylinder using `drawCircle` and `cut`
- `hexagon.js` - Custom polygon using `draw` and `lineTo`

