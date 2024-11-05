import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { MiniMapModal } from "./MiniMapModal";
let urlParams = {};
export function MiniMapModalContainer({ scene, json, onClose }) {
    const handleClose = useCallback(() => {        
        onClose();
    }, [onClose]);
    return <MiniMapModal onClose={handleClose} json={json} />;
}
MiniMapModalContainer.propTypes = {
    scene: PropTypes.object.isRequired,
    onClose: PropTypes.func
};