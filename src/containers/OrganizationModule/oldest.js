// import React, { useCallback, useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import * as classnames from "classnames";
// import { Link, useLocation, useHistory } from "react-router-dom";
// import MobileTopHeader from "../../components/MobileTopHeader";
// import TruncatedText from "../../components/UI/TruncatedText";
// import DiscountSlider from "../../components/DicsountSlider";
// import DiscountCard from "../../components/Cards/DiscountCard";
// import ToggleButton from "../../components/UI/ToggleButton";
// import { StandardButton } from "@ui/Buttons";
// import OrganizationHeader from "../../components/OrganizationHeader";
// import PartnersStatistic from "../../components/PartnersStatistic";
// import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
// import { VIEW_TYPES } from "@components/GlobalLayer";
// import MobileMenu from "../../components/MobileMenu";
// import Linker from "../../components/UI/Linker";
// import Notify from "../../components/Notification";
// import PageHelmet from "../../components/PageHelmet";
// import {
//   canGoBack,
//   checkForValidFile,
//   EMAIL_REGEX,
//   formatWithCommas,
//   shortenNumber,
// } from "@common/helpers";
// import { ALLOWED_FORMATS, DISCOUNT_TYPES, LINK_TYPES } from "@common/constants";
// import { setPreOrganization } from "@store/actions/discountActions";
// import {
//   editDiscountImage,
//   getOrganizationDetail,
//   setOrganizationDetail,
// } from "@store/actions/organizationActions";
// import { subscribeOrganization } from "@store/actions/subscriptionActions";
// import {
//   clearTranslateItems,
//   setGlobalMenu,
//   setPlayingVideoID,
//   setViews,
//   uploadFile,
// } from "@store/actions/commonActions";
// import {
//   addToBlacklist,
//   removeFromBlacklist,
//   resetPurchaseID,
// } from "@store/services/organizationServices";
// import { ButtonShopDiscounts } from "@ui/ButtonShopDiscounts";
// import { DeactivatedOrgPlaceholder } from "./deactivated";
// import PrivateOrg from "./privated";
// import OrganizationHotlinks from "../OrganizationHotlinks";
// import { translate } from "@locales/locales";
// import OrganizationPosts from "./posts";
// import useDialog from "../../components/UI/Dialog/useDialog";
// import { OrganizationWorkingTime } from "@components/OrganizationWorkingTime";
// import OrganizationAverageCheck from "../../components/OrganizationAverageCheck";
// import {
//   AddIcon,
//   ComplainIcon,
//   CouponIcon,
//   CryptoCurrency,
//   DiscountIcon,
//   EditIcon,
//   EyeIcon,
//   EyeOffIcon,
//   LocationIcon,
//   MarketIcon,
//   MenuDots,
//   MessageIcon,
//   PartnersIcon,
//   PromotionBlueIcon,
//   PromotionIcon,
//   QRIcon,
//   QuestionIcon,
//   ReceiptCutOff,
//   RefreshIcon,
//   ScanIcon,
//   SearchIcon,
//   SettingsCheck,
//   ShareIcon,
//   SocialIcon,
//   SubscribeCount,
// } from "@ui/Icons";
// import Preloader from "../../components/Preloader";
// import { MENU_TYPES } from "@components/GlobalMenu";
// import TextLinkifier from "../../components/TextLinkifier";
// import CreditCardsIcom from "../../components/UI/Icons/CreditCardsIcom";
// import PaymentMethodsLayer from "./payment-methods-layer";
// import "./index.scss";
// import AIIcon from "@ui/Icons/AIIcon";
// import NewMarkIcon from "@ui/Icons/NewMarkIcon";

// import { ReactComponent as SearchIconOrg } from "@assets/icons/searchIcon.svg";
// import { ReactComponent as BurgerMenu } from "@assets/icons/burgerMenu.svg";
// import { stickyActiveShadow } from "@common/utils";
// import api from "@/axios-api";
// import { useMediaQuery } from "react-responsive";
// import Dialog from "@components/UI/Dialog/Dialog";
// import { setInvoiceDialog } from "@store/actions/invoiceActions";
// import { ActiveSub, NotActiveSub } from "./icons";
// import { setCurrency } from "@store/actions/currencyActions";
// import { setTariffStatus } from "@store/actions/tariffAction";

// const OrganizationQR = React.lazy(() =>
//   import("../../components/OrganizationQR")
// );

// const OrganizationModule = (props) => {
//   const MENUS = [
//     translate("Настройки", "app.settings"),
//     translate("Инструменты", "app.tools"),
//     translate("Обои", "app.wallpapers"),
//     translate("Касса", "org.cashRegister"),
//     translate("Настройки организации", "org.orgSettings"),
//     translate("Язык перевода", "app.translationLanguage"),
//   ];

//   const { orgDetail, history } = props;
//   const user = useSelector((state) => state.userStore.user);
//   const cardBackgrounds = useSelector(
//     (state) => state.organizationStore.cardBackgrounds
//   );
//   const invocieDialog = useSelector((state) => state.invoice.invoiceDialogOpen);

//   console.log(invocieDialog);

//   const {
//     loading: loadingTranslateItem,
//     data: translation,
//     currentCode,
//   } = useSelector((state) => state.commonStore.translateItem);
//   const {
//     loading: loadingConvertingItem,
//     data: converted,
//     currentConvertedItem,
//   } = useSelector((state) => state.commonStore.convertedItems);

//   const { confirm, alert } = useDialog();
//   const dispatch = useDispatch();
//   const isDesktop = useMediaQuery({ minWidth: 1024 });
//   // const history = useHistory(); // Удаляю дублирующее объявление

//   const {
//     id,
//     title,
//     description,
//     address,
//     phone_numbers,
//     discounts,
//     partners,
//     social_contacts,
//     full_location,
//     image,
//     types,
//     subscribers,
//     client_status,
//     permissions,
//     is_subscribed,
//     is_deleted,
//     is_blacklist,
//     currency,
//     promo_cashback,
//     opens_at,
//     closes_at,
//     show_contacts,
//     is_adult_content,
//     time_working,
//     need_add_item,
//     is_private,
//     online_payment_activated,
//     subscription_status,
//     selected_banner,
//     unread_chat_count,
//   } = orgDetail.data;

//   const [activeTariff, setActiveTariff] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [free, setFree] = useState(true);

//   const apiActive = `/organization/${id}/active-tariff/`;

//   useEffect(() => {
//     const fetchActiveTariff = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get(apiActive);

//         const data = res.data;
//         // если сервер вернёт массив — берём первое значение
//         const normalized = Array.isArray(data) ? data[0] : data;

//         setActiveTariff(normalized);
//         dispatch(setTariffStatus(normalized));
//       } catch (err) {
//         setError(err);
//         setActiveTariff(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActiveTariff();
//   }, [apiActive]);

//   console.log("active tariff", activeTariff);
//   const tariffStatus = useSelector((state) => state.tariffStatus);
//   console.log("Tariff status from state", tariffStatus);

//   const [state, setState] = useState({
//     showDiscounts: false,
//     selectedCard: null,
//     cardImageLoading: false,
//     showMenu: false,
//     showContacts: show_contacts,
//     menu: null,
//     isOriginalTranslation: true,
//     showLangMenu: false,
//     langCode: null,
//   });

//   useEffect(() => {
//     if (currency) {
//       dispatch(setCurrency(currency));
//     }
//   }, [currency]);

//   const [showOrganizationQR, setShowOrganizationQR] = useState(false);
//   const [showPaymentMethods, setShowPaymentMethods] = useState(false);
//   const location = useLocation();
//   const [activeDiscountTab, setActiveDiscountTab] = useState("cumulative");
//   const tabsRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollLeft = useRef(0);

