// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)

export default async function build(replicad) {
    const { drawCircle, drawRoundedRectangle } = replicad;


    // Vent ring dimensions
    const outerDiameter = 44;   // thick was 51
    const innerDiameter = 38.5;
    const height = 6;

    // Lip parameters
    const hasLip = true;           // if true, add a lip inside the ring
    const lipInnerDiameter = 35;   // was 33.5 on print #4;   // inner diameter of the lip (mm)
    const lipHeight = 1;         // height of the lip (mm)

    // Notch array: each notch is [width, depth, fillet, angleDeg]
    // angleDeg is the angle on the circle (0 = +Y, 90 = +X, 180 = -Y, 270 = -X)
    // Example: 3 notches at 0, 120, 240 degrees
    const notches = [
        [23.5, 5, 0.5, 0],
        //[23.5, 5, 0.5, 120],
        //[23.5, 5, 0.5, 240],
    ];

    // Calculate radii
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;

    // Create outer cylinder
    const outerCylinder = drawCircle(outerRadius).sketchOnPlane().extrude(height);

    // Create inner cylinder (hole)
    const innerCylinder = drawCircle(innerRadius).sketchOnPlane().extrude(height);


    // Subtract inner from outer to create ring
    let result = outerCylinder.cut(innerCylinder);

    // Add lip if enabled
    if (hasLip) {
        const lipOuterRadius = innerRadius;
        const lipInnerRadius = lipInnerDiameter / 2;
        // The lip sits at the bottom (z = 0)
        const lipOuter = drawCircle(lipOuterRadius).sketchOnPlane().extrude(lipHeight);
        const lipInner = drawCircle(lipInnerRadius).sketchOnPlane().extrude(lipHeight);
        const lip = lipOuter.cut(lipInner);
        // Fuse the lip with the main ring
        result = result.fuse(lip);
    }

    // Add notches if any
    if (notches && notches.length > 0) {
        for (const [notchWidth, notchDepth, notchFillet, angleDeg] of notches) {
            // Notch extends from center of circle (Y=0) to beyond outer edge
            const notchStartY = 0;
            const notchEndY = outerRadius + 1;
            const notchLength = notchEndY - notchStartY;

            // Use height * 2 for the cutout rectangle so large fillets don't curve back
            const cutoutHeight = height * 2;

            // Draw rounded rectangle profile on XZ plane, positioned above ring top
            let notchCutout = drawRoundedRectangle(notchWidth, cutoutHeight, notchFillet)
                .sketchOnPlane("XZ", notchStartY)
                .extrude(notchLength)
                .translate([0, 0, height - notchDepth + cutoutHeight / 2]);

            // Rotate notchCutout around Z axis to desired angle
            if (angleDeg && angleDeg !== 0) {
                notchCutout = notchCutout.rotate([0,0,1], angleDeg);
            }

            result = result.cut(notchCutout);
        }
    }

    return result;
}

