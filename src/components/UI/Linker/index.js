import React from "react";
import parseUrl from "parse-url";
import { LINK_TYPES } from "../../../common/constants";
import { deepLink } from "./linkGenerator";
import "./index.scss";
import { CallIcon } from "@components/LinkerComp/icons";

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

const Linker = ({ type, value }) => {
  const data = type === "web" ? getFavicon(value) : null;

  let domain = "";
  const params = { target: "_blank" };

  if (type === LINK_TYPES.phone) {
    params.href = `tel:${value}`;
  }

  if (type === LINK_TYPES.web) {
    const url = parseUrl(value);
    domain = url.resource;
    params.href = deepLink(url);
  }

  if (type === LINK_TYPES.mail) {
    params.href = `mailto:${value}`;
  }

  return (
    <a
      {...params}
      className="linker f-600 f-14 tl"
      style={{ display: "flex", alignItems: "center", gap: "5px" }}
    >
      <div className="linker-icon">
        {type === "phone" ? (
          <CallIcon />
        ) : data?.icon ? (
          <img
            src={data.icon}
            alt=""
            style={{ width: "15px", height: "15px" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : null}
      </div>
      {domain || value}
    </a>
  );
};

export default Linker;
