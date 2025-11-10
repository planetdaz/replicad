"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { draw } = replicad;
    // Custom hexagon: 120x60 rectangle with triangular extensions
    // Rectangle: 120mm wide x 60mm tall
    // Triangular extensions: 30mm out on each side (total width 180mm)
    // Triangle peaks at middle height (30mm from top/bottom)
    // Pre-calculated coordinates for the hexagon vertices
    // Starting from bottom left, going clockwise
    const points = [
        [-60, 0], // Bottom left of rectangle
        [60, 0], // Bottom right of rectangle
        [90, 30], // Right triangle peak (30mm out, middle height)
        [60, 60], // Top right of rectangle
        [-60, 60], // Top left of rectangle
        [-90, 30] // Left triangle peak (30mm out, middle height)
    ];
    // Create the hexagon using drawing pen
    let hexagon = draw(points[0]);
    for (let i = 1; i < points.length; i++) {
        hexagon = hexagon.lineTo(points[i]);
    }
    // Close the shape, convert to face, and extrude to 2mm
    const result = hexagon.close().sketchOnPlane().extrude(1);
    return result;
};
//# sourceMappingURL=test.js.map