//   // Drag-to-scroll handlers for tabs
//   const onTabsMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.pageX - tabsRef.current.offsetLeft;
//     scrollLeft.current = tabsRef.current.scrollLeft;
//     if (tabsRef.current) tabsRef.current.classList.add("dragging");
//   };
//   const onTabsMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const x = e.pageX - tabsRef.current.offsetLeft;
//     const walk = x - startX.current;
//     tabsRef.current.scrollLeft = scrollLeft.current - walk;
//   };
//   const onTabsMouseUp = () => {
//     isDragging.current = false;
//     if (tabsRef.current) tabsRef.current.classList.remove("dragging");
//   };
//   const onTabsMouseLeave = () => {
//     isDragging.current = false;
//     if (tabsRef.current) tabsRef.current.classList.remove("dragging");
//   };

//   const {
//     showDiscounts,
//     menu,
//     showMenu,
//     showContacts,
//     selectedCard,
//     isOriginalTranslation,
//     cardImageLoading,
//     showLangMenu,
//   } = state;

//   const [scrolled, setScrolled] = useState(false);
//   const prevScrollY = useRef(window.scrollY);
//   const [dialog, setDialog] = useState(true);

//   const hotlinksScrollRef = useRef(null);
//   const [isCreatingChat, setIsCreatingChat] = useState(false);

//   // refs for each DiscountSlider
//   const cumulativeSwiperRef = useRef(null);
//   const fixedSwiperRef = useRef(null);
//   const cashbackSwiperRef = useRef(null);

//   const checkForAdult = useCallback(async () => {
//     if (
//       is_adult_content &&
//       !(
//         permissions &&
//         (permissions.can_check_attendance ||
//           permissions.can_edit_organization ||
//           permissions.can_edit_partner ||
//           permissions.can_sale ||
//           permissions.can_see_stats ||
//           permissions.can_send_message ||
//           permissions.is_owner)
//       )
//     ) {
//       try {
//         await confirm({
//           title: translate("Возрастные ограничения", "dialog.adultLimitTitle"),
//           description: translate(
//             "В этом разделе присутствуют товары, доступные для продажи только лицам\n старше 18 лет.",
//             "dialog.adultLimitDesc"
//           ),
//           confirmTitle: translate("Мне есть 18", "dialog.adultLimitOptionYes"),
//           cancelTitle: translate("Мне нет 18", "dialog.adultLimitOptionNo"),
//         });
//       } catch (e) {
//         // canGoBack(history) ? history.goBack() : history.push("/home");
//         history.goBack();
//       }
//     }
//   }, [is_adult_content, confirm, permissions, history]);

//   const checkSubscription = useCallback(async () => {
//     if (subscription_status) {
//       if (subscription_status === "test") {
//         try {
//           await confirm({
//             title: translate("Платная подписка", "dialog.subscriptionTitle"),
//             description: translate(
//               "Ваша организация находится в тестовом режиме. Вас не могут найти другие пользователи, только по прямой ссылке. Перейти к выбору тарифа",
//               "dialog.subscriptionTestModeDesc"
//             ),
//             confirmTitle: translate("Тарифы", "dialog.subscriptionPlans"),
//             cancelTitle: translate("Отмена", "dialog.cancel"),
//           });
//           history.push({
//             pathname: `/organizations/${id}/subscription-plans`,
//             state: {
//               countryCode: orgDetail.data.country?.code || "AE",
//             },
//           });
//           // org-add-menu container
//         } catch (e) {
//           // canGoBack(history) ? history.goBack() : history.push("/home");
//         }
//       }
//     }
//   }, [subscription_status]);

//   const checkNeedAddItem = useCallback(async () => {
//     if (need_add_item && permissions && permissions.is_owner) {
//       try {
//         await confirm({
//           className: "organization-module__need-item-modal",
//           title: translate(
//             "Добавить товар или новость",
//             "dialog.addProductOrNews"
//           ),
//           description: translate(
//             "Вы давно не добавляли, товары и новости! Новые клиенты не узнают о вас, а старые уже забыли!  Мы уверены, у вас появилось что-то новое!",
//             "dialog.addProductOrNewsDesc"
//           ),
//           confirmTitle: translate("Добавить", "dialog.add"),
//           cancelTitle: translate("Позже", "dialog.later"),
//         });

//         history.push(`/organizations/${id}/posts/create`);
//       } catch (e) {
//         // do nothing
//       }
//     }
//   }, [need_add_item, confirm, permissions, history, id]);

//   useEffect(() => {
//     checkForAdult().catch(console.error);
//     return () => {
//       dispatch(setPlayingVideoID(null));
//       dispatch(clearTranslateItems());
//     };
//   }, [dispatch, checkForAdult]);

//   useEffect(() => {
//     if (!is_deleted) {
//       checkSubscription().catch(console.error);
//     }
//   }, [checkSubscription]);

//   useEffect(() => {
//     checkNeedAddItem();
//   }, [checkNeedAddItem]);

//   // Автоматически выставлять активную вкладку на первую доступную
//   useEffect(() => {
//     if (discounts.cumulative.length) {
//       setActiveDiscountTab("cumulative");
//     } else if (discounts.fixed.length) {
//       setActiveDiscountTab("fixed");
//     } else if (discounts.cashback.length) {
//       setActiveDiscountTab("cashback");
//     }
//     // Не меняем, если все пусто
//   }, [
//     discounts.cumulative.length,
//     discounts.fixed.length,
//     discounts.cashback.length,
//   ]);

//   const toggleMenu = (menuState, menuID) =>
//     setState({
//       ...state,
//       showMenu: menuState,
//       menu: menuID,
//       selectedCard: null,
//     });
//   const toggleShowContacts = () =>
//     setState({ ...state, showContacts: !showContacts });
//   const onCardEditClick = (cardID) =>
//     setState({
//       ...state,
//       selectedCard: cardID,
//       menu: 2,
//       showMenu: true,
//     });

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     const { isValid } = checkForValidFile(file, ALLOWED_FORMATS);
//     if (isValid && selectedCard) {
//       try {
//         setState({ ...state, cardImageLoading: true });
//         const res = await dispatch(uploadFile(file));
//         if (res && res.id) {
//           const editRes = await dispatch(
//             editDiscountImage(selectedCard, res.id, id)
//           );
//           if (editRes && editRes.success) {
//             return setState({
//               ...state,
//               cardImageLoading: false,
//               showMenu: false,
//               menu: null,
//               selectedCard: null,
//             });
//           }
//           Notify.info({
//             text: translate(
//               "Не удалось загрузить изображение",
//               "hint.uploadImageError"
//             ),
//           });
//           return setState({ ...state, cardImageLoading: false });
//         }
//       } catch (e) {
//         return setState({ ...state, cardImageLoading: false, showMenu: false });
//       }
//     }
//   };

//   const setCardBackground = async (imageID) => {
//     if (selectedCard) {
//       const res = await dispatch(editDiscountImage(selectedCard, imageID, id));
//       if (res && res.success) {
//         return setState({
//           ...state,
//           cardImageLoading: false,
//           showMenu: false,
//           menu: null,
//           selectedCard: null,
//         });
//       }
//       Notify.info({
//         text: translate(
//           "Не удалось установить выбранное изображение",
//           "hint.setImageError"
//         ),
//       });
//       return setState({
//         ...state,
//         cardImageLoading: false,
//         showMenu: false,
//         selectedCard: null,
//       });
//     }
//   };

//   const onAddressClick = (location) =>
//     dispatch(setViews({ type: VIEW_TYPES.map, location }));

