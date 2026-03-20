import React from 'react';
import { useState } from 'react';
import MobileTopHeader from '../../../../components/MobileTopHeader';
import Preloader from '../../../../components/Preloader';
import { SubCategoryOption } from '../../../../components/SubCategoryOption';
import { translate } from '../../../../locales/locales';

import './index.scss';

const AvailableSizesSelectionView = ({ onSubmit, open, onBack, notChosenSizes, loading }) => {
  const [selected, setSelected] = useState(null);
  return (
    <div className="size-selection-view">
      <MobileTopHeader
        title={translate('На складе', 'stock.inStock')}
        onBack={onBack}
        onNext={
          selected
            ? () => {
                onSubmit(
                  notChosenSizes.find(size => size.id === selected),
                  open
                );
              }
            : undefined
        }
        className="size-selection-view__top-header"
      />
      <div className="container">
        {loading ? (
          <Preloader />
        ) : (
          notChosenSizes.map(size => (
            <SubCategoryOption
              key={size.id}
              option={size}
              label={size.size}
              onClick={() => setSelected(size.id)}
              isActive={size.id === selected}
              className="sizes-view__option"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AvailableSizesSelectionView;
