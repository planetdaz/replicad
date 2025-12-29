// Christmas Tree Ornament Ball
// Flat ornament with a circular body and knob for hanging ribbon

export default async function build(replicad) {
    const { drawCircle, drawRoundedRectangle } = replicad;

    // Configurable parameters
    const circleDiameter = 67;      // Diameter of the main ornament circle (mm)
    const thickness = 6;            // Extrusion thickness (mm)
    const knobWidth = 18;           // Width of the hanging knob (mm)
    const knobHeight = 11.5;          // Height of the knob above the circle (mm)
    const roundoverRadius = 2;      // Radius for roundovers on top corners of knob (mm)
    const edgeRoundover = 1;        // Radius for roundover on top/bottom edges of extrusion (mm)
    const holeDiameter = 6;         // Diameter of the ribbon hole (mm)
    const holeFromTop = 6;          // Distance from top of knob to hole center (mm)

    const circleRadius = circleDiameter / 2;
    const holeRadius = holeDiameter / 2;

    // Calculate where the knob meets the circle tangentially
    // For a knob of width W centered at the top of a circle of radius R,
    // the knob extends from x = -W/2 to x = +W/2
    // The circle equation: x² + y² = R²
    // At x = ±W/2, y = sqrt(R² - (W/2)²) = the tangent point Y
    const halfKnobWidth = knobWidth / 2;
    const tangentY = Math.sqrt(circleRadius * circleRadius - halfKnobWidth * halfKnobWidth);

    // The knob rectangle extends from tangentY up to (tangentY + knobHeight)
    const knobTop = tangentY + knobHeight;

    // Create the main circle body
    const circleShape = drawCircle(circleRadius)
        .sketchOnPlane()
        .extrude(thickness);

    // Create the knob with rounded top corners
    // The knob overlaps the circle and extends upward
    // We use a rounded rectangle where only the top corners are rounded
    const knobRectHeight = knobHeight + circleRadius; // Extra height to overlap into circle
    const knob = drawRoundedRectangle(knobWidth, knobRectHeight, roundoverRadius)
        .sketchOnPlane()
        .extrude(thickness)
        .translate([0, knobTop - knobRectHeight / 2, 0]); // Position so top is at knobTop

    // Fuse the circle and knob together
    let ornament = circleShape.fuse(knob);

    // Create the ribbon hole
    // The hole is centered on the knob, at holeFromTop distance from the top
    const holeY = knobTop - holeFromTop;
    const hole = drawCircle(holeRadius)
        .sketchOnPlane()
        .extrude(thickness)
        .translate([0, holeY, 0]);

    // Cut the hole from the ornament
    ornament = ornament.cut(hole);

    // Apply edge roundover to top and bottom faces
    if (edgeRoundover > 0) {
        ornament = ornament
            .fillet(edgeRoundover, (e) => e.inPlane("XY", 0))
            .fillet(edgeRoundover, (e) => e.inPlane("XY", thickness));
    }

    return ornament;
}

