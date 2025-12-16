import { useState } from "react";
type returnType = [boolean, Function];
export default function useToggle(defaultValue: boolean): returnType {
  const [value, setValue] = useState<boolean>(defaultValue);

  function toggleValue(value: any) {
    setValue((currentValue) =>
      typeof value === "boolean" ? value : !currentValue
    );
  }

  return [value, toggleValue];
}
