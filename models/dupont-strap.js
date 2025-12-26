// DuPont Strap Model
// Rectangular strap for holding singular DuPont connectors

export default async function build(replicad) {
    const { drawRectangle } = replicad;

    // Parameters
    const pinCount = 7;           // Number of pins
    const pinSize = 2.6;          // Size of each pin (mm)
    const tolerance = 0.1;        // Additional tolerance per pin (mm)
    const thickness = 0.8;        // Wall thickness (mm)
    const height = 9;             // Height of the strap (mm)

    // Notch parameters (for orientation marking)
    const hasNotch = true;        // Enable/disable orientation notch
    const notchWidth = 2;         // Width of the notch (mm) - along X axis
    const notchLength = 1;        // Length of the notch (mm) - extends outward on Y axis

    // Calculate dimensions
    const adjustedPinSize = pinSize + tolerance;

    // Calculate outside dimensions 
    // Outside dimensions
    const length = (pinCount * adjustedPinSize) + (thickness * 2);  // Y axis
    const width = adjustedPinSize + (thickness * 2);                 // X axis

    // Inside cavity dimensions (for hollowing)
    const cavityLength = pinCount * adjustedPinSize;  // Y axis
    const cavityWidth = adjustedPinSize;              // X axis

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

    return result;
}

