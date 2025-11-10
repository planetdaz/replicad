// For replicad studio: main function receives the replicad library
const main = (replicad: any) => {
    const { draw } = replicad;

    // Custom hexagon with specific dimensions
    // Two opposite sides: 120mm each
    // Four other sides: 42.43mm each
    // All angles: 120° (equal angles)

    const longSide = 120;
    const shortSide = 42.43;

    // Calculate hexagon points with equal 120° angles
    // Starting from bottom center, going clockwise
    const points = [
        [0, 0], // Start point (bottom center of long side)
        [longSide, 0], // End of first long side (bottom)
        [longSide + shortSide * Math.cos(Math.PI / 3), shortSide * Math.sin(Math.PI / 3)], // First short side
        [longSide + shortSide * Math.cos(Math.PI / 3) - longSide * Math.cos(Math.PI / 3), shortSide * Math.sin(Math.PI / 3) + longSide * Math.sin(Math.PI / 3)], // Second short side
        [-longSide * Math.cos(Math.PI / 3), longSide * Math.sin(Math.PI / 3)], // Top long side start
        [-shortSide * Math.cos(Math.PI / 3), shortSide * Math.sin(Math.PI / 3)], // Third short side
    ];

    // Create the hexagon using drawing pen
    let hexagon = draw([points[0][0], points[0][1]]);

    for (let i = 1; i < points.length; i++) {
        hexagon = hexagon.lineTo([points[i][0], points[i][1]]);
    }

    // Close the shape and extrude to 2mm
    const result = hexagon.close().extrude(2);

    return result;
};