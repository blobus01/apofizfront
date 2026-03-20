import React, { useEffect, useState, useCallback, useRef } from "react"; // Добавляем useCallback
import MobileTopHeader from "@components/MobileTopHeader";
import { useHistory, useLocation, useParams } from "react-router-dom";
import classNames from "classnames";
import OrganizationHeader from "@components/OrganizationHeader";
import ToggleButton from "@components/UI/ToggleButton";
import { translate } from "@locales/locales";
import { StandardButton } from "@components/UI/Buttons";
import axios from "../../axios-api";
import "./index.scss";

// Импортируем Redux хуки и действия
import { useDispatch, useSelector } from "react-redux";
import {
  setGlobalMenu,
  clearTranslateItems,
  setViews,
} from "@store/actions/commonActions"; // Добавляем setViews, если TextLinkifier его использует
import { MENU_TYPES } from "@components/GlobalMenu"; // Импортируем MENU_TYPES
import { MenuDots, SocialIcon } from "@components/UI/Icons";
import Preloader from "@components/Preloader";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { LINK_TYPES, SLIDE_TYPES } from "@common/constants";
import Linker from "@components/UI/Linker";
import TruncatedText from "@components/UI/TruncatedText";
import TextLinkifier from "@components/TextLinkifier";
import YoutubeVideoCard from "./YoutubeVideoCard";
import useDialog from "@components/UI/Dialog/useDialog";
import moment from "moment";
import PostZoomSlider from "@components/PostZoomSlider";
import UrlParser from "js-video-url-parser";
import { VIEW_TYPES } from "@components/GlobalLayer";
import PageHelmet from "@components/PageHelmet";
// import TruncatedText from "@components/UI/TruncatedText"; // Убедитесь, что импортировано
// import TextLinkifier from "@components/UI/TextLinkifier"; // Убедитесь, что импортировано
// import Preloader from "@components/Preloader"; // Убедитесь, что импортировано
// import { SocialIcon, MenuDots } from "@ui/Icons"; // Убедитесь, что импортировано (для кнопок перевода)

