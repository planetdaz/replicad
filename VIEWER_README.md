# Replicad 3D Viewer

A local 3D viewer for viewing replicad models with interactive controls.

## 🚀 Quick Start

```bash
# Start the viewer
npm run viewer
```

Then open your browser to **http://localhost:5173/**

## 🎨 Features

- **Model Selection**: Dropdown to switch between different models
- **3D Rendering**: Interactive Three.js viewer with proper lighting
- **Camera Controls**:
  - Left click + drag: Rotate
  - Right click + drag: Pan
  - Scroll: Zoom
- **Auto-centering**: Camera automatically centers on the selected model
- **Live Reload**: Changes to code automatically refresh in the browser

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

The viewer will automatically pick up the new model. See `models/README.md` for more details.

## 📁 File Structure

- **`index.html`** - Main HTML page with UI
- **`viewer.js`** - Main viewer script (Three.js setup, camera, controls)
- **`worker.js`** - Web worker for model computation (runs OpenCascade)
- **`models/`** - Directory containing all model files
  - **`index.json`** - Registry of all available models
  - **`vent-ring.js`** - Vent ring model
  - **`hexagon.js`** - Hexagon model
  - **`README.md`** - Guide for adding new models

## 🔧 How It Works

1. **Model Registry**: Models are organized in `models/` directory with `index.json` as the registry
2. **Dynamic Loading**: Model files are loaded on-demand when selected
3. **Web Worker**: Model computation runs in a separate thread to keep UI responsive
4. **OpenCascade**: The replicad library uses OpenCascade.js (WebAssembly) for CAD operations
5. **Three.js**: Renders the computed mesh in an interactive 3D scene

## 💡 Tips

- The viewer automatically cleans up old meshes when switching models
- Models are built on-demand when selected
- You can have as many models as you want in the registry
- The build function receives the entire replicad library as a parameter
- Use `async/await` in your build functions if needed

## 🐛 Troubleshooting

**Model not appearing?**
- Check the browser console for errors
- Make sure your build function returns a valid shape
- Verify the model ID is unique

**Viewer not loading?**
- Make sure the dev server is running (`npm run viewer`)
- Check that port 5173 is not blocked
- Try refreshing the page

**Model looks wrong?**
- The camera auto-centers based on the model's bounding box
- Try adjusting the extrusion height or dimensions
- Check that all shapes are properly closed

