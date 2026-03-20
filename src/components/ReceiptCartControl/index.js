import React, {useState} from 'react';
import * as classnames from 'classnames';
import CartItemCounterCard from '../Cards/CartItemCounterCard';
import './index.scss';

const ReceiptCartControl = ({data, currency, onUpdate, disabled, canDelete=true, className}) => {
  const [cart, setCart] = useState(data);

  const updateCart = updatedItems => {
    if (cart) {
      const calculatedCart = {
        ...cart,
        items: updatedItems,
        totals: {
          discounted_price: updatedItems.reduce((sum, i) => {
            sum += i.item.discounted_price * i.count;
            return sum;
          }, 0),
          original_price: updatedItems.reduce((sum, i) => {
            sum += i.item.price * i.count;
            return sum;
          }, 0)
        }
      };

      setCart(calculatedCart);
      onUpdate(calculatedCart);
    }
  };

  const onIncrement = (count, item) => {
    if (cart) {
      const items = cart.items.map(i => i.id !== item.id ? i : ({...i, count}));
      updateCart(items);
    }
  };

  const onDecrement = (count, item) => {
    if (cart) {
      if (count <= 0) {
        updateCart([]);
      } else {
        const items = cart.items.map(i => i.id !== item.id ? i : ({...i, count}));
        updateCart(items);
      }
    }
  };

  const onChange = (count, item) => {
    if (cart) {
      let items;
      if (count === 0) {
        items = cart.items.map(i => i.id !== item.id ? i : ({...i, count: 1}));
      } else {
        items = cart.items.map(i => i.id !== item.id ? i : ({...i, count}));
      }
      updateCart(items);
    }
  };

  const onRemove = id => {
    if (cart) {
      if (cart.items.length <= 1) {
        updateCart([]);
      } else {
        const items = cart.items.filter(i => i.id !== id);
        updateCart(items);
      }
    }
  };

  const {items} = cart;
  return (
    <div className={classnames("receipt-cart-control", className)}>
      {items.map(item => (
        <CartItemCounterCard
          key={item.id}
          item={item}
          currency={currency}
          organization={cart.organization}
          disabled={disabled}
          onIncrement={count => onIncrement(count, item)}
          onDecrement={count => onDecrement(count, item)}
          onChange={count => onChange(count, item)}
          onRemove={() => onRemove(item.id)}
          disableDecrement={item.count <= 1}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
};

export default ReceiptCartControl;