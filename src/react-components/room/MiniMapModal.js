import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";
import { isLocalHubsUrl, isHubsRoomUrl } from "../../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../../utils/vr-interstitial";
import { changeHub } from "../../change-hub";

async function changeRoom(linkUrl) {
    if (!linkUrl) return;

    const cur_url = window.location.href;
    const orgin = cur_url.split("#")[0];
    linkUrl = orgin + linkUrl;
    const currnetHubId = await isHubsRoomUrl(window.location.href);
    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => { }, true);
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
    const miniMapSize = 180;
    const [waypoints, setWaypoints] = useState([]);

    useEffect(() => {
        // Fetch waypoints from the scene
        const fetchWaypoints = async () => {
            // Replace with actual query logic to get waypoint entities in the scene
            const waypointEntities = document.querySelectorAll("[waypoint]"); // Assuming waypoints have `data-waypoint` attribute
            
            const waypointList = Array.from(waypointEntities).map(entity => ({
                id: entity.eid,
                name: entity.className, // Replace with actual waypoint name
            }));

            setWaypoints(waypointList);
        };

        fetchWaypoints();
    }, []);

    const handleWaypointChange = (event) => {
        const selectedValue = event.target.value;
        changeRoom(selectedValue);  // Navigate to the selected waypoint
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
                width={miniMapSize}
                height={miniMapSize}
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
            <div className="custom-select-container">
                <select id="customSelect" className="custom-select" onChange={handleWaypointChange}>
                    <option value="" disabled>Select a waypoint</option>
                    {waypoints.map(waypoint => (
                        <option key={waypoint.id} value={`#${waypoint.name}`}>
                            {waypoint.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

MiniMapModal.propTypes = {
    onClose: PropTypes.func.isRequired
};
