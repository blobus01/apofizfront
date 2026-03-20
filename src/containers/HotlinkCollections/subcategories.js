import React, { Component, useState } from "react";
import { connect } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { getOrgCollectionSubcategories } from "../../store/actions/organizationActions";
import { ButtonWithDescription } from "../../components/UI/ButtonWithDescription";
import { DEFAULT_LIMIT } from "../../common/constants";
import Preloader from "../../components/Preloader";

class CollectionSubcategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
    };
  }

  componentDidMount() {
    this.getSubcategories();
  }

  getSubcategories = (isNext, extraParams = {}, extraState = {}) => {
    const params = { page: this.state.page, limit: this.state.limit };
    this.props
      .getOrgCollectionSubcategories(
        this.props.orgID,
        { ...params, ...extraParams },
        isNext
      )
      .finally(() =>
        this.setState((prevState) => ({ ...prevState, ...extraState }))
      );
  };

  getNext = (totalPages) => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      return this.getItems(
        true,
        { page: nextPage },
        { hasMore: true, page: nextPage }
      );
    }
    this.setState((prevState) => ({ ...prevState, hasMore: false }));
  };

  render() {
    const { page, hasMore } = this.state;
    const { orgCollectionSubcategories, formikBag } = this.props;
    const { data, loading } = orgCollectionSubcategories;
    const { values, setFieldValue } = formikBag;

    return (
      <>
        {page === 1 && !data && loading ? (
          <Preloader />
        ) : !data || (data && !data.list.length) ? (
          <div>Empty</div>
        ) : (
          <InfiniteScroll
            dataLength={Number(data.list.length) || 0}
            next={() => this.getNext(data.total_pages)}
            hasMore={hasMore}
            loader={null}
          >
            <div className="hotlink-collection-form__categories">
              {data.list.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={{
                    ...cat,
                    is_selected: values.selectedSubcategories[cat.id]
                      ? values.selectedSubcategories[cat.id]
                      : cat.is_selected,
                  }}
                  onChange={(value) =>
                    setFieldValue("selectedSubcategories", {
                      ...values.selectedSubcategories,
                      ...value,
                    })
                  }
                />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  orgCollectionSubcategories:
    state.organizationStore.orgCollectionSubcategories,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgCollectionSubcategories: (orgID, params, isNext) =>
    dispatch(getOrgCollectionSubcategories(orgID, params, isNext)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionSubcategories);

const CategoryItem = ({ category, onChange }) => {
  const [selected, setSelected] = useState(category.is_selected);

  const clickHandler = () => {
    const newValue = !selected;
    setSelected(newValue);
    onChange({ [category.id]: newValue });
  };

  return (
    <ButtonWithDescription
      label={category.name}
      description={category.category_name}
      showArrow={false}
      selected={selected}
      onClick={clickHandler}
      className="hotlink-collection-form__category"
    />
  );
};
