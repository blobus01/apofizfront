import React, { useCallback, useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Preloader from '../../../components/Preloader';
import Viewer from '../../../components/Viewer';
import View from '../../../components/Viewer/View';
import { getNotChosenSizes, getSizeCounts } from '../../../store/actions/stockActions';
import AvailableSizesSelectionView from './AvailableSizesSelectionView';
import SizeCountsView from './SizeCountsView';
import SizeCountView from './SizeCountView';

const ProductNumberViews = ({ productID, onBack }) => {
  const dispatch = useDispatch();

  const initialState = useMemo(
    () => ({
      id: null,
      size: null,
      count: '',
    }),
    []
  );

  const [currentSizeCount, setCurrentSizeCount] = useState(initialState);
  const { data: sizeCounts, loading: sizeCountsLoading } = useSelector(state => state.stockStore.sizeCounts);
  const { data: notChosenSizes, loading: notChosenSizesLoading } = useSelector(state => state.stockStore.notChosenSizes);

  const updateData = useCallback(() => {
    setCurrentSizeCount(initialState);
    return Promise.all([
      dispatch(getNotChosenSizes(productID)),
      dispatch(getSizeCounts(productID)).then(res => {
        // if there is no sizes but only count of the product
        if (res.success && res.data[0] && res.data[0].size === null) {
          setCurrentSizeCount(res.data[0]);
        }
      }),
    ]);
  }, [dispatch, productID, initialState]);

  const handleSizeSelectionSubmit = (size, open) => {
    setCurrentSizeCount(prevState => ({ ...prevState, size, count: null }));
    open('count');
  };

  const handleSizeCountSelection = (sizeCount, open) => {
    setCurrentSizeCount(sizeCount);
    open('count');
  };

  useEffect(() => {
    updateData();
  }, [updateData]);

  let selectedView = 'main';

  if (notChosenSizes.length === 0 && ((sizeCounts.length === 1 && sizeCounts[0].size === null) || sizeCounts.length === 0)) {
    selectedView = 'count';
  } else if (notChosenSizes.length !== 0 && sizeCounts.length === 0) {
    selectedView = 'size-selection';
  }

  if (sizeCountsLoading || notChosenSizesLoading) return <Preloader />;

  return (
    <Viewer selectedView={selectedView} viewProps={{ productID }}>
      <View
        viewKey="main"
        component={SizeCountsView}
        props={{ sizeCounts, showAddBtn: notChosenSizes.length !== 0, loading: sizeCountsLoading, onSelect: handleSizeCountSelection }}
        onBack={onBack}
      />
      <View
        viewKey="size-selection"
        component={AvailableSizesSelectionView}
        props={{ onSubmit: handleSizeSelectionSubmit, notChosenSizes, loading: notChosenSizesLoading }}
        onBack={open => (sizeCounts.length === 0 || (sizeCounts.length === 0 && sizeCounts[0].size === null) ? onBack() : open('main'))}
      />
      <View
        viewKey="count"
        component={SizeCountView}
        props={{
          sizeCount: currentSizeCount,
          loading: sizeCountsLoading,
          updateData,
        }}
        onBack={open => {
          if (currentSizeCount.size === null) {
            onBack();
          } else if (currentSizeCount.id === null) {
            open('size-selection');
          } else {
            open('main');
          }
        }}
      />
    </Viewer>
  );
};

export default ProductNumberViews;
