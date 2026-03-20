import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "@locales/locales";
import { useDispatch } from "react-redux";
import "./index.scss";
import { setTariffId } from "@store/actions/subTarrif";
import logo from "../../assets/images/apofizLogo.png";
import axios from '../../axios-api'
import { DoneIcon } from "./icons";
import { useTranslation } from "react-i18next";
import i18n from "i18next";


const SubscriptionDetailPage = () => {
    const history = useHistory();
    const location = useLocation();
    const { id } = useParams();
    useEffect(() => {
        const sys = (navigator.language || "en").split("-")[0];
        const supported = ["ru", "en", "de", "tr", "zh"];
        const lang = supported.includes(sys) ? sys : "en";
        i18n.changeLanguage(lang);
    }, []);



    const [activeTariff, setActiveTariff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [free, setFree] = useState(true)

    const apiActive = `/organization/${id}/active-tariff/`
    
    useEffect(() => {
        const fetchActiveTariff = async () => {
            try {
                setLoading(true);
                const res = await axios.get(apiActive);

                const data = res.data;
                // если сервер вернёт массив — берём первое значение
                const normalized = Array.isArray(data) ? data[0] : data;

                setActiveTariff(normalized);
            } catch (err) {
                setError(err);
                setActiveTariff(null);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveTariff();
    }, [apiActive]);

    console.log(activeTariff);

    const { tariff_id } = location.state || {};

    const [isScrolled, setIsScrolled] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (tariff_id) dispatch(setTariffId(tariff_id));
    }, [tariff_id, dispatch]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.scrollTo(0, 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const { t } = useTranslation();
    const raw = activeTariff?.tariff?.tariff_type;
    const tariffKey = raw ? String(raw).trim().toLowerCase() : null;

    return (
        <div className="payment-page">
            <MobileTopHeader
                onBack={() => history.goBack()}
                title={translate("Подписка организации", "app.subOrg")}
                className={`payment-page__header ${isScrolled ? "payment-page__header--scrolled" : ""}`}
            />

            <div className="subscription-payment__content">
                <div className="container wrapper-payment">

                    {loading ? (
                        <div className="subscription-loading"></div>
                    ) : !activeTariff?.tariff?.tariff_type ? (
                        <>
                            <div className="subscription-detail-plans__plans">

                                <div className="subscription-detail-plans__plan subscription-detail-plans__plan--selected">
                                    <div className="subscription-detail-plans__plan-header">
                                        <h3 className="subscription-detail-plans__plan-name">{translate("Бесплатная подписка", "app.freeSub")}</h3>
                                        <p className="subscription-detail-plans__plan-price">{translate("Без оплаты", "app.wioutPay")}</p>
                                    </div>

                                    <div
                                        className={`subscription-detail-plans__plan-discount subscription-detail-plans__plan-discount--oneHun`}
                                    >
                                        <span>-100%</span>
                                    </div>

                                    <div className="subscription-detail-plans__plan-selector">
                                        <div className="subscription-detail-plans__plan-radio subscription-detail-plans__plan-radio--selected"></div>
                                    </div>
                                </div>

                            </div>

                            <div className="subscription-payment__info-wrapper">
                                <ul className="subscription-payment__info">
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Полный контроль бизнеса Один кабинет для управления всеми процессами — от продаж до аналитики", "app.businessControlFull")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Экономия на персонале. Автоматизация рутинных задач снижает потребность в дополнительных сотрудниках.", "app.businessBenefit1")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Рост клиентской базы. Увеличение числа новых клиентов и возврат постоянных покупателей.", "app.businessBenefit2")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Универсальность. Подходит для любого сегмента бизнеса — от малого до крупного.", "app.businessBenefit3")}
                                        </p>
                                    </li>
                                </ul>
                            </div>

                            <div className="subscription-payment__card">
                                <div className="subscription-payment__logo-container">
                                    <div className="subscription-payment__logo">
                                        <img src={logo} alt="Apofiz" />
                                    </div>
                                    <div className="subscription-payment__logo-text">
                                        <h3>Apofiz</h3>
                                        <p>{translate("Торгово - Социальная сеть", "app.socialCommerce")}</p>
                                        <p className="subscription-payment__subscription-label subscription-payment__subscription-label--active">
                                            {translate("Активен", "app.active")}
                                        </p>
                                    </div>
                                </div>

                                <div className="subscription-payment__plan-price">
                                    {translate("Срок подписки", "app.period")}: <span style={{ color: "#27AE60" }}>{translate("не ограничена", "app.noLimit")}</span>
                                </div>

                                <div className="subscription-payment__plan-details">
                                    <div className="subscription-payment__plan-description">
                                        {translate(
                                            "Ваша подписка бесплатная в Вашем регионе. Apofiz открывает для Вас весь потенциал нашей платформы. Такая подписка доступна только сейчас.",
                                            "app.subscriptionThanks"
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="subscription-payment__pay-button">
                                <button
                                    className="subscription-payment__pay-btn"
                                    onClick={() => history.goBack()}
                                >
                                    <span className="subscription-payment__pay-text">
                                        {translate("Вернуться назад", "app.back")}
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="subscription-detail-plans__plans">

                                <div className="subscription-detail-plans__plan subscription-detail-plans__plan--selected">
                                    <div className="subscription-detail-plans__plan-header">
                                        <h3 className="subscription-detail-plans__plan-name">
                                            {t(`app.tariffs.${tariffKey}`, "—")}
                                        </h3>
                                        <p className="subscription-detail-plans__plan-price">
                                            {activeTariff?.tariff?.total_price} AED / {activeTariff?.tariff?.duration_months} {translate("месяцев", "app.month")}
                                        </p>
                                    </div>

                                    <div
                                        className={`
                                            subscription-detail-plans__plan-discount
                                            ${activeTariff?.tariff?.tariff_type === "starter"
                                                ? "subscription-detail-plans__plan-discount--twenty"
                                                : activeTariff?.tariff?.tariff_type === "standard"
                                                    ? "subscription-detail-plans__plan-discount--thirty"
                                                    : activeTariff?.tariff?.tariff_type === "profitable"
                                                        ? "subscription-detail-plans__plan-discount--fifty"
                                                        : ""}
                                        `}
                                    >
                                        -<span>{activeTariff?.tariff?.discount}</span>%
                                    </div>

                                    <div className="subscription-detail-plans__plan-selector">
                                        <div className="subscription-detail-plans__plan-radio subscription-detail-plans__plan-radio--selected"></div>
                                    </div>
                                </div>

                            </div>

                            <div className="subscription-payment__info-wrapper">
                                <ul className="subscription-payment__info">
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Полный контроль бизнеса Один кабинет для управления всеми процессами — от продаж до аналитики", "app.businessControlFull")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Экономия на персонале. Автоматизация рутинных задач снижает потребность в дополнительных сотрудниках.", "app.businessBenefit1")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Рост клиентской базы. Увеличение числа новых клиентов и возврат постоянных покупателей.", "app.businessBenefit2")}
                                        </p>
                                    </li>
                                    <li className="subscription-payment__item">
                                        <DoneIcon />
                                        <p className="subscription-payment__item-text">
                                            {translate("Универсальность. Подходит для любого сегмента бизнеса — от малого до крупного.", "app.businessBenefit3")}
                                        </p>
                                    </li>
                                </ul>
                            </div>

                            <div className="subscription-payment__card">
                                <div className="subscription-payment__logo-container">
                                    <div className="subscription-payment__logo">
                                        <img src={logo} alt="Apofiz" />
                                    </div>
                                    <div className="subscription-payment__logo-text">
                                        <h3>Apofiz</h3>
                                        <p>{translate("Торгово - Социальная сеть", "app.socialCommerce")}</p>
                                        <p className="subscription-payment__subscription-label subscription-payment__subscription-label--active">
                                            {translate("Активен", "app.active")}
                                        </p>
                                    </div>
                                </div>

                                <div className="subscription-payment__plan-price">
                                    {translate("Дата продления", "app.period")}:{" "}
                                    {activeTariff?.active_until
                                        ? new Date(activeTariff.active_until).toLocaleDateString("ru-RU")
                                        : ""}
                                </div>

                                <div className="subscription-payment__plan-details">
                                    <div className="subscription-payment__plan-description">
                                        {translate(
                                            "Спасибо за подписку. Apofiz открывает для Вас весь потенциал нашей платформы. Ниже можно посмотреть Договор, а также скачать чек для сохранения.",
                                            "app.subscriptionThanks"
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="subscription-payment__pay-button">
                                <button
                                    className="subscription-payment__pay-btn"
                                    onClick={() => history.push(`/organizations/${id}/historypayment`)}
                                >
                                    <span className="subscription-payment__pay-text">
                                        {translate("Договор и история платежей", "app.history")}
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetailPage;
