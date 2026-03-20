import React, { useEffect } from "react";
import "./index.scss";

import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";

import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

const HistoryCheckPage = ({ download, pdf, closeModal, title, number }) => {
  console.log(pdf);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDownloadAndPay = () => {
    if (!pdf) return;

    const link = document.createElement("a");
    link.href = download;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      closeModal(false);
    }, 400); // 300–500ms оптимально
  };

  return (
    <div className="invoice-page">
      <MobileTopHeader
        onBack={() => closeModal(false)}
        title={`${title}: ${number}`}
        className="invoice-page__header"
      />

      <div className="invoice-viewer">
        <iframe
          src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdf)}`}
          className="invoice-frame"
          title="invoice"
        />
      </div>

      <div className="invoice-footer">
        <div className="invoice-footer__inner">
          <button className="invoice-pay-btn" onClick={handleDownloadAndPay}>
            {translate("Скачать", "app.download")} {title.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryCheckPage;
