

// import React from "react";
// import { Link } from "react-router-dom";
// import { connect } from "react-redux";
// import UserCard from "../../components/Cards/UserCard";
// import {
//   getOrganizationDetail,
//   getOrgFollowers,
//   sendAllAcceptFollowers,
//   sendRequestAcceptFollower,
// } from "@store/actions/organizationActions";
// import Preloader from "../../components/Preloader";
// import InfiniteScroll from "react-infinite-scroll-component";
// import OrgFollowersEmpty from "./empty";
// import { translate } from "@locales/locales";
// import { ExcelIcon, LockIcon, PromotionIcon } from "@ui/Icons";
// import { getPromoStats } from "@store/services/organizationServices";
// import { DEFAULT_LIMIT } from "@common/constants";
// import MobileSearchHeader from "../../components/MobileSearchHeader";
// import MobileMenu from "../../components/MobileMenu";
// import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
// import config from "../../config";
// import OrgFollowersPageNotAcceptable from "./not_acceptable";
// import qs from "qs";
// import SwitchableTabLinks from "@components/TabLinks/SwitchableTabLinks";
// import BlockedUsers from "@containers/BlockedUsers";
// import "./index.scss";

// const TABS = {
//   subscribers: "subscribers",
//   blocked_users: "blocked_users",
// };

// class OrgFollowersPage extends React.Component {
//   constructor(props) {
//     super(props);
//     this.organizationID = props.match.params.id;
//     console.log("ORG ID:", this.organizationID);
//     this.state = {
//       page: 1,
//       limit: DEFAULT_LIMIT,
//       hasMore: true,
//       subscribersCount: null,
//       showMenu: false,
//       search: "",
//       showFollowers: true,
//     };
//   }

//   componentDidMount() {
//     const tab =
//       qs.parse(this.props.location.search.replace("?", "")).tab ||
//       TABS.subscribers;
//     if (
//       !this.props.orgDetail.data ||
//       (this.props.orgDetail.data &&
//         this.props.orgDetail.data.id !== Number(this.organizationID))
//     ) {
//       this.props.getOrganizationDetail(this.organizationID);
//     }

//     console.log("MOUNT");
//     console.log("TAB:", tab);

//     if (tab === TABS.subscribers) {
//       this.props
//         .getOrgFollowers(this.organizationID, this.state)
//         .then((res) => {
//           if (res && res.status === 403)
//             this.setState({ showFollowers: false });
//           else if (res && res.success) {
//             getPromoStats(this.organizationID).then(
//               (res) =>
//                 res &&
//                 res.success &&
//                 this.setState((prevState) => ({
//                   ...prevState,
//                   subscribersCount: res.data.subscribers_count,
//                 })),
//             );
//           }
//         });
//     }
//   }

//   componentDidUpdate(prevProps, prevState, snapshot) {
//     console.log("request", this.props.getOrgFollowers);

//     if (
//       prevProps.orgAcceptOrCancelFollower.currentUser !==
//       this.props.orgAcceptOrCancelFollower.currentUser
//     ) {
//       this.props.getOrgFollowers(this.organizationID, this.state);
//       getPromoStats(this.organizationID).then(
//         (res) =>
//           res &&
//           res.success &&
//           this.setState((prevState) => ({
//             ...prevState,
//             subscribersCount: res.data.subscribers_count,
//           })),
//       );
//     }
//     if (
//       qs.parse(prevProps.location.search.replace("?", "")).tab !==
//         TABS.subscribers &&
//       this.props.location.search.replace("?", "").tab === TABS.subscribers
//     ) {
//       this.setState((prevState) => ({ ...prevState, page: 1, hasMore: true }));
//       this.props.getOrgFollowers(this.organizationID, {
//         page: 1,
//         limit: this.state.limit,
//       });
//     }
//   }

//   onSearchChange = (e) => {
//     const { value } = e.target;
//     if (value !== this.state.search) {
//       this.setState((prevState) => ({
//         ...prevState,
//         search: value,
//         page: 1,
//         hasMore: true,
//       }));
//       this.props.getOrgFollowers(this.organizationID, {
//         page: 1,
//         limit: this.state.limit,
//         search: value,
//       });
//     }
//   };

