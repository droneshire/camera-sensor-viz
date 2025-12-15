import { RefObject, useCallback, useEffect } from "react";

export const useKeyPress = (
  targetKeys: string[],
  handler: (event: KeyboardEvent) => void,
  ref?: RefObject<HTMLElement>
) => {
  const wrappedHandler = useCallback(
    (event: KeyboardEvent) => {
      if (targetKeys.includes(event.key)) {
        handler(event);
      }
    },
    [targetKeys, handler]
  );
  useEffect(() => {
    const currentRef = ref?.current;
    if (currentRef) {
      currentRef.addEventListener("keydown", wrappedHandler);
    } else {
      window.addEventListener("keydown", wrappedHandler);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("keydown", wrappedHandler);
      } else {
        window.removeEventListener("keydown", wrappedHandler);
      }
    };
  }, [wrappedHandler, ref]);
};