//   const onShowLangMenu = () => {
//     dispatch(
//       setGlobalMenu({
//         type: MENU_TYPES.post_lang_menu,
//         menuLabel: translate("Язык перевода", "app.translationLanguage"),
//         onSelectLang: () =>
//           setState({ ...state, isOriginalTranslation: false }),
//         post: { id, title, description },
//         item: "org",
//         currentCode,
//       })
//     );
//   };

//   const onOpenCurrencyMenu = () => {
//     dispatch(
//       setGlobalMenu({
//         type: MENU_TYPES.post_currency_menu,
//         menuLabel: translate("Выбрать валюту", "app.chooseCurrency"),
//         orgCurrency: currency,
//         currentCode: converted.org && converted.org[id]?.currency,
//         item: { id, price: orgDetail.data["avg_check"], name: "org" },
//       })
//     );
//   };

//   const showTranslation = () => {
//     setState({ ...state, isOriginalTranslation: !isOriginalTranslation });
//   };

//   const toggleShowDiscounts = () =>
//     setState({ ...state, showDiscounts: !showDiscounts });

//   const isPrivateOrg = () => {
//     return (
//       (is_private && !permissions) ||
//       (is_private &&
//         permissions &&
//         !permissions.is_owner &&
//         is_subscribed !== "subscribed")
//     );
//   };

//   const onAdd = () => {
//     dispatch(
//       setGlobalMenu({
//         type: MENU_TYPES.organization_add_menu,
//         menuLabel: translate("Добавить", "app.add"),
//         orgID: id,
//       })
//     );
//   };

//   const handleBack = () => {
//     if (location.state && location.state.fromChildRoute) {
//       history.push("/profile");
//     } else {
//       history.goBack();
//     }
//   };

//   useEffect(() => {
//     const handleScroll = () => {
//       const organizationModule = document.querySelector(".organization-module");
//       const currentScrollY = window.scrollY;

//       if (currentScrollY > 10) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//       if (currentScrollY > prevScrollY.current) {
//         // Scrolling down
//         if (currentScrollY > 10) {
//           organizationModule?.classList.add("organization-module--sticky");
//         }
//       } else {
//         // Scrolling up
//         organizationModule?.classList.remove("organization-module--sticky");
//       }

//       prevScrollY.current = currentScrollY;
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const observer = stickyActiveShadow();

//     return () => {
//       if (observer) observer.disconnect();
//     };
//   }, []);

//   const handleShowAllDiscounts = () => {
//     dispatch(
//       setViews({
//         type: VIEW_TYPES.all_discounts,
//         orgId: id,
//         orgDetail,
//         user,
//         permissions: orgDetail.data.permissions,
//         client_status: orgDetail.data.client_status,
//         onCardEditClick,
//         discounts,
//         currency,
//       })
//     );
//   };

//   const handleCreateChat = async () => {
//     setIsCreatingChat(true);
//     try {
//       const resp = await api.post("/messenger/chats/organization/", {
//         organization_id: id,
//       });
//       if (resp && resp.data && resp.data.chat_id) {
//         Notify.success({ text: "Чат создан" });
//         history.push(
//           `/messenger/chat/${resp.data.chat_id}?organization_id=${id}`
//         );
//       } else {
//         // Пользователь является сотрудником организации
//         history.push(`/messenger/organization/${id}/`);
//       }
//     } catch (e) {
//       Notify.error({ text: "Ошибка при создании чата" });
//     } finally {
//       setIsCreatingChat(false);
//     }
//   };

//   return (
//     <React.Fragment>
//       <PageHelmet
//         title={title}
//         description={description}
//         image={image && image.medium}
//       />

//       <div className="organization-module">
//         <MobileTopHeader
//           onBack={() =>
//             // canGoBack(history) ? history.goBack() : history.push("/home")
//             history.push("/profile")
//           }
//           onMenu={() => toggleMenu(true, 1)}
//           renderRight={() => (
//             <Link to={`/organizations/${id}/search`}>
//               {scrolled ? <SearchIcon /> : <SearchIconOrg />}
//             </Link>
//           )}
//           title={
//             title && !isOriginalTranslation && translation
//               ? `${translation.title}` || ""
//               : `${title}` || ""
//           }
//           verification_status={orgDetail.data.verification_status}
//           className={classnames("organization-module__top", {
//             "organization-module__top--scrolled": scrolled,
//           })}
//         />
//         <div
//           className="organization-module__background"
//           style={
//             selected_banner
//               ? {
//                   "--banner-image": `url(${selected_banner.image?.file})`,
//                   "--default-banner-opacity": "0",
//                 }
//               : {
//                   "--default-banner-opacity": "1",
//                 }
//           }
//         ></div>

//         <div className="organization-module__content">
//           <div className="organization-module__content__header">
//             <OrganizationHeader
//               id={id}
//               subscribers={subscribers}
//               title={
//                 !isOriginalTranslation && translation
//                   ? translation.title
//                   : title
//               }
//               image={image}
//               types={types}
//               isBanned={orgDetail.data.is_banned}
//               isSubscribed={is_subscribed}
//               isPrivate={orgDetail.data.is_private}
//               isWholesale={orgDetail.data.is_wholesale}
//               perm={orgDetail.data.permissions}
//               verification_status={orgDetail.data.verification_status}
//               user={user}
//               className="organization-module__header"
//             />
//             <div className="tools-wrap">
//               <div className="organization-module__tools">
//                 <ToggleButton
//                   label={translate("Контакты и Web", "app.contactsAndWeb")}
//                   className="organization-module__contacts-btn toggle-btn"
//                   toggled={showContacts}
//                   onClick={toggleShowContacts}
//                 />
//                 {permissions && permissions.is_owner ? (
//                   <button
//                     onClick={onAdd}
//                     className="organization-module__create-product-btn f-14 f-600"
//                   >
//                     <span className="tl">
//                       {translate("Добавить", "app.add")}
//                     </span>
//                   </button>
//                 ) : (
//                   <StandardButton
//                     label={
//                       is_subscribed === "subscribed"
//                         ? translate("Отписаться", "subscriptions.toUnSubscribe")
//                         : translate("Подписаться", "subscriptions.toSubscribe")
//                     }
//                     className={
//                       is_subscribed === "subscribed"
//                         ? "organization-module__unsubscribe-btn"
//                         : "organization-module__subscribe-btn"
//                     }
//                     onClick={async () => {
//                       const res = await dispatch(subscribeOrganization(id));
//                       res && res.success && dispatch(getOrganizationDetail(id));
//                     }}
//                   />
//                 )}
//                 <ButtonShopDiscounts
//                   onChange={() => handleCreateChat()}
//                   // active={showDiscounts}
//                   className="organization-module__switch-btn button-shop-discounts"
//                   disabled={isCreatingChat}
//                   unread_chat_count={unread_chat_count}
//                 />
//               </div>
//               <div
//                 className={classnames(
//                   "organization-module__contacts",
//                   showContacts && "organization-module__contacts-show"
//                 )}
//               >
//                 {phone_numbers.map((phone) => (
//                   <Linker
//                     key={phone.id}
//                     type={LINK_TYPES.phone}
//                     value={phone.phone_number}
//                   />
//                 ))}