//   onSearchCancel = () => {
//     if (this.state.search !== "") {
//       this.setState((prevState) => ({
//         ...prevState,
//         search: "",
//         page: 1,
//         hasMore: true,
//       }));
//       this.props.getOrgFollowers(this.organizationID, {
//         page: 1,
//         limit: this.state.limit,
//         search: "",
//       });
//     }
//   };

//   getDownloadLink = () =>
//     `${config.apiURL}/organizations/${this.organizationID}/download_followers/?token=${this.props.token}`;

//   getNext = (totalPages) => {
//     if (this.state.page < totalPages) {
//       const nextPage = this.state.page + 1;
//       this.props.getOrgFollowers(
//         this.organizationID,
//         {
//           ...this.state,
//           page: nextPage,
//         },
//         true,
//       );
//       return this.setState((prevState) => ({
//         ...prevState,
//         hasMore: true,
//         page: nextPage,
//       }));
//     }
//     this.setState((prevState) => ({ ...prevState, hasMore: false }));
//   };

//   onAcceptAllFollowers = async () => {
//     await this.props.sendAllAcceptFollowers(this.organizationID);
//     this.props.getOrgFollowers(this.organizationID, this.state);
//     getPromoStats(this.organizationID).then(
//       (res) =>
//         res &&
//         res.success &&
//         this.setState((prevState) => ({
//           ...prevState,
//           subscribersCount: res.data.subscribers_count,
//         })),
//     );
//     this.setState((prevState) => ({ ...prevState, showMenu: false }));
//   };

//   render() {
//     const { orgFollowers, orgDetail, history, location } = this.props;
//     const { hasMore, page, search, showMenu, showFollowers, subscribersCount } =
//       this.state;
//     const { data, loading } = orgFollowers;
//     const canViewDetails = !!(
//       orgDetail.data &&
//       orgDetail.data.permissions &&
//       (orgDetail.data.permissions.can_edit_organization ||
//         orgDetail.data.permissions.can_sale)
//     );

//     console.log("LOCATION:", this.props.location);

//     const tab =
//       qs.parse(location.search.replace("?", "")).tab || TABS.subscribers;
//     const TABS_DATA = [
//       {
//         label: "Подписчики",
//         key: TABS.subscribers,
//         translation: "org.followers",
//         onClick: () => history.replace(`?tab=${TABS.subscribers}`),
//       },
//       {
//         label: "Заблокированные",
//         key: TABS.blocked_users,
//         translation: "org.blocked",
//         onClick: () => history.replace(`?tab=${TABS.blocked_users}`),
//       },
//     ];

//     if (orgDetail.loading) {
//       return <Preloader />;
//     }

//     return (
//       <div
//         className="org-
//       followers-page"
//       >
//         <MobileSearchHeader
//           title={translate("Подписчики", "org.followers")}
//           onBack={() => history.goBack()}
//           searchValue={search}
//           onSearchChange={showFollowers ? this.onSearchChange : undefined}
//           onSearchCancel={this.onSearchCancel}
//           onMenu={
//             canViewDetails
//               ? () =>
//                   this.setState((prevState) => ({
//                     ...prevState,
//                     showMenu: true,
//                   }))
//               : null
//           }
//           className="org-followers-page__header"
//         />
//         <div className="container containerMax">
//           {canViewDetails && (
//             <SwitchableTabLinks links={TABS_DATA} activeLink={tab} />
//           )}

