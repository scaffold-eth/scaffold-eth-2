import { ChangeEvent, FocusEvent, useCallback, useEffect, useRef } from "react";

export const useInputBase = <T>({ onChange, reFocus }: { onChange: (newValue: T) => void; reFocus?: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  // Runs only when reFocus prop is passed, useful for setting the cursor
  // at the end of the input. Example AddressInput
  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (reFocus !== undefined) {
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
    }
  };
  useEffect(() => {
    if (reFocus !== undefined && reFocus === true) inputRef.current?.focus();
  }, [reFocus]);

  return {
    inputRef,
    handleChange,
    onFocus,
  };
};
