// import React, { useState, useEffect } from "react";
// import MobileTopHeader from "@/components/MobileTopHeader";
// import { translate } from "../../locales/locales";
// import axios from "../../axios-api";
// import { useParams, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { setViews } from "../../store/actions/commonActions";
// import { VIEW_TYPES } from "../../components/GlobalLayer";

// import "./index.scss";
// import Preloader from "@components/Preloader";
// import { DeleteBannerIcon } from "@components/UI/Icons";
// import useDialog from "@components/UI/Dialog/useDialog";

// const BannerSelectionView = ({
//   onBack,
//   onSave,
//   currentBanner,
//   initialTempBanners = [],
//   appId,
//   isCoupon,
// }) => {
//   console.log("APP ID", appId);

//   const getInitialTempBanners = () => {
//     try {
//       const storedBanners = localStorage.getItem("tempBanners");
//       if (storedBanners) {
//         const parsedBanners = JSON.parse(storedBanners);
//         // Recreate URL.createObjectURL for each banner if needed
//         return parsedBanners;
//       }
//     } catch (e) {
//       console.error("Error retrieving banners from localStorage:", e);
//     }
//     return initialTempBanners || [];
//   };

//   const [banners, setBanners] = useState([]);
//   const [selectedBanner, setSelectedBanner] = useState(currentBanner || null);
//   const [loading, setLoading] = useState(true);
//   const aspectRatio = "16:9";
//   const { organizationId } = useParams();
//   const location = useLocation();
//   const path = location.pathname;

//   const [isEditMode, setIsEditMode] = useState(path.includes("edit-main"));
//   const [isEditApp, setIsEditApp] = useState(path.includes("/apps/edit/"));
//   const [isCreateCoupons, setIsCreateCoupons] = useState(
//     path.includes("/coupons/create")
//   );
//   const [isEditCoupons, setIsEditCoupons] = useState(
//     path.includes("/coupons/edit")
//   );

//   const dispatch = useDispatch();
//   const { confirm } = useDialog();
//   const [tempBanners, setTempBanners] = useState(getInitialTempBanners());

//   const items = useSelector((state) => state.couponBanner.items);

//   const reduxBanners = (items || []).map((b) => ({
//     ...b,
//     url: b.url || b.file || "",
//   }));

//   const applicationId =
//     appId ||
//     (location.pathname.match(/\/edit\/(\d+)/) &&
//       location.pathname.match(/\/edit\/(\d+)/)[1]);

//   useEffect(() => {
//     const isEditingApp = path.includes("/apps/edit/");
//     setIsEditApp(isEditingApp);
//     const isEditing = path.includes("edit-main");
//     // const isCreating = path.includes("organizations/create");
//     setIsEditMode(isEditing);
//   }, [location.pathname]);

//   useEffect(() => {
//     if (!isEditMode && initialTempBanners && initialTempBanners.length > 0) {
//       setTempBanners(initialTempBanners);
//       setLoading(false);
//     }
//   }, [isEditMode, initialTempBanners]);

//   // Extract organization ID from URL or props
//   // Extract organization ID from URL or props
//   const getOrganizationId = () => {
//     // Check URL params first
//     if (organizationId) return organizationId;

//     // Try to get from location state
//     if (location.state && location.state.organizationId) {
//       return location.state.organizationId;
//     }

//     // Try to get from URL query params
//     const searchParams = new URLSearchParams(location.search);
//     const orgIdFromQuery = searchParams.get("organizationId");
//     if (orgIdFromQuery) return orgIdFromQuery;

//     // Try to extract from pathname
//     const pathMatch = location.pathname.match(/\/organizations\/(\d+)/);
//     if (pathMatch && pathMatch[1]) {
//       return pathMatch[1];
//     }

//     // Fallback to currentBanner if it has organization info
//     if (currentBanner && currentBanner.organizationId) {
//       return currentBanner.organizationId;
//     }

//     // Last resort - check if we have an organizationId in the view props
//     if (window.viewProps && window.viewProps.organizationId) {
//       return window.viewProps.organizationId;
//     }

//     // Hardcoded fallback for development/testing
//     console.warn("Could not determine organization ID, using default");
//     return 0; // Default organization ID for testing
//   };

//   // Add a function to fetch banners
//   const fetchBanners = () => {
//     const orgId = getOrganizationId();

//     if ((orgId && isEditMode) || (applicationId && isEditApp)) {
//       setLoading(true);

//       // Fetch banners from API with the correct endpoint
//       const api_url =
//         isEditApp && applicationId
//           ? `/applications/${applicationId}/banners/`
//           : `/organizations/${orgId}/banners/`;
//       axios
//         .get(api_url)
//         .then((response) => {
//           if (response.data && response.data.list) {
//             // Transform the data to match our component's expected format

//             const formattedBanners = response.data.list.map((banner) => ({
//               id: banner.id,
//               url: banner.image.medium || banner.image.file,
//               originalImage: banner.image,
//               isDefault: banner.is_default,
//             }));

//             setBanners(formattedBanners);

