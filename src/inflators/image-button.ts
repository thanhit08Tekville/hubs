import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { imageButton, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";



export type ImageButtonParams = {
    href: string;
    triggerType: string,
    triggerTarget: string,
    triggerName: string,
    triggerValue: string,
    actionsAfterClick: string,
    actionsData: string
};

const DEFAULTS: Required<ImageButtonParams> = {
    href: "",
    triggerType: "",
    triggerTarget: "",
    triggerName: "",
    triggerValue: "",
    actionsAfterClick: "",
    actionsData: ""
};

export function inflateImageButton(world: HubsWorld, eid: number, params: ImageButtonParams) {
    console.log("inflating an Image Button Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<ImageButtonParams>;
    addComponent(world, imageButton, eid);
    imageButton.href[eid] = APP.getSid(requiredParams.href);
    imageButton.triggerType[eid] = APP.getSid(requiredParams.triggerType);
    imageButton.triggerTarget[eid] = APP.getSid(requiredParams.triggerTarget);
    imageButton.triggerName[eid] = APP.getSid(requiredParams.triggerName);
    imageButton.triggerValue[eid] = APP.getSid(requiredParams.triggerValue);
    imageButton.actionsAfterClick[eid] = APP.getSid(requiredParams.actionsAfterClick);
    imageButton.actionsData[eid] = APP.getSid(requiredParams.actionsData);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}