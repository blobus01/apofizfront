import { useSelector } from "react-redux";
import { renderRoutes } from "react-router-config";
import { allowedRoutes } from "./utils";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const ReceiptsSalesPage = React.lazy(
  () => import("../pages/ReceiptsSalesPage"),
);
const ReceiptSaleDetailPage = React.lazy(
  () => import("../pages/ReceiptSaleDetailPage"),
);
const AttendanceScanPage = React.lazy(
  () => import("../pages/AttendanceScanPage"),
);
const OrgPartnerStatisticsPage = React.lazy(
  () => import("../pages/OrgPartnerStatisticsPage"),
);
const OrgPartnersPage = React.lazy(() => import("../pages/OrgPartnersPage"));
const BannersPage = React.lazy(() => import("../pages/BannersPage"));
const BannerCreatePage = React.lazy(() => import("../pages/BannerCreatePage"));
const PostSearchPage = React.lazy(() => import("../pages/PostSearchPage"));
const BannerEditPage = React.lazy(() => import("../pages/BannerEditPage"));
const PartnershipDetailPage = React.lazy(
  () => import("../pages/PartnershipDetailPage"),
);
const OrgFollowersPage = React.lazy(() => import("../pages/OrgFollowersPage"));
const OrgHotlinkTypeSelectPage = React.lazy(
  () => import("../pages/OrgHotlinkTypeSelectPage"),
);
const OrgHotlinkCreatePage = React.lazy(
  () => import("../pages/OrgHotlinkCreatePage"),
);
const OrgHotlinkCollectionCreatePage = React.lazy(
  () => import("../pages/OrgHotlinkCollectionCreatePage"),
);
const OrgPromotionPage = React.lazy(() => import("../pages/OrgPromotionPage"));
const OrgHotlinkEditPage = React.lazy(
  () => import("../pages/OrgHotlinkEditPage"),
);
const OrgClientAttendancePage = React.lazy(
  () => import("../pages/OrgClientAttendancePage"),
);
const OrgClientPage = React.lazy(() => import("../pages/OrgClientPage"));
const EmployeesPage = React.lazy(() => import("../pages/EmployeesPage"));
const RolesPage = React.lazy(() => import("../pages/RolesPage"));
const EmployeeAddPage = React.lazy(() => import("../pages/EmployeeAddPage"));
const AttendancePage = React.lazy(() => import("../pages/AttendancePage"));
const EmployeeEditPage = React.lazy(() => import("../pages/EmployeeEditPage"));
const RolesAddPage = React.lazy(() => import("../pages/RolesAddPage"));
const RolesEditPage = React.lazy(() => import("../pages/RolesEditPage"));
const OrgEditMainPage = React.lazy(() => import("../pages/OrgEditMainPage"));
const OrgEditDiscountPage = React.lazy(
  () => import("../pages/OrgEditDiscountPage"),
);
const OrganizationCouponPage = React.lazy(
  () => import("../pages/OrganizationCouponPage"),
);
const OrganizationCouponCreatePage = React.lazy(
  () => import("../pages/OrganizationCouponCreatePage"),
);
const OrganizationCouponEditPage = React.lazy(
  () => import("../pages/OrganizationCouponEditPage"),
);
const OrgReceiptsPage = React.lazy(() => import("../pages/OrgReceiptsPage"));
const OrgReceiptsByUserPage = React.lazy(
  () => import("../pages/OrgReceiptsByUserPage"),
);
const OrgClientReceiptsPage = React.lazy(
  () => import("../pages/OrgClientReceiptsPage"),
);
const OrgReceiptDetailPage = React.lazy(
  () => import("../pages/OrgReceiptDetailPage"),
);
const TransactionPaymentPage = React.lazy(
  () => import("../pages/TransactionPaymentPage"),
);
const PostCreatePage = React.lazy(() => import("../pages/PostCreatePage"));
const PostEditPage = React.lazy(() => import("../pages/PostEditPage"));
const MessagesPage = React.lazy(() => import("../pages/MessagesPage"));
const MessageCreatePage = React.lazy(
  () => import("../pages/MessageCreatePage"),
);
const OrganizationPaymentSettingsPage = React.lazy(
  () => import("../pages/OrganizationPaymentSettingsPage"),
);
const HotlinkCollectionDetailPage = React.lazy(
  () => import("../pages/HotlinkCollectionDetailPage"),
);
const RentCreatePage = React.lazy(() => import("../pages/RentCreatePage"));
const RentEditPage = React.lazy(() => import("../pages/RentEditPage"));
const RentSettingsPage = React.lazy(() => import("../pages/RentSettingsPage"));
const OrganizationRentStatisticsPage = React.lazy(
  () => import("../pages/OrganizationRentStatisticsPage"),
);
const RentDetailStatisticsPage = React.lazy(
  () => import("../pages/RentDetailStatisticsPage"),
);
const OrganizationRentClientStatisticsPage = React.lazy(
  () => import("../pages/OrganizationRentClientStatisticsPage"),
);
const EventCreatePage = React.lazy(() => import("../pages/EventCreatePage"));
const EventEditPage = React.lazy(() => import("../pages/EventEditPage"));
const EventSettingsPage = React.lazy(
  () => import("../pages/EventSettingsPage"),
);
const OrganizationEventStatisticsPage = React.lazy(
  () => import("../pages/OrganizationEventStatisticsPage"),
);
const OrganizationEventPurchaseStatisticsPage = React.lazy(
  () => import("../pages/OrganizationEventPurchaseStatisticsPage"),
);
const EventDetailStatisticsPage = React.lazy(
  () => import("../pages/EventDetailStatisticsPage"),
);
const ResumeEditPage = React.lazy(() => import("../pages/ResumeEditPage"));
const ResumeRequestCreatePage = React.lazy(
  () => import("../pages/ResumeRequestCreatePage"),
);
const AIAssistantPage = React.lazy(() => import("../pages/AIAssistantPage"));
const AIAssistantDetailInfoPage = React.lazy(
  () => import("../pages/AIAssistantDetailInfoPage"),
);
const AssistantTariffSelectionPage = React.lazy(
  () => import("../pages/AssistantTariffSelectionPage"),
);
const OrganizationChatsPage = React.lazy(
  () => import("../pages/OrganizationChatsPage"),
);
// TODO: delete page
// const OrganizationChatPage = React.lazy(() => import('../pages/OrganizationChatPage'));
const CommentsPage = React.lazy(() => import("../pages/CommentsPage"));
const CommentsWhatsAppAi = React.lazy(
  () => import("../pages/CommentsWhatsApp/CommentsWhatsApp"),
);

