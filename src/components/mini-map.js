const NAV_ZONE = "character";

AFRAME.registerComponent("mini-map", {
    init: function () {
        console.log("Mini-map component initialized");
        this.setupControls();
        this.setupCanvas();
        this.setupThreeJS();
        this.setupScene();
        this.setupUser();
        this.setupRaycaster();
        this.characterController = this.el.sceneEl.systems["hubs-systems"].characterController;
        this.canvas.addEventListener("click", (event) => this.onMiniMapClick(event));
        // Other initialization code here...
        this.raycaster = new THREE.Raycaster();
        this.isNavigating = false;
        this.destination = null;
    },

    setupControls: function () {
        this.arrowUp = document.getElementById("arrow_up");
        this.arrowDown = document.getElementById("arrow_down");
        this.arrowLeft = document.getElementById("arrow_left");
        this.arrowRight = document.getElementById("arrow_right");
        this.zoomInButton = document.getElementById("zoom_in");
        this.zoomOutButton = document.getElementById("zoom_out");

        this.addEventListeners();
    },

    addEventListeners: function () {
        if (this.arrowUp) this.arrowUp.addEventListener("click", () => this.moveCamera("up"));
        if (this.arrowDown) this.arrowDown.addEventListener("click", () => this.moveCamera("down"));
        if (this.arrowLeft) this.arrowLeft.addEventListener("click", () => this.moveCamera("left"));
        if (this.arrowRight) this.arrowRight.addEventListener("click", () => this.moveCamera("right"));
        if (this.zoomInButton) this.zoomInButton.addEventListener("click", () => this.zoom("zoomIn"));
        if (this.zoomOutButton) this.zoomOutButton.addEventListener("click", () => this.zoom("zoomOut"));
    },

    setupCanvas: function () {
        this.canvas = document.getElementById("miniMap");
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    },

    setupThreeJS: function () {
        this.renderer = this.el.sceneEl.renderer;
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
        this.miniMapCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.miniMapCamera.position.set(0, 40, 0);
        this.miniMapCamera.lookAt(new THREE.Vector3(0, 0, 0));
    },

    setupScene: function () {
        this.scene = this.el.sceneEl.object3D;
    },

    setupUser: function () {
        this.user = document.querySelector("#avatar-rig");
        this.camera = document.querySelector("#avatar-pov-node");
        this.previousPosition = new THREE.Vector3();
        if (this.user) {
            this.previousPosition.copy(this.user.object3D.position);
        }
        this.angle = 0;
        this.previousCameraRotation = 0;
    },

    setupRaycaster: function () {
        this.raycaster = new THREE.Raycaster();
    },

    onMiniMapClick: function (event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;

        const mouseVector = new THREE.Vector2(x, y);
        this.raycaster.setFromCamera(mouseVector, this.miniMapCamera);

        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const destination = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(groundPlane, destination);
        destination.z = -destination.z;
        // Set navigation to the calculated 3D destination
        this.navigateTo(destination);
        this.startRotation = true;
    },

    navigateTo: function (destination) {
        this.destination = destination;
        this.isNavigating = true;
    },

    moveCamera: function (direction) {
        const moveStep = 1;
        const currentCameraPosition = this.miniMapCamera.position;
        this.miniMapCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

        switch (direction) {
            case "up":
                this.miniMapCamera.position.set(currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z + moveStep);
                break;
            case "down":
                this.miniMapCamera.position.set(currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z - moveStep);
                break;
            case "left":
                this.miniMapCamera.position.set(currentCameraPosition.x - moveStep, currentCameraPosition.y, currentCameraPosition.z);
                break;
            case "right":
                this.miniMapCamera.position.set(currentCameraPosition.x + moveStep, currentCameraPosition.y, currentCameraPosition.z);
                break;
        }
        this.miniMapCamera.lookAt(new THREE.Vector3(this.miniMapCamera.position.x, 0, this.miniMapCamera.position.z));
        this.updateMiniMap();
    },

    zoom: function (direction) {
        const zoomStep = 1;
        const currentCameraPosition = this.miniMapCamera.position;
        this.miniMapCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

        switch (direction) {
            case "zoomIn":
                this.miniMapCamera.position.set(currentCameraPosition.x, currentCameraPosition.y - zoomStep, currentCameraPosition.z);
                break;
            case "zoomOut":
                this.miniMapCamera.position.set(currentCameraPosition.x, currentCameraPosition.y + zoomStep, currentCameraPosition.z);
                break;
        }
        this.miniMapCamera.lookAt(new THREE.Vector3(currentCameraPosition.x, 0, currentCameraPosition.z));
        this.updateMiniMap();
    },

    calculateScaleFactor: function () {
        const cameraPosition = this.miniMapCamera.position;
        const userPosition = this.camera.object3D.position;
        const distance = cameraPosition.distanceTo(userPosition);
        return (this.width / distance);
    },

    updateCanvasSize: function () {
        this.canvas.height = window.innerHeight * 0.25;
        this.canvas.width = this.canvas.height;

        if (this.renderTarget) {
            this.renderTarget.setSize(this.canvas.width, this.canvas.height);
        }
    },

    teleportTo: function (targetWorldPosition) {
        const rig = new THREE.Vector3();
        const head = new THREE.Vector3();
        const deltaFromHeadToTargetForHead = new THREE.Vector3();
        const targetForHead = new THREE.Vector3();
        const targetForRig = new THREE.Vector3();

        this.didTeleportSinceLastWaypointTravel = true;
        this.isMotionDisabled = false;
        this.user.object3D.getWorldPosition(rig);
        this.camera.object3D.getWorldPosition(head);
        targetForHead.copy(targetWorldPosition);
        targetForHead.y += this.camera.object3D.position.y;
        deltaFromHeadToTargetForHead.copy(targetForHead).sub(head);
        targetForRig.copy(rig).add(deltaFromHeadToTargetForHead);
        const navMeshExists = NAV_ZONE in this.scene.systems.nav.pathfinder.zones;
        this.findPositionOnNavMesh(targetForRig, targetForRig, this.user.object3D.position, navMeshExists);
        this.user.object3D.matrixNeedsUpdate = true;

    },

    tick: function (time, timeDelta) {
        if (this.isNavigating && this.destination) {
            this.characterController.isNavigating = true;
            const userPosition = this.user.object3D.position;
            const direction = new THREE.Vector3().subVectors(this.destination, userPosition).normalize();

            // Project both vectors to the XZ plane
            direction.y = 0;
            const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.object3D.quaternion).normalize();
            cameraForward.y = 0;

            // Calculate the angle between the two vectors
            const angle = Math.atan2(direction.x, direction.z) - Math.atan2(cameraForward.x, cameraForward.z);


            if (Math.abs(angle) < 0.01) {
                this.startRotation = false;
            } else {
                if (this.startRotation) {
                    // console.log("Angle: ", angle, "Camera rotation: ", this.camera.object3D.rotation.y);
                    // Smoothly rotate the camera to face the destination direction
                    this.camera.object3D.rotation.y += angle * 0.05; // Adjust rotation speed as needed
                    this.updateMiniMap();
                    return;
                }
            }

            // Dynamic speed increase with acceleration
            const baseSpeed = 0.001; // Starting speed
            const maxSpeed = 0.01;   // Maximum speed
            const acceleration = 0.0001; // Acceleration factor
            // Gradually increase speed up to the max speed
            const distanceToDestination = userPosition.distanceTo(this.destination);
            let speed = Math.min(baseSpeed + acceleration * timeDelta, maxSpeed);

            // Calculate the step vector
            const step = direction.normalize().multiplyScalar(speed * timeDelta);

            userPosition.add(step);

            if (distanceToDestination < 1.0) {
                // userPosition.copy(this.destination);
                this.characterController.teleportTo(this.destination);
                this.isNavigating = false;
                this.destination = null;
                this.characterController.isNavigating = false;
                this.startRotation = false;
                // console.log("Reached destination");
            } else {
                // console.log("Distance to destination: ", distanceToDestination);
            }
        }
        this.updateMiniMap();
    },

    updateMiniMap: function () {
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.miniMapCamera);

        const pixelBuffer = new Uint8Array(this.width * this.height * 4);
        this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.width, this.height, pixelBuffer);
        const imageData = this.ctx.createImageData(this.width, this.height);
        imageData.data.set(pixelBuffer);
        this.ctx.putImageData(imageData, 0, 0);

        if (this.user) {
            this.drawUserOnMiniMap();
        }

        this.renderer.setRenderTarget(null);
    },

    drawUserOnMiniMap: function () {
        const userPosition = this.user.object3D.position;
        const movementDirection = new THREE.Vector3().subVectors(userPosition, this.previousPosition);
        const scaleFactor = this.calculateScaleFactor();

        if (movementDirection.length() > 0.01) {
            this.updateArrowPosition(userPosition, movementDirection, scaleFactor);
            // console.log("User position: ", userPosition);
        } else {
            this.updateArrowRotation(userPosition, scaleFactor);
        }
    },

    updateArrowPosition: function (userPosition, movementDirection, scaleFactor) {
        const cameraOffsetX = userPosition.x - this.miniMapCamera.position.x;
        const cameraOffsetZ = userPosition.z - this.miniMapCamera.position.z;
        const mapX = (cameraOffsetX * scaleFactor) + this.width / 2;
        const mapY = (-cameraOffsetZ * scaleFactor) + this.height / 2;
        const angle = Math.atan2(movementDirection.x, movementDirection.z);
        this.angle = angle;

        this.drawArrow(mapX, mapY, angle);
        this.previousPosition.copy(userPosition);
        this.previousCameraRotation = this.camera.object3D.rotation.y;
    },

    updateArrowRotation: function (userPosition, scaleFactor) {
        const cameraRotation = this.camera.object3D.rotation.y;
        const rotationDelta = cameraRotation - this.previousCameraRotation;
        const cameraOffsetX = userPosition.x - this.miniMapCamera.position.x;
        const cameraOffsetZ = userPosition.z - this.miniMapCamera.position.z;
        const mapX = (cameraOffsetX * scaleFactor) + this.width / 2;
        const mapY = (-cameraOffsetZ * scaleFactor) + this.height / 2;

        this.drawArrow(mapX, mapY, this.angle + rotationDelta);
    },

    drawArrow: function (x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = "blue";
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(-5, 5);
        this.ctx.lineTo(5, 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    },

    remove: function () {
        if (this.el.sceneEl.renderer.setAnimationLoop) {
            this.el.sceneEl.renderer.setAnimationLoop(null);
        }
    }
});