const MediaModal = ({
  isOpen,
  media,
  onClose,
  allMedia,
  currentIndex,
  onNavigate,
}) => {
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allMedia.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen || !media) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        height: "100vh",
        paddingBottom: "30px",
      }}
      onClick={onClose}
    >
      <div className="container" style={{ position: "relative" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            backgroundColor: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "30px",
            cursor: "pointer",
            zIndex: 1001,
          }}
        >
          &times;
        </button>

        {/* Navigation buttons */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={currentIndex === 0}
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                zIndex: 1001,
                opacity: currentIndex === 0 ? 0.5 : 1,
              }}
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={currentIndex === allMedia.length - 1}
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor:
                  currentIndex === allMedia.length - 1
                    ? "not-allowed"
                    : "pointer",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                zIndex: 1001,
                opacity: currentIndex === allMedia.length - 1 ? 0.5 : 1,
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Counter */}
        {allMedia.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "31px",
              left: "20px",
              color: "#fff",
              fontSize: "16px",
              zIndex: 1001,
            }}
          >
            {currentIndex + 1} / {allMedia.length}
          </div>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {media.type === "image" && (
            <img
              src={media.url}
              alt="App Media"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {media.type === "video" && (
            <div style={{ width: "100%", maxWidth: "1200px" }}>
              <iframe
                width="100%"
                height="100%"
                src={media.url}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  aspectRatio: "16/9",
                }}
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function AppsDetailPage() {
  const location = useLocation();
  const history = useHistory();
  const { id } = useParams();
  const [appDetail, setAppDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  // Получаем состояние перевода из Redux store
  const {
    loading: loadingTranslateItem,
    data: translation,
    currentCode,
  } = useSelector((state) => state.commonStore.translateItem);

  const [state, setState] = useState({
    showDiscounts: false,
    selectedCard: null,
    cardImageLoading: false,
    showMenu: false,
    showContacts: "",
    menu: null,
    isOriginalTranslation: true, // Локальное состояние для перевода
    showLangMenu: false, // Локальное состояние для меню языка
    langCode: null,
  });
  const [scrolled, setScrolled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dispatch = useDispatch(); // Инициализируем dispatch
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { confirm } = useDialog();

  // Add modal state variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState([]);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !sliderRef.current) return;

    isDraggingRef.current = true;
    setIsDragging(true);

    startXRef.current =
      e.clientX - sliderRef.current.getBoundingClientRect().left;
    scrollLeftRef.current = sliderRef.current.scrollLeft;

    document.body.style.cursor = "grabbing";
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !sliderRef.current) return;

      const x = e.clientX - sliderRef.current.getBoundingClientRect().left;
      const walk = x - startXRef.current;
      sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = "default";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, []);
  const fetchAppDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/applications/${id}/`);
      setAppDetail(response.data);

      // Создаем массив всех медиа с правильной структурой
      const images = response.data.app_images.map((img) => ({
        type: "image",
        url: img.large || img.file,
        id: img.id,
      }));

      const videos = response.data.youtube_links.map((link) => ({
        type: "video",
        url: link,
        id: `video-${link}`,
      }));

      setAllMedia([...images, ...videos]);
    } catch (err) {
      setError(err.message || "Error fetching application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Application ID not provided.");
      setLoading(false);
      return;
    }

    fetchAppDetail();

    // Очищаем состояние перевода при размонтировании компонента или изменении ID
    return () => {
      dispatch(clearTranslateItems());
    };
  }, [id, dispatch]); // Зависимости эффекта

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    showDiscounts,
    menu,
    showMenu,
    showContacts,
    selectedCard,
    isOriginalTranslation,
    showLangMenu, // Используем локальное состояние showLangMenu
  } = state;

  // a1f75694

  // 7f03cbd4

  const handleBack = () => {
    if (location.state && location.state.fromChildRoute) {
      history.push("/apps");
    } else {
      history.goBack();
    }
  };

  const toggleShowContacts = () =>
    setState({ ...state, showContacts: !showContacts });

  const onCardEditClick = (cardID) =>
    setState({
      ...state,
      selectedCard: cardID,
      menu: 2,
      showMenu: true,
    });

  // Обработчик открытия меню выбора языка перевода
  const onShowLangMenu = useCallback(() => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_lang_menu, // Используем тип меню для языка
        menuLabel: translate("Язык перевода", "app.translationLanguage"),
        onSelectLang: () =>
          setState((prevState) => ({
            ...prevState,
            isOriginalTranslation: false,
          })), // При выборе языка показываем переведенный текст
        post: {
          id,
          title: appDetail.title,
          description: appDetail.description,
        }, // Передаем данные приложения
        item: "org", // Указываем, что это приложение
        currentCode, // Текущий код языка
      })
    );
  }, [dispatch, id, appDetail, currentCode]); // Зависимости useCallback

  // Обработчик переключения между оригиналом и переводом
  const showTranslation = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isOriginalTranslation: !prevState.isOriginalTranslation,
    }));
  }, []);

  // Если данные загружаются или есть ошибка, отобразим это
  if (loading) {
    return <div>{translate("Загрузка...", "app.loading")}</div>;
  }

  if (error) {
    return (
      <div>
        {translate("Ошибка", "common.error")}: {error}
      </div>
    );
  }

  // Если данных нет после загрузки (например, приложение не найдено)
  if (!appDetail) {
    return <div>{translate("Приложение не найдено", "app.notFound")}</div>;
  }

  // Деструктуризация данных приложения для удобства
  const {
    title,
    description,
    types,
    image,
    selected_banner,
    app_images,
    app_link,
    price,
    instagram_link,
    youtube_links,
    support_link,
    company_name,
    terms_link,
    is_paid,
    // is_deleted // Убедитесь, что это поле есть в ответе API, если нужно
  } = appDetail;

  const openMiniApp = () => {
    if (!appDetail?.app_link) {
      dispatch(
        setGlobalMenu({
          type: MENU_TYPES.notification,
          message: translate("Ссылка на приложение отсутствует", "app.no_link"),
          status: "error",
        })
      );
      return;
    }

    // Добавляем параметры авторизации к URL
    const url = new URL(appDetail.app_link);

    // Открываем приложение в новом окне с определенными размерами
    const width = 400;
    const height = 500;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url.toString(),
      "miniApp",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  const handlePayment = async () => {
    try {
      // Get current UTC offset in minutes
      setIsPaymentLoading(true);
      const utcOffsetMinutes = moment().utcOffset();

      // Prepare request data
      const requestData = {
        app: +appDetail.id,
        utc_offset_minutes: utcOffsetMinutes,
      };

      // Make API request to create transaction
      const response = await axios.post("/applications/purchase/", requestData);

      if (response.data && response.data.transaction_id) {
        // Navigate to payment selection page with transaction ID
        history.push(
          `/organizations/${appDetail.id}/payment-methods?transaction=${response.data.transaction_id}`
        );
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Show error message to user
      await confirm({
        title: translate("Ошибка", "common.error"),
        description: translate(
          "Не удалось создать транзакцию. Пожалуйста, попробуйте еще раз.",
          "payment.transactionError"
        ),
        confirmTitle: translate("OK", "common.ok"),
        cancelTitle: false,
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const onOpenMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.app_card_menu,
        menuLabel: translate("Инструменты", "app.tools"),
        post: appDetail,
        canEdit: appDetail.is_owner,
        onCloseApp: () => {
          if (!id) {
            setError("Application ID not provided.");
            setLoading(false);
            return;
          }
          fetchAppDetail();
        },
      })
    );
  };

  const openModal = (mediaType, url, index = 0) => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
    // Устанавливаем глобальный флаг для блокировки изменения z-index в MobileTopHeader
    window.isModalOpen = true;
    // Уменьшаем z-index для хедера и навбара
    const headerElements = document.querySelectorAll(
      ".mobile-top-header__wrap, .navbar__wrap"
    );
    headerElements.forEach((el) => {
      if (el) {
        el.style.setProperty("z-index", "1", "important");
      }
    });
    // Переопределяем z-index для .mobile-top-header
    const mobileHeaderElements =
      document.querySelectorAll(".mobile-top-header");
    mobileHeaderElements.forEach((el) => {
      if (el) {
        el.style.setProperty("z-index", "1", "important");
      }
    });
    // Устанавливаем position: inherit для .navbar
    const navbarElements = document.querySelectorAll(".navbar__wrap");
    navbarElements.forEach((el) => {
      if (el) {
        el.style.setProperty("position", "inherit", "important");
      }
    });
    setSelectedMedia({ type: mediaType, url: url });
    setCurrentMediaIndex(index);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
    // Убираем глобальный флаг
    window.isModalOpen = false;
    // Восстанавливаем z-index для хедера и навбара
    const headerElements = document.querySelectorAll(
      ".mobile-top-header__wrap, .navbar__wrap"
    );
    headerElements.forEach((el) => {
      if (el) {
        el.style.removeProperty("z-index");
      }
    });
    // Восстанавливаем z-index для .mobile-top-header
    const mobileHeaderElements =
      document.querySelectorAll(".mobile-top-header");
    mobileHeaderElements.forEach((el) => {
      if (el) {
        el.style.removeProperty("z-index");
      }
    });
    // Восстанавливаем position для .navbar
    const navbarElements = document.querySelectorAll(".navbar__wrap");
    navbarElements.forEach((el) => {
      if (el) {
        el.style.removeProperty("position");
      }
    });
    setSelectedMedia(null);
  };

  const slides = [];
  app_images?.map((image) =>
    slides.push({ type: SLIDE_TYPES.image, ...image })
  );
  youtube_links?.forEach((url, index) => {
    const info = UrlParser.parse(url);
    info &&
      info.id &&
      info.provider === "youtube" &&
      slides.push({
        type: SLIDE_TYPES.youtube_video,
        videoID: `${id}-${index}-${info.id}`,
        link: `https://www.youtube.com/embed/${info.id}?autoplay=1`,
        preview: `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`,
        preview2: `https://img.youtube.com/vi/${info.id}/0.jpg`,
      });
  });

  // const is_deleted = appDetail.is_deleted; // Используйте, если поле есть

  return (
    <>
      <PageHelmet
        title={title}
        description={description}
        image={image && image.medium}
      />
      <div className="organization-module apps-module">
        <MobileTopHeader
          onBack={() => handleBack()}
          onMenu={() => onOpenMenu()}
          title={
            // Отображаем переведенное название, если есть и isOriginalTranslation false
            !isOriginalTranslation && translation && translation.title
              ? translation.title
              : title || "" // Иначе оригинальное название или пустая строка
          }
          // verification_status={orgDetail.data.verification_status} // Эти данные отсутствуют в данном API
          className={classNames("organization-module__top", {
            "organization-module__top--scrolled": scrolled,
          })}
        />
        {/* Баннер приложения */}
        <div
          className="organization-module__background"
          style={
            selected_banner // Используем selected_banner из appDetail
              ? {
                  "--banner-image": `url(${selected_banner.image?.file})`,
                  "--default-banner-opacity": "0",
                }
              : {
                  "--default-banner-opacity": "1",
                }
          }
        ></div>
        <div className="organization-module__content__header">
          {/* Заголовок приложения (используем OrganizationHeader или свой компонент) */}
          {/* Передаем данные приложения в OrganizationHeader */}
          <OrganizationHeader
            id={id} // Передаем ID из URL
            // subscribers={subscribers} // Данные подписчиков отсутствуют в этом API ответе
            title={
              !isOriginalTranslation && translation && translation.title
                ? translation.title
                : title
            } // Название приложения (OrganizationHeader, вероятно, сам обрабатывает перевод названия, если ему передать translation)
            image={image} // Изображение приложения
            types={types} // Типы/категории приложения
            categories={
              types?.map((type) => type.title).join(", ") ||
              translate("Категория приложения", "apps.appCategory")
            }
            // isBanned={orgDetail.data.is_banned} // Эти данные, вероятно, из другого источника
            // isSubscribed={is_subscribed}
            // isPrivate={orgDetail.data.is_private}
            // isWholesale={orgDetail.data.is_wholesale}
            // perm={orgDetail.data.permissions}
            // verification_status={orgDetail.data.verification_status}
            // user={user}
            className="organization-module__header"
          />
          <div className="tools-wrap">
            <div className="organization-module__tools">
              {/* Кнопки действий */}
              {(app_link ||
                instagram_link ||
                youtube_links?.length > 0 ||
                support_link ||
                company_name ||
                terms_link) && (
                <ToggleButton
                  label={translate("Контакты и web", "app.contactsAndWeb")}
                  className="organization-module__contacts-btn toggle-btn"
                  toggled={showContacts}
                  onClick={toggleShowContacts}
                />
              )}

              {!is_paid && price ? (
                <button
                  onClick={handlePayment}
                  disabled={isPaymentLoading} // Ваша логика покупки
                  className="organization-module__create-product-btn f-14 f-600"
                >
                  <span className="tl">
                    {isPaymentLoading ? (
                      translate("Загрузка...", "app.loading")
                    ) : (
                      <>
                        {translate("Купить", "apps.payment")} {price} USDT
                      </>
                    )}
                  </span>
                </button>
              ) : (
                <button
                  // onClick={onAdd} // Ваша логика покупки
                  className="organization-module__create-product-btn f-14 f-600"
                  onClick={openMiniApp}
                >
                  <span className="tl">
                    {translate("Открыть", "apps.open")}
                  </span>
                </button>
              )}
            </div>
            {/* Блок с контактами и ссылками */}
            <div
              className={classNames(
                "organization-module__contacts",
                showContacts && "organization-module__contacts-show"
              )}
            >
              {/* Отображаем ссылки */}
              {app_link && (
                <div className="contact-item">
                  {" "}
                  {/* Обертка для заголовка и ссылки */}
                  <p className="contact-label">
                    {translate("Ссылка на приложение", "app.linkToApp")}:
                  </p>{" "}
                  {/* Заголовок */}
                  <Linker type={LINK_TYPES.web} value={app_link} />
                </div>
              )}
              {instagram_link && (
                <div className="contact-item">
                  <p className="contact-label">
                    {translate("Instagram", "app.instagram")}:
                  </p>
                  <Linker type={LINK_TYPES.web} value={instagram_link} />
                </div>
              )}
              {support_link && (
                <div className="contact-item">
                  <p className="contact-label">
                    {translate("Поддержка", "app.support")}:
                  </p>
                  <Linker type={LINK_TYPES.web} value={support_link} />
                </div>
              )}
              {/* Проверьте, является ли company_name ссылкой или просто текстом */}
              {company_name && (
                <div className="contact-item">
                  {/* Если это просто текст, отобразите его как текст */}
                  <p className="contact-label">
                    {translate("Компания", "app.company")}:
                  </p>
                  <p className="contact-value">{company_name}</p>{" "}
                  {/* Отображаем как текст */}
                </div>
              )}
              {terms_link && (
                <div className="contact-item">
                  <p className="contact-label">
                    {translate("Оферта", "app.terms")}:
                  </p>
                  <Linker type={LINK_TYPES.web} value={terms_link} />
                </div>
              )}
            </div>
            {support_link && (
              <a
                href={support_link}
                target="_blank"
                className="organization-module__assistant"
                rel="noreferrer"
              >
                {translate("Связаться с тех поддержкой", "app.contactSupport")}
              </a>
            )}
          </div>

          <>
            {!isOriginalTranslation && translation ? (
              <TruncatedText className="organization-module__description f-14">
                <TextLinkifier
                  text={translation.description}
                  getHashtagLink={(hashtag) =>
                    `/organizations/${id}/search?search=${hashtag}`
                  }
                />
              </TruncatedText>
            ) : (
              <TruncatedText className="organization-module__description f-14">
                <TextLinkifier
                  text={description}
                  getHashtagLink={(hashtag) =>
                    `/organizations/${id}/search?search=${hashtag}`
                  }
                />
              </TruncatedText>
            )}

            <div className="organization-module__translation">
              {isOriginalTranslation ? (
                <button
                  className="organization-module__translation-text f-13 f-500"
                  type="button"
                  onClick={!translation ? onShowLangMenu : showTranslation}
                >
                  {translate("Показать перевод", "app.showTranslation")}
                </button>
              ) : (
                <button
                  className="organization-module__translation-text f-13 f-500"
                  type="button"
                  onClick={!translation ? onShowLangMenu : showTranslation}
                >
                  {!loadingTranslateItem &&
                    translate(
                      "Показать оригинал",
                      "app.showOriginalTranslation"
                    )}
                </button>
              )}
              <button
                type="button"
                className="organization-module__translation-icon"
                onClick={onShowLangMenu}
              >
                {showLangMenu ? <MenuDots /> : <SocialIcon />}
              </button>
              {loadingTranslateItem && (
                <Preloader className="organization-module__translation-loading" />
              )}
            </div>
          </>

          {/* Фото приложения */}
          {app_images && app_images.length > 0 && (
            <div className="app-images-gallery">
              <h3>
                {translate("Фото и видео приложения", "app.appPhotosAndVideos")}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "20px", // Расстояние между видеокарточками
                  overflowX: "auto", // Включаем горизонтальный скроллинг
                  scrollbarWidth: "none" /* Для Firefox */,
                  msOverflowStyle: "none" /* Для Internet Explorer 10+ */,
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect:
                    "none" /* Предотвращает выделение текста при перетаскивании */,
                }}
                className="youtube-video-slider" // Добавим класс для стилей слайдера
                ref={sliderRef} // Применяем реф к прокручиваемому div
                onMouseDown={handleMouseDown}
              >
                {app_images.map((img, index) => (
                  <div
                    key={img.id}
                    style={{
                      backgroundImage: `url(${img.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer",
                    }}
                    className="app-images-gallery__photo"
                    onClick={(e) =>
                      dispatch(
                        setViews({
                          type: VIEW_TYPES.slideshow,
                          slides,
                          activeSlide: e.target.getAttribute("data-slide"),
                        })
                      )
                    }
                  ></div>
                ))}
                {youtube_links.map((videoUrl, index) => (
                  <YoutubeVideoCard
                    key={videoUrl}
                    embedUrl={videoUrl}
                    onClick={(e) =>
                      dispatch(
                        setViews({
                          type: VIEW_TYPES.slideshow,
                          slides,
                          activeSlide: e.target.getAttribute("data-slide"),
                        })
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}
          <MediaModal
            isOpen={isModalOpen}
            media={selectedMedia}
            onClose={closeModal}
            allMedia={allMedia}
            currentIndex={currentMediaIndex}
            onNavigate={(index) => {
              setCurrentMediaIndex(index);
              if (allMedia[index]) {
                setSelectedMedia(allMedia[index]);
              }
            }}
          />
        </div>
        {/* Модальные окна и меню, если есть */}
        {/* <MobileMenu ... /> */}
        {/* <OrganizationQR ... /> */}
        {/* <PaymentMethodsLayer ... /> */}
      </div>
    </>
  );
}

export default AppsDetailPage;
