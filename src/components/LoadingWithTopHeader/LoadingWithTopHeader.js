import React from "react";
import { translate } from "../../locales/locales";
import Preloader from "../Preloader";
import MobileTopHeader from "../MobileTopHeader";
import "./index.scss";

const LoadingWithTopHeader = () => (
  <>
    <MobileTopHeader title={translate("Загрузка...", "app.loading")} />
    <Preloader className="loading-with-top-header" />
  </>
);

export default LoadingWithTopHeader;
