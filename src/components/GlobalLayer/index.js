import React, { useEffect, useRef, Suspense } from "react";
import * as classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { setViews } from "../../store/actions/commonActions";
import LoadingWithTopHeader from "../LoadingWithTopHeader/LoadingWithTopHeader";
import "./index.scss";
import ThemeMenu from "@pages/CommentsPage/ThemeMenu";

const PostComplainView = React.lazy(() =>
  import("../../views/PostComplainView")
);
const OrganizationComplainView = React.lazy(() =>
  import("../../views/OrganizationComplainView")
);
const CityAndCountryView = React.lazy(() =>
  import("../../views/CityAndCountryView")
);
const Slideshow = React.lazy(() => import("../../views/Slideshow"));
const AllDiscountsView = React.lazy(() =>
  import("../../views/AllDiscountsView")
);
const MapView = React.lazy(() => import("../../views/MapView"));
const QRScanView = React.lazy(() => import("../../views/QRScanView"));

const ImageCropView = React.lazy(() => import("../../views/ImageCropView"));

const TextInputView = React.lazy(() => import("../../views/TextInputView"));

const ImageHorizontalCropView = React.lazy(() =>
  import("../../views/ImageHorizontalCropView")
);
const CourierDeliveryView = React.lazy(() =>
  import("../../views/CourierDeliveryView")
);
const LanguageTranslateList = React.lazy(() =>
  import("../LanguageTranslateList")
);
const CurrencyView = React.lazy(() => import("../../containers/CurrencyView"));
const AuthHistoryView = React.lazy(() =>
  import("../../containers/AuthHistoryView")
);
const AccountDeletionConfirmationView = React.lazy(() =>
  import("../../views/AccountDeletionConfirmationView")
);
const OrganizationTransferView = React.lazy(() =>
  import("../../views/OrganizationTransferView")
);
const BannerSelectionView = React.lazy(() =>
  import("../../views/BannerSelectionView")
);

const AddFolderView = React.lazy(() => import("../../views/AddFolderView"));

const OrganizationsMapModuleService = React.lazy(() =>
  import("../../containers/OrganizationsMapModuleService")
);

const GroupMembersView = React.lazy(() =>
  import("../../views/GroupMembersView")
);

const AddMembersGroup = React.lazy(() =>
  import("../../views/AddMembersGroupView")
);

const ImageThemeCropView = React.lazy(() =>
  import("../../views/ImageThemeCropView")
);


export const VIEW_TYPES = {
  add_folder: "add_folder",
  banner_selection: "banner_selection",
  theme_selection: "theme_selection", // меню тем
  image_theme_crop: "image_theme_crop", // 👈 НОВЫЙ
  product_complain: "product_complain",
  organization_complain: "organization_complain",
  region_select: "region_select",
  slideshow: "slideshow",
  map: "map",
  map_service: "map_service",
  qr_scan: "qr_scan",
  image_crop: "image_crop",
  image_horizontal_crop: "image_horizontal_crop",
  text_input: "text_input",
  courier_delivery: "courier_delivery",
  language_list: "language_list",
  currency_list: "currency_list",
  auth_history: "auth_history",
  account_deletion_confirmation: "account_deletion_confirmation",
  organization_transfer: "organization_transfer",
  all_discounts: "all_discounts",
  group_members: "group_members",
  addMembersGroup: "addMembersGroup",
};

export const GlobalLayer = () => {
  const elementID = "views";
  const views = useSelector((state) => state.commonStore.views);
  const dispatch = useDispatch();
  let root = useRef(document.getElementById(elementID));

  const onClose = (type) =>
    dispatch(setViews(views.filter((view) => view.type !== type)));

  useEffect(() => {
    if (views && !!views.length) {
      document.body.style.overflow = "hidden";
      root.current.classList.add("active");
    } else {
      document.body.style.overflow = "unset";
      root.current.classList.remove("active");
    }
  }, [views]);

  useEffect(() => {
    return () => (document.body.style.overflow = "unset");
  }, []);

  const renderView = (view) => {
    switch (view.type) {
      case VIEW_TYPES.product_complain:
        return <PostComplainView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.organization_complain:
        return (
          <OrganizationComplainView
            onBack={() => onClose(view.type)}
            {...view}
          />
        );
      case VIEW_TYPES.region_select:
        return (
          <CityAndCountryView onBack={() => onClose(view.type)} {...view} />
        );
      case VIEW_TYPES.banner_selection:
        return (
          <BannerSelectionView
            onBack={() => onClose(view.type)}
            onSave={view.onSave}
            currentBanner={view.currentBanner}
          />
        );

      // THEME SELECTION
      case VIEW_TYPES.add_folder:
        return <AddFolderView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.slideshow:
        return <Slideshow onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.map:
        return <MapView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.map_service:
        return (
          <OrganizationsMapModuleService
            onBack={() => onClose(view.type)}
            serviceID={view.serviceID}
            initialLocations={view.location}
            categories={view.serviceCategories}
            {...view}
          />
        );
      case VIEW_TYPES.qr_scan:
        return <QRScanView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.image_crop:
        return <ImageCropView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.image_horizontal_crop:
        return (
          <ImageHorizontalCropView
            onBack={() => onClose(view.type)}
            {...view}
          />
        );
      case VIEW_TYPES.text_input:
        return <TextInputView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.courier_delivery:
        return (
          <CourierDeliveryView onBack={() => onClose(view.type)} {...view} />
        );
      case VIEW_TYPES.language_list:
        return (
          <LanguageTranslateList onBack={() => onClose(view.type)} {...view} />
        );
      case VIEW_TYPES.currency_list:
        return <CurrencyView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.auth_history:
        return <AuthHistoryView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.account_deletion_confirmation:
        return (
          <AccountDeletionConfirmationView
            onBack={() => onClose(view.type)}
            {...view}
          />
        );
      case VIEW_TYPES.organization_transfer:
        return (
          <OrganizationTransferView
            onBack={() => onClose(view.type)}
            {...view}
          />
        );
      case VIEW_TYPES.all_discounts:
        return <AllDiscountsView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.group_members:
        return <GroupMembersView onBack={() => onClose(view.type)} {...view} />;
      case VIEW_TYPES.addMembersGroup:
        return <AddMembersGroup onBack={() => onClose(view.type)} {...view} />;

      case VIEW_TYPES.theme_selection:
        return (
          <ThemeMenu
            onBack={() => onClose(view.type)}
            onSave={view.onSave}
            {...view}
          />
        );

      case VIEW_TYPES.image_theme_crop:
        return (
          <ImageThemeCropView onBack={() => onClose(view.type)} {...view} />
        );

      default:
        return null;
    }
  };

  const content = (
    <>
      {views &&
        !!views.length &&
        views.map((view) => (
          <div
            key={view.type}
            id={`views_wrap_${view.type}`}
            className={classnames("views-wrap", view.type)}
            onClick={(e) => e.stopPropagation()}
          >
            <Suspense fallback={<LoadingWithTopHeader />}>
              {renderView(view)}
            </Suspense>
          </div>
        ))}
    </>
  );

  return root.current && createPortal(content, root.current);
};
