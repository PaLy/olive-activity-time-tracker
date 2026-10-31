import { useState } from "react";
import {
  ActivityOption,
  editActivity,
  getChildNames,
  getParentOptions,
  getSiblingActivities,
  ROOT_ACTIVITY_ID,
} from "../../db/queries/activities";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { ActivityDetailsData } from "../../db/queries/activityDetails";

export type EditingState = {
  editMode: boolean;
  name: string;
  parentId: number;
  parentOptions: ActivityOption[];
  siblingNames: Set<string>;
  validationError: string;
};

const createInitialState = (): EditingState => ({
  editMode: false,
  name: "",
  parentId: ROOT_ACTIVITY_ID,
  parentOptions: [],
  siblingNames: new Set(),
  validationError: "",
});

export const useActivityNameEditing = (activityId: number) => {
  const [editingState, setEditingState] =
    useState<EditingState>(createInitialState);

  const validateName = (nameToValidate: string, siblingNames: Set<string>) => {
    if (nameToValidate.trim() === "") {
      return "Activity name cannot be empty";
    }
    if (siblingNames.has(nameToValidate.trim().toLowerCase())) {
      return "An activity with this name already exists in the same parent";
    }
    return "";
  };

  const handleEditStart = async (activityDetailsData: ActivityDetailsData) => {
    if (!activityDetailsData) return;

    try {
      const [siblings, parentOptions] = await Promise.all([
        getSiblingActivities(activityId),
        getParentOptions(activityId),
      ]);
      const names = new Set(
        siblings.map((sibling) => sibling.name.toLowerCase()),
      );
      const currentActivity = activityDetailsData.activities.get(activityId);

      setEditingState({
        editMode: true,
        name: currentActivity?.name || "",
        parentId: currentActivity?.parentId ?? ROOT_ACTIVITY_ID,
        parentOptions,
        siblingNames: names,
        validationError: "",
      });
    } catch (err) {
      console.error(err);
      openErrorSnackbar("Failed to load activity data");
    }
  };

  const handleNameChange = (newName: string) => {
    const validationError = validateName(newName, editingState.siblingNames);
    setEditingState((prev) => ({
      ...prev,
      name: newName,
      validationError,
    }));
  };

  const handleParentChange = async (newParentId: number) => {
    try {
      const siblingNames = await getChildNames(newParentId, activityId);
      setEditingState((prev) => ({
        ...prev,
        parentId: newParentId,
        siblingNames,
        validationError: validateName(prev.name, siblingNames),
      }));
    } catch (err) {
      console.error(err);
      openErrorSnackbar("Failed to load activity data");
    }
  };

  // The name may be newer than the debounced state when saving right after typing.
  const handleSave = (latestName?: string) => {
    const trimmedName = (latestName ?? editingState.name).trim();
    const validationError = validateName(
      trimmedName,
      editingState.siblingNames,
    );

    if (validationError) {
      setEditingState((prev) => ({ ...prev, validationError }));
      return;
    }

    editActivity(activityId, trimmedName, editingState.parentId)
      .then(() => {
        setEditingState(createInitialState());
      })
      .catch((err) => {
        console.error(err);
        openErrorSnackbar("Failed to save activity");
      });
  };

  const handleCancel = () => {
    setEditingState(createInitialState());
  };

  return {
    editingState,
    handleEditStart,
    handleNameChange,
    handleParentChange,
    handleSave,
    handleCancel,
  };
};
