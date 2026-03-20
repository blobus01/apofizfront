import {useCallback, useMemo, useRef} from 'react';
import {useHistory, useLocation} from "react-router-dom";

const defaultOptions = {
  replace: true
}

/**
 * @param {string} key
 * @param [defaultValue]
 * @param {Object=} options
 * @param {Boolean} options.replace
 * @returns {[*,function(*, *=): void]}
 */
const useSearchParam = (key, defaultValue = null, options = defaultOptions) => {

  const location = useLocation();
  const history = useHistory();
  const optionsRef = useRef(options)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const value = params.get(key) ?? defaultValue;

  const setSearchParams = useCallback((searchParams, setOptions) => {
    const {replace} = setOptions
    const pathname = location.pathname

    if (replace) {
      history.replace({
        search: `?${params.toString()}`,
        pathname,
      })
    } else {
      history.push({
        search: `?${params.toString()}`,
        pathname,
      });
    }
  }, [history, location.pathname, params]);

  const setSearchParam = useCallback(
    (value, setOptions = optionsRef.current) => {

      if (value === params.get(key)) return

      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value);
      }

      setSearchParams(params, setOptions)
    },
    [params, key, setSearchParams]
  );

  return useMemo(() => [value, setSearchParam], [value, setSearchParam]);
};

export default useSearchParam;