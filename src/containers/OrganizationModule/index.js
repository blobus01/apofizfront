import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames, * as classnames from "classnames";
import { Link, useLocation, useHistory } from "react-router-dom";
import MobileTopHeader from "../../components/MobileTopHeader";
import TruncatedText from "../../components/UI/TruncatedText";
import DiscountSlider from "../../components/DicsountSlider";
import DiscountCard from "../../components/Cards/DiscountCard";
import ToggleButton from "../../components/UI/ToggleButton";
import { StandardButton } from "@ui/Buttons";
import OrganizationHeader from "../../components/OrganizationHeader";
import PartnersStatistic from "../../components/PartnersStatistic";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import { VIEW_TYPES } from "@components/GlobalLayer";
import MobileMenu from "../../components/MobileMenu";
import Linker from "../../components/UI/Linker";
import Notify from "../../components/Notification";
import PageHelmet from "../../components/PageHelmet";
import {
  canGoBack,
  checkForValidFile,
  EMAIL_REGEX,
  formatWithCommas,
  shortenNumber,
} from "@common/helpers";
import {
  ALLOWED_FORMATS,
  DISCOUNT_TYPES,
  LINK_TYPES,
  POSTS_VIEWS,
  WORKING_TIME_STATUSES,
} from "@common/constants";
import { setPreOrganization } from "@store/actions/discountActions";
import {
  clearOrganizationCategoryCache,
  editDiscountImage,
  getOrganizationDetail,
  getOrganizationPosts,
  setOrganizationDetail,
} from "@store/actions/organizationActions";
import { subscribeOrganization } from "@store/actions/subscriptionActions";
import {
  clearTranslateItems,
  setGlobalMenu,
  setPlayingVideoID,
  setViews,
  uploadFile,
} from "@store/actions/commonActions";
import {
  addToBlacklist,
  removeFromBlacklist,
  resetPurchaseID,
} from "@store/services/organizationServices";
import { ButtonMessenger, ButtonShopDiscounts } from "@ui/ButtonShopDiscounts";
import { DeactivatedOrgPlaceholder } from "./deactivated";
import PrivateOrg from "./privated";
import OrganizationHotlinks from "../OrganizationHotlinks";
import { translate } from "@locales/locales";
import OrganizationPosts from "./posts";
import useDialog from "../../components/UI/Dialog/useDialog";
import { OrganizationWorkingTime } from "@components/OrganizationWorkingTime";
import OrganizationAverageCheck from "../../components/OrganizationAverageCheck";
import {
  AddIcon,
  ComplainIcon,
  CouponIcon,
  CryptoCurrency,
  DiscountIcon,
  EditIcon,
  ExcelIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  LocationIcon,
  MarketIcon,
  MenuDots,
  MessageIcon,
  PartnersIcon,
  PromotionBlueIcon,
  PromotionIcon,
  QRIcon,
  QuestionIcon,
  ReceiptCutOff,
  RefreshIcon,
  ScanIcon,
  SearchIcon,
  SettingsCheck,
  ShareIcon,
  SocialIcon,
  SubscribeCount,
} from "@ui/Icons";
import Preloader from "../../components/Preloader";
import { MENU_TYPES } from "@components/GlobalMenu";
import TextLinkifier from "../../components/TextLinkifier";
import CreditCardsIcom from "../../components/UI/Icons/CreditCardsIcom";
import PaymentMethodsLayer from "./payment-methods-layer";
import "./index.scss";
import AIIcon, { AppIcon } from "@ui/Icons/AIIcon";
import NewMarkIcon from "@ui/Icons/NewMarkIcon";

import { ReactComponent as SearchIconOrg } from "@assets/icons/searchIcon.svg";
import { ReactComponent as BurgerMenu } from "@assets/icons/burgerMenu.svg";
import { stickyActiveShadow } from "@common/utils";
import api from "@/axios-api";
import { useMediaQuery } from "react-responsive";
import Dialog from "@components/UI/Dialog/Dialog";
import { setInvoiceDialog } from "@store/actions/invoiceActions";
import {
  ActiveSub,
  DownloadApplication,
  DownloadApplicationIcon,
  MaalyPayIcon,
  NotActiveSub,
  ShareApplication,
  ShareApplicationIcon,
} from "./icons";
import { setCurrency } from "@store/actions/currencyActions";
import { setTariffStatus } from "@store/actions/tariffAction";
import { clearAIImages } from "@store/actions/aiImagesActions";
import { clearAiData } from "@store/actions/aiDataAction";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { SET_ARRAY } from "@store/reducers/arrayReducer";
import ScrollContainer from "react-indiana-drag-scroll";
import axios from "axios-api";
import { setOrgDetail } from "@store/actions/orgDetail";

import MobileSearchHeader from "@components/MobileSearchHeader";
import {
  changePostsView,
  getPosts,
  setPostsModifier,
} from "@store/actions/postActions";
import {
  clearSearchSuggestResult,
  getSearchSuggestResult,
} from "@store/actions/homeActions";
import debounce from "lodash.debounce";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import PostGridCard from "@components/Cards/PostGridCard";
import PostFeedCard from "@components/Cards/PostFeedCard";
import { ProductIcon } from "@components/Cards/ReceiptCard/icons";
import ShopControlsWithViewChange from "@components/ShopControls/ShopControlsWithViewChange";
import { RegionInfo } from "@components/UI/RegionInfo";
import SearchForOrgModule from "@components/SearchForOrgModule/SearchForOrgModule";

import maalyPay from "../../assets/images/maalyPay.svg";
import CategoryFilterView from "@components/CategoryFilterView";
import CategoryFilterOrg from "@components/CategoryFilterOrg/CategoryFilterOrg";
import WorkTimeContent from "@components/WorkTimeContent/WorkTimeContent";
import LinkerComp from "@components/LinkerComp/LinkerComp";
import Loader from "@components/UI/Loader";

const OrganizationQR = React.lazy(
  () => import("../../components/OrganizationQR"),
);

const OrganizationSearch = React.lazy(
  () => import("../../components/OrganizationSearch"),
);

const LAYERS = {
  filters: "filters",
};

