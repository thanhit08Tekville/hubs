import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { anyEntityWith } from "../hubs";
import { Interacted, animationControl, animationControlUI } from "../bit-components";
import { addObject3DComponent } from "../utils/jsx-entity";
import { findAncestorWithComponent } from "../utils/scene-graph";

const animationcontrolQuery = defineQuery([animationControl]);
const animationcontrolEnterQuery = enterQuery(animationcontrolQuery);
const animationcontrolExitQuery = exitQuery(animationcontrolQuery);

const animationControlUIQuery = defineQuery([animationControlUI]);
const animationControlUIEnterQuery = enterQuery(animationControlUIQuery);
const animationControlUIExitQuery = exitQuery(animationControlUIQuery);


let controlMesh = new THREE.Mesh();
function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

export function animationcontrolSystem(world: HubsWorld) {
    const myanimationcontrolEid = anyEntityWith(world, animationControl);
    if (myanimationcontrolEid === null) {
        return;
    }

    const entered = animationcontrolEnterQuery(world);

    for (let i = 0; i < entered.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = entered[i];
        const controlObject = world.eid2obj.get(entity);
        const animationName = APP.getString(animationControl.animationName[entity]);
        console.log('entered', { entity, animationName });
        if (controlObject) {
            const controlPosition = new THREE.Vector3();
            controlObject.getWorldPosition(controlPosition);
            const controlRotation = new THREE.Quaternion();
            controlObject.getWorldQuaternion(controlRotation);
            const controlScale = new THREE.Vector3();
            controlObject.getWorldScale(controlScale);

            // const el = controlObject?.parent?.parent?.parent?.el;
            // const mixerEl = findAncestorWithComponent(el, "animation-mixer");
            // if (!mixerEl) {
            //     el?.setAttribute("animation-mixer", "");
                
            // }

            controlObject.visible = true;

            let btn_width = 1.6;
            let btn_height = 0.4;
            let text_color = "#000000";
            let bg_color = "#ffffff";
            let font_size = 14;
            let text = "Click Me";
            let font = "Arial";

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;

            canvas.width = 1028 * btn_width; // Texture width (power of 2)
            canvas.height = 1028 * btn_height; // Texture height (power of 2)

            context.fillStyle = bg_color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            // Draw text
            context.font = `${font_size * 10}px ${font}`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = text_color;
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            // Create texture from canvas
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            const materialParams = { map: texture, side: THREE.DoubleSide, transparent: false };
            const material = new THREE.MeshBasicMaterial(materialParams);

            // Create geometry
            const geometry = new THREE.PlaneGeometry(btn_width, btn_height);

            const controlEid = addEntity(world);
            // Create mesh
            controlMesh = new THREE.Mesh(geometry, material);
            controlMesh.position.copy(controlPosition);
            controlMesh.position.x -= 1.5;
            controlMesh.quaternion.copy(controlRotation);


            addObject3DComponent(world, controlEid, controlMesh);
            addComponent(world, animationControlUI, controlEid);
            animationControlUI.animationName[controlEid] = APP.getSid(animationName ? animationName : "");
            animationControlUI.parentNode[controlEid] = entity;
            // Add mouse events to the mesh
            // addComponent(world, animationControl, controlEid);
            addComponent(world, CursorRaycastable, controlEid); // Raycast
            addComponent(world, RemoteHoverTarget, controlEid); // Hover
            addComponent(world, SingleActionButton, controlEid); // Click
            world.scene.add(controlMesh);
        }

    }

    const exited = animationcontrolExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exited[i];
        const controlObject = world.eid2obj.get(entity);


        const animationName = APP.getString(animationControl.animationName[entity]);
        console.log('exited', { entity, animationName });
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const entities = animationcontrolQuery(world);

    for (let i = 0; i < entities.length; i++) {
        const networkedEid = anyEntityWith(world, animationControl)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControl.animationName[networkedEid]);
            if (clicked(world, networkedEid)) {
                console.log('clicked', { networkedEid, animationName });
            }
        }
    }

    const entitiesUI = animationControlUIQuery(world);
    for (let i = 0; i < entitiesUI.length; i++) {
        const networkedEid = anyEntityWith(world, animationControlUI)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControlUI.animationName[networkedEid]);
            const parentEid = animationControlUI.parentNode[networkedEid];
            if (clicked(world, networkedEid)) {
                console.log('clicked', { networkedEid, animationName });
                // const object = world.eid2obj.get(networkedEid);
                // const parentObject = world.eid2obj.get(parentEid);
                // if (!parentObject) {
                //     return;
                // }
                // const mixerEl = findAncestorWithComponent(parentObject?.parent?.parent?.parent?.el, "animation-mixer");
                // // const mixerEl = findAncestorWithComponent(parentObject?.parent?.parent?.el, "animation-mixer");
                // // if (!mixerEl) {
                // //     return;
                // // }
                // const animations = parentObject?.parent?.animations;
                // if (!animations) {
                //     return;
                // }

                // for (let i = 0; i < animations.length; i++) {
                //     if (animations[i].name === animationName) {
                //         // mixerEl.components["animation-mixer"]?.initMixer(animations);
                //         const { mixer, animations_clips } = mixerEl.components["animation-mixer"];
                //         if (mixer) {
                //             const action = mixer.clipAction(animations[i]);
                //             action.stop();
                //             action.play();
                //         }
                //         // mixer.stopAction(animations[i]);
                //         // mixer.playAction(animations[i]);
                //         console.log('playing animation', { animationName });
                //     }
                // }

            }
        }
    }

    const exitedUI = animationControlUIExitQuery(world);
    for (let i = 0; i < exitedUI.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exitedUI[i];
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }
}