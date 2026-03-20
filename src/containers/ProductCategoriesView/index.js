import React, {Component} from 'react';
import {connect} from 'react-redux';
import MobileTopHeader from '../../components/MobileTopHeader';
import Preloader from '../../components/Preloader';
import {CategoryOption} from '../../components/CategoryOption';
import {getPostCategories} from '../../store/actions/postActions';
import {translate} from '../../locales/locales';
import {PURCHASE_TYPES} from "../../common/constants";
import './index.scss';

class ProductCategoriesView extends Component {
  componentDidMount() {
    this.props.getPostCategories({purchase_type: PURCHASE_TYPES.product});
  }

  render() {
    const {postCategories, selectedSubcategory, onSelect, onBack, loadingSavePost} = this.props;
    const {data, loading} = postCategories;
    
    return (
      <div className="product-categories-view">
        <MobileTopHeader
          title={translate('Выберите категорию', 'category.selectCategory')}
          onBack={onBack}
          disabled={loadingSavePost}
          submitLabel={loadingSavePost
            ? translate('Сохранение', 'app.saving')
            : translate('Сохранить', 'app.save')}
        />
        <div className="product-categories-view__content">
          <div className="container">
            {loading && !data && <Preloader className="product-categories-view__preloader" />}
            {!loading && data && data.map(cat => {
              let description = '';
              if (selectedSubcategory && selectedSubcategory.category === cat.id) {
                description = selectedSubcategory.name;
              }
              return (
                <CategoryOption
                  key={cat.id}
                  label={cat.name}
                  icon={cat.icon}
                  onClick={() => onSelect(cat)}
                  description={description}
                  className="product-categories-view__item"
                />
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  postCategories: state.postStore.postCategories,
});

const mapDispatchToProps = dispatch => ({
  getPostCategories: params => dispatch(getPostCategories(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategoriesView);