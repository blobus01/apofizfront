import React, {useEffect} from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {CategoryOption} from "../../components/CategoryOption";
import {getItemLinkSet, getSelectedPosts} from "../../store/actions/stockActions";
import {useDispatch, useSelector} from "react-redux";

const RelationsView = ({onBack, postID, onAddRelatedItems, onAddLinks}) => {
  const dispatch = useDispatch()

  const selectedPosts = useSelector(state => state.stockStore.selectedPosts.data)
  const links = useSelector(state => state.stockStore.links.data);


  useEffect(() => {
    dispatch(getItemLinkSet(postID))
    dispatch(getSelectedPosts(postID))
  }, [dispatch, postID]);

  return (
    <div>
      <MobileTopHeader
        onBack={onBack}
        title={translate('Добавить связи', 'app.addRelations')}
      />
      <div className="container">
        <p className="relationships-view__desc f-14">
          <b>{translate('Примечание:', 'printer.note')}</b>{' '}
          {translate('Добавляйте ваши товаровы или ссылки на товары из apofiz.com', 'stock.addRelations')}
        </p>
        <CategoryOption
          label={translate('Добавить связи', 'app.addRelations')}
          descPosition="underLabel"
          description={
            selectedPosts.length
              ? translate('Добавлено товаров: ', 'hotlink.addItemsCount', { count: selectedPosts.length })
              : undefined
          }
          onClick={onAddRelatedItems}
          className="view-option"
        />
        <CategoryOption
          label={translate('Добавить ссылку', 'hotlink.addLink')}
          descPosition="underLabel"
          description={links?.length ? translate('Добавлено товаров: ', 'hotlink.addItemsCount', { count: links.length }) : undefined}
          onClick={onAddLinks}
          className="view-option"
        />
      </div>
    </div>
  );
};

export default RelationsView;