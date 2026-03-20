import React, { useEffect, useMemo, useRef, useState } from "react";
import * as classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { setGlobalMenu } from "../../store/actions/commonActions";
import { translate } from "../../locales/locales";
import { CloseButton } from "../UI/Icons";
import Preloader from "../Preloader";
import "./index.scss";

const PostCardMenu = React.lazy(() => import("../Menus/PostCardMenu"));
const AppCardMenu = React.lazy(() => import("../Menus/AppCardMenu"));
const AddChatCardMenu = React.lazy(() => import("../Menus/AddChatCardMenu"));
const SortChatMenu = React.lazy(() => import("../Menus/SortChatMenu"));
const AddChatGroupPhotoCardMenu = React.lazy(() =>
  import("../Menus/AddChatGroupPhotoCardMenu")
);
const AppStoreCardMenu = React.lazy(() => import("../Menus/AppStoreCardMenu"));
const TranslateMenu = React.lazy(() => import("../Menus/TranslateMenu"));
const CurrencyMenu = React.lazy(() => import("../Menus/CurrencyMenu"));
const SizeMenu = React.lazy(() => import("../Menus/SizeMenu"));
const PostCommentMenu = React.lazy(() => import("../Menus/PostCommentMenu"));
const CommentComplaintsMenu = React.lazy(() =>
  import("../Menus/CommentComplaintsMenu")
);
const OrganizationAddMenu = React.lazy(() =>
  import("../Menus/OrganizationAddMenu")
);
const SubcategoryCreationMenu = React.lazy(() =>
  import("../Menus/Subcategory/SubcategoryCreationMenu")
);
const SubcategoryEditMenu = React.lazy(() =>
  import("../Menus/Subcategory/SubcategoryEditMenu")
);
const PostCompilationsMenu = React.lazy(() => import("../PostCompilationMenu"));
const PostCompilationCreateMenu = React.lazy(() =>
  import("../PostCompilationCreateMenu")
);
const PostShareMenu = React.lazy(() => import("../Menus/PostShareMenu"));
const AppShareMenu = React.lazy(() => import("../Menus/AppShareMenu"));
const AspectRatioSelectionMenu = React.lazy(() =>
  import("../Menus/AspectRatioSelectionMenu")
);
const ResumeRequestMenu = React.lazy(() =>
  import("../Menus/ResumeRequestMenu")
);
const UserOrganizationsMenu = React.lazy(() =>
  import("../Menus/UserOrganizationsMenu")
);

export const MENU_TYPES = {
  addChatGroupPhoto_card_menu: "addChatGroupPhoto_card_menu",
  addChat_card_menu: "addChat_card_menu",
  sort_chat_menu: "sort_chat_menu",
  app_card_menu: "app_card_menu",
  app_store_card_menu: "app_store_card_menu",
  post_card_menu: "post_card_menu",
  post_lang_menu: "post_lang_menu",
  post_currency_menu: "post_currency_menu",
  post_size_menu: "post_size_menu",
  //TODO: remove
  comment_menu: "comment_menu",
  comment_complaints_menu: "comment_complaints_menu",
  organization_add_menu: "organization_add_menu",
  category_creation_menu: "category_creation_menu",
  category_edit_menu: "category_edit_menu",
  post_compilations_menu: "post_compilations_menu",
  post_compilation_create_menu: "post_compilation_create_menu",
  aspect_ratio_selection_menu: "aspect_ratio_selection_menu",
  post_share_menu: "post_share_menu",
  app_share_menu: "app_share_menu",
  resume_request_menu: "resume_request_menu",
  organizations_menu: "organizations_menu",
};

const elementID = "global-menu";

const defaultOptions = {
  hidePageScrollbar: true,
  globalMenuClassName: null,
};

