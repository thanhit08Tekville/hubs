import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { information, CursorRaycastable,  RemoteHoverTarget, SingleActionButton  } from "../bit-components";

export type informationParams = {
    information_url: string;
    information_title: string;
    information_text: string;
    information_image: string;
};

const DEFAULTS: Required<informationParams> = {
    information_url: "",
    information_title: "",
    information_text: "",
    information_image: ""
};

export function inflateInformation(world: HubsWorld, eid: number, params: informationParams) {
    console.log("inflating an information Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<informationParams>;
    addComponent(world, information, eid);
    information.informationURL[eid] = APP.getSid(requiredParams.information_url);
    information.informationTitle[eid] = APP.getSid(requiredParams.information_title);
    information.informationText[eid] = APP.getSid(requiredParams.information_text);
    information.informationImage[eid] = APP.getSid(requiredParams.information_image);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}
