// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)

export default async function build(replicad) {
    const { drawCircle, drawRoundedRectangle } = replicad;

    // Vent ring dimensions
    const outerDiameter = 41;
    const innerDiameter = 36;
    const height = 5;

    // Notch parameters
    const hasNotch = true;      // if true, cut out a notch on top of the ring
    const notchWidth = 18;       // width of notch in mm (straight line, not circumferential)
    const notchDepth = 3;        // depth of the notch from the top of the ring

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
        // Calculate the notch geometry
        // The notch width is a chord across the circle
        // We need the notch to extend from innerRadius to outerRadius with parallel sides
        const notchLength = outerRadius - innerRadius + 140; // Addextra to ensure clean cut
        const notchStartY = innerRadius - 61.5; // Start slightly inside inner radius

        // Create a rectangular cutout for the notch
        // Position it at the top of the ring (centered on Y axis, extending outward in +Y direction)
        const notchCutout = drawRoundedRectangle(notchWidth, notchLength, 0)
            .sketchOnPlane("XY", height - notchDepth)
            .extrude(notchDepth + 1); // Extra height to ensure clean cut through top

        // Move the notch to the correct position (at the outer edge of the ring)
        const notchPositioned = notchCutout.translate([0, notchStartY + notchLength / 2, 0]);

        result = result.cut(notchPositioned);
    }

    return result;
}

