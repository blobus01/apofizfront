import React from "react";
import { CopyIcon, CallIcon } from "./icons";
import "./index.scss";
import { translate } from "@locales/locales";
import Notify from "@components/Notification";

const getFavicon = (href) => {
  try {
    const url = new URL(href);
    const domain = url.hostname.replace(/^www\./, "");
    return {
      icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      title: domain,
    };
  } catch {
    return null;
  }
};

const LinkerComp = ({ value, type }) => {
  const data = type === "web" ? getFavicon(value) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      Notify.success({
        text: translate("Скопирован", "app.copied"),
      });
    } catch (e) {
      console.log("copy error", e);
    }
  };

  const openLink = () => {
    if (type === "phone") {
      window.location.href = `tel:${value}`;
    } else if (type === "mail") {
      window.location.href = `mailto:${value}`;
    } else {
      window.open(value, "_blank");
    }
  };

  const title = type === "phone" ? value : data?.title;
  const subtitle =
    type === "phone" ? translate("Позвонить", "app.callSomeOne") : value;

  return (
    <div className="contact-link">
      <div className="contact-link__left" onClick={openLink}>
        <div className="contact-link__icon">
          {type === "phone" ? (
            <CallIcon />
          ) : data?.icon ? (
            <img
              src={data.icon}
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
        </div>

        <div className="contact-link__info">
          <p className="contact-link__title">{title}</p>
          <p className="contact-link__subtitle">{subtitle}</p>
        </div>
      </div>

      <button className="contact-link__copy" onClick={handleCopy}>
        <CopyIcon />
      </button>
    </div>
  );
};

export default LinkerComp;
