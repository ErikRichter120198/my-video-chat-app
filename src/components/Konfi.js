// Buttons.js

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, disabled, children, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const ChatButton = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="chat-button">
      Chat
    </Button>
  );
};

ChatButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const MuteButton = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="mute-button">
      Mute
    </Button>
  );
};

MuteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const CameraOffButton = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="camera-off-button">
      Kamera aus
    </Button>
  );
};

CameraOffButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const EmojisButton = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="emojis-button">
      Emojis
    </Button>
  );
};

EmojisButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export { ChatButton, MuteButton, CameraOffButton, EmojisButton };
