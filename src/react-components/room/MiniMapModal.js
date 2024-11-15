import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";
import { isLocalHubsUrl, isHubsRoomUrl } from "../../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../../utils/vr-interstitial";
import { changeHub } from "../../change-hub";
import { set } from "react-hook-form";

// async function changeRoom(linkUrl) {
//     if (!linkUrl) return;

//     // const cur_url = window.location.href;
//     // const orgin = cur_url.split("#")[0];
//     // linkUrl = orgin + linkUrl;
//     const currnetHubId = await isHubsRoomUrl(window.location.href);
//     const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => { }, true);
//     let gotoHubId;

//     if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
//         const url = new URL(linkUrl);
//         if (currnetHubId === gotoHubId && url.hash) {
//             window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
//         } else if (await isLocalHubsUrl(linkUrl)) {
//             let waypoint = url.hash ? url.hash.substring(1) : "";
//             changeHub(gotoHubId, true, waypoint);
//         } else {
//             await exitImmersive();
//             location.href = linkUrl;
//         }
//     }
// }

async function changeRoom(linkUrl) {
    if (linkUrl == null || linkUrl == undefined) {
        return;
    }

    const currnetHubId = await isHubsRoomUrl(window.location.href);
    //console.log("currnet HubId :", currnetHubId);

    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => {}, true);

    let gotoHubId;
    // URL이 허브 룸인지 확인
    if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
        //console.log("go to HubId", gotoHubId);
        const url = new URL(linkUrl);
        if (currnetHubId === gotoHubId && url.hash) {
            // 같은 방에서 Way Point으로 이동할 경우
            window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
        } else if (await isLocalHubsUrl(linkUrl)) {
            // 같은 도메인에 있는 허브 경로일 경우
            let waypoint = "";
            if (url.hash) {
                waypoint = url.hash.substring(1);
            }
            // 페이지 로드 또는 입장 진행 없이 새 방으로
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
        // const fetchWaypoints = async () => {
        //     // Replace with actual query logic to get waypoint entities in the scene
        //     const waypointEntities = document.querySelectorAll("[waypoint]"); // Assuming waypoints have `data-waypoint` attribute

        //     const waypointList = Array.from(waypointEntities).map(entity => ({
        //         id: entity.eid,
        //         name: entity.className, // Replace with actual waypoint name
        //     }));

        //     setWaypoints(waypointList);
        // };

        const waypointList = [
            {
                id: 1,
                name: "Room 01",
                url: "https://143.198.201.239:4000/HHU92Ye/default"
            },
            {
                id: 2,
                name: "Room 02",
                url: "https://143.198.201.239:4000/hTWFc3r/abc"
            },
            {
                id: 3,
                name: "Room 03",
                url: "https://143.198.201.239:4000/Da7BHr7/bronze-superb-area"
            }

        ];
        setWaypoints(waypointList);

        // fetchWaypoints();
    }, []);

    const handleWaypointChange = (event) => {
        const selectedValue = event.target.value;
        changeRoom(selectedValue);  // Navigate to the selected waypoint
    };

    return (
        <div style={{ position: 'relative', width: '80%', height: '80%', backgroundColor: "white" }}>
            <ToolbarButton
                icon={<LeaveIcon />}
                preset={"accent2"}
                onClick={onClose}
                style={{ position: 'absolute', top: 15, left: 15 }}
            />
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
            <div className="custom-select-container">
                <select id="customSelect" className="custom-select" onChange={handleWaypointChange}>
                    <option value="" disabled>Select a waypoint</option>
                    {waypoints.map(waypoint => (
                        // <option key={waypoint.id} value={`#${waypoint.name}`}>
                        <option key={waypoint.id} value={waypoint.url}>
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
