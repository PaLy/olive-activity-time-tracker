export type OldDbActivity = {
  id: string;
  name: string;
  intervalIDs: string[];
  parentID: string;
  childIDs: string[];
  newId?: number;
  newParentId?: number;
  newExpanded?: boolean;
};

export type OldDbInterval = {
  id: string;
  start: number;
  end: number | null;
  newActivityId?: number;
};

export type OldDbActivityInListExpanded = {
  key: string;
  value: true;
};
