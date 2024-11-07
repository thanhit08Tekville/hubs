import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";
import { ReactComponent as ShowIcon } from "../icons/Show.svg";
import { ReactComponent as PinIcon } from "../icons/Pin.svg";
import { isLocalHubsUrl, isHubsRoomUrl } from "../../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../../utils/vr-interstitial";
import TekvilleMetaverMain_Ex from "../../assets/images/minimap/TekvilleMetaverMain_Ex.png";
import { changeHub } from "../../change-hub";

// Get the current user head position
export async function getUserHeadPosition() {
    const user = document.querySelector("#avatar-rig");
    if (!user) return { x: 0, y: 0, z: 0 };
    const position = user.object3D.position;
    return { x: position.x, y: position.y, z: position.z };
}

async function changeRoom(linkUrl) {
    if (!linkUrl) return;

    const cur_url = window.location.href;
    linkUrl = cur_url + linkUrl;
    const currnetHubId = await isHubsRoomUrl(window.location.href);
    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => {}, true);
    let gotoHubId;
    
    if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
        const url = new URL(linkUrl);
        if (currnetHubId === gotoHubId && url.hash) {
            window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
        } else if (await isLocalHubsUrl(linkUrl)) {
            let waypoint = url.hash ? url.hash.substring(1) : "";
            changeHub(gotoHubId, true, waypoint);
        } else {
            await exitImmersive();
            location.href = linkUrl;
        }
    }
}

export function MiniMapModal({ onClose }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [userPosition2D, setUserPosition2D] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    const miniMapSize = 180;
    const worldBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };

    const convertWorldToMiniMap = (worldPosition) => {
        const scaleX = miniMapSize / (worldBounds.maxX - worldBounds.minX);
        const scaleY = miniMapSize / (worldBounds.maxZ - worldBounds.minZ);

        const posX = (worldPosition.x - worldBounds.minX) * scaleX;
        const posY = (worldPosition.z - worldBounds.minZ) * scaleY;

        return { x: posX, y: posY };
    };

    useEffect(() => {
        const updateUserPosition = async () => {
            const user3DPosition = await getUserHeadPosition();
            const user2DPosition = convertWorldToMiniMap(user3DPosition);

            // Only update if the position has changed to prevent infinite loop
            if (
                user2DPosition.x !== userPosition2D.x ||
                user2DPosition.y !== userPosition2D.y
            ) {
                setUserPosition2D(user2DPosition);
            }
        };

        const interval = setInterval(updateUserPosition, 1000); // Update every second
        return () => clearInterval(interval);
    }, []); // Empty dependency array to run only once on mount

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const image = new Image();
        image.src = TekvilleMetaverMain_Ex;
        image.onload = () => {
            context.clearRect(0, 0, miniMapSize, miniMapSize);
            context.drawImage(image, 0, 0, miniMapSize, miniMapSize);

            // Draw the user's position as a red dot
            context.fillStyle = "red";
            context.beginPath();
            context.arc(userPosition2D.x, userPosition2D.y, 4, 0, Math.PI * 2);
            context.fill();
        };
    }, [userPosition2D]); // Only re-run when userPosition2D changes

    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setMousePosition({ x: Math.round(x), y: Math.round(y) });
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: 15,
            right: 15,
            width: '250px',
            height: '250px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
        }}>
            {/* Minimap Canvas */}
            <canvas
                ref={canvasRef}
                width={miniMapSize}
                height={miniMapSize}
                onClick={handleCanvasClick}
                style={{
                    width: `${miniMapSize}px`,
                    height: `${miniMapSize}px`,
                    borderRadius: '4px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <ToolbarButton
                icon={<LeaveIcon />}
                preset={"accent2"}
                onClick={onClose}
                style={{ position: 'absolute', top: 10, left: 10 }}
                small={true}
            />            

            {/* Buttons at the Bottom */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '5px'
            }}>
                <ToolbarButton
                    icon={<ShowIcon />}
                    preset={"accept"}
                    onClick={() => changeRoom('#WayPoint02')}
                    style={{ flex: 1, marginRight: '5px' }}
                    small={true}
                />
                <ToolbarButton
                    icon={<ShowIcon />}
                    preset={"accept"}
                    onClick={() => changeRoom('#WayPoint03')}
                    style={{ flex: 1 }}
                    small={true}
                />
                <ToolbarButton
                    icon={<PinIcon />}
                    preset={"accept"}
                    onClick={() => changeRoom('#WayPoint01')}
                    style={{ flex: 1, marginLeft: '5px' }}
                    small={true}
                />
            </div>
        </div>
    );
}

MiniMapModal.propTypes = {
    onClose: PropTypes.func.isRequired
};
