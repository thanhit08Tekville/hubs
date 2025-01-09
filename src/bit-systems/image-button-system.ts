import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent
} from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";
import { Interacted, imageButton } from "../bit-components";

const ImageButtonQuery = defineQuery([imageButton]);
const ImageButtonEnterQuery = enterQuery(ImageButtonQuery);
const ImageButtonExitQuery = exitQuery(ImageButtonQuery);

const scenarioButtons: Map<number, number> = new Map();
let currentAudio: HTMLAudioElement | null = null;

function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

function getImageButtonData(entity: number) {
    return {
        href: APP.getString(imageButton.href[entity]),
        triggerType: APP.getString(imageButton.triggerType[entity]),
        triggerTarget: APP.getString(imageButton.triggerTarget[entity]),
        triggerName: APP.getString(imageButton.triggerName[entity]),
        triggerValue: APP.getString(imageButton.triggerValue[entity]),
        actionsAfterClick: APP.getString(imageButton.actionsAfterClick[entity]),
        actionsData: APP.getString(imageButton.actionsData[entity])
    };
}

function logImageButtonData(prefix: string, entity: number, data: any) {
    console.log(`${prefix}`, { entity, ...data });
}

function handleTriggerType(triggerType: string, entity: number) {
    switch (triggerType) {
        case 'scenario':
            console.log('trigger type is scenario');
            const scenario_target = APP.getString(imageButton.triggerTarget[entity]);
            const scenario_value = APP.getString(imageButton.triggerValue[entity]);
            break;
        case 'link':
            console.log('trigger type is link');
            const link_href = APP.getString(imageButton.href[entity]);
            break;
        case 'iframe':
            console.log('trigger type is iframe');
            const iframe_href = APP.getString(imageButton.href[entity]);
            break;
        case 'animation':
            console.log('trigger type is animation');
            const animation_target = APP.getString(imageButton.triggerTarget[entity]);
            const animation_value = APP.getString(imageButton.triggerValue[entity]);
            const animation_name = APP.getString(imageButton.triggerName[entity]);
            break;
    }
}

function handleActionsAfterClick(
    actionsAfterClick: any,
    actionsData: any,
    entity: number,
    world: HubsWorld
) {
    // Ensure actionsAfterClick is an array
    if (!Array.isArray(actionsAfterClick)) {
        console.error(
            "Invalid actionsAfterClick type. Expected an array:",
            actionsAfterClick
        );
        return;
    }

    // Iterate through the actions array
    actionsAfterClick.forEach(action => {
        // Validate action structure
        if (!action || typeof action.value !== "number") {
            console.warn("Invalid action object:", action);
            return;
        }

        // Process actions based on their value
        switch (action.value) {
            case 1: // Hide
                console.log("Action: Hide");
                const currentButton = world.eid2obj.get(entity);
                if (currentButton) {
                    currentButton.visible = false;
                } else {
                    console.error(`Button with entity ID ${entity} is undefined.`);
                }
                break;

            case 2: // Animation
                console.log("Action: Animation");
                const { animationName, animationTarget, animationValue } = actionsData;

                if (!animationName || !animationTarget || !animationValue) {
                    console.error("Missing animation data:", actionsData);
                    return;
                }

                // TODO: Implement animation logic
                break;

            case 3: // Audio
                console.log("Action: Audio");
                const { audio } = actionsData;

                if (!audio) {
                    console.error("Missing audio data:", actionsData);
                    return;
                }

                try {
                    // Stop the currently playing audio (if any)
                    if (currentAudio) {
                        console.log("Stopping currently playing audio.");
                        currentAudio.pause();
                        currentAudio.currentTime = 0; // Reset to the beginning
                    }

                    // Create a new audio instance
                    const audioElement = new Audio(audio);

                    // Optionally, configure audio properties
                    audioElement.volume = 1.0; // Full volume
                    audioElement.loop = false; // Set loop if needed

                    // Assign the new audio to the currentAudio reference
                    currentAudio = audioElement;

                    // Play the new audio
                    audioElement.play()
                        .then(() => console.log("Audio is playing:", audio))
                        .catch(error => console.error("Failed to play audio:", error));

                    // Listen for the 'ended' event to clear the reference when the audio finishes
                    audioElement.addEventListener("ended", () => {
                        console.log("Audio playback finished.");
                        if (currentAudio === audioElement) {
                            currentAudio = null; // Clear the reference
                        }
                    });
                } catch (error) {
                    console.error("Error playing audio:", error);
                }
                break;

            default:
                console.warn(`Unhandled action value: ${action.value}`);
        }
    });
}

export function ImageButtonSystem(world: HubsWorld) {
    // Store all scenario buttons
    const myButtonEid = anyEntityWith(world, imageButton);
    if (myButtonEid === null) {
        return;
    }

    const entered = ImageButtonEnterQuery(world);
    for (const entity of entered) {
        const data = getImageButtonData(entity);
        if (data.triggerType === "scenario") {
            if (typeof data.triggerValue === 'string') {
                scenarioButtons.set(entity, parseInt(data.triggerValue, 10)); // Save entity with its triggerValue
            } else {
                console.error('Invalid triggerValue:', data.triggerValue);
            }
        }
        logImageButtonData('Image Button System', entity, data);
    }

    const exited = ImageButtonExitQuery(world);
    for (const entity of exited) {
        const href = APP.getString(imageButton.href[entity]);
        logImageButtonData('exited', entity, { href });
    }

    const entities = ImageButtonQuery(world);
    for (const entity of entities) {
        const data = getImageButtonData(entity);
        if (clicked(world, entity)) {
            logImageButtonData('clicked', entity, { href: data.href });
            if (data.triggerType) {
                handleTriggerType(data.triggerType, entity);
                if (data.triggerType === "scenario") {
                    console.log(`Scenario button clicked: Entity ${entity}, Value: ${data.triggerValue}`);

                    // Find the button with `triggerValue + 1`
                    const nextTriggerValue = parseInt(data.triggerValue || '0', 10) + 1;
                    const nextScenarioEntity = Array.from(scenarioButtons.entries())
                        .find(([_, value]) => value === nextTriggerValue)?.[0];

                    if (nextScenarioEntity) {
                        console.log(`Enabling scenario button: Entity ${nextScenarioEntity}, Value: ${nextTriggerValue}`);
                        // Implement enabling logic for the button here
                        enableScenarioButton(world, nextScenarioEntity);
                    } else {
                        console.warn(`No button found with triggerValue: ${nextTriggerValue}`);
                    }
                }
            }
            if (data.actionsAfterClick) {
                console.log('actionsAfterClick', data.actionsAfterClick);
                handleActionsAfterClick(data.actionsAfterClick, data.actionsData, entity, world);
            }
        }
    }
}

/**
 * Enable the scenario button.
 * @param {HubsWorld} world - The current world instance.
 * @param {number} entity - The entity ID of the button to enable.
 */
function enableScenarioButton(world: HubsWorld, entity: number) {
    // Implement the enabling logic
    // Example: Mark the button as enabled or visible
    console.log(`Scenario button ${entity} is now enabled.`);
    const button = world.eid2obj.get(entity);
    if (button) {
        button.visible = true;
    } else {
        console.error(`Button with entity ID ${entity} is undefined.`);
    }
}