//             // If no banner is selected yet, select the default one
//             if (!selectedBanner) {
//               const defaultBanner = formattedBanners.find((b) => b.isDefault);
//               if (defaultBanner) {
//                 setSelectedBanner(defaultBanner);
//               }
//             }
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching banners:", error);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!isCoupon) {
//       fetchBanners();
//     }
//   }, [isCoupon]);

//   const handleSave = () => {
//     if (selectedBanner) {
//       // Make sure we're passing back the full banner object with all necessary properties
//       if (!isEditMode && tempBanners.length > 0) {
//         onSave &&
//           onSave({
//             ...selectedBanner,
//             tempBanners: tempBanners,
//           });
//       } else {
//         onSave && onSave(selectedBanner);
//       }
//     } else {
//       // If no banner is selected, show a notification or select the default one
//       const defaultBanner = banners.find((b) => b.isDefault);
//       if (defaultBanner) {
//         setSelectedBanner(defaultBanner);
//         onSave && onSave(defaultBanner);
//       } else {
//         console.warn("No banner selected and no default banner found");
//       }
//     }
//   };

//   const handleAddBanner = () => {
//     // This would open a file picker to upload a new banner
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".png,.jpg,.jpeg";
//     input.onchange = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         // Store current view state to restore after cropping
//         const currentView = {
//           type: VIEW_TYPES.banner_selection,
//           onSave,
//           currentBanner: selectedBanner,
//         };

//         // Use the image crop view to crop the banner
//         dispatch(
//           setViews([
//             currentView, // Keep the banner selection view in the stack
//             {
//               type: VIEW_TYPES.image_horizontal_crop,
//               onSave: async (images) => {
//                 if (images && images.length > 0) {
//                   setLoading(true);

//                   try {
//                     // Step 1: Upload the image file to the server
//                     const formData = new FormData();

//                     formData.append("file", images[0].original);

//                     const uploadResponse = await axios.post(
//                       "/files/",
//                       formData,
//                       {
//                         headers: {
//                           "Content-Type": "multipart/form-data",
//                         },
//                       }
//                     );

//                     const imageId = uploadResponse.data.id;

//                     // Step 2: Create a custom banner with the uploaded image
//                     if (isEditMode || isEditApp) {
//                       const orgId = getOrganizationId();
//                       if ((orgId || applicationId) && imageId) {
//                         const api_url =
//                           isEditApp && applicationId
//                             ? `/applications/${applicationId}/banners/custom/`
//                             : `/organizations/${orgId}/banners/custom/`;
//                         if (!isCoupon) {
//                           await axios.post(api_url, { image_id: imageId });
//                           await fetchBanners();
//                         }
//                       }
//                     } else {
//                       const tempBanner = {
//                         id: `temp-${Date.now()}`,
//                         url: uploadResponse.data.file,
//                         originalImage: {
//                           file: images[0].original,
//                           id: imageId,
//                           url: uploadResponse.data.file,
//                         },
//                         isTemp: true,
//                         type:
//                           isCreateCoupons || isEditCoupons ? "coupon" : "org",
//                       };

//                       const newTempBanners = [tempBanner, ...tempBanners];
//                       try {
//                         localStorage.setItem(
//                           "tempBanners",
//                           JSON.stringify(
//                             newTempBanners.map((banner) => ({
//                               ...banner,
//                               url: banner.url, // URL.createObjectURL values can't be stored directly
//                               originalImage: {
//                                 id: banner.originalImage.id,
//                                 // Don't store the file object in localStorage
//                               },
//                               type:
//                                 isCreateCoupons || isEditCoupons
//                                   ? "coupon"
//                                   : "org",
//                             }))
//                           )
//                         );
//                       } catch (e) {
//                         console.error(
//                           "Error saving banners to localStorage:",
//                           e
//                         );
//                       }
//                       setTempBanners(newTempBanners);
//                       setSelectedBanner(tempBanner);
//                     }
//                   } catch (error) {
//                     console.error("Error uploading banner:", error);
//                     // Show error message
//                     confirm({
//                       title: translate("Ошибка", "common.error"),
//                       description: translate(
//                         "Не удалось загрузить баннер. Пожалуйста, попробуйте еще раз.",
//                         "org.bannerUploadError"
//                       ),
//                       confirmTitle: translate("OK", "common.ok"),
//                       cancelTitle: false,
//                     });
//                   } finally {
//                     setLoading(false);
//                     // Remove only the crop view, keeping the banner selection view
//                     dispatch(setViews([currentView]));
//                   }
//                 } else {
//                   // Remove only the crop view, keeping the banner selection view
//                   dispatch(setViews([currentView]));
//                 }
//               },
//               cropConfig: {
//                 aspect: 16 / 9,
//               },
//               uploads: [file],
//               onBack: () => {
//                 // If user cancels cropping, just go back to banner selection
//                 dispatch(setViews([currentView]));
//               },
//             },
//           ])
//         );
//       }
//     };
//     input.click();
//   };

//   const orgTempBanners = tempBanners.filter((b) => b.type === "org");
//   const couponTempBanners = tempBanners.filter((b) => b.type === "coupon");

