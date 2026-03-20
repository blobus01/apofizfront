import {useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {notifyQueryResult} from "../../../common/helpers";
import {getPostCategories} from "../../../store/actions/postActions";
import {PURCHASE_TYPES} from "../../../common/constants";

const useCategories = () => {
  const dispatch = useDispatch()
  const isFirstMount = useRef(true);
  const resumeCategories = useSelector(state => state.postStore.postCategories)

  useEffect(() => {
    notifyQueryResult(dispatch(getPostCategories({purchase_type: PURCHASE_TYPES.resume})))
    isFirstMount.current = false
  }, [dispatch]);

  return useMemo(() => ({
    loading: resumeCategories.loading || isFirstMount.current,
    data: resumeCategories.data ?? []
  }), [resumeCategories])
};

export default useCategories;