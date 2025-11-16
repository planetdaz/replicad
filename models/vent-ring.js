// Vent Ring Model
// Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)

export default async function build(replicad) {
    const { drawCircle } = replicad;

    // Vent ring dimensions
    const outerDiameter = 48.2;
    const innerDiameter = 46.4;
    const height = 5;

    // Calculate radii
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;

    // Create outer cylinder
    const outerCylinder = drawCircle(outerRadius).sketchOnPlane().extrude(height);

    // Create inner cylinder (hole)
    const innerCylinder = drawCircle(innerRadius).sketchOnPlane().extrude(height);

    // Subtract inner from outer to create ring
    const result = outerCylinder.cut(innerCylinder);

    return result;
}

