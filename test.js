"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { drawCircle } = replicad;
    // Create a filleted cylinder from a circle (radius 25)
    return drawCircle(125 / 2).sketchOnPlane().extrude(30).fillet(2);
};
//# sourceMappingURL=test.js.map