import { useEffect, useRef } from "react";

export const useEffectOnceAfter = (
  after: boolean,
  effect: Parameters<typeof useEffect>[0],
) => {
  const calledRef = useRef(false);

  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (after && !calledRef.current) {
      calledRef.current = true;
      return effectRef.current();
    }
  }, [after]);
};
