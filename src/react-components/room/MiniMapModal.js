import React, { useState } from "react";
import PropTypes from "prop-types";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";
import { ReactComponent as ShowIcon } from "../icons/Show.svg";
import { ReactComponent as PinIcon } from "../icons/Pin.svg";
import { isLocalHubsUrl, isHubsRoomUrl } from "../../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../../utils/vr-interstitial";
import TekvilleMetaverMain_Ex from "../../assets/images/minimap/TekvilleMetaverMain_Ex.png";
import { changeHub } from "../../change-hub";

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

    const handleMapClick = (event) => {
        const mapRect = event.target.getBoundingClientRect();
        const centerX = mapRect.width / 2;
        const centerY = mapRect.height / 2;

        const x = event.clientX - mapRect.left - centerX;
        const y = event.clientY - mapRect.top - centerY;

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
            {/* Minimap Picture */}
            <div 
                id='map'
                style={{
                    width: '180px',
                    height: '180px',
                    backgroundImage: `url(${TekvilleMetaverMain_Ex})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                }}
                onClick={handleMapClick}
            >
                <ToolbarButton
                    icon={<LeaveIcon />}
                    preset={"accent2"}
                    onClick={onClose}
                    style={{ position: 'absolute', top: 10, left: 10 }}
                    small={true}
                />
            </div>

            {/* Display Mouse Position */}
            <div style={{ marginTop: '10px' }}>
                Mouse Position: ({mousePosition.x}, {mousePosition.y})
            </div>

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