const WhatsAppAiPage = React.lazy(
  () => import("../pages/WhatsAppAiSettings/WhatsAppAiSettings"),
);

const TelegramAiPage = React.lazy(
  () => import("../pages/TelegramAiSettings/TelegramAiSettings"),
);
const ConnectAiPage = React.lazy(
  () => import("../pages/ConnectAiPage/ConnectAiPage"),
);
const ApiSettingsPage = React.lazy(
  () => import("../pages/ApiSettingsPage/ApiSettingsPage"),
);

const ApiTestPage = React.lazy(
  () => import("../pages/ApiTestPage/ApiTestPage"),
);

const routes = [
  {
    path: "/organizations/:orgID/receipts-sales",
    component: ReceiptsSalesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipts Sales Page",
  },
  {
    path: "/organizations/:orgID/receipts-sales/:receiptID",
    component: ReceiptSaleDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipts Sale Detail Page",
  },
  {
    path: "/organizations/:id/attendance-scan",
    component: AttendanceScanPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organizations Attendance Page",
  },
  {
    path: "/organizations/:id/partner-statistics",
    component: OrgPartnerStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Partner Statistics",
  },
  {
    path: "/organizations/:id/partners",
    component: OrgPartnersPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Partners",
  },
  {
    path: "/organizations/:id/banners",
    component: BannersPage,
    exact: true,
    pageTitle: "Banners page",
  },
  {
    path: "/organizations/:id/banners/create",
    component: BannerCreatePage,
    exact: true,
    pageTitle: "Banner create page",
  },
  {
    path: "/organizations/:id/search",
    component: PostSearchPage,
    exact: true,
    pageTitle: "Post search page",
  },
  {
    path: "/organizations/:id/banners/:bannerID",
    component: BannerEditPage,
    exact: true,
    pageTitle: "Banner edit page",
  },
  {
    path: "/organizations/:orgID/partners/:partnerID",
    component: PartnershipDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Partnership detail",
  },
  {
    path: "/organizations/:id/followers",
    component: OrgFollowersPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Employers Page",
  },
  {
    path: "/organizations/:orgID/hotlinks/create",
    component: OrgHotlinkTypeSelectPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Hotlink Type Select Page",
  },
  {
    path: "/organizations/:orgID/hotlinks/create/link",
    component: OrgHotlinkCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Hotlink Link Create Page",
  },
  {
    path: "/organizations/:orgID/hotlinks/create/contact",
    component: OrgHotlinkCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Hotlink Contact Create Page",
  },
  {
    path: "/organizations/:orgID/hotlinks/create/collection",
    component: OrgHotlinkCollectionCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Hotlink Collection Create Page",
  },
  {
    path: "/organizations/:orgID/promotion",
    component: OrgPromotionPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Promotion Page",
  },
  {
    path: "/organizations/:orgID/hotlinks/:hotlinkID",
    component: OrgHotlinkEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Organization Hotlink Edit Page",
  },
  {
    path: "/organizations/:orgID/collections/:hotlinkID",
    component: HotlinkCollectionDetailPage,
    exact: true,
    pageTitle: "Apofiz - Organization Hotlink Collection Page",
  },
  {
    path: "/organizations/:orgID/client/:userID/attendance",
    component: OrgClientAttendancePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Client Attendance Page",
  },
  {
    path: "/organizations/:orgID/client/:userID",
    component: OrgClientPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Client Page",
  },
  {
    path: "/organizations/:id/employees",
    component: EmployeesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Employers Page",
  },
  {
    path: "/organizations/:id/roles",
    component: RolesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Roles Page",
  },
  {
    path: "/organizations/:id/employees/add",
    component: EmployeeAddPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Employee Add Page",
  },
  {
    path: "/organizations/:id/employees/:employeeID/attendance",
    component: AttendancePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Employee Attendance Page",
  },
  {
    path: "/organizations/:id/employees/:employeeID",
    component: EmployeeEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Employee Add Page",
  },
  {
    path: "/organizations/:id/roles/add",
    component: RolesAddPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Roles Page",
  },
  {
    path: "/organizations/:id/roles/:roleID",
    component: RolesEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Roles Page",
  },
  {
    path: "/organizations/:id/coupons",
    component: OrganizationCouponPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Coupon Page",
  },
  {
    path: "/organizations/:id/coupons/create",
    component: OrganizationCouponCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Coupon Page",
  },
  {
    path: "/organizations/:id/coupons/edit/:couponID",
    component: OrganizationCouponCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Coupon Page",
  },
  {
    path: "/organizations/:id/coupons/:couponID/edit",
    component: OrganizationCouponEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Coupon Edit Page",
  },
  {
    path: "/organizations/:id/edit-main",
    component: OrgEditMainPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Edit Page",
  },
  {
    path: "/organizations/:id/edit-discounts",
    component: OrgEditDiscountPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Edit Page",
  },
  {
    path: "/organizations/:id/receipts",
    component: OrgReceiptsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Receipts Page",
  },
  {
    path: "/organizations/:id/receipts-by/:userID",
    component: OrgReceiptsByUserPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Receipts User Page",
  },
  {
    path: "/organizations/:id/receipts-of/:userID",
    component: OrgClientReceiptsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Client's Receipts Page",
  },
  {
    path: "/organizations/:id/receipts/:receiptID",
    component: OrgReceiptDetailPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Receipt Detail Page",
  },
  {
    path: "/organizations/:orgID/receipts/:id/payment",
    component: TransactionPaymentPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Payment Page",
  },
  {
    path: "/organizations/:id/posts/create",
    component: PostCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Post Create Page",
  },
  {
    path: "/organizations/:id/posts/createOnline",
    component: PostCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Post Create Page",
  },
  {
    path: "/organizations/:id/posts/:postID/edit",
    component: PostEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Post Edit Page",
  },
  {
    path: "/organizations/:id/rent/create",
    component: RentCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Rent Create Page",
  },
  {
    path: "/organizations/:id/rent/:rentID/edit",
    component: RentEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Rent Create Page",
  },
  {
    path: "/organizations/:orgID/rent/:id/settings",
    component: RentSettingsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Edit Rent Settings",
  },
  {
    path: "/organizations/:id/rent/statistics",
    component: OrganizationRentStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Rent Statistics",
  },
  {
    path: "/organizations/:id/events/statistics",
    component: OrganizationEventStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Event Statistics",
  },
  {
    path: "/organizations/:id/events/statistics/purchases",
    component: OrganizationEventPurchaseStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Event Purchase Statistics",
  },
  {
    path: "/organizations/:id/rent/clint-statistics",
    component: OrganizationRentClientStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Rent Client Statistics",
  },
  {
    path: "/organizations/:id/rent/:rentID/statistics",
    component: RentDetailStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Rental Statistics",
  },
  {
    path: "/organizations/:id/events/create",
    component: EventCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Event Create Page",
  },
  {
    path: "/organizations/:orgID/events/:id/edit",
    component: EventEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Event Edit Page",
  },
  {
    path: "/organizations/:orgID/events/:id/settings",
    component: EventSettingsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Event Settings Page",
  },
  {
    path: "/organizations/:orgID/events/:id/statistics",
    component: EventDetailStatisticsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Event Statistics",
  },
  {
    path: "/organizations/:orgID/resumes/:id/edit",
    component: ResumeEditPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Apofiz - Resume Edit Page",
  },
  {
    path: "/organizations/:orgID/resumes/:id/requests/create",
    component: ResumeRequestCreatePage,
    exact: true,
    auth: (token) => !!token,

    pageTitle: "Apofiz - Resume Request Create Page",
  },
  {
    path: "/organizations/:id/messages",
    component: MessagesPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messages Page",
  },
  {
    path: "/organizations/:id/messages/create",
    component: MessageCreatePage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Messages Create Page",
  },
  {
    path: "/organizations/:id/payment/settings",
    component: OrganizationPaymentSettingsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Payment Settings",
  },
  {
    path: "/organizations/:id/assistant",
    component: AIAssistantPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization AI Assistant",
  },
  {
    path: "/organizations/:id/assistant/:assistant",
    component: AIAssistantDetailInfoPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "AI Assistant Info",
  },
  {
    path: "/organizations/:id/assistant/:assistantID/tariffs/",
    component: AssistantTariffSelectionPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "AI Assistant Tariffs",
  },
  {
    path: "/organizations/:id/assistants/:assistant/chats",
    component: OrganizationChatsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Chats",
  },
  {
    path: "/organizations/:orgID/chat",
    component: (props) => <CommentsPage isChat={true} {...props} />,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Organization Chat",
  },
  {
    path: "/organizations/:orgID/whatsApp",
    component: (props) => <CommentsWhatsAppAi isChat={true} {...props} />,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Comments Whats AppAi",
  },
  {
    path: "/organizations/:orgID/assistant/:assisID/telegramAi/",
    component: TelegramAiPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Telegram Ai Page",
  },
  {
    path: "/organizations/:orgID/assistant/:assisID/whatsAppAi/",
    component: WhatsAppAiPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "WhatsApp Ai Page",
  },
  {
    path: "/organizations/:orgID/connectApi",
    component: ConnectAiPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Connect Ai Page",
  },
  {
    path: "/organizations/:orgID/connectApi/settings",
    component: ApiSettingsPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Api Settings Page",
  },
  {
    path: "/organizations/:orgID/connectApi/test/:id",
    component: ApiTestPage,
    exact: true,
    auth: (token) => !!token,
    pageTitle: "Api Test Page",
  },
  // {
  //   path: "**",
  //   render: ({ location }) => (
  //     <Redirect
  //       to={`/auth?next=${encodeURIComponent(
  //         location.pathname + location.search
  //       )}`}
  //     />
  //   ),
  // },
];

const OrganizationsRouter = () => {
  const user = useSelector((state) => state.userStore.user);
  const token = useSelector((state) => state.userStore.token);
  const orgDetail = useSelector((state) => state.orgDetail.detail);

  return renderRoutes(allowedRoutes(routes, token, user, orgDetail), { user });
};

export default OrganizationsRouter;
