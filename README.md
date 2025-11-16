# Replicad 3D Viewer

A local 3D viewer for creating and viewing [Replicad](https://replicad.xyz/) models with interactive controls and STL export. Define 3D shapes procedurally in JavaScript and visualize them instantly in a CAD-style viewer.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the viewer
npm run viewer
```

Then open your browser to **http://localhost:5173/**

## 🎨 Features

- **📦 Model Selection**: Dropdown to switch between different models
- **🎯 CAD-Style Rendering**: Flat shading with edge outlines for technical visualization
- **🎮 Interactive Controls**:
  - Left click + drag: Rotate
  - Right click + drag: Pan
  - Scroll: Zoom
- **💾 State Persistence**: Camera position and selected model persist across hot reloads
- **📥 STL Export**: High-resolution STL export with correct orientation for 3D printing
- **🔄 Live Reload**: Changes to model code automatically refresh in the browser
- **⚡ Fast**: Web worker keeps UI responsive during model computation

## ➕ Adding New Models

Models are organized in the `models/` directory. Each model has its own file.

### 1. Create a new model file

Create a new `.js` file in the `models/` directory (e.g., `models/my-model.js`):

```javascript
// My Model
// Brief description

export default async function build(replicad) {
    const { drawCircle } = replicad;

    // Your model code here
    const shape = drawCircle(10).sketchOnPlane().extrude(5);

    return shape;
}
```

### 2. Register in `models/index.json`

Add an entry to `models/index.json`:

```json
{
    "id": "my-model",
    "name": "My Model",
    "description": "Brief description shown in the viewer",
    "file": "./my-model.js"
}
```

**Note:** The `id` must match the filename (without `.js`).

### 3. Done!

The viewer will automatically pick up the new model and add it to the dropdown selector.


## 📁 Project Structure

```
replicad/
├── index.html          # Main HTML page with UI
├── viewer.js           # Main viewer script (Three.js setup, camera, controls)
├── worker.js           # Web worker for model computation (runs OpenCascade)
├── models/             # Directory containing all model files
│   ├── index.json      # Registry of all available models
│   ├── vent-ring.js    # Example: Vent ring model
│   └── hexagon.js      # Example: Hexagon model
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🔧 How It Works

1. **Model Registry**: Models are organized in `models/` directory with `index.json` as the registry
2. **Dynamic Loading**: Model files are loaded on-demand when selected
3. **Web Worker**: Model computation runs in a separate thread to keep UI responsive
4. **OpenCascade**: The replicad library uses OpenCascade.js (WebAssembly) for CAD operations
5. **Three.js**: Renders the computed mesh in an interactive 3D scene with CAD-style rendering

## 🎨 Example Models

### Vent Ring

<augment_code_snippet path="models/vent-ring.js" mode="EXCERPT">
````javascript
export default async function build(replicad) {
    const { drawCircle } = replicad;

    const outerDiameter = 48.2;
    const innerDiameter = 46.4;
    const height = 5;

    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;

    const outerCylinder = drawCircle(outerRadius).sketchOnPlane().extrude(height);
    const innerCylinder = drawCircle(innerRadius).sketchOnPlane().extrude(height);

    return outerCylinder.cut(innerCylinder);
}
````
</augment_code_snippet>

### Custom Hexagon

<augment_code_snippet path="models/hexagon.js" mode="EXCERPT">
````javascript
export default async function build(replicad) {
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
}
````
</augment_code_snippet>

## 💡 Tips

- The viewer automatically cleans up old meshes when switching models
- Models are built on-demand when selected
- You can have as many models as you want in the registry
- The build function receives the entire replicad library as a parameter
- Camera position and selected model persist across hot reloads using sessionStorage
- STL exports use higher resolution (10x finer) than the viewer for smoother curves

## 🐛 Troubleshooting

**Model not appearing?**
- Check the browser console for errors
- Make sure your build function returns a valid shape
- Verify the model ID in `index.json` matches the filename

**Viewer not loading?**
- Make sure the dev server is running (`npm run viewer`)
- Check that port 5173 is not blocked
- Try refreshing the page

**Model looks wrong?**
- The camera auto-centers based on the model's bounding box
- Models are rotated -90° to lie flat on the XY plane (like a 3D printer bed)
- Check that all shapes are properly closed

**STL export orientation wrong?**
- STL exports use the original replicad orientation (flat on XY plane)
- The exported file should be ready to import into your slicer

## 🤖 AI-Assisted Workflow

The beauty of this approach is that you can describe shapes in plain English to an AI assistant, and it can generate the JavaScript code for you. For example:

> "Create a hexagon that's 120mm wide, 60mm tall, with triangular extensions making it 180mm at the widest point"

The AI can translate this into precise Replicad code, making complex 3D modeling accessible without deep CAD knowledge.

## 📚 Resources

- [Replicad Documentation](https://replicad.xyz/docs)
- [Replicad API Reference](https://replicad.xyz/docs/api/)
- [Replicad Studio](https://studio.replicad.xyz/) - Online editor (alternative to this local viewer)
- [Three.js Documentation](https://threejs.org/docs/)

