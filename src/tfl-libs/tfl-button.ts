// Thanh add
import * as THREE from 'three';

interface CreateUIButtonOptions {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  text: string;
  fontSize: number;
  font: string;
  buttonStyle: string;
}

export function createUIButton(options: CreateUIButtonOptions): THREE.Mesh {
  const { width, height, backgroundColor, textColor, text, fontSize, font, buttonStyle } = options;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Function to set the canvas size and draw the image
  const drawImage = (imageId: string, canvasWidth: number, canvasHeight: number) => {
    const image = document.getElementById(imageId) as HTMLImageElement;
    if (image instanceof HTMLImageElement) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  };

  if (backgroundColor[0] !== '#') {
    switch (text) {
      case "cnc":
        drawImage("cnc_btn_img", 2048, 512);
        break;
      case "math":
        drawImage("math_btn_img", 2048, 512);
        break;
      case "science":
        drawImage("science_btn_img", 2048, 512);
        break;
      case "btn":
        drawImage("circle_btn_img", 400, 400);
        break;
      case "screen":
        drawImage("screen_btn_img", 560, 420);
        break;
      case "lock":
        drawImage("lock_btn_img", 512, 512);
        break;
      default:
        console.log("No matching image for the text provided.");
    }
  } else {
    canvas.width = 1028 * width; // Texture width (power of 2)
    canvas.height = 1028 * height; // Texture height (power of 2)

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (buttonStyle === "circle") {
      context.beginPath();
      context.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2 - 40,
        0,
        Math.PI * 2
      );
      context.fillStyle = "#ffffff";
      context.fill();
      context.closePath();
    }

    // Draw text
    context.font = `${fontSize * 10}px ${font} italic`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = textColor;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  // Create texture from canvas
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  let transparent = true;
  if (backgroundColor[0] === '#') {
    transparent = false;
  } else if (text !== "screen") {
    transparent = true;
  }

  // Create material with texture
  const materialParams = { map: texture, side: THREE.DoubleSide, transparent: transparent };
  const material = new THREE.MeshBasicMaterial(materialParams);

  // Create geometry
  if (buttonStyle === "circle") {
    const geometry = new THREE.CircleGeometry(width / 2, 64);
    return new THREE.Mesh(geometry, material);
  } else {
    const geometry = new THREE.PlaneGeometry(width, height);
    // Create mesh
    return new THREE.Mesh(geometry, material);
  }
}