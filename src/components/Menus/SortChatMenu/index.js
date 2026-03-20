// import React, { useState } from "react";

// import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
// import { translate } from "../../../locales/locales";

// import { MessengerIcon } from "@containers/ProfileModule/icons";
// import Preloader from "@components/Preloader";
// import { CheckIcon } from "@components/UI/Icons";
// import { BlockIcon, NotReadIcon, OrgIcon } from "./icons";

// const SortChatMenu = ({
//   handleSortChange,
//   activeSort = "new",
//   onClose,
//   loadingChats,
//   isOrgMessenger,
// }) => {
//   const [selectedSort, setSelectedSort] = useState(activeSort);

//   const handleSort = (value) => {
//     setSelectedSort(value);
//     if (handleSortChange) handleSortChange(value);
//     if (onClose && !loadingChats) onClose();
//   };

//   return (
//     <div className="post-feed-card__menu">
//       <div className="container">
//         <RowButton
//           type={ROW_BUTTON_TYPES.button}
//           label={translate("Новые", "messenger.news")}
//           showArrow={false}
//           onClick={() => handleSort("new")}
//           endIcon={
//             loadingChats && activeSort === "new" ? (
//               <Preloader />
//             ) : activeSort === "new" ? (
//               <CheckIcon />
//             ) : null
//           }
//         >
//           <MessengerIcon />
//         </RowButton>
//         <RowButton
//           type={ROW_BUTTON_TYPES.button}
//           label={translate("Непрочитанные", "messenger.unread")}
//           showArrow={false}
//           onClick={() => handleSort("unread")}
//           endIcon={
//             loadingChats && activeSort === "unread" ? (
//               <Preloader />
//             ) : activeSort === "unread" ? (
//               <CheckIcon />
//             ) : null
//           }
//         >
//           <NotReadIcon />
//         </RowButton>
//         <RowButton
//           type={ROW_BUTTON_TYPES.button}
//           label={translate("Заблокированные", "messenger.blocked")}
//           showArrow={false}
//           onClick={() => handleSort("blocked")}
//           endIcon={
//             loadingChats && activeSort === "blocked" ? (
//               <Preloader />
//             ) : activeSort === "blocked" ? (
//               <CheckIcon />
//             ) : null
//           }
//         >
//           <BlockIcon />
//         </RowButton>
//         {!isOrgMessenger && (
//           <RowButton
//             type={ROW_BUTTON_TYPES.button}
//             label={translate(
//               "Организации",
//               "referral.subscriptions.organizations",
//             )}
//             showArrow={false}
//             onClick={() => handleSort("organization")}
//             endIcon={
//               loadingChats && activeSort === "organization" ? (
//                 <Preloader />
//               ) : activeSort === "organization" ? (
//                 <CheckIcon />
//               ) : null
//             }
//           >
//             <OrgIcon />
//           </RowButton>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SortChatMenu;

import React from "react";
import { translate } from "../../../locales/locales";
import Preloader from "@components/Preloader";
import { CheckIcon } from "@components/UI/Icons";
import { MessengerIcon } from "@containers/ProfileModule/icons";
import { BlockIcon, NotReadIcon, OrgIcon } from "./icons";
import { GroupIcon } from "@pages/MessengerPage/icons";

const SortChatMenu = ({
  handleSortChange,
  activeSort = "new",
  onClose,
  loadingChats,
  isOrgMessenger,
}) => {
  const handleSort = (value) => {
    if (handleSortChange) handleSortChange(value);
    if (onClose && !loadingChats) onClose();
  };

  const renderEndIcon = (value) => {
    if (loadingChats && activeSort === value) return <Preloader />;
    if (activeSort === value) return <CheckIcon />;
    return null;
  };

  return (
    <div className="comment__popup">
      {/* Новые */}
      <button className="comment__popup-btn" onClick={() => handleSort("new")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MessengerIcon />
          {translate("Новые", "messenger.news")}
        </div>
        {renderEndIcon("new")}
      </button>

      {/* Непрочитанные */}
      <button
        className="comment__popup-btn"
        onClick={() => handleSort("unread")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NotReadIcon />
          {translate("Непрочитанные", "messenger.unread")}
        </div>
        {renderEndIcon("unread")}
      </button>

      <button
        className="comment__popup-btn"
        onClick={() => handleSort("blocked")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BlockIcon />
          {translate("Заблокированные", "messenger.blocked")}
        </div>
        {renderEndIcon("blocked")}
      </button>

      {!isOrgMessenger && (
        <button
          className="comment__popup-btn"
          onClick={() => handleSort("organization")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <OrgIcon />
            {translate("Организации", "referral.subscriptions.organizations")}
          </div>
          {renderEndIcon("organization")}
        </button>
      )}
      <button
        className="comment__popup-btn"
        onClick={() => handleSort("group")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GroupIcon />
          {translate("Группы", "app.groups")}
        </div>
        {renderEndIcon("group")}
      </button>
    </div>
  );
};

export default SortChatMenu;
