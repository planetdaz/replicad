// Custom Hexagon Model
// Hexagon (120mm x 60mm with triangular extensions)

export default async function build(replicad) {
    const { draw } = replicad;

    // Custom hexagon: 120x60 rectangle with triangular extensions
    const points = [
        [-60, 0],           // Bottom left of rectangle
        [60, 0],            // Bottom right of rectangle
        [90, 30],           // Right triangle peak
        [60, 60],           // Top right of rectangle
        [-60, 60],          // Top left of rectangle
        [-90, 30]           // Left triangle peak
    ];

    // Create the hexagon using drawing pen
    let hexagon = draw(points[0]);

    for (let i = 1; i < points.length; i++) {
        hexagon = hexagon.lineTo(points[i]);
    }

    // Close the shape, convert to face, and extrude
    const result = hexagon.close().sketchOnPlane().extrude(1);

    return result;
}

