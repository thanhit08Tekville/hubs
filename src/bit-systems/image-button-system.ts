import { HubsWorld } from "../app";
import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
} from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";
import { Interacted, imageButton, imageButtonNetworkedData } from "../bit-components";
import { takeOwnership } from "../utils/take-ownership";
import { createNetworkedEntity } from "../hubs";
import { findAncestorWithComponent } from "../utils/scene-graph";
import { AElement } from "aframe";

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
    clicked: APP.getString(imageButton.clicked[entity]),
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

function copyDataToNetworkedEntity(data: any, networkedId: number) {
  if (data.href) {
    imageButtonNetworkedData.href[networkedId] = APP.getSid(data.href);
  } else {
    console.error(`Invalid href for entity ${networkedId}:`, data.href);
  }

  if (data.triggerType) {
    imageButtonNetworkedData.triggerType[networkedId] = APP.getSid(data.triggerType);
  } else {
    console.error(`Invalid triggerType for entity ${networkedId}:`, data.triggerType);
  }

  if (data.triggerTarget) {
    imageButtonNetworkedData.triggerTarget[networkedId] = APP.getSid(data.triggerTarget);
  } else {
    console.error(`Invalid triggerTarget for entity ${networkedId}:`, data.triggerTarget);
  }

  if (data.triggerName) {
    imageButtonNetworkedData.triggerName[networkedId] = APP.getSid(data.triggerName);
  } else {
    console.error(`Invalid triggerName for entity ${networkedId}:`, data.triggerName);
  }

  if (data.triggerValue) {
    imageButtonNetworkedData.triggerValue[networkedId] = APP.getSid(data.triggerValue);
  } else {
    console.error(`Invalid triggerValue for entity ${networkedId}:`, data.triggerValue);
  }

  if (data.actionsAfterClick) {
    imageButtonNetworkedData.actionsAfterClick[networkedId] = APP.getSid(data.actionsAfterClick);
  } else {
    console.error(`Invalid actionsAfterClick for entity ${networkedId}:`, data.actionsAfterClick);
  }

  if (data.actionsData) {
    imageButtonNetworkedData.actionsData[networkedId] = APP.getSid(data.actionsData);
  } else {
    console.error(`Invalid actionsData for entity ${networkedId}:`, data.actionsData);
  }
}

