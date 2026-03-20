import React, { useEffect, useState } from "react";
import * as classnames from "classnames";
import CartItemCounterCard from "../Cards/CartItemCounterCard";
import { translate } from "../../locales/locales";
import { inTimeRange, prettyFloatMoney } from "../../common/utils";
import { ButtonWithContent } from "../UI/Buttons";
import { calculateTotalPrice } from "../../pages/CartDetailPage";
import { changeItemCountInReceipt } from "../../store/services/receiptServices";
import RoundLink from "../UI/RoundLink";
import useDialog from "../UI/Dialog/useDialog";
import Notify from "../Notification";
import "./index.scss";

import axios from "axios-api";

const CartControl = ({
  data,
  updateData,
  currency,
  onCheckout,
  onLastItemRemove,
  updateOnItemRemove,
  className,
}) => {
  const [cart, setCart] = useState(data);

  const { alert, confirm } = useDialog();

  const onIncrement = (count, item) => {
    cart &&
      setCart({
        ...cart,
        items: cart.items.map((i) => (i.id !== item.id ? i : { ...i, count })),
      });
  };

  const onDecrement = (count, item) => {
    if (cart) {
      const minimumPurchase = item.item.minimum_purchase;
      const minimumCount =
        cart.organization.is_wholesale && typeof minimumPurchase === "number"
          ? minimumPurchase
          : 1;

      if (minimumCount > count) {
        const confirmTitle = translate("Удалить", "app.delete");
        const cancelTitle = translate("Отмена", "app.cancellation");

        if (minimumCount > 1) {
          Notify.info({
            text: translate(
              "Минимальное количество для покупки продукта: {count}",
              "dialog.minimumCount",
              {
                count: minimumCount,
              },
            ),
          });
        }

        confirm({
          title: translate("Удаление", "app.deletion"),
          description: translate(
            "Вы действительно хотите удалить товар?",
            "dialog.deleteProduct",
          ),
          confirmTitle: (
            <span className="cart-item-counter-card__confirm-title">
              {confirmTitle}
            </span>
          ),
          cancelTitle: (
            <span className="cart-item-counter-card__cancel-title">
              {cancelTitle}
            </span>
          ),
        }).then(() => onRemove(item.id));
      } else {
        setCart({
          ...cart,
          items: cart.items.map((i) =>
            i.id !== item.id ? i : { ...i, count },
          ),
        });
      }
    }
  };

  const onChange = (count, item) => {
    if (count === 0) {
      setCart({
        ...cart,
        items: cart.items.map((i) =>
          i.id !== item.id ? i : { ...i, count: 1 },
        ),
      });
    } else {
      setCart({
        ...cart,
        items: cart.items.map((i) => (i.id !== item.id ? i : { ...i, count })),
      });
    }
  };

  const onRemove = (id) => {
    if (cart) {
      if (cart.items.length <= 1) {
        onLastItemRemove();
      } else {
        const updatedCart = {
          ...cart,
          items: cart.items.filter((i) => i.id !== id),
        };
        setCart(updatedCart);
        if (updateOnItemRemove) {
          changeItemCountInReceipt(cart.id, {
            items: updatedCart.items.map((i) => ({
              item: i.item.id,
              count: i.count,
              size: i.size?.id,
            })),
          });
        }
      }
    }
  };

  const [backEndData, setBackEndData] = useState();

  console.log(cart, "cart");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/opening-hours/?organization=${cart?.organization.id}`,
        );

        setBackEndData(response.data.list || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [cart?.organization.id]);

  const checkIsOpen = () => {
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday, 1 = Monday ...

    // приводим к твоему формату (1-7)
    const normalizedDay = today === 0 ? 7 : today;

    if (backEndData?.length) {
      const todayData = backEndData.find(
        (d) => d.day_of_week === normalizedDay,
      );

      if (!todayData) return true; // если нет данных — считаем открытым

      if (todayData.is_closed) return false;

      return inTimeRange(todayData.opens_at, todayData.closes_at);
    }

    // fallback если нет backEndData
    return inTimeRange(cart.organization.opens_at, cart.organization.closes_at);
  };

  return (
    <>
      <div className={classnames("cart-control", className)}>
        <RoundLink
          to={`/organizations/${cart.organization.id}`}
          label={translate("Добавить товар в корзину", "shop.addItemToCard")}
          className="cart-control__add"
        />
        {cart.items.map((item) => (
          <CartItemCounterCard
            key={item.id}
            item={item}
            currency={currency}
            organization={cart.organization}
            onIncrement={(count) => onIncrement(count, item)}
            onDecrement={(count) => onDecrement(count, item)}
            onChange={(count) => onChange(count, item)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      <ButtonWithContent
        type="button"
        label={translate("Оформить заказ", "shop.makeOrder")}
        className="cart-detail-page__buy"
        radiusOrg={true}
        position={true}
        onClick={async () => {
          const { organization } = cart;

          const res = await changeItemCountInReceipt(cart.id, {
            items: cart.items.map((i) => ({
              item: i.item.id,
              count: i.count,
              size: i.size?.id ?? null,
            })),
          });

          if (res.status === 400) {
            await alert({
              title: translate("Нет в наличии", "app.notAvailable"),
              description: translate(
                "Товара нет в наличии",
                "shop.productIsNotAvailable",
              ),
            });
            return updateData();
          }

          if (!checkIsOpen()) {
            await alert({
              title: translate(
                "Организация закрыта, Ваш заказ будет обработан в рабочее время",
                "dialog.orgClosed",
              ),
            });
          }

          res && res.success && onCheckout(cart);
        }}
      >
        <span className="cart-detail-page__total f-15 f-500">
          {prettyFloatMoney(
            calculateTotalPrice(cart),
            false,
            cart.organization.currency,
          )}
        </span>
      </ButtonWithContent>
    </>
  );
};

export default CartControl;
