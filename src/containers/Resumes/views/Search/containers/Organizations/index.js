import React from 'react';
import {notifyQueryResult} from "../../../../../../common/helpers";
import {getOrganizationsWithResume} from "../../../../../../store/services/resumeServices";
import useInfiniteScrollQuery from "../../../../../../hooks/useInfiniteScrollQuery";
import OrganizationWithDiscountList from "../../../../../../components/OrganizationWithDiscountList";
import classNames from "classnames";
import {LocationIcon, SocialIcon} from "../../../../../../components/UI/Icons";
import {translate} from "../../../../../../locales/locales";
import classes from "./index.module.scss"
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../../../components/Preloader";
import EmptyBox from "../../../../../../components/EmptyBox";

const Organizations = ({search, region}) => {
  const fetchOrganizations = params => {
    return notifyQueryResult(getOrganizationsWithResume(params))
  }

  const {data: organizations, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchOrganizations({
      ...params,
      search,
      country: region?.code ?? null,
      city: region?.id ?? null,
    }),
    [search, region?.code, region?.id]
  )

  return (
    <div className="container">
      {search && (
        <Region data={region} style={{marginBottom: '1rem'}}/>
      )}
      <InfiniteScroll next={next} hasMore={hasMore} loader={<Preloader style={{marginTop: '1.5rem'}}/>}
                      dataLength={organizations.length}>
        {!hasMore && organizations.length < 1 ? (<EmptyBox
          title={translate('Нет совпадений', 'app.noMatch')}
          description={!!search && translate('Поиск не дал результатов', 'hint.noSearchResult')}
        />) : (
          <OrganizationWithDiscountList
            data={organizations}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};

const Region = ({data, className, ...rest}) => {
  return (
    <div className={classNames(classes.regionInfo, className)} {...rest}>
      {data ? <LocationIcon className={classes.regionInfoLocation}/> : <SocialIcon/>}
      <p
        className={classNames(classes.regionInfoTitle, 'f-16 f-600 tl')}>{data ? data.name : translate('Планета Земля', 'app.planetEarth')}</p>
    </div>
  )
}

export default Organizations;