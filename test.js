"use strict";
// For replicad studio: main function receives the replicad library
const main = (replicad) => {
    const { drawCircle } = replicad;
    // Base disc: 129mm diameter (125 + 4mm for 2mm perimeter), 8mm thick with 2mm fillet
    const discRadius = (125 + 4) / 2; // Add 4mm to diameter (2mm perimeter all around)
    const baseDisc = drawCircle(discRadius).sketchOnPlane().extrude(8).fillet(2);
    // Cross leg parameters
    const legHeight = 22; // 22mm tall legs
    const legWidth = 4; // 4mm wide rectangles
    const crossLength = discRadius * 2; // Span from edge to edge
    // Create cross legs using rectangles
    const { drawRectangle } = replicad;
    // First rectangle (horizontal): spans full diameter, 4mm wide
    const horizontalLeg = drawRectangle(crossLength, legWidth)
        .sketchOnPlane("XY", [0, 0, 8]) // Start at top of base disc
        .extrude(legHeight);
    // Second rectangle (vertical): spans full diameter, 4mm wide, rotated 90 degrees
    const verticalLeg = drawRectangle(legWidth, crossLength)
        .sketchOnPlane("XY", [0, 0, 8]) // Start at top of base disc
        .extrude(legHeight);
    // Fuse the base disc with both cross legs
    let result = baseDisc.fuse(horizontalLeg).fuse(verticalLeg);
    // Now fillet the top edges of the cross legs (the feet)
    // This targets the rectangular edges at the top of the cross
    const { EdgeFinder } = replicad;
    result = result.fillet(2, (edges) => edges.inPlane("XY", [0, 0, 30]) // Only edges at Z=30 (top of legs)
    );
    // Add broader fillets at the joins between cross legs and disc
    // Target edges at the base where the rectangles meet the disc
    result = result.fillet(3, (edges) => edges.inPlane("XY", [0, 0, 8]) // Only edges at Z=8 (where legs meet disc)
        .ofCurveType("LINE") // Only straight edges (rectangle perimeters)
    );
    return result;
};
//# sourceMappingURL=test.js.map