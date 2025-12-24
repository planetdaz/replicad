// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)



export default async function build(replicad) {
    try {
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
            [23.5, 5, 0.5, 1],
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
            for (const notch of notches) {
                const [notchWidth, notchDepth, notchFillet, angleDeg] = notch;
                // Notch cutout: start well below ring, long enough to always intersect
                const notchMargin = 10;
                const notchStartY = -outerRadius - notchMargin / 2;
                const notchLength = 2 * outerRadius + notchMargin;
                const cutoutHeight = height * 3;
                const maxFillet = Math.max(0, Math.min(notchWidth, cutoutHeight) / 2 - 0.01);
                const safeFillet = Math.min(notchFillet, maxFillet);
                let notchCutout = drawRoundedRectangle(notchWidth, cutoutHeight, safeFillet)
                    .sketchOnPlane("XZ", notchStartY)
                    .extrude(notchLength);

                // Translate so the base of the notch is at the top of the ring
                notchCutout = notchCutout.translate([0, 0, height - notchDepth + cutoutHeight / 2]);

                // Rotate the solid around the Z axis at the origin (center of the ring)
                if (angleDeg && angleDeg !== 0) {
                    const angleRad = angleDeg * Math.PI / 180;
                    notchCutout = notchCutout.rotate(angleRad, [0, 0, 0], [0, 0, 1]);
                }

                result = result.cut(notchCutout);
            }
        }

        return result;
    } catch (err) {
        throw err;
    }
}

