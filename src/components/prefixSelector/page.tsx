import React from "react";
import { Form, Select } from "antd";
import Country from "@/shared/helpers/countryCode.json";

interface PrefixSelectorProps {
  defaultValue?: string;
}

/**
 * PrefixSelector component for country code selection
 * Defaults to "+234" (Nigeria) if no initialValue is set in the Form's initialValues
 * Forms can override by setting initialValues={{ code: "+XXX" }} in their Form component
 * All country codes are listed in the dropdown, only the default selection is "+234"
 */
const PrefixSelector: React.FC<PrefixSelectorProps> = ({
  defaultValue = "+234",
}) => {
  return (
    <Form.Item
      name="code"
      noStyle
      rules={[{ required: true, message: "Please select countrycode" }]}
    >
      <Select style={{ width: 85 }} size="large" showSearch={true}>
        {Country?.map((item: any) => (
          <Select.Option key={item.dial_code} value={item.dial_code}>
            {item.dial_code}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default PrefixSelector;
