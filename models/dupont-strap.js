// DuPont Strap Model
// Rectangular strap for holding singular DuPont connectors

export default async function build(replicad) {
    const { drawRectangle, drawCircle } = replicad;

    // Parameters
    const pinCount = 7;           // Number of pins
    const pinSize = 2.6;          // Size of each pin housing (mm) - this determines spacing
    const toleranceLength = 0;  // Additional tolerance for cavity length (mm) - total, not per pin
    const toleranceWidth = 0.1;   // Additional tolerance for cavity width (mm)
    const thickness = 0.8;        // Wall thickness (mm)
    const height = 9;             // Height of the strap (mm)

    // Notch parameters (for orientation marking)
    const hasNotch = true;        // Enable/disable orientation notch
    const notchWidth = 2;         // Width of the notch (mm) - along X axis
    const notchLength = 1;        // Length of the notch (mm) - extends outward on Y axis

    // Plug parameters (fill specific pins with solid blocks)
    const isPlugged = [false, false, true, false, true, false, true];  // Array indicating which pins to fill
    const pinHoleDiameter = 1.5;  // Diameter of hole for male header pins (mm)

    // Calculate dimensions
    // Pin spacing is exact - no tolerance accumulation
    const pinSpacing = pinSize;  // Spacing between pin centers

    // Base cavity dimensions (before tolerance)
    const baseCavityLength = pinCount * pinSpacing;  // Y axis
    const cavityWidth = pinSpacing + toleranceWidth;  // X axis

    // Outside dimensions - use base cavity length
    const length = baseCavityLength + (thickness * 2);  // Y axis
    const width = cavityWidth + (thickness * 2);        // X axis

    // Create outer rectangle
    const outerBox = drawRectangle(width, length)
        .sketchOnPlane()
        .extrude(height);

    // We'll build the cavity segments based on plug positions
    // Start with the full outer box
    let result = outerBox;

    // Create cavity segments and plugs
    // We need to identify continuous cavity segments (non-plugged pins)
    // and apply tolerance to each segment

    for (let i = 0; i < pinCount; i++) {
        const pinYOffset = (i - (pinCount - 1) / 2) * pinSpacing;
        const isCurrentPlugged = isPlugged[i] && i < isPlugged.length;

        if (isCurrentPlugged) {
            // Create a plug for this pin
            // Determine if we need to shrink the plug on each side for tolerance
            const isPrevPlugged = i > 0 && isPlugged[i - 1];
            const isNextPlugged = i < pinCount - 1 && isPlugged[i + 1];

            // Calculate plug length adjustments
            let plugLengthAdjustment = 0;
            if (!isPrevPlugged) plugLengthAdjustment += toleranceLength / 2;  // Shrink from start
            if (!isNextPlugged) plugLengthAdjustment += toleranceLength / 2;  // Shrink from end

            const plugLength = pinSpacing - plugLengthAdjustment;

            // Create a solid block for the plug
            const plug = drawRectangle(pinSize, plugLength)
                .sketchOnPlane()
                .extrude(height)
                .translate([0, pinYOffset, 0]);

            // Fuse the plug with the main strap
            result = result.fuse(plug);

            // Create a hole through the plug for male header pins
            // Cut it from the result after fusing to ensure the hole persists
            const pinHole = drawCircle(pinHoleDiameter / 2)
                .sketchOnPlane()
                .extrude(height)
                .translate([0, pinYOffset, 0]);

            // Cut the hole from the result
            result = result.cut(pinHole);
        } else {
            // Create a cavity for this pin
            // The cavity gets the full pin spacing plus tolerance
            const cavity = drawRectangle(cavityWidth, pinSpacing + toleranceLength)
                .sketchOnPlane()
                .extrude(height)
                .translate([0, pinYOffset, 0]);

            // Cut the cavity from the result
            result = result.cut(cavity);
        }
    }

    // Add orientation notch if enabled
    if (hasNotch) {
        // Create a small rectangular nub on one of the longer sides
        // Position it at the center of one end (positive Y side)
        const notch = drawRectangle(notchWidth, height)
            .sketchOnPlane("XZ", length / 2)  // Sketch on XZ plane at Y position
            .extrude(notchLength)             // Extrude outward in +Y direction
            .translate([0, 0, height / 2]);   // Center on Z axis

        // Fuse the notch with the main strap
        result = result.fuse(notch);
    }

    return result;
}

