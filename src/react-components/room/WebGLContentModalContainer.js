import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { WebGLContentModal } from "./WebGLContentModal";

let urlParams = {};
export function WebGLContentModalContainer({ scene, url, onClose }) {    
    urlParams = {};
    // const endpoint = 'http://metatrack_xapi.tubeai.co.kr/xApi/';
    const endpoint = 'https://metatrack-xapi.tubeai.co.kr/xApi/';
    // const initialRequestURL = 'eventdata/practice/initialized';
    const initialRequestURL = 'eventdata/practice/initialized';
    // const terminateRequestURL = 'eventdata/practice/terminated';
    const terminateRequestURL = 'eventdata/practice/terminated';
    // Global variables to store URL parameters
    
    getUrlParams();
    if (localStorage.getItem('userId')) {
        urlParams['userId'] = localStorage.getItem('userId');
    }
    
    if (localStorage.getItem('courseId')) {
        urlParams['courseId'] = localStorage.getItem('courseId');
    }

    if (localStorage.getItem('sessionId')) {
        urlParams['sessionId'] = localStorage.getItem('sessionId');
    }

    let contentId = '';
    // The website url is https://hostname/contentId/contentName
    // Get contentId from url
    const urlURL = new URL(url);
    const pathSegments = urlURL.pathname.split('/');
    contentId = pathSegments[1] + '_' + pathSegments[2];
    if (contentId) {
        urlParams['contentId'] = contentId;
        urlParams['contentName'] = contentId;
    }
    const homepage = 'meta2.teacherville.co.kr';
    urlParams['homepage'] = homepage;    
    urlParams['startTime'] = new Date().toISOString();
    const input = {
        homepage: urlParams['homepage'] ? urlParams['homepage'] : '',
        userId: urlParams['userId'] ? urlParams['userId'] : '',
        courseId: urlParams['courseId'] ? urlParams['courseId'] : '',
        sessionId: urlParams['sessionId'] ? urlParams['sessionId'] : '',
        contentId: urlParams['contentId'] ? urlParams['contentId'] : '',
        contentName: urlParams['contentName'] ? urlParams['contentName'] : '',
        duration: 0,
    }
    sendPostRequest(endpoint + initialRequestURL, input);

    const handleClose = useCallback(() => {
        console.log("User closed the iframe");
        // Send to API
        urlParams['endTime'] = new Date().toISOString();
        urlParams['duration'] = (new Date(urlParams['endTime']) - new Date(urlParams['startTime'])) / 1000;
        const input = {
            homepage: urlParams['homepage'] ? urlParams['homepage'] : '',
            userId: urlParams['userId'] ? urlParams['userId'] : '',
            courseId: urlParams['courseId'] ? urlParams['courseId'] : '',
            sessionId: urlParams['sessionId'] ? urlParams['sessionId'] : '',
            contentId: urlParams['contentId'] ? urlParams['contentId'] : '',
            contentName: urlParams['contentName'] ? urlParams['contentName'] : '',
            duration: urlParams['duration'] ? urlParams['duration'] : 0,
        }
        sendPostRequest(endpoint + terminateRequestURL, input);
        onClose();
    }, [onClose]);

    return <WebGLContentModal onClose={handleClose} url={url} />;
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        urlParams[key] = value;
    });
}

function sendPostRequest(serverUrl, input) {
    input.duration = Math.round(input.duration);
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(
            {
                homepage: input.homepage,
                userId: input.userId,
                courseId: input.courseId,
                sessionId: input.sessionId,
                contentId: input.contentId,
                contentName: input.contentName,
                duration: input.duration,
            })
    })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
}

WebGLContentModalContainer.propTypes = {
    scene: PropTypes.object.isRequired,
    onClose: PropTypes.func
};