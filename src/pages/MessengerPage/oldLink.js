




//   <Link
//                       key={chat.id}
//                       to={
//                         chat.chat_type === "organization" && chat.is_members
//                           ? `/messenger/organization/${chat.organization_id}`
//                           : chat.chat_type === "group" &&
//                               chat.organization?.is_members
//                             ? `/messenger/organization/${chat.organization.id}`
//                             : `/messenger/chat/${
//                                 chat.chat_type === "group"
//                                   ? chat.id
//                                   : chat.chat_type === "organization"
//                                     ? chat.id
//                                     : chat.sender?.id
//                               }/?type=${chat.chat_type}${
//                                 chat.chat_type === "organization"
//                                   ? "&organization_id=" + chat.organization_id
//                                   : chat.organization
//                                     ? "&organization_id=" + chat.organization.id
//                                     : ""
//                               }`
//                       }
//                       className={`messenger-chat-item ${
//                         chat.chat_type === "organization"
//                           ? "organization-chat"
//                           : ""
//                       }`}
//                       draggable={false}
//                       onContextMenu={(e) => {
//                         e.preventDefault();
//                         if (
//                           isDesktop ||
//                           e.nativeEvent?.pointerType === "mouse"
//                         ) {
//                           setContextMenu({
//                             open: true,
//                             chat,
//                             x: e.clientX,
//                             y: e.clientY,
//                           });
//                         }
//                       }}
//                       onTouchStart={(e) => {
//                         longPressTriggeredRef.current = false;
//                         // Сохраняем начальные координаты
//                         startCoords.current = {
//                           x: e.touches[0].clientX,
//                           y: e.touches[0].clientY,
//                         };

//                         longPressRef.current = setTimeout(() => {
//                           longPressTriggeredRef.current = true;

//                           const rect = e.currentTarget.getBoundingClientRect();

//                           setContextMenu({
//                             open: true,
//                             chat,
//                             x: rect.left + rect.width / 2,
//                             y: rect.top + rect.height / 2,
//                           });

//                           navigator.vibrate?.(50);
//                         }, 500);
//                       }}
//                       onTouchEnd={(e) => {
//                         clearTimeout(longPressRef.current);

//                         // Если сработал Long Press, блокируем клик (переход по ссылке)
//                         if (longPressTriggeredRef.current) {
//                           e.preventDefault();
//                           e.stopPropagation();
//                         }
//                       }}
//                       onTouchMove={(e) => {
//                         const x = e.touches[0].clientX;
//                         const y = e.touches[0].clientY;

//                         // Проверка на смещение > 10px (защита от дрожания пальца)
//                         if (
//                           Math.abs(x - startCoords.current.x) > 10 ||
//                           Math.abs(y - startCoords.current.y) > 10
//                         ) {
//                           clearTimeout(longPressRef.current);
//                         }
//                       }}
//                       onClick={(e) => {
//                         if (longPressTriggeredRef.current) {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           return;
//                         }

//                         if (isDesktop) {
//                           e.preventDefault();

//                           history.push(
//                             `/messenger/?type=${chat.chat_type}${
//                               chat.organization
//                                 ? `&organization_id=${chat.organization.id}`
//                                 : ""
//                             }`,
//                           );

//                           setSelectedChatId(
//                             chat.chat_type === "group" ||
//                               chat.chat_type === "organization"
//                               ? chat.id
//                               : chat.sender?.id,
//                           );

//                           setSelectedChatType(chat.chat_type);

