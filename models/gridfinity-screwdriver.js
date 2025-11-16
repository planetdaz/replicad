// Gridfinity Screwdriver Holder
// Gridfinity box with customizable bars and cylinder cutouts for holding screwdrivers

export default async function build(replicad) {
    const { draw, drawRoundedRectangle, drawCircle, makeSolid, assembleWire, makeFace, EdgeFinder } = replicad;

    // Configurable parameters
    const xSize = 2;        // Number of gridfinity units in X direction (1 unit = 42mm)
    const ySize = 4;        // Number of gridfinity units in Y direction (1 unit = 42mm)
    const height = 6;       // Height in gridfinity units (1 unit = 7mm)
    const wallThickness = 1.2;
    const withMagnet = false;
    const withScrew = false;
    const magnetRadius = 3.25;
    const magnetHeight = 2;
    const screwRadius = 1.5;

    // Bar configuration - up to 3 rows
    const bars = [
        {
            enabled: true,
            yOffset: 35,         // Distance from bottom wall (mm)
            width: 5,          // Width in Y direction (mm)
            height: 10,         // Height in Z direction (mm)
            cutoutDiameter: 14, // Diameter of cylinder cutouts (mm)
            cutoutQty: 4,       // Number of cylinder cutouts
            cutoutSpacing: 2    // Spacing between cutouts (mm)
        },
        {
            enabled: false,
            yOffset: 25,
            width: 10,
            height: 15,
            cutoutDiameter: 10,
            cutoutQty: 3,
            cutoutSpacing: 2
        },
        {
            enabled: false,
            yOffset: 40,
            width: 8,
            height: 12,
            cutoutDiameter: 8,
            cutoutQty: 5,
            cutoutSpacing: 1.5
        }
    ];

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

    // Build bar with cylinder cutouts
    const buildBar = (barConfig) => {
        if (!barConfig.enabled) return null;

        // Calculate interior dimensions
        const interiorWidth = xSize * SIZE - CLEARANCE - (2 * wallThickness);
        const interiorDepth = ySize * SIZE - CLEARANCE - (2 * wallThickness);

        // Calculate total width needed for cutouts
        const totalCutoutWidth = (barConfig.cutoutQty * barConfig.cutoutDiameter) +
            ((barConfig.cutoutQty - 1) * barConfig.cutoutSpacing);
        const sideMargin = (interiorWidth - totalCutoutWidth) / 2;

        // Create the base bar that spans the full width
        const barXSize = interiorWidth;
        const barYSize = barConfig.width;
        const barZSize = barConfig.height;

        // Position: centered in X, offset from bottom wall in Y
        const barXPos = 0;
        const barYPos = -(interiorDepth / 2) + barConfig.yOffset + (barYSize / 2);
        const barZPos = barZSize / 2;

        let bar = drawRoundedRectangle(barXSize, barYSize, 0.5)
            .sketchOnPlane()
            .extrude(barZSize)
            .translate([barXPos, barYPos, barZPos]);

        // Create cylinder cutouts
        const cutoutRadius = barConfig.cutoutDiameter / 2;

        for (let i = 0; i < barConfig.cutoutQty; i++) {
            const cutoutXPos = -(interiorWidth / 2) + sideMargin + cutoutRadius +
                (i * (barConfig.cutoutDiameter + barConfig.cutoutSpacing));

            // Create a half-cylinder oriented in Y direction
            const cylinder = drawCircle(cutoutRadius)
                .sketchOnPlane("XZ", [cutoutXPos, 0, barZPos])
                .extrude(barYSize);

            bar = bar.cut(cylinder.translate([0, barYPos - (barYSize / 2), 0]));
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

    // Add bars to the box
    bars.forEach((barConfig) => {
        const bar = buildBar(barConfig);
        if (bar) {
            box = box.fuse(bar);
        }
    });

    return base
        .fuse(box, { optimisation: "commonFace" })
        .fuse(top, { optimisation: "commonFace" });
}


