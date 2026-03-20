import React, { useEffect } from 'react';
import Viewer from '../../../components/Viewer';
import View from '../../../components/Viewer/View';
import LinksView from './LinksView';
import RelationshipsView from './RelationshipsView';
import PostsView from './PostsView';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { addRelatedPosts, addShopItemsLinks, getItemLinkSet, getSelectedPosts, setItemLinks } from '../../../store/actions/stockActions';
import { useCallback } from 'react';

const LinksViews = ({ onBack, productID }) => {
  const dispatch = useDispatch();

  const linksLoading = useSelector(state => state.stockStore.links.loading);
  const selectedPostsLoading = useSelector(state => state.stockStore.organization.loading);

  const [links, setLinks] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getItemLinkSet(productID)).then(({ data, success }) => {
      if (success) {
        setLinks(data);
      }
    });
    dispatch(getSelectedPosts(productID)).then(({ data, success }) => {
      if (success) {
        setSelectedPosts(data);
      }
    });
  }, [dispatch, productID]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const res = await Promise.all([
        dispatch(addRelatedPosts(productID, { shop_items_set: selectedPosts })),
        dispatch(
          addShopItemsLinks(productID, {
            shop_items_link_set: links.map(linkItem => linkItem.link),
          })
        ),
      ]);
      dispatch(setItemLinks(links));

      setIsSubmitting(false);
      return res;
    } catch (e) {
      setIsSubmitting(false);
      console.log(e);
      return null;
    }
  }, [dispatch, links, selectedPosts, productID]);

  const loading = linksLoading || selectedPostsLoading;

  return (
    <Viewer defaultKey={'main'} viewProps={{ productID }}>
      <View
        viewKey="main"
        component={RelationshipsView}
        props={{
          links,
          selectedPosts,
          onBack,
          loading,
          onSubmit: handleSubmit,
          isSubmitting,
        }}
      />
      <View
        viewKey="links-view"
        component={LinksView}
        props={{
          links,
          setLinks,
        }}
        onBack={open => open('main')}
      />
      <View
        viewKey="products-view"
        component={PostsView}
        props={{
          selectedPosts,
          setSelectedPosts,
        }}
        onBack={open => open('main')}
      />
    </Viewer>
  );
};

LinksViews.propTypes = {};

export default LinksViews;
