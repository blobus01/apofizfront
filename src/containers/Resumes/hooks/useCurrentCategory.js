import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {notifyQueryResult} from "../../../common/helpers";
import {getPostSubCategories} from "../../../store/actions/postActions";

const useCurrentCategory = categoryID => {
  const dispatch = useDispatch()
  const currentCategory = useSelector(state => state.postStore.postSubCategories)

  useEffect(() => {
    if (categoryID) {
      notifyQueryResult(dispatch(getPostSubCategories(categoryID)))
    }
  }, [categoryID, dispatch]);

  return useMemo(() => ({
    ...currentCategory,
    data: currentCategory.data?.id === categoryID ? currentCategory.data : null,
  }), [categoryID, currentCategory])
};

export default useCurrentCategory;