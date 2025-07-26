export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(createLongWordsFilter())
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase();

const createLongWordsFilter = () => {
  let removalsLeft: number | undefined = undefined;

  return (word: string, index: number, array: string[]) => {
    if (removalsLeft === undefined) {
      removalsLeft = array.length - 2;
    }
    const removed =
      removalsLeft > 0 &&
      (isPreposition(word) || ["&", "+", "-"].includes(word[0]));
    if (removed) {
      removalsLeft--;
    }
    return !removed;
  };
};

const isPreposition = (word: string) =>
  ["a", "and", "at", "in", "of", "on", "or", "the"].includes(word);
