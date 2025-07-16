export const getNonRootAncestors = <A extends { id: number; parent?: A }>(
  activity: A,
): A[] => getAncestors(activity).slice(0, -1);

const getAncestors = <A extends { id: number; parent?: A }>(
  activity: A,
): A[] => {
  const parent = activity.parent;
  if (!parent) {
    return [];
  }
  return parent.id === -1 ? [parent] : [parent, ...getAncestors(parent)];
};

export const activityFullName = <
  A extends { id: number; name: string; parent?: A },
>(
  activity: A,
) => {
  return getNonRootAncestors(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name)
    .join(ACTIVITY_FULL_NAME_SEPARATOR);
};

export const ACTIVITY_FULL_NAME_SEPARATOR = " / ";

export enum OrderBy {
  Duration,
  LastEndTime,
}
