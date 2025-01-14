import { imageButtonNetworkedData } from "../bit-components";
import { defineNetworkSchema } from "../utils/define-network-schema";
import { deserializerWithMigrations, Migration, NetworkSchema, read, StoredComponent, write } from "../utils/network-schemas";
import type { EntityID } from "../utils/networking-types";

// const migrations = new Map<number, Migration>();

// function apply(eid: EntityID, { version, data }: StoredComponent) {
//     if (version !== 1) return false;

//     const {
//         href,
//         triggerType,
//         triggerTarget,
//         triggerName,
//         triggerValue,
//         actionsAfterClick,
//         actionsData }: {
//             href: string,
//             triggerType: string,
//             triggerTarget: string,
//             triggerName: string,
//             triggerValue: string,
//             actionsAfterClick: string,
//             actionsData: string
//         } = data;
//     write(imageButtonNetworkedData.href, eid, href);
//     write(imageButtonNetworkedData.triggerType, eid, triggerType);
//     write(imageButtonNetworkedData.triggerTarget, eid, triggerTarget);
//     write(imageButtonNetworkedData.triggerName, eid, triggerName);
//     write(imageButtonNetworkedData.triggerValue, eid, triggerValue);
//     write(imageButtonNetworkedData.actionsAfterClick, eid, actionsAfterClick);
//     write(imageButtonNetworkedData.actionsData, eid, actionsData);
//     return true;
// }

const runtimeSerde = defineNetworkSchema(imageButtonNetworkedData);
export const imageButtonNetworkedDataSchema: NetworkSchema = {
    componentName: "image-button-networked-data",
    serialize: runtimeSerde.serialize,
    deserialize: runtimeSerde.deserialize,
    // serializeForStorage: function serializeForStorage(eid: EntityID) {
    //     return {
    //         version: 1,
    //         data: {
    //             href: read(imageButtonNetworkedData.href, eid),
    //             triggerType: read(imageButtonNetworkedData.triggerType, eid),
    //             triggerTarget: read(imageButtonNetworkedData.triggerTarget, eid),
    //             triggerName: read(imageButtonNetworkedData.triggerName, eid),
    //             triggerValue: read(imageButtonNetworkedData.triggerValue, eid),
    //             actionsAfterClick: read(imageButtonNetworkedData.actionsAfterClick, eid),
    //             actionsData: read(imageButtonNetworkedData.actionsData, eid)
    //         }
    //     };
    // },
    // deserializeFromStorage: deserializerWithMigrations(migrations, apply)
};
