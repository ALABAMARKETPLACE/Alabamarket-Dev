"use client";

import React, { useState, useEffect } from "react";
import { Form, Select } from "antd";
import Country from "@/shared/helpers/countryCode.json";

const PrefixSelector = () => {
  const [sortedCountries, setSortedCountries] = useState<any[]>(Country);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sort countries with Nigeria first
    const countries = [...Country];
    const nigeriaIndex = countries.findIndex(c => c.dial_code === "+234");
    
    if (nigeriaIndex > -1) {
      const nigeria = countries.splice(nigeriaIndex, 1);
      setSortedCountries([...nigeria, ...countries]);
    } else {
      setSortedCountries(countries);
    }
    
    setMounted(true);
  }, []);

  return (
    <Form.Item
      name="code"
      noStyle
      rules={[{ required: true, message: "Please select country code" }]}
    >
      <Select 
        style={{ width: 110 }} 
        size="large" 
        showSearch={true}
        placeholder="Country Code"
        optionLabelProp="label"
        filterOption={(input, option) => {
          const code = (option?.value as string) || "";
          return code.toLowerCase().includes(input.toLowerCase());
        }}
      >
        {sortedCountries.map((item: any) => (
          <Select.Option 
            key={item.dial_code} 
            value={item.dial_code}
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <span>{item.flag || "🌍"}</span>
                <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
                  {item.dial_code}
                </span>
              </span>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
              <span style={{ fontSize: 18 }}>{item.flag || "🌍"}</span>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                  {item.name}
                </span>
                <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>
                  {item.dial_code}
                </span>
              </div>
            </div>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default PrefixSelector;
