import React, {Component} from 'react';
import {withRouter} from 'react-router';
import MobileTopHeader from '../../components/MobileTopHeader';
import {ButtonOption} from '../../components/UI/ButtonOption';
import {translate} from '../../locales/locales';
import OrganizationCard from '../../components/Cards/OrganizationCard';
import UserCard from '../../components/Cards/UserCard';
import Button from '../../components/UI/Button';
import PaidByOrganizationImage from '../../assets/images/delivery_by_organization.png';
import PaidByClientImage from '../../assets/images/delivery_by_client.png';
import {setShowPaysForDelivery} from '../../store/services/cartServices';
import {WHO_PAYS_DELIVERY_OPTIONS} from '../../common/constants';
import './index.scss';

class CourierDeliveryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paidBy: WHO_PAYS_DELIVERY_OPTIONS.organization,
      loading: false,
      isComplete: false,
    }
  }

  render() {
    const {paidBy, loading, isComplete} = this.state;
    const {onBack, receipt, onComplete, history} = this.props;
    const {organization, client} = receipt;

    return (
      <div className="courier-delivery-view">
        {!isComplete ? (
          <>
            <MobileTopHeader
              onBack={onBack}
              title={translate("Доставить с курьером", "delivery.deliverByCourier")}
            />
            <div className="courier-delivery-view__content">
              <div className="container">
                <h1 className="courier-delivery-view__title f-16 f-600">{translate("Кто оплачивает доставку", "delivery.whoPays")}</h1>
                <div className="courier-delivery-view__options">
                  {Object.keys(WHO_PAYS_DELIVERY_OPTIONS).map(key => (
                    <ButtonOption
                      key={key}
                      label={translate(key, `delivery.paidBy_${key}`)}
                      checked={paidBy === key}
                      value="hello"
                      onClick={() => !loading && this.setState(prevState => ({...prevState, paidBy: key}))}
                      className="courier-delivery-view__option"
                    />
                  ))}
                </div>

                {paidBy && (
                  <div className="courier-delivery-view__info">
                    {paidBy === WHO_PAYS_DELIVERY_OPTIONS.organization && (
                      <div className={`courier-delivery-view__info-${WHO_PAYS_DELIVERY_OPTIONS.organization}`}>
                        <OrganizationCard
                          id={organization.id}
                          title={organization.title}
                          image={organization.image && organization.image.medium}
                          type={organization.types[0].title}
                          description={organization.address}
                          size={72}
                        />
                        <h5 className="f-15 f-500">{translate("Для клиента бесплатная доставка !!!", "delivery.text0")}</h5>
                        <p className="text">{translate("Данный тип доставки, повысит количество онлайн покупок в вашей организации, и обязательно будет учтен при выборе следующих покупок с стороны покупателей.", "delivery.text1")}</p>
                        <p className="text">{translate("Бесплатная доставка в настоящее время весьма распространена в качестве некоторого маркетингового хода для увеличения продаж.", "delivery.text2")}</p>
                        <p className="text">{translate("Для успешных продаж бесплатная доставка — необходимость и конкурентное преимущество.", "delivery.text3")}</p>
                      </div>
                    )}

                    {paidBy === WHO_PAYS_DELIVERY_OPTIONS.client && (
                      <div className={`courier-delivery-view__info-${WHO_PAYS_DELIVERY_OPTIONS.client}`}>
                        <UserCard
                          avatar={client.avatar}
                          fullname={client.full_name}
                          description={translate("Клиент", "delivery.client")}
                          withBorder
                        />
                        <h5 className="f-15 f-500">{translate("Клиент оплачивает доставку заказа сам.", "delivery.text4")}</h5>
                        <p className="text">{translate("Платный способ доставки дает практически те же преимущества, что и бесплатная доставка.", "delivery.text5")}</p>
                        <p className="text">{translate("Удобство и простота платной доставки экономит главный ресурс, время. Клиенту нет необходимости добираться до пункта получения заказа, курьер доставит и вручит заказ клиенту в руки.", "delivery.text6")}</p>
                        <p className="text">{translate("Покупатель точно знает, сколько ему оплатить за доставку, при получении заказа.", "delivery.text7")}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  label={translate("Оформить доставку", "delivery.makeDelivery")}
                  className="courier-delivery-view__deliver-btn"
                  disabled={loading}
                  onClick={() => {
                    this.setState(prevState => ({...prevState, loading: true}));
                    setShowPaysForDelivery(receipt.cart.id, {who_pays: this.state.paidBy}).then(res => {
                      if (res && res.success) {
                        onComplete && onComplete();
                        return this.setState(prevState => ({...prevState, loading: false, isComplete: true}));
                      }
                      this.setState(prevState => ({...prevState, loading: false}));
                    })
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="container">
            <div className="courier-delivery-view__complete">
              {paidBy === WHO_PAYS_DELIVERY_OPTIONS.client && (
                <div className={WHO_PAYS_DELIVERY_OPTIONS.client}>
                  <h5 className="f-16 f-500">{translate("Клиент оплачивает доставку заказа сам.", "delivery.text4")}</h5>
                  <img src={PaidByOrganizationImage} alt="organization paid"/>
                  <p className="f-16 f-500">{translate("Отличный выбор, ваш заказ отправлен в курьерскую службу. С вами свяжутся по доставке заказа.", "delivery.text8")}</p>
                </div>
              )}
              {paidBy === WHO_PAYS_DELIVERY_OPTIONS.organization && (
                <div className={WHO_PAYS_DELIVERY_OPTIONS.organization}>
                  <h5 className="f-16 f-500">{translate("Для клиента бесплатная доставка !!!", "delivery.text0")}</h5>
                  <img src={PaidByClientImage} alt="client paid"/>
                  <p className="f-16 f-500">{translate("Хороший выбор, ваш заказ отправлен в курьерскую службу. С вами свяжутся по доставке заказа.", "delivery.text9")}</p>
                </div>
              )}
              <Button
                label={translate("Вернуться к заказам", "delivery.returnToOrders")}
                onClick={() => {
                  onBack();
                  history.push(`/organizations/${receipt.organization.id}/receipts-sales`);
                }}
                className="courier-delivery-view__complete-button"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(CourierDeliveryView);