//   console.log("ORG BANNERS", orgTempBanners);

//   const mergedBannersForEdit = [...banners, ...tempBanners];
//   const mergedBannersForCreate = [...orgTempBanners];
//   const mergedBannersCouponForEdit = [...couponTempBanners, ...reduxBanners];

//   const bannersToRender = isCreateCoupons
//     ? reduxBanners
//     : isEditCoupons
//     ? mergedBannersCouponForEdit
//     : isEditMode || isEditApp
//     ? mergedBannersForEdit
//     : mergedBannersForCreate;

//   return (
//     <div className="banner-selection-view">
//       <MobileTopHeader
//         onBack={onBack}
//         title={translate("Выбор баннера", "org.bannerSelection")}
//         onSubmit={handleSave}
//         onClick={handleSave}
//         submitLabel={translate("Сохранить", "app.save")}
//       />
//       <div className="container">
//         {loading ? (
//           <Preloader />
//         ) : (
//           <div className="banner-selection-view__grid">
//             <div
//               className="banner-selection-view__item banner-selection-view__add-item"
//               onClick={handleAddBanner}
//             >
//               <div className="banner-selection-view__aspect-ratio">
//                 {aspectRatio}
//               </div>
//               <div className="banner-selection-view__add-text">
//                 {translate("Добавить баннер", "org.addBanner")}
//               </div>
//             </div>

//             {bannersToRender.map((banner) => (
//               <div
//                 key={banner.id}
//                 className={`banner-selection-view__item ${
//                   selectedBanner && selectedBanner.id === banner.id
//                     ? "banner-selection-view__item--selected"
//                     : ""
//                 }`}
//                 onClick={() => setSelectedBanner(banner)}
//                 style={{ backgroundImage: `url(${banner.url || banner.file})` }}
//               >
//                 {!banner.file && (
//                   <button
//                     className="banner-selection-view__delete-btn"
//                     onClick={async (e) => {
//                       e.stopPropagation();

//                       try {
//                         // Confirm deletion
//                         await confirm({
//                           title: translate(
//                             "Удаление баннера",
//                             "org.deleteBanner"
//                           ),
//                           description: translate(
//                             "Баннер будет удален без возможности возврата",
//                             "org.confirmDeleteBanner"
//                           ),
//                           confirmTitle: translate("ОК", "common.ok"),
//                           cancelTitle: translate("Отмена", "dialog.cancel"),
//                         });

//                         // User confirmed deletion
//                         try {
//                           setLoading(true);

//                           if (isEditMode || isEditApp) {
//                             const orgId = getOrganizationId();

//                             // Only make API call if we have a real banner ID and organization ID
//                             if (
//                               (orgId || applicationId) &&
//                               banner.id &&
//                               !String(banner.id).startsWith("temp-")
//                             ) {
//                               const api_url =
//                                 isEditApp && applicationId
//                                   ? `/applications/banners/${banner.id}`
//                                   : `/organizations/banners/${banner.id}`;
//                               if (!isCoupon) {
//                                 await axios.delete(api_url);
//                                 await fetchBanners();
//                               }
//                             } else {
//                               setBanners(
//                                 banners.filter((b) => b.id !== banner.id)
//                               );
//                               if (
//                                 selectedBanner &&
//                                 selectedBanner.id === banner.id
//                               ) {
//                                 // If the deleted banner was selected, select the default one
//                                 const defaultBanner = banners.find(
//                                   (b) => b.isDefault
//                                 );
//                                 setSelectedBanner(defaultBanner || null);
//                               }
//                             }
//                           } else {
//                             // await axios.delete(
//                             //   `/files/${banner.originalImage.id}/`
//                             // );
//                             localStorage.removeItem("tempBanners");
//                             const newBanners = banners.filter(
//                               (b) => b.id !== banner.id
//                             );
//                             setBanners(newBanners);
//                             setTempBanners(
//                               tempBanners.filter((b) => b.id !== banner.id)
//                             );

//                             if (
//                               selectedBanner &&
//                               selectedBanner.id === banner.id
//                             ) {
//                               // If the deleted banner was selected, select another one
//                               const defaultBanner = newBanners.find(
//                                 (b) => b.isDefault
//                               );
//                               setSelectedBanner(
//                                 defaultBanner ||
//                                   (newBanners.length > 0 ? newBanners[0] : null)
//                               );
//                             }
//                           }
//                         } catch (error) {
//                           console.error("Error deleting banner:", error);
//                           confirm({
//                             title: translate("Ошибка", "common.error"),
//                             description: translate(
//                               "Не удалось удалить баннер. Пожалуйста, попробуйте еще раз.",
//                               "org.bannerDeleteError"
//                             ),
//                             confirmTitle: translate("OK", "common.ok"),
//                             cancelTitle: false,
//                           });
//                         } finally {
//                           setLoading(false);
//                         }
//                       } catch (e) {
//                         // User canceled deletion
//                         console.log("Banner deletion canceled");
//                       }
//                     }}
//                   >
//                     <DeleteBannerIcon />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BannerSelectionView;
// // 