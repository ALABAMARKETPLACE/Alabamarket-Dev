const convertInput = (str: string) => {
  if (!str) {
    return {};
  }
  const parts = str
    .split("|")
    .map((part) => Number(part))
    .filter((value) => !Number.isNaN(value));

  if (parts.length === 1) {
    return { category: parts[0] };
  } else if (parts.length === 2) {
    return { category: parts[0], subCategory: parts[1] };
  }
  return {};
};
export default convertInput;
