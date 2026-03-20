import React from 'react';
import useInfiniteScrollQuery from "@hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "@common/helpers";
import {getOrgBlockedUsers} from "@store/services/organizationServices";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "@components/Preloader";
import {Link} from "react-router-dom";
import UserCard from "@components/Cards/UserCard";
import classes from './index.module.scss'

const BlockedUsers = ({orgID, search}) => {
  const fetchBlockedUsers = async params => {
    return notifyQueryResult(getOrgBlockedUsers(orgID, params))
  }

  const {data: users, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchBlockedUsers({...params, search}),
    [search],
  )

  return (
    <InfiniteScroll next={next} hasMore={hasMore} dataLength={users.length} loader={<Preloader/>}>
      {users.map(user => {
        return (
          <Link to={`/organizations/${orgID}/client/${user.id}?src=follower`}
                key={user.id}>
            <UserCard
              avatar={user.avatar}
              fullname={user.full_name}
              description={user.username}
              badge={<div className={classes.badge}/>}
              className={classes.card}
            />
          </Link>
        )
      })}
    </InfiniteScroll>
  );
};

export default BlockedUsers;