import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { pdfviewer, CursorRaycastable,  RemoteHoverTarget, SingleActionButton  } from "../bit-components";

export type pdfviewerParams = {
    pdfViewerServer: string;
    pdfFileUrl: string;
};

const DEFAULTS: Required<pdfviewerParams> = {
    pdfViewerServer: "",
    pdfFileUrl: "",
};

export function inflatepdfviewer(world: HubsWorld, eid: number, params: pdfviewerParams) {
    console.log("inflating an pdfviewer Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<pdfviewerParams>;
    addComponent(world, pdfviewer, eid);
    pdfviewer.pdfViewerServer[eid] = APP.getSid(requiredParams.pdfViewerServer);
    pdfviewer.pdfFileUrl[eid] = APP.getSid(requiredParams.pdfFileUrl);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}