function handleAnimationAction(
  animationName: string, // The name of the animation clip
  animationTarget: string, // The target object to animate
  animationValue: string, // The animation value (e.g., "play", "stop", "loop")
  callback: () => void
) {
  console.log("Playing animation:", {
    animationName,
    animationTarget,
    animationValue,
  });

  const environmentScene = (document.querySelector("#environment-scene") as AElement)?.object3D?.children[0];
  if (environmentScene && environmentScene.el) {
    const animationMixer = findAncestorWithComponent(environmentScene.el, "animation-mixer");
    if (!animationMixer) {
      console.error("Animation mixer not found.");
      return;
    }
    console.log("Animation mixer:", animationMixer);
    const { mixer, animations } = animationMixer.components["animation-mixer"];
    if (!mixer) {
      console.error("Animation mixer not found.");
      return;
    }

    if (!animations) {
      console.error("Animations not found.");
      return;
    }
    const targetObject = document.getElementsByClassName(animationTarget)[0];
    if (!targetObject) {
      console.error("Target object not found.");
      return;
    }

    // Find the animation clip by name
    const clip = animations.find((clip: THREE.AnimationClip) => clip.name === animationName);
    if (!clip) {
      console.error("Animation clip not found.");
      return;
    }
    // Create a new animation action
    const action = mixer.clipAction(clip, targetObject);

    if (animationValue === "play") {
      action.reset(); // Reset the animation
      action.setLoop(THREE.LoopOnce); // Play the animation once
      // Play the animation
      action.play();
    }

    if (animationValue === "stop") {
      action.stop();
    }
    if (animationValue === "loop") {
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
  }

  callback();
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
  world: HubsWorld,
  callback: () => void
) {
  if (!Array.isArray(actionsAfterClick)) {
    console.error("Invalid actionsAfterClick format:", actionsAfterClick);
    return;
  }

  // Count the number of pending actions
  let pendingActions = actionsAfterClick.length;

  // Callback to invoke when all actions are complete
  const actionComplete = () => {
    pendingActions -= 1;
    if (pendingActions === 0) {
      callback(); // Invoke the callback when all actions are finished
    }
  };

  actionsAfterClick.forEach((action) => {
    if (!action || typeof action.value !== "number") {
      console.warn("Invalid action object:", action);
      actionComplete(); // Consider invalid actions as completed
      return;
    }

    switch (action.value) {
      case 1: // Hide
        const button = world.eid2obj.get(entity);
        if (button) button.visible = false;
        else console.error(`Button with entity ${entity} not found.`);

        // Mark the action as complete
        actionComplete();
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
        // Play the animation and mark the action as complete
        handleAnimationAction(animationName, animationTarget, animationValue, actionComplete);
        break;

      case 3: // Audio
        // Do actionComplete() when the audio is finished playing
        handleAudioAction(actionsData.audio, actionComplete);
        break;

      default:
        console.warn(`Unhandled action value: ${action.value}`);
    }
  });
}
const tempAudio = ""
function playAudioString(audioUrl: string, callback: () => void) {
  if (currentAudio) {
    currentAudio.pause();
  }

  currentAudio = new Audio(audioUrl);
  currentAudio.play();
  currentAudio.onended = () => {
    callback();
  };
}
/**
 * Play audio for the specified URL, stopping any currently playing audio.
 * @param {string} audioUrl - The URL of the audio to play.
 */
function handleAudioAction(audioUrl: string, callback: () => void) {
  if (!audioUrl) {
    console.error("Missing audio URL.");
    return;
  }

  try {
    playAudioString(audioUrl, callback);
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

// let currentStep = 0;
// const listScenarioButtons: { [key: number]: number } = {};

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
    // Check if the entity has a networked entity
    let networkedId = anyEntityWith(world, imageButtonNetworkedData);
    // Retrieve image button data
    const data = getImageButtonData(entity);
    // Check if the button is clicked
    if (clicked(world, entity)) {
      // Log the clicked button data
      // logImageButtonData("Clicked", entity, data);
      // Mark the button as clicked
      imageButton.clicked[entity] = APP.getSid("true");
      // Handle the trigger type
      if (typeof data.triggerType === 'string') {
        handleTriggerType(data.triggerType, entity);
      } else {
        console.error(`Invalid triggerType for entity ${entity}:`, data.triggerType);
      }

      // Handle actionsAfterClick if it's an array of actions
      if (Array.isArray(data.actionsAfterClick)) {
        // Process the actions after the button is clicked
        handleActionsAfterClick(data.actionsAfterClick, data.actionsData, entity, world, () => {
          // Handle post-click actions
          if (data.triggerType === "scenario") {
            // Check if the triggerValue is a valid number
            const nextValue = parseInt(data.triggerValue || "-2", 10) + 1;
            // Find the next entity associated with nextValue
            const nextEntity = Array.from(scenarioButtons.entries()).find(
              ([_, value]) => value === nextValue
            )?.[0];
            // Enable the nextEntity button if it exists
            if (nextEntity) {
              enableScenarioButton(world, nextEntity);
            }
          }
        });
      } else {
        console.error(`Invalid actionsAfterClick for entity ${entity}:`, data.actionsAfterClick);
      }

      // Check if the entity has a networked entity
      if (!networkedId) {
        // Create a networked entity for the current entity
        createNetworkedEntity(world, "image-button-networked-data", {
          href: data.href,
          triggerType: data.triggerType,
          triggerTarget: data.triggerTarget,
          triggerName: data.triggerName,
          triggerValue: data.triggerValue,
          actionsAfterClick: data.actionsAfterClick,
          actionsData: data.actionsData,
        });
        // Retrieve the networked entity ID
        networkedId = anyEntityWith(world, imageButtonNetworkedData);
      }
      if (networkedId) {
        // Take ownership of the networked entity   
        takeOwnership(world, networkedId);
        // Copy data to the networked entity
        copyDataToNetworkedEntity(data, networkedId);
        // Mark the networked entity as clicked
        imageButtonNetworkedData.clicked[networkedId] = APP.getSid("true");
        // Set the networked entity target ID to the current entity
        imageButtonNetworkedData.entityTargetId[networkedId] = entity;
      } else {
        console.error(`Failed to create networked entity for image button ${entity}.`);
      }
    }

    if (networkedId) {
      // Retrieve networked entity data for the current entity ID
      const triggerType = APP.getString(imageButtonNetworkedData.triggerType[networkedId]); // Trigger type
      const isClicked = APP.getString(imageButtonNetworkedData.clicked[networkedId]); // Clicked state

      // Check if triggerType is "scenario" and the button is clicked
      if (triggerType !== "scenario" || isClicked !== "true") return;

      // Retrieve the triggerValue for the current entity
      const triggerData = APP.getString(imageButtonNetworkedData.triggerValue[networkedId]) || "-1";

      // Validate triggerData
      if (triggerData === "-1") {
        console.error(`Invalid triggerValue for entity ${entity}:`, triggerData);
        return;
      }

      // Retrieve the current value for the triggerData
      // If trigger type is "scenario", triggerData should be a number (scenario step)
      const currentValue = parseInt(triggerData, 10);

      if (currentValue < 0) {
        console.error(`Invalid triggerValue for entity ${entity}:`, currentValue);
        return;
      }

      // Disable all the scenario buttons before the current button
      scenarioButtons.forEach((step_value, key) => {
        if (step_value <= currentValue) {
          // Find the current entity associated with step_value
          const currentEntity = Array.from(scenarioButtons.entries()).find(
            ([_, value]) => value === step_value
          )?.[0];

          if (!currentEntity) return; // Exit if no currentEntity is found

          // Check if the currentEntity button is not clicked
          if (APP.getString(imageButton.clicked[currentEntity]) === "false") {
            if (!networkedId) {
              console.error(`Networked entity not found for entity ${entity}.`);
              return;
            }
            const actionsAfterClick = APP.getString(imageButtonNetworkedData.actionsAfterClick[networkedId]);

            // Handle actionsAfterClick if it's an array of actions
            if (Array.isArray(actionsAfterClick)) {
              // Retrieve actionsData for the current entity
              const actionsData = APP.getString(imageButtonNetworkedData.actionsData[networkedId]);
              // Process the actions after the button is clicked
              handleActionsAfterClick(actionsAfterClick, actionsData, currentEntity, world, () => {
                // Process the next button
                const nextValue = step_value + 1;
                // Find the next entity associated with nextValue
                const nextEntity = Array.from(scenarioButtons.entries()).find(
                  ([_, value]) => value === nextValue
                )?.[0];

                // Enable the nextEntity button if it exists and is not clicked
                if (nextEntity && APP.getString(imageButton.clicked[nextEntity]) === "false") {
                  // Enable the nextEntity button
                  const button = world.eid2obj.get(nextEntity);
                  // Check if the button is not visible
                  if (!button || !button.visible) {
                    // Enable the nextEntity button
                    enableScenarioButton(world, nextEntity);
                  }
                }
              });
            } else {
              console.error(`Invalid actionsAfterClick for entity ${entity}:`, actionsAfterClick);
            }
            // Mark the currentEntity button as clicked
            imageButton.clicked[currentEntity] = APP.getSid("true");
          }
        }
      });
    }
  });
}
