export function creatorText(textInfo: any) {
    
    const baseInfo = {
        text: "", 
        fontColor: "#FFFFFF", 
        fontSize: 16, 
        fontWeight: "normal", 
        fontRatio: 300, 
        backgroundColor: "", 
        lineHeight: 16, 
        lineSpace: 2, 
        autoCRLF: false 
    }
    
    Object.assign(baseInfo, textInfo);
    baseInfo.lineHeight = baseInfo.fontSize + 6;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
    let textWidth = 0;
    let textHeight = 0;
    
    const texts = baseInfo.text.split("<LF>");
    if (baseInfo.autoCRLF && texts.length > 1) {
        let maxWidth = 0;
        let totalHeight = (baseInfo.lineHeight * texts.length) + (baseInfo.lineSpace * (texts.length - 1));
        for (let index = 0; index < texts.length; index++) {
            const metrics = context.measureText(texts[index]);
            if (maxWidth < metrics.width) {
                maxWidth = metrics.width;
            }
        }
        textWidth = maxWidth;
        textHeight = totalHeight;
        const scaleFactor = 2;
        canvas.width = maxWidth * scaleFactor; // Double resolution for crisp rendering
        canvas.height = totalHeight * scaleFactor; // Double resolution for crisp rendering
        context.scale(scaleFactor, scaleFactor); // Scale context to match the increased resolution

        context.font = `${baseInfo.fontWeight} ${baseInfo.fontSize}px Gulim`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.imageSmoothingEnabled = true; // Enable image smoothing for better text clarity
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (baseInfo.backgroundColor) {
            context.fillStyle = baseInfo.backgroundColor;
            context.fillRect(0, 0, canvas.width / scaleFactor, canvas.height / scaleFactor); // Adjust for scale
        }

        context.fillStyle = baseInfo.fontColor;

        for (let index = 0; index < texts.length; index++) {
            context.fillText(
                texts[index],
                maxWidth / 2,
                baseInfo.lineHeight / 2 + (baseInfo.lineHeight + baseInfo.lineSpace) * index
            );
        }
    } else {
        const metrics = context.measureText(baseInfo.text);
        textWidth = metrics.width;
        textHeight = baseInfo.lineHeight;
        
        canvas.width = textWidth;
        canvas.height = textHeight;
        context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (baseInfo.backgroundColor != "") {
            context.fillStyle = baseInfo.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.fillStyle = baseInfo.fontColor;
        
        context.fillText(baseInfo.text, textWidth / 2, textHeight / 2);
    }
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    canvas.remove();
    
    let MeshBasicMaterial = null;
    if (baseInfo.backgroundColor != "") {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    } else {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0xFFFFFF, transparent: true, side: THREE.DoubleSide })
    }
    return new THREE.Mesh(new THREE.PlaneGeometry(textWidth / baseInfo.fontRatio, textHeight / baseInfo.fontRatio), MeshBasicMaterial);
}


export function creatorRoundedRectangleBorder(roundedRectangleBorderInfo: any) {
    
    const baseInfo = {
        width: 1, 
        height: 0.2, 
        boardColor: 0xFFFFFF, 
        transparent: false, 
        opacity: 0.8, 
        thickness: 0.01, 
        lefttopradius: 0.1, 
        toprightradius: 0.1, 
        rightbottomradius: 0.1, 
        bottomleftradius: 0.1 
    }
    
    Object.assign(baseInfo, roundedRectangleBorderInfo);
    
    const halfWidth = baseInfo.width * 0.5;
    const halfHeight = baseInfo.height * 0.5;
    
    const pathBorder = new THREE.Shape();
    pathBorder.moveTo(-(halfWidth - baseInfo.lefttopradius), (halfHeight + baseInfo.thickness)); // top start
    pathBorder.lineTo((halfWidth - baseInfo.toprightradius), (halfHeight + baseInfo.thickness)); // top line
    pathBorder.quadraticCurveTo((halfWidth + baseInfo.thickness), (halfHeight + baseInfo.thickness), (halfWidth + baseInfo.thickness), (halfHeight - baseInfo.toprightradius)); // top right curve
    pathBorder.lineTo((halfWidth + baseInfo.thickness), -(halfHeight - baseInfo.rightbottomradius)); // right line
    pathBorder.quadraticCurveTo((halfWidth + baseInfo.thickness), -(halfHeight + baseInfo.thickness), (halfWidth - baseInfo.rightbottomradius), -(halfHeight + baseInfo.thickness)); // right bottom curve
    pathBorder.lineTo(-(halfWidth - baseInfo.bottomleftradius), -(halfHeight + baseInfo.thickness)); // bottom line
    pathBorder.quadraticCurveTo(-(halfWidth + baseInfo.thickness), -(halfHeight + baseInfo.thickness), -(halfWidth + baseInfo.thickness), -(halfHeight - baseInfo.bottomleftradius)); // bottom left curve
    pathBorder.lineTo(-(halfWidth + baseInfo.thickness), (halfHeight - baseInfo.lefttopradius)); // left line
    pathBorder.quadraticCurveTo(-(halfWidth + baseInfo.thickness), (halfHeight + baseInfo.thickness), -(halfWidth - baseInfo.lefttopradius), (halfHeight + baseInfo.thickness)); // left top curve
    pathBorder.lineTo(-(halfWidth - baseInfo.lefttopradius), halfHeight); // top end - top start
    pathBorder.moveTo(-(halfWidth - baseInfo.lefttopradius), halfHeight);
    pathBorder.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, (halfHeight - baseInfo.lefttopradius)); // top left curve
    pathBorder.lineTo(-halfWidth, -(halfHeight - baseInfo.bottomleftradius)); // left line
    pathBorder.quadraticCurveTo(-halfWidth, -halfHeight, -(halfWidth - baseInfo.bottomleftradius), -halfHeight); // left bottom curve
    pathBorder.lineTo((halfWidth - baseInfo.rightbottomradius), -halfHeight); // bottom line
    pathBorder.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -(halfHeight - baseInfo.rightbottomradius)); // bottom right curve
    pathBorder.lineTo(halfWidth, (halfHeight - baseInfo.toprightradius)); // right line
    pathBorder.quadraticCurveTo(halfWidth, halfHeight, (halfWidth - baseInfo.toprightradius), halfHeight); // right top curve
    pathBorder.lineTo(-(halfWidth - baseInfo.lefttopradius), halfHeight); // top line - top end
    return new THREE.Mesh(new THREE.ShapeGeometry(pathBorder), new THREE.MeshBasicMaterial({ color: baseInfo.boardColor, transparent: baseInfo.transparent, opacity: baseInfo.opacity, side: THREE.DoubleSide }));
}


