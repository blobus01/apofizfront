import React from "react";
import { Link } from "react-router-dom";
import config from "../../config";

export const MyLink = ({
  isExternal,
  href,
  to,
  newWindow = true,
  children,
  ...other
}) => {
  const linkOptions = {};

  // Для внешних ссылок
  if (isExternal && newWindow) {
    linkOptions.target = "_blank";
    linkOptions.rel = "noopener noreferrer";
  }

  // 👉 Если передан объект to — значит нужно передать state (React Router V5 поддерживает объект)
  if (!isExternal && to && typeof to === "object") {
    return (
      <Link to={to} {...other}>
        {children}
      </Link>
    );
  }

  // 👉 Если передана строка to — работаем как раньше
  if (!isExternal && typeof to === "string") {
    const finalTo = to.replace(config.baseURL, "");
    return (
      <Link to={finalTo} {...other}>
        {children}
      </Link>
    );
  }

  // 👉 Если используется href — остаётся старое поведение
  if (!isExternal && typeof href === "string") {
    const finalHref = href.replace(config.baseURL, "");
    return (
      <Link to={finalHref} {...other}>
        {children}
      </Link>
    );
  }

  // 👉 Внешний линк
  if (isExternal) {
    return (
      <a href={href} {...linkOptions} {...other}>
        {children}
      </a>
    );
  }

  // Fallback
  return (
    <Link to="/" {...other}>
      {children}
    </Link>
  );
};
