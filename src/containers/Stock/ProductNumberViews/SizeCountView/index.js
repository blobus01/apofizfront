import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { CategoryOption } from '../../../../components/CategoryOption';
import { InputTextField } from '../../../../components/UI/InputTextField';
import MobileTopHeader from '../../../../components/MobileTopHeader';
import { translate } from '../../../../locales/locales';
import './index.scss';
import { validateForNumber } from '../../../../common/helpers';
import { useDispatch } from 'react-redux';
import { deleteSizeCount as deleteSizeCountAction, updateSizeCount } from '../../../../store/actions/stockActions';
import useDialog from '../../../../components/UI/Dialog/useDialog';
import Preloader from '../../../../components/Preloader';
import Button from '../../../../components/UI/Button';

const SizeCountView = ({ onBack, productID, sizeCount: data, updateData, loading, open }) => {
  const dispatch = useDispatch();

  const { confirm } = useDialog();

  const stockDetail = useSelector(state => state.stockStore.stockDetail.data);

  const [sizeCount, setSizeCount] = useState(data);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { isValid, isEmpty, value } = validateForNumber(e.target.value, { isFloat: false, min: 0, max: 1000000000 });
    if (isValid || isEmpty) {
      setSizeCount(prevState => ({ ...prevState, count: value }));
    }
  };

  const deleteSizeCount = async () => {
    try {
      await confirm({
        title: translate('Удалить размер', 'stock.deleteSizeCount'),
        description: (
          <>
            {translate('Вы удаляете размер, который привязан к количеству данного товара.', 'stock.deletingSizeCount')} <br />
            {translate('Вы уверены', 'app.areYouSure') + '?'}
          </>
        ),
        confirmTitle: translate('Да', 'app.yes'),
        cancelTitle: translate('Отмена', 'app.cancellation'),
      });
      if (sizeCount.id) {
        const res = await dispatch(deleteSizeCountAction(sizeCount.id));
        if (res?.success) {
          await updateData();
          open('main');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { success } = await dispatch(
      updateSizeCount(productID, {
        size: sizeCount.size ? sizeCount.size.id : undefined,
        count: Number(sizeCount.count),
      })
    );
    setIsSubmitting(false);
    if (success) {
      await updateData();
      onBack();
    }
  };

  return (
    <div className="size-count-view">
      <MobileTopHeader
        onBack={onBack}
        onNext={!!sizeCount.count ? handleSubmit : undefined}
        disabled={isSubmitting}
        nextLabel={translate('Готово', 'app.done')}
        title={translate('На складе', 'stock.inStock')}
        className="size-count-view__top-header"
      />
      {loading ? (
        <Preloader />
      ) : (
        <div className="container">
          {sizeCount.size && (
            <CategoryOption
              label={translate('Размеры товара', 'stock.productSizes')}
              icon={stockDetail.criteria_subcategory.icon}
              description={sizeCount.size.size}
              descPosition="underLabel"
              className="size-count-view__category-option"
            />
          )}

          <InputTextField
            label={translate('Количество на складе', 'stock.quantityInStock')}
            value={sizeCount.count}
            onChange={handleChange}
          />

          {/* check if sizeCount already have been created  */}
          {sizeCount.id && sizeCount.size && (
            <Button
              onClick={deleteSizeCount}
              label={translate('Удалить размер', 'stock.deleteSizeCount')}
              className="size-count-view__delete-btn button-danger"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SizeCountView;
