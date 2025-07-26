export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(createInitialsWordsFilter())
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase();

const createInitialsWordsFilter = () => {
  const removeWord: boolean[] = [];

  return (_: string, index: number, array: string[]) => {
    if (index === 0) {
      let removalsLeft = array.length - 2;

      array.toReversed().forEach((word: string) => {
        const remove =
          removalsLeft > 0 &&
          (isPreposition(word) || ["&", "+", "-"].includes(word[0]));
        if (remove) removalsLeft--;
        removeWord.push(remove);
      });

      removeWord.reverse();
    }

    return !removeWord[index];
  };
};

const isPreposition = (word: string) =>
  ["a", "an", "and", "at", "in", "of", "on", "or", "the"].includes(
    word.toLowerCase(),
  );
