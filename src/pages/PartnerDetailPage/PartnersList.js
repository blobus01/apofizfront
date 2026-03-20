import React, {useCallback, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {getBannersList} from "../../store/actions/bannerActions";
import {DEFAULT_LIMIT} from "../../common/constants";
import {getHomeOrganizations, getOrgsByCategories} from "../../store/actions/homeActions";
import PartnerBannerSlider from "../../components/PartnerBannerSlider";
import PartnerCard from "../../components/Cards/PartnerCard";
import Preloader from "../../components/Preloader";
import HorizontalScrollOrgs from "./horizontal";
import VerticalScrollOrgs from "./vertical";
import {translate} from "../../locales/locales";
import EmptyBox from "../../components/EmptyBox";
import InfiniteScroll from "react-infinite-scroll-component";
import OrganizationDscCard from "../../components/Cards/OrganizationDscCard";
import {getSearchPartnerResult} from "../../store/actions/partnerActions";
import "./index.scss";

const VIEWS = {
  horizontal: 'horizontal',
  vertical: 'vertical'
}

const PartnersList = ({history, orgTitle, searchParam}) => {
  const {partnerID} = useParams();
  const dispatch = useDispatch();
  const bannersList = useSelector(state => state.bannerStore.bannersList);
  const {loading: partnersLoading, data: partners, page, hasMore} = useSelector(state => state.partnerStore.searchPartnerResult)
  const [state, setState] = useState({
    view: VIEWS.vertical,
    category: null,
    loading: true,
  });

  const {view, category, loading} = state;

  const onMount = useCallback(async () => {
    dispatch(getBannersList({organization: partnerID}));
    try {
      const res = await dispatch(getHomeOrganizations({page: 1, limit: DEFAULT_LIMIT, partner: partnerID}));
      if (res && res.success) {
        if (res.total_count > 1) {
          return setState(state => ({...state, loading: false, view: VIEWS.horizontal}));
        }
        if (res.list[0]) {
          const categoryID = res.list[0].id;
          const response = await dispatch(getOrgsByCategories({page: 1, limit: DEFAULT_LIMIT, category: categoryID, partner: partnerID}));
          if (response && response.success) {
            return setState(state => ({...state, loading: false, view: VIEWS.vertical, category: categoryID}));
          }
        }
      }
    } catch (e) {}
    history.push('/home/discounts');
  }, [dispatch, history, partnerID]);

  const getNextSearchRes = useCallback(() => {
    dispatch(getSearchPartnerResult(partnerID, {
      page: page + 1
    }))
  }, [dispatch, page, partnerID])


  useEffect(() => {
    onMount();
  }, [onMount]);


  useEffect(() => {
    dispatch(getSearchPartnerResult(partnerID, {
      page: 1,
      data: null,
      hasMore: true,
      search: !!searchParam ? searchParam : null
    }))
  }, [dispatch, searchParam, partnerID])

  return (
    <React.Fragment>
      <div className="partner-detail-page">
        <div className="partner-detail-page__content">
          {!loading && bannersList.data && !!bannersList.data.list.length  && (
            <div className="partner-detail-page__banners">
              <PartnerBannerSlider banners={bannersList.data.list} />
            </div>
          )}

          <div className="container">
            {!!searchParam ? (
              <PartnersSearch
                partners={partners}
                loading={partnersLoading && page === 1}
                hasMore={hasMore}
                getNext={getNextSearchRes}
              />
            ) :  (
              <PartnerCard
                partner={orgTitle}
                to={orgTitle ? `/organizations/${orgTitle && orgTitle.id}` : '/'}
                className="partner-detail-page__info"
              />
            )}

          </div>
          {!searchParam && (
            <div className="partner-detail-page__organizations">
              {loading ? <Preloader /> : view === VIEWS.horizontal
                ? <HorizontalScrollOrgs organization={partnerID}  />
                : <VerticalScrollOrgs organization={partnerID} category={category} />}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

const PartnersSearch = ({partners, loading, hasMore, getNext}) => {
  return loading ? (
    <Preloader />
  ) : (!partners || (partners && !partners.total_count)) ? (
    <EmptyBox
      title={translate("Нет партнеров", "partners.noPartners")}
      description={translate("Поиск не дал результатов", "hint.noSearchResult")}
    />
  ) : (
    <InfiniteScroll
      next={getNext}
      hasMore={hasMore}
      loader={<Preloader />}
      dataLength={Number(partners.list.length) || 0}
      className="partner-detail-page__partners-search-result"
    >
      {partners.list.map(org => (
        <OrganizationDscCard
          key={org.id}
          organization={org}
          className="partner-detail-page__dsc-card"
        />
      ))}
    </InfiniteScroll>
  )
}

export default React.memo(PartnersList);