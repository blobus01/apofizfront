import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LanguageTranslateItem from "../../LanguageTranslateList/MenuItem";
import IconRussia from "../../../assets/icons/icon_russia.svg";
import IconUSA from "../../../assets/icons/icon_usa.svg";
import { DeviceIcon, SocialIcon } from "../../UI/Icons";
import { translate } from "../../../locales/locales";
import {
  getTranslateShopItem,
  setViews,
} from "../../../store/actions/commonActions";
import { getTranslatePost } from "../../../store/actions/postActions";
import { VIEW_TYPES } from "../../GlobalLayer";
import "./index.scss";

const TranslateMenu = ({ onClose, onSelectLang, post, item, currentCode }) => {
  const [deviceLanguageCode, setDeviceLanguageCode] = useState(null);
  const [deviceLanguageText, setDeviceLanguageText] = useState(null);
  const dispatch = useDispatch();

  const getOrgTranslation = (code) => {
    if (currentCode === code) return;
    if (item === "post") {
      dispatch(getTranslatePost(post.name, post.description, code, post.id));
      onSelectLang();
    } else if (item === "org") {
      dispatch(getTranslateShopItem(post.title, post.description, code));
      onSelectLang();
    }

    onClose();
  };

  const onShowLanguageTranslateView = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.language_list,
        getOrgTranslation: (code) => getOrgTranslation(code),
        currentCode,
      })
    );
    onClose();
  };

  useEffect(() => {
    const deviceCode = navigator.language.split("-")[0];
    setDeviceLanguageCode(deviceCode);

    if (deviceCode === "en") {
      setDeviceLanguageText("ENG");
    } else {
      setDeviceLanguageText(navigator.language);
    }
  }, []);

  return (
    <div className="container">
      <LanguageTranslateItem
        title="Русский"
        img={IconRussia}
        alt="Russia Flag"
        onClick={() => getOrgTranslation("ru")}
        currentCode={currentCode}
        code="ru"
      />

      <LanguageTranslateItem
        title="English"
        img={IconUSA}
        alt="USA Flag"
        onClick={() => getOrgTranslation("en")}
        currentCode={currentCode}
        code="en"
      />

      <LanguageTranslateItem
        title={
          translate("Язык устройства", "app.deviceLanguage") +
          ` (${deviceLanguageText && deviceLanguageText.toUpperCase()})`
        }
        icon={<DeviceIcon />}
        onClick={() => getOrgTranslation(deviceLanguageCode)}
        currentCode={currentCode}
        code={deviceLanguageCode}
      />

      <LanguageTranslateItem
        title={translate("Все языки", "app.allLanguages")}
        icon={<SocialIcon />}
        onClick={onShowLanguageTranslateView}
      />
    </div>
  );
};

export default TranslateMenu;
