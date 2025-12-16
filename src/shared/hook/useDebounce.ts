import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, milliSeconds: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, milliSeconds);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};
export default useDebounce;