export function creatorRoundedRectangle(roundedRectangleInfo: any) {
    
    const baseInfo = {
        width: 0.5, 
        minWidth: 0, 
        autoWidth: true,
        padding: 0.1,
        height: 0.2, 
        minHeight: 0, 
        autoHeight: false, 
        text: "", 
        fontColor: "#FFFFFF", 
        fontSize: 16, 
        fontWeight: "normal", 
        backgroundColor: 0x000000, 
        transparent: false, 
        opacity: 0.5, 
        thickness: 0.01, 
        boardColor: 0xFFFFFF, 
        boardTransparent: false, 
        boardOpacity: 0.5, 
        lefttopradius: 0.1, 
        toprightradius: 0.1, 
        rightbottomradius: 0.1, 
        bottomleftradius: 0.1 
    }
    
    Object.assign(baseInfo, roundedRectangleInfo);

    
    const textInfo = {
        text: baseInfo.text,
        fontColor: baseInfo.fontColor,
        fontSize: baseInfo.fontSize,
        fontWeight: baseInfo.fontWeight,
        autoCRLF: baseInfo
    }
    const label = creatorText(textInfo);
    
    label.geometry.computeBoundingBox();
    const labelBoundingBox = label.geometry.boundingBox!;
    const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
    const labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;

    
    let baseTop = baseInfo.lefttopradius;
    if (baseInfo.lefttopradius < baseInfo.toprightradius) {
        baseTop = baseInfo.toprightradius;
    }
    let baseBottom = baseInfo.bottomleftradius;
    if (baseInfo.bottomleftradius < baseInfo.rightbottomradius) {
        baseBottom = baseInfo.rightbottomradius;
    }
    const baseWidth = baseTop + baseBottom;
    const baseHeight = baseTop + baseBottom;
    
    if (baseInfo.width < baseWidth) {
        baseInfo.width = baseWidth;
    }
    if (baseInfo.minWidth > 0 && baseInfo.width < baseInfo.minWidth) {
        baseInfo.width = baseInfo.minWidth;
    }
    if (baseInfo.autoWidth && (baseInfo.width < (labelWidth + (baseInfo.padding * 2)))) {
        baseInfo.width = labelWidth + (baseInfo.padding * 2);
    }
    
    if (baseInfo.height < baseHeight) {
        baseInfo.height = baseHeight;
    }
    if (baseInfo.minHeight > 0 && baseInfo.height < baseInfo.minHeight) {
        baseInfo.height = baseInfo.minHeight;
    }
    if (baseInfo.autoHeight && (baseInfo.height < (labelHeight + baseHeight))) {
        baseInfo.height = labelHeight + baseHeight;
    }

    const roundedRectangle = new THREE.Group();
    
    const halfWidth = baseInfo.width * 0.5;
    const halfHeight = baseInfo.height * 0.5;
    
    const shape = new THREE.Shape();
    shape.moveTo(-(halfWidth - baseInfo.lefttopradius), halfHeight); // top start
    shape.lineTo((halfWidth - baseInfo.toprightradius), halfHeight); // top line
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth, (halfHeight - baseInfo.toprightradius)); // top right curve
    shape.lineTo(halfWidth, -(halfHeight - baseInfo.rightbottomradius)); // right line
    shape.quadraticCurveTo(halfWidth, -halfHeight, (halfWidth - baseInfo.rightbottomradius), -halfHeight); // right bottom curve
    shape.lineTo(-(halfWidth - baseInfo.bottomleftradius), -halfHeight); // bottom line
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth, -(halfHeight - baseInfo.bottomleftradius)); // bottom left curve
    shape.lineTo(-halfWidth, (halfHeight - baseInfo.lefttopradius)); // left line
    shape.quadraticCurveTo(-halfWidth, halfHeight, -(halfWidth - baseInfo.lefttopradius), halfHeight); // left top curve
    roundedRectangle.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: baseInfo.backgroundColor, transparent: baseInfo.transparent, opacity: baseInfo.opacity, side: THREE.DoubleSide })));
    
    roundedRectangle.add(label);
    label.position.set(0, 0, 0.004);

    let roundedRectangleBorderInfo = {
        width: baseInfo.width,
        height: baseInfo.height,
        boardColor: baseInfo.boardColor,
        transparent: baseInfo.boardTransparent,
        opacity: baseInfo.boardOpacity,
        thickness: baseInfo.thickness,
        lefttopradius: baseInfo.lefttopradius,
        toprightradius: baseInfo.toprightradius,
        rightbottomradius: baseInfo.rightbottomradius,
        bottomleftradius: baseInfo.bottomleftradius
    }
    roundedRectangle.add(creatorRoundedRectangleBorder(roundedRectangleBorderInfo));

    return [roundedRectangle, roundedRectangleBorderInfo];
}