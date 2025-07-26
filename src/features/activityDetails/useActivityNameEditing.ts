import { useState } from "react";
import {
  editActivityName,
  getSiblingActivities,
} from "../../db/queries/activities";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { ActivityDetailsData } from "../../db/queries/activityDetails";

type EditingState = {
  editMode: boolean;
  name: string;
  siblingNames: Set<string>;
  validationError: string;
};

export const useActivityNameEditing = (activityId: number) => {
  const [editingState, setEditingState] = useState<EditingState>({
    editMode: false,
    name: "",
    siblingNames: new Set(),
    validationError: "",
  });

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
      const siblings = await getSiblingActivities(activityId);
      const names = new Set(
        siblings.map((sibling) => sibling.name.toLowerCase()),
      );
      const currentActivity = activityDetailsData.activities.get(activityId);

      setEditingState({
        editMode: true,
        name: currentActivity?.name || "",
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

  const handleSave = () => {
    const trimmedName = editingState.name.trim();
    const validationError = validateName(
      trimmedName,
      editingState.siblingNames,
    );

    if (validationError) {
      setEditingState((prev) => ({ ...prev, validationError }));
      return;
    }

    editActivityName(activityId, trimmedName)
      .then(() => {
        setEditingState({
          editMode: false,
          name: "",
          siblingNames: new Set(),
          validationError: "",
        });
      })
      .catch((err) => {
        console.error(err);
        openErrorSnackbar("Failed to save activity name");
      });
  };

  const handleCancel = () => {
    setEditingState({
      editMode: false,
      name: "",
      siblingNames: new Set(),
      validationError: "",
    });
  };

  return {
    editingState,
    handleEditStart,
    handleNameChange,
    handleSave,
    handleCancel,
  };
};
