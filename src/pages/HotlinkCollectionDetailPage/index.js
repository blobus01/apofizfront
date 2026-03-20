import React, { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  clearHotlinkCollectionItems,
  getOrganizationDetail,
  getOrgHotlinkDetails,
  getSelectedHotlinkCollectionItems,
  getSelectedHotlinkCollectionSubcategories,
} from "../../store/actions/organizationActions";
import Preloader from "../../components/Preloader";
import MobileTopHeader from "../../components/MobileTopHeader";
import EmptyData from "../SubscriptionsPostsPage/empty";
import { translate } from "../../locales/locales";
import ShopFeedView from "../../containers/ShopFeedView";
import ShopGridView from "../../containers/ShopGridView";
import MobileMenu from "../../components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import { SettingCollection, ShareIcon } from "../../components/UI/Icons";
import Notify from "../../components/Notification";

import { copyTextToClipboard, stickyActiveShadow } from "../../common/utils";
import { DEFAULT_LIMIT, POSTS_VIEWS } from "../../common/constants";
import config from "../../config";
import PageHelmet from "../../components/PageHelmet";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";

import "./index.scss";
import SubscriptionsSkeleton from "@components/SubscriptionsSkeleton/SubscriptionsSkeleton";

const HotlinkCollectionDetailPage = ({ user }) => {
  const dispatch = useDispatch();
  const { orgID, hotlinkID } = useParams();
  const history = useHistory();
  const [feedView, setFeedView] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [state, setState] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
    subcategory: null,
    isNext: false,
  });
  const {
    orgHotlinkDetails,
    hotlinkCollectionItems,
    hotlinkCollectionSubcategories,
    orgDetail,
  } = useSelector(
    (state) => ({
      hotlinkCollectionItems: state.organizationStore.hotlinkCollectionItems,
      hotlinkCollectionSubcategories:
        state.organizationStore.hotlinkCollectionSubcategories,
      orgHotlinkDetails: state.organizationStore.orgHotlinkDetails,
      orgDetail: state.organizationStore.orgDetail.data,
    }),
    shallowEqual,
  );

  const { data, loading } = hotlinkCollectionItems;
  const title = data && data.collection_title;
  const pageTitle =
    translate("Подборка", "app.compilation") + (title ? ` "${title}"` : "");

  const totalPages = (data && data.total_pages) || 0;

  const shadowObserverRef = useRef(null);

  useEffect(() => {
    dispatch(getOrganizationDetail(orgID));
    dispatch(getOrgHotlinkDetails(hotlinkID));
    dispatch(getSelectedHotlinkCollectionSubcategories(hotlinkID));
  }, [dispatch, orgID, hotlinkID]);

  useEffect(() => {
    const requestParams = { ...state };
    const isNext = state.isNext;
    delete requestParams.isNext;

    dispatch(
      getSelectedHotlinkCollectionItems(hotlinkID, requestParams, isNext),
    );
  }, [dispatch, hotlinkID, state]);

  useEffect(() => {
    shadowObserverRef.current = stickyActiveShadow();

    return () => {
      if (shadowObserverRef.current) shadowObserverRef.current.disconnect();
      dispatch(clearHotlinkCollectionItems());
    };
  }, []);

  const getNext = () => {
    if (state.page < totalPages) {
      const nextPage = state.page + 1;
      setState((prevState) => ({
        ...prevState,
        isNext: true,
        page: nextPage,
        hasMore: true,
      }));
    }
  };

  const onSelect = (category) => {
    setState((prevState) => ({
      ...prevState,
      page: 1,
      isNext: false,
      subcategory: category?.id || null,
      hasMore: true,
    }));
  };

  const description = translate(
    'Подборка организации "{orgName}"',
    "app.compilationShareMessage",
    { orgName: orgDetail && orgDetail.title },
  );

  const share = async () => {
    const shareUrl = `${config.baseURL}/organizations/${orgID}/collections/${hotlinkID}`;
    const sharePayload = {
      title,
      text: description,
      url: shareUrl,
    };

    try {
      copyTextToClipboard(shareUrl, () =>
        Notify.success({
          text: translate("Ссылка скопирована", "dialog.linkCopySuccess"),
        }),
      );
      await navigator.share(sharePayload);
    } catch (e) {}

    setShowMenu(false);
  };

  return (
    <>
      <PageHelmet
        title={pageTitle}
        description={description}
        image={
          orgHotlinkDetails &&
          orgHotlinkDetails.data &&
          (orgHotlinkDetails.data.image
            ? orgHotlinkDetails.data.image.medium
            : "")
        }
      />
      <div
        className="hotlink-collection-detail-page"
        style={{ background: "#e6e8eb" }}
      >
        <MobileTopHeader
          onBack={() => history.goBack()}
          onMenu={() => setShowMenu(true)}
          title={
            (!loading && title && pageTitle) ||
            translate("Загрузка...", "app.loading")
          }
          style={{ height: 61, borderRadius: "0" }}
        />

        <div className="hotlink">
          <img
            className="hotlink__image"
            src={orgHotlinkDetails?.data?.image?.file}
            alt=""
          />

          <div className="hotlink__info">
            <h2 className="hotlink__title">{orgHotlinkDetails?.data?.title}</h2>

            <p className="hotlink__desc">
              {orgHotlinkDetails?.data?.decription}
            </p>
          </div>
        </div>

        <div className="sticky" style={{ background: "#e6e8eb" }}>
          <ShopControlsWithViewChange
            view={feedView ? POSTS_VIEWS.FEED : POSTS_VIEWS.GRID}
            onViewChange={(newView) =>
              setFeedView(newView === POSTS_VIEWS.FEED)
            }
            categories={hotlinkCollectionSubcategories}
            selectedCategory={state.subcategory?.id || null}
            onCategorySelect={onSelect}
            style={{
              paddingLeft: 15,
              borderRadius: "0 0 16px 16px",
            }}
          />
        </div>
        <div className="hotlink-collection-detail-page__content container">
          <div>
            {state.page === 1 && loading ? (
              <SubscriptionsSkeleton padding={true} length={21} />
            ) : !data || (data && !data.list.length) ? (
              <EmptyData />
            ) : (
              <div style={{ margin: "0 -5px" }}>
                <div className="hotlink-collection-detail-page__list">
                  <InfiniteScroll
                    dataLength={Number(data.list.length) || 0}
                    next={() => getNext()}
                    hasMore={state.hasMore}
                    style={{ overflow: "unset" }}
                    loader={
                      state.page > 1 && loading ? (
                        <Preloader style={{ marginTop: "10px" }} />
                      ) : null
                    }
                  >
                    {feedView ? (
                      <ShopFeedView
                        data={data}
                        margin={true}
                        orgDetail={orgDetail}
                        user={user}
                      />
                    ) : (
                      <div>
                        <ShopGridView
                          data={data}
                          orgDetail={orgDetail}
                          user={user}
                        />
                      </div>
                    )}
                  </InfiniteScroll>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={showMenu}
        contentLabel={translate("Подборка", "app.compilation")}
        onRequestClose={() => setShowMenu(false)}
      >
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Поделиться", "app.share")}
          showArrow={false}
          onClick={share}
        >
          <ShareIcon />
        </RowButton>
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Настройка подборки", "app.settingCollection")}
          showArrow={false}
          onClick={(e) => {
            e.preventDefault();
            history.push(`/organizations/${orgID}/hotlinks/${hotlinkID}`);
          }}
        >
          <SettingCollection />
        </RowButton>
      </MobileMenu>
    </>
  );
};

export default HotlinkCollectionDetailPage;
