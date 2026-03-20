import React, {useEffect, useRef} from 'react';
import * as classnames from 'classnames';
import {Link} from 'react-router-dom';
import {prettyFloatMoney} from '../../../common/utils';
import OrgAvatar from '../../UI/OrgAvatar';
import {translate} from "../../../locales/locales";
import useDialog from "../../UI/Dialog/useDialog";

import './index.scss';

const CartItemCounterCard = ({item, currency, organization, onIncrement, onDecrement, onRemove, onChange, disableDecrement=false, disabled, canDelete=true, className}) => {
  const inputRef = useRef();
  const spanRef = useRef();

  const {alert} = useDialog()

  const {id, image, name, price, discounted_price} = item.item;
  const {size, count, quantity_in_stock} = item

  const hasDiscount = !!discounted_price && (discounted_price !== price);
  const discountPrice = Number(discounted_price) || 0;

  const totalDiscountedPrice = discountPrice * count;
  const totalOriginalPrice = price * count;

  useEffect(() => {
    updateResizableInput(count);
  }, [count]);

  const isAllowedCount = count => quantity_in_stock === null || count <= quantity_in_stock

  const handleChange = e => {
    const value = isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value);
    if (value === 0 || (value && value > 0 && value < 10000000 && isAllowedCount(value))) {
      onChange(value);
    }
  };

  const handleIncrement = () => {
    if (!isAllowedCount(count + 1)) {
      return alert({
        title: translate('Внимание!', 'app.attention'),
        description: translate(`Кол-во товаров на складе: ${count}`, 'stock.quantityInStockAlert', { count }),
        confirmTitle: translate('Закрыть', 'app.close')
      })
    }
    const value = count + 1;
    onIncrement(value);
  };

  const handleDecrement = () => {
    const value = count - 1;
    onDecrement(value);
  };

  const updateResizableInput = value => {
    spanRef.current.innerHTML = `${value}`.replace(/\s/g, '&nbsp;');
    inputRef.current.style.width = spanRef.current.offsetWidth + 'px';
  };

  return (
    <div className={classnames("cart-item-counter-card", className)}>
      <Link to={`/p/${id}${organization ? `?ref=${organization.id}` : ''}`} className="cart-item-counter-card__top">
        <OrgAvatar
          src={image && image.medium}
          alt={name}
          size={60}
          className="cart-item-counter-card__avatar"
        />
        <div className="cart-item-counter-card__content">
          <h6 className="cart-item-counter-card__title f-14 f-400">{name}</h6>
          <p className="cart-item-counter-card__discount f-16 f-600 tl">{hasDiscount ? prettyFloatMoney(totalDiscountedPrice, false, currency) : prettyFloatMoney(totalOriginalPrice, false, currency)}</p>
          {hasDiscount && <p className="cart-item-counter-card__price f-14 f-400 tl">{prettyFloatMoney(totalOriginalPrice, false, currency)}</p>}
          {size && item.has_in_stock && (
            <div className="cart-item-counter-card__size f-16">
              {translate('Размер', 'app.size') + ': '} {size.size}
            </div>
          )}
          {!item.has_in_stock && (
            <div className="cart-item-counter-card__not-available f-16">
              {translate('Нет в наличии', 'app.notAvailable')}
            </div>
          )}
        </div>
      </Link>

      <div className="cart-item-counter-card__bottom row">
        {!disabled && canDelete ? (
          <button
            type="button"
            className="cart-item-counter-card__remove f-14 f-400"
            onClick={onRemove}
            disabled={disabled}
          >
            {translate("Удалить", "app.delete")}
          </button>
        ) : <div />}

        <div className="cart-item-counter-card__counter">
          <button type="button" onClick={handleDecrement} disabled={disabled || disableDecrement}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.1423 7.42871H8.57087H7.42801H2.85658C2.54099 7.42871 2.28516 7.68455 2.28516 8.00014C2.28516 8.31573 2.54099 8.57157 2.85658 8.57157H7.42801H8.57087H13.1423C13.4579 8.57157 13.7137 8.31573 13.7137 8.00014C13.7137 7.68455 13.4579 7.42871 13.1423 7.42871Z" fill="#3F8AE0"/>
            </svg>
          </button>
          <div className="cart-item-counter-card__counter-count">
            <input type="text" name={id} value={count} onChange={handleChange} disabled={disabled} className="cart-item-counter-card__counter-input f-15 f-600" ref={inputRef} />
            <span ref={spanRef} />
          </div>
          <button type="button" onClick={handleIncrement} disabled={disabled}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00003 2C8.33138 2 8.6 2.26862 8.6 2.59997L8.6 7.4L13.4 7.40003C13.7314 7.40003 14 7.66865 14 8C14 8.33135 13.7314 8.59997 13.4 8.59997L8.6 8.59933L8.6 13.4001C8.6 13.7314 8.33138 14.0001 8.00003 14.0001C7.66867 14.0001 7.40005 13.7314 7.40005 13.4001L7.4 8.59933L2.59997 8.59997C2.26861 8.59997 2 8.33135 2 8C2 7.66865 2.26861 7.40003 2.59997 7.40003L7.4 7.4L7.40005 2.59997C7.40005 2.26862 7.66867 2 8.00003 2Z" fill="#4285F4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCounterCard;