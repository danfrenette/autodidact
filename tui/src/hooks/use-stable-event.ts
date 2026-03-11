import { useCallback, useRef } from "react";

export function useStableEvent<Args extends unknown[], Return>(handler: (...args: Args) => Return): (...args: Args) => Return {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  return useCallback((...args: Args) => handlerRef.current(...args), []);
}
