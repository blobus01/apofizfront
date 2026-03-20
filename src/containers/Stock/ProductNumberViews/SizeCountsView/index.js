import React from 'react';

import { translate } from '../../../../locales/locales';

import addSizeCountIcon from '../../../../assets/images/add_size_count.svg';

import { CategoryOption } from '../../../../components/CategoryOption';
import RowButton from '../../../../components/UI/RowButton';

import MobileTopHeader from '../../../../components/MobileTopHeader';

import Preloader from '../../../../components/Preloader';
import './index.scss';

const SizeCountsView = ({ open, sizeCounts, showAddBtn, onSelect, loading, onBack }) => {
  return (
    <div className="size-counts-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate('Количество на складе', 'stock.quantityInStock')}
        className="size-counts-view__top-header"
      />
      {loading && sizeCounts ? (
        <Preloader />
      ) : (
        <div className="container">
          {showAddBtn && (
            <RowButton
              onClick={() => open('size-selection')}
              endIcon={<img src={addSizeCountIcon} alt="add size count" />}
              className="size-counts-view__add-button f-17"
            >
              {translate('Добавить на склад', 'stock.addToStock')}
            </RowButton>
          )}

          <div className="size-counts-view__options-list">
            {sizeCounts.map(sizeCount => {
              return (
                <CategoryOption
                  label={sizeCount.size?.size}
                  descPosition="nearIcon"
                  description={sizeCount ? `${sizeCount.count} ${translate('ед.', 'stock.countUnit')}` : undefined}
                  className="size-counts-view__option"
                  onClick={() => onSelect(sizeCount, open)}
                  key={sizeCount.id}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeCountsView;
