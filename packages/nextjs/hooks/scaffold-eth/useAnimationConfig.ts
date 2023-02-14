import { useState } from "react";
import { deepEqual } from "wagmi";

export function useAnimationConfig() {
  const [showAnimation, setShowAnimation] = useState(false);

  return {
    showAnimation,
    config: {
      structuralSharing: (prev: any, next: any) => {
        if (deepEqual(prev, next)) {
          return prev;
        }

        if (!showAnimation) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 2000);
        }

        return next;
      },
    },
  };
}
