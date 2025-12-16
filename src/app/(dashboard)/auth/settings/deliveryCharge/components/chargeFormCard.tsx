import { Button, Card, Form, InputNumber, Select } from "antd";
import Input from "antd/es/input/Input";
import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
type Props = {
  cardTitle: string;
  onFinish: (val: any) => void;
  isLoading: boolean;
  initialData: any;
  firstFieldName: string;
  secondFieldName: string;
  thirdFieldName: string;
  btnLoading: boolean;
};
export default function ChargeFormCard(props: Props) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldValue("items", props?.initialData);
  }, [props?.initialData]);
  return (
    <Form
      form={form}
      onFinish={(val: any) => {
        props?.onFinish(val);
      }}
      scrollToFirstError
    >
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <Card
            loading={props?.isLoading}
            title={props?.cardTitle}
            extra={
              <Button
                type="primary"
                htmlType="submit"
                loading={props?.btnLoading}
              >
                Save
              </Button>
            }
            actions={[
              <div className="d-flex justify-content-end align-items-center mx-4">
                <Button type="dashed" icon={<IoMdAdd />} onClick={() => add()}>
                  Add Slab
                </Button>
              </div>,
            ]}
          >
            <Table responsive borderless>
              <tbody>
                {fields.map(({ key, name, ...restField }) => (
                  <tr key={key}>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, props?.firstFieldName]}
                        rules={[
                          {
                            required: true,
                            message: `Enter the ${props?.firstFieldName}`,
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          placeholder={props?.firstFieldName}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, props?.secondFieldName]}
                        initialValue={"<="}
                      >
                        <Input readOnly style={{ width: 40 }} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, props?.thirdFieldName]}
                        rules={[
                          {
                            required: true,
                            message: `Enter the ${props?.thirdFieldName}`,
                          },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          placeholder={props?.thirdFieldName}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Button
                        danger
                        icon={<MdDelete />}
                        onClick={() => remove(name)}
                        type="text"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Form.List>
    </Form>
  );
}
