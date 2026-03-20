import React, {useEffect, useRef, useState} from 'react';
import './index.scss';
import classnames from "classnames";

const Dialog = ({title, description, open, buttons, className}) => {
  const [render, setRender] = useState(false);

  const modal = useRef(null);

  useEffect(() => {
    let current = modal.current;

    const handler = () => {
      if (!open) {
        setRender(false);
        document.body.style.overflow = 'unset';
      }
    }

    document.body.style.overflow = 'hidden';

    setRender(true);

    if (current) {
      current.firstChild.addEventListener('animationend', handler);
    }

    return () => {
      current && current.firstChild.removeEventListener('animationend', handler);
    };
  }, [open]);

  return render && (
    <div className={classnames('dialog__modal-container four', {'out': !open}, className)} ref={modal}>
      <div className="modal-background" >
        <div className="modal">
          <div className="modal-content">
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          <div className="modal-actions">
            {buttons.map((button, i) => (
              <button key={i} onClick={button.onClick} className={classnames('action', button.variant)}>{button.title}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;