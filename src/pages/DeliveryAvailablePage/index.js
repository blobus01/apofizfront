import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as classnames from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import {translate} from '../../locales/locales';
import TabLinks from '../../components/TabLinks';
import Preloader from '../../components/Preloader';
import MobileTopHeader from '../../components/MobileTopHeader';
import {canGoBack} from '../../common/helpers';
import CartCard from '../../components/Cards/CartCard';
import RowButton, {ROW_BUTTON_TYPES} from '../../components/UI/RowButton';
import {DeliveryCheck, DeliveryIcon} from '../../components/UI/Icons';
import MobileMenu from '../../components/MobileMenu';
import {DEFAULT_LIMIT, DELIVERY_STATUSES} from '../../common/constants';
import {getAvailableOrdersForDelivery} from '../../store/actions/deliveryActions';
import {EmptyInfo} from '../../components/EmptyInfo';
import EmptyImage from '../../assets/images/delivery_empty.png';
import {acceptOrderForDelivery, rejectOrderForDelivery} from '../../store/services/deliveryServices';
import useDialog from '../../components/UI/Dialog/useDialog';
import './index.scss';

const TABS = [
  {label: 'Доступные заказы', path: '/delivery/available', translation: 'delivery.availableOrders'},
  {label: 'История заказов', path: '/delivery/history', translation: 'delivery.orderHistory'},
];

const DeliveryAvailablePage = ({history}) => {
  const availableOrdersList = useSelector(state => state.deliveryStore.availableOrdersList);
  const {confirm} = useDialog();
  const dispatch = useDispatch();
  const [state, setState] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
    selected: null,
  });

  const {hasMore, page, limit, selected} = state;
  const {data, loading} = availableOrdersList;

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async (isNext, extraParams = {}, extraState = {}) => {
    const params = {page, limit};
    const res = await dispatch(getAvailableOrdersForDelivery( {...params, ...extraParams}, isNext));
    if (res && res.success) {
      setState(prevState => ({
        ...prevState,
        ...extraState,
      }));
    }
  }

  const getNext = totalPages => {
    if (page < totalPages) {
      const nextPage = page + 1;
      return getOrders(true, {page: nextPage}, {hasMore: true, page: nextPage});
    }
    setState(prevState => ({ ...prevState, hasMore: false }));
  };

  return (
    <div className="delivery-available-page">
      <MobileTopHeader
        title={translate("Доставка заказов", "delivery.orderDelivery")}
        onBack={() => canGoBack(history) ? history.goBack() : history.push('/profile')}
      />

      <div className="container">
        <TabLinks links={TABS} />
      </div>

      <div className="delivery-available-page__content">
        <div className="container">
          {(page === 1 && !data && loading)
            ? <Preloader />
            : (!data || (data && !data.list.length))
              ?  (
                <EmptyInfo
                  label={translate("Нет сободных заказов !!!", "delivery.noFreeOrders")}
                  image={EmptyImage}
                  className="delivery-available-page__empty"
                />
              ) : (
                <div className="delivery-available-page__list">
                  <InfiniteScroll
                    dataLength={Number(data.list.length) || 0}
                    next={() => getNext(data.total_pages)}
                    hasMore={hasMore}
                    loader={null}
                    style={{overflow: 'unset'}}
                  >
                    {data.list.map(item => (
                      <CartCard
                        key={item.id}
                        cart={item}
                        link={`/delivery/receipt/${item.transaction.id}`}
                        showCartID={true}
                        onMenuClick={() => setState(prevState => ({...prevState, selected: item}))}
                        className="delivery-available-page__list-card"
                      />
                    ))}
                  </InfiniteScroll>
                </div>
              )
          }
        </div>
      </div>

      <MobileMenu
        isOpen={!!selected}
        contentLabel={translate("Ещё", "app.more")}
        onRequestClose={() => setState(prevState => ({...prevState, selected: null}))}
      >
        <div className={classnames("delivery-available-page__menu")}>
          {selected && selected.transaction.delivery_info.status === DELIVERY_STATUSES.delivery_status_set_for_delivery && (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Доставить заказ", "delivery.deliver")}
              showArrow={false}
              onClick={async () => {
                try {
                  const receipt = state.selected;
                  setState(prevState => ({...prevState, selected: null}));
                  await confirm({
                    title: "Доставить заказ",
                    description: translate("Вам нужно будет доставить заказ клиенту. Вы уверены?", "dialog.deliver"),
                  });

                  const res = await acceptOrderForDelivery(receipt.transaction.delivery_info.id);
                  res && res.success && history.push(`/delivery/receipt/${receipt.transaction.id}`);
                } catch (e) {}
              }}
            >
              <DeliveryIcon />
            </RowButton>
          )}

          {selected && selected.transaction.delivery_info.status === DELIVERY_STATUSES.delivery_status_taken_for_delivery && (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Отменить доставку", "delivery.cancelDelivery")}
              showArrow={false}
              className="red"
              onClick={async () => {
                try {
                  const receipt = state.selected;
                  setState(prevState => ({...prevState, selected: null}));
                  await confirm({title: 'Заказ будет передан другой курьерской службе\n Вы уверенны ?'});
                  const res = await rejectOrderForDelivery(receipt.transaction.delivery_info.id);
                  res && res.success && history.push(`/delivery/receipt/${receipt.transaction.id}`);
                } catch (e) {}
              }}
            >
              <DeliveryIcon />
            </RowButton>
          )}

          {selected && (
            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate("Посмотреть заказ", "delivery.showOrder")}
              showArrow={false}
              to={`/delivery/receipt/${selected.transaction.id}`}
            >
              <DeliveryCheck />
            </RowButton>
          )}
        </div>
      </MobileMenu>
    </div>
  );
}

export default DeliveryAvailablePage;