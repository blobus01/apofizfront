import React from 'react';
import Modal from 'react-modal';
import {mobileMenuStyles} from "../../../assets/styles/modal";

const MobileMenuLayer = props => {
  const {isOpen, onRequestClose, onClose, style = mobileMenuStyles, children, ...other} = props
  React.useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = 'unset' }
    return () => document.body.style.overflow = 'unset'
  }, [ isOpen ]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onClose={onClose}
      style={style}
      appElement={document.getElementById("root")}
      {...other}
    >
      <div className="container">
        {children}
      </div>
    </Modal>
  );
};

export default MobileMenuLayer;