AFRAME.registerComponent("mini-map", {
    init: function () {
        console.log("Mini-map component initialized");

        // Canvas and context for mini-map
        this.canvas = document.getElementById("miniMap");
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Set up Three.js renderer and render target
        this.renderer = this.el.sceneEl.renderer;
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);

        // Mini-map camera setup
        this.miniMapCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.miniMapCamera.position.set(0, 40, 0);
        this.miniMapCamera.lookAt(new THREE.Vector3(0, 0, 0));

        // Get A-Frame scene and user entity
        this.scene = this.el.sceneEl.object3D;
        this.user = document.querySelector("#avatar-rig");
        this.camera = document.querySelector("#avatar-pov-node");
        // Initialize the previous position
        this.previousPosition = new THREE.Vector3();
        if (this.user) {
            this.previousPosition.copy(this.user.object3D.position);
        }
        this.angle = 0;
        this.previousCameraRotation = 0;
    },

    updateCanvasSize: function () {
        this.canvas.height = window.innerHeight * 0.25;
        this.canvas.width = this.canvas.height;

        // Update render target with new canvas dimensions
        if (this.renderTarget) {
            this.renderTarget.setSize(this.canvas.width, this.canvas.height);
        }
    },

    tick: function () {
        this.updateMiniMap();
    },

    updateMiniMap: function () {
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.miniMapCamera);

        // Read pixels and draw mini-map background on canvas
        const pixelBuffer = new Uint8Array(this.width * this.height * 4);
        this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.width, this.height, pixelBuffer);
        const imageData = this.ctx.createImageData(this.width, this.height);
        imageData.data.set(pixelBuffer);
        this.ctx.putImageData(imageData, 0, 0);

        // Draw the user's position and movement direction as an arrow on the mini-map
        if (this.user) {
            const userPosition = this.user.object3D.position;
            const movementDirection = new THREE.Vector3().subVectors(userPosition, this.previousPosition);

            // Only update the arrow if there's movement
            if (movementDirection.length() > 0.01) {
                const mapX = (userPosition.x * 10) + this.width / 2;
                const mapY = (-userPosition.z * 10) + this.height / 2;
                const angle = Math.atan2(movementDirection.x, movementDirection.z); // Calculate movement angle
                this.angle = angle;

                // Draw the user as an arrow pointing in the direction of movement
                this.ctx.save();
                this.ctx.translate(mapX, mapY);
                this.ctx.rotate(angle); // Rotate arrow to match movement direction
                this.ctx.fillStyle = "red";
                this.ctx.beginPath();
                this.ctx.moveTo(0, -10);  // Arrow point
                this.ctx.lineTo(-5, 5);   // Left wing
                this.ctx.lineTo(5, 5);    // Right wing
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();

                // Update the previous position
                this.previousPosition.copy(userPosition);
                this.previousCameraRotation = this.camera.object3D.rotation.y;
            } else {
                const cameraRotation = this.camera.object3D.rotation.y
                const rotationDelta = cameraRotation - this.previousCameraRotation;
                const mapX = (userPosition.x * 10) + this.width / 2;
                const mapY = (-userPosition.z * 10) + this.height / 2;
                // Draw the user as an arrow pointing in the direction of movement
                this.ctx.save();
                this.ctx.translate(mapX, mapY);
                this.ctx.rotate(this.angle + rotationDelta); // Rotate arrow to match movement direction
                this.ctx.fillStyle = "red";
                this.ctx.beginPath();
                this.ctx.moveTo(0, -10);  // Arrow point
                this.ctx.lineTo(-5, 5);   // Left wing
                this.ctx.lineTo(5, 5);    // Right wing
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        this.renderer.setRenderTarget(null);
    },

    remove: function () {
        if (this.el.sceneEl.renderer.setAnimationLoop) {
            this.el.sceneEl.renderer.setAnimationLoop(null);
        }
    }
});