//           {tab === TABS.subscribers && (
//             <>
//               {typeof subscribersCount === "number" && showFollowers && (
//                 <div className="org-followers-page__promo row">
//                   <div className="org-followers-page__promo-left row">
//                     <svg
//                       width="25"
//                       height="24"
//                       viewBox="0 0 25 24"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <g clipPath="url(#clip0)">
//                         <path
//                           d="M7.25059 19.4996C6.94646 19.5002 6.64536 19.4392 6.36549 19.3201C6.08561 19.2011 5.83278 19.0266 5.62226 18.8071C5.41174 18.5876 5.2479 18.3277 5.14065 18.0431C5.03339 17.7585 4.98495 17.4551 4.99824 17.1513C5.01154 16.8474 5.08629 16.5494 5.21799 16.2753C5.34969 16.0012 5.5356 15.7566 5.76449 15.5563C5.99338 15.356 6.26049 15.2042 6.54969 15.1101C6.83889 15.016 7.14417 14.9814 7.44709 15.0086L9.86509 10.9781C9.64399 10.6386 9.51869 10.2456 9.50241 9.84076C9.48612 9.43591 9.57947 9.03417 9.77259 8.67796C9.96571 8.32176 10.2514 8.02432 10.5996 7.81705C10.9477 7.60977 11.3454 7.50036 11.7506 7.50036C12.1558 7.50036 12.5534 7.60977 12.9016 7.81705C13.2497 8.02432 13.5355 8.32176 13.7286 8.67796C13.9217 9.03417 14.0151 9.43591 13.9988 9.84076C13.9825 10.2456 13.8572 10.6386 13.6361 10.9781L16.0541 15.0086C16.1688 14.9983 16.2842 14.9973 16.3991 15.0056L20.3921 8.01861C20.1051 7.5983 19.9692 7.09311 20.0064 6.58555C20.0436 6.07799 20.2517 5.59803 20.5969 5.22403C20.9421 4.85004 21.4038 4.60411 21.9068 4.52639C22.4097 4.44868 22.9242 4.54377 23.3661 4.79614C23.8081 5.04851 24.1514 5.44326 24.34 5.91592C24.5287 6.38859 24.5515 6.91125 24.4048 7.39857C24.2581 7.8859 23.9506 8.30909 23.5323 8.59906C23.1141 8.88903 22.6099 9.02865 22.1021 8.99511L18.1091 15.9821C18.3385 16.3186 18.4723 16.711 18.4962 17.1176C18.5201 17.5241 18.4332 17.9295 18.2448 18.2906C18.0564 18.6516 17.7735 18.9548 17.4264 19.1677C17.0792 19.3806 16.6808 19.4953 16.2735 19.4995C15.8663 19.5038 15.4656 19.3974 15.114 19.1918C14.7625 18.9861 14.4734 18.689 14.2775 18.3319C14.0816 17.9749 13.9863 17.5714 14.0017 17.1644C14.0171 16.7574 14.1427 16.3623 14.3651 16.0211L11.9471 11.9906C11.8164 12.0027 11.6848 12.0027 11.5541 11.9906L9.13609 16.0211C9.35738 16.3607 9.48285 16.7537 9.49923 17.1587C9.51562 17.5636 9.42231 17.9655 9.22917 18.3218C9.03602 18.6781 8.75022 18.9757 8.40195 19.183C8.05369 19.3903 7.65589 19.4997 7.25059 19.4996Z"
//                           fill="white"
//                         />
//                       </g>
//                       <defs>
//                         <clipPath id="clip0">
//                           <rect
//                             width="24"
//                             height="24"
//                             fill="white"
//                             transform="translate(0.5)"
//                           />
//                         </clipPath>
//                       </defs>
//                     </svg>
//                     <span className="f-15 f-700">
//                       {translate(
//                         "Статистика подписок по акции",
//                         "org.subscriptionStatistics",
//                       )}
//                     </span>
//                   </div>
//                   <div className="org-followers-page__promo-right row">
//                     <span className="f-15 f-700">+{subscribersCount}</span>
//                     <PromotionIcon color="#FFF" />
//                   </div>
//                 </div>
//               )}
//               <div className="org-followers-page__content">
//                 {page === 1 && loading ? (
//                   <Preloader />
//                 ) : !showFollowers ? (
//                   <OrgFollowersPageNotAcceptable />
//                 ) : !data || (data && !data.total_count) ? (
//                   <OrgFollowersEmpty organization={this.organizationID} />
//                 ) : (
//                   <InfiniteScroll
//                     dataLength={Number(data.list.length) || 0}
//                     next={() => this.getNext(data.total_pages)}
//                     hasMore={hasMore}
//                     loader={null}
//                   >
//                     {data.list.map((user) =>
//                       canViewDetails ? (
//                         <div
//                           className="org-followers-page__card row"
//                           key={user.id}
//                         >
//                           <Link
//                             to={`/organizations/${this.organizationID}/client/${user.id}?src=follower`}
//                             key={user.id}
//                             className="row"
//                           >
//                             <UserCard
//                               avatar={user.avatar}
//                               fullname={user.full_name}
//                               description={user.username}
//                               withBorder
//                               badge={
//                                 user.is_blocked && (
//                                   <div className="org-followers-page__card-badge" />
//                                 )
//                               }
//                             />
//                           </Link>
//                           {user.is_subscribed === "pending" ? (
//                             <div>
//                               <button
//                                 type="button"
//                                 className="org-followers-page__confirm-btn f-14 f-500"
//                                 onClick={() =>
//                                   this.props.sendRequestAcceptFollower(
//                                     this.organizationID,
//                                     user.id,
//                                   )
//                                 }
//                               >
//                                 {translate("Принять", "app.confirm")}
//                               </button>
//                             </div>
//                           ) : (
//                             user.has_promo_cashback && <PromotionIcon />
//                           )}
//                         </div>
//                       ) : (
//                         <div
//                           key={user.id}
//                           className="org-followers-page__card row"
//                         >
//                           <UserCard
//                             avatar={user.avatar}
//                             fullname={user.full_name}
//                             description={user.username}
//                             badge={
//                               user.is_blocked && (
//                                 <div className="org-followers-page__card-badge" />
//                               )
//                             }
//                             withBorder
//                           />
//                           {user.is_subscribed === "pending" ? (
//                             <div>
//                               <button
//                                 type="button"
//                                 className="org-followers-page__confirm-btn f-14 f-500"
//                                 onClick={() =>
//                                   this.props.sendRequestAcceptFollower(
//                                     this.organizationID,
//                                     user.id,
//                                   )
//                                 }
//                               >
//                                 {translate("Принять", "app.confirm")}
//                               </button>
//                               <span className="org-followers-page__separate">
//                                 |
//                               </span>
//                               <button
//                                 type="button"
//                                 className="org-followers-page__reject-btn f-14 f-500"
//                                 onClick={() =>
//                                   this.props.sendCancelRequestFollower(
//                                     this.organizationID,
//                                     user.id,
//                                   )
//                                 }
//                               >
//                                 {translate("Отклонить", "app.cancel")}
//                               </button>
//                             </div>
//                           ) : (
//                             user.has_promo_cashback && <PromotionIcon />
//                           )}
//                         </div>
//                       ),
//                     )}
//                   </InfiniteScroll>
//                 )}
//               </div>
//             </>
//           )}

