import React from 'react';
import { CategoryOption } from '../../../../components/CategoryOption';
import MobileTopHeader from '../../../../components/MobileTopHeader';
import Preloader from '../../../../components/Preloader';
import { translate } from '../../../../locales/locales';

import './index.scss';

const RelationshipsView = ({ open, onSubmit, isSubmitting, links, selectedPosts, onBack, loading }) => {
  const handleSubmit = async () => {
    try {
      await onSubmit();
      onBack();
    } catch (error) {
      console.log('🚀 ~ file: index.js ~ line 14 ~ handleSubmit ~ error', error);
    }
  };

  return (
    <div className="relationships-view">
      <MobileTopHeader
        title={translate('Связи с товаром', 'stock.productRelations')}
        onBack={handleSubmit}
        disabled={isSubmitting}
        className="relationships-view__top-header"
        nextLabel={translate('Готово', 'app.done')}
        onNext={handleSubmit}
      />
      {!links || loading ? (
        <Preloader />
      ) : (
        <div className="container containerMax">
          <p className="relationships-view__desc f-14">
            <b>{translate('Примечание:', 'printer.note')}</b>{' '}
            {translate('Добавляйте ваши товаровы или ссылки на товары из apofiz.com', 'stock.addRelations')}
          </p>
          <CategoryOption
            label={translate('Добавить из товаров', 'hotlink.addItems')}
            descPosition="underLabel"
            description={
              selectedPosts.length !== 0
                ? translate('Добавлено товаров: ', 'hotlink.addItemsCount', { count: selectedPosts.length })
                : undefined
            }
            onClick={() => open('products-view')}
            className="view-option"
          />
          <CategoryOption
            label={translate('Добавить ссылку на товар', 'hotlink.addLinks')}
            descPosition="underLabel"
            description={links?.length ? translate('Добавлено товаров: ', 'hotlink.addItemsCount', { count: links.length }) : undefined}
            onClick={() => open('links-view')}
            className="view-option"
          />
        </div>
      )}
    </div>
  );
};
export default RelationshipsView;
