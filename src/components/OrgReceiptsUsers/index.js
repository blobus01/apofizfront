import React, {useState} from 'react';
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import classnames from "classnames";
import InfiniteScroll from 'react-infinite-scroll-component';
import {getOrgTransactionsUsers} from '../../store/actions/receiptActions';
import Preloader from '../Preloader';
import OrgReceiptsEmpty from '../../pages/OrgReceiptsPage/empty';
import UserCard from "../Cards/UserCard";

const OrgReceiptsUsers = ({params, setParams, search, className}) => {
  const dispatch = useDispatch();
  const {data, loading} = useSelector(state => state.receiptStore.transactionsUsers);

  const [isScroll, setIsScroll] = useState(false);

  const getNext = async totalPages => {
    if (params.page < totalPages) {
      const nextPage = params.page + 1;
      setIsScroll(true);
      await dispatch(getOrgTransactionsUsers(params.organization,{...params, organization: null, page: nextPage}, true));
      setIsScroll(false);
      return setParams(prev => ({...prev, hasMore: true, page: nextPage}));
    }

    setParams(prev => ({...prev, hasMore: false}));
  };

  return (
    <div className="container">
      {(params.page === 1 && loading && !isScroll)
        ? <Preloader/>
        : (!data || (data && !data.total_count))
          ? <OrgReceiptsEmpty organization={params.organization} searched={!!search} />
          : (
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => getNext(data.total_pages)}
              hasMore={params.hasMore}
              loader={null}
            >
              {data.list.map(user => (
                <Link
                  to={`/organizations/${params.organization}/client/${user.id}?src=client`}
                  key={user.id}
                  className={classnames('row', className)}
                >
                  <UserCard
                    avatar={user.avatar}
                    fullname={user.full_name}
                    description={user.username}
                    withBorder
                  />
                </Link>
              ))}
              {(isScroll && loading) && <Preloader/>}
            </InfiniteScroll>
          )
      }
    </div>
  );
};

export default OrgReceiptsUsers;