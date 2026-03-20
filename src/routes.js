import WorkingDays from "@pages/WorkingDays/WorkingDays";
import * as React from "react";
import { Redirect } from "react-router-dom";

const HomePostsPage = React.lazy(() => import("./pages/HomePostsPage"));
const HomePostsByCategoryPage = React.lazy(
  () => import("./pages/HomePostsByCategoryPage"),
);
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ForgotPage = React.lazy(() => import("./pages/ForgotPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ProfileEditPage = React.lazy(() => import("./pages/ProfileEditPage"));
const PageNotFound = React.lazy(() => import("./pages/PageNotFound"));
const EditContactsPage = React.lazy(() => import("./pages/EditContactsPage"));
const EditSocialsPage = React.lazy(() => import("./pages/EditSocialsPage"));
const EditPasswordPage = React.lazy(() => import("./pages/EditPasswordPage"));
const OrgCreatePage = React.lazy(() => import("./pages/OrgCreatePage"));
const EditAuthNumberPage = React.lazy(
  () => import("./pages/EditAuthNumberPage"),
);
const OrganizationDetailPage = React.lazy(
  () => import("./pages/OrganizationDetailPage"),
);
const SubscriptionPlansPage = React.lazy(
  () => import("./pages/SubscriptionPlansPage"),
);
const SubscriptionPaymentSystemPage = React.lazy(
  () => import("./pages/SubscriptionPaymentSystemPage"),
);
const RegisterPaymentSelectPage = React.lazy(
  () => import("./pages/RegisterPaymentSelectPage"),
);
const RegisterOwnerFormPage = React.lazy(
  () => import("./pages/RegisterOwnerFormPage"),
);
const RegisterCompanyFormPage = React.lazy(
  () => import("./pages/RegisterCompanyFormPage"),
);
const SubscriptionPaymentPage = React.lazy(
  () => import("./pages/SubscriptionPaymentPage"),
);
const DiscountProceedPage = React.lazy(
  () => import("./pages/DiscountProceedPage"),
);

const ChoiceCouponCashbox = React.lazy(
  () => import("./pages/ChoiceCouponCashbox/ChoiceCouponCashbox"),
);

const StatisticsOrdersPage = React.lazy(
  () => import("./pages/StatisticsOrdersPage"),
);
const StatisticsSalesPage = React.lazy(
  () => import("./pages/StatisticsSalesPage"),
);
const OrganizationsPage = React.lazy(() => import("./pages/OrganizationsPage"));
const SubscriptionsPage = React.lazy(() => import("./pages/SubscriptionsPage"));
const ReceiptsPage = React.lazy(() => import("./pages/ReceiptsPage"));
const ReceiptDetailPage = React.lazy(() => import("./pages/ReceiptDetailPage"));
const RentReceiptDetailPage = React.lazy(
  () => import("./pages/RentReceiptDetailPage"),
);
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const ScanPage = React.lazy(() => import("./pages/ScanPage"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));
const SubscriptionMessagesPage = React.lazy(
  () => import("./pages/SubscriptionMessagesPage"),
);
const ResumesPage = React.lazy(() => import("./pages/ResumesPage"));
const SubscriptionsPostsPage = React.lazy(
  () => import("./pages/SubscriptionsPostsPage"),
);
const ServicesPage = React.lazy(() => import("./pages/ServicesPage"));
const HotlinksPage = React.lazy(() => import("./pages/HotlinksPage"));
const PromotionsPage = React.lazy(() => import("./pages/PromotionsPage"));
const PartnersPage = React.lazy(() => import("./pages/PartnersPage"));
const PartnerDetailPage = React.lazy(() => import("./pages/PartnerDetailPage"));
const PostDetailPage = React.lazy(() => import("./pages/PostDetailPage"));
const CartsPage = React.lazy(() => import("./pages/CartsPage"));
const CartDetailPage = React.lazy(() => import("./pages/CartDetailPage"));
// const SavedPostsPage = React.lazy(() => import('./pages/SavedPostsPage'));
const SavedPage = React.lazy(() => import("./pages/SavedPage"));
const CollectionDetailPage = React.lazy(
  () => import("./pages/CollectionDetailPage"),
);
const CollectionEditPage = React.lazy(
  () => import("./pages/CollectionEditPage"),
);
const CollectionItemsDeletionPage = React.lazy(
  () => import("./pages/CollectionItemsDeletionPage"),
);
const LikedPostsPage = React.lazy(() => import("./pages/LikedPostsPage"));
const ReferralPage = React.lazy(() => import("./pages/ReferralPage"));
const ReferralSubscriptionsPage = React.lazy(
  () => import("./pages/ReferralSubscriptionsPage"),
);
const AppsPage = React.lazy(() => import("./pages/AppsPage"));
const AppsRefferalSoldPage = React.lazy(
  () => import("./pages/AppsRefferalSoldPage"),
);
const AppsCreatePage = React.lazy(() => import("./pages/AppsCreatePage"));
const InvoicePage = React.lazy(() => import("./pages/InvoicePage/InvoicePage"));

const AppsEditPage = React.lazy(() => import("./pages/AppsEditPage"));
const AppsDetailPage = React.lazy(() => import("./pages/AppsDetailPage"));
const AppsStorePage = React.lazy(() => import("./pages/AppsStorePage"));
const AppsRefferalPage = React.lazy(() => import("./pages/AppsRefferalPage"));
const AppsRefferalSoldDetailPage = React.lazy(
  () => import("./pages/AppsRefferalSoldDetailPage"),
);
const HomeDiscountsPage = React.lazy(() => import("./pages/HomeDiscountsPage"));
const DiscountCartProceedPage = React.lazy(
  () => import("./pages/DiscountCartProceedPage"),
);
const PrinterSettingsPage = React.lazy(
  () => import("./pages/PrinterSettingsPage"),
);
const DeliveryAvailablePage = React.lazy(
  () => import("./pages/DeliveryAvailablePage"),
);
const DeliveryHistoryPage = React.lazy(
  () => import("./pages/DeliveryHistoryPage"),
);
const ReceiptCourierDetailPage = React.lazy(
  () => import("./pages/ReceiptCourierDetailPage"),
);
const ServiceDetailPage = React.lazy(() => import("./pages/ServiceDetailPage"));
const CommentsPage = React.lazy(() => import("./pages/CommentsPage"));
const PostsSelectionPage = React.lazy(
  () => import("./pages/PostsSelectionPage"),
);
const ProfileQRPage = React.lazy(() => import("./pages/ProfileQRPage"));
const QRBusinessCardPage = React.lazy(
  () => import("./pages/QRBusinessCardPage"),
);
const RentPage = React.lazy(() => import("./pages/RentPage"));
const RentStatisticsPage = React.lazy(
  () => import("./pages/RentStatisticsPage"),
);
const UserRentDetailOrdersReceiptsPage = React.lazy(
  () => import("./pages/UserRentDetailOrdersReceiptsPage"),
);
const ClientRentActivationPage = React.lazy(
  () => import("./pages/ClientRentActivationPage"),
);
const GoogleMapsOrganizationIntegrationPage = React.lazy(
  () => import("./pages/GoogleMapsOrganizationIntegrationPage"),
);
const TwoGisOrganizationIntegrationPage = React.lazy(
  () => import("./pages/TwoGisOrganizationIntegrationPage"),
);
const PaymentSuccessPage = React.lazy(
  () => import("./pages/PaymentSuccessPage"),
);
const PaymentFailurePage = React.lazy(
  () => import("./pages/PaymentFailurePage"),
);
const EventStatisticsPage = React.lazy(
  () => import("./pages/EventStatisticsPage"),
);
const ClientEventActivationPage = React.lazy(
  () => import("./pages/ClientEventActivationPage"),
);
const OrganizationsMapPage = React.lazy(
  () => import("./pages/OrganizationsMapPage"),
);
const MessengerPage = React.lazy(() => import("./pages/MessengerPage"));
const MessengerChatPage = React.lazy(() => import("./pages/MessengerChatPage"));
const MessengerSearchPage = React.lazy(
  () => import("./pages/MessengerSearchPage"),
);
const OrganizationMessengerPage = React.lazy(
  () => import("./pages/OrganizationMessengerPage"),
);
const MessengerGroupPage = React.lazy(
  () => import("./pages/MessengerGroupPage"),
);
const ResumeCreatePage = React.lazy(() => import("./pages/ResumeCreatePage"));
const ResumeDetailInfoPage = React.lazy(
  () => import("./pages/ResumeDetailInfoPage"),
);
const ResumeDetailInfoEditPage = React.lazy(
  () => import("./pages/ResumeDetailInfoEditPage"),
);
const ResumeRequestPage = React.lazy(() => import("./pages/ResumeRequestPage"));
const ResumeDetailPage = React.lazy(() => import("./pages/ResumeDetailPage"));
const MyResumesPage = React.lazy(() => import("./pages/MyResumesPage"));
const DeliveryAddressesPage = React.lazy(
  () => import("./pages/DeliveryAddressesPage"),
);
const DeliveryAddressCreatePage = React.lazy(
  () => import("./pages/DeliveryAddressCreatePage"),
);
const DeliveryAddressEditPage = React.lazy(
  () => import("./pages/DeliveryAddressEditPage"),
);
const PrintPage = React.lazy(() => import("./pages/PrintPage"));
const ChoiceFromListPage = React.lazy(
  () => import("./pages/ChoiceFromListPage/ChoiceFromListPage"),
);
const SubscriptionDetailPage = React.lazy(
  () => import("./pages/SubscriptionDetailPage/SubscriptionDetailPage"),
);

const HistoryDocPage = React.lazy(
  () => import("./pages/HistoryDocPage/HistoryDocPage"),
);

const HistoryCheckPage = React.lazy(
  () => import("./pages/HistoryDocPage/HistoryDocPage"),
);

const CouponChoiceProduct = React.lazy(
  () => import("./pages/CouponChoiceProduct/CouponChoiceProduct"),
);

const MaalyPayPage = React.lazy(
  () => import("./pages/MaalyPayPage/MaalyPayPage"),
);

const MaalyPayReference = React.lazy(
  () => import("./pages/MaalyPayReference/MaalyPayReference"),
);

const AIPhotoPage = React.lazy(() => import("./pages/AIPhotoPage/AIPhotoPage"));
// const UaeEasyCard = React.lazy(() => import("./pages/UaeEasyCard/UaeEasyCard"));

//TODO remove once launched
const DevPage = React.lazy(() => import("./pages/DevPage"));
const CommentsPostsPage = React.lazy(() => import("./pages/CommentsPostsPage"));
const DevicesPage = React.lazy(() => import("./pages/DevicesPage"));

const TelegramAiPage = React.lazy(
  () => import("./pages/TelegramAiSettings/TelegramAiSettings"),
);
const WhatsAppAiPage = React.lazy(
  () => import("./pages/WhatsAppAiSettings/WhatsAppAiSettings"),
);

const WorkingsDays = React.lazy(
  () => import("./pages/WorkingDays/WorkingDays"),
);

export const ROUTES = [
  {
    path: "/auth",
    component: LoginPage,
    exact: true,
    pageTitle: "Authorization",
  },
  {
    path: "/forgot",
    component: ForgotPage,
    exact: true,
    pageTitle: "Forgot Password",
  },
  {
    path: "/home/search",
    component: SearchPage,
    exact: true,
    pageTitle: "Search Organization",
  },
  {
    path: "/home/discounts",
    component: HomeDiscountsPage,
    exact: true,
    pageTitle: "Home Discounts Page",
  },
  {
    path: "/home/posts/:catID",
    component: HomePostsByCategoryPage,
    exact: true,
    pageTitle: "Home Posts By Category Page",
  },
  {
    path: "/home/posts",
    component: HomePostsPage,
    exact: true,
    pageTitle: "Home Posts Page",
  },
  {
    path: "/home/organizations",
    component: OrganizationsPage,
    exact: true,
    pageTitle: "Organizations List Page",
  },
  {
    path: "/home/partners",
    component: PartnersPage,
    exact: true,
    pageTitle: "Partners List Page",
  },
  {
    path: "/home/services",
    component: ServicesPage,
    exact: true,
    pageTitle: "Partners Services Page",
  },
  {
    path: "/organizations/:id/hotlinks",
    component: HotlinksPage,
    exact: true,
    pageTitle: "Partners Hotlinks Page",
  },
  {
    path: "/home/promotions",
    component: PromotionsPage,
    exact: true,
    pageTitle: "Partners Promotions Page",
  },
  {
    path: "/home/partners/:partnerID/:section?",
    component: PartnerDetailPage,
    exact: true,
    pageTitle: "Partner Detail Page",
  },
  {
    path: "/subscriptions/organizations",
    component: SubscriptionsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Page",
  },
  {
    path: "/subscriptions/posts",
    component: SubscriptionsPostsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Posts Page",
  },
  {
    path: "/proceed-discount/:id",
    component: DiscountProceedPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Discount Proceed",
  },
  {
    path: "/proceed-discount/:id/choice-coupon",
    component: ChoiceCouponCashbox,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Choice Coupon Cashbox",
  },
  {
    path: "/proceed-discount-cart",
    component: DiscountCartProceedPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Discount Cart Proceed",
  },
  {
    path: "/scan",
    component: ScanPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Scan Page",
  },
  {
    path: "/profile",
    component: ProfilePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Page",
  },
  // {
  //   path: "/UaeEasyCard",
  //   component: UaeEasyCard,
  //   exact: true,
  //   auth: (token) => !!token,
  //   pageTitle: "Uae Easy Card",
  // },
  {
    path: "/statistics/orders",
    component: StatisticsOrdersPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Statistics Orders Page",
  },
  {
    path: "/statistics/sales",
    component: StatisticsSalesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Statistics Sales Page",
  },
  {
    path: "/statistics/rent/:id/orders",
    component: UserRentDetailOrdersReceiptsPage,
    exact: false,
    auth: (token) => !!token,
    pageTitle: "Rent Statistics Page",
  },

  {
    path: "/statistics",
    render: () => <Redirect to="/statistics/orders" />,
    exact: true,
  },

  {
    path: "/statistics/rent",
    component: RentStatisticsPage,
    exact: false,
    auth: (token) => !!token,
    pageTitle: "Rent Statistics Page",
  },
  {
    path: "/clients/:id/rent-activation/:bookingID",
    component: ClientRentActivationPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Rent Activation",
  },
  {
    path: "/clients/:id/event-activation/:eventID",
    component: ClientEventActivationPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Ticket Activation",
  },
  {
    path: "/statistics/events",
    component: EventStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Event Statistics Page",
  },
  {
    path: "/receipts",
    component: ReceiptsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipts Page",
  },
  {
    path: "/receipts/:id",
    component: ReceiptDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipt Detail Page",
  },
  {
    path: "/receipts/rent/:id",
    component: RentReceiptDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipt Detail Page",
  },
  {
    path: "/organizations/:id/subscription-plans",
    component: SubscriptionPlansPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Plans",
  },
  {
    path: "/organizations/:id/payment-methods",
    component: SubscriptionPaymentSystemPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Plans",
  },
  {
    path: "/organizations/:id/payment/reference",
    component: MaalyPayReference,
    exact: true,
  },

  {
    path: "/organizations/:id/payment/:paymentId(\\d+)",
    component: MaalyPayPage,
    exact: true,
  },

  {
    path: "/organizations/:id/subscription-detail",
    component: SubscriptionDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Detail Page",
  },
  {
    path: "/organizations/:id/historypayment",
    component: HistoryDocPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "History Doc Page",
  },

  {
    path: "/organizations/:id/edit-main/workingDays",
    component: WorkingDays,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Working Days",
  },

  {
    path: "/register/payment-select",
    component: RegisterPaymentSelectPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Register Payment Select Page",
  },
  {
    path: "/register/owner",
    component: RegisterOwnerFormPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Register Owner Form Page",
  },
  {
    path: "/organizations/:id/posts/create/AIphoto",
    component: AIPhotoPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "AI Photo Page",
  },
  {
    path: "/register/company",
    component: RegisterCompanyFormPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Register Company Form Page",
  },
  {
    path: "/organizations/:id/historycheck",
    component: HistoryCheckPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "History Check Page",
  },
  {
    path: "/organizations/:id/coupons/create/choice",
    component: CouponChoiceProduct,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Coupon Choice Product",
  },
  {
    path: "/organization/:id/register/company/choicelist/:info",
    component: ChoiceFromListPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Register Company Choice Page",
  },
  {
    path: "/organizations/:id/payment",
    component: SubscriptionPaymentPage,
    exact: true,
    private: true,
  },
  {
    path: "/saved",
    component: SavedPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Saved Page",
  },
  {
    path: "/saved/:id",
    component: CollectionDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Collection Page",
  },
  {
    path: "/saved/:id/edit",
    component: CollectionEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Collection Edit Page",
  },
  {
    path: "/saved/:id/items-deletion",
    component: CollectionItemsDeletionPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Collection Items Deletion Page",
  },
  {
    path: "/liked",
    component: LikedPostsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Liked Page",
  },
  {
    path: "/referral",
    component: ReferralPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Referral Page",
  },
  {
    path: "/referral/subscriptions",
    component: ReferralSubscriptionsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Referral Subscriptions Page",
  },
  {
    path: "/apps",
    component: AppsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Page",
  },
  {
    path: "/organizations/:id/invoicePage",
    component: InvoicePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Page",
  },
  {
    path: "/messenger",
    component: MessengerPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messenger Page",
  },
  {
    path: "/messenger/organization/:id",
    component: OrganizationMessengerPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Messenger Page",
  },
  {
    path: "/messenger/chat/:id",
    component: MessengerChatPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messenger Chat Page",
  },
  {
    path: "/messenger/search",
    component: MessengerSearchPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messenger Search Page",
  },
  {
    path: "/messenger/group/create",
    component: MessengerGroupPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messenger Group Page",
  },
  {
    path: "/messenger/forward",
    component: require("./pages/MessengerForwardPage").default,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Forward Message",
  },
  {
    path: "/apps/create",
    component: AppsCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Create Page",
  },
  {
    path: "/apps/refferal/sold",
    component: AppsRefferalSoldPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Refferal Sold Page",
  },
  {
    path: "/apps/store",
    component: AppsStorePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Store Page",
  },
  {
    path: "/apps/refferal",
    component: AppsRefferalPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Refferal Page",
  },
  {
    path: "/apps/refferal/sold/:id",
    component: AppsRefferalSoldDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Refferal Page",
  },
  {
    path: "/apps/edit/:id",
    component: AppsEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Edit Page",
  },
  {
    path: "/apps/:id",
    component: AppsDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apps Detail Page",
  },
  {
    path: "/comments",
    component: CommentsPostsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Comments Page",
  },
  {
    path: "/delivery/available",
    component: DeliveryAvailablePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Delivery available Page",
  },
  {
    path: "/delivery/history",
    component: DeliveryHistoryPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Delivery history Page",
  },
  {
    path: "/delivery/receipt/:receiptID",
    component: ReceiptCourierDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Receipt for Courier Page",
  },
  {
    path: "/carts",
    component: CartsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Carts Page",
  },
  {
    path: "/carts/:id/delivery",
    component: CartDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Cart Delivery Page",
  },
  {
    path: "/carts/:id",
    component: CartDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Cart Detail Page",
  },
  {
    path: "/notifications/",
    component: NotificationsPage,
    auth: (token) => !!token,
    exact: true,
    pageTitle: "Notifications Page",
  },
  {
    path: "/profile/edit",
    component: ProfileEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Edit Page",
  },
  {
    path: "/profile/edit-contacts",
    component: EditContactsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Edit Contacts Page",
  },
  {
    path: "/profile/edit-socials",
    component: EditSocialsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Edit Social Networks Page",
  },
  {
    path: "/profile/edit-auth/:code",
    component: EditAuthNumberPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Edit Authorization number page",
  },
  {
    path: "/profile/edit-password",
    component: EditPasswordPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile Edit Password Page",
  },
  {
    path: "/profile/printer-settings",
    component: PrinterSettingsPage,
    exact: true,
    pageTitle: "Apofiz - Print Settings Page",
  },
  {
    path: "/profile/devices",
    component: DevicesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Active Devices",
  },
  {
    path: "/profile/qr",
    component: ProfileQRPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Profile QR",
  },
  {
    path: "/profile/business-card",
    component: QRBusinessCardPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Business Card",
  },
  {
    path: "/profile/resumes/my/",
    component: MyResumesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "My Resumes Page",
  },
  {
    path: "/messages",
    component: SubscriptionMessagesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Subscription Messages Page",
  },
  {
    path: "/services/resumes",
    component: ResumesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organizations Map Page",
  },
  {
    path: "/services/:serviceID",
    component: ServiceDetailPage,
    exact: true,
    pageTitle: "Service Detail Page",
  },
  {
    path: "/organizations/create",
    component: OrgCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organizations Create Page",
  },
  {
    path: "/organizations/google-maps-org-integration",
    component: GoogleMapsOrganizationIntegrationPage,
    exact: true,
    pageTitle: "Google Maps Integration Page",
  },
  {
    path: "/organizations/2gis-integration",
    component: TwoGisOrganizationIntegrationPage,
    exact: true,
    pageTitle: "2Gis Integration Page",
  },
  {
    path: "/organizations/:id",
    component: OrganizationDetailPage,
    exact: true,
    pageTitle: "Organization Page",
  },
  {
    path: "/organizations/",
    component: React.lazy(() => import("./routers/OrganizationsRouter")),
    pageTitle: "Organization",
  },
  {
    path: "/p/:id",
    component: PostDetailPage,
    exact: true,
    pageTitle: "Apofiz - Post Detail Page",
  },
  {
    path: "/p/:id/selection",
    component: PostsSelectionPage,
    exact: true,
    pageTitle: "Posts Selection Page",
  },
  {
    path: "/r/:id/rent",
    component: RentPage,
    exact: true,
    pageTitle: "Rent",
  },
  {
    path: "page-not-found",
    component: PageNotFound,
    exact: true,
    pageTitle: "Not found",
  },
  {
    path: "/faq",
    component: React.lazy(() => import("./pages/FaqPage/FaqRouter")),
    pageTitle: "Apofiz - FAQ",
  },
  {
    path: "/dev",
    component: () => <DevPage />,
    exact: true,
  },
  {
    path: "/home",
    render: () => <Redirect to="/home/posts" />,
    exact: true,
  },
  {
    path: "/comments/post/:id",
    component: CommentsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Post Comments Page",
  },
  {
    path: "/payment-success",
    component: PaymentSuccessPage,
    exact: true,
    pageTitle: "Payment Success Page",
  },
  {
    path: "/payment-failure",
    component: PaymentFailurePage,
    exact: true,
    pageTitle: "Payment Failure Page",
  },
  {
    path: "/organizations-map/:serviceID",
    component: OrganizationsMapPage,
    exact: true,
    pageTitle: "Organizations Map Page",
  },
  {
    path: "/resumes/create",
    component: ResumeCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Resume Create Page",
  },
  {
    path: "/resumes/:id/detail-info/",
    component: ResumeDetailInfoPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Resume Detail Info Page",
  },
  {
    path: "/resumes/:id/detail-info/edit",
    component: ResumeDetailInfoEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Resume Detail Info Edit Page",
  },
  {
    path: "/resumes/:sender/requests/:id/:view/",
    component: ResumeRequestPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Resume Request Page",
  },
  {
    path: "/resumes/:id/",
    component: ResumeDetailPage,
    exact: true,
    pageTitle: "Resume Detail Page",
  },
  {
    path: "/delivery-addresses",
    component: DeliveryAddressesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Delivery Addresses Page",
  },
  {
    path: "/delivery-addresses/create",
    component: DeliveryAddressCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Delivery Address Create Page",
  },
  {
    path: "/delivery-addresses/:id/edit",
    component: DeliveryAddressEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Delivery Address Edit Page",
  },
  {
    path: "/print",
    component: PrintPage,
    exact: true,
    pageTitle: "Print Page",
  },

  {
    path: "/",
    render: () => <Redirect to="/home/posts" />,
    exact: true,
  },
  {
    path: "**",
    render: ({ location }) => <Redirect to={`/auth`} />,
  },
];
