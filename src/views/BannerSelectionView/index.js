import React, { useState, useEffect } from "react";
import MobileTopHeader from "@/components/MobileTopHeader";
import { translate } from "../../locales/locales";
import axios from "../../axios-api";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setViews } from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";

import "./index.scss";
import Preloader from "@components/Preloader";
import { DeleteBannerIcon } from "@components/UI/Icons";
import useDialog from "@components/UI/Dialog/useDialog";

const BannerSelectionView = ({
  onBack,
  onSave,
  currentBanner,
  initialTempBanners = [],
  appId,
  isCoupon,
}) => {
  const getInitialTempBanners = () => {
    try {
      const storedBanners = localStorage.getItem("tempBanners");
      if (storedBanners) {
        const parsedBanners = JSON.parse(storedBanners);
        // Recreate URL.createObjectURL for each banner if needed
        return parsedBanners;
      }
    } catch (e) {
      console.error("Error retrieving banners from localStorage:", e);
    }
    return initialTempBanners || [];
  };

  const [banners, setBanners] = useState([]);
  const [couponBanners, setCouponBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(currentBanner || null);
  const [loading, setLoading] = useState(false);
  const aspectRatio = "16:9";
  const { organizationId } = useParams();
  const location = useLocation();
  const path = location.pathname;

  const [isEditMode, setIsEditMode] = useState(path.includes("edit-main"));
  const [isEditApp, setIsEditApp] = useState(path.includes("/apps/edit/"));
  const [isCreateCoupons, setIsCreateCoupons] = useState(
    path.includes("/coupons/create")
  );
  const [isEditCoupons, setIsEditCoupons] = useState(
    path.includes("/coupons/edit")
  );

  const dispatch = useDispatch();
  const { confirm } = useDialog();
  const [tempBanners, setTempBanners] = useState(getInitialTempBanners());

  const items = useSelector((state) => state.couponBanner.items);

  const reduxBanners = (items || []).map((b) => ({
    ...b,
    url: b.url || b.file || "",
  }));

  const applicationId =
    appId ||
    (location.pathname.match(/\/edit\/(\d+)/) &&
      location.pathname.match(/\/edit\/(\d+)/)[1]);

  useEffect(() => {
    const isEditingApp = path.includes("/apps/edit/");
    setIsEditApp(isEditingApp);
    const isEditing = path.includes("edit-main");
    // const isCreating = path.includes("organizations/create");
    setIsEditMode(isEditing);
  }, [location.pathname]);

  useEffect(() => {
    if (!isEditMode && initialTempBanners && initialTempBanners.length > 0) {
      setTempBanners(initialTempBanners);
      setLoading(false);
    }
  }, [isEditMode, initialTempBanners]);

  // Extract organization ID from URL or props
  // Extract organization ID from URL or props
  const getOrganizationId = () => {
    // Check URL params first
    if (organizationId) return organizationId;

    // Try to get from location state
    if (location.state && location.state.organizationId) {
      return location.state.organizationId;
    }

    // Try to get from URL query params
    const searchParams = new URLSearchParams(location.search);
    const orgIdFromQuery = searchParams.get("organizationId");
    if (orgIdFromQuery) return orgIdFromQuery;

    // Try to extract from pathname
    const pathMatch = location.pathname.match(/\/organizations\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    // Fallback to currentBanner if it has organization info
    if (currentBanner && currentBanner.organizationId) {
      return currentBanner.organizationId;
    }

    // Last resort - check if we have an organizationId in the view props
    if (window.viewProps && window.viewProps.organizationId) {
      return window.viewProps.organizationId;
    }

    // Hardcoded fallback for development/testing
    console.warn("Could not determine organization ID, using default");
    return 0; // Default organization ID for testing
  };

  // finish

  // Add a function to fetch banners
  const fetchBanners = async () => {
    const orgId = getOrganizationId();
    if (!orgId && !applicationId) return;

    setLoading(true);
    try {
      const url = isEditApp
        ? `/applications/${applicationId}/banners/`
        : `/organizations/${orgId}/banners/`;

      const res = await axios.get(url);

      const list = res.data.list.map((b) => ({
        id: b.id,
        url: b.image.file, // ❗ ТОЛЬКО file
        originalImage: b.image,
        isDefault: b.is_default,
      }));

      setBanners(list);

      if (!selectedBanner) {
        const def = list.find((b) => b.isDefault);
        if (def) setSelectedBanner(def);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponBanners = async (selectBannerId = null) => {
    const orgId = getOrganizationId();
    if (!orgId) return;

    setLoading(true);

    try {
      const res = await axios.get(`/organizations/${orgId}/coupons/banners`);

      const list = (res.data.list || []).map((b) => ({
        id: b.id,
        url: b.image.file,
        originalImage: b.image,
        isDefault: b.is_default,
      }));

      setCouponBanners(list);

      // 👉 1. если передали id — выбираем его
      if (selectBannerId) {
        const created = list.find((b) => b.id === selectBannerId);
        if (created) {
          setSelectedBanner(created);
          return;
        }
      }

      // 👉 2. fallback: дефолтный
      const def = list.find((b) => b.isDefault);
      if (def) {
        setSelectedBanner(def);
        return;
      }

      // 👉 3. fallback: первый
      if (list.length) {
        setSelectedBanner(list[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCreateCoupons || isEditCoupons) {
      fetchCouponBanners();
    } else if (!isCoupon) {
      fetchBanners();
    } else {
      setLoading(false);
    }
  }, [isCoupon, isCreateCoupons, isEditCoupons]);

  const handleSave = () => {
    if (selectedBanner) {
      // Make sure we're passing back the full banner object with all necessary properties
      if (!isEditMode && tempBanners.length > 0) {
        onSave &&
          onSave({
            ...selectedBanner,
            tempBanners: tempBanners,
          });
      } else {
        onSave && onSave(selectedBanner);
      }
    } else {
      // If no banner is selected, show a notification or select the default one
      const defaultBanner = banners.find((b) => b.isDefault);
      if (defaultBanner) {
        setSelectedBanner(defaultBanner);
        onSave && onSave(defaultBanner);
      } else {
        console.warn("No banner selected and no default banner found");
      }
    }
  };

  const handleAddBanner = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const currentView = {
        type: VIEW_TYPES.banner_selection,
        onSave,
        currentBanner: selectedBanner,
      };

      dispatch(
        setViews([
          currentView,
          {
            type: VIEW_TYPES.image_horizontal_crop,
            uploads: [file],
            // cropConfig: { aspect: 16 / 9 },

            onSave: async (images) => {
              if (!images?.length) {
                dispatch(setViews([currentView]));
                return;
              }

              setLoading(true);

              try {
                const formData = new FormData();
                formData.append("file", images[0].original);

                const upload = await axios.post("/files/", formData);
                const imageId = upload.data.id;
                const orgId = getOrganizationId();

                // EDIT ORG / APP
                if (isEditMode || isEditApp) {
                  const url = isEditApp
                    ? `/applications/${applicationId}/banners/custom/`
                    : `/organizations/${orgId}/banners/custom/`;

                  await axios.post(url, { image_id: imageId });
                  await fetchBanners();
                }

                // COUPONS
                else if (isCreateCoupons || isEditCoupons) {
                  const res = await axios.post(
                    `/organizations/${orgId}/coupons/banners`,
                    {
                      image: imageId,
                    }
                  );
                  const createdBannerId = res.data?.id;
                  await fetchCouponBanners(createdBannerId);
                }

                // CREATE (TEMP)
                else {
                  const previewUrl = URL.createObjectURL(images[0].original);

                  const tempBanner = {
                    id: `temp-${Date.now()}`,
                    url: upload.data.file,
                    previewUrl,
                    isTemp: true,
                  };

                  const updated = [tempBanner, ...tempBanners];
                  setTempBanners(updated);
                  setSelectedBanner(tempBanner);

                  localStorage.setItem("tempBanners", JSON.stringify(updated));
                }
              } catch (err) {
                confirm({
                  title: translate("Ошибка", "common.error"),
                  description: translate(
                    "Не удалось загрузить баннер",
                    "org.bannerUploadError"
                  ),
                  confirmTitle: translate("OK", "common.ok"),
                });
              } finally {
                setLoading(false);
                dispatch(setViews([currentView]));
              }
            },

            onBack: () => dispatch(setViews([currentView])),
          },
        ])
      );
    };

    input.click();
  };

  console.log("COUPONS BANNER", couponBanners);

  const bannersToRender =
    isCreateCoupons || isEditCoupons
      ? [...couponBanners, ...reduxBanners]
      : isEditMode || isEditApp
      ? banners
      : [...tempBanners, ...reduxBanners];

  const getBannerBackground = (banner) => {
    if (banner.isTemp) {
      return banner.previewUrl;
    }

    if (banner.url) {
      return banner.url;
    }

    if (banner.image?.file) {
      return banner.image.file;
    }

    return "";
  };

  return (
    <div className="banner-selection-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate("Выбор баннера", "org.bannerSelection")}
        onSubmit={handleSave}
        onClick={handleSave}
        submitLabel={translate("Сохранить", "app.save")}
      />
      <div className="container">
        {loading ? (
          <Preloader />
        ) : (
          <div className="banner-selection-view__grid">
            <div
              className="banner-selection-view__item banner-selection-view__add-item"
              onClick={handleAddBanner}
            >
              <div className="banner-selection-view__aspect-ratio">
                {aspectRatio}
              </div>
              <div className="banner-selection-view__add-text">
                {translate("Добавить баннер", "org.addBanner")}
              </div>
            </div>

            {bannersToRender.map((banner) => (
              <div
                key={banner.id}
                className={`banner-selection-view__item ${
                  selectedBanner && selectedBanner.id === banner.id
                    ? "banner-selection-view__item--selected"
                    : ""
                }`}
                onClick={() => setSelectedBanner(banner)}
                style={{
                  backgroundImage: `url(${getBannerBackground(banner)})`,
                }}
              >
                {!banner.file && (
                  <button
                    className="banner-selection-view__delete-btn"
                    onClick={async (e) => {
                      e.stopPropagation();

                      try {
                        // Confirm deletion
                        await confirm({
                          title: translate(
                            "Удаление баннера",
                            "org.deleteBanner"
                          ),
                          description: translate(
                            "Баннер будет удален без возможности возврата",
                            "org.confirmDeleteBanner"
                          ),
                          confirmTitle: translate("ОК", "common.ok"),
                          cancelTitle: translate("Отмена", "dialog.cancel"),
                        });

                        // User confirmed deletion
                        try {
                          setLoading(true);

                          if (isEditMode || isEditApp || isCreateCoupons || isEditCoupons) {
                            const orgId = getOrganizationId();

                            // Only make API call if we have a real banner ID and organization ID
                            if (
                              (orgId || applicationId) &&
                              banner.id &&
                              !String(banner.id).startsWith("temp-")
                            ) {
                              let api_url = "";

                              if (isEditCoupons || isCreateCoupons) {
                                api_url = `/organizations/${orgId}/coupons/banners/${banner.id}/`;
                              } else if (isEditApp && applicationId) {
                                api_url = `/applications/banners/${banner.id}`;
                              } else {
                                api_url = `/organizations/banners/${banner.id}`;
                              }
                              if (!isCoupon) {
                                await axios.delete(api_url);
                                await fetchBanners();
                                await fetchCouponBanners()
                              }
                            } else {
                              setBanners(
                                banners.filter((b) => b.id !== banner.id)
                              );
                              if (
                                selectedBanner &&
                                selectedBanner.id === banner.id
                              ) {
                                // If the deleted banner was selected, select the default one
                                const defaultBanner = banners.find(
                                  (b) => b.isDefault
                                );
                                setSelectedBanner(defaultBanner || null);
                              }
                            }
                          } else {
                            // await axios.delete(
                            //   `/files/${banner.originalImage.id}/`
                            // );
                            localStorage.removeItem("tempBanners");
                            const newBanners = banners.filter(
                              (b) => b.id !== banner.id
                            );
                            setBanners(newBanners);
                            setTempBanners(
                              tempBanners.filter((b) => b.id !== banner.id)
                            );

                            if (
                              selectedBanner &&
                              selectedBanner.id === banner.id
                            ) {
                              // If the deleted banner was selected, select another one
                              const defaultBanner = newBanners.find(
                                (b) => b.isDefault
                              );
                              setSelectedBanner(
                                defaultBanner ||
                                  (newBanners.length > 0 ? newBanners[0] : null)
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Error deleting banner:", error);
                          confirm({
                            title: translate("Ошибка", "common.error"),
                            description: translate(
                              "Не удалось удалить баннер. Пожалуйста, попробуйте еще раз.",
                              "org.bannerDeleteError"
                            ),
                            confirmTitle: translate("OK", "common.ok"),
                            cancelTitle: false,
                          });
                        } finally {
                          setLoading(false);
                        }
                      } catch (e) {
                        // User canceled deletion
                        console.log("Banner deletion canceled");
                      }
                    }}
                  >
                    <DeleteBannerIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSelectionView;
