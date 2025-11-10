"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { draw } = replicad;
    // Custom hexagon with specific dimensions
    // Two opposite sides: 120mm each
    // Four other sides: 42.43mm each
    // All angles: 120° (equal angles)
    // Pre-calculated coordinates for the hexagon vertices
    // Starting from bottom left, going clockwise
    const points = [
        [-60, 0], // Bottom left of long side
        [60, 0], // Bottom right of long side
        [81.215, 36.74], // Right bottom vertex
        [60, 73.48], // Right top vertex
        [-60, 73.48], // Left top vertex
        [-81.215, 36.74] // Left bottom vertex
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