import React, {useEffect} from 'react';
import PropTypes from "prop-types";
import {PURCHASE_TYPES} from "../../common/constants";
import PostCategoriesView from "../../views/PostCategoriesView";
import {useDispatch, useSelector} from "react-redux";
import {notifyQueryResult} from "../../common/helpers";
import {getPostCategories} from "../../store/actions/postActions";
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const PostCategories = ({purchaseType, ...rest}) => {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.postStore.postCategories)

  const params = useParams()

  console.log(params)

  useEffect(() => {
    notifyQueryResult(dispatch(getPostCategories({purchase_type: purchaseType, item_id: params.postID})))
  }, [dispatch, purchaseType]);

  const {data, loading} = categories

  return (
    <PostCategoriesView
      loading={loading}
      categories={data ?? []}
      {...rest}
    />
  );
};

PostCategories.propTypes = {
  purchaseType: PropTypes.oneOf(Object.values(PURCHASE_TYPES))
}

export default PostCategories;