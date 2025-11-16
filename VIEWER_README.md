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

To add a new model to the viewer, edit `models.js`:

```javascript
export const models = [
    // ... existing models ...
    {
        id: 'my-new-model',  // Unique identifier
        name: 'My New Model',  // Display name in dropdown
        description: 'Description shown below dropdown',
        buildFunction: async (replicad) => {
            // Import the functions you need from replicad
            const { drawCircle, draw } = replicad;
            
            // Your model code here
            const shape = drawCircle(10).sketchOnPlane().extrude(5);
            
            // Return the final shape
            return shape;
        }
    }
];
```

### Example: Adding a Simple Box

```javascript
{
    id: 'simple-box',
    name: 'Simple Box',
    description: 'A 10x10x10mm cube',
    buildFunction: async (replicad) => {
        const { drawRectangle } = replicad;
        
        const box = drawRectangle(10, 10)
            .sketchOnPlane()
            .extrude(10);
        
        return box;
    }
}
```

## 📁 File Structure

- **`index.html`** - Main HTML page with UI
- **`viewer.js`** - Main viewer script (Three.js setup, camera, controls)
- **`worker.js`** - Web worker for model computation (runs OpenCascade)
- **`models.js`** - Registry of all available models
- **`vent-ring.ts`** - Original TypeScript source for vent ring
- **`test.ts`** - Original TypeScript source for hexagon

## 🔧 How It Works

1. **Model Registry**: All models are defined in `models.js` with their build functions
2. **Web Worker**: Model computation runs in a separate thread to keep UI responsive
3. **OpenCascade**: The replicad library uses OpenCascade.js (WebAssembly) for CAD operations
4. **Three.js**: Renders the computed mesh in an interactive 3D scene

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

