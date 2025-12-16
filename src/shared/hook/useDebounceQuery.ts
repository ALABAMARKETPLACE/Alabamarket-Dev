import { useEffect, useState, useCallback } from "react";

const useDebounceQuery = <T>(
  initialValue: T,
  milliSeconds: number
): [T, T, (value: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, milliSeconds);

    return () => {
      clearTimeout(handler);
    };
  }, [value, milliSeconds]);

  const handleChange = useCallback((value: T) => {
    setValue(value);
  }, []);

  return [debouncedValue, value, handleChange];
};

export default useDebounceQuery;
