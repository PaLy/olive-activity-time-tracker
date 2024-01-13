import { useLayoutEffect } from "react";
import { batch, computed, signal } from "@preact/signals-react";

export const windowWidth = signal(0);
export const windowHeight = signal(0);
export const windowSize = computed(() => ({
  width: windowWidth.value,
  height: windowHeight.value,
}));

export const useWindowResize = () => {
  useLayoutEffect(() => {
    const updateSize = () => {
      batch(() => {
        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);
};
