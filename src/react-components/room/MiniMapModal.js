import React from "react";
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
    if (linkUrl == null || linkUrl == undefined) {
        return;
    }
    // Get current url
    const cur_url = window.location.href;
    linkUrl = cur_url + linkUrl;
    const currnetHubId = await isHubsRoomUrl(window.location.href);
    //console.log("currnet HubId :", currnetHubId);
    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => { }, true);
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
export function MiniMapModal({ onClose, json }) {    
    return (
        <div style={{
            position: 'absolute',
            bottom: 15,
            right: 15,
            width: '250px',
            height: '250px',
            backgroundColor: '#f0f0f0', // Optional: light background color
            borderRadius: '8px',         // Optional: rounded corners
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: shadow for better visibility
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
        }}>
            {/* Minimap Picture */}
            <div id='map' style={{
                width: '180px',
                height: '180px',
                backgroundImage: 'url(' + TekvilleMetaverMain_Ex+ ')', // Replace with the actual image path
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '4px',
            }}>
                <ToolbarButton
                    icon={<LeaveIcon />}
                    preset={"accent2"}
                    onClick={onClose}
                    style={{ position: 'absolute', top: 10, left: 10 }}
                />
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
                    onClick={() => changeRoom('#WayPoint02')} // Optional: Add functionality
                    style={{ flex: 1, marginRight: '5px' }}
                />
                <ToolbarButton
                    icon={<ShowIcon />}
                    preset={"accept"}
                    onClick={() => changeRoom('#WayPoint03')} // Optional: Add functionality
                    style={{ flex: 1 }}
                />
                <ToolbarButton
                    icon={<PinIcon />}
                    preset={"accept"}
                    onClick={() => changeRoom('#WayPoint01')} // Optional: Add functionality
                    style={{ flex: 1, marginLeft: '5px' }}
                />
            </div>
        </div>
    );
}
MiniMapModal.propTypes = {
    onClose: PropTypes.func.isRequired
};