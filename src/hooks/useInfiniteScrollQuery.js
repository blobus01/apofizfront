import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {DEFAULT_LIMIT} from "@common/constants";

const useInfiniteScrollQuery = (getData, dependencies=[], {onError, limit = DEFAULT_LIMIT}={}) => {
  const page = useRef(1);
  const isMounted = useRef(false);

  const initialQueryData = useMemo(() => ({
    total_pages: 0,
    total_count: 0,
    list: []
  }), [])

  const [queryData, setQueryData] = useState(initialQueryData);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const resetPage = useCallback(() => {
    if (isMounted.current) {
      setHasMore(true)
      setLoading(true)
      setQueryData(initialQueryData)
      page.current = 1
    }
  }, [initialQueryData])

  const next = useCallback(async dependencies => {
    try {
      isFetching.current = true
      const res = await getData({
        params: {page: page.current, limit},
        dependencies
      })
      if (res && res.success) {
        const newData = res.data
        isMounted.current && setQueryData(prevState => ({
          ...newData,
          list: prevState.list.concat(newData.list)
        }))

        if (page.current >= newData.total_pages) {
          setHasMore(false)
        } else {
          page.current = page.current + 1
        }
      } else {
        throw new Error(res?.message)
      }
    } catch (e) {
      onError && onError(e)
      isMounted.current && setError(e.message)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [getData, limit, onError]);

  useEffect(() => {
    isMounted.current = true
    resetPage()
    void next(dependencies)
    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refresh = useCallback(() => {
    resetPage()
    void next(dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data: queryData.list,
    next: () => {
      if (!loading && !isFetching.current) {
        void next(dependencies)
      }
    },
    hasMore,
    loading,
    error,
    refresh,
  }
}

export default useInfiniteScrollQuery