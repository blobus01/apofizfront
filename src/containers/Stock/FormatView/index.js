import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { translate } from '../../../locales/locales';
import { getAvailableSizes, getFormat } from '../../../store/actions/stockActions';

import { CategoryOption } from '../../../components/CategoryOption';
import MobileTopHeader from '../../../components/MobileTopHeader';
import Preloader from '../../../components/Preloader';
import { useSelector } from 'react-redux';

import './index.scss';

const FormatView = ({ open, productID }) => {
  const dispatch = useDispatch();
  const [formats, setFormats] = useState(null);

  const { data: stockDetail, loading: stockDetailLoading } = useSelector(state => state.stockStore.stockDetail);
  const {
    data: availableSizes,
    format: currentFormatName,
    loading: availableSizesLoading,
  } = useSelector(state => state.stockStore.availableSizes);

  useEffect(() => {
    if (stockDetail && stockDetail?.criteria_subcategory) {
      dispatch(getFormat(stockDetail.criteria_subcategory.id)).then(res => setFormats(res));
    }
    dispatch(getAvailableSizes(productID));
  }, [dispatch, stockDetail, productID]);

  return (
    <div className="format-view">
      <MobileTopHeader
        title={translate('Выбор формата', 'stock.formatChoosing')}
        onBack={() => open('main')}
        className="format-view__top-header"
      />
      <div className="container">
        {formats && formats.success && !stockDetailLoading && !availableSizesLoading ? (
          formats.data.map(format => (
            <CategoryOption
              key={format.id}
              label={format.name}
              className="format-view__option"
              descPosition="underLabel"
              description={currentFormatName === format.name ? availableSizes?.map(size => size.size).join(', ') : undefined}
              onClick={() =>
                open('sizes', {
                  props: {
                    format: format,
                  },
                })
              }
            />
          ))
        ) : (
          <Preloader />
        )}
      </div>
    </div>
  );
};

FormatView.propTypes = {};

export default FormatView;
