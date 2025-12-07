// Christmas Tree Ornament Ball
// Flat ornament with a circular body and knob for hanging ribbon

export default async function build(replicad) {
    const { draw, drawCircle, drawRoundedRectangle } = replicad;

    // Configurable parameters
    const circleDiameter = 60;      // Diameter of the main ornament circle (mm)
    const thickness = 3;            // Extrusion thickness (mm)
    const knobWidth = 12;           // Width of the hanging knob (mm)
    const knobHeight = 10;          // Height of the knob above the circle (mm)
    const roundoverRadius = 3;      // Radius for roundovers and fillets (mm)
    const holeDiameter = 4;         // Diameter of the ribbon hole (mm)
    const holeFromTop = 5;          // Distance from top of knob to hole center (mm)

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
    // But we need to account for the roundover radius at both the bottom (where it meets circle)
    // and the top of the knob

    // Build the 2D profile using the draw API
    // We'll trace the outline clockwise starting from the right side where knob meets circle
    
    // Key points for the knob with roundovers:
    // The roundover at the bottom of the knob creates a fillet that should be tangent to the circle
    // The roundover at the top creates rounded corners
    
    const knobTop = tangentY + knobHeight;
    const knobInnerTop = knobTop - roundoverRadius; // Where the top roundover arc starts
    
    // Start drawing from the right tangent point on the circle, going clockwise
    // We'll use arcs to create the roundovers
    
    let profile = draw([halfKnobWidth, tangentY]);
    
    // Go up the right side of the knob to where the top roundover starts
    profile = profile.lineTo([halfKnobWidth, knobInnerTop]);
    
    // Top-right roundover (quarter circle, going from right to top)
    profile = profile.tangentArcTo([halfKnobWidth - roundoverRadius, knobTop]);
    
    // Across the top of the knob to the left roundover
    profile = profile.lineTo([-halfKnobWidth + roundoverRadius, knobTop]);
    
    // Top-left roundover (quarter circle, going from top to left)
    profile = profile.tangentArcTo([-halfKnobWidth, knobInnerTop]);
    
    // Down the left side of the knob to the tangent point
    profile = profile.lineTo([-halfKnobWidth, tangentY]);
    
    // Now we need to trace around the circle from the left tangent point back to the right
    // Going counterclockwise around the bottom of the circle
    // The circle arc from left tangent point to right tangent point (going the long way around the bottom)
    
    // Calculate angle for the tangent points
    // At x = halfKnobWidth, the angle from center is: asin(halfKnobWidth / circleRadius)
    const tangentAngle = Math.asin(halfKnobWidth / circleRadius);
    // The arc goes from (180 - tangentAngle) degrees to tangentAngle degrees, going through 270 degrees (bottom)
    
    // Use sagittaArc or threePointsArc to draw the circle portion
    // We'll use tangentArcTo to continue tangent to the knob edge, then arc around
    
    // Draw an arc from left tangent point, around the bottom of the circle, to right tangent point
    // The arc needs to match the circle exactly
    // We can use threePointsArc with a point at the bottom of the circle as the middle point
    profile = profile.threePointsArcTo([0, -circleRadius], [halfKnobWidth, tangentY]);
    
    // Close the shape
    profile = profile.close();

    // Extrude to create the 3D shape
    let ornament = profile.sketchOnPlane().extrude(thickness);

    // Create the ribbon hole
    // The hole is centered on the knob, at holeFromTop distance from the top
    const holeY = knobTop - holeFromTop;
    const hole = drawCircle(holeRadius)
        .sketchOnPlane()
        .extrude(thickness)
        .translate([0, holeY, 0]);

    // Cut the hole from the ornament
    ornament = ornament.cut(hole);

    return ornament;
}