export const GlobalMenu = () => {
  const root = useRef(document.getElementById(elementID));
  const menu = useSelector((state) => state.commonStore.globalMenu);
  const dispatch = useDispatch();

  // const [isClosing, setIsClosing] = useState(false);

  const [customOverlayStyle, setCustomOverlayStyle] = useState({});
  const [customMenuStyle, setCustomMenuStyle] = useState({});
  useEffect(() => {
    if (menu?.containerSelector) {
      const container = document.querySelector(menu.containerSelector);
      if (container) {
        const rect = container.getBoundingClientRect();
        setCustomOverlayStyle({
          position: "fixed",
          left: rect.left + "px",
          bottom: "68px",
          width: rect.width + "px",
          height: "100%",
          maxWidth: rect.width + "px",
          margin: 0,
          borderRadius: "16px 16px 0 0",
          background: "rgba(0,0,0,0.18)",
          pointerEvents: "auto",
          zIndex: 1000,
        });
        setCustomMenuStyle({
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          maxHeight: 280 + "px",
          maxWidth: "100%",
          margin: 0,
          borderRadius: "16px 16px 0 0",
        });
      }
    } else {
      setCustomOverlayStyle({});
      setCustomMenuStyle({});
    }
  }, [menu?.containerSelector, menu]);

  const options = useMemo(() => {
    return menu?.options
      ? {
          ...defaultOptions,
          ...menu.options,
        }
      : defaultOptions;
  }, [menu]);

  const prevOptions = useRef(options);

  const onClose = () => {
    dispatch(setGlobalMenu(null));
  };

  const onOverlayClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  useEffect(() => {
    if (!root.current) {
      const el = document.createElement("div");
      el.setAttribute("id", elementID);

      root.current = document.body.appendChild(el);
    }
  }, []);

  useEffect(() => {
    const el = document.querySelector("#global-menu");
    if (menu?.isEditGroup && el) {
      el.style.zIndex = 1000;
    } else if (el) {
      el.style.zIndex = "";
    }
  }, [menu]);

  useEffect(() => {
    if (menu && root.current) {
      if (typeof options.globalMenuClassName === "string") {
        root.current.classList.add(options.globalMenuClassName);
      }

      options.hidePageScrollbar && (document.body.style.overflow = "hidden");
    } else {
      prevOptions.current?.hidePageScrollbar &&
        (document.body.style.overflow = "unset");
    }

    return () => {
      if (menu && root.current) {
        root.current.classList.remove(options.globalMenuClassName);
      }
    };
  }, [menu, options]);

  useEffect(() => {
    prevOptions.current = options ?? defaultOptions;
  }, [options]);

  const content = (
    <div
      className={classnames("global-menu__overlay", {
        active: menu,
        // closing: isClosing,
      })}
      onClick={onOverlayClick}
      style={menu?.containerSelector ? customOverlayStyle : undefined}
    >
      <div
        className={classnames("global-menu", {
          active: menu,
          // closing: isClosing,
        })}
        onClick={(e) => e.stopPropagation()}
        style={menu?.containerSelector ? customMenuStyle : undefined}
      >
        {!menu?.hideHeader && (
          <div className="global-menu__header">
            <h5 className="global-menu__title f-20 f-500 tl">
              {(menu && menu.menuLabel) ||
                translate("Настройки", "app.settings")}
            </h5>
            <CloseButton className="global-menu__close" onClick={onClose} />
          </div>
        )}

        {menu && (
          <div
            className="global-menu__content"
            id="global-menu-content"
            style={menu.contentStyle}
          >
            <React.Suspense fallback={<Preloader />}>
              {menu.type === MENU_TYPES.app_card_menu && (
                <AppCardMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.addChat_card_menu && (
                <AddChatCardMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.sort_chat_menu && (
                <SortChatMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.addChatGroupPhoto_card_menu && (
                <AddChatGroupPhotoCardMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.app_store_card_menu && (
                <AppStoreCardMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_card_menu && (
                <PostCardMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_lang_menu && (
                <TranslateMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_currency_menu && (
                <CurrencyMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_size_menu && (
                <SizeMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.comment_menu && (
                <PostCommentMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.comment_complaints_menu && (
                <CommentComplaintsMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.organization_add_menu && (
                <OrganizationAddMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.category_creation_menu && (
                <SubcategoryCreationMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.category_edit_menu && (
                <SubcategoryEditMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_compilations_menu && (
                <PostCompilationsMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_compilation_create_menu && (
                <PostCompilationCreateMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.aspect_ratio_selection_menu && (
                <AspectRatioSelectionMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.post_share_menu && (
                <PostShareMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.app_share_menu && (
                <AppShareMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.resume_request_menu && (
                <ResumeRequestMenu {...menu} onClose={onClose} />
              )}
              {menu.type === MENU_TYPES.organizations_menu && (
                <UserOrganizationsMenu {...menu} onClose={onClose} />
              )}
            </React.Suspense>
          </div>
        )}
      </div>
    </div>
  );

  return root.current && createPortal(content, root.current);
};
