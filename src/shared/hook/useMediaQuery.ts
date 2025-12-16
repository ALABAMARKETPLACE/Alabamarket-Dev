import { useState, useEffect } from "react";

const useMediaQuery = (width: number): boolean => {
  const [isWidthLess, setIsWidthLess] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setIsWidthLess(windowWidth < width);
    };

    // Initial call to handleResize to set the initial value
    handleResize();

    // Event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [width]); // Run effect only when width changes

  return isWidthLess;
};

export default useMediaQuery;
