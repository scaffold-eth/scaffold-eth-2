import React, { useEffect } from "react";

/**
 * Check if a click was made outside the passed ref
 */
export const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: { (): void }) => {
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [ref, callback]);
};
