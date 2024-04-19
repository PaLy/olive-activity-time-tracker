import { useMutation } from "@tanstack/react-query";
import { Signal } from "@preact/signals-react";
import { Interval } from "./Interval";
import { IntervalEdit, intervalStore } from "./Storage";
import { openErrorSnackbar } from "../../routes/activity/AppSnackbar";

type EditIntervalOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useEditInterval = (options?: EditIntervalOptions) => {
  return useMutation({
    mutationFn: async (variables: {
      interval: Signal<Interval>;
      edit: IntervalEdit;
    }) => {
      const { interval, edit } = variables;
      await intervalStore.editInterval(interval.value, edit);
    },
    onSuccess: options?.onSuccess,
    onError: openErrorSnackbar,
  });
};
