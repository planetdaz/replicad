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

    // Calculate dimensions
    const adjustedPinSize = pinSize + tolerance;

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
    const result = outerBox.cut(innerCavity);

    return result;
}

