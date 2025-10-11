"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replicad_1 = require("replicad");
const main = () => {
    // Create a filleted cylinder from a circle
    return (0, replicad_1.drawCircle)(20).sketchOnPlane().extrude(10).fillet(2);
};
// Export or call the main function to avoid unused warning
exports.default = main;
//# sourceMappingURL=test.js.map