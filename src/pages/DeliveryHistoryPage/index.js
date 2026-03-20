import React from 'react';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';
import * as classnames from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import {translate} from '../../locales/locales';
import TabLinks from '../../components/TabLinks';
import Preloader from '../../components/Preloader';
import MobileTopHeader from '../../components/MobileTopHeader';
import {canGoBack} from '../../common/helpers';
import CartCard from '../../components/Cards/CartCard';
import RowButton, {ROW_BUTTON_TYPES} from '../../components/UI/RowButton';
import {DeliveryCheck} from '../../components/UI/Icons';
import MobileMenu from '../../components/MobileMenu';
import EmptyImage from '../../assets/images/delivery_empty.png';
import {DEFAULT_LIMIT} from '../../common/constants';
import {getHistoryOrdersForDelivery} from '../../store/actions/deliveryActions';
import {EmptyInfo} from '../../components/EmptyInfo';
import './index.scss';

const TABS = [
  {label: 'Доступные заказы', path: '/delivery/available', translation: 'delivery.availableOrders'},
  {label: 'История заказов', path: '/delivery/history', translation: 'delivery.orderHistory'},
];

class DeliveryHistoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      hasMore: true,
      selected: null,
    };
  }

  componentDidMount() {
    this.getOrders();
  }

  getOrders = (isNext, extraParams = {}, extraState = {}) => {
    const {page, limit} = this.state;
    const params = {page, limit};
    this.props.getHistoryOrdersForDelivery( {...params, ...extraParams}, isNext).then(res => {
      if (res && res.success) {
        this.setState(prevState => ({
          ...prevState,
          ...extraState,
        }))
      }
    });
  }

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      this.setState(prevState => ({...prevState, page: nextPage}));
      return this.getOrders(true, {page: nextPage}, {hasMore: true, page: nextPage});
    }
    this.setState(prevState => ({ ...prevState, hasMore: false }));
  }

  render() {
    const {hasMore, page, selected} = this.state;
    const {historyOrdersList, history} = this.props;

    const {data, loading} = historyOrdersList;

    return (
      <div className="delivery-history-page">
        <MobileTopHeader
          title={translate("Доставка заказов", "delivery.orderDelivery")}
          onBack={() => canGoBack(history) ? history.goBack() : history.push('/profile')}
        />

        <div className="container">
          <TabLinks links={TABS} />
        </div>

        <div className="delivery-history-page__content">
          <div className="container">
            {(page === 1 && !data && loading)
              ? <Preloader />
              : (!data || (data && !data.list.length))
                ? (
                  <EmptyInfo
                    label={translate("Пока нет истории заказов !!!", "delivery.noYetHistoryOrders")}
                    image={EmptyImage}
                    className="delivery-history-page__empty"
                  />
                ) : (
                  <div className="delivery-history-page__list">
                    <InfiniteScroll
                      dataLength={Number(data.list.length) || 0}
                      next={() => this.getNext(data.total_pages)}
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
                          onMenuClick={() => this.setState(prevState => ({...prevState, selected: item}))}
                          className="delivery-history-page__list-card"
                        />
                      ))}
                    </InfiniteScroll>
                  </div>
                )}
          </div>
        </div>

        <MobileMenu
          isOpen={!!selected}
          contentLabel={translate("Ещё", "app.more")}
          onRequestClose={() => this.setState(prevState => ({...prevState, selected: null}))}
        >
          <div className={classnames("delivery-history-page__menu")}>
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
}

const mapStateToProps = state => ({
  historyOrdersList: state.deliveryStore.historyOrdersList,
})

const mapDispatchToProps = dispatch => ({
  getHistoryOrdersForDelivery: (params, isNext) => dispatch(getHistoryOrdersForDelivery(params, isNext)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DeliveryHistoryPage));