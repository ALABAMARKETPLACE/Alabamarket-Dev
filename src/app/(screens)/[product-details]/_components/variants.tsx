"use client";
import React, { useEffect, useState } from "react";
import { getAllVaraints, getCurrentVaraintValue } from "./functions";
import { Radio } from "antd";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
type Props = {
  productVariant: any;
  currentVariant: any;
  changeVaraintId: (val: any) => void;
};
function Variants(props: Props) {
  const [selectedVariant, setSelectedVariant] = useState<any>([]);
  // useDidUpdateEffect(() => {
  //   setSelectedVariant(getCurrentVaraintValue(props?.currentVariant));
  // }, [props?.currentVariant]);
  // useEffect(() => {
  //   if (props?.currentVariant?.combination) {
  //     setSelectedVariant(getCurrentVaraintValue(props?.currentVariant));
  //   }
  // }, [props?.currentVariant]);

  const handleVariantChange = (value: string, variant: string) => {
    const newCombination = [...selectedVariant];

    const existingIndex = newCombination.findIndex(
      (item) => item.variant === variant
    );

    if (existingIndex >= 0) {
      newCombination[existingIndex] = { variant, value };
    } else {
      newCombination.push({ variant, value });
    }

    setSelectedVariant(newCombination);

    const vid = props?.productVariant?.find((item: any) =>
      item?.combination?.every((element: any) =>
        newCombination.some(
          (comb: any) =>
            comb.variant === element?.variant && comb.value === element?.value
        )
      )
    )?.id;

    if (vid) {
      props?.changeVaraintId(vid);
    }
  };
  const findSpecificVariantValue = (varaint: any) => {
    return selectedVariant?.find((element: any) => element?.variant === varaint)
      ?.value;
  };

  return (
    <div className="d-flex flex-column gap-2">
      {getAllVaraints(props?.productVariant)?.map((item) => (
        <React.Fragment key={item.variant}>
          <div>
            {item?.variant} : {findSpecificVariantValue(item?.variant)}
          </div>
          <Radio.Group
            value={findSpecificVariantValue(item?.variant)}
            onChange={(e) => handleVariantChange(e?.target?.value, item?.variant)}
            buttonStyle="solid"
            options={item?.values as string[]}
            optionType="button"
          />
        </React.Fragment>
      ))}
    </div>
  );
}

export default Variants;
