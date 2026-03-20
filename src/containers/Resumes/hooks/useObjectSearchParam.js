import {useCallback, useMemo} from 'react';
import useSearchParam from "../../../hooks/useSearchParam";

const useObjectSearchParam = (key, defaultValue) => {
  const [searchParam, setSearchParam] = useSearchParam(key, defaultValue)

  const setValue = useCallback(newValue => {
    if (typeof newValue !== 'object') return

    if (newValue === null) return setSearchParam(null)

    setSearchParam(JSON.stringify(newValue))
  }, [setSearchParam]);

  return useMemo(() => {
    let value = searchParam
    try {
      value = JSON.parse(searchParam)
    } catch (e) {
      console.error('Failed to parse "region" search params')
    }
    return [value, setValue]

  }, [searchParam, setValue]);
};

export default useObjectSearchParam;