//                 {social_contacts.map((social) => (
//                   <Linker
//                     key={social.id}
//                     type={
//                       social.url.match(EMAIL_REGEX)
//                         ? LINK_TYPES.mail
//                         : LINK_TYPES.web
//                     }
//                     value={social.url}
//                   />
//                 ))}
//               </div>
//               {permissions &&
//                 permissions.is_owner &&
//                 !orgDetail.data.assistant && (
//                   <Link
//                     to={`/organizations/${id}/assistant`}
//                     className="organization-module__assistant f-14 f-500"
//                   >
//                     <div className="organization-module__assistant-content">
//                       <div className="organization-module__assistant-icons">
//                         <AIIcon fill="#fff" />
//                         <NewMarkIcon fill="#fff" />
//                       </div>
//                       <span className="organization-module__assistant-label">
//                         {translate(
//                           "Создать AI Ассистента",
//                           "org.createAIAssistant"
//                         )}
//                       </span>
//                     </div>
//                   </Link>
//                 )}
//               {permissions &&
//                 !permissions.can_edit_organization &&
//                 orgDetail.data.assistant &&
//                 orgDetail.data.assistant.is_assistant_active && (
//                   <Link
//                     to={`/organizations/${id}/chat?assistant=${orgDetail.data.assistant.id}`}
//                     className="organization-module__assistant f-14 f-500"
//                   >
//                     <div className="organization-module__assistant-content">
//                       <div className="organization-module__assistant-icons">
//                         <AIIcon fill="#fff" />
//                       </div>
//                       <span className="organization-module__assistant-label">
//                         {translate(
//                           "Служба помощи и заботы клиента 24/7",
//                           "org.supportAndCareService"
//                         )}
//                       </span>
//                     </div>
//                   </Link>
//                 )}
//               {promo_cashback && is_subscribed === "not_subscribed" && (
//                 <button
//                   type="button"
//                   className="organization-module__promo f-14 f-500"
//                   onClick={() =>
//                     alert({
//                       title: translate(
//                         "Нажав кнопку подписаться вы получаете в подарок кэшбэк, которым вы сможете рассчитаться в данной организации",
//                         "promoCashback.subscribeInfo"
//                       ),
//                     })
//                   }
//                 >
//                   <span className="organization-module__promo-content">
//                     <PromotionIcon />
//                     {translate(
//                       "Получи кэшбек {amount} за подписку",
//                       "promoCashback.subscribe",
//                       { amount: `${Number(promo_cashback)} ${currency}` }
//                     )}
//                   </span>
//                 </button>
//               )}
//               {permissions &&
//                 permissions.can_edit_organization &&
//                 orgDetail.data.assistant && (
//                   <Link
//                     to={`/organizations/${id}/assistants/${orgDetail.data.assistant.id}/chats`}
//                     className="organization-module__assistant organization-module__assistant--for-org f-14 f-500"
//                   >
//                     <div className="organization-module__assistant-content">
//                       <div className="organization-module__assistant-icons">
//                         <AIIcon />
//                         <NewMarkIcon />
//                       </div>
//                       <span className="organization-module__assistant-label">
//                         {translate("AI Ассистент", "org.aiAssistant")}
//                       </span>
//                       <div className="organization-module__assistant-badge-container">
//                         {!!orgDetail.data.all_unread_messages_count && (
//                           <span className="organization-module__assistant-badge">
//                             {orgDetail.data.all_unread_messages_count > 999
//                               ? 999
//                               : orgDetail.data.all_unread_messages_count}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 )}
//             </div>
//             {isPrivateOrg() ? (
//               <>
//                 {is_deleted ? (
//                   <DeactivatedOrgPlaceholder />
//                 ) : (
//                   <PrivateOrg
//                     promoCashBack={promo_cashback}
//                     showDiscounts={showDiscounts}
//                     toggleShowDiscounts={toggleShowDiscounts}
//                     isSubscribed={is_subscribed}
//                     currency={currency}
//                     id={id}
//                   />
//                 )}
//               </>
//             ) : (
//               <>
//                 {(subscribers === 0 || subscribers) &&
//                   (user ? (
//                     <Link to={`/organizations/${id}/followers`}>
//                       <p className="organization-header__subscribers f-14">
//                         <SubscribeCount />
//                         {translate(
//                           "Подписчиков: {count}",
//                           "org.followersCount",
//                           {
//                             count: shortenNumber(subscribers),
//                             b: (num) => (
//                               <span
//                                 className="f-14 f-600"
//                                 style={{ color: "#4285F4" }}
//                               >
//                                 {num}
//                               </span>
//                             ),
//                           }
//                         )}
//                       </p>
//                     </Link>
//                   ) : (
//                     <p className="organization-header__subscribers f-14">
//                       <SubscribeCount />
//                       {translate("Подписчиков: {count}", "org.followersCount", {
//                         count: shortenNumber(subscribers),
//                         b: (num) => <b>{num}</b>,
//                       })}
//                     </p>
//                   ))}
//                 <Link
//                   className="organization-module__savings dfc f-14"
//                   to={`/receipts?org=${id}&r=1`}
//                 >
//                   <CryptoCurrency />
//                   <span className="organization-module__savings-label">
//                     {translate("Ваша экономия", "app.yourSavings")}:
//                   </span>
//                   <span className="organization-module__savings-sum f-14 f-600">
//                     {(client_status &&
//                       formatWithCommas(
//                         Math.floor(client_status.total_saved)
//                       )) ||
//                       0}{" "}
//                     {currency}
//                   </span>
//                 </Link>
//                 <div className="organization-module__method-payments dfc">
//                   <CreditCardsIcom className="organization-module__method-payments-icon" />
//                   <span className="organization-module__method-payments-label f-14">
//                     {translate("Способы оплаты", "payment.methods")}:
//                   </span>
//                   <button
//                     type="button"
//                     className="organization-module__method-payments-btn f-14 f-500"
//                     onClick={() => setShowPaymentMethods(true)}
//                   >
//                     {translate("Посмотреть доступные", "payment.seeAvailable")}
//                   </button>
//                 </div>
//                 {orgDetail.data["avg_check"] !== 0 &&
//                   orgDetail.data["avg_check"] && (
//                     <OrganizationAverageCheck
//                       id={id}
//                       sum={orgDetail.data["avg_check"]}
//                       currency={currency}
//                       loading={loadingConvertingItem}
//                       onClick={onOpenCurrencyMenu}
//                       currentConvertedItem={currentConvertedItem}
//                       converted={
//                         converted.org && converted.org[id]
//                           ? converted.org[id]
//                           : null
//                       }
//                       className="organization-module__avg-check"
//                     />
//                   )}
//                 {!is_deleted && opens_at && closes_at && (
//                   <OrganizationWorkingTime
//                     start={opens_at}
//                     end={closes_at}
//                     status={time_working}
//                     className="organization-module__hours"
//                     color="#818C99"
//                   />
//                 )}

//                 {address && (
//                   <div className="organization-module__address">
//                     <LocationIcon
//                       className={classnames(
//                         !(full_location.latitude && full_location.longitude) &&
//                           "black"
//                       )}
//                       style={{ minWidth: "24px" }}
//                     />
//                     {full_location.latitude && full_location.longitude ? (
//                       <button
//                         className="organization-module__address-btn f-14 f-600"
//                         onClick={() => onAddressClick(full_location)}
//                       >
//                         {address}
//                       </button>
//                     ) : (
//                       <p className="f-14 f-600">{address}</p>
//                     )}
//                   </div>
//                 )}

//                 {is_deleted ? null : (
//                   <>
//                     {!isOriginalTranslation && translation ? (
//                       <TruncatedText className="organization-module__description f-14">
//                         <TextLinkifier
//                           text={translation.description}
//                           getHashtagLink={(hashtag) =>
//                             `/organizations/${id}/search?search=${hashtag}`
//                           }
//                         />
//                       </TruncatedText>
//                     ) : (
//                       <TruncatedText className="organization-module__description f-14">
//                         <TextLinkifier
//                           text={description}
//                           getHashtagLink={(hashtag) =>
//                             `/organizations/${id}/search?search=${hashtag}`
//                           }
//                         />
//                       </TruncatedText>
//                     )}

