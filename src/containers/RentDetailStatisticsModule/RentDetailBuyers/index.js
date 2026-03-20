import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DEFAULT_LIMIT} from "../../../common/constants";
import {getRentDetailTransactionsUsers} from "../../../store/services/receiptServices";
import Notify from "../../../components/Notification";
import {translate} from "../../../locales/locales";
import TimeIntervalSelect from "../../../components/TimeIntervalSelect";
import Preloader from "../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import {Link} from "react-router-dom";
import classnames from "classnames";
import UserCard from "../../../components/Cards/UserCard";
import {useDispatch, useSelector} from "react-redux";
import {getRentDetailSaleTotals} from "../../../store/actions/statisticActions";
import SavingsBlock from "../../../components/UI/SavingsBlock";
import "./index.scss"

const RentDetailBuyers = ({rentID, orgID, search}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.rentDetailSaleTotals)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const [buyersLoading, setBuyersLoading] = useState(true);
  const [buyers, setBuyers] = useState(null);

  const pagination = useRef({
    page: 1,
    limit: DEFAULT_LIMIT
  })

  const queryParams = useMemo(() => {
    return {
      search,
      start,
      end
    }
  }, [search, start, end])

  const getBuyers = useCallback(async params => {
    try {
      return await getRentDetailTransactionsUsers(rentID, {organization: orgID, ...params})
    } catch (e) {
      console.error(e.message)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return null
    }
  }, [rentID, orgID]);

  const getNextBuyers = () => {
    pagination.current.page += 1
    getBuyers({
      ...queryParams,
      ...pagination.current
    }).then(res => {
      if (res?.success) {
        setBuyers(prevState => ({
          ...prevState,
          ...res.data,
          list: prevState?.list ?
            prevState.list.concat(res.data.list)
            : res.data.list
        }))
      }
    })
  }

  useEffect(() => {
    void dispatch(getRentDetailSaleTotals(rentID, queryParams))

    setBuyersLoading(true)
    pagination.current.page = 1

    getBuyers({
      ...queryParams,
      ...pagination.current
    }).then(res => {
      if (res?.success) {
        setBuyers(res.data)
      }
    }).finally(() => setBuyersLoading(false))
  }, [queryParams, getBuyers, dispatch, rentID]);

  const hasMore = buyers ? buyers.total_pages !== pagination.current.page : true

  return (
    <div className="rent-detail-buyers">
      <div className="rent-detail-buyers__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="rent-detail-buyers__savings-block"
          />

          <TimeIntervalSelect
            start={start}
            end={end}
            onChange={({start, end}) => {
              setStart(start)
              setEnd(end)
            }}
            className="rent-detail-buyers__date-selection-interval"
          />
        </div>
      </div>

      {buyersLoading ? <Preloader/> : (
        <InfiniteScroll
          next={getNextBuyers}
          hasMore={hasMore}
          loader={<Preloader/>}
          dataLength={buyers?.list.length ?? 0}
          className="container"
        >
          {buyers && buyers.list.map(buyer => (
            <Link
              to={`/organizations/${orgID}/client/${buyer.id}?src=client`}
              key={buyer.id}
              className={classnames('row', 'rent-detail-buyers__client-card-link')}
            >
              <UserCard
                avatar={buyer.avatar}
                fullname={buyer.full_name}
                description={buyer.username}
                withBorder
              />
            </Link>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default RentDetailBuyers;