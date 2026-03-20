export const mobileMenuStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: "80",
  },
  content: {
    top: "unset",
    right: "unset",
    bottom: "0",

    left: "50%",
    transform: "translateX(-50%)",

    maxWidth: "800px",
    width: "100%",

    borderRadius: "14px 14px 0px 0px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "none",
    padding: "0",

    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    boxShadow:
      "0 0 0 0.6px rgb(255, 255, 255), 0 -5px 8px -7px rgba(0, 0, 0, 0.3), 0 5px 8px -7px rgba(0, 0, 0, 0.3)",
  },
};