//                     <div className="organization-module__translation">
//                       {isOriginalTranslation ? (
//                         <button
//                           className="organization-module__translation-text f-13 f-500"
//                           type="button"
//                           onClick={
//                             !translation ? onShowLangMenu : showTranslation
//                           }
//                         >
//                           {translate("Показать перевод", "app.showTranslation")}
//                         </button>
//                       ) : (
//                         <button
//                           className="organization-module__translation-text f-13 f-500"
//                           type="button"
//                           onClick={
//                             !translation ? onShowLangMenu : showTranslation
//                           }
//                         >
//                           {!loadingTranslateItem &&
//                             translate(
//                               "Показать оригинал",
//                               "app.showOriginalTranslation"
//                             )}
//                         </button>
//                       )}
//                       <button
//                         type="button"
//                         className="organization-module__translation-icon"
//                         onClick={onShowLangMenu}
//                       >
//                         {showLangMenu ? <MenuDots /> : <SocialIcon />}
//                       </button>
//                       {loadingTranslateItem && (
//                         <Preloader className="organization-module__translation-loading" />
//                       )}
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </div>

//           {(discounts.cumulative.length > 0 ||
//             discounts.fixed.length > 0 ||
//             discounts.cashback.length > 0) && (
//             <div className="organization-module__content__discounts">
//               <div className="organization-module__content__hotlinks-nav">
//                 <div style={{ display: "flex", alignItems: "center" }}>
//                   <h2>{translate("Скидки и бонусы", "org.discountTitle")}</h2>
//                   {/* Slide buttons for DiscountSlider */}
//                   <div className="slide-btns">
//                     <svg
//                       width="10"
//                       height="16"
//                       viewBox="0 0 10 16"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       onClick={() => {
//                         if (
//                           activeDiscountTab === "cumulative" &&
//                           cumulativeSwiperRef.current &&
//                           cumulativeSwiperRef.current.swiper
//                         ) {
//                           cumulativeSwiperRef.current.swiper.slidePrev();
//                         } else if (
//                           activeDiscountTab === "fixed" &&
//                           fixedSwiperRef.current &&
//                           fixedSwiperRef.current.swiper
//                         ) {
//                           fixedSwiperRef.current.swiper.slidePrev();
//                         } else if (
//                           activeDiscountTab === "cashback" &&
//                           cashbackSwiperRef.current &&
//                           cashbackSwiperRef.current.swiper
//                         ) {
//                           cashbackSwiperRef.current.swiper.slidePrev();
//                         }
//                       }}
//                       className="prev"
//                       style={{ cursor: "pointer" }}
//                     >
//                       <path
//                         d="M8 2L2 8L8 14"
//                         stroke="#007AFF"
//                         strokeWidth="2.25"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     <svg
//                       width="10"
//                       height="16"
//                       viewBox="0 0 10 16"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       onClick={() => {
//                         if (
//                           activeDiscountTab === "cumulative" &&
//                           cumulativeSwiperRef.current &&
//                           cumulativeSwiperRef.current.swiper
//                         ) {
//                           cumulativeSwiperRef.current.swiper.slideNext();
//                         } else if (
//                           activeDiscountTab === "fixed" &&
//                           fixedSwiperRef.current &&
//                           fixedSwiperRef.current.swiper
//                         ) {
//                           fixedSwiperRef.current.swiper.slideNext();
//                         } else if (
//                           activeDiscountTab === "cashback" &&
//                           cashbackSwiperRef.current &&
//                           cashbackSwiperRef.current.swiper
//                         ) {
//                           cashbackSwiperRef.current.swiper.slideNext();
//                         }
//                       }}
//                       className="next"
//                       style={{ cursor: "pointer" }}
//                     >
//                       <path
//                         d="M2 14L8 8L2 2"
//                         stroke="#007AFF"
//                         strokeWidth="2.25"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleShowAllDiscounts}
//                   className="home-partners__top-link f-14 f-500"
//                 >
//                   {translate("Показать все", "app.showAll")}
//                 </button>
//               </div>
//               <div className="organization-module__cards">
//                 <div className="organization-module__cards-tabs" /* ... */>
//                   {discounts.cumulative.length > 0 && (
//                     <button
//                       className={classnames(
//                         "organization-module__cards-tab",
//                         activeDiscountTab === "cumulative" &&
//                           "organization-module__cards-tab--active"
//                       )}
//                       onClick={() => setActiveDiscountTab("cumulative")}
//                       type="button"
//                     >
//                       {translate("Накопительные %", "discount.cumulativeTab")}
//                     </button>
//                   )}

//                   {discounts.fixed.length > 0 && (
//                     <button
//                       className={classnames(
//                         "organization-module__cards-tab",
//                         activeDiscountTab === "fixed" &&
//                           "organization-module__cards-tab--active"
//                       )}
//                       onClick={() => setActiveDiscountTab("fixed")}
//                       type="button"
//                     >
//                       {translate("Акционные %", "discount.fixedTab")}
//                     </button>
//                   )}

//                   {discounts.cashback.length > 0 && (
//                     <button
//                       className={classnames(
//                         "organization-module__cards-tab",
//                         activeDiscountTab === "cashback" &&
//                           "organization-module__cards-tab--active"
//                       )}
//                       onClick={() => setActiveDiscountTab("cashback")}
//                       type="button"
//                     >
//                       {translate("Кэшбэк %", "discount.cashbackTab")}
//                     </button>
//                   )}
//                 </div>

