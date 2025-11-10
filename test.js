"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { draw } = replicad;
    // Custom hexagon with specific dimensions
    // Two opposite sides: 120mm each (top and bottom)
    // Four other sides: 42.43mm each
    // Width at widest point (where short sides meet): 180mm
    // Calculate coordinates based on constraints
    const longSide = 120;
    const shortSide = 42.43;
    const maxWidth = 180;
    // Pre-calculated coordinates for the hexagon vertices
    // Starting from bottom left, going clockwise
    const points = [
        [-60, 0], // Bottom left of long side (120mm / 2 = 60)
        [60, 0], // Bottom right of long side
        [90, 36.74], // Right bottom vertex (180mm / 2 = 90)
        [60, 73.48], // Right top vertex
        [-60, 73.48], // Left top vertex
        [-90, 36.74] // Left bottom vertex (-180mm / 2 = -90)
    ];
    // Create the hexagon using drawing pen
    let hexagon = draw(points[0]);
    for (let i = 1; i < points.length; i++) {
        hexagon = hexagon.lineTo(points[i]);
    }
    // Close the shape, convert to face, and extrude to 2mm
    const result = hexagon.close().sketchOnPlane().extrude(2);
    return result;
};
//# sourceMappingURL=test.js.map