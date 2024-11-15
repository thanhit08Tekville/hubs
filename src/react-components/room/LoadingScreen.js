import React from "react";
import PropTypes from "prop-types";
import { LoadingScreenLayout } from "../layout/LoadingScreenLayout";
import { Spinner } from "../misc/Spinner";
import { useRandomMessageTransition } from "./hooks/useRandomMessageTransition";
import styles from "../layout/LoadingScreenLayout.scss";
import tekvilleHowToControlImgPc from "../../assets/images/tips3.gif";
import tekvilleHowToControlImgSp from "../../assets/images/tips3.gif";
export function LoadingScreen({ message, infoMessages }) {
  const infoMessage = useRandomMessageTransition(infoMessages);
  return (
    // This is a layout component that positions the spinner and info message in the center of the loading screen
    <LoadingScreenLayout
      center={
        <>
          <div className={styles.tekvilleLoadingMessageWrap}>
            <div className={styles.tekvilleSpinnerWrap}>
              <Spinner />
            </div>
            <p>{message}</p>
          </div>
          <img
            src={window.ontouchstart === null ? tekvilleHowToControlImgSp : tekvilleHowToControlImgPc}
            className={styles.tekvilleHowToControl}
            alt={"how to control"}
          />
        </>
      }
      bottom={
        <>
          <h3>{infoMessage.heading}</h3>
          <p>{infoMessage.message}</p>
        </>
      }
    />
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.node,
  infoMessages: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.node.isRequired,
      message: PropTypes.node.isRequired
    })
  )
};

LoadingScreen.defaultProps = {
  infoMessages: []
};
