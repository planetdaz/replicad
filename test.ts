// For replicad studio: main function receives the replicad library
const main = (replicad: any) => {
    const { drawCircle, drawRectangle } = replicad;

    // Base disc: 129mm diameter, 8mm thick with fillet
    const discRadius = (125 + 4) / 2;
    const baseDisc = drawCircle(discRadius).sketchOnPlane().extrude(8).fillet(2);

    // Cross legs - two rectangles forming a plus, pulled back 8mm from edge
    const legHeight = 22;
    const legWidth = 4;
    const crossLength = (discRadius * 2) - (8 * 2); // Pull back 8mm from each end

    // First rectangle (horizontal)
    const horizontalLeg = drawRectangle(crossLength, legWidth)
        .sketchOnPlane("XY", [0, 0, 8])
        .extrude(legHeight);

    // Second rectangle (vertical)
    const verticalLeg = drawRectangle(legWidth, crossLength)
        .sketchOnPlane("XY", [0, 0, 8])
        .extrude(legHeight);

    // Fuse all parts together
    let result = baseDisc.fuse(horizontalLeg);
    result = result.fuse(verticalLeg);

    // Add selective fillet for flare effect at the joins only
    // Target edges where the legs meet the disc (not the outer edges)
    // const { EdgeFinder } = replicad;
    // result = result.fillet(3, (edges: any) =>
    //     edges.inPlane("XY", [0, 0, 8]) // Edges at the base level
    //         .ofCurveType("LINE") // Only straight edges (rectangle perimeters)
    //         .not((e: any) => e.inDirection([1, 0, 0])) // Exclude edges parallel to X axis
    //         .not((e: any) => e.inDirection([0, 1, 0])) // Exclude edges parallel to Y axis
    // );

    return result;
};