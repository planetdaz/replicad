// Main viewer script
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Get DOM elements
const canvas = document.getElementById('canvas');
const statusEl = document.getElementById('status');
const modelSelect = document.getElementById('modelSelect');
const modelDescription = document.getElementById('modelDescription');

// Track current model meshes
let currentModelMeshes = [];
let availableModels = [];

// Storage keys
const STORAGE_KEYS = {
    SELECTED_MODEL: 'replicad-viewer-selected-model',
    CAMERA_POSITION: 'replicad-viewer-camera-position',
    CAMERA_TARGET: 'replicad-viewer-camera-target'
};

// Set up Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // Light gray background for CAD style

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight - 60); // Account for header
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting - Full ambient for CAD-style flat lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

// Grid helper - darker lines for light background
const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0xcccccc);
scene.add(gridHelper);

// Axes helper
const axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

// Update status
function updateStatus(message, type = 'loading') {
    statusEl.textContent = message;
    statusEl.className = type;
}

// Create mesh from worker data
function createMeshFromData(meshData) {
    const geometry = new THREE.BufferGeometry();

    // Set vertices
    const vertices = new Float32Array(meshData.vertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Set normals
    const normals = new Float32Array(meshData.normals);
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    // Set indices
    const indices = new Uint32Array(meshData.triangles);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // Create CAD-style material (flat, no lighting effects)
    const material = new THREE.MeshBasicMaterial({
        color: 0x3498db, // Bright blue for good contrast on light background
        side: THREE.DoubleSide,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);

    // Add edge lines for CAD-style outline (before rotation)
    const edges = new THREE.EdgesGeometry(geometry, 15); // 15 degree threshold for edges
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 1
    });
    const edgeLines = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(edgeLines); // Add as child so it rotates with the mesh

    // Rotate mesh so it lies flat on the XY plane (like a 3D printer bed)
    // Replicad extrudes in Z, but we want models to sit on the grid
    mesh.rotation.x = -Math.PI / 2; // Rotate -90 degrees around X axis

    return mesh;
}

// Start the worker
updateStatus('Loading OpenCascade...', 'loading');

const worker = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module'
});

worker.addEventListener('message', (event) => {
    const { type, meshes, error, models } = event.data;

    if (type === 'MODELS_LIST') {
        // Store models list
        availableModels = models;

        // Populate the model selector
        modelSelect.innerHTML = '';
        models.forEach((model) => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });

        // Try to restore previously selected model, or use first model
        const savedModelId = sessionStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
        const modelToLoad = savedModelId && models.find(m => m.id === savedModelId)
            ? savedModelId
            : models[0]?.id;

        if (modelToLoad) {
            modelSelect.value = modelToLoad;
            const model = models.find(m => m.id === modelToLoad);
            if (model) {
                modelDescription.textContent = model.description;
            }
            // Load the model
            loadModel(modelToLoad);
        }

    } else if (type === 'MODEL_READY') {
        updateStatus('Model loaded successfully!', 'ready');

        // Remove old model meshes
        currentModelMeshes.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        currentModelMeshes = [];

        // Add new meshes to scene
        meshes.forEach(meshData => {
            const mesh = createMeshFromData(meshData);
            scene.add(mesh);
            currentModelMeshes.push(mesh);
        });

        // Try to restore saved camera position
        const savedPosition = sessionStorage.getItem(STORAGE_KEYS.CAMERA_POSITION);
        const savedTarget = sessionStorage.getItem(STORAGE_KEYS.CAMERA_TARGET);

        if (savedPosition && savedTarget) {
            // Restore saved camera position
            const pos = JSON.parse(savedPosition);
            const target = JSON.parse(savedTarget);
            camera.position.set(pos.x, pos.y, pos.z);
            controls.target.set(target.x, target.y, target.z);
            controls.update();
        } else {
            // Center camera on model (first time only)
            const box = new THREE.Box3();
            currentModelMeshes.forEach(mesh => box.expandByObject(mesh));
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 2.5; // Zoom out a bit

            camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();
        }

    } else if (type === 'ERROR') {
        updateStatus(`Error: ${error}`, 'error');
        console.error('Worker error:', error);
    }
});

worker.addEventListener('error', (error) => {
    updateStatus(`Worker error: ${error.message}`, 'error');
    console.error('Worker error:', error);
});

// Function to load a model
function loadModel(modelId) {
    updateStatus('Building model...', 'loading');
    worker.postMessage({ type: 'BUILD_MODEL', modelId });
}

// Handle model selection change
modelSelect.addEventListener('change', (event) => {
    const selectedModelId = event.target.value;

    // Save selected model
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModelId);

    // Update description
    const model = availableModels.find(m => m.id === selectedModelId);
    if (model) {
        modelDescription.textContent = model.description;
        // Load the selected model
        loadModel(selectedModelId);
    }
});

// Save camera position periodically
let saveTimeout;
controls.addEventListener('change', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEYS.CAMERA_POSITION, JSON.stringify({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        }));
        sessionStorage.setItem(STORAGE_KEYS.CAMERA_TARGET, JSON.stringify({
            x: controls.target.x,
            y: controls.target.y,
            z: controls.target.z
        }));
    }, 100);
});

// Request list of models first
updateStatus('Loading models...', 'loading');
worker.postMessage({ type: 'GET_MODELS' });

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

