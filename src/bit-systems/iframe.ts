import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";



import { Interacted, TFCIframe } from "../bit-components";

const TFCIframeQuery = defineQuery([TFCIframe]);
const TFCIframeEnterQuery = enterQuery(TFCIframeQuery);
const TFCIframeExitQuery = exitQuery(TFCIframeQuery);


function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

export function TFCIframeSystem(world: HubsWorld) {
    const myButtonEid = anyEntityWith(world, TFCIframe);
    if (myButtonEid === null) {
        return;
    }

    const entered = TFCIframeEnterQuery(world);

    for (let i = 0; i < entered.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = entered[i];
        const href = APP.getString(TFCIframe.href[entity]);
        console.log('entered', { entity, href });
    }

    const exited = TFCIframeExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exited[i];
        const href = APP.getString(TFCIframe.href[entity]);
        console.log('exited', { entity, href });
    }

    const entities = TFCIframeQuery(world);
    for (let i = 0; i < entities.length; i++) {
        const scene = AFRAME.scenes[0];
        const entity = entities[i];
        const href = APP.getString(TFCIframe.href[entity]);

        if (clicked(world, entity)) {
            console.log('clicked', { entity, href });
            if (href?.includes('chat')) {
                const action_string = "action_toggle_ai_chat";
                scene.emit(action_string, { href: href });
                return;
            } 
            const action_string = "action_toggle_iframe";
            scene.emit(action_string, { href: href });
        }
    }


}