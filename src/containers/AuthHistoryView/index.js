import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Device from '../../components/Device';
import MobileTopHeader from '../../components/MobileTopHeader';
import Preloader from '../../components/Preloader';
import {translate} from '../../locales/locales';
import DeviceMobileMenu from '../../pages/DevicesPage/DeviceMobileMenu';
import Notify from "../../components/Notification";
import InfiniteScroll from "react-infinite-scroll-component";
import {getAuthHistory} from "../../store/actions/profileActions";
import {DEFAULT_LIMIT} from "../../common/constants";
import './index.scss';

const AuthHistoryView = ({onBack}) => {
  const dispatch = useDispatch();
  const {data: authHistory} = useSelector(state => state.profileStore.authHistory);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [page, setPage] = useState(1);

  const limit = DEFAULT_LIMIT

  const getAuthHistoryDevices = useCallback(async (params, isNext) => {
    const res = await dispatch(getAuthHistory({
      limit,
      ...params
    }, isNext))

    if (res.error) {
      console.error(res.error)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
    }
  }, [dispatch, limit])

  const getNextAuthHistoryDevices = () => {
    void getAuthHistoryDevices({
      page: page + 1,
      limit
    }, true)
    setPage(prevPage => prevPage + 1)
  }


  useEffect(() => {
    void getAuthHistoryDevices({page: 1})
  }, [getAuthHistoryDevices]);

  return (
    <div className="auth-history">
      <MobileTopHeader onBack={onBack} title={translate('История авторизаций', 'profile.authHistory')}/>
      <InfiniteScroll
        next={getNextAuthHistoryDevices}
        hasMore={authHistory ? authHistory.total_pages > page : true}
        loader={<Preloader />}
        dataLength={authHistory ? authHistory.list.length : 0}
        height="calc(100vh - 44px)"
        className="container"
      >
        {authHistory &&
          authHistory.list.map(device => {
            return <Device device={device} onClick={() => setSelectedDevice(device)} className="auth-history__device"
                           key={device.id}/>;
          })}
      </InfiniteScroll>


      {selectedDevice &&
        <DeviceMobileMenu device={selectedDevice} isOpen={!!selectedDevice} onClose={() => setSelectedDevice(null)}/>}
    </div>
  );
};

export default AuthHistoryView;
