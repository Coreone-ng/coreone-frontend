export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  placeholder: boolean;
};
/** All query words must occur in the question or supplied answer, in any order. */
export function filterFaqs<T extends FaqEntry>(
  entries: readonly T[],
  query: string,
): readonly T[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((entry) => {
    const text = `${entry.question} ${entry.answer}`.toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
