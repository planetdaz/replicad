"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { drawCircle } = replicad;
    // Vent ring dimensions
    const outerDiameter = 47.9;
    const innerDiameter = 46.1;
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
};
//# sourceMappingURL=vent-ring.js.map