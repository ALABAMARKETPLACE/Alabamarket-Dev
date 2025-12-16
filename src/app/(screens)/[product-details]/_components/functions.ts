export function getAllVaraints(productVariant: any) {
  const variantsMap: any = {};
  productVariant?.forEach((item: any) => {
    item?.combination?.forEach((combo: any) => {
      if (!variantsMap[combo?.variant]) {
        variantsMap[combo?.variant] = new Set();
      }
      variantsMap[combo?.variant].add(combo?.value);
    });
  });
  const result = Object.keys(variantsMap).map((variant) => {
    return {
      variant: variant,
      values: Array.from(variantsMap[variant]),
    };
  });

  return result;
}

export function findVariantWithId(productVariant: any, id: any) {
  const variant = productVariant?.find((item: any) => item?.id == id);
  return variant;
}
export const getCurrentVaraintValue = (
  data: any
): { variant: string; value: string }[] => {
  return data?.combination?.map((item: any) => ({
    variant: item?.variant,
    value: item?.value,
  }));
};
