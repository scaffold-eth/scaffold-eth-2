import { useEffect, useState } from "react";

const ANIMATION_TIME = 2000;

export function useAnimationConfig(data: any) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [prevData, setPrevData] = useState();

  useEffect(() => {
    if (prevData !== undefined && prevData !== data) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), ANIMATION_TIME);
    }
    setPrevData(data);
  }, [data, prevData]);

  return {
    showAnimation,
  };
}