//                 {activeDiscountTab === "cumulative" &&
//                   discounts.cumulative.length > 0 && (
//                     <div className="organization-module__card-cumulative">
//                       {!discounts.cumulative.length ? (
//                         permissions && permissions.is_owner ? (
//                           <div>
//                             {translate(
//                               "У вас нет фиксированных карт",
//                               "hint.noFixedCardOwner"
//                             )}
//                           </div>
//                         ) : (
//                           <div>
//                             {translate(
//                               "Нет фиксированных карт",
//                               "hint.noFixedCard"
//                             )}
//                           </div>
//                         )
//                       ) : (
//                         <DiscountSlider
//                           ref={cumulativeSwiperRef}
//                           className="organization-module__slider"
//                           clientStatus={{
//                             ...client_status,
//                             type: DISCOUNT_TYPES.cumulative,
//                           }}
//                           cards={discounts.cumulative}
//                         >
//                           {discounts.cumulative.map((card) => (
//                             <DiscountCard
//                               key={card.id}
//                               card={card}
//                               clientStatus={client_status}
//                               isOwner={
//                                 permissions && permissions.can_edit_organization
//                               }
//                               onEditClick={() => onCardEditClick(card.id)}
//                               name={user && user.full_name}
//                             />
//                           ))}
//                         </DiscountSlider>
//                       )}
//                     </div>
//                   )}
//                 {activeDiscountTab === "fixed" &&
//                   discounts.fixed.length > 0 && (
//                     <div className="organization-module__card-fixed">
//                       {!discounts.fixed.length ? (
//                         permissions && permissions.is_owner ? (
//                           <div>
//                             {translate(
//                               "У вас нет акционных карт",
//                               "hint.noPromotionCardOwner"
//                             )}
//                           </div>
//                         ) : (
//                           <div>
//                             {translate(
//                               "Нет акционных карт",
//                               "hint.noPromotionCard"
//                             )}
//                           </div>
//                         )
//                       ) : (
//                         <DiscountSlider
//                           ref={fixedSwiperRef}
//                           className="organization-module__slider"
//                           cards={discounts.fixed}
//                         >
//                           {discounts.fixed.map((card) => (
//                             <DiscountCard
//                               key={card.id}
//                               card={card}
//                               onEditClick={() => onCardEditClick(card.id)}
//                               isOwner={
//                                 permissions && permissions.can_edit_organization
//                               }
//                               name={user && user.full_name}
//                             />
//                           ))}
//                         </DiscountSlider>
//                       )}
//                     </div>
//                   )}
//                 {activeDiscountTab === "cashback" &&
//                   discounts.cashback.length > 0 && (
//                     <div className="organization-module__card-cashback">
//                       {!discounts.cashback.length ? (
//                         permissions && permissions.is_owner ? (
//                           <div>
//                             {translate(
//                               "У вас нет кэшбек карт",
//                               "hint.noCashbackCardOwner"
//                             )}
//                           </div>
//                         ) : (
//                           <div>
//                             {translate(
//                               "Нет кэшбек карт",
//                               "hint.noCashbackCard"
//                             )}
//                           </div>
//                         )
//                       ) : (
//                         <DiscountSlider
//                           ref={cashbackSwiperRef}
//                           className="organization-module__slider"
//                           clientStatus={{
//                             ...client_status,
//                             currency,
//                             type: DISCOUNT_TYPES.cashback,
//                           }}
//                           cards={discounts.cashback}
//                         >
//                           {discounts.cashback.map((card) => (
//                             <DiscountCard
//                               key={card.id}
//                               card={card}
//                               onEditClick={() => onCardEditClick(card.id)}
//                               isOwner={
//                                 permissions && permissions.can_edit_organization
//                               }
//                               name={user && user.full_name}
//                             />
//                           ))}
//                         </DiscountSlider>
//                       )}
//                     </div>
//                   )}
//               </div>
//             </div>
//           )}
//           {partners.count > 0 && (
//             <div className="organization-module__content__discounts">
//               <div className="organization-module__content__hotlinks-nav">
//                 <h5 className="f-16 f-500 tl">
//                   {permissions && permissions.can_see_stats
//                     ? translate("Статистика партнеров", "org.partnerStatistics")
//                     : translate("Партнеры {title}", "org.partnerOf", { title })}
//                 </h5>
//                 <Link
//                   to={
//                     permissions && permissions.can_see_stats
//                       ? `/organizations/${id}/partner-statistics`
//                       : `/home/partners/${id}`
//                   }
//                   className="home-partners__top-link f-14 f-500"
//                 >
//                   {translate("Показать все", "app.showAll")}
//                 </Link>
//               </div>
//               <PartnersStatistic
//                 organization={id}
//                 title={title}
//                 partners={partners}
//                 isMain={true}
//                 permission={permissions && permissions.can_see_stats}
//                 className="organization-module__partners"
//               />
//             </div>
//           )}
//           {isPrivateOrg() ? (
//             <>
//               {is_deleted ? (
//                 <DeactivatedOrgPlaceholder />
//               ) : (
//                 <PrivateOrg
//                   promoCashBack={promo_cashback}
//                   showDiscounts={showDiscounts}
//                   toggleShowDiscounts={toggleShowDiscounts}
//                   isSubscribed={is_subscribed}
//                   currency={currency}
//                   id={id}
//                 />
//               )}
//             </>
//           ) : is_deleted ? (
//             <DeactivatedOrgPlaceholder />
//           ) : (
//             <>
//               <div className="organization-module__content__hotlinks">
//                 <div className="organization-module__content__hotlinks-nav">
//                   <div>
//                     <h2>{translate("Быстрые ссылки", "hotlink.title")}</h2>
//                     <div className="slide-btns">
//                       <svg
//                         width="10"
//                         height="16"
//                         viewBox="0 0 10 16"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                         onClick={() => {
//                           if (
//                             hotlinksScrollRef.current &&
//                             hotlinksScrollRef.current.container &&
//                             hotlinksScrollRef.current.container.current
//                           ) {
//                             hotlinksScrollRef.current.container.current.scrollBy(
//                               { left: -200, behavior: "smooth" }
//                             );
//                           }
//                         }}
//                         className="prev"
//                         style={{ cursor: "pointer" }}
//                       >
//                         <path
//                           d="M8 2L2 8L8 14"
//                           stroke="#007AFF"
//                           strokeWidth="2.25"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <svg
//                         width="10"
//                         height="16"
//                         viewBox="0 0 10 16"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                         onClick={() => {
//                           if (
//                             hotlinksScrollRef.current &&
//                             hotlinksScrollRef.current.container &&
//                             hotlinksScrollRef.current.container.current
//                           ) {
//                             hotlinksScrollRef.current.container.current.scrollBy(
//                               { left: 200, behavior: "smooth" }
//                             );
//                           }
//                         }}
//                         className="next"
//                         style={{ cursor: "pointer" }}
//                       >
//                         <path
//                           d="M2 14L8 8L2 2"
//                           stroke="#007AFF"
//                           strokeWidth="2.25"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                   <Link
//                     to={`/organizations/${id}/hotlinks`}
//                     className="home-partners__top-link f-14 f-500"
//                   >
//                     {translate("Показать все", "app.showAll")}
//                   </Link>
//                 </div>

//                 <OrganizationHotlinks
//                   orgID={orgDetail.data.id}
//                   canEdit={permissions && permissions.can_edit_organization}
//                   scrollContainerRef={hotlinksScrollRef}
//                 />
//               </div>
//               {!showDiscounts && (
//                 <div className="organization-module__content__posts">
//                   <OrganizationPosts orgID={id} orgDetail={orgDetail.data} />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       <MobileMenu
//         isOpen={showMenu}
//         contentLabel={MENUS[menu]}
//         onRequestClose={() => toggleMenu(false, null)}
//       >
//         <div
//           className={classnames(
//             "organization-module__menu",
//             showMenu && "organization-module__menu-active"
//           )}
//         >
//           {menu === 0 && permissions.is_owner && (
//             <React.Fragment>
//               <RowButton
//                 type={ROW_BUTTON_TYPES.link}
//                 label={translate("Редактирование", "app.edit")}
//                 showArrow={false}
//                 to={`/organizations/${id}/edit-main`}
//               >
//                 <EditIcon />
//               </RowButton>

//               {!is_deleted && (
//                 <>
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Управление скидками",
//                       "org.discountManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/edit-discounts`}
//                   >
//                     <DiscountIcon />
//                   </RowButton>

//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Управление купонами",
//                       "org.couponsManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/coupons`}
//                   >
//                     <CouponIcon />
//                   </RowButton>

//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Управление партнерами",
//                       "org.partnerManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/partners`}
//                   >
//                     <PartnersIcon />
//                   </RowButton>
//                 </>
//               )}
//             </React.Fragment>
//           )}

//           {menu === 1 && (
//             <React.Fragment>
//               {permissions &&
//                 permissions.can_edit_organization &&
//                 !is_deleted && (
//                   <RowButton
//                     label={translate("Добавить", "org.addPost")}
//                     showArrow={false}
//                     onClick={() => {
//                       setState((prevState) => ({
//                         ...prevState,
//                         showMenu: false,
//                       }));
//                       dispatch(
//                         setGlobalMenu({
//                           type: MENU_TYPES.organization_add_menu,
//                           menuLabel: translate("Добавить", "app.add"),
//                           orgID: id,
//                         })
//                       );
//                     }}
//                   >
//                     <AddIcon />
//                   </RowButton>
//                 )}

//               {permissions && permissions.can_sale && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.button}
//                   label={translate("Касса", "org.cashRegister")}
//                   showArrow={true}
//                   onClick={() => toggleMenu(true, 3)}
//                 >
//                   <ReceiptCutOff />
//                 </RowButton>
//               )}

