import { Signal, useComputed } from "@preact/signals-react";

export const useInitials = (name: Signal<string>) =>
  useComputed(() =>
    name.value
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toLocaleUpperCase(),
  );
