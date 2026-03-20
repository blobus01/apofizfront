import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { mobileMenuStyles } from "../../../../assets/styles/modal";
import Button from "../../../../components/UI/Button";
import { translate } from "../../../../locales/locales";
import {
  AvgCheck,
  ClockHistoryIcon,
  CloseButton,
  LocationIcon,
} from "../../../../components/UI/Icons";
import { useOrganizationDetail } from "../../../../hooks/queries/useOrganizationDetail";
import Preloader from "../../../../components/Preloader";
import OrgAvatar from "../../../../components/UI/OrgAvatar";
import { prettyMoney } from "../../../../common/utils";
import { Link, useHistory } from "react-router-dom";
import { createLinkOnMap } from "../../../../common/helpers";

const OrganizationMenu = ({
  orgID,
  style = mobileMenuStyles,
  onRequestClose,
  onClose,
  coords,
  onCLoseView,
  mapRef,
  ...rest
}) => {
  const history = useHistory();
  const isOpen = !!orgID;

  const { fetching, data: orgDetail, error } = useOrganizationDetail(orgID);

  const [position, setPosition] = useState({ left: 0, top: 0 });
  const menuRef = useRef(null);
  const FOOTER_HEIGHT = 108;

  useEffect(() => {
    if (coords && mapRef && mapRef.current && mapRef.current.leafletElement) {
      const point = mapRef.current.leafletElement.latLngToContainerPoint([
        coords.latitude,
        coords.longitude,
      ]);
      let left = point.x;
      let top = point.y;

      setTimeout(() => {
        const menu = menuRef.current;
        const mapNode = mapRef.current && mapRef.current.container;
        if (menu && mapNode) {
          const menuRect = menu.getBoundingClientRect();
          const mapRect = mapNode.getBoundingClientRect();
          let newLeft = left;
          let newTop = top;

          // Если меню выходит за правую границу карты
          if (left + menuRect.width > mapRect.width) {
            newLeft = mapRect.width - menuRect.width - 8; // 8px отступ
          }
          // Если меню выходит за нижнюю границу карты (учитываем футер)
          if (top + menuRect.height > mapRect.height - FOOTER_HEIGHT) {
            newTop = Math.max(
              mapRect.height - menuRect.height - FOOTER_HEIGHT - 8,
              8
            );
          }
          // Если меню выходит за левую границу
          if (newLeft < 0) newLeft = 8;
          // Если меню выходит за верхнюю границу
          if (newTop < 0) newTop = 8;

          setPosition({ left: newLeft, top: newTop });
        } else {
          setPosition({ left, top });
        }
      }, 0);
    }
  }, [coords, mapRef, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (onClose) onClose();
        else if (onRequestClose) onRequestClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, onRequestClose]);

  const goToOrganization = () => {
    if (orgID) {
      history.push(`/organizations/${orgID}`);
    }
    onClose && onClose();
    onCLoseView();
  };

  let opensAt;
  let closes_at;
  let avgCheck;

  if (orgDetail) {
    opensAt = orgDetail.opens_at?.slice(0, 5);
    closes_at = orgDetail.closes_at?.slice(0, 5);
    avgCheck = orgDetail.avg_check;
  }

  const mapLink = orgDetail
    ? createLinkOnMap(
        orgDetail.full_location.latitude,
        orgDetail.full_location.longitude
      )
    : null;

  return (
    <>
      {isOpen && (
        <div
          ref={menuRef}
          className="organization-map-module__org-menu container"
          style={(() => {
            const isMobile = window.innerWidth <= 600;
            if (
              coords &&
              mapRef &&
              mapRef.current &&
              mapRef.current.leafletElement
            ) {
              if (isMobile) {
                return {
                  position: "fixed",
                  left: 0,
                  right: 0,
                  bottom: 68,
                  maxWidth: "100%",
                  zIndex: 1000,
                  height: "fit-content",
                  maxHeight: "90vh",
                  overflow: "auto",
                  borderRadius: "16px 16px 0 0",
                };
              }
              return {
                position: "absolute",
                left: position.left,
                top: position.top,
                zIndex: 1000,
                height: "fit-content",
                maxHeight: "90vh",
                overflow: "auto",
              };
            }
            if (isMobile) {
              return {
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 68,
                maxWidth: "100%",
                zIndex: 1000,
                height: "fit-content",
                maxHeight: "90vh",
                overflow: "auto",
                borderRadius: "16px 16px 0 0",
              };
            }
            return {
              height: "fit-content",
              maxHeight: "90vh",
              overflow: "auto",
            };
          })()}
        >
          <div className="organization-map-module__org-menu-controls dfc row">
            <Button
              onClick={goToOrganization}
              label={translate(
                "Посмотреть организацию",
                "org.viewOrganization"
              )}
              className="organization-map-module__org-menu-button"
            />
            <CloseButton onClick={onClose ? onClose : onRequestClose} />
          </div>
          {fetching && <Preloader />}
          {error && (
            <p className="f-500">
              {translate(
                "Не удалось загрузить организацию",
                "notify.failedToLoadOrganization"
              )}
            </p>
          )}
          {orgDetail && !fetching && (
            <div className="organization-map-module__org-menu-content">
              <button
                onClick={goToOrganization}
                className="organization-map-module__org-menu-content-top"
              >
                <OrgAvatar
                  src={orgDetail.image.medium}
                  alt={orgDetail.title}
                  className="organization-map-module__org-menu-avatar"
                />
                <div className="organization-map-module__org-menu-content-top-right">
                  {orgDetail.types[0] && (
                    <p className="organization-map-module__org-menu-desc-text tl f-12">
                      {orgDetail.types[0].title}
                    </p>
                  )}

                  <h4 className="f-16 f-700 tl two-line-ellipsis">
                    {orgDetail.title}
                  </h4>

                  <div className="organization-map-module__org-menu-additional-info">
                    {opensAt && closes_at && (
                      <div className="organization-map-module__org-menu-info-field">
                        <p className="organization-map-module__org-menu-desc-text f-10">
                          {translate("Время работы", "app.workTime")}
                        </p>
                        <p className="organization-map-module__org-menu-info-field-value organization-map-module__org-menu-work-time dfc">
                          <svg
                            className="organization-map-module__org-menu-info-field-value-icon"
                            width="24"
                            height="21"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.6437 1.27366C10.4295 1.25785 10.2148 1.24992 10 1.24991V0C10.2457 0.000119776 10.4912 0.00929202 10.7362 0.0274981L10.6437 1.27366ZM13.1485 1.83612C12.7479 1.68151 12.3364 1.5566 11.9174 1.4624L12.1911 0.242483C12.6698 0.349975 13.141 0.492465 13.5985 0.669953L13.1485 1.83612ZM14.8609 2.72356C14.6822 2.60438 14.4992 2.49181 14.3122 2.38608L14.9284 1.29866C15.3558 1.54081 15.7647 1.81403 16.1521 2.1161L15.3834 3.10228C15.2139 2.97008 15.0396 2.84417 14.8609 2.72481V2.72356ZM17.1532 4.9609C16.906 4.60965 16.6332 4.2771 16.3371 3.96597L17.242 3.10353C17.5795 3.45976 17.8919 3.84098 18.1757 4.24095L17.1532 4.9609ZM18.0832 6.65078C18.0011 6.45262 17.9119 6.2575 17.8157 6.06582L18.9319 5.50336C19.1526 5.94219 19.3406 6.39673 19.4943 6.86327L18.3069 7.25449C18.2397 7.05059 18.1651 6.84922 18.0832 6.65078ZM18.7456 9.78431C18.7355 9.35477 18.6937 8.92655 18.6206 8.50315L19.8518 8.29067C19.9356 8.77313 19.9843 9.2631 19.9968 9.75307L18.7469 9.78431H18.7456ZM18.5819 11.7067C18.6231 11.4942 18.6569 11.283 18.6831 11.0692L19.9243 11.223C19.8643 11.7106 19.7682 12.1932 19.6368 12.6666L18.4319 12.3329C18.4894 12.1266 18.5394 11.9179 18.5819 11.7067ZM17.392 14.6802C17.622 14.3177 17.8244 13.9378 17.9994 13.5453L19.1419 14.0515C18.9419 14.5015 18.7106 14.934 18.4482 15.3489L17.392 14.6802ZM16.1871 16.1864C16.3396 16.0339 16.4858 15.8764 16.6245 15.7139L17.572 16.5301C17.4115 16.7161 17.2443 16.8962 17.0708 17.0701L16.1871 16.1864Z"
                              fill="#27ae60"
                            />
                            <path
                              d="M9.9993 1.24991C8.5605 1.25002 7.14393 1.60495 5.87506 2.28326C4.60619 2.96158 3.52418 3.94235 2.72488 5.1387C1.92557 6.33505 1.43364 7.71006 1.29265 9.14193C1.15166 10.5738 1.36597 12.0184 1.91658 13.3476C2.4672 14.6769 3.33714 15.8499 4.44934 16.7626C5.56155 17.6754 6.88169 18.2998 8.29283 18.5805C9.70398 18.8613 11.1626 18.7896 12.5394 18.372C13.9163 17.9544 15.1689 17.2037 16.1864 16.1864L17.07 17.0701C15.9073 18.2334 14.4755 19.0921 12.9016 19.5699C11.3277 20.0477 9.66028 20.1299 8.04701 19.8092C6.43374 19.4885 4.92447 18.7749 3.65293 17.7315C2.38138 16.6882 1.38682 15.3473 0.757363 13.8276C0.127906 12.308 -0.117011 10.6566 0.0443127 9.0197C0.205636 7.3828 0.768219 5.81097 1.68221 4.44346C2.59621 3.07595 3.8334 1.955 5.28416 1.17992C6.73492 0.404841 8.35447 -0.000435885 9.9993 3.51798e-07V1.24991Z"
                              fill="#27ae60"
                            />
                            <path
                              d="M9.37496 3.75C9.5407 3.75 9.69966 3.81584 9.81687 3.93305C9.93407 4.05025 9.99991 4.20921 9.99991 4.37496V10.887L14.0596 13.2068C14.1994 13.2911 14.3006 13.4267 14.3416 13.5847C14.3827 13.7426 14.3604 13.9103 14.2794 14.052C14.1985 14.1937 14.0653 14.2981 13.9084 14.3429C13.7515 14.3877 13.5832 14.3693 13.4397 14.2918L9.06498 11.7919C8.96933 11.7373 8.88981 11.6583 8.8345 11.5631C8.77919 11.4678 8.75004 11.3596 8.75 11.2495V4.37496C8.75 4.20921 8.81584 4.05025 8.93305 3.93305C9.05025 3.81584 9.20921 3.75 9.37496 3.75Z"
                              fill="#27ae60"
                            />
                          </svg>
                          {translate("{start} до {end}", "app.timeFromTo", {
                            start: opensAt,
                            end: closes_at,
                          })}
                        </p>
                      </div>
                    )}

                    {avgCheck !== null && (
                      <div className="organization-map-module__org-menu-info-field">
                        <p className="organization-map-module__org-menu-desc-text f-10">
                          {translate("Средний чек", "org.averageBill")}:
                        </p>
                        <p className="organization-map-module__org-menu-info-field-value organization-map-module__org-menu-avg-check dfc">
                          <svg
                            className="organization-map-module__org-menu-info-field-value-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.92578 2.01953L4.93066 3.7373C4.79776 3.80672 4.64994 3.84277 4.5 3.84277C4.38764 3.84277 4.27644 3.82262 4.17188 3.7832L4.06934 3.7373L2.07422 2.59961L1.84961 2.47168V17C1.84961 17.305 1.97088 17.5978 2.18652 17.8135C2.40219 18.0291 2.695 18.1504 3 18.1504H14.3945L14.3213 17.9492C14.2383 17.7207 14.1846 17.4826 14.1621 17.2412L14.1504 16.999V2.47168L13.9258 2.59961L11.9307 3.7373C11.7978 3.80672 11.6499 3.84277 11.5 3.84277C11.3876 3.84277 11.2764 3.82262 11.1719 3.7832L11.0693 3.7373L8.07422 2.01953L8 1.97754L7.92578 2.01953ZM15.8496 17C15.8496 17.305 15.9709 17.5978 16.1865 17.8135C16.4022 18.0291 16.695 18.1504 17 18.1504C17.305 18.1504 17.5978 18.0291 17.8135 17.8135C18.0291 17.5978 18.1504 17.305 18.1504 17V11.8496H15.8496V17ZM8 5.15039C8.22542 5.15039 8.44118 5.24003 8.60059 5.39941C8.75998 5.5588 8.84959 5.77459 8.84961 6V6.65039H10C10.2254 6.65039 10.4412 6.74003 10.6006 6.89941C10.76 7.0588 10.8496 7.27459 10.8496 7.5C10.8496 7.72543 10.76 7.94216 10.6006 8.10156C10.4412 8.26068 10.2252 8.34961 10 8.34961H7.5C7.32763 8.34961 7.16193 8.41816 7.04004 8.54004C6.91816 8.66192 6.84963 8.82763 6.84961 9C6.84961 9.17237 6.91816 9.33807 7.04004 9.45996C7.16194 9.58186 7.32761 9.65039 7.5 9.65039H8.5C9.08261 9.64981 9.64471 9.86546 10.0771 10.2559C10.5096 10.6464 10.7822 11.1839 10.8408 11.7637C10.8994 12.3434 10.7401 12.9244 10.3945 13.3936C10.0489 13.8628 9.54085 14.1868 8.96973 14.3027L8.84961 14.3271V15C8.84961 15.2254 8.75999 15.4422 8.60059 15.6016C8.44122 15.7607 8.22522 15.8496 8 15.8496C7.77478 15.8496 7.55877 15.7607 7.39941 15.6016C7.24001 15.4422 7.15039 15.2254 7.15039 15V14.3496H6C5.77478 14.3496 5.55877 14.2607 5.39941 14.1016C5.24001 13.9422 5.15039 13.7254 5.15039 13.5C5.15041 13.2746 5.24002 13.0588 5.39941 12.8994C5.55882 12.74 5.77458 12.6504 6 12.6504H8.5C8.67239 12.6504 8.83806 12.5819 8.95996 12.46C9.08184 12.3381 9.15039 12.1724 9.15039 12C9.15037 11.8276 9.08184 11.6619 8.95996 11.54C8.83807 11.4182 8.67237 11.3496 8.5 11.3496H7.5L7.28223 11.3398C6.77853 11.2935 6.30116 11.0857 5.92285 10.7441C5.49037 10.3535 5.21776 9.81613 5.15918 9.23633C5.10793 8.72898 5.22319 8.22056 5.48438 7.78711L5.60547 7.60645C5.95111 7.13723 6.45915 6.81324 7.03027 6.69727L7.15039 6.67285V6C7.15041 5.77459 7.24002 5.5588 7.39941 5.39941C7.55882 5.24003 7.77458 5.15039 8 5.15039ZM0.150391 0.999023C0.150004 0.886794 0.171462 0.77598 0.213867 0.672852L0.262695 0.572266C0.318705 0.474831 0.393872 0.390282 0.482422 0.322266L0.575195 0.259766C0.704353 0.18525 0.850885 0.146486 1 0.146484C1.11197 0.146484 1.22241 0.168367 1.3252 0.210938L1.4248 0.259766H1.42578L4.42578 1.98047L4.5 2.02344L4.57422 1.98047L7.57422 0.259766H7.5752C7.70435 0.18525 7.85089 0.146486 8 0.146484C8.11197 0.146484 8.22241 0.168367 8.3252 0.210938L8.4248 0.259766H8.42578L11.4258 1.98047L11.5 2.02344L11.5742 1.98047L14.5742 0.259766H14.5752C14.7044 0.18525 14.8509 0.146486 15 0.146484C15.112 0.146484 15.2224 0.168367 15.3252 0.210938L15.4248 0.259766C15.5545 0.33464 15.6627 0.442439 15.7373 0.572266C15.7932 0.669608 15.8285 0.777064 15.8428 0.887695L15.8496 0.999023V10.1504H19C19.2254 10.1504 19.4412 10.24 19.6006 10.3994C19.76 10.5588 19.8496 10.7746 19.8496 11V17C19.8496 17.7559 19.5501 18.4811 19.0156 19.0156C18.4811 19.5501 17.7559 19.8496 17 19.8496H3C2.3386 19.8496 1.70051 19.6206 1.19336 19.2051L0.984375 19.0156C0.44992 18.4812 0.150391 17.7558 0.150391 17V0.999023Z"
                              fill="#FBBC05"
                              stroke="white"
                              strokeWidth="0.3"
                            />
                          </svg>
                          {prettyMoney(avgCheck, false, orgDetail.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {orgDetail.address && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="organization-map-module__org-menu-location dfc f-14 f-500"
                >
                  <svg
                    className="organization-map-module__org-menu-location-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 15 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.80078 0.398438C3.93911 0.398438 0.800781 3.53648 0.800781 7.39779C0.800781 9.75424 2.16578 11.7257 3.75245 13.1023C4.25411 13.5339 5.12912 14.2222 5.91078 15.2371C6.77412 16.3686 7.55578 17.5818 7.80078 18.3984C8.04578 17.5818 8.82745 16.3686 9.69078 15.2371C10.4724 14.2222 11.3474 13.5339 11.8491 13.1023C13.4358 11.7257 14.8008 9.75424 14.8008 7.39779C14.8008 3.53648 11.6624 0.398438 7.80078 0.398438ZM7.80078 3.38483C8.32782 3.38483 8.8497 3.48863 9.33662 3.6903C9.82354 3.89197 10.266 4.18756 10.6386 4.5602C11.0113 4.93283 11.3069 5.37522 11.5086 5.8621C11.7103 6.34897 11.8141 6.8708 11.8141 7.39779C11.8141 7.92478 11.7103 8.44661 11.5086 8.93348C11.3069 9.42036 11.0113 9.86274 10.6386 10.2354C10.266 10.608 9.82354 10.9036 9.33662 11.1053C8.8497 11.307 8.32782 11.4108 7.80078 11.4108C6.73638 11.4108 5.71557 10.988 4.96293 10.2354C4.21028 9.48281 3.78745 8.46209 3.78745 7.39779C3.78745 6.33349 4.21028 5.31277 4.96293 4.5602C5.71557 3.80762 6.73638 3.38483 7.80078 3.38483Z"
                      fill="#4285F4"
                    />
                  </svg>
                  <span className="organization-map-module__org-menu-location-text">
                    {orgDetail.address}
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default OrganizationMenu;
