// Gridfinity Dual Screwdriver Holder
// Gridfinity box with 2 bars and alternating cutouts for holding screwdrivers facing opposite directions

export default async function build(replicad) {
    const { draw, drawRoundedRectangle, drawCircle, makeSolid, assembleWire, makeFace, EdgeFinder } = replicad;

    // Configurable parameters
    const xSize = 2;        // Number of gridfinity units in X direction (1 unit = 42mm)
    const ySize = 4;        // Number of gridfinity units in Y direction (1 unit = 42mm)
    const height = 3;     // Height in gridfinity units (1 unit = 7mm)
    const wallThickness = 1.2;
    const withMagnet = false;
    const withScrew = false;
    const magnetRadius = 3.25;
    const magnetHeight = 2;
    const screwRadius = 1.5;

    // Bar configuration - both bars use same dimensions
    const barWidth = 15;           // Width in Y direction (mm) - applies to both bars
    const barHeight = 9;          // Height in Z direction (mm) - applies to both bars
    const barYOffset = 28;         // Distance from bottom/top wall (mm)

    // Cutout configuration
    const largeCutoutDiameter = 15;  // Diameter for handle cutouts (mm)
    const smallCutoutDiameter = 7;   // Diameter for shaft cutouts (mm)
    const cutoutQty = 5;             // Total number of cutout positions
    const cutoutCenterSpacing = 15;  // Distance between cylinder centerlines (mm)

    // Gridfinity magic numbers
    const SIZE = 42.0;              // X/Y unit size in mm
    const HEIGHT_UNIT = 7.0;        // Height unit size in mm
    const CLEARANCE = 0.5;
    const AXIS_CLEARANCE = (CLEARANCE * Math.sqrt(2)) / 4;
    const CORNER_RADIUS = 4;
    const TOP_FILLET = 0.6;
    const SOCKET_HEIGHT = 5;
    const SOCKET_SMALL_TAPER = 0.8;
    const SOCKET_BIG_TAPER = 2.4;
    const SOCKET_VERTICAL_PART = SOCKET_HEIGHT - SOCKET_SMALL_TAPER - SOCKET_BIG_TAPER;
    const SOCKET_TAPER_WIDTH = SOCKET_SMALL_TAPER + SOCKET_BIG_TAPER;

    // Socket profile function
    const socketProfile = (_, startPoint) => {
        const full = draw([-CLEARANCE / 2, 0])
            .vLine(-CLEARANCE / 2)
            .lineTo([-SOCKET_BIG_TAPER, -SOCKET_BIG_TAPER])
            .vLine(-SOCKET_VERTICAL_PART)
            .line(-SOCKET_SMALL_TAPER, -SOCKET_SMALL_TAPER)
            .done()
            .translate(CLEARANCE / 2, 0);

        return full.sketchOnPlane("XZ", startPoint);
    };

    // Build socket function
    const buildSocket = () => {
        const baseSocket = drawRoundedRectangle(
            SIZE - CLEARANCE,
            SIZE - CLEARANCE,
            CORNER_RADIUS
        ).sketchOnPlane();

        const slotSide = baseSocket.sweepSketch(socketProfile, {
            withContact: true,
        });

        let slot = makeSolid([
            slotSide,
            makeFace(assembleWire(new EdgeFinder().inPlane("XY", -SOCKET_HEIGHT).find(slotSide))),
            makeFace(assembleWire(new EdgeFinder().inPlane("XY", 0).find(slotSide))),
        ]);

        if (withScrew || withMagnet) {
            const magnetCutout = withMagnet
                ? drawCircle(magnetRadius).sketchOnPlane().extrude(magnetHeight)
                : null;
            const screwCutout = withScrew
                ? drawCircle(screwRadius).sketchOnPlane().extrude(SOCKET_HEIGHT)
                : null;
            const cutout = magnetCutout && screwCutout
                ? magnetCutout.fuse(screwCutout)
                : magnetCutout || screwCutout;

            slot = slot
                .cut(cutout.clone().translate([-13, -13, -5]))
                .cut(cutout.clone().translate([-13, 13, -5]))
                .cut(cutout.clone().translate([13, 13, -5]))
                .cut(cutout.clone().translate([13, -13, -5]));
        }

        return slot;
    };

    // Helper to create grid of shapes
    const range = (i) => [...Array(i).keys()];
    const cloneOnGrid = (shape, { xSteps = 1, ySteps = 1, span = 10 }) => {
        const xCorr = ((xSteps - 1) * span) / 2;
        const yCorr = ((ySteps - 1) * span) / 2;
        const translations = range(xSteps).flatMap((i) => {
            return range(ySteps).map((j) => [i * SIZE - xCorr, j * SIZE - yCorr, 0]);
        });
        return translations.map((translation) => shape.clone().translate(translation));
    };

    // Build top shape function
    const buildTopShape = () => {
        const topShape = (basePlane) => {
            const sketcher = draw([-SOCKET_TAPER_WIDTH, 0])
                .line(SOCKET_SMALL_TAPER, SOCKET_SMALL_TAPER)
                .vLine(SOCKET_VERTICAL_PART)
                .line(SOCKET_BIG_TAPER, SOCKET_BIG_TAPER)
                .vLineTo(-(SOCKET_TAPER_WIDTH + wallThickness))
                .lineTo([-SOCKET_TAPER_WIDTH, -wallThickness]);

            const basicShape = sketcher.close();
            const shiftedShape = basicShape
                .translate(AXIS_CLEARANCE, -AXIS_CLEARANCE)
                .intersect(drawRoundedRectangle(10, 10).translate(-5, 0));

            let topProfile = shiftedShape
                .translate(CLEARANCE / 2, 0)
                .intersect(drawRoundedRectangle(10, 10).translate(-5, 0))
                .cut(drawRoundedRectangle(1.2, 10).translate(-0.6, -5));

            return topProfile.sketchOnPlane(basePlane);
        };

        const boxSketch = drawRoundedRectangle(
            xSize * SIZE - CLEARANCE,
            ySize * SIZE - CLEARANCE,
            CORNER_RADIUS
        ).sketchOnPlane();

        return boxSketch
            .sweepSketch(topShape, { withContact: true })
            .fillet(TOP_FILLET, (e) =>
                e.inBox(
                    [-xSize * SIZE, -ySize * SIZE, SOCKET_HEIGHT],
                    [xSize * SIZE, ySize * SIZE, SOCKET_HEIGHT - 1]
                )
            );
    };

    // Build bar with alternating cylinder cutouts
    // isBottomBar: true for bottom bar (starts with large), false for top bar (starts with small)
    const buildBar = (isBottomBar) => {
        // Calculate interior dimensions
        const interiorWidth = xSize * SIZE - CLEARANCE - (2 * wallThickness);
        const interiorDepth = ySize * SIZE - CLEARANCE - (2 * wallThickness);

        // Calculate centerline-based positioning for cylinders
        // All cylinders are positioned by their centerlines so they align across bars
        const totalCenterlineSpan = (cutoutQty - 1) * cutoutCenterSpacing;
        const firstCylinderCenterX = -(totalCenterlineSpan / 2);

        // Create the base bar that spans the full width
        const barXSize = interiorWidth;
        const barYSize = barWidth;
        const barZSize = barHeight;

        // Position: centered in X, offset from bottom or top wall in Y, sitting on floor (Z=0)
        const barXPos = 0;
        let barYPos;
        if (isBottomBar) {
            // Bottom bar: offset from bottom wall
            barYPos = -(interiorDepth / 2) + barYOffset + (barYSize / 2);
        } else {
            // Top bar: offset from top wall (mirror of bottom)
            barYPos = (interiorDepth / 2) - barYOffset - (barYSize / 2);
        }
        const barZPos = 0;  // Start at floor level

        let bar = drawRoundedRectangle(barXSize, barYSize, 0.5)
            .sketchOnPlane()
            .extrude(barZSize)
            .translate([barXPos, barYPos, barZPos]);

        // Create alternating cylinder cutouts positioned by centerline
        for (let i = 0; i < cutoutQty; i++) {
            // Determine which diameter to use based on position and which bar
            // Bottom bar: even indices (0,2,4...) = large, odd indices (1,3,5...) = small
            // Top bar: even indices = small, odd indices = large (opposite pattern)
            let cutoutDiameter;
            if (isBottomBar) {
                cutoutDiameter = (i % 2 === 0) ? largeCutoutDiameter : smallCutoutDiameter;
            } else {
                cutoutDiameter = (i % 2 === 0) ? smallCutoutDiameter : largeCutoutDiameter;
            }
            const cutoutRadius = cutoutDiameter / 2;

            // Position based on centerline spacing (same for both bars = aligned centerlines)
            const cutoutCenterX = firstCylinderCenterX + (i * cutoutCenterSpacing);

            // Create a cylinder lying horizontally along Y axis
            const cylinderLength = barYSize * 2; // 2x bar width so it fully passes through
            const cylinder = drawCircle(cutoutRadius)
                .sketchOnPlane("XZ")
                .extrude(cylinderLength);

            // Position the cylinder so its CENTER in Y matches the bar center (barYPos)
            const cylinderX = barXPos + cutoutCenterX;
            const cylinderY = barYPos + cylinderLength / 2;
            const cylinderZ = barZPos + barZSize;  // At the top of the bar

            bar = bar.cut(cylinder.translate([cylinderX, cylinderY, cylinderZ]));
        }

        return bar;
    };

    // Main build logic
    const stdHeight = height * HEIGHT_UNIT;
    let box = drawRoundedRectangle(
        xSize * SIZE - CLEARANCE,
        ySize * SIZE - CLEARANCE,
        CORNER_RADIUS
    )
        .sketchOnPlane()
        .extrude(stdHeight)
        .shell(wallThickness, (f) => f.inPlane("XY", stdHeight));

    const top = buildTopShape().translateZ(stdHeight);
    const socket = buildSocket();

    let base = null;
    cloneOnGrid(socket, { xSteps: xSize, ySteps: ySize, span: SIZE }).forEach((movedSocket) => {
        if (base) base = base.fuse(movedSocket, { optimisation: "commonFace" });
        else base = movedSocket;
    });

    // Add both bars to the box
    const bottomBar = buildBar(true);   // Bottom bar with large cutouts first
    const topBar = buildBar(false);     // Top bar with small cutouts first
    box = box.fuse(bottomBar).fuse(topBar);

    return base
        .fuse(box, { optimisation: "commonFace" })
        .fuse(top, { optimisation: "commonFace" });
}

