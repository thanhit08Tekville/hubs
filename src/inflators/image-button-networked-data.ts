// Thanh create
import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { imageButtonNetworkedData } from "../bit-components";

export type ImageButtonNetworkedDataParams = {
    href: string;
    triggerType: string,
    triggerTarget: string,
    triggerName: string,
    triggerValue: string,
    actionsAfterClick: string,
    actionsData: string,
    clicked: string,
    entityTargetId: string
};

const DEFAULTS: Required<ImageButtonNetworkedDataParams> = {
    href: "",
    triggerType: "",
    triggerTarget: "",
    triggerName: "",
    triggerValue: "",
    actionsAfterClick: "",
    actionsData: "",
    clicked: "false",
    entityTargetId: ""
};

export function inflateImageButtonNetworkedData(world: HubsWorld, eid: number, params: ImageButtonNetworkedDataParams) {
    console.log("inflating an Image Button Networked Data Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<ImageButtonNetworkedDataParams>;
    addComponent(world, imageButtonNetworkedData, eid);
    imageButtonNetworkedData.href[eid] = APP.getSid(requiredParams.href);
    imageButtonNetworkedData.triggerType[eid] = APP.getSid(requiredParams.triggerType);
    imageButtonNetworkedData.triggerTarget[eid] = APP.getSid(requiredParams.triggerTarget);
    imageButtonNetworkedData.triggerName[eid] = APP.getSid(requiredParams.triggerName);
    imageButtonNetworkedData.triggerValue[eid] = APP.getSid(requiredParams.triggerValue);
    imageButtonNetworkedData.actionsAfterClick[eid] = APP.getSid(requiredParams.actionsAfterClick);
    imageButtonNetworkedData.actionsData[eid] = APP.getSid(requiredParams.actionsData);
    imageButtonNetworkedData.clicked[eid] = APP.getSid(requiredParams.clicked);
    imageButtonNetworkedData.entityTargetId[eid] = APP.getSid(requiredParams.entityTargetId);
}