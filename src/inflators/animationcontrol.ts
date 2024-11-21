import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { animationControl, CursorRaycastable,  RemoteHoverTarget, SingleActionButton  } from "../bit-components";

export type animationcontrolParams = {
    animation_name: string;
};

const DEFAULTS: Required<animationcontrolParams> = {
    animation_name: ""
};

export function inflateanimationcontrol(world: HubsWorld, eid: number, params: animationcontrolParams) {
    console.log("inflating an animationcontrol Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<animationcontrolParams>;
    addComponent(world, animationControl, eid);
    animationControl.animationName[eid] = APP.getSid(requiredParams.animation_name);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}
