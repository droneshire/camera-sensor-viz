import { useCallback, useState } from "react";
import { getErrorMessage } from "utils/errors";

// Run an async function and watch for errors
export function useAsyncAction<T, P>(action: (value: T) => P | void) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const clearError = () => setError("");
  const wrappedAction = useCallback(async (value: T) => {
    if (running) {
      return false;
    }
    setRunning(true);
    try {
      await action(value);
      return true;
    } catch (e) {
      console.error("Failed async action", e);
      setError(getErrorMessage(e));
      return false;
    } finally {
      setRunning(false);
    }
  }, [running, action]);
  return { runAction: wrappedAction, running, error, clearError };
}
