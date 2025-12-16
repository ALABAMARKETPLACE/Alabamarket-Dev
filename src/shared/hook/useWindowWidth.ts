import { useState, useEffect } from "react";

const useWindowWidth = (threshold: number) => {
  const [isSmaller, setIsSmaller] = useState(false);

  useEffect(() => {
    // Only run this effect on the client side (after the component mounts)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsSmaller(window.innerWidth < threshold);
      };

      // Set initial value on mount
      handleResize();

      window.addEventListener("resize", handleResize);

      // Cleanup event listener on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [threshold]);

  return isSmaller;
};

export default useWindowWidth;
