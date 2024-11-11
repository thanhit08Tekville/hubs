import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCIframe, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";



export type TFCIframeParams = {
    href: string;
};

const DEFAULTS: Required<TFCIframeParams> = {
    href: "",
};

export function inflateTFCIframe(world: HubsWorld, eid: number, params: TFCIframeParams) {
    console.log("inflating an Iframe Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<TFCIframeParams>;
    addComponent(world, TFCIframe, eid);
    TFCIframe.href[eid] = APP.getSid(requiredParams.href);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}