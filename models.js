// Registry of available models
// Add new models here as you create them

export const models = [
    {
        id: 'vent-ring',
        name: 'Vent Ring',
        description: 'Ring/cylinder (48.2mm outer, 46.4mm inner, 5mm height)',
        buildFunction: async (replicad) => {
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
    },
    {
        id: 'hexagon',
        name: 'Custom Hexagon',
        description: 'Hexagon (120mm x 60mm with triangular extensions)',
        buildFunction: async (replicad) => {
            const { draw } = replicad;
            
            // Custom hexagon: 120x60 rectangle with triangular extensions
            const points = [
                [-60, 0],           // Bottom left of rectangle
                [60, 0],            // Bottom right of rectangle
                [90, 30],           // Right triangle peak
                [60, 60],           // Top right of rectangle
                [-60, 60],          // Top left of rectangle
                [-90, 30]           // Left triangle peak
            ];
            
            // Create the hexagon using drawing pen
            let hexagon = draw(points[0]);
            
            for (let i = 1; i < points.length; i++) {
                hexagon = hexagon.lineTo(points[i]);
            }
            
            // Close the shape, convert to face, and extrude
            const result = hexagon.close().sketchOnPlane().extrude(1);
            
            return result;
        }
    }
];

