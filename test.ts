import { drawCircle, Shape3D } from 'replicad';

const main = () => {
    // Create a filleted cylinder from a circle
    return (drawCircle(20).sketchOnPlane().extrude(10) as Shape3D).fillet(2);
};

// Export or call the main function to avoid unused warning
export default main;