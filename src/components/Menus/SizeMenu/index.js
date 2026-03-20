import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './index.scss';

const SizeMenu = ({ sizes, onSelect, minimumPurchase, onClose }) => {
  const handleSelect = sizeID => {
    onSelect({ size: sizeID });
    onClose();
  };

  return (
    <div className="size-menu">
      {sizes.map(size => {
        const disabled = size.count === 0 || (
          size.count !== null &&
          typeof minimumPurchase === 'number' &&
          size.count < minimumPurchase
        );

        return (
          <div
            onClick={() => !disabled && handleSelect(size.id)}
            className={classNames('size-menu__item', disabled ? 'size-menu__item_disabled' : null)}
            key={size.id}
          >
            {size.size}
          </div>
        );
      })}
    </div>
  );
};

SizeMenu.propTypes = {
  sizes: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};

export default SizeMenu;
