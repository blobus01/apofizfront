import {useHistory, useLocation} from "react-router-dom";
import {useCallback, useMemo, useRef} from "react";

const defaultOptions = {
  replace: true,
  merge: true,
}

/**
 * @typedef Options
 * @type {object}
 * @property {boolean=true} replace
 * @property {boolean=true} merge
 */
/**
 * @param {Record<string, any>} defaultSearchParams
 * @param {Options=} options
 * @returns {[(Record<string, any>|Function),function(Record<string, any>, options?: Options): void]}
 * */
const useSearchParams = (defaultSearchParams = {}, options = defaultOptions) => {
  const location = useLocation();
  const history = useHistory();
  const defaultParamsRef = useRef(defaultSearchParams)
  const optionsRef = useRef(options)

  const params = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const defaultParams = defaultParamsRef.current

    if (
      defaultParams !== null &&
      typeof defaultParams === 'object'
    ) {
      forEach(defaultParams, (key, value) => {
        if (!params.has(key))
          setUrlSearchParam(params, key, value)
      })
    }

    return params
  }, [location.search]);

  const paramsObj = useMemo(() => paramsToObject(params.entries()), [params])

  const setSearchParams = useCallback((searchParams, setOptions) => {
    const {replace} = setOptions
    const pathname = location.pathname

    if (replace) {
      history.replace({
        search: `?${searchParams.toString()}`,
        pathname,
      })
    } else {
      history.push({
        search: `?${searchParams.toString()}`,
        pathname,
      });
    }
  }, [history, location.pathname]);

  const setParams = useCallback((searchParams, setOptions = optionsRef.current) => {
    let newSearchParamsObj = searchParams
    if (typeof searchParams === 'function') {
      newSearchParamsObj = searchParams(paramsObj)
    }

    const {merge} = setOptions

    const newParams = merge ? params : new URLSearchParams()

    forEach(newSearchParamsObj, (key, value) => {
      setUrlSearchParam(newParams, key, value)
    })

    setSearchParams(newParams, setOptions)
  }, [params, paramsObj, setSearchParams]);


  return useMemo(() => [paramsObj, setParams], [paramsObj, setParams])
}

function paramsToObject(entries) {
  const result = {}
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function setUrlSearchParam(params, key, value) {
  if (value === null) {
    params.delete(key)
  } else {
    params.set(key, value)
  }
}

function forEach(obj, callback) {
  for (const [key, value] of Object.entries(obj)) {
    callback(key, value)
  }
}

export default useSearchParams