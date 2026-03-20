import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getOrganizationDetail} from "../../store/services/organizationServices";

export const useOrganizationDetail = (id, {onError} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const errorHandlerCallbackRef = useRef(onError);

  const set = useCallback(setStateAction => {
    setData(setStateAction)
  }, []);

  useEffect(() => {
    if (id) {
      setFetching(true)
      setError(null)
      getOrganizationDetail(id)
        .then((res => {
          if (res.success) {
            setData(res.data)
          } else {
            setError(res.error)
            errorHandlerCallbackRef.current && errorHandlerCallbackRef.current(res.error)
          }
        }))
        .finally(() => {
          setFetching(false)
          setLoading(false)
        })
    }
  }, [id]);

  return useMemo(() => ({loading, fetching, data, set, error}), [loading, fetching, data, set, error])
}