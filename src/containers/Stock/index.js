import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import Viewer from '../../components/Viewer';
import StockMainView from './StockMainView';
import View from '../../components/Viewer/View';
import FormatView from './FormatView';
import SizesView from './SizesView';
import LinksViews from './LinksViews';
import ProductNumberViews from './ProductNumberViews';

const Stock = ({ onBack, onSubmit, productID, mode }) => {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Viewer
      defaultKey="main"
      viewProps={{
        mode,
        productID,
      }}
    >
      <View
        viewKey="main"
        component={StockMainView}
        props={{
          onSubmit: handleSubmit,
          onBack,
        }}
      />
      <View viewKey="format" component={FormatView} />
      <View viewKey="sizes" component={SizesView} />
      <View viewKey="relationships-selection" component={LinksViews} onBack={open => open('main')} />
      <View viewKey="productNumber" component={ProductNumberViews} onBack={open => open('main')} />
    </Viewer>
  );
};

Stock.propTypes = {
  productID(props, propName) {
    if (props[propName] !== null && typeof props[propName] !== 'number') {
      return new Error(
        'Failed prop type: Stock: prop type `product` is invalid; it must be null or an number but received ' + typeof props[propName]
      );
    }
  },
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  mode: PropTypes.oneOf(['creation', 'editing']),
};

export default Stock;
