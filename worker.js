// Web Worker for computing the 3D model
import opencascade from 'replicad-opencascadejs/src/replicad_single.js';
import opencascadeWasm from 'replicad-opencascadejs/src/replicad_single.wasm?url';
import { setOC } from 'replicad';
import modelsIndex from './models/index.json';

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

// Build a model by ID
async function buildModel(modelId) {
    // Find the model in the registry
    const modelConfig = modelsIndex.find(m => m.id === modelId);
    if (!modelConfig) {
        throw new Error(`Model "${modelId}" not found`);
    }

    // Dynamically import the model's build function
    const modelModule = await import(`./models/${modelId}.js`);
    const buildFunction = modelModule.default;

    // Import replicad
    const replicad = await import('replicad');

    // Call the model's build function
    const result = await buildFunction(replicad);

    return result;
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
    const { type, modelId } = event.data;

    try {
        if (type === 'BUILD_MODEL') {
            // Initialize if needed
            await init();

            // Build the model
            const shape = await buildModel(modelId);

            // Get mesh data for rendering
            const mesh = shape.mesh({ tolerance: 0.015, angularTolerance: 5 });
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
        } else if (type === 'EXPORT_STL') {
            // Initialize if needed
            await init();

            // Build the model
            const shape = await buildModel(modelId);

            // Export to STL using replicad's native export
            // Using higher resolution for smoother curves (lower tolerance values)
            const stlBlob = shape.blobSTL({
                tolerance: 0.01,      // 10x finer than viewer (was 0.1)
                angularTolerance: 10, // 3x finer than viewer (was 30)
                binary: false
            });

            // Send back to main thread
            self.postMessage({
                type: 'STL_READY',
                blob: stlBlob,
                modelId: modelId
            });
        } else if (type === 'GET_MODELS') {
            // Send the list of available models from the index
            self.postMessage({
                type: 'MODELS_LIST',
                models: modelsIndex.map(m => ({
                    id: m.id,
                    name: m.name,
                    description: m.description
                }))
            });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message,
        });
    }
});

