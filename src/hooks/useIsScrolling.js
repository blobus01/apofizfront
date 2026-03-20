import { useEffect, useMemo, useState } from "react";

const useIsScrolling = (scrollableTarget) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const currentScrollableTarget = useMemo(
    () => scrollableTarget ?? window,
    [scrollableTarget]
  );

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 50);
    };

    currentScrollableTarget.addEventListener("scroll", handleScroll);

    return () => {
      currentScrollableTarget.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentScrollableTarget]);

  return isScrolling;
};

export default useIsScrolling;
