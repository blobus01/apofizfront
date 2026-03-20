import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MobileTopHeader from '../../../components/MobileTopHeader';
import { translate } from '../../../locales/locales';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addAvailableSizes, getFormatSizes, setAvailableSizes } from '../../../store/actions/stockActions';
import Preloader from '../../../components/Preloader';
import { SubCategoryOption } from '../../../components/SubCategoryOption';
import useDialog from '../../../components/UI/Dialog/useDialog';

import './index.scss';

const SizesView = ({ format, open, productID }) => {
  const dispatch = useDispatch();

  const { confirm } = useDialog();

  const {
    data: storeSelectedSizes,
    format: currentFormatName,
    loading: availableSizesLoading,
  } = useSelector(state => state.stockStore.availableSizes);

  const [sizes, setSizes] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState(
    storeSelectedSizes?.filter(s => s.format_criteria === format.name).map(s => s.id) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getFormatSizes(format.id)).then(res => setSizes(res.data));
  }, [dispatch, format]);

  const handleOptionClick = size => {
    if (!size) return;

    const isSelected = selectedSizes.findIndex(id => id === size.id);

    if (isSelected !== -1) {
      setSelectedSizes(prevSizes => prevSizes.filter(s => s !== size.id));
      return;
    }
    setSelectedSizes([...selectedSizes, size.id]);
  };

  const handleSubmit = async () => {
    try {
      if (isChangingFormat(format)) {
        await confirm({
          title: translate('Изменить формат', 'stock.changeFormat'),
          description: (
            <span>
              {translate(
                'Если вы измените формат, склад и выбранный формат будет очищен, все количество товаров будет удаленно',
                'stock.formatChangeDialogDesc'
              )}
              <br />
              {translate('Вы уверены', 'app.youSure') + '?'}
            </span>
          ),
          confirmTitle: translate('Да', 'app.yes'),
          cancelTitle: translate('Отмена', 'app.cancellation'),
        });
      }
      setIsSubmitting(true);
      const res = await dispatch(addAvailableSizes(productID, { available_sizes: selectedSizes }));
      setIsSubmitting(false);
      if (res.success) {
        dispatch(setAvailableSizes(sizes.filter(size => selectedSizes.find(id => size.id === id))));
        open('main');
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js ~ line 75 ~ handleSubmit ~ error', error);
    }
  };

  function isChangingFormat(format) {
    if (currentFormatName === null) return false;
    return format.name !== currentFormatName;
  }

  return (
    <div className="sizes-view">
      <MobileTopHeader
        title={format?.name}
        onBack={() => open('format')}
        onNext={
          (storeSelectedSizes.length !== 0 || selectedSizes.length !== 0) && (!isChangingFormat(format) || selectedSizes.length !== 0)
            ? handleSubmit
            : null
        }
        nextLabel={translate('Готово', 'app.done')}
        disabled={isSubmitting}
        className="sizes-view__top-header"
      />
      <div className="container">
        {sizes && !availableSizesLoading ? (
          sizes.map(size => (
            <SubCategoryOption
              key={size.id}
              option={size}
              label={size.size}
              isActive={!!selectedSizes.find(selectedSize => selectedSize === size.id)}
              onClick={() => handleOptionClick(size)}
              className="sizes-view__option"
            />
          ))
        ) : (
          <Preloader />
        )}
      </div>
    </div>
  );
};

SizesView.propTypes = {
  format: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  viewerBag: PropTypes.shape({
    open: PropTypes.func,
  }),
};

export default SizesView;
