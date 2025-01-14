/** @jsx createElementEntity */
import { createElementEntity } from "../utils/jsx-entity";

export type imageButtonNetworkedDataParams = {
    href: string;
    triggerType: string;
    triggerTarget: string;
    triggerName: string;
    triggerValue: string;
    actionsAfterClick: string;
    actionsData: string;
    clicked: string;
};

export function imageButtonNetworkedDataPrefabs(params: imageButtonNetworkedDataParams) {
    return (
        <entity
            name="Image Button Networked Data"
            networked
            imageButtonNetworkedData={{
                href: params.href,
                triggerType: params.triggerType,
                triggerTarget: params.triggerTarget,
                triggerName: params.triggerName,
                triggerValue: params.triggerValue,
                actionsAfterClick: params.actionsAfterClick,
                actionsData: params.actionsData,
                clicked: params.clicked                
            }}
        />
    );
}