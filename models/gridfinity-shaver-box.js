// Gridfinity Shaver Box
// Gridfinity box with side wall cutouts for easy shaver access

export default async function build(replicad) {
    const { draw, drawRoundedRectangle, drawCircle, makeSolid, assembleWire, makeFace, EdgeFinder } = replicad;

    // Configurable parameters
    const xSize = 2;        // Number of gridfinity units in X direction (1 unit = 42mm)
    const ySize = 3;        // Number of gridfinity units in Y direction (1 unit = 42mm)
    const height = 6;       // Height in gridfinity units (1 unit = 7mm) = 42mm total
    const wallThickness = 1.2;
    const withMagnet = false;
    const withScrew = false;
    const magnetRadius = 3.25;
    const magnetHeight = 2;
    const screwRadius = 1.5;

    // Wall cutout configuration
    const cutoutDepth = 30;      // Depth from top edge down (mm)
    const cutoutWidth = 45;      // Width of the cutout (mm)
    const cutoutFromFront = 5;   // Distance from front wall to start of cutout (mm)
    const cutoutCornerRadius = 3; // Corner radius for the rounded rectangle cutout

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

    // Create and apply wall cutouts to the side walls (left and right)
    // The cutout is a rounded rectangle that passes through both side walls
    const binDepth = ySize * SIZE - CLEARANCE;
    const binWidth = xSize * SIZE;
    const cutoutHeight = cutoutDepth + 1;  // Extra 1mm to ensure it clears the top edge
    const cutoutExtrusionX = binWidth + 4;  // Wider than bin to pass through both walls

    // Create cutout on YZ plane (Y = width along wall, Z = depth from top)
    const wallCutout = drawRoundedRectangle(cutoutWidth, cutoutHeight, cutoutCornerRadius)
        .sketchOnPlane("YZ")
        .extrude(cutoutExtrusionX);  // Extrudes in +X direction

    // Position the cutout:
    // - X: centered so it passes through both left and right walls
    // - Y: starts cutoutFromFront distance from the front wall (-Y side)
    // - Z: at top of bin, extending down
    const cutoutX = -(cutoutExtrusionX / 2);
    const cutoutY = -binDepth / 2 + cutoutFromFront + cutoutWidth / 2;
    const cutoutZ = stdHeight - cutoutHeight / 2 + 0.5;

    const positionedCutout = wallCutout.translate([cutoutX, cutoutY, cutoutZ]);

    // Fuse all parts together first
    let result = base
        .fuse(box, { optimisation: "commonFace" })
        .fuse(top, { optimisation: "commonFace" });

    // Apply wall cutout to the entire fused model (including stacking lips)
    return result.cut(positionedCutout);
}

