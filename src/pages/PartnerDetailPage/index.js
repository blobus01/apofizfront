import React, { useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PageHelmet from "../../components/PageHelmet";
import { ShareIcon } from "@ui/Icons";
import { translate } from "@locales/locales";
import MobileMenu from "../../components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import config from "../../config";
import { copyTextToClipboard, debounce } from "@common/utils";
import Notify from "../../components/Notification";
import { subscribeToPartners } from "@store/services/organizationServices";
import useDialog from "../../components/UI/Dialog/useDialog";
import "./index.scss";
import TabLinks from "../../components/TabLinks";
import PartnersList from "./PartnersList";
import PartnersPostsList from "./PartnersPostsList";
import { getOrganizationTitle } from "@store/actions/organizationActions";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { QRCodeSVG } from "qrcode.react";
import CheckedFieldIcon from "@ui/Icons/CheckedFieldIcon";
import AnimatedQr from "@components/Animated/AnimatedQr";

const VIEWS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

const PartnerDetailPage = ({ history }) => {
  const dispatch = useDispatch();
  const { partnerID, section: currentTab } = useParams();
  const { alert } = useDialog();
  const orgTitle = useSelector((state) => state.organizationStore.orgTitle);

  const [state, setState] = useState({
    view: VIEWS.vertical,
    showMenu: false,
    category: null,
    loading: true,
  });

  // input value
  const [searchValue, setSearchValue] = useState("");
  // debounced search param for subpages
  const [searchParam, setSearchParam] = useState("");

  const TABS = [
    {
      label: "Товары",
      path: `/home/partners/${partnerID}/posts`,
      translation: "shop.products",
    },
    {
      label: "Партнеры",
      path: `/home/partners/${partnerID}/partners`,
      translation: "app.partners",
    },
  ];

  const { showMenu } = state;

  const toggleMenu = (menuState) => setState({ ...state, showMenu: menuState });

  const doSearch = useMemo(() => {
    return debounce((searchValue) => {
      setSearchParam(searchValue);
    }, 300);
  }, []);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchCancel = () => {
    setSearchValue("");
  };

  useEffect(() => {
    if (currentTab === undefined) {
      history.replace(`/home/partners/${partnerID}/posts`);
    }
  }, [currentTab, partnerID, history]);

  useEffect(() => {
    dispatch(getOrganizationTitle(partnerID));
  }, [dispatch, partnerID]);

  useEffect(() => {
    if (currentTab !== undefined) {
      setSearchValue("");
    }
  }, [dispatch, currentTab]);

  useEffect(() => {
    doSearch(searchValue);
  }, [searchValue, doSearch]);

  return (
    <React.Fragment>
      {orgTitle && (
        <PageHelmet
          title={`${!!orgTitle.types.length ? orgTitle.types[0].title : ""} ${
            orgTitle.title
          }${
            !!orgTitle.partners.count
              ? ` - ${orgTitle.partners.count} партнёров`
              : ""
          }`}
          description={orgTitle.description}
          image={orgTitle.image && orgTitle.image.medium}
        />
      )}
      <div className="partner-detail-page">
        <MobileSearchHeader
          title={
            currentTab && currentTab === "posts"
              ? translate("Товары", "shop.products")
              : translate("Партнеры", "app.partners")
          }
          onBack={() => history.goBack()}
          defaultState={!!searchValue}
          searchValue={searchValue}
          onSearchChange={handleSearch}
          radius={true}
          onSearchCancel={handleSearchCancel}
          onSearchSubmit={(e) => {
            e.preventDefault();
            e.target.search.blur();
          }}
          onMenu={() => toggleMenu(true)}
        />
        <div className="container" style={{ margin: '10px auto' }}>
          <TabLinks radius={true} links={TABS} />
        </div>
        {currentTab === "posts" && (
          <PartnersPostsList partnerID={partnerID} searchParam={searchParam} />
        )}
        {currentTab === "partners" && (
          <PartnersList
            partnerID={partnerID}
            orgTitle={orgTitle}
            searchParam={searchParam}
          />
        )}
      </div>

      <MobileMenu
        isOpen={showMenu}
        contentLabel={translate("Партнёры", "app.partners")}
        onRequestClose={() => toggleMenu(false)}
      >
        <ShareQR partnerID={partnerID} />
        <div
          className={classnames(
            "organization-module__menu",
            showMenu && "organization-module__menu-active"
          )}
        >
          {orgTitle && (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Поделиться", "app.share")}
              showArrow={false}
              onClick={async () => {
                const shareUrl = `${config.baseURL}/home/partners/${partnerID}`;
                const sharePayload = {
                  title: `${
                    !!orgTitle.types.length ? orgTitle.types[0].title : ""
                  } ${orgTitle.title}${
                    !!orgTitle.partners.count
                      ? ` - ${orgTitle.partners.count} партнёров`
                      : ""
                  }`,
                  text: orgTitle.description,
                  url: shareUrl,
                };
                try {
                  copyTextToClipboard(shareUrl, () =>
                    Notify.success({
                      text: translate(
                        "Ссылка скопирована",
                        "dialog.linkCopySuccess"
                      ),
                    })
                  );
                  await navigator.share(sharePayload);
                } catch (e) {}

                toggleMenu(false);
              }}
            >
              <ShareIcon />
            </RowButton>
          )}
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={translate(
              "Подписаться на всех партнеров",
              "partners.subscribeAll"
            )}
            showArrow={false}
            onClick={() => {
              subscribeToPartners(partnerID).then((res) => {
                if (res && res.success) {
                  toggleMenu(false);
                  alert({
                    title: "Поздравляем!",
                    description:
                      "Вы подписались на все организации, данной группы партнёров",
                  });
                }
              });
            }}
          >
            <CheckedFieldIcon width={24} />
          </RowButton>
        </div>
      </MobileMenu>
    </React.Fragment>
  );
};

const ShareQR = ({ partnerID }) => {
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] =
    useState(false);

  return (
    <div className="partner-detail-page__qr-box">
      {!isInitialAnimationCompleted && (
        <AnimatedQr
          style={{
            position: "absolute",
            top: "0.6em",
            left: "0.6em",
            right: "0.6em",
            bottom: "0.6em",
            width: "unset",
            height: "unset",
          }}
          eventListeners={[
            {
              eventName: "complete",
              callback: () => setIsInitialAnimationCompleted(true),
            },
          ]}
          options={{ loop: false }}
        />
      )}
      <QRCodeSVG
        bgColor="#FFFFFF"
        fgColor="#000"
        width={160}
        height={160}
        level="H"
        value={`${config.domain}/home/partners/${partnerID}`}
      />
    </div>
  );
};

export default PartnerDetailPage;