//           {tab === TABS.blocked_users && (
//             <BlockedUsers orgID={this.organizationID} search={search} />
//           )}
//         </div>

//         {canViewDetails && (
//           <MobileMenu
//             isOpen={showMenu}
//             contentLabel={translate("Подписчики", "org.followers")}
//             onRequestClose={() =>
//               this.setState((prevState) => ({ ...prevState, showMenu: false }))
//             }
//           >
//             {orgDetail.data.is_private && (
//               <RowButton
//                 label={translate(
//                   "Одобрить все подписки",
//                   "org.approveAllSubscriptions",
//                 )}
//                 showArrow={false}
//                 onClick={this.onAcceptAllFollowers}
//                 className={"f-17"}
//               >
//                 <span className="org-followers-page__approve-all dfc justify-center">
//                   <LockIcon />
//                 </span>
//               </RowButton>
//             )}

//             <a
//               href={this.getDownloadLink()}
//               // target="_blank"
//               rel="noopener noreferrer"
//               className="f-17 row-button-link-styles" // добавьте ваши стили
//               style={{ display: "flex", alignItems: "center", padding: "10px" }}
//             >
//               <ExcelIcon />
//               <span style={{ marginLeft: 10 }}>
//                 {translate(
//                   "Скачать лист подписчиков",
//                   "org.downloadFollowersList",
//                 )}
//               </span>
//             </a>
//           </MobileMenu>
//         )}
//       </div>
//     );
//   }
// }

// const mapStateToProps = (state) => ({
//   orgDetail: state.organizationStore.orgDetail,
//   token: state.userStore.token,
//   orgFollowers: state.organizationStore.orgFollowers,
//   orgAcceptOrCancelFollower: state.organizationStore.orgAcceptOrCancelFollower,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getOrganizationDetail: (orgID) => dispatch(getOrganizationDetail(orgID)),
//   getOrgFollowers: (orgID, params, isNext) =>
//     dispatch(getOrgFollowers(orgID, params, isNext)),
//   sendRequestAcceptFollower: (orgID, userID) =>
//     dispatch(sendRequestAcceptFollower(orgID, userID)),
//   sendAllAcceptFollowers: (orgID) => dispatch(sendAllAcceptFollowers(orgID)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(OrgFollowersPage);
