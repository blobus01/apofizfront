import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./index.scss";

export const Layer = ({
  isOpen,
  noTransition = false,
  children,
  setIsShowLayer,
}) => {
  const root = useRef(document.getElementById("layer"));
  useEffect(() => {
    let current;

    if (root.current) {
      current = root.current;
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (current) {
        current.classList.add("active", noTransition && "layer--no-transition");
      }
    } else {
      document.body.style.overflow = "unset";
      if (current) {
        current.classList.remove(
          "active",
          noTransition && "layer--no-transition"
        );
        current.innerHTML = "";
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      current &&
        current.classList.remove(
          "active",
          noTransition && "layer--no-transition"
        );
    };
  }, [noTransition, isOpen]);

  return root.current && isOpen
    ? createPortal(
        <div className="layer-wrap" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>,
        root.current
      )
    : null;
};
