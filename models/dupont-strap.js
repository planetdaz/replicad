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

    // Inside cavity dimensions (for hollowing) - add tolerance to overall size
    const cavityLength = (pinCount * pinSpacing) + toleranceLength;  // Y axis
    const cavityWidth = pinSpacing + toleranceWidth;                 // X axis

    // Outside dimensions
    const length = cavityLength + (thickness * 2);  // Y axis
    const width = cavityWidth + (thickness * 2);    // X axis

    // Create outer rectangle
    const outerBox = drawRectangle(width, length)
        .sketchOnPlane()
        .extrude(height);

    // Create inner cavity (hollow out for pins)
    const innerCavity = drawRectangle(cavityWidth, cavityLength)
        .sketchOnPlane()
        .extrude(height);

    // Subtract inner cavity from outer box
    let result = outerBox.cut(innerCavity);

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

    // Add plug solids for specified pins
    isPlugged.forEach((plugged, index) => {
        if (plugged && index < pinCount) {
            // Calculate position for this pin
            // Pins are centered and arranged along Y axis with exact spacing
            const pinYOffset = (index - (pinCount - 1) / 2) * pinSpacing;

            // Create a solid block the size of the pin
            let plug = drawRectangle(pinSize, pinSize)
                .sketchOnPlane()
                .extrude(height)
                .translate([0, pinYOffset, 0]);

            // Create a hole through the plug for male header pins
            const pinHole = drawCircle(pinHoleDiameter / 2)
                .sketchOnPlane()
                .extrude(height)
                .translate([0, pinYOffset, 0]);

            // Cut the hole from the plug
            plug = plug.cut(pinHole);

            // Fuse the plug with the main strap
            result = result.fuse(plug);
        }
    });

    return result;
}

