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

// Set up Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(50, 50, 50);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight2.position.set(-50, -50, -50);
scene.add(directionalLight2);

// Grid helper
const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
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

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        metalness: 0.3,
        roughness: 0.4,
        side: THREE.DoubleSide,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
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

        // Select the first model by default
        if (models.length > 0) {
            modelSelect.value = models[0].id;
            modelDescription.textContent = models[0].description;
            // Load the first model
            loadModel(models[0].id);
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

        // Center camera on model
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

    // Update description
    const model = availableModels.find(m => m.id === selectedModelId);
    if (model) {
        modelDescription.textContent = model.description;
        // Load the selected model
        loadModel(selectedModelId);
    }
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

