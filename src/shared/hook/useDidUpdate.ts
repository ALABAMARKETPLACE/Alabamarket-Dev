import { useEffect, useRef } from "react";
//this hook is used to render a fun only if a specific value change and not initial rendering
function useDidUpdateEffect(fn: Function, inputs: any) {
  const isMountingRef = useRef(false);

  useEffect(() => {
    isMountingRef.current = true;
  }, []);

  useEffect(() => {
    if (!isMountingRef.current) {
      return fn();
    } else {
      isMountingRef.current = false;
    }
  }, inputs);
}
export default useDidUpdateEffect;
