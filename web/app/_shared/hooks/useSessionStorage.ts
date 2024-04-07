import {useCallback, useEffect, useState} from 'react';

export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const initialize = (key: string) => {
    try {
      const item = sessionStorage.getItem(key);
      if (item && item !== "undefined") {
        return JSON.parse(item);
      }

      sessionStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch {
      return initialValue;
    }
  };

  const [state, setState] = useState<T | null>(null); // problem is here

  // solution is here....
  useEffect(()=>{
    setState(initialize(key));
  },[]);

  const setValue = useCallback(
    (value: T) => {
      try {
        setState(value);
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.log(error);
      }
    },
    [key, setState]
  );

  const remove = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.log(err);
    }
  }, [key]);

  return [state, setValue, remove] as const;
};
