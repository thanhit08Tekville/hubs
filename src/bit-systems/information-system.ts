import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { anyEntityWith } from "../hubs";
import { Interacted, information, informationUI } from "../bit-components";
import { addObject3DComponent } from "../utils/jsx-entity";
import { createUIButton } from "../tfl-libs/tfl-button";
import { creatorRoundedRectangle } from "../tfl-libs/tfl-panel";

let btn_width = 1;
let btn_height = 1;
let text_color = "#0E89F1";
let bg_color = "#0E89F1";
let font_size = 80;
let text = "i";
let font = "Arial";
let button_style = "circle";

const informationQuery = defineQuery([information]);
const informationEnterQuery = enterQuery(informationQuery);
const informationExitQuery = exitQuery(informationQuery);

const informationUIQuery = defineQuery([informationUI]);
const informationUIExitQuery = exitQuery(informationUIQuery);


function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}
let informationPanel: any = null;
let informationPanelEnabled = false;

export function informationSystem(world: HubsWorld) {
    const myInformationEid = anyEntityWith(world, information);
    if (myInformationEid === null) {
        return;
    }

    const entered = informationEnterQuery(world);

    for (let i = 0; i < entered.length; i++) {
        const entity = entered[i];
        const informationObject = world.eid2obj.get(entity);
        const informationURL = APP.getString(information.informationURL[entity]);
        const informationTitle = APP.getString(information.informationTitle[entity]);
        const informationText = APP.getString(information.informationText[entity]);
        const informationImage = APP.getString(information.informationImage[entity]);

        console.log('Information System: Entering: ', { entity, informationURL, informationTitle, informationText, informationImage });
        if (informationObject) {
            const informationPosition = new THREE.Vector3();
            informationObject.getWorldPosition(informationPosition);
            const informationRotation = new THREE.Quaternion();
            informationObject.getWorldQuaternion(informationRotation);
            const informationScale = new THREE.Vector3();
            informationObject.getWorldScale(informationScale);
            informationObject.visible = true;
            const informationButtonEid = addEntity(world);
            text = informationTitle ? informationTitle : text;
            const informationButton = createUIButton({
                width: btn_width,
                height: btn_height,
                backgroundColor: bg_color,
                textColor: text_color,
                text: text,
                fontSize: font_size,
                font: font,
                buttonStyle: button_style
            });

            informationButton.position.copy(informationPosition);
            informationButton.quaternion.copy(informationRotation);
            informationButton.scale.copy(informationScale);

            addObject3DComponent(world, informationButtonEid, informationButton);
            addComponent(world, informationUI, informationButtonEid);
            informationUI.informationURL[informationButtonEid] = APP.getSid(informationURL ? informationURL : '');
            informationUI.informationTitle[informationButtonEid] = APP.getSid(informationTitle ? informationTitle : '');
            informationUI.informationText[informationButtonEid] = APP.getSid(informationText ? informationText : '');
            informationUI.informationImage[informationButtonEid] = APP.getSid(informationImage ? informationImage : '');

            addComponent(world, CursorRaycastable, informationButtonEid); // Raycast
            addComponent(world, RemoteHoverTarget, informationButtonEid); // Hover
            addComponent(world, SingleActionButton, informationButtonEid); // Click
            world.scene.add(informationButton);
        }

    }

    const exited = informationExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        const entity = exited[i];
        console.log('Information System: Exiting: ', entity);
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const exitedUI = informationUIExitQuery(world);
    for (let i = 0; i < exitedUI.length; i++) {
        const entity = exitedUI[i];
        console.log('Information System: Exiting UI: ', entity);
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const entitiesUI = informationUIQuery(world);
    for (let i = 0; i < entitiesUI.length; i++) {
        const networkedEid = entitiesUI[i];
        if (networkedEid) {

            if (clicked(world, networkedEid)) {
                const informationObject = world.eid2obj.get(networkedEid);
                if (!informationObject) {
                    return;
                }
                const informationPosition = new THREE.Vector3();
                informationObject.getWorldPosition(informationPosition);
                const informationRotation = new THREE.Quaternion();
                informationObject.getWorldQuaternion(informationRotation);
                const informationScale = new THREE.Vector3();
                informationObject.getWorldScale(informationScale);

                const informationURL = APP.getString(informationUI.informationURL[networkedEid]);
                const informationTitle = APP.getString(informationUI.informationTitle[networkedEid]);
                const informationText = APP.getString(informationUI.informationText[networkedEid]);
                const informationImage = APP.getString(informationUI.informationImage[networkedEid]);
                console.log('clicked', { networkedEid, informationURL, informationTitle, informationText, informationImage });
                if (informationPanel) {
                    world.scene.remove(informationPanel);
                    if (informationPanelEnabled) {
                        informationPanelEnabled = false;
                        return;
                    }
                }

                informationPanelEnabled = true;
                const informationPanelInfo = creatorRoundedRectangle({
                    text: informationText ? informationText : "This is an example description text that appears in the panel.",
                    autoHeight: true
                });
                informationPanel = informationPanelInfo[0];
                const roundedRectangleBorderInfo: any = informationPanelInfo[1];
                const informationPanelWidth = roundedRectangleBorderInfo["width"];
                const informationPanelHeight = roundedRectangleBorderInfo["height"];

                informationPanel.position.copy(informationPosition);
                informationPanel.position.x += informationPanelWidth / 2;
                informationPanel.position.x += (btn_width * informationScale.x) / 2 + 0.1;
                informationPanel.position.y -= informationPanelHeight / 2;
                informationPanel.quaternion.copy(informationRotation);
                world.scene.add(informationPanel);
            }
        }
    }
}