//               {permissions &&
//                 (permissions.can_edit_organization ||
//                   permissions.can_edit_partner) && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.button}
//                     label={translate(
//                       "Настройки организации",
//                       "org.orgSettings"
//                     )}
//                     showArrow={true}
//                     onClick={() => toggleMenu(true, 4)}
//                   >
//                     <SettingsCheck />
//                   </RowButton>
//                 )}

//               {permissions &&
//                 permissions.is_owner &&
//                 !is_deleted &&
//                 orgDetail.data.assistant !== null && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "AI Ассистент настройки",
//                       "org.aiAssistantSettings"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/assistant?mode=edit`}
//                   >
//                     <AIIcon />
//                   </RowButton>
//                 )}

//               {permissions && permissions.can_see_stats && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.link}
//                   label={translate(
//                     "Статистика продаж",
//                     "org.salesAndDiscounts"
//                   )}
//                   showArrow={false}
//                   to={`/organizations/${id}/receipts`}
//                 >
//                   <MarketIcon />
//                 </RowButton>
//               )}

//               {permissions && permissions.can_send_message && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.link}
//                   label={translate(
//                     "Отправить сообщение подписчикам",
//                     "org.sendMessageToFollowers"
//                   )}
//                   showArrow={false}
//                   to={`/organizations/${id}/messages`}
//                 >
//                   <MessageIcon />
//                 </RowButton>
//               )}

//               {!is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.button}
//                   label={translate("Поделиться", "app.share")}
//                   showArrow={false}
//                   onClick={() => {
//                     setShowOrganizationQR(true);
//                     toggleMenu(false, null);
//                   }}
//                 >
//                   <ShareIcon />
//                 </RowButton>
//               )}

//               {permissions && !permissions.can_send_message && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.link}
//                   label={translate(
//                     "Сообщения подписчикам",
//                     "org.messageFollowers"
//                   )}
//                   showArrow={false}
//                   to={`/organizations/${id}/messages?org=${id}`}
//                 >
//                   <MessageIcon />
//                 </RowButton>
//               )}

//               {permissions &&
//                 permissions.can_check_attendance &&
//                 !is_deleted && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Сканер пропусков",
//                       "org.attendanceScanner"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/attendance-scan`}
//                   >
//                     <ScanIcon />
//                   </RowButton>
//                 )}

//               {permissions &&
//                 permissions.can_edit_organization &&
//                 !is_deleted && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate("Сотрудники", "app.employees")}
//                     showArrow={false}
//                     to={`/organizations/${id}/employees`}
//                   >
//                     <PartnersIcon />
//                   </RowButton>
//                 )}
//               {permissions && !permissions.is_owner && !is_deleted && (
//                 <RowButton
//                   label={
//                     <span className="organization-module__menu-complain-btn-label">
//                       {translate("Пожаловаться", "shop.complain")}
//                     </span>
//                   }
//                   showArrow={false}
//                   onClick={() => {
//                     dispatch(
//                       setViews({
//                         type: VIEW_TYPES.organization_complain,
//                         orgID: id,
//                       })
//                     );
//                     setState((prevState) => ({
//                       ...prevState,
//                       showMenu: false,
//                     }));
//                   }}
//                 >
//                   <ComplainIcon />
//                 </RowButton>
//               )}
//               {!is_deleted && !is_blacklist && user && (
//                 <RowButton
//                   label={
//                     <span className="organization-module__menu-hide-from-feed-btn-label">
//                       {translate("Скрыть с ленты", "shop.hideFromHomeFeed")}
//                     </span>
//                   }
//                   onClick={async () => {
//                     const res = await addToBlacklist(id);
//                     if (res && res.success) {
//                       dispatch(
//                         setOrganizationDetail({
//                           data: {
//                             ...orgDetail.data,
//                             is_blacklist: true,
//                           },
//                         })
//                       );
//                     } else {
//                       Notify.error({
//                         text: translate(
//                           "Не удалось скрыть организацию",
//                           "shop.failedToHideOrg"
//                         ),
//                       });
//                     }
//                     setState((prevState) => ({
//                       ...prevState,
//                       showMenu: false,
//                     }));
//                   }}
//                   showArrow={false}
//                 >
//                   <EyeOffIcon />
//                 </RowButton>
//               )}
//               {!is_deleted && is_blacklist && user && (
//                 <RowButton
//                   label={
//                     <span className="organization-module__menu-show-in-feed-btn-label">
//                       {translate("Показать на ленте", "shop.showInFeed")}
//                     {/* </span */}
//                   }
//                   onClick={async () => {
//                     const res = await removeFromBlacklist(id);
//                     if (res && res.success) {
//                       dispatch(
//                         setOrganizationDetail({
//                           data: {
//                             ...orgDetail.data,
//                             is_blacklist: false,
//                           },
//                         })
//                       );
//                     } else {
//                       Notify.error({ text: translate("") });
//                     }
//                     setState((prevState) => ({
//                       ...prevState,
//                       showMenu: false,
//                     }));
//                   }}
//                   showArrow={false}
//                 >
//                   <EyeIcon />
//                 </RowButton>
//               )}
//               {(permissions?.can_edit_organization ||
//                 permissions?.can_edit_partner) &&
//                 !is_deleted && (
//                   <>
//                     {(!subscription_status ||
//                       subscription_status === "test" ||
//                       subscription_status === "expired") && (
//                       <RowButton
//                         type={ROW_BUTTON_TYPES.button}
//                         label={translate(
//                           "Тарифы подписки",
//                           "org.subscriptionPlans"
//                         )}
//                         showArrow={false}
//                         onClick={() => {
//                           setState((prev) => ({ ...prev, showMenu: false }));
//                           history.push({
//                             pathname: `/organizations/${id}/subscription-plans`,
//                             state: {
//                               countryCode: orgDetail.data.country?.code || "AE",
//                             },
//                           });
//                         }}
//                       >
//                         <NotActiveSub />
//                       </RowButton>
//                     )}

//                     {subscription_status === "active" && (
//                       <RowButton
//                         type={ROW_BUTTON_TYPES.link}
//                         label={translate(
//                           "Активная подписка",
//                           "org.activeSubscription"
//                         )}
//                         showArrow={false}
//                         to={`/organizations/${id}/subscription-detail`}
//                       >
//                         <ActiveSub />
//                       </RowButton>
//                     )}
//                   </>
//                 )}
//             </React.Fragment>
//           )}

