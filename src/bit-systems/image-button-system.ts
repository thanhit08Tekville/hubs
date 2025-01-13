import { HubsWorld } from "../app";
import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
} from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";
import { Interacted, imageButton } from "../bit-components";

// Queries for handling entity lifecycle
const ImageButtonQuery = defineQuery([imageButton]);
const ImageButtonEnterQuery = enterQuery(ImageButtonQuery);
const ImageButtonExitQuery = exitQuery(ImageButtonQuery);

// Scenario buttons and audio state
const scenarioButtons: Map<number, number> = new Map();
let currentAudio: HTMLAudioElement | null = null;

/**
 * Check if an entity has been clicked.
 * @param {HubsWorld} world - The current world instance.
 * @param {number} entity - The entity ID.
 * @returns {boolean} - True if the entity is clicked, false otherwise.
 */
function clicked(world: HubsWorld, entity: number): boolean {
  return hasComponent(world, Interacted, entity);
}

/**
 * Retrieve image button data for the given entity.
 * @param {number} entity - The entity ID.
 * @returns {object} - Data associated with the image button.
 */
function getImageButtonData(entity: number) {
  return {
    href: APP.getString(imageButton.href[entity]),
    triggerType: APP.getString(imageButton.triggerType[entity]),
    triggerTarget: APP.getString(imageButton.triggerTarget[entity]),
    triggerName: APP.getString(imageButton.triggerName[entity]),
    triggerValue: APP.getString(imageButton.triggerValue[entity]),
    actionsAfterClick: APP.getString(imageButton.actionsAfterClick[entity]),
    actionsData: APP.getString(imageButton.actionsData[entity]),
  };
}

/**
 * Log image button data for debugging.
 * @param {string} prefix - The log message prefix.
 * @param {number} entity - The entity ID.
 * @param {any} data - The data to log.
 */
function logImageButtonData(prefix: string, entity: number, data: any) {
  console.log(`${prefix}`, { entity, ...data });
}

/**
 * Handle the trigger type for an image button.
 * @param {string} triggerType - The trigger type (e.g., "scenario", "link").
 * @param {number} entity - The entity ID.
 */
function handleTriggerType(triggerType: string, entity: number) {
  console.log(`Trigger type: ${triggerType}`);
  switch (triggerType) {
    case "scenario":
      console.log(
        `Scenario target: ${APP.getString(
          imageButton.triggerTarget[entity]
        )}, value: ${APP.getString(imageButton.triggerValue[entity])}`
      );
      break;
    case "link":
    case "iframe":
      console.log(
        `Link/iframe href: ${APP.getString(imageButton.href[entity])}`
      );
      break;
    case "animation":
      console.log(
        `Animation target: ${APP.getString(
          imageButton.triggerTarget[entity]
        )}, name: ${APP.getString(
          imageButton.triggerName[entity]
        )}, value: ${APP.getString(imageButton.triggerValue[entity])}`
      );
      break;
  }
}

/**
 * Handle post-click actions for an image button.
 * @param {any[]} actionsAfterClick - List of actions to process.
 * @param {any} actionsData - Data for actions.
 * @param {number} entity - The entity ID.
 * @param {HubsWorld} world - The current world instance.
 */
function handleActionsAfterClick(
  actionsAfterClick: any[],
  actionsData: any,
  entity: number,
  world: HubsWorld
) {
  if (!Array.isArray(actionsAfterClick)) {
    console.error("Invalid actionsAfterClick format:", actionsAfterClick);
    return;
  }

  actionsAfterClick.forEach((action) => {
    if (!action || typeof action.value !== "number") {
      console.warn("Invalid action object:", action);
      return;
    }

    switch (action.value) {
      case 1: // Hide
        const button = world.eid2obj.get(entity);
        if (button) button.visible = false;
        else console.error(`Button with entity ${entity} not found.`);
        break;

      case 2: // Animation
        const { animationName, animationTarget, animationValue } = actionsData;
        if (animationName && animationTarget && animationValue) {
          console.log("Playing animation:", {
            animationName,
            animationTarget,
            animationValue,
          });
        } else console.error("Missing animation data:", actionsData);
        break;

      case 3: // Audio
        handleAudioAction(actionsData.audio);
        break;

      default:
        console.warn(`Unhandled action value: ${action.value}`);
    }
  });
}

/**
 * Play audio for the specified URL, stopping any currently playing audio.
 * @param {string} audioUrl - The URL of the audio to play.
 */
function handleAudioAction(audioUrl: string) {
  if (!audioUrl) {
    console.error("Missing audio URL.");
    return;
  }

  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audioElement = new Audio(audioUrl);
    audioElement.volume = 1.0;
    audioElement.play()
      .then(() => console.log("Audio is playing:", audioUrl))
      .catch((error) => console.error("Audio playback error:", error));

    currentAudio = audioElement;
    audioElement.addEventListener("ended", () => {
      if (currentAudio === audioElement) currentAudio = null;
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}

/**
 * Enable the specified scenario button.
 * @param {HubsWorld} world - The current world instance.
 * @param {number} entity - The entity ID of the button to enable.
 */
function enableScenarioButton(world: HubsWorld, entity: number) {
  console.log(`Enabling scenario button ${entity}`);
  const button = world.eid2obj.get(entity);
  if (button) button.visible = true;
  else console.error(`Button with entity ${entity} not found.`);
}

/**
 * Main system for handling image buttons.
 * @param {HubsWorld} world - The current world instance.
 */
export function ImageButtonSystem(world: HubsWorld) {
  const entered = ImageButtonEnterQuery(world);
  entered.forEach((entity) => {
    const data = getImageButtonData(entity);
    if (data.triggerType === "scenario" && typeof data.triggerValue === "string") {
      scenarioButtons.set(entity, parseInt(data.triggerValue, 10));
    }
    logImageButtonData("Entered", entity, data);
  });

  const exited = ImageButtonExitQuery(world);
  exited.forEach((entity) => {
    const href = APP.getString(imageButton.href[entity]);
    logImageButtonData("Exited", entity, { href });
  });

  const entities = ImageButtonQuery(world);
  entities.forEach((entity) => {
    const data = getImageButtonData(entity);
    if (clicked(world, entity)) {
      logImageButtonData("Clicked", entity, data);
      if (typeof data.triggerType === 'string') {
        handleTriggerType(data.triggerType, entity);
      } else {
        console.error(`Invalid triggerType for entity ${entity}:`, data.triggerType);
      }
      if (data.triggerType === "scenario") {
        const nextValue = parseInt(data.triggerValue || "0", 10) + 1;
        const nextEntity = Array.from(scenarioButtons.entries()).find(
          ([_, value]) => value === nextValue
        )?.[0];
        if (nextEntity) enableScenarioButton(world, nextEntity);
      }
      if (Array.isArray(data.actionsAfterClick)) {
        handleActionsAfterClick(data.actionsAfterClick, data.actionsData, entity, world);
      } else {
        console.error(`Invalid actionsAfterClick for entity ${entity}:`, data.actionsAfterClick);
      }
    }
  });
}
