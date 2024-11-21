import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ReactComponent as UploadIcon } from "../icons/Upload.svg";
import { AnimationReactionPopover } from "./AnimationReactionPopover";
import { FormattedMessage } from "react-intl";

export function AnimationReactionPopoverContainer({ scene, hubChannel }) {
    const [items, setItems] = useState([]);
    const [reacted, setReacted] = useState(false);

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

        hubChannel.addEventListener("permissions_updated", updateItems);

        updateItems();

        return () => {
            hubChannel.removeEventListener("permissions_updated", updateItems);
        };
    }, [hubChannel, scene, reacted]);

    return <AnimationReactionPopover items={items} />;
}

AnimationReactionPopoverContainer.propTypes = {
    hubChannel: PropTypes.object.isRequired,
    scene: PropTypes.object.isRequired,
};
