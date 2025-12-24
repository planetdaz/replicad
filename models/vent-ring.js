// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)

export default async function build(replicad) {
    const { drawCircle, drawRoundedRectangle } = replicad;

    // Vent ring dimensions
    const outerDiameter = 41;
    const innerDiameter = 36;
    const height = 5;

    // Notch parameters
    const hasNotch = true;       // if true, cut out a notch on top of the ring
    const notchWidth = 3;       // width of notch in mm (straight line, not circumferential)
    const notchDepth = 0.5;        // depth of the notch from the top of the ring
    const notchFillet = 1;       // mm of roundover on top edges of notch (0 = no roundover)

    // Calculate radii
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;

    // Create outer cylinder
    const outerCylinder = drawCircle(outerRadius).sketchOnPlane().extrude(height);

    // Create inner cylinder (hole)
    const innerCylinder = drawCircle(innerRadius).sketchOnPlane().extrude(height);

    // Subtract inner from outer to create ring
    let result = outerCylinder.cut(innerCylinder);

    // Add notch if enabled
    if (hasNotch) {
        // Notch extends from center of circle (Y=0) to beyond outer edge
        const notchStartY = 0;
        const notchEndY = outerRadius + 1;
        const notchLength = notchEndY - notchStartY;

        // Use height * 2 for the cutout rectangle so large fillets don't curve back
        const cutoutHeight = height * 2;

        // Draw rounded rectangle profile on XZ plane, positioned above ring top
        const notchCutout = drawRoundedRectangle(notchWidth, cutoutHeight, notchFillet)
            .sketchOnPlane("XZ", notchStartY)
            .extrude(notchLength)
            .translate([0, 0, height - notchDepth + cutoutHeight / 2]);

        result = result.cut(notchCutout);
    }

    return result;
}

