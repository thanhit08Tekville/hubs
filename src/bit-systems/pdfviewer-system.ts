import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";
import { anyEntityWith } from "../hubs";
import { Interacted, pdfviewer } from "../bit-components";

const pdfviewerQuery = defineQuery([pdfviewer]);
const pdfviewerEnterQuery = enterQuery(pdfviewerQuery);
const pdfviewerExitQuery = exitQuery(pdfviewerQuery);

function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

export function pdfviewerSystem(world: HubsWorld) {
    const myPdfViewerEid = anyEntityWith(world, pdfviewer);
    if (myPdfViewerEid === null) {
        return;
    }

    const entered = pdfviewerEnterQuery(world);

    for (let i = 0; i < entered.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = entered[i];
        const pdfViewerServer = APP.getString(pdfviewer.pdfViewerServer[entity]);
        const pdfFileUrl = APP.getString(pdfviewer.pdfFileUrl[entity]);
        console.log('entered', { entity, pdfViewerServer, pdfFileUrl });
    }

    const exited = pdfviewerExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exited[i];
        const pdfViewerServer = APP.getString(pdfviewer.pdfViewerServer[entity]);
        const pdfFileUrl = APP.getString(pdfviewer.pdfFileUrl[entity]);
        console.log('exited', { entity, pdfViewerServer, pdfFileUrl });
    }

    const entities = pdfviewerQuery(world);
    for (let i = 0; i < entities.length; i++) {
        const scene = AFRAME.scenes[0];
        const entity = entities[i];
        const pdfViewerServer = APP.getString(pdfviewer.pdfViewerServer[entity]);
        const pdfFileUrl = APP.getString(pdfviewer.pdfFileUrl[entity]);

        if (clicked(world, entity)) {
            console.log('clicked', { entity, pdfViewerServer, pdfFileUrl });
            const action_string = "action_toggle_iframe";
            // combine the pdfViewerServer and pdfFileUrl url parameter into an url
            let href = "";
            if (pdfViewerServer && pdfFileUrl) {
                const pdfViewerURL = new URL(pdfViewerServer);
                pdfViewerURL.searchParams.set('url', pdfFileUrl);
                href = pdfViewerURL.toString();
            } else {
                return;
            }

            scene.emit(action_string, { href: href });
        }
    }
}