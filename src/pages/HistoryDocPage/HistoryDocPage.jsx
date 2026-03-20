import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useEffect, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import "./index.scss";
import { ReceiptHistory } from "./icons";
import axios from "axios-api";
import Preloader from "@components/Preloader";
import { useTranslation } from "react-i18next";
import HistoryCheckPage from "@pages/HistoryCheckPage/HistoryCheckPage";
import { ButtonWithContent } from "@components/UI/Buttons";

const HistoryDocPage = () => {
  const history = useHistory();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("receipts");
  const [receipts, setReceipts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [visibleCount, setVisibleCount] = useState(15);
  const [isFetching, setIsFetching] = useState(false);

  const apiReceipts = `/organization/${id}/receipt/list/`;
  const apiInvoice = `/organization/${id}/invoice/list/`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resReceipts, resInvoices] = await Promise.all([
          axios.get(apiReceipts),
          axios.get(apiInvoice),
        ]);

        const getArray = (data) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.results)) return data.results;
          if (Array.isArray(data?.list)) return data.list;
          return [];
        };

        setReceipts(getArray(resReceipts.data));
        setInvoices(getArray(resInvoices.data));
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setVisibleCount(15);
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (isFetching || loading) return;

      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, loading]);

  useEffect(() => {
    if (!isFetching) return;

    setTimeout(() => {
      setVisibleCount((prev) => prev + 15);
      setIsFetching(false);
    }, 600);
  }, [isFetching]);

  const items = activeTab === "receipts" ? receipts : invoices;
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    const fetchChecks = async () => {
        try {
            const res = await axios.get(`/organization/${id}/receipt/list/`)
        } catch (error) {
            
        }
    } 

    fetchChecks()
  }, []) 

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Договор и история платежей", "app.history")}
      />

      <div className="container containerMax" style={{ paddingBottom: "75px" }}>
        <div className="history-list__pay-button" style={{ margin: '20px 0 0 0' }}>
          <ButtonWithContent
            label={translate("Открыть и скачать договор", "app.downloadDoc")}
            radiusOrg={true}
            children={<ReceiptHistory />}
          />
        </div>

        {/* Tabs */}
        <div className="history-tabs">
          <button
            className={`history-tab ${activeTab === "receipts" ? "active" : ""}`}
            onClick={() => setActiveTab("receipts")}
          >
            {translate("Чеки", "app.receipts")}
          </button>

          <button
            className={`history-tab ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            {translate("Инвойсы", "app.invoices")}
          </button>
        </div>

        <div className="history-list">
          {loading ? (
            <Preloader />
          ) : visibleItems.length ? (
            visibleItems.map((item) => (
              <React.Fragment key={item.invoice_number}>
                <div
                  key={item.invoice_number}
                  className="history-item anim"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowModal(true);
                  }}
                >
                  <div className="history-item__left">
                    <div
                      className={`history-item__badge ${
                        item?.tariff?.tariff_type === "starter"
                          ? "twenty"
                          : item?.tariff?.tariff_type === "standard"
                            ? "thirty"
                            : item?.tariff?.tariff_type === "profitable"
                              ? "fifty"
                              : ""
                      }`}
                    >
                      <span>-{item?.tariff?.discount}%</span>
                    </div>

                    <div className="history-item__info">
                      <div className="history-item__number">
                        {activeTab === "receipts"
                          ? translate("Чек", "app.receipt")
                          : translate("Инвойс", "app.invoices")}
                        : {item.invoice_number || "—"}
                      </div>
                      <div className="history-item__date">
                        {item?.created_at
                          ? new Date(item?.created_at)
                              .toLocaleString("ru-RU", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .replace(",", ",")
                          : ""}
                      </div>
                      <div className="history-item__tax">
                        + {translate("Налог", "app.tax")} {item.tax_amount}%
                      </div>
                      <div className="history-item__number">
                        {translate("Итог", "app.total")}:
                      </div>
                    </div>
                  </div>

                  <div className="history-item__right">
                    {/* 1️⃣ Сумма скидки */}
                    <div className="history-item__discount">
                      -
                      {(
                        Number(item?.invoice_amount || 0) *
                          (Number(item?.tariff.discount || 0) /
                            100 /
                            ((1 - Number(item?.tariff?.discount || 0) / 100) *
                              (1 + Number(item?.tax_amount || 5) / 100))) || 0
                      ).toFixed(2)}{" "}
                      AED
                    </div>

                    {/* 2️⃣ Цена после скидки */}
                    <div className="history-item__amount">
                      {Number(
                        item?.invoice_amount - item?.invoice_tax || 0,
                      ).toFixed(2)}{" "}
                      AED
                    </div>

                    {/* 3️⃣ Налог */}
                    <div className="history-item__tax-amount">
                      {item?.invoice_tax} AED
                    </div>

                    {/* 4️⃣ Итоговая сумма */}
                    <div className="history-item__total">
                      {Number(item?.invoice_amount || 0).toFixed(2)} AED
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            // ✅ Проверка по активному табу
            <div className="empty-state" style={{ textAlign: "center" }}>
              {activeTab === "receipts"
                ? translate("Нет чеков", "app.noReceipts")
                : translate("Нет инвойсов", "app.noInvoices")}
            </div>
          )}

          {isFetching && !loading && <Preloader />}
        </div>
      </div>
      {showModal && selectedItem && (
        <HistoryCheckPage
          download={
            activeTab === "receipts"
              ? selectedItem.receipt_download
              : selectedItem.invoice_download
          }
          pdf={
            activeTab === "receipts"
              ? selectedItem.receipt_pdf
              : selectedItem.invoice_pdf
          }
          title={
            activeTab === "receipts"
              ? translate("Чек", "app.receipt")
              : translate("Инвойс", "app.invoices")
          }
          closeModal={(close) => setShowModal(close)}
          number={selectedItem.invoice_number}
        />
      )}
    </>
  );
};

export default HistoryDocPage;
