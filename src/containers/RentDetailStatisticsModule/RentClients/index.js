import React, {useCallback, useEffect, useRef, useState} from 'react';
import {translate} from "../../../locales/locales";
import {DATE_FORMAT_DD_MMMM_YYYY, DEFAULT_LIMIT, QR_PREFIX} from "../../../common/constants";
import {getRentTransactionsUsers} from "../../../store/services/receiptServices";
import Notify from "../../../components/Notification";
import * as moment from "moment/moment";
import {useDispatch, useSelector} from "react-redux";
import MobileMenu from "../../../components/MobileMenu";
import MenuDatePicker from "../../../components/MenuDatePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../components/Preloader";
import ClientScanRowCard from "./ClientScanRowCard";
import {setViews} from "../../../store/actions/commonActions";
import {VIEW_TYPES} from "../../../components/GlobalLayer";
import {useHistory} from "react-router-dom";
import "./index.scss"

const RentClients = ({rentID, search = ''}) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const locale = useSelector(state => state.userStore.locale)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const [clientsLoading, setClientsLoading] = useState(true);
  const [clients, setClients] = useState(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const queryParams = useRef({page: 1, limit: DEFAULT_LIMIT, search, start, end})

  const handleUserIDInput = (clientIDStr, bookingID) => {
    if (!clientIDStr) return
    const clientID = Number(clientIDStr.replace(QR_PREFIX, ''))

    if (!clients?.list) {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return dispatch(setViews([]));
    }

    const client = clients.list.find(client => client.client.id === clientID && client.booking.id === bookingID)

    if (!client) {
      return Notify.error({
        text: translate('Клиент не распознан', 'notify.scanClientFailure')
      })
    }

    history.push(`/clients/${client.client.id}/rent-activation/${client.booking.id}`)

    dispatch(setViews([]))
  }

  const handleClientScan = (clientID, bookingID) => {
    dispatch(setViews({
      type: VIEW_TYPES.qr_scan,
      onScan: clientIDStr => handleUserIDInput(clientIDStr, bookingID),
      onInputSubmit: clientIDStr => handleUserIDInput(clientIDStr, bookingID),
      onScanError(e) {
        Notify.error({
          text: translate('Ошибка сканирования', 'notify.scanFailure')
        })
        console.error(e)
      }
    }))
  }

  const getClients = useCallback(async (queryParams) => {
    try {
      return await getRentTransactionsUsers(rentID, queryParams)
    } catch (e) {
      console.error(e.message)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return null
    }
  }, [rentID]);

  const getNextClients = useCallback(() => {
    queryParams.current.page += 1
    void getClients(queryParams.current).then(res => {
      if (res?.success) {
        setClients(prevState => ({
          ...prevState,
          ...res.data,
          list: prevState?.list ?
            prevState.list.concat(res.data.list)
            : res.data.list
        }))
      }
    })
  }, [getClients])

  useEffect(() => {
    setClientsLoading(true)
    queryParams.current = {
      ...queryParams.current,
      page: 1,
      start,
      end,
      search,
    }
    getClients(queryParams.current).then(res => {
      if (res?.success) {
        setClients(res.data)
      }
    }).finally(() => setClientsLoading(false))
  }, [end, getClients, search, start]);

  const hasMore = clients ? clients.total_pages !== queryParams.current.page : true

  return (
    <div className="rent-clients">
      <div className="rent-clients__date-selection f-14 f-500">
        <div className="container">
          <p className="f-500">{translate('Выбор даты', 'app.dateSelection')}:</p>
          <button className="rent-clients__date-selection-interval f-500" onClick={() => setIsDatePickerOpen(true)}>
            {(start && end) ?
              translate("с {start} - по {end}", "app.dateRange", {
                start: moment(start).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY),
                end: moment(end).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)
              })
              : translate("За все время", "app.allTime")}
          </button>
        </div>
      </div>
      {clientsLoading ? <Preloader/> : (
        <InfiniteScroll next={getNextClients} hasMore={hasMore} loader={<Preloader/>}
                        dataLength={clients?.list.length ?? 0} className="container">
          {clients && clients.list.map(client => (
            <ClientScanRowCard
              key={client.id}
              client={client}
              onScan={() => handleClientScan(client.client.id, client.booking.id)}
              className="rent-clients__list-item"
            />
          ))}
        </InfiniteScroll>
      )}

      <MobileMenu
        isOpen={isDatePickerOpen}
        contentLabel={translate("Параметры даты", "app.dateOptions")}
        onRequestClose={() => setIsDatePickerOpen(false)}
      >
        <MenuDatePicker
          start={start}
          end={end}
          locale={locale}
          onChange={range => {
            setStart(range.start)
            setEnd(range.end)
            setIsDatePickerOpen(false)
          }}
        />
      </MobileMenu>
    </div>
  );
};

export default RentClients;