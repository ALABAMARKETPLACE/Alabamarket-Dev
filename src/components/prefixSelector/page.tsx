import React from "react";
import { Form, Select } from "antd";
import Country from "@/shared/helpers/countryCode.json";

const PrefixSelector = () => {
  return (
    <Form.Item
      name="code"
      noStyle
      rules={[{ required: true, message: "Please select countrycode" }]}
    >
      <Select style={{ width: 85 }} size="large" showSearch={true}>
        {Country.map((item: any) => (
          <Select.Option key={item.dial_code} value={item.dial_code}>
            {item.dial_code}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default PrefixSelector;
