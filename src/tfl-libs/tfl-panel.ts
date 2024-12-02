// 텍스트 생성
export function creatorText(textInfo : any) {
    // 기본 정보
    const baseInfo = {
        text : "", // 텍스트
        fontColor : "#FFFFFF", // 텍스트 색상
        fontSize : 16, // 텍스트 크기
        fontWeight : "normal", // 텍스트 굵기 (normal, bolder)
        fontRatio : 300, // 텍스트 비율
        backgroundColor : "", // 배경 색상
        lineHeight : 16, // 라인 높이
        lineSpace : 2, // 라인과 라인 사이 공간 높이
        autoCRLF : false // 텍스트 다음 라인 처리 여부
    }
    // assign
    Object.assign(baseInfo, textInfo);
    baseInfo.lineHeight = baseInfo.fontSize + 6;
    // canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    // 텍스트 크기
    context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
    let textWidth = 0;
    let textHeight = 0;
    // 줄바꿈 문자열 - Line-Feed
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
        // 텍스트
        canvas.width = maxWidth;
        canvas.height = totalHeight;
        context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (baseInfo.backgroundColor != "") {
            context.fillStyle = baseInfo.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.fillStyle = baseInfo.fontColor;
        // 텍스트 가운데 정렬
        for (let index = 0; index < texts.length; index++) {
            context.fillText(texts[index], (maxWidth / 2), (baseInfo.lineHeight / 2) + ((baseInfo.lineHeight + baseInfo.lineSpace) * index)); // lineHeight
        }
    } else {
        const metrics = context.measureText(baseInfo.text);
        textWidth = metrics.width;
        textHeight = baseInfo.lineHeight;
        // 텍스트
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
        // 텍스트 가운데 정렬
        context.fillText(baseInfo.text, textWidth / 2, textHeight / 2);
    }
    // 텍스트 텍스처
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    // canvas 제거
    canvas.remove();
    //
    let MeshBasicMaterial = null;
    if (baseInfo.backgroundColor != "") {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide})
    } else {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xFFFFFF, transparent: true, side: THREE.DoubleSide})
    }
    return new THREE.Mesh(new THREE.PlaneGeometry(textWidth / baseInfo.fontRatio, textHeight / baseInfo.fontRatio), MeshBasicMaterial);
}

// 모서리가 둥근 직사각형 보더 테두리 생성
export function creatorRoundedRectangleBorder(roundedRectangleBorderInfo : any) {
    // 기본 정보
    const baseInfo = {
        width : 1, // 가로 크기
        height : 0.2, // 세로 크기
        boardColor : 0xFFFFFF, // 테두리 색상
        transparent : false, // 투명 여부
        opacity : 0.8, // 불투명도 (0 ~ 1)
        thickness : 0.01, // 테두리 두께
        lefttopradius : 0.1, // 왼쪽-위쪽 모서리 반지름
        toprightradius : 0.1, // 위쪽-오른쪽 모서리 반지름
        rightbottomradius : 0.1, // 오른쪽-아래쪽 모서리 반지름
        bottomleftradius : 0.1 // 아래쪽-왼쪽 모서리 반지름
    }
    // assign
    Object.assign(baseInfo, roundedRectangleBorderInfo);
    // position base
    const halfWidth = baseInfo.width * 0.5;
    const halfHeight = baseInfo.height * 0.5;
    // 모서리가 둥근 직사각형 보더 테두리 생성
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
   return new THREE.Mesh(new THREE.ShapeGeometry(pathBorder), new THREE.MeshBasicMaterial({color: baseInfo.boardColor, transparent: baseInfo.transparent, opacity: baseInfo.opacity, side: THREE.DoubleSide}));
}

// 모서리가 둥근 직사각형 생성
export function creatorRoundedRectangle(roundedRectangleInfo : any) {
    // 기본 정보
    const baseInfo = {
        width : 0.5, // 가로 크기
        minWidth : 0, // 최소 가로 크기
        autoWidth : true, // 가로 크기 자동
        padding : 0.1, // 가로 크기 여백
        height : 0.2, // 세로 크기
        minHeight : 0, // 최소 세로 크기
        autoHeight : false, // 세로 크기 자동
        text : "", // 텍스트
        fontColor : "#FFFFFF", // 텍스트 색상
        fontSize : 16, // 텍스트 크기
        fontWeight : "normal", // 텍스트 굵기 (normal, bolder)
        backgroundColor : 0x000000, // 배경 색상
        transparent : false, // 투명 여부
        opacity : 0.5, // 불투명도 (0 ~ 1)
        thickness : 0.01, // 테두리 두께
        boardColor : 0xFFFFFF, // 테두리 색상
        boardTransparent : false, // 테두리 투명 여부
        boardOpacity : 0.5, // 테두리 불투명도 (0 ~ 1)
        lefttopradius : 0.1, // 왼쪽-위쪽 모서리 반지름
        toprightradius : 0.1, // 위쪽-오른쪽 모서리 반지름
        rightbottomradius : 0.1, // 오른쪽-아래쪽 모서리 반지름
        bottomleftradius : 0.1 // 아래쪽-왼쪽 모서리 반지름
    }
    // assign
    Object.assign(baseInfo, roundedRectangleInfo);

    // 라벨 생성
    const textInfo = {
        text : baseInfo.text,
        fontColor : baseInfo.fontColor,
        fontSize : baseInfo.fontSize,
        fontWeight : baseInfo.fontWeight,
        autoCRLF : baseInfo
    }
    const label = creatorText(textInfo);
    // 라벨 가로 크기
    label.geometry.computeBoundingBox();
    const labelBoundingBox = label.geometry.boundingBox!;
    const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
    const labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;

    // 가로 - 세로 크기
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
    // 가로 크기 조정
    if (baseInfo.width < baseWidth) {
        baseInfo.width = baseWidth;
    }
    if (baseInfo.minWidth > 0 && baseInfo.width < baseInfo.minWidth) {
        baseInfo.width = baseInfo.minWidth;
    }
    if (baseInfo.autoWidth && (baseInfo.width < (labelWidth + (baseInfo.padding * 2)))) {
        baseInfo.width = labelWidth + (baseInfo.padding * 2);
    }
    // 세로 크기 조정
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
    // position base
    const halfWidth = baseInfo.width * 0.5;
    const halfHeight = baseInfo.height * 0.5;
    // 모서리가 둥근 직사각형 셰이프 생성
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
    roundedRectangle.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({color: baseInfo.backgroundColor, transparent: baseInfo.transparent, opacity: baseInfo.opacity, side: THREE.DoubleSide})));
    // 라벨 추가
    roundedRectangle.add(label);
    label.position.set(0, 0, 0.004);

    // 평면 보더 테두리 둥글게 생성
    let roundedRectangleBorderInfo = {
        width : baseInfo.width,
        height : baseInfo.height,
        boardColor : baseInfo.boardColor,
        transparent : baseInfo.boardTransparent,
        opacity : baseInfo.boardOpacity,
        thickness : baseInfo.thickness,
        lefttopradius : baseInfo.lefttopradius,
        toprightradius : baseInfo.toprightradius,
        rightbottomradius : baseInfo.rightbottomradius,
        bottomleftradius : baseInfo.bottomleftradius
    }
    roundedRectangle.add(creatorRoundedRectangleBorder(roundedRectangleBorderInfo));
    
    return [roundedRectangle, roundedRectangleBorderInfo];
}