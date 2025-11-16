// Web Worker for computing the 3D model
import opencascade from 'replicad-opencascadejs/src/replicad_single.js';
import opencascadeWasm from 'replicad-opencascadejs/src/replicad_single.wasm?url';
import { setOC } from 'replicad';

let initialized = false;

// Initialize OpenCascade
async function init() {
    if (initialized) return;

    const OC = await opencascade({
        locateFile: () => opencascadeWasm,
    });

    setOC(OC);
    initialized = true;
}

// Import the model function
async function buildModel() {
    // Import replicad functions
    const { drawCircle } = await import('replicad');

    // Vent ring dimensions
    const outerDiameter = 48.2;
    const innerDiameter = 46.4;
    const height = 5;

    // Calculate radii
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;

    // Create outer cylinder
    const outerCylinder = drawCircle(outerRadius).sketchOnPlane().extrude(height);

    // Create inner cylinder (hole)
    const innerCylinder = drawCircle(innerRadius).sketchOnPlane().extrude(height);

    // Subtract inner from outer to create ring
    const result = outerCylinder.cut(innerCylinder);

    return result;
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
    const { type } = event.data;

    try {
        if (type === 'BUILD_MODEL') {
            // Initialize if needed
            await init();

            // Build the model
            const shape = await buildModel();

            // Get mesh data for rendering
            const mesh = shape.mesh({ tolerance: 0.1, angularTolerance: 30 });
            const meshes = [{
                vertices: Array.from(mesh.vertices),
                triangles: Array.from(mesh.triangles),
                normals: Array.from(mesh.normals),
            }];

            // Send back to main thread
            self.postMessage({
                type: 'MODEL_READY',
                meshes,
            });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message,
        });
    }
});

