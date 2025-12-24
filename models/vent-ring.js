// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)

export default async function build(replicad) {
    const { drawCircle, drawRoundedRectangle } = replicad;


    // Vent ring dimensions
    const outerDiameter = 39;   // thick was 51
    const innerDiameter = 37;
    const height = 9;

    // Lip parameters
    const hasLip = false;           // if true, add a lip inside the ring
    const lipInnerDiameter = 35;   // was 33.5 on print #4;   // inner diameter of the lip (mm)
    const lipHeight = 1;         // height of the lip (mm)

    // Notch parameters - array of notch configurations
    // Each notch has: width, depth, fillet, and angle
    const notches = [
        // {
        //     width: 23.5,    // width of notch in mm (straight line, not circumferential)
        //     depth: 5,       // was 3 on print #4; depth of the notch from the top of the ring
        //     fillet: 0.5,    // mm of roundover on top edges of notch (0 = no roundover)
        //     angle: 0      // rotation angle in degrees (0 = extends along -Y axis, positive = counterclockwise when viewed from top)
        // },
        {
            width: 10,    // width of notch in mm (straight line, not circumferential)
            depth: 15,       // was 3 on print #4; depth of the notch from the top of the ring
            fillet: 0.5,    // mm of roundover on top edges of notch (0 = no roundover)
            angle: 180      // rotation angle in degrees (0 = extends along +Y axis, positive = counterclockwise when viewed from top)
        }
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

    // Add notches
    notches.forEach(notch => {
        // Notch extends from center of circle (Y=0) to beyond outer edge
        const notchStartY = 0;
        const notchEndY = outerRadius + 1;
        const notchLength = notchEndY - notchStartY;

        // Use height * 2 for the cutout rectangle so large fillets don't curve back
        const cutoutHeight = height * 2;

        // Draw rounded rectangle profile on XZ plane, positioned above ring top
        let notchCutout = drawRoundedRectangle(notch.width, cutoutHeight, notch.fillet)
            .sketchOnPlane("XZ", notchStartY)
            .extrude(notchLength)
            .translate([0, 0, height - notch.depth + cutoutHeight / 2]);

        // Rotate the notch around the Z-axis (center of ring) if angle is specified
        if (notch.angle !== 0) {
            notchCutout = notchCutout.rotate(notch.angle, [0, 0, 0], [0, 0, 1]);
        }

        result = result.cut(notchCutout);
    });

    return result;
}

