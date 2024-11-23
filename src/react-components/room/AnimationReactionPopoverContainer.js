import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ReactComponent as UploadIcon } from "../icons/Upload.svg";
import { AnimationReactionPopover } from "./AnimationReactionPopover";
import { FormattedMessage } from "react-intl";

export function AnimationReactionPopoverContainer({ scene, hubChannel }) {
    const [items, setItems] = useState([]);
    const [reacted, setReacted] = useState(false);

    // Broadcast the animation to all users in the room to play the animation reaction
    const broadcastAnimation = (animationName) => {
        window.dispatchEvent(new CustomEvent("start-animation", { detail: { animationName: animationName } }));
    };

    const playAnimation = (animationName) => {
        const avatarRoot = document.querySelectorAll("[fullbody-animation-play]");
        let status = true;
        if (avatarRoot.length > 0) {
            if (reacted) {
                animationName = "Idle";
            }
            status = avatarRoot[0].components["fullbody-animation-play"].playAnimation(animationName);
            console.log("Playing animation: ", scene);
        }

        if (!status) {            
            return;
        } else {
            setReacted(!reacted);
            // Broadcast the animation to all users in the room to play the animation reaction
            broadcastAnimation(animationName);
        }
    };

    useEffect(() => {
        function updateItems() {

            let nextItems = [
            ];

            nextItems = [
                ...nextItems,
                {
                    id: "reaction-animation-01",
                    icon: UploadIcon,
                    color: "accent3",
                    label: <FormattedMessage id="animation-popover.item-type.greeting" defaultMessage="Greeting" />,
                    onSelect: () => playAnimation("A0_Waving"),
                    selected: reacted
                }
            ];


            setItems(nextItems);
        }

        // Create a function to handle the animation message
        // const handleAnimationMessage = (message) => {
        //     if (message.type === "animation") {
        //         playAnimation(message.animationName);
        //     }
        // };

        hubChannel.addEventListener("permissions_updated", updateItems);
        // Listen for messages from the hub
        // hubChannel.addEventListener("message", handleAnimationMessage);

        updateItems();

        return () => {
            hubChannel.removeEventListener("permissions_updated", updateItems);
            // Remove the event listener when the component is unmounted
            // hubChannel.removeEventListener("message", handleAnimationMessage);
        };
    }, [hubChannel, scene, reacted]);

    return <AnimationReactionPopover items={items} />;
}

AnimationReactionPopoverContainer.propTypes = {
    hubChannel: PropTypes.object.isRequired,
    scene: PropTypes.object.isRequired,
};
