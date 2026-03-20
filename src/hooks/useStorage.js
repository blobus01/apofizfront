
import { useState, useEffect } from 'react';

/**
 * A prefix to identify session and local storage keys saved using
 * the storage hooks in this application.
 */
const STORAGE_KEYS_PREFIX = 'apofiz_';

const useStorage = (storage, keyPrefix) => (storageKey, fallbackState=null) => {
  if (!storageKey) throw new Error(`"storageKey" must be a nonempty string, but "${storageKey}" was passed.`);

  const storedString = storage.getItem(keyPrefix + storageKey);
  let parsedObject = null;

  if (storedString !== null) parsedObject = JSON.parse(storedString);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState(parsedObject ?? fallbackState);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    storage.setItem(keyPrefix + storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};

/**
 * Saves data in local storage.
 * @param storageKey A string to identify the value being cached.
 * @param fallbackState The default value when no value has been stored yet.
 * @returns A stateful value, and a function to update it.
 * @example
 * const [collapsed, setCollapsed] = useLocalStorage('isSidebarCollapsed', false);
 */

// eslint-disable-next-line react-hooks/rules-of-hooks
const useLocalStorage = useStorage(localStorage, STORAGE_KEYS_PREFIX);

/**
 * Saves data in session storage.
 * @param storageKey A string to identify the value being cached.
 * @param fallbackState The default value when no value has been stored yet.
 * @returns A stateful value, and a function to update it.
 * @example
 * const [collapsed, setCollapsed] = useSessionStorage('isSidebarCollapsed', false);
 */

// eslint-disable-next-line react-hooks/rules-of-hooks
const useSessionStorage = useStorage(sessionStorage, STORAGE_KEYS_PREFIX);

export { useLocalStorage, useSessionStorage };