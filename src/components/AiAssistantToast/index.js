import React from "react";
import classNames from "classnames";
import { translate } from "@locales/locales";
import AIIcon from "@ui/Icons/AIIcon";
import classes from "./index.module.scss";

const AIAssistantToast = ({ className, daysLeft, disabled, ...rest }) => {
  return (
    <div
      className={classNames(
        classes.root,
        disabled && classes.root_inactive,
        className
      )}
      {...rest}
    >
      {!disabled ? (
        daysLeft ? (
          <>
            <StatsIcon />
            {translate(
              "Осталось {days} дней работы AI Ассистента",
              "org.aiAssistant.daysLeft",
              {
                days: daysLeft,
              }
            )}
          </>
        ) : (
          translate("AI Ассистент завершил работу", "org.aiAssistant.completed")
        )
      ) : (
        translate("AI Ассистент отключен", "org.aiAssistant.disabled")
      )}

      <AIIcon fill="#FFF" />
    </div>
  );
};

const StatsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="24"
    fill="none"
    viewBox="0 0 25 24"
    {...props}
  >
    <g clipPath="url(#clip0_33069_5257)">
      <path
        fill="#fff"
        d="M7.25 19.5a2.249 2.249 0 11.196-4.49l2.418-4.031a2.25 2.25 0 113.771 0l2.418 4.03c.115-.01.23-.011.345-.003l3.993-6.987a2.25 2.25 0 111.71.977l-3.993 6.987a2.25 2.25 0 11-3.744.039l-2.418-4.03c-.13.011-.262.011-.393 0l-2.418 4.03A2.25 2.25 0 017.25 19.5z"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_33069_5257">
        <path fill="#fff" d="M0 0H24V24H0z" transform="translate(.5)"></path>
      </clipPath>
    </defs>
  </svg>
);

export default AIAssistantToast;