//           {menu === 2 && permissions.can_edit_organization && !is_deleted && (
//             <div className="discount-wallpaper">
//               <form
//                 onSubmit={(e) => e.preventDefault()}
//                 className="discount-wallpaper__form"
//               >
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 20 20"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     d="M7.40972 0.100098L12.9233 0.101783C14.8672 0.122157 15.8489 0.330036 16.8666 0.874298C17.8382 1.39395 18.6062 2.16189 19.1258 3.13354C19.7003 4.20776 19.9 5.2419 19.9 7.40981V12.5904C19.9 14.7583 19.7003 15.7924 19.1258 16.8666C18.6062 17.8383 17.8382 18.6062 16.8666 19.1259C15.7923 19.7004 14.7582 19.9001 12.5903 19.9001H7.40972C5.24181 19.9001 4.20767 19.7004 3.13345 19.1259C2.1618 18.6062 1.39385 17.8383 0.874206 16.8666C0.299707 15.7924 0.100006 14.7583 0.100006 12.5904L0.101691 7.07676C0.122066 5.13293 0.329944 4.15123 0.874206 3.13354C1.39385 2.16189 2.1618 1.39395 3.13345 0.874298C4.20767 0.299799 5.24181 0.100098 7.40972 0.100098ZM13.0895 11.2917L9.36163 15.822C9.04614 16.2054 8.47975 16.2608 8.09587 15.9459L6.05405 14.271L3.24818 17.0266C3.46765 17.2234 3.71264 17.3944 3.98233 17.5386C4.67826 17.9108 5.35466 18.0665 6.84755 18.0951L7.40972 18.1001H12.5903L13.1525 18.0951C14.4697 18.0698 15.1513 17.9457 15.7715 17.6611L16.0177 17.5386C16.6757 17.1867 17.1867 16.6757 17.5385 16.0178C17.6384 15.8311 17.7226 15.6459 17.793 15.446L13.0895 11.2917ZM12.5903 1.9001H7.40972L6.84755 1.90508C5.5303 1.93035 4.84871 2.05451 4.2285 2.33905L3.98233 2.46156C3.32436 2.81345 2.81336 3.32445 2.46147 3.98242L2.33896 4.22859C2.01648 4.9315 1.90001 5.71323 1.90001 7.40981V12.5904L1.90499 13.1526C1.92672 14.2851 2.02154 14.9477 2.22853 15.5054L5.36937 12.4205C5.69735 12.0984 6.21538 12.0752 6.57081 12.3668L8.54271 13.9843L12.2919 9.42823C12.6155 9.03488 13.2009 8.98833 13.5827 9.32557L18.0914 13.3106C18.0928 13.2589 18.094 13.2063 18.095 13.1526L18.1 12.5904V7.40981L18.095 6.84764C18.0697 5.53039 17.9456 4.8488 17.6611 4.22859L17.5385 3.98242C17.1867 3.32445 16.6757 2.81345 16.0177 2.46156C15.3218 2.08938 14.6454 1.93372 13.1525 1.90508L12.5903 1.9001ZM6.50001 5.0001C7.32843 5.0001 8.00001 5.67167 8.00001 6.5001C8.00001 7.32853 7.32843 8.0001 6.50001 8.0001C5.67158 8.0001 5.00001 7.32853 5.00001 6.5001C5.00001 5.67167 5.67158 5.0001 6.50001 5.0001Z"
//                     fill="#3F8AE0"
//                   />
//                 </svg>

//                 <label
//                   htmlFor="discount-image"
//                   className={classnames(
//                     "discount-wallpaper__label f-17",
//                     cardImageLoading && "discount-wallpaper__label-loading"
//                   )}
//                 >
//                   {cardImageLoading
//                     ? translate(
//                         "Смена фона карты",
//                         "org.discountBackgroundChanging"
//                       )
//                     : translate(
//                         "Сменить на свой фон",
//                         "org.discountBackgroundChangeOwn"
//                       )}
//                 </label>
//                 <input
//                   type="file"
//                   id="discount-image"
//                   name="discount-image"
//                   onChange={handleUpload}
//                   disabled={cardImageLoading}
//                 />
//               </form>

//               <div className="discount-wallpaper__recommendations">
//                 <h6 className="f-16 f-600">
//                   {translate("Рекомендации", "app.suggestions")}
//                 </h6>
//                 <ul className="discount-wallpaper__list">
//                   {cardBackgrounds.loading && (
//                     <div>{translate("Загрузка...", "app.loading")}</div>
//                   )}
//                   {cardBackgrounds.data &&
//                     cardBackgrounds.data.map((bg) => (
//                       <li
//                         key={bg.id}
//                         className="discount-wallpaper__item"
//                         onClick={() => setCardBackground(bg.id)}
//                       >
//                         <img src={bg.file} alt={bg.name} />
//                       </li>
//                     ))}
//                 </ul>
//               </div>
//             </div>
//           )}

//           {menu === 3 && (
//             <>
//               {permissions && permissions.can_sale && !is_deleted && (
//                 <RowButton
//                   label={translate("Провести сделку", "org.makeDiscount")}
//                   showArrow={false}
//                   onClick={() => {
//                     dispatch(
//                       setPreOrganization({
//                         id: id,
//                         image: image,
//                         title: title,
//                         types: types,
//                         currency: currency,
//                         online_payment_activated,
//                       })
//                     );
//                     history.push(`/proceed-discount`);
//                   }}
//                 >
//                   <QRIcon />
//                 </RowButton>
//               )}

//               {permissions && permissions.can_sale && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.button}
//                   label={translate(
//                     "Очистить очередь заказов",
//                     "shop.clearOrderCount"
//                   )}
//                   showArrow={false}
//                   onClick={() => {
//                     resetPurchaseID(id).finally(() => {
//                       toggleMenu(false, null);
//                     });
//                   }}
//                 >
//                   <RefreshIcon />
//                 </RowButton>
//               )}
//             </>
//           )}

//           {menu === 4 && (
//             <>
//               {permissions && permissions.can_edit_organization && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.link}
//                   label={translate("Редактирование", "app.edit")}
//                   showArrow={false}
//                   to={`/organizations/${id}/edit-main`}
//                 >
//                   <EditIcon />
//                 </RowButton>
//               )}

//               {permissions &&
//                 permissions.can_edit_organization &&
//                 !is_deleted && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Управление скидками",
//                       "org.discountManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/edit-discounts`}
//                   >
//                     <DiscountIcon />
//                   </RowButton>
//                 )}

//               {permissions &&
//                 permissions.can_edit_organization &&
//                 !is_deleted && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Управление купонами",
//                       "org.couponsManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/coupons`}
//                   >
//                     <CouponIcon />
//                   </RowButton>
//                 )}

//               {permissions && permissions.can_edit_partner && !is_deleted && (
//                 <RowButton
//                   type={ROW_BUTTON_TYPES.link}
//                   label={translate(
//                     "Управление партнерами",
//                     "org.partnerManage"
//                   )}
//                   showArrow={false}
//                   to={`/organizations/${id}/partners`}
//                 >
//                   <PartnersIcon />
//                 </RowButton>
//               )}

//               {permissions &&
//                 permissions.can_edit_organization &&
//                 !is_deleted && (
//                   <RowButton
//                     type={ROW_BUTTON_TYPES.link}
//                     label={translate(
//                       "Настройки проводимых акций",
//                       "org.promotionManage"
//                     )}
//                     showArrow={false}
//                     to={`/organizations/${id}/promotion`}
//                   >
//                     <PromotionBlueIcon />
//                   </RowButton>
//                 )}
//             </>
//           )}
//         </div>
//       </MobileMenu>

//       {invocieDialog && (
//         <Dialog
//           open={invocieDialog}
//           title={translate("Оплата инвойса", "app.paymentInvoice")}
//           description={translate(
//             "Инвойс отправлен на указанную Вами почту. Далее следуйте инструкции:\n\n" +
//               "• Оплатите инвойс по указанным реквизитам через банк.\n" +
//               "• Сохраните квитанцию или скриншот перевода.\n" +
//               "• Отправьте подтверждение (скрин/чек) на e-mail: apofizpay@gmail.com\n" +
//               "   с фразой: “Invoice number, Payment completed. Please confirm receipt.”",
//             "invoice.payed"
//           )}
//           buttons={[
//             {
//               title: translate("Ок", "common.ok"),
//               onClick: () => dispatch(setInvoiceDialog(false)),
//             },
//           ]}
//         />
//       )}

//       {showOrganizationQR && (
//         <React.Suspense fallback={<Preloader />}>
//           <OrganizationQR
//             org={orgDetail.data}
//             full_location={full_location}
//             onClose={() => setShowOrganizationQR(false)}
//           />
//         </React.Suspense>
//       )}

//       {showPaymentMethods && (
//         <PaymentMethodsLayer
//           orgID={id}
//           isOpen={showPaymentMethods}
//           onBack={() => setShowPaymentMethods(false)}
//         />
//       )}
//     </React.Fragment>
//   );
// };

// export default OrganizationModule;
