AFRAME.registerComponent("mini-map", {
    init: function () {
        console.log("Mini-map component initialized");
        // Canvas and context for mini-map
        this.canvas = document.getElementById("miniMap");
        this.ctx = this.canvas.getContext("2d");

        // Set up Three.js renderer and render target
        this.renderer = this.el.sceneEl.renderer; 
        this.renderTarget = new THREE.WebGLRenderTarget(200, 200);

        // Mini-map camera setup
        this.miniMapCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.miniMapCamera.position.set(0, 20, 0); // Position above the scene
        this.miniMapCamera.lookAt(new THREE.Vector3(0, 0, 0)); // Look down at the scene

        // Get A-Frame scene and user entity
        this.scene = this.el.sceneEl.object3D;
        this.user = document.querySelector("#avatar-rig");
    },

    tick: function () {
        // Update the mini-map every frame
        this.updateMiniMap();
    },

    updateMiniMap: function () {
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.miniMapCamera);

        // Read pixels and draw mini-map background on canvas
        const pixelBuffer = new Uint8Array(200 * 200 * 4);
        this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, 200, 200, pixelBuffer);
        const imageData = this.ctx.createImageData(200, 200);
        imageData.data.set(pixelBuffer);
        this.ctx.putImageData(imageData, 0, 0);

        // Draw the user's position as a dot on the mini-map
        if (this.user) {
            const userPosition = this.user.object3D.position;
            const mapX = (userPosition.x * 10) + 100; // Scale and center on canvas
            const mapY = (-userPosition.z * 10) + 100; // Scale and invert Z for 2D

            // Draw a red dot representing the user
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(mapX, mapY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Reset render target to default
        this.renderer.setRenderTarget(null);
    },

    remove: function () {
        // Stop rendering loop if the component is removed
        if (this.el.sceneEl.renderer.setAnimationLoop) {
            this.el.sceneEl.renderer.setAnimationLoop(null);
        }
    }
});

