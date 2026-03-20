import React from 'react';
import useInfiniteScrollQuery from "../../../hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "../../../common/helpers";
import {getUserOrganizations} from "../../../store/services/organizationServices";
import RowOrganizationList from "../../RowOrganizationList";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../Preloader";

const UserOrganizationsMenu = ({onSelect}) => {
  const fetchOrganizations = params => {
    return notifyQueryResult(getUserOrganizations(params))
  }

  const {data: orgs, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchOrganizations(params),
  )

  return (
    <div className="container" style={{marginBottom: '2rem'}}>
      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        loader={<Preloader style={{marginTop: 16}}/>}
        dataLength={orgs.length}
        scrollableTarget="global-menu-content"
      >
        <RowOrganizationList
          orgs={orgs}
          generateProps={org => ({
            onClick: () => onSelect(org)
          })}
        />
      </InfiniteScroll>
    </div>
  );
};

export default UserOrganizationsMenu;