import {useEffect, useRef} from 'react';

const useDebounceEffect = (callback, delay, dependencies = []) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const timeout = setTimeout(callbackRef.current, delay)

    return () => clearTimeout(timeout)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, delay]);
};

export default useDebounceEffect;