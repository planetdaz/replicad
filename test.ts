// For replicad studio: main function receives the replicad library
const main = (replicad: any) => {
    const { drawCircle } = replicad;

    // Base disc: 125mm diameter, 8mm thick with 2mm fillet
    const baseDisc = drawCircle(125 / 2).sketchOnPlane().extrude(8).fillet(2);

    // Leg parameters
    const legRadius = 15 / 2; // 15mm diameter cylinders
    const legHeight = 22; // 22mm tall legs
    const discRadius = 125 / 2;
    const insetDistance = 10; // 10mm inset from edge
    const legPositionRadius = discRadius - insetDistance - legRadius;

    // Center leg (5th leg)
    const centerLeg = drawCircle(legRadius)
        .sketchOnPlane("XY", [0, 0, 8]) // Start at top of base disc
        .extrude(legHeight);

    // Create 4 outer legs positioned around the disc
    let result = baseDisc.fuse(centerLeg);

    // Position 4 legs evenly around the circle (90 degrees apart)
    for (let i = 0; i < 4; i++) {
        const angle = (i * 90) * Math.PI / 180; // Convert to radians
        const x = legPositionRadius * Math.cos(angle);
        const y = legPositionRadius * Math.sin(angle);

        const leg = drawCircle(legRadius)
            .sketchOnPlane("XY", [x, y, 8]) // Start at top of base disc
            .extrude(legHeight);

        result = result.fuse(leg);
    }

    return result;
};