//                           setSelectedOrganizationId(
//                             chat.chat_type === "organization"
//                               ? chat.organization_id
//                               : chat.organization
//                                 ? chat.organization.id
//                                 : null,
//                           );
//                         }
//                       }}
//                     >
//                       {isSelect && (
//                         <button
//                           className={`chat-select-check${
//                             selectedChats.includes(chat.id) ? " checked" : ""
//                           }`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             setSelectedChats((selectedChats) =>
//                               selectedChats.includes(chat.id)
//                                 ? selectedChats.filter((id) => id !== chat.id)
//                                 : [...selectedChats, chat.id],
//                             );
//                           }}
//                           style={{
//                             border: "none",
//                             background: "transparent",
//                             marginRight: 8,
//                             cursor: "pointer",
//                             outline: "none",
//                             display: "flex",
//                             alignItems: "center",
//                           }}
//                         >
//                           <svg width="20" height="21" viewBox="0 0 24 24">
//                             <circle
//                               cx="12"
//                               cy="12"
//                               r="11"
//                               fill="#fff"
//                               stroke="#007AFF"
//                               strokeWidth="2"
//                             />
//                             {selectedChats.includes(chat.id) && (
//                               <polyline
//                                 points="7,13 11,17 17,9"
//                                 fill="none"
//                                 stroke="#fff"
//                                 strokeWidth="2"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             )}
//                           </svg>
//                         </button>
//                       )}
//                       <div className="messenger-chat-avatar-wrap">
//                         <img
//                           src={
//                             chat.organization
//                               ? chat.organization.image?.medium ||
//                                 chat.organization.image?.file ||
//                                 ""
//                               : chat.chat_type === "group"
//                                 ? chat.image || defaultGroupAvatar
//                                 : chat.chat_type === "organization"
//                                   ? chat.image?.medium ||
//                                     chat.image?.file ||
//                                     defaultGroupAvatar
//                                   : chat.sender?.avatar?.medium ||
//                                     chat.sender?.avatar?.file ||
//                                     ""
//                           }
//                           alt={
//                             chat.organization
//                               ? chat.organization.title
//                               : chat.chat_type === "group"
//                                 ? chat.title
//                                 : chat.chat_type === "organization"
//                                   ? chat.title
//                                   : chat.sender?.full_name
//                           }
//                           style={
//                             chat.chat_type === "organization" ||
//                             chat.organization
//                               ? { borderRadius: "12px" }
//                               : null
//                           }
//                           className="messenger-chat-avatar"
//                         />
//                         {chat.unread_messages_count > 0 && (
//                           <div className="profile-module__icon-count f-11">
//                             {chat.unread_messages_count < 1000
//                               ? chat.unread_messages_count
//                               : "999+"}
//                           </div>
//                         )}
//                       </div>
//                       <div className="messenger-chat-content">
//                         <div className="messenger-chat-header">
//                           <span
//                             className={`messenger-chat-name${
//                               chat.is_blocked ? " messenger-chat-name--red" : ""
//                             }`}
//                             style={
//                               chat.is_blocked ? { color: "#D72C20" } : null
//                             }
//                           >
//                             {chat.organization
//                               ? chat.organization.title
//                               : chat.chat_type === "group"
//                                 ? chat.title
//                                 : chat.chat_type === "organization"
//                                   ? chat.title
//                                   : chat.sender?.full_name}
//                           </span>
//                           <p
//                             className="messenger-chat-date"
//                             style={
//                               chat?.last_message?.status === "read"
//                                 ? { color: "#27AE60" }
//                                 : null
//                             }
//                           >
//                             {chat.last_message?.created_at
//                               ? new Date(
//                                   chat.last_message.created_at,
//                                 ).toLocaleDateString()
//                               : chat.updated_at
//                                 ? new Date(chat.updated_at).toLocaleDateString()
//                                 : ""}{" "}
//                             <span>
//                               {chat.last_message?.created_at
//                                 ? new Date(
//                                     chat.last_message.created_at,
//                                   ).toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })
//                                 : chat.updated_at
//                                   ? new Date(
//                                       chat.updated_at,
//                                     ).toLocaleTimeString([], {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     })
//                                   : ""}
//                             </span>
//                           </p>
//                         </div>
//                         <div className="messenger-chat-message-row">
//                           {MessageStatus(chat?.last_message?.status)}
//                           <span className="messenger-chat-message">
//                             {chat.last_message?.is_mine === true
//                               ? translate("Вы: ", "messenger.you")
//                               : chat.last_message?.is_mine === false
//                                 ? translate("Вам: ", "messenger.toYou")
//                                 : ""}
//                             {chat.last_message?.text ||
//                               chat.last_message?.forwarded?.text ||
//                               (chat.chat_type === "organization" &&
//                               chat.chat_type === "organization" &&
//                               !chat.last_message?.text
//                                 ? chat.types?.[0]?.title ||
//                                   translate(
//                                     "Организация",
//                                     "messenger.organization",
//                                   )
//                                 : "")}
//                           </span>
//                         </div>
//                       </div>
//                     </Link>