const OrganizationModule = (props) => {
  const MENUS = [
    translate("Настройки", "app.settings"),
    translate("Инструменты", "app.tools"),
    translate("Обои", "app.wallpapers"),
    translate("Касса", "org.cashRegister"),
    translate("Настройки организации", "org.orgSettings"),
    translate("Язык перевода", "app.translationLanguage"),
  ];

  const { orgDetail, history } = props;

  const {
    id,
    title,
    description,
    address,
    phone_numbers,
    discounts,
    partners,
    social_contacts,
    full_location,
    image,
    types,
    subscribers,
    client_status,
    permissions,
    is_subscribed,
    is_deleted,
    is_blacklist,
    currency,
    promo_cashback,
    opens_at,
    closes_at,
    show_contacts,
    is_adult_content,
    time_working,
    need_add_item,
    is_private,
    online_payment_activated,
    subscription_status,
    selected_banner,
    unread_chat_count,
  } = orgDetail.data;

  const user = useSelector((state) => state.userStore.user);

  const cardBackgrounds = useSelector(
    (state) => state.organizationStore.cardBackgrounds,
  );

  const invocieDialog = useSelector((state) => state.invoice.invoiceDialogOpen);

  const {
    loading: loadingTranslateItem,
    data: translation,
    currentCode,
  } = useSelector((state) => state.commonStore.translateItem);
  const {
    loading: loadingConvertingItem,
    data: converted,
    currentConvertedItem,
  } = useSelector((state) => state.commonStore.convertedItems);

  const { confirm, alert } = useDialog();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setOrgDetail(orgDetail));
  }, []);

  const isDesktop = useMediaQuery({ minWidth: 1024 });

  dispatch({ type: SET_ARRAY, payload: cardBackgrounds?.data });

  // COUPON CODE

  // const couponProduct = coupons.filter(coupon => coupon.coupon_type === 'product')

  // console.log("COUPON PRODUCT", couponProduct);

  const [activeTariff, setActiveTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [free, setFree] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    categoryObjects: [],
    ordering: null,
  });

  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    dispatch(clearAIImages());
    dispatch(clearAiData());
  }, []);

  const [couponsProduct, setCouponsProduct] = useState(null);
  const [couponsDiscount, setCouponsDiscount] = useState(null);

  const baseUrl = "https://apofiz.com/organizations/app";
  const applicationLink = id ? `${baseUrl}/${id}` : null;

  const ShareApplication = ({ link, loading }) => {
    const handleShare = async () => {
      if (!link) return;

      try {
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            text: translate("Поделиться приложением", "app.shareApp"),
            url: link,
          });
        } else {
          await navigator.clipboard.writeText(link);
          Notify.success({
            text: translate("Ссылка скопирована", "dialog.linkCopySuccess"),
          });
        }
      } catch (err) {
        console.error("Share error", err);
      }
    };
    return (
      <button
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
        disabled={!link || loading}
        onClick={handleShare}
      >
        <ShareApplicationIcon />
        {loading
          ? "Загрузка..."
          : translate("Поделиться приложением", "app.shareApp")}
      </button>
    );
  };

  const DownloadApplication = ({ id, loading }) => {
    const handleOpen = () => {
      if (!id) return;
      window.open(`/organizations/app/${id}`);
    };

    return (
      <button
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
        disabled={!id || loading}
        onClick={handleOpen}
      >
        <DownloadApplicationIcon />
        {loading
          ? "Загрузка..."
          : translate("Открыть приложение", "org.openApplication")}
      </button>
    );
  };

  useEffect(() => {
    if (permissions === null) return;

    const loadCoupon = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/coupons/${id}/list/`);

        setCouponsProduct(
          res?.data.filter((coupon) => coupon.coupon_type === "product"),
        );
        setCouponsDiscount(
          res?.data.filter((coupon) => coupon.coupon_type === "discount"),
        );
      } catch (error) {
        console.log("COUPON ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, [permissions, id]);

  const apiActive = `/organization/${id}/active-tariff/`;

  useEffect(() => {
    if (permissions !== null) {
      const fetchActiveTariff = async () => {
        try {
          setLoading(true);
          const res = await api.get(apiActive);

          const data = res.data;
          // если сервер вернёт массив — берём первое значение
          const normalized = Array.isArray(data) ? data[0] : data;

          setActiveTariff(normalized);

          dispatch(setTariffStatus(normalized));
        } catch (err) {
          setError(err);
          setActiveTariff(null);
        } finally {
          setLoading(false);
        }
      };

      fetchActiveTariff();
    }
  }, []);

  const tariffStatus = useSelector((state) => state.tariffStatus);

  console.log(tariffStatus)

  const [state, setState] = useState({
    showDiscounts: false,
    selectedCard: null,
    cardImageLoading: false,
    showMenu: false,
    showContacts: false,
    menu: null,
    isOriginalTranslation: true,
    showLangMenu: false,
    langCode: null,
  });

  useEffect(() => {
    if (currency) {
      dispatch(setCurrency(currency));
    }
  }, [currency]);

  const [showOrganizationQR, setShowOrganizationQR] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const location = useLocation();
  const [activeDiscountTab, setActiveDiscountTab] = useState("cumulative");
  const tabsRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [openApp, setOpenApp] = useState(false);

  const onDownloadApp = () => {
    setOpenApp(true);
  };

  // Drag-to-scroll handlers for tabs
  // const onTabsMouseDown = (e) => {
  //   isDragging.current = true;
  //   startX.current = e.pageX - tabsRef.current.offsetLeft;
  //   scrollLeft.current = tabsRef.current.scrollLeft;
  //   if (tabsRef.current) tabsRef.current.classList.add("dragging");
  // };

  // const onTabsMouseMove = (e) => {
  //   if (!isDragging.current) return;
  //   e.preventDefault();
  //   const x = e.pageX - tabsRef.current.offsetLeft;
  //   const walk = x - startX.current;
  //   tabsRef.current.scrollLeft = scrollLeft.current - walk;
  // };

  // const onTabsMouseUp = () => {
  //   isDragging.current = false;
  //   if (tabsRef.current) tabsRef.current.classList.remove("dragging");
  // };

  // const onTabsMouseLeave = () => {
  //   isDragging.current = false;
  //   if (tabsRef.current) tabsRef.current.classList.remove("dragging");
  // };

  const {
    showDiscounts,
    menu,
    showMenu,
    showContacts,
    selectedCard,
    isOriginalTranslation,
    cardImageLoading,
    showLangMenu,
  } = state;

  const [scrolled, setScrolled] = useState(false);
  const prevScrollY = useRef(window.scrollY);
  const [dialog, setDialog] = useState(true);

  const hotlinksScrollRef = useRef(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // refs for each DiscountSlider
  const cumulativeSwiperRef = useRef(null);
  const fixedSwiperRef = useRef(null);
  const cashbackSwiperRef = useRef(null);
  const discountCouponRef = useRef(null);
  const productCouponRef = useRef(null);

  const { page, subcategories, feedView, posts, hasMore, isNext } = useSelector(
    (state) => state.postsStore.organization,
  );

  const [localSearch, setLocalSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(null);

  useEffect(() => {
    if (posts?.list?.length) {
      setFilteredPosts(posts.list);
    }
  }, [posts]);

  const handleLocalSearch = (value) => {
    setLocalSearch(value);

    if (!value || !value.trim()) {
      setFilteredPosts(posts.list);
      return;
    }

    const query = value.toLowerCase();

    setFilteredPosts(
      posts.list.filter((post) => {
        const name = post?.name?.toLowerCase() || "";
        const subName = post?.subcategory?.name?.toLowerCase() || "";

        return name.includes(query) || subName.includes(query);
      }),
    );
  };

  // SEARCH FUNCTIONS

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchItems, setSearchItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) return;

    if (!searchValue.trim()) {
      setSearchItems([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const response = await axios.get("/shop/organization_items/", {
          params: {
            search: searchValue,
            page: 1,
            limit: 21,
            organization: id,
          },
        });

        setSearchItems(response.data.list || []);
      } catch (e) {
        console.error(e);
        setSearchItems([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, isSearchOpen]);

  const checkForAdult = useCallback(async () => {
    if (
      is_adult_content &&
      !(
        permissions &&
        (permissions.can_check_attendance ||
          permissions.can_edit_organization ||
          permissions.can_edit_partner ||
          permissions.can_sale ||
          permissions.can_see_stats ||
          permissions.can_send_message ||
          permissions.is_owner)
      )
    ) {
      try {
        await confirm({
          title: translate("Возрастные ограничения", "dialog.adultLimitTitle"),
          description: translate(
            "В этом разделе присутствуют товары, доступные для продажи только лицам\n старше 18 лет.",
            "dialog.adultLimitDesc",
          ),
          confirmTitle: translate("Мне есть 18", "dialog.adultLimitOptionYes"),
          cancelTitle: translate("Мне нет 18", "dialog.adultLimitOptionNo"),
        });
      } catch (e) {
        // canGoBack(history) ? history.goBack() : history.push("/home");
        history.goBack();
      }
    }
  }, [is_adult_content, confirm, permissions, history]);

  const checkSubscription = useCallback(async () => {
    if (subscription_status === "test" && permissions.is_owner) {
      try {
        await confirm({
          title: translate("Платная подписка", "dialog.subscriptionTitle"),
          description: translate(
            "Ваша организация находится в тестовом режиме. Вас не могут найти другие пользователи, только по прямой ссылке. Перейти к выбору тарифа",
            "dialog.subscriptionTestModeDesc",
          ),
          confirmTitle: translate("Тарифы", "dialog.subscriptionPlans"),
          cancelTitle: translate("Отмена", "dialog.cancel"),
        });
        history.push({
          pathname: `/organizations/${id}/subscription-plans`,
          state: {
            countryCode: orgDetail.data.country?.code || "AE",
          },
        });
        // org-add-menu container
      } catch (e) {
        // canGoBack(history) ? history.goBack() : history.push("/home");
      }
    }
  }, [subscription_status]);

  const checkNeedAddItem = useCallback(async () => {
    if (need_add_item && permissions && permissions.is_owner) {
      try {
        await confirm({
          className: "organization-module__need-item-modal",
          title: translate(
            "Добавить товар или новость",
            "dialog.addProductOrNews",
          ),
          description: translate(
            "Вы давно не добавляли, товары и новости! Новые клиенты не узнают о вас, а старые уже забыли!  Мы уверены, у вас появилось что-то новое!",
            "dialog.addProductOrNewsDesc",
          ),
          confirmTitle: translate("Добавить", "dialog.add"),
          cancelTitle: translate("Позже", "dialog.later"),
        });

        history.push(`/organizations/${id}/posts/create`);
      } catch (e) {
        // do nothing
      }
    }
  }, [need_add_item, confirm, permissions, history, id]);

  useEffect(() => {
    checkForAdult().catch(console.error);
    return () => {
      dispatch(setPlayingVideoID(null));
      dispatch(clearTranslateItems());
    };
  }, [dispatch, checkForAdult]);

  useEffect(() => {
    if (!is_deleted) {
      checkSubscription().catch(console.error);
    }
  }, [checkSubscription]);

  useEffect(() => {
    checkNeedAddItem();
  }, [checkNeedAddItem]);

  // Автоматически выставлять активную вкладку на первую доступную
  useEffect(() => {
    if (discounts.cumulative.length) {
      setActiveDiscountTab("cumulative");
    } else if (discounts.fixed.length) {
      setActiveDiscountTab("fixed");
    } else if (discounts.cashback.length) {
      setActiveDiscountTab("cashback");
    } else if (couponsDiscount?.length) {
      setActiveDiscountTab("discountCoupons");
    } else if (couponsProduct?.length) {
      setActiveDiscountTab("productCoupons");
    }
    // Не меняем, если все пусто
  }, [
    discounts.cumulative.length,
    discounts.fixed.length,
    discounts.cashback.length,
    couponsProduct?.length,
    couponsDiscount?.length,
  ]);

  const toggleMenu = (menuState, menuID) =>
    setState({
      ...state,
      showMenu: menuState,
      menu: menuID,
      selectedCard: null,
    });

  const toggleShowContacts = () =>
    setState({ ...state, showContacts: !showContacts });

  const onCardEditClick = (cardID) =>
    setState({
      ...state,
      selectedCard: cardID,
      menu: 2,
      showMenu: true,
    });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const { isValid } = checkForValidFile(file, ALLOWED_FORMATS);
    if (isValid && selectedCard) {
      try {
        setState({ ...state, cardImageLoading: true });
        const res = await dispatch(uploadFile(file));
        if (res && res.id) {
          const editRes = await dispatch(
            editDiscountImage(selectedCard, res.id, id),
          );
          if (editRes && editRes.success) {
            return setState({
              ...state,
              cardImageLoading: false,
              showMenu: false,
              menu: null,
              selectedCard: null,
            });
          }
          Notify.info({
            text: translate(
              "Не удалось загрузить изображение",
              "hint.uploadImageError",
            ),
          });
          return setState({ ...state, cardImageLoading: false });
        }
      } catch (e) {
        return setState({ ...state, cardImageLoading: false, showMenu: false });
      }
    }
  };

  const setCardBackground = async (imageID) => {
    if (selectedCard) {
      const res = await dispatch(editDiscountImage(selectedCard, imageID, id));
      if (res && res.success) {
        return setState({
          ...state,
          cardImageLoading: false,
          showMenu: false,
          menu: null,
          selectedCard: null,
        });
      }
      Notify.info({
        text: translate(
          "Не удалось установить выбранное изображение",
          "hint.setImageError",
        ),
      });
      return setState({
        ...state,
        cardImageLoading: false,
        showMenu: false,
        selectedCard: null,
      });
    }
  };

  const onAddressClick = (location) =>
    dispatch(setViews({ type: VIEW_TYPES.map, location }));

  const onShowLangMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_lang_menu,
        menuLabel: translate("Язык перевода", "app.translationLanguage"),
        onSelectLang: () =>
          setState({ ...state, isOriginalTranslation: false }),
        post: { id, title, description },
        item: "org",
        currentCode,
      }),
    );
  };

  const onOpenCurrencyMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_currency_menu,
        menuLabel: translate("Выбрать валюту", "app.chooseCurrency"),
        orgCurrency: currency,
        currentCode: converted.org && converted.org[id]?.currency,
        item: { id, price: orgDetail.data["avg_check"], name: "org" },
      }),
    );
  };

  const showTranslation = () => {
    setState({ ...state, isOriginalTranslation: !isOriginalTranslation });
  };

  const toggleShowDiscounts = () =>
    setState({ ...state, showDiscounts: !showDiscounts });

  const isPrivateOrg = () => {
    return (
      (is_private && !permissions) ||
      (is_private &&
        permissions &&
        !permissions.is_owner &&
        is_subscribed !== "subscribed")
    );
  };

  const onAdd = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.organization_add_menu,
        menuLabel: translate("Добавить", "app.add"),
        orgID: id,
      }),
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const organizationModule = document.querySelector(".organization-module");
      const currentScrollY = window.scrollY;

      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      if (currentScrollY > prevScrollY.current) {
        // Scrolling down
        if (currentScrollY > 10) {
          organizationModule?.classList.add("organization-module--sticky");
        }
      } else {
        // Scrolling up
        organizationModule?.classList.remove("organization-module--sticky");
      }

      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = stickyActiveShadow();

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const handleShowAllDiscounts = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.all_discounts,
        orgId: id,
        orgDetail,
        user,
        permissions: orgDetail.data.permissions,
        client_status: orgDetail.data.client_status,
        onCardEditClick,
        discounts,
        currency,
      }),
    );
  };

  const handleCreateChat = async () => {
    setIsCreatingChat(true);
    try {
      const resp = await api.post("/messenger/chats/organization/", {
        organization_id: id,
      });
      if (resp && resp.data && resp.data.chat_id) {
        Notify.success({ text: "Чат создан" });
        history.push(
          `/messenger/chat/${resp.data.chat_id}?organization_id=${id}`,
        );
      } else {
        // Пользователь является сотрудником организации
        history.push(`/messenger/organization/${id}/`);
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при создании чата" });
    } finally {
      setIsCreatingChat(false);
    }
  };

  useEffect(() => {
    const el = document.querySelector(".organization-module__background");
    if (!el) return;

    let currentY = 0;
    let currentScale = 1;

    let targetY = 0;
    let targetScale = 1;

    let rafId = null;

    const lerp = (a, b, n) => a + (b - a) * n;

    const update = () => {
      currentY = lerp(currentY, targetY, 0.08);
      currentScale = lerp(currentScale, targetScale, 0.08);

      el.style.setProperty(
        "--parallax-transform",
        `translateY(${currentY}px) scale(${currentScale})`,
      );

      rafId = requestAnimationFrame(update);
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const isVisible = rect.top < windowHeight && rect.bottom > 0;

      if (!isVisible) {
        targetY = 0;
        targetScale = 3;
        return;
      }

      const progress = Math.min(
        Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
        1,
      );
      // 🔥 безопасные значения
      const maxOffset = 30;

      targetY = (progress - 0.5) * 2 * maxOffset;
      targetScale = 1 + progress * 0.3;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(update);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const [workTime, setWorkTime] = useState(false);
  const [backEndData, setBackEndData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/opening-hours/?organization=${orgDetail?.data?.id}`,
        );

        setBackEndData(response.data.list || []);
        console.log(backEndData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [orgDetail.id]);

  const getTodayNumber = () => {
    const jsDay = new Date().getDay(); // 0–6 (0 = Sunday)
    return jsDay === 0 ? 7 : jsDay; // 1–7
  };

  const todayWorkingInfo = React.useMemo(() => {
    // 🔹 ЕСЛИ НЕТ backendData → возвращаем старые пропсы
    if (!backEndData || backEndData.length === 0) {
      if (!opens_at || !closes_at) return null;

      return {
        start: opens_at,
        end: closes_at,
        status: time_working,
      };
    }

    // 🔹 ЕСЛИ backendData есть → работаем с ним
    const todayNumber = getTodayNumber();
    const todayData = backEndData.find((d) => d.day_of_week === todayNumber);

    // если на сегодня вообще нет записи
    if (!todayData) {
      return {
        start: opens_at,
        end: closes_at,
        status: time_working,
      };
    }

    // если выходной
    if (todayData.is_closed) {
      return {
        start: todayData.opens_at,
        end: todayData.closes_at,
        status: WORKING_TIME_STATUSES.closed,
        isClosedDay: true,
      };
    }

    const now = new Date();
    const [h1, m1] = todayData.opens_at.split(":");
    const [h2, m2] = todayData.closes_at.split(":");

    const startDate = new Date();
    startDate.setHours(h1, m1, 0);

    const endDate = new Date();
    endDate.setHours(h2, m2, 0);

    const isOpenNow = now >= startDate && now <= endDate;

    return {
      start: todayData.opens_at,
      end: todayData.closes_at,
      status: isOpenNow
        ? WORKING_TIME_STATUSES.open
        : WORKING_TIME_STATUSES.closed,
    };
  }, [backEndData, opens_at, closes_at, time_working]);

  const [isDownload, setIsDownloda] = useState(false);

  const handleDownloadProducts = async () => {
    try {
      setIsDownloda(true);
      const response = await axios.get(
        `/shop/organizations/${id}/download_catalog_excel`,
      );

      const { download_url } = response.data;

      if (!download_url) {
        throw new Error("Download URL not found");
      }

      // Создаём временную ссылку
      const link = document.createElement("a");
      link.href = download_url;
      link.setAttribute("download", "catalog.xlsx"); // имя файла (можно убрать)

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloda(false);
    }
  };

  const ORDERING_OPTIONS = [
    { value: null, label: "Новое", translation: "shop.new" },
    { value: "-price", label: "Дороже", translation: "shop.expensive" },
    { value: "price", label: "Дешевле", translation: "shop.cheaper" },
  ];

  const filtersCount =
    (filters.categories?.length || 0) + (filters.ordering ? 1 : 0);

  const [newFilters, setNewFilters] = useState([]);

  const [darkTheme, setDarkTheme] = useState(() => {
    const saved = localStorage.getItem("darkTheme");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkTheme", JSON.stringify(darkTheme));
  }, [darkTheme]);

  return (
    <React.Fragment>
      <PageHelmet
        title={title}
        description={description}
        image={image && image.medium}
      />
      <div
        className="organization-module"
        style={{
          position: "relative",
          background: darkTheme ? "#00193F" : "#ebedf0",
        }}
      >
        <MobileTopHeader
          changeTheme={true}
          darkTheme={darkTheme}
          setDarkTheme={setDarkTheme}
          onBack={() => {
            history.push("/profile");
            // canGoBack(history) ? history.goBack() : history.push("/home")
          }}
          onMenu={() => toggleMenu(true, 1)}
          renderRight={() => (
            <div className="org-header__buttons">
              <button onClick={() => setIsSearchOpen(true)}>
                <SearchIcon />
              </button>
              <button
                onClick={() => setIsFilterOpen(true)}
                style={{
                  display: "flex",
                  color: "#007AFF",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {(filtersCount || !!filters?.categories?.length) && (
                  <span
                    style={{
                      position: "absolute",
                      width: "19px",
                      height: "16px",
                      borderRadius: "50%",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      right: "-10px",
                      top: "-6px ",
                      background: "#007AFF",
                      color: "#fff",
                      fontWeight: "500",
                      boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.25)",
                    }}
                    className="f-14"
                  >
                    {filtersCount}
                  </span>
                )}
                <FilterIcon />
              </button>
            </div>
          )}
          style={{
            background: darkTheme ? "#090027" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
          }}
          title={title}
          verification_status={orgDetail.data.verification_status}
          className={classnames(
            "organization-module__top organization-module__top--scrolled",
            {
              "organization-module__top--scrolled": scrolled,
            },
          )}
        />

        <div
          className="organization-module__background"
          style={
            selected_banner
              ? {
                  "--banner-image": `url(${selected_banner?.image?.file})`,
                  "--default-banner-opacity": "0",
                }
              : {
                  "--default-banner-opacity": "1",
                }
          }
        ></div>

        <div className="organization-module__content">
          <div
            className={classnames(
              "organization-module__content__header",
              darkTheme && "dark",
            )}
          >
            <OrganizationHeader
              id={id}
              subscribers={subscribers}
              title={
                !isOriginalTranslation && translation
                  ? translation.title
                  : title
              }
              image={image}
              types={types}
              darkTheme={darkTheme}
              isBanned={orgDetail.data.is_banned}
              isSubscribed={is_subscribed}
              isPrivate={orgDetail.data.is_private}
              isWholesale={orgDetail.data.is_wholesale}
              perm={orgDetail.data.permissions}
              verification_status={orgDetail.data.verification_status}
              user={user}
              className={classnames(
                "organization-module__header",
                darkTheme && "dark",
              )}
            />

            <div className="tools-wrap">
              <div className="organization-module__tools">
                <ToggleButton
                  label={translate("Контакты и Web", "app.contactsAndWeb")}
                  className="organization-module__contacts-btn toggle-btn"
                  toggled={showContacts}
                  onClick={toggleShowContacts}
                />

                {permissions && permissions.is_owner ? (
                  <button
                    onClick={onAdd}
                    className="organization-module__create-product-btn f-14 f-600"
                  >
                    <span className="tl">
                      {translate("Добавить", "app.add")}
                    </span>
                  </button>
                ) : (
                  <StandardButton
                    label={
                      is_subscribed === "subscribed"
                        ? translate("Отписаться", "subscriptions.toUnSubscribe")
                        : translate("Подписаться", "subscriptions.toSubscribe")
                    }
                    className={
                      is_subscribed === "subscribed"
                        ? "organization-module__unsubscribe-btn"
                        : "organization-module__subscribe-btn"
                    }
                    onClick={async () => {
                      const res = await dispatch(subscribeOrganization(id));
                      res && res.success && dispatch(getOrganizationDetail(id));
                    }}
                  />
                )}
                <ButtonMessenger
                  onChange={() => handleCreateChat()}
                  // active={showDiscounts}
                  className="organization-module__switch-btn button-shop-discounts"
                  disabled={isCreatingChat}
                  unread_chat_count={unread_chat_count}
                />
              </div>

              <div
                className={classnames(
                  "organization-module__contacts",
                  "organization-module__contacts-show",
                )}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {phone_numbers.map((phone) => (
                  <Linker
                    key={phone.id}
                    type={LINK_TYPES.phone}
                    value={phone.phone_number}
                  />
                ))}

                {social_contacts.map((social) => (
                  <Linker
                    key={social.id}
                    type={
                      social.url.match(EMAIL_REGEX)
                        ? LINK_TYPES.mail
                        : LINK_TYPES.web
                    }
                    value={social.url}
                  />
                ))}
              </div>

              {permissions &&
                permissions.is_owner &&
                !orgDetail.data.assistant && (
                  <Link
                    to={`/organizations/${id}/assistant`}
                    className="organization-module__assistant f-14 f-500"
                  >
                    <div className="organization-module__assistant-content">
                      <div className="organization-module__assistant-icons">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#FFF"
                            d="M23 10.778V8.333h-2.444V5.89a2.452 2.452 0 00-2.445-2.445h-2.444V1h-2.445v2.444h-2.444V1H8.333v2.444H5.89A2.452 2.452 0 003.444 5.89v2.444H1v2.445h2.444v2.444H1v2.445h2.444v2.444a2.452 2.452 0 002.445 2.445h2.444V23h2.445v-2.444h2.444V23h2.445v-2.444h2.444a2.452 2.452 0 002.445-2.445v-2.444H23v-2.445h-2.444v-2.444H23zm-4.889 7.333H5.89V5.89H18.11V18.11z"
                            className="assistant-icon assistant-icon--one create-btn"
                          ></path>
                          <path
                            className="assistant-icon assistant-icon--one create-btn"
                            fill="#fff"
                            d="M11.194 7H9.512L7 17h1.284l.58-2.344h2.895L12.324 17h1.327L11.194 7zm-2.162 6.655l1.273-5.467h.058l1.228 5.467H9.033zM14.797 7h1.25v10h-1.25V7z"
                          ></path>
                        </svg>

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="35"
                          height="16"
                          fill="none"
                          viewBox="0 0 35 16"
                        >
                          <path
                            className="assistant-icon assistant-icon--two"
                            fill="currentColor"
                            d="M34.11 14.49l-3.92-6.62 3.88-6.35A1 1 0 0033.22 0H2a2 2 0 00-2 2v12a2 2 0 002 2h31.25a1 1 0 00.86-1.51zm-23.6-3.31H9.39L6.13 6.84v4.35H5V5h1.13L9.4 9.35V5h1.12l-.01 6.18zM16.84 6h-3.53v1.49h3.2v1h-3.2v1.61h3.53v1h-4.66V5h4.65l.01 1zm8.29 5.16H24l-1.55-4.59-1.55 4.61h-1.12l-2-6.18H19l1.32 4.43L21.84 5h1.22l1.46 4.43L25.85 5h1.23l-1.95 6.16z"
                          ></path>
                        </svg>
                      </div>
                      <span className="organization-module__assistant-label">
                        {translate(
                          "Создать AI Ассистента",
                          "org.createAIAssistant",
                        )}
                      </span>
                    </div>
                  </Link>
                )}
              {permissions &&
                !permissions.can_edit_organization &&
                orgDetail.data.assistant &&
                orgDetail.data.assistant.is_assistant_active && (
                  <Link
                    to={`/organizations/${id}/chat?assistant=${orgDetail.data.assistant.id}`}
                    className="organization-module__assistant f-14 f-500"
                  >
                    <div className="organization-module__assistant-content">
                      <div className="organization-module__assistant-icons">
                        <AIIcon fill="#fff" />
                      </div>
                      <span className="organization-module__assistant-label">
                        {translate(
                          "Служба помощи и заботы клиента 24/7",
                          "org.supportAndCareService",
                        )}
                      </span>
                    </div>
                  </Link>
                )}
              {promo_cashback && is_subscribed === "not_subscribed" && (
                <button
                  type="button"
                  className="organization-module__promo f-14 f-500"
                  onClick={() =>
                    alert({
                      title: translate(
                        "Нажав кнопку подписаться вы получаете в подарок кэшбэк, которым вы сможете рассчитаться в данной организации",
                        "promoCashback.subscribeInfo",
                      ),
                    })
                  }
                >
                  <span className="organization-module__promo-content">
                    <PromotionIcon />
                    {translate(
                      "Получи кэшбек {amount} за подписку",
                      "promoCashback.subscribe",
                      { amount: `${Number(promo_cashback)} ${currency}` },
                    )}
                  </span>
                </button>
              )}
              {permissions &&
                permissions.can_edit_organization &&
                orgDetail.data.assistant && (
                  <Link
                    to={`/organizations/${id}/assistants/${orgDetail.data.assistant.id}/chats`}
                    className="organization-module__assistant organization-module__assistant--for-org f-14 f-500"
                  >
                    <div className="organization-module__assistant-content">
                      <div className="organization-module__assistant-icons">
                        <AIIcon />
                        <NewMarkIcon />
                      </div>
                      <span className="organization-module__assistant-label">
                        {translate("AI Ассистент", "org.aiAssistant")}
                      </span>
                      <div className="organization-module__assistant-badge-container">
                        {!!orgDetail.data.all_unread_messages_count && (
                          <span className="organization-module__assistant-badge">
                            {orgDetail.data.all_unread_messages_count > 999
                              ? 999
                              : orgDetail.data.all_unread_messages_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

              <button
                onClick={() => onDownloadApp()}
                className="organization-module__app f-14 f-500"
              >
                <div className="organization-module__assistant-content">
                  <div className="organization-module__assistant-icons">
                    <AppIcon fill="#fff" />
                  </div>
                  <span className="organization-module__assistant-label">
                    {translate("Скачать Приложение", "org.downlodaAppOrg")}
                    {"  "}
                    {!isOriginalTranslation && translation
                      ? translation.title
                      : title}
                  </span>
                </div>
              </button>
            </div>
            {isPrivateOrg() ? (
              <>
                {is_deleted ? (
                  <DeactivatedOrgPlaceholder />
                ) : (
                  <PrivateOrg
                    promoCashBack={promo_cashback}
                    showDiscounts={showDiscounts}
                    toggleShowDiscounts={toggleShowDiscounts}
                    isSubscribed={is_subscribed}
                    currency={currency}
                    id={id}
                  />
                )}
              </>
            ) : (
              <span>
                {(subscribers === 0 || subscribers) &&
                  (user ? (
                    <Link to={`/organizations/${id}/followers`}>
                      <p className="organization-header__subscribers f-14">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 22 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="hover-people "
                        >
                          <path
                            d="M7.625 0.5C6.92966 0.502765 6.26358 0.780214 5.7719 1.2719C5.28021 1.76358 5.00276 2.42966 5 3.125C5 4.5665 6.1835 5.75 7.625 5.75C9.0665 5.75 10.25 4.5665 10.25 3.125C10.25 1.6835 9.0665 0.5 7.625 0.5ZM14.375 0.5C13.6797 0.502765 13.0136 0.780214 12.5219 1.2719C12.0302 1.76358 11.7528 2.42966 11.75 3.125C11.75 4.5665 12.9335 5.75 14.375 5.75C15.8165 5.75 17 4.5665 17 3.125C17 1.6835 15.8165 0.5 14.375 0.5ZM7.625 2C8.255 2 8.75 2.495 8.75 3.125C8.75 3.755 8.255 4.25 7.625 4.25C6.995 4.25 6.5 3.755 6.5 3.125C6.5 2.495 6.995 2 7.625 2ZM14.375 2C15.005 2 15.5 2.495 15.5 3.125C15.5 3.755 15.005 4.25 14.375 4.25C13.745 4.25 13.25 3.755 13.25 3.125C13.25 2.495 13.745 2 14.375 2ZM4.25 5C2.6 5 1.25 6.35 1.25 8C1.25 8.83475 1.60775 9.58775 2.16425 10.133C1.65393 10.4777 1.23555 10.9418 0.945496 11.4851C0.655447 12.0283 0.502514 12.6342 0.5 13.25H2C2 11.999 2.999 11 4.25 11C5.501 11 6.5 11.999 6.5 13.25H8C7.99749 12.6342 7.84455 12.0283 7.5545 11.4851C7.26445 10.9418 6.84607 10.4777 6.33575 10.133C6.89225 9.58775 7.25 8.8355 7.25 8C7.25 6.35 5.9 5 4.25 5ZM8 13.25C7.53125 13.877 7.25 14.6652 7.25 15.5H8.75C8.75 14.249 9.749 13.25 11 13.25C12.251 13.25 13.25 14.249 13.25 15.5H14.75C14.7489 14.6888 14.4859 13.8996 14 13.25C13.745 12.9102 13.4375 12.62 13.0858 12.383C13.6423 11.8377 14 11.0855 14 10.25C14 8.6 12.65 7.25 11 7.25C9.35 7.25 8 8.6 8 10.25C8 11.0848 8.35775 11.8377 8.91425 12.383C8.56278 12.6184 8.25367 12.9115 8 13.25ZM14 13.25H15.5C15.5 11.999 16.499 11 17.75 11C19.001 11 20 11.999 20 13.25H21.5C21.4975 12.6342 21.3446 12.0283 21.0545 11.4851C20.7645 10.9418 20.3461 10.4777 19.8358 10.133C20.3923 9.58775 20.75 8.8355 20.75 8C20.75 6.35 19.4 5 17.75 5C16.1 5 14.75 6.35 14.75 8C14.75 8.83475 15.1077 9.58775 15.6642 10.133C15.1539 10.4777 14.7355 10.9418 14.4455 11.4851C14.1554 12.0283 14.0025 12.6342 14 13.25ZM4.25 6.5C5.08775 6.5 5.75 7.16225 5.75 8C5.75 8.83775 5.08775 9.5 4.25 9.5C3.41225 9.5 2.75 8.83775 2.75 8C2.75 7.16225 3.41225 6.5 4.25 6.5ZM17.75 6.5C18.5877 6.5 19.25 7.16225 19.25 8C19.25 8.83775 18.5877 9.5 17.75 9.5C16.9123 9.5 16.25 8.83775 16.25 8C16.25 7.16225 16.9123 6.5 17.75 6.5ZM11 8.75C11.8378 8.75 12.5 9.41225 12.5 10.25C12.5 11.0878 11.8378 11.75 11 11.75C10.1622 11.75 9.5 11.0878 9.5 10.25C9.5 9.41225 10.1622 8.75 11 8.75Z"
                            fill="#818C99"
                            className="hover-path"
                          />
                        </svg>

                        {translate(
                          "Подписчиков: {count}",
                          "org.followersCount",
                          {
                            count: shortenNumber(subscribers),
                            b: (num) => (
                              <span
                                className="f-14 f-600"
                                style={{ color: "#4285F4" }}
                              >
                                {num}
                              </span>
                            ),
                          },
                        )}
                      </p>
                    </Link>
                  ) : (
                    <p className="organization-header__subscribers f-14">
                      <SubscribeCount />
                      {translate("Подписчиков: {count}", "org.followersCount", {
                        count: shortenNumber(subscribers),
                        b: (num) => <b>{num}</b>,
                      })}
                    </p>
                  ))}
                <Link
                  className="organization-module__savings dfc f-14"
                  to={`/receipts?org=${id}&r=1`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 0C18.6278 0 24 5.37225 24 12C24 18.6278 18.6278 24 12 24C5.37225 24 0 18.6278 0 12C0 5.37225 5.37225 0 12 0ZM14.514 4.17C14.331 4.08 14.148 4.17 14.103 4.35225C14.0573 4.398 14.0573 4.44375 14.0573 4.5345V5.172L14.0648 5.25C14.1039 5.4043 14.1987 5.53866 14.331 5.62725C17.8965 6.90225 19.725 10.8623 18.399 14.367C17.7135 16.2795 16.2052 17.7353 14.331 18.4185C14.148 18.5093 14.0573 18.6458 14.0573 18.8738V19.5112L14.061 19.5773C14.0681 19.6493 14.0982 19.7171 14.1468 19.7707C14.1955 19.8243 14.26 19.8609 14.331 19.875C14.3767 19.875 14.4682 19.875 14.514 19.83C15.5427 19.5088 16.4977 18.9872 17.3239 18.2954C18.1502 17.6035 18.8315 16.7551 19.3285 15.7989C19.8255 14.8427 20.1285 13.7976 20.22 12.7238C20.3115 11.65 20.1896 10.5688 19.8615 9.54225C19.0395 6.94725 17.028 4.98975 14.514 4.17075V4.17ZM9.669 4.125C9.62325 4.125 9.53175 4.125 9.486 4.17C8.45732 4.49124 7.50235 5.0128 6.67607 5.70463C5.84978 6.39646 5.16851 7.24491 4.67148 8.20112C4.17445 9.15733 3.87148 10.2024 3.78001 11.2762C3.68853 12.35 3.81037 13.4312 4.1385 14.4578C4.9605 17.0077 6.92625 18.9653 9.486 19.7843C9.669 19.875 9.852 19.7843 9.897 19.602C9.94275 19.557 9.94275 19.5105 9.94275 19.4198V18.7822L9.93525 18.7222C9.90375 18.5955 9.786 18.4508 9.669 18.3727C6.1035 17.0977 4.275 13.1377 5.601 9.633C6.2865 7.7205 7.79475 6.26475 9.669 5.5815C9.852 5.49075 9.94275 5.35425 9.94275 5.12625V4.48875L9.939 4.42275C9.93187 4.35073 9.90177 4.28291 9.85316 4.2293C9.80454 4.17569 9.73998 4.13912 9.669 4.125ZM12.3202 6.492H11.634L11.568 6.498C11.418 6.528 11.3085 6.657 11.268 6.8565V7.9035L11.1128 7.9275C9.83175 8.1555 9.02925 9.03975 9.02925 10.134C9.02925 11.6355 9.94275 12.2273 11.8628 12.4552C13.143 12.6825 13.554 12.9563 13.554 13.6845C13.554 14.412 12.9143 14.913 12.0458 14.913C10.857 14.913 10.446 14.4128 10.3088 13.7295C10.2638 13.548 10.1257 13.4565 9.9885 13.4565H9.2115L9.15225 13.4618C9.07829 13.4737 9.01117 13.512 8.96332 13.5697C8.91547 13.6273 8.89013 13.7004 8.892 13.7753V13.8202L8.91675 13.9552C9.13425 15.0233 9.86625 15.7875 11.3145 16.0057V17.0985L11.3205 17.1645C11.3505 17.313 11.4803 17.4225 11.6805 17.4622H12.366L12.432 17.4562C12.582 17.4263 12.6915 17.2973 12.732 17.0985V16.005L12.8873 15.975C14.172 15.7035 15.0173 14.7742 15.0173 13.5922C15.0173 11.9992 14.0573 11.4532 12.1373 11.2253C10.7655 11.043 10.4918 10.6792 10.4918 10.0417C10.4918 9.40425 10.9493 8.99475 11.8628 8.99475C12.6855 8.99475 13.143 9.26775 13.371 9.951C13.3948 10.0171 13.4382 10.0743 13.4954 10.1149C13.5527 10.1555 13.621 10.1776 13.6912 10.1783H14.4225L14.4818 10.1737C14.556 10.1619 14.6234 10.1236 14.6714 10.0657C14.7194 10.0079 14.7448 9.93463 14.7428 9.8595V9.8145L14.715 9.68475C14.6024 9.21856 14.3456 8.79975 13.9813 8.4879C13.6169 8.17605 13.1635 7.98704 12.6855 7.94775V6.8565L12.6795 6.7905C12.6495 6.64125 12.5198 6.53175 12.3195 6.492H12.3202Z"
                      fill="#818C99"
                      className="savings-icon-path"
                    />
                  </svg>
                  <span className="organization-module__savings-label">
                    {translate("Ваша экономия", "app.yourSavings")}:
                  </span>
                  <span className="organization-module__savings-sum f-14 f-600">
                    {(client_status &&
                      formatWithCommas(
                        Math.floor(client_status.total_saved),
                      )) ||
                      0}{" "}
                    {currency}
                  </span>
                </Link>

                <div
                  className="organization-module__method-payments dfc"
                  onClick={() => setShowPaymentMethods(true)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9039 0.000107388C14.7193 0.007492 14.5411 0.0407228 14.3556 0.0868766L1.8073 3.14411C0.322989 3.5078 -0.605626 5.00503 -0.241011 6.49026L1.51837 13.6736C1.62499 14.1015 1.83257 14.4976 2.12374 14.8288C2.41492 15.16 2.7812 15.4165 3.19191 15.577V13.8463C3.19191 11.3013 5.26237 9.23088 7.8073 9.23088H19.4325L17.7018 2.10565C17.5487 1.48628 17.1867 0.938646 16.6769 0.555091C16.167 0.171536 15.5414 -0.0244764 14.9039 0.000107388ZM16.0282 3.98134L16.7787 7.12534L13.6633 7.87488L12.8842 4.75949L16.0282 3.98134ZM7.8073 11.077C6.27868 11.077 5.03807 12.3176 5.03807 13.8463V21.2309C5.03807 22.7595 6.27868 24.0001 7.8073 24.0001H20.7304C22.259 24.0001 23.4996 22.7595 23.4996 21.2309V13.8463C23.4996 12.3176 22.259 11.077 20.7304 11.077H7.8073ZM7.8073 12.5484H20.7304C21.4421 12.5484 22.0282 13.1346 22.0282 13.8463V14.7693H6.50945V13.8463C6.50945 13.1346 7.0956 12.5484 7.8073 12.5484ZM6.50945 17.5386H22.0282V21.2309C22.0282 21.9426 21.4421 22.5287 20.7304 22.5287H7.8073C7.46369 22.5268 7.1347 22.3894 6.89172 22.1465C6.64875 21.9035 6.51139 21.5745 6.50945 21.2309V17.5386Z"
                      fill="#818C99"
                      className="method-payments-icon"
                    />
                  </svg>
                  <span className="organization-module__method-payments-label f-14">
                    {translate("Способы оплаты", "payment.methods")}:
                  </span>
                  <button
                    type="button"
                    className="organization-module__method-payments-btn f-14 f-500"
                    onClick={() => setShowPaymentMethods(true)}
                  >
                    {translate("Посмотреть доступные", "payment.seeAvailable")}
                  </button>
                </div>

                {orgDetail.data["avg_check"] !== 0 &&
                  orgDetail.data["avg_check"] && (
                    <OrganizationAverageCheck
                      id={id}
                      sum={orgDetail.data["avg_check"]}
                      currency={currency}
                      loading={loadingConvertingItem}
                      onClick={onOpenCurrencyMenu}
                      currentConvertedItem={currentConvertedItem}
                      converted={
                        converted.org && converted.org[id]
                          ? converted.org[id]
                          : null
                      }
                      className="organization-module__avg-check"
                    />
                  )}
                {!is_deleted && todayWorkingInfo && (
                  <OrganizationWorkingTime
                    start={todayWorkingInfo.start}
                    end={todayWorkingInfo.end}
                    status={todayWorkingInfo.status}
                    onClick={() => setWorkTime(true)}
                    className="organization-module__hours"
                    color="#818C99"
                  />
                )}

                {address && (
                  <div className="organization-module__address">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 15 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.80078 0.398438C3.93911 0.398438 0.800781 3.53648 0.800781 7.39779C0.800781 9.75424 2.16578 11.7257 3.75245 13.1023C4.25411 13.5339 5.12912 14.2222 5.91078 15.2371C6.77412 16.3686 7.55578 17.5818 7.80078 18.3984C8.04578 17.5818 8.82745 16.3686 9.69078 15.2371C10.4724 14.2222 11.3474 13.5339 11.8491 13.1023C13.4358 11.7257 14.8008 9.75424 14.8008 7.39779C14.8008 3.53648 11.6624 0.398438 7.80078 0.398438ZM7.80078 3.38483C8.32782 3.38483 8.8497 3.48863 9.33662 3.6903C9.82354 3.89197 10.266 4.18756 10.6386 4.5602C11.0113 4.93283 11.3069 5.37522 11.5086 5.8621C11.7103 6.34897 11.8141 6.8708 11.8141 7.39779C11.8141 7.92478 11.7103 8.44661 11.5086 8.93348C11.3069 9.42036 11.0113 9.86274 10.6386 10.2354C10.266 10.608 9.82354 10.9036 9.33662 11.1053C8.8497 11.307 8.32782 11.4108 7.80078 11.4108C6.73638 11.4108 5.71557 10.988 4.96293 10.2354C4.21028 9.48281 3.78745 8.46209 3.78745 7.39779C3.78745 6.33349 4.21028 5.31277 4.96293 4.5602C5.71557 3.80762 6.73638 3.38483 7.80078 3.38483Z"
                        fill="#818C99"
                        className="address-icon"
                      />
                    </svg>
                    {full_location.latitude && full_location.longitude ? (
                      <button
                        className="organization-module__address-btn f-14 f-600"
                        onClick={() => onAddressClick(full_location)}
                      >
                        {address}
                      </button>
                    ) : (
                      <p className="f-14 f-600">{address}</p>
                    )}
                  </div>
                )}

                {is_deleted ? null : (
                  <>
                    {!isOriginalTranslation && translation ? (
                      <TruncatedText
                        className={classnames(
                          "organization-module__description",
                          "f-14",
                          darkTheme && "dark",
                        )}
                        less="app.less"
                      >
                        <TextLinkifier
                          text={translation.description}
                          getHashtagLink={(hashtag) =>
                            `/organizations/${id}/search?search=${hashtag}`
                          }
                        />
                      </TruncatedText>
                    ) : (
                      <TruncatedText
                        className={classnames(
                          "organization-module__description",
                          "f-14",
                          darkTheme && "dark",
                        )}
                        less="app.less"
                      >
                        <TextLinkifier
                          text={description}
                          getHashtagLink={(hashtag) =>
                            `/organizations/${id}/search?search=${hashtag}`
                          }
                        />
                      </TruncatedText>
                    )}

                    <div
                      className="organization-module__translation"
                      style={{
                        color: darkTheme ? "#fff" : "",
                        transition: "color 0.25s ease",
                      }}
                    >
                      {isOriginalTranslation ? (
                        <button
                          className="organization-module__translation-text f-13 f-500"
                          type="button"
                          onClick={
                            !translation ? onShowLangMenu : showTranslation
                          }
                        >
                          {translate("Показать перевод", "app.showTranslation")}
                        </button>
                      ) : (
                        <button
                          className="organization-module__translation-text f-13 f-500"
                          type="button"
                          onClick={
                            !translation ? onShowLangMenu : showTranslation
                          }
                        >
                          {!loadingTranslateItem &&
                            translate(
                              "Показать оригинал",
                              "app.showOriginalTranslation",
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
                )}
              </span>
            )}
          </div>

          <div>
            {(discounts.cumulative.length > 0 ||
              discounts.fixed.length > 0 ||
              discounts.cashback.length > 0 ||
              couponsProduct?.length > 0 ||
              couponsDiscount?.length > 0) && (
              <div
                className={classnames(
                  "organization-module__content__discounts",
                  darkTheme && "organization-module__content__discounts--dark",
                )}
              >
                <div className="organization-module__content__hotlinks-nav">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h2
                      className={classnames(
                        "organization-module__discounts-title",
                        darkTheme &&
                          "organization-module__discounts-title--dark",
                      )}
                    >
                      {translate("Скидки и бонусы", "org.discountTitle")}
                    </h2>

                    {/* Slide buttons for DiscountSlider */}
                    <div className="slide-btns">
                      <svg
                        width="10"
                        height="16"
                        viewBox="0 0 10 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          if (
                            activeDiscountTab === "cumulative" &&
                            cumulativeSwiperRef.current &&
                            cumulativeSwiperRef.current.swiper
                          ) {
                            cumulativeSwiperRef.current.swiper.slidePrev();
                          } else if (
                            activeDiscountTab === "fixed" &&
                            fixedSwiperRef.current &&
                            fixedSwiperRef.current.swiper
                          ) {
                            fixedSwiperRef.current.swiper.slidePrev();
                          } else if (
                            activeDiscountTab === "cashback" &&
                            cashbackSwiperRef.current &&
                            cashbackSwiperRef.current.swiper
                          ) {
                            cashbackSwiperRef.current.swiper.slidePrev();
                          } else if (
                            activeDiscountTab === "productCoupons" &&
                            productCouponRef.current &&
                            productCouponRef.current.swiper
                          ) {
                            productCouponRef.current.swiper.slidePrev();
                          } else if (
                            activeDiscountTab === "discountCoupons" &&
                            discountCouponRef.current &&
                            discountCouponRef.current.swiper
                          ) {
                            discountCouponRef.current.swiper.slidePrev();
                          }
                        }}
                        className="prev"
                        style={{ cursor: "pointer" }}
                      >
                        <path
                          d="M8 2L2 8L8 14"
                          stroke="#007AFF"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <svg
                        width="10"
                        height="16"
                        viewBox="0 0 10 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          if (
                            activeDiscountTab === "cumulative" &&
                            cumulativeSwiperRef.current &&
                            cumulativeSwiperRef.current.swiper
                          ) {
                            cumulativeSwiperRef.current.swiper.slideNext();
                          } else if (
                            activeDiscountTab === "fixed" &&
                            fixedSwiperRef.current &&
                            fixedSwiperRef.current.swiper
                          ) {
                            fixedSwiperRef.current.swiper.slideNext();
                          } else if (
                            activeDiscountTab === "cashback" &&
                            cashbackSwiperRef.current &&
                            cashbackSwiperRef.current.swiper
                          ) {
                            cashbackSwiperRef.current.swiper.slideNext();
                          } else if (
                            activeDiscountTab === "productCoupons" &&
                            productCouponRef.current &&
                            productCouponRef.current.swiper
                          ) {
                            productCouponRef.current.swiper.slideNext();
                          } else if (
                            activeDiscountTab === "discountCoupons" &&
                            discountCouponRef.current &&
                            discountCouponRef.current.swiper
                          ) {
                            discountCouponRef.current.swiper.slideNext();
                          }
                        }}
                        className="next"
                        style={{ cursor: "pointer" }}
                      >
                        <path
                          d="M2 14L8 8L2 2"
                          stroke="#007AFF"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={handleShowAllDiscounts}
                    className="home-partners__top-link f-14 f-500"
                  >
                    {translate("Показать все", "app.showAll")}
                  </button>
                </div>

                <div className="organization-module__cards">
                  {!loading ? (
                    <>
                      <ScrollContainer>
                        <div className="organization-module__cards-tabs">
                          {discounts.cumulative.length > 0 && (
                            <button
                              className={classnames(
                                "organization-module__cards-tab",
                                activeDiscountTab === "cumulative" &&
                                  "organization-module__cards-tab--active",
                                darkTheme &&
                                  "organization-module__cards-tab--dark",
                              )}
                              onClick={() => setActiveDiscountTab("cumulative")}
                              type="button"
                            >
                              {translate(
                                "Накопительные %",
                                "discount.cumulativeTab",
                              )}
                            </button>
                          )}

                          {discounts.fixed.length > 0 && (
                            <button
                              className={classnames(
                                "organization-module__cards-tab",
                                activeDiscountTab === "fixed" &&
                                  "organization-module__cards-tab--active",
                                darkTheme &&
                                  "organization-module__cards-tab--dark",
                              )}
                              onClick={() => setActiveDiscountTab("fixed")}
                              type="button"
                            >
                              {translate("Акционные %", "discount.fixedTab")}
                            </button>
                          )}

                          {discounts.cashback.length > 0 && (
                            <button
                              className={classnames(
                                "organization-module__cards-tab",
                                activeDiscountTab === "cashback" &&
                                  "organization-module__cards-tab--active",
                                darkTheme &&
                                  "organization-module__cards-tab--dark",
                              )}
                              onClick={() => setActiveDiscountTab("cashback")}
                              type="button"
                            >
                              {translate("Кэшбэк %", "discount.cashbackTab")}
                            </button>
                          )}

                          {couponsProduct?.length > 0 && (
                            <button
                              className={classnames(
                                "organization-module__cards-tab",
                                activeDiscountTab === "productCoupons" &&
                                  "organization-module__cards-tab--active",
                                darkTheme &&
                                  "organization-module__cards-tab--dark",
                              )}
                              onClick={() =>
                                setActiveDiscountTab("productCoupons")
                              }
                              type="button"
                            >
                              {translate(
                                "Купоны на товар",
                                "discount.couponForProduct",
                              )}
                            </button>
                          )}

                          {couponsDiscount?.length > 0 && (
                            <button
                              className={classnames(
                                "organization-module__cards-tab",
                                activeDiscountTab === "discountCoupons" &&
                                  "organization-module__cards-tab--active",
                                darkTheme &&
                                  "organization-module__cards-tab--dark",
                              )}
                              onClick={() =>
                                setActiveDiscountTab("discountCoupons")
                              }
                              type="button"
                            >
                              {translate(
                                "Купоны на скидку %",
                                "discount.couponForDiscount",
                              )}
                            </button>
                          )}
                        </div>
                      </ScrollContainer>

                      {activeDiscountTab === "cumulative" &&
                        discounts.cumulative.length > 0 && (
                          <div className="organization-module__card-cumulative">
                            {!discounts.cumulative.length ? (
                              permissions && permissions.is_owner ? (
                                <div>
                                  {translate(
                                    "У вас нет фиксированных карт",
                                    "hint.noFixedCardOwner",
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {translate(
                                    "Нет фиксированных карт",
                                    "hint.noFixedCard",
                                  )}
                                </div>
                              )
                            ) : (
                              <DiscountSlider
                                ref={cumulativeSwiperRef}
                                darkTheme={darkTheme}
                                className="organization-module__slider"
                                clientStatus={{
                                  ...client_status,
                                  type: DISCOUNT_TYPES.cumulative,
                                }}
                                cards={discounts.cumulative}
                              >
                                {discounts.cumulative.map((card) => (
                                  <DiscountCard
                                    key={card.id}
                                    card={card}
                                    orgId={id}
                                    clientStatus={client_status}
                                    isOwner={
                                      permissions &&
                                      permissions.can_edit_organization
                                    }
                                    onEditClick={() => onCardEditClick(card.id)}
                                    name={user && user.full_name}
                                  />
                                ))}
                              </DiscountSlider>
                            )}
                          </div>
                        )}

                      {activeDiscountTab === "fixed" &&
                        discounts.fixed.length > 0 && (
                          <div className="organization-module__card-fixed">
                            {!discounts.fixed.length ? (
                              permissions && permissions.is_owner ? (
                                <div>
                                  {translate(
                                    "У вас нет акционных карт",
                                    "hint.noPromotionCardOwner",
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {translate(
                                    "Нет акционных карт",
                                    "hint.noPromotionCard",
                                  )}
                                </div>
                              )
                            ) : (
                              <DiscountSlider
                                ref={fixedSwiperRef}
                                className="organization-module__slider"
                                cards={discounts.fixed}
                                darkTheme={darkTheme}
                              >
                                {discounts.fixed.map((card) => (
                                  <DiscountCard
                                    key={card.id}
                                    orgId={id}
                                    card={card}
                                    onEditClick={() => onCardEditClick(card.id)}
                                    isOwner={
                                      permissions &&
                                      permissions.can_edit_organization
                                    }
                                    name={user && user.full_name}
                                  />
                                ))}
                              </DiscountSlider>
                            )}
                          </div>
                        )}

                      {activeDiscountTab === "cashback" &&
                        discounts.cashback.length > 0 && (
                          <div className="organization-module__card-cashback">
                            {!discounts.cashback.length ? (
                              permissions && permissions.is_owner ? (
                                <div>
                                  {translate(
                                    "У вас нет кэшбек карт",
                                    "hint.noCashbackCardOwner",
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {translate(
                                    "Нет кэшбек карт",
                                    "hint.noCashbackCard",
                                  )}
                                </div>
                              )
                            ) : (
                              <DiscountSlider
                                ref={cashbackSwiperRef}
                                className="organization-module__slider"
                                darkTheme={darkTheme}
                                clientStatus={{
                                  ...client_status,
                                  currency,
                                  type: DISCOUNT_TYPES.cashback,
                                }}
                                cards={discounts.cashback}
                              >
                                {discounts.cashback.map((card) => (
                                  <DiscountCard
                                    key={card.id}
                                    orgId={id}
                                    card={card}
                                    onEditClick={() => onCardEditClick(card.id)}
                                    isOwner={
                                      permissions &&
                                      permissions.can_edit_organization
                                    }
                                    name={user && user.full_name}
                                  />
                                ))}
                              </DiscountSlider>
                            )}
                          </div>
                        )}

                      {activeDiscountTab === "productCoupons" &&
                        couponsProduct?.length > 0 && (
                          <div className="organization-module__card-cashback">
                            {!couponsProduct?.length ? (
                              permissions && permissions.is_owner ? (
                                <div>
                                  {translate(
                                    "У вас нет купонов на товар",
                                    "hint.noCouponProductOwner",
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {translate(
                                    "Нет купонов на товар",
                                    "hint.noCouponProduct",
                                  )}
                                </div>
                              )
                            ) : (
                              <DiscountSlider
                                ref={productCouponRef}
                                darkTheme={darkTheme}
                                className="organization-module__slider"
                                cards={couponsProduct}
                              >
                                {couponsProduct.map((item) => (
                                  <DiscountCard
                                    key={item.id}
                                    item={item}
                                    orgId={id}
                                    onEditClick={() => onCardEditClick(item.id)}
                                    isOwner={
                                      permissions &&
                                      permissions.can_edit_organization
                                    }
                                    name={user && user.full_name}
                                  />
                                ))}
                              </DiscountSlider>
                            )}
                          </div>
                        )}

                      {activeDiscountTab === "discountCoupons" &&
                        couponsDiscount?.length > 0 && (
                          <div className="organization-module__card-cashback">
                            {!couponsDiscount?.length ? (
                              permissions && permissions.is_owner ? (
                                <div>
                                  {translate(
                                    "У вас нет купонов на скидку",
                                    "hint.noCouponDiscountOwner",
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {translate(
                                    "Нет купонов на скидку",
                                    "hint.noCouponDiscountCard",
                                  )}
                                </div>
                              )
                            ) : (
                              <DiscountSlider
                                ref={discountCouponRef}
                                darkTheme={darkTheme}
                                className="organization-module__slider"
                                cards={couponsProduct}
                              >
                                {couponsDiscount.map((item) => (
                                  <DiscountCard
                                    key={item.id}
                                    item={item}
                                    orgId={id}
                                    onEditClick={() => onCardEditClick(item.id)}
                                    isOwner={
                                      permissions &&
                                      permissions.can_edit_organization
                                    }
                                    name={user && user.full_name}
                                  />
                                ))}
                              </DiscountSlider>
                            )}
                          </div>
                        )}
                    </>
                  ) : (
                    <Preloader />
                  )}
                </div>
              </div>
            )}
          </div>

          {partners.count > 0 && (
            <div
              className={classnames(
                "organization-module__content__discounts",
                darkTheme && "organization-module__content__discounts--dark",
              )}
            >
              <div className="organization-module__content__hotlinks-nav">
                <h5 className="f-16 f-500 tl">
                  {permissions && permissions.can_see_stats
                    ? translate("Статистика партнеров", "org.partnerStatistics")
                    : translate("Партнеры {title}", "org.partnerOf", { title })}
                </h5>
                <Link
                  to={
                    permissions && permissions.can_see_stats
                      ? `/organizations/${id}/partner-statistics`
                      : `/home/partners/${id}`
                  }
                  className="home-partners__top-link f-14 f-500"
                >
                  {translate("Показать все", "app.showAll")}
                </Link>
              </div>
              <PartnersStatistic
                organization={id}
                title={title}
                partners={partners}
                isMain={true}
                permission={permissions && permissions.can_see_stats}
                className="organization-module__partners"
              />
            </div>
          )}

          {isPrivateOrg() ? (
            <>
              {is_deleted ? (
                <DeactivatedOrgPlaceholder />
              ) : (
                <PrivateOrg
                  promoCashBack={promo_cashback}
                  showDiscounts={showDiscounts}
                  toggleShowDiscounts={toggleShowDiscounts}
                  isSubscribed={is_subscribed}
                  currency={currency}
                  id={id}
                />
              )}
            </>
          ) : is_deleted ? (
            <DeactivatedOrgPlaceholder />
          ) : (
            <>
              <div
                className={classnames(
                  "organization-module__content__hotlinks",
                  darkTheme && "organization-module__content__hotlinks--dark",
                )}
              >
                <div className="organization-module__content__hotlinks-nav">
                  <div>
                    <h2>
                      {translate("Ссылки и подборки", "hotlink.titleNew2")}
                    </h2>
                    <div className="slide-btns">
                      <svg
                        width="10"
                        height="16"
                        viewBox="0 0 10 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          if (
                            hotlinksScrollRef.current &&
                            hotlinksScrollRef.current.container &&
                            hotlinksScrollRef.current.container.current
                          ) {
                            hotlinksScrollRef.current.container.current.scrollBy(
                              { left: -200, behavior: "smooth" },
                            );
                          }
                        }}
                        className="prev"
                        style={{ cursor: "pointer" }}
                      >
                        <path
                          d="M8 2L2 8L8 14"
                          stroke="#007AFF"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <svg
                        width="10"
                        height="16"
                        viewBox="0 0 10 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          if (
                            hotlinksScrollRef.current &&
                            hotlinksScrollRef.current.container &&
                            hotlinksScrollRef.current.container.current
                          ) {
                            hotlinksScrollRef.current.container.current.scrollBy(
                              { left: 200, behavior: "smooth" },
                            );
                          }
                        }}
                        className="next"
                        style={{ cursor: "pointer" }}
                      >
                        <path
                          d="M2 14L8 8L2 2"
                          stroke="#007AFF"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <Link
                    to={`/organizations/${id}/hotlinks`}
                    className="home-partners__top-link f-14 f-500"
                  >
                    {translate("Показать все", "app.showAll")}
                  </Link>
                </div>

                <OrganizationHotlinks
                  orgID={orgDetail.data.id}
                  canEdit={permissions && permissions.can_edit_organization}
                  scrollContainerRef={hotlinksScrollRef}
                />
              </div>

              {!showDiscounts && (
                <>
                  <div className="organization-module__content__posts">
                    <OrganizationPosts
                      orgID={id}
                      isSearchOpen={isSearchOpen}
                      darkTheme={darkTheme}
                      newFilter={filters.categoryObjects}
                      orgDetail={orgDetail.data}
                      mode="page"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {isSearchOpen && orgDetail?.data ? (
        <SearchForOrgModule
          orgID={id}
          orgDetail={orgDetail.data}
          setIsSearchOpen={setIsSearchOpen}
        />
      ) : null}
      {isFilterOpen && orgDetail?.data && (
        <CategoryFilterOrg
          setNewFilters={setNewFilters}
          newFilters={newFilters}
          filters={filters}
          isOpen={isFilterOpen}
          orderingOptions={ORDERING_OPTIONS}
          data={orgDetail?.data}
          categoryList={categoryList}
          setCategoryList={setCategoryList}
          onClose={() => setIsFilterOpen(false)}
          onClear={() => console.log("clear filters")}
          setFilters={setFilters}
        />
      )}
      <MobileMenu
        isOpen={showMenu}
        contentLabel={MENUS[menu]}
        onRequestClose={() => toggleMenu(false, null)}
      >
        <div
          className={classnames(
            "organization-module__menu",
            showMenu && "organization-module__menu-active",
          )}
        >
          {menu === 0 && permissions.is_owner && (
            <React.Fragment>
              <RowButton
                type={ROW_BUTTON_TYPES.link}
                label={translate("Редактирование", "app.edit")}
                showArrow={false}
                to={`/organizations/${id}/edit-main`}
              >
                <EditIcon />
              </RowButton>

              {!is_deleted && (
                <>
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Управление скидками",
                      "org.discountManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/edit-discounts`}
                  >
                    <DiscountIcon />
                  </RowButton>

                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Управление купонами",
                      "org.couponsManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/coupons`}
                  >
                    <CouponIcon />
                  </RowButton>

                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Управление партнерами",
                      "org.partnerManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/partners`}
                  >
                    <PartnersIcon />
                  </RowButton>
                </>
              )}
            </React.Fragment>
          )}

          {menu === 1 && (
            <React.Fragment>
              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    label={translate("Добавить", "org.addPost")}
                    showArrow={false}
                    onClick={() => {
                      setState((prevState) => ({
                        ...prevState,
                        showMenu: false,
                      }));
                      dispatch(
                        setGlobalMenu({
                          type: MENU_TYPES.organization_add_menu,
                          menuLabel: translate("Добавить", "app.add"),
                          orgID: id,
                        }),
                      );
                    }}
                  >
                    <AddIcon />
                  </RowButton>
                )}

              {permissions && permissions.can_sale && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.button}
                  label={translate("Касса", "org.cashRegister")}
                  showArrow={true}
                  onClick={() => toggleMenu(true, 3)}
                >
                  <ReceiptCutOff />
                </RowButton>
              )}

              {permissions &&
                (permissions.can_edit_organization ||
                  permissions.can_edit_partner) && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.button}
                    label={translate(
                      "Настройки организации",
                      "org.orgSettings",
                    )}
                    showArrow={true}
                    onClick={() => toggleMenu(true, 4)}
                  >
                    <SettingsCheck />
                  </RowButton>
                )}

              {permissions && permissions.can_see_stats && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.link}
                  label={translate(
                    "Статистика продаж",
                    "org.salesAndDiscounts",
                  )}
                  showArrow={false}
                  to={`/organizations/${id}/receipts`}
                >
                  <MarketIcon />
                </RowButton>
              )}

              {permissions && permissions.can_send_message && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.link}
                  label={translate(
                    "Отправить сообщение подписчикам",
                    "org.sendMessageToFollowers",
                  )}
                  showArrow={false}
                  to={`/organizations/${id}/messages`}
                >
                  <MessageIcon />
                </RowButton>
              )}

              {!is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.button}
                  label={translate("Поделиться", "app.share")}
                  showArrow={false}
                  onClick={() => {
                    setShowOrganizationQR(true);
                    toggleMenu(false, null);
                  }}
                >
                  <ShareIcon />
                </RowButton>
              )}

              {permissions && !permissions.can_send_message && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.link}
                  label={translate(
                    "Сообщения подписчикам",
                    "org.messageFollowers",
                  )}
                  showArrow={false}
                  to={`/organizations/${id}/messages?org=${id}`}
                >
                  <MessageIcon />
                </RowButton>
              )}

              {permissions &&
                permissions.can_check_attendance &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Сканер пропусков",
                      "org.attendanceScanner",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/attendance-scan`}
                  >
                    <ScanIcon />
                  </RowButton>
                )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate("Сотрудники", "app.employees")}
                    showArrow={false}
                    to={`/organizations/${id}/employees`}
                  >
                    <PartnersIcon />
                  </RowButton>
                )}
              {permissions && !permissions.is_owner && !is_deleted && (
                <RowButton
                  label={
                    <span className="organization-module__menu-complain-btn-label">
                      {translate("Пожаловаться", "shop.complain")}
                    </span>
                  }
                  showArrow={false}
                  onClick={() => {
                    dispatch(
                      setViews({
                        type: VIEW_TYPES.organization_complain,
                        orgID: id,
                      }),
                    );
                    setState((prevState) => ({
                      ...prevState,
                      showMenu: false,
                    }));
                  }}
                >
                  <ComplainIcon />
                </RowButton>
              )}
              {!is_deleted && !is_blacklist && user && (
                <RowButton
                  label={
                    <span className="organization-module__menu-hide-from-feed-btn-label">
                      {translate("Скрыть с ленты", "shop.hideFromHomeFeed")}
                    </span>
                  }
                  onClick={async () => {
                    const res = await addToBlacklist(id);
                    if (res && res.success) {
                      dispatch(
                        setOrganizationDetail({
                          data: {
                            ...orgDetail.data,
                            is_blacklist: true,
                          },
                        }),
                      );
                    } else {
                      Notify.error({
                        text: translate(
                          "Не удалось скрыть организацию",
                          "shop.failedToHideOrg",
                        ),
                      });
                    }
                    setState((prevState) => ({
                      ...prevState,
                      showMenu: false,
                    }));
                  }}
                  showArrow={false}
                >
                  <EyeOffIcon />
                </RowButton>
              )}
              {/* показать на ленте */}
              {!is_deleted &&
                is_blacklist &&
                user &&
                permissions.can_edit_organization && (
                  <RowButton
                    label={
                      <span className="organization-module__menu-show-in-feed-btn-label">
                        {translate("Показать на ленте", "shop.showInFeed")}
                      </span>
                    }
                    onClick={async () => {
                      const res = await removeFromBlacklist(id);
                      if (res && res.success) {
                        dispatch(
                          setOrganizationDetail({
                            data: {
                              ...orgDetail.data,
                              is_blacklist: false,
                            },
                          }),
                        );
                      } else {
                        Notify.error({ text: translate("") });
                      }
                      setState((prevState) => ({
                        ...prevState,
                        showMenu: false,
                      }));
                    }}
                    showArrow={false}
                  >
                    <EyeIcon />
                  </RowButton>
                )}
              {(permissions?.can_edit_organization ||
                permissions?.can_edit_partner) &&
                !is_deleted && (
                  <>
                    {(!subscription_status ||
                      subscription_status === "test" ||
                      subscription_status === "expired") && (
                      <RowButton
                        type={ROW_BUTTON_TYPES.button}
                        label={translate(
                          "Тарифы подписки",
                          "org.subscriptionPlans",
                        )}
                        showArrow={false}
                        onClick={() => {
                          setState((prev) => ({ ...prev, showMenu: false }));
                          history.push({
                            pathname: `/organizations/${id}/subscription-plans`,
                            state: {
                              countryCode: orgDetail.data.country?.code || "AE",
                            },
                          });
                        }}
                      >
                        <NotActiveSub />
                      </RowButton>
                    )}

                    {subscription_status === "active" && (
                      <RowButton
                        type={ROW_BUTTON_TYPES.link}
                        label={translate(
                          "Активная подписка",
                          "org.activeSubscription",
                        )}
                        showArrow={false}
                        to={`/organizations/${id}/subscription-detail`}
                      >
                        <ActiveSub />
                      </RowButton>
                    )}
                  </>
                )}
            </React.Fragment>
          )}

          {menu === 2 && permissions.can_edit_organization && !is_deleted && (
            <div className="discount-wallpaper">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="discount-wallpaper__form"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.40972 0.100098L12.9233 0.101783C14.8672 0.122157 15.8489 0.330036 16.8666 0.874298C17.8382 1.39395 18.6062 2.16189 19.1258 3.13354C19.7003 4.20776 19.9 5.2419 19.9 7.40981V12.5904C19.9 14.7583 19.7003 15.7924 19.1258 16.8666C18.6062 17.8383 17.8382 18.6062 16.8666 19.1259C15.7923 19.7004 14.7582 19.9001 12.5903 19.9001H7.40972C5.24181 19.9001 4.20767 19.7004 3.13345 19.1259C2.1618 18.6062 1.39385 17.8383 0.874206 16.8666C0.299707 15.7924 0.100006 14.7583 0.100006 12.5904L0.101691 7.07676C0.122066 5.13293 0.329944 4.15123 0.874206 3.13354C1.39385 2.16189 2.1618 1.39395 3.13345 0.874298C4.20767 0.299799 5.24181 0.100098 7.40972 0.100098ZM13.0895 11.2917L9.36163 15.822C9.04614 16.2054 8.47975 16.2608 8.09587 15.9459L6.05405 14.271L3.24818 17.0266C3.46765 17.2234 3.71264 17.3944 3.98233 17.5386C4.67826 17.9108 5.35466 18.0665 6.84755 18.0951L7.40972 18.1001H12.5903L13.1525 18.0951C14.4697 18.0698 15.1513 17.9457 15.7715 17.6611L16.0177 17.5386C16.6757 17.1867 17.1867 16.6757 17.5385 16.0178C17.6384 15.8311 17.7226 15.6459 17.793 15.446L13.0895 11.2917ZM12.5903 1.9001H7.40972L6.84755 1.90508C5.5303 1.93035 4.84871 2.05451 4.2285 2.33905L3.98233 2.46156C3.32436 2.81345 2.81336 3.32445 2.46147 3.98242L2.33896 4.22859C2.01648 4.9315 1.90001 5.71323 1.90001 7.40981V12.5904L1.90499 13.1526C1.92672 14.2851 2.02154 14.9477 2.22853 15.5054L5.36937 12.4205C5.69735 12.0984 6.21538 12.0752 6.57081 12.3668L8.54271 13.9843L12.2919 9.42823C12.6155 9.03488 13.2009 8.98833 13.5827 9.32557L18.0914 13.3106C18.0928 13.2589 18.094 13.2063 18.095 13.1526L18.1 12.5904V7.40981L18.095 6.84764C18.0697 5.53039 17.9456 4.8488 17.6611 4.22859L17.5385 3.98242C17.1867 3.32445 16.6757 2.81345 16.0177 2.46156C15.3218 2.08938 14.6454 1.93372 13.1525 1.90508L12.5903 1.9001ZM6.50001 5.0001C7.32843 5.0001 8.00001 5.67167 8.00001 6.5001C8.00001 7.32853 7.32843 8.0001 6.50001 8.0001C5.67158 8.0001 5.00001 7.32853 5.00001 6.5001C5.00001 5.67167 5.67158 5.0001 6.50001 5.0001Z"
                    fill="#3F8AE0"
                  />
                </svg>

                <label
                  htmlFor="discount-image"
                  className={classnames(
                    "discount-wallpaper__label f-17",
                    cardImageLoading && "discount-wallpaper__label-loading",
                  )}
                >
                  {cardImageLoading
                    ? translate(
                        "Смена фона карты",
                        "org.discountBackgroundChanging",
                      )
                    : translate(
                        "Сменить на свой фон",
                        "org.discountBackgroundChangeOwn",
                      )}
                </label>
                <input
                  type="file"
                  id="discount-image"
                  name="discount-image"
                  onChange={handleUpload}
                  disabled={cardImageLoading}
                />
              </form>

              <div className="discount-wallpaper__recommendations">
                <h6 className="f-16 f-600">
                  {translate("Рекомендации", "app.suggestions")}
                </h6>

                <ScrollContainer
                  className="discount-wallpaper__scroll"
                  vertical={false}
                  horizontal={true}
                >
                  <ul className="discount-wallpaper__list">
                    {cardBackgrounds.loading && (
                      <div>{translate("Загрузка...", "app.loading")}</div>
                    )}

                    {cardBackgrounds.data?.map((bg) => (
                      <li
                        key={bg.id}
                        className="discount-wallpaper__item"
                        onClick={() => setCardBackground(bg.id)}
                      >
                        <img src={bg.file} alt={bg.name} />
                      </li>
                    ))}
                  </ul>
                </ScrollContainer>
              </div>
            </div>
          )}

          {menu === 3 && (
            <>
              {permissions && permissions.can_sale && !is_deleted && (
                <RowButton
                  label={translate("Провести сделку", "org.makeDiscount")}
                  showArrow={false}
                  onClick={() => {
                    dispatch(
                      setPreOrganization({
                        id: id,
                        image: image,
                        title: title,
                        types: types,
                        currency: currency,
                        online_payment_activated,
                      }),
                    );
                    history.push(`/proceed-discount/${id}`);
                  }}
                >
                  <QRIcon />
                </RowButton>
              )}

              {permissions && permissions.can_sale && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.button}
                  label={translate(
                    "Очистить очередь заказов",
                    "shop.clearOrderCount",
                  )}
                  showArrow={false}
                  onClick={() => {
                    resetPurchaseID(id).finally(() => {
                      toggleMenu(false, null);
                    });
                  }}
                >
                  <RefreshIcon />
                </RowButton>
              )}
            </>
          )}

          {menu === 4 && (
            <>
              {permissions && permissions.can_edit_organization && (
                <RowButton
                  type={ROW_BUTTON_TYPES.link}
                  label={translate("Редактирование", "app.edit")}
                  showArrow={false}
                  to={`/organizations/${id}/edit-main`}
                >
                  <EditIcon />
                </RowButton>
              )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Управление скидками",
                      "org.discountManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/edit-discounts`}
                  >
                    <DiscountIcon />
                  </RowButton>
                )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Управление купонами",
                      "org.couponsManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/coupons`}
                  >
                    <CouponIcon />
                  </RowButton>
                )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted &&
                orgDetail.data.assistant !== null && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "AI Ассистент настройки",
                      "org.aiAssistantSettings",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/assistant?mode=edit`}
                  >
                    <AIIcon />
                  </RowButton>
                )}

              {permissions && permissions.can_edit_partner && !is_deleted && (
                <RowButton
                  type={ROW_BUTTON_TYPES.link}
                  label={translate(
                    "Управление партнерами",
                    "org.partnerManage",
                  )}
                  showArrow={false}
                  to={`/organizations/${id}/partners`}
                >
                  <PartnersIcon />
                </RowButton>
              )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Настройки проводимых акций",
                      "org.promotionManage",
                    )}
                    showArrow={false}
                    to={`/organizations/${id}/promotion`}
                  >
                    <PromotionBlueIcon />
                  </RowButton>
                )}

              {permissions &&
                permissions.can_edit_organization &&
                !is_deleted && (
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={
                      <div
                        className="row-button__content"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>
                          {translate("Скачать товары", "org.downloadProducts")}
                        </span>
                        {isDownload && <Loader />}
                      </div>
                    }
                    showArrow={false}
                    onClick={() => handleDownloadProducts()}
                    to="#"
                  >
                    <ExcelIcon />
                  </RowButton>
                )}

              {orgDetail.data.maaly_pay_config !== null && (
                <a
                  href="https://maalyportal.com/merchant"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RowButton
                    type={ROW_BUTTON_TYPES.button}
                    label={translate(
                      "Личный кабинет Maaly Pay",
                      "org.maalyPay",
                    )}
                  >
                    <img
                      src={maalyPay}
                      alt="Maaly Pay"
                      style={{ marginRight: 20 }}
                    />
                  </RowButton>
                </a>
              )}
            </>
          )}
        </div>
      </MobileMenu>
      <MobileMenu
        isOpen={openApp}
        onRequestClose={() => setOpenApp(false, null)}
        contentLabel={translate("Приложение App", "org.downloadApp")}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "34px",
            padding: "15px",
          }}
        >
          <ShareApplication link={applicationLink} />
          <DownloadApplication id={id} />
        </div>
      </MobileMenu>

      <MobileMenu
        isOpen={workTime}
        onRequestClose={() => setWorkTime(false, null)}
        contentLabel={translate("Время работы", "org.organizationTime")}
      >
        <WorkTimeContent
          setBackEndData={setBackEndData}
          backEndData={backEndData}
          start={opens_at}
          end={closes_at}
        />
      </MobileMenu>

      <MobileMenu
        isOpen={showContacts}
        onRequestClose={() => toggleShowContacts(false, null)}
        contentLabel={translate("Контакты и web", "app.contactsAndWeb")}
      >
        {phone_numbers.map((phone) => (
          <LinkerComp key={phone.id} type="phone" value={phone.phone_number} />
        ))}

        {social_contacts.map((social) => (
          <LinkerComp
            key={social.id}
            type={social.url.match(EMAIL_REGEX) ? "mail" : "web"}
            value={social.url}
          />
        ))}
      </MobileMenu>

      {invocieDialog && (
        <Dialog
          open={invocieDialog}
          title={translate("Оплата инвойса", "app.paymentInvoice")}
          description={translate(
            "Инвойс отправлен на указанную Вами почту. Далее следуйте инструкции:\n\n" +
              "• Оплатите инвойс по указанным реквизитам через банк.\n" +
              "• Сохраните квитанцию или скриншот перевода.\n" +
              "• Отправьте подтверждение (скрин/чек) на e-mail: apofizpay@gmail.com\n" +
              "   с фразой: “Invoice number, Payment completed. Please confirm receipt.”",
            "invoice.payed",
          )}
          buttons={[
            {
              title: translate("Ок", "common.ok"),
              onClick: () => dispatch(setInvoiceDialog(false)),
            },
          ]}
        />
      )}
      {showOrganizationQR && (
        <React.Suspense fallback={<Preloader />}>
          <OrganizationQR
            org={orgDetail.data}
            full_location={full_location}
            onClose={() => setShowOrganizationQR(false)}
          />
        </React.Suspense>
      )}
      {showPaymentMethods && (
        <PaymentMethodsLayer
          orgID={id}
          isOpen={showPaymentMethods}
          onBack={() => setShowPaymentMethods(false)}
        />
      )}
    </React.Fragment>
  );
};

export default OrganizationModule;
