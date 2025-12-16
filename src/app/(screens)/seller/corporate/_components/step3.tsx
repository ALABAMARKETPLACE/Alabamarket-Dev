import { Form, Input, Button, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { Col, Row, Container } from "react-bootstrap";
import Country from "../../../../../shared/helpers/countryCode.json";
import React from "react";
function Step3({ moveToNextStep, goBack, formData }: any) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const onFinish = async (values: any) => {
    moveToNextStep({ step3Data: values });
  };
  return (
    <div className="sellerRegister-stepbox">
      <Container>
        <Row>
          <Col md={4}>
            <Form
              form={form}
              onFinish={onFinish}
              initialValues={{
                seller_name: formData?.seller_name,
                citizenship_country: formData?.citizenship_country,
                birth_country: formData?.birth_country,
                dob: formData?.dob ? dayjs(formData?.dob) : null,
                issue_country: formData?.issue_country,
                expiry_date: formData?.expiry_date
                  ? dayjs(formData?.expiry_date)
                  : null,
                id_type: formData?.id_type,
              }}
            >
              <div className="input-form-label">Seller Name</div>
              <Form.Item
                name="seller_name"
                rules={[
                  { required: true, message: "Please Provide Seller name" },
                  {
                    max: 50,
                    message: "Seller Name is too long",
                  },
                ]}
              >
                <Input placeholder="Seller Name" size="large" />
              </Form.Item>
              <div className="input-form-label">Citizenship Country</div>
              <Form.Item name="citizenship_country">
                <Select
                  placeholder="Citizenship Country"
                  size="large"
                  showSearch={true}
                >
                  {Country?.map((item: any) => {
                    return (
                      <Option key={item.name} value={item.name}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <div className="input-form-label">Birth Country</div>
              <Form.Item name="birth_country">
                <Select
                  placeholder="Birth Country"
                  size="large"
                  showSearch={true}
                >
                  {Country?.map((item: any) => {
                    return (
                      <Option key={item.name} value={item.name}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <div className="input-form-label">Date of Birth</div>
              <Form.Item name="dob">
                <DatePicker
                  placeholder="DOB"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
              <div className="input-form-label">ID Proof</div>
              <Form.Item name="id_type">
                <Select placeholder="Select ID Proof" size="large">
                  <Option key="NIN">NIN</Option>
                  <Option key="Passport">Passport</Option>
                  <Option value="Driving Liscence">Drivers Liscence</Option>
                </Select>
              </Form.Item>
              <div className="input-form-label">Issue Country</div>
              <Form.Item name="issue_country">
                <Select
                  placeholder="Issue Country"
                  size="large"
                  showSearch={true}
                >
                  {Country?.map((item: any) => {
                    return (
                      <Option key={item.name} value={item.name}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <div className="input-form-label">Expiry Date</div>
              <Form.Item name="expiry_date">
                <DatePicker
                  placeholder="Expiry Date"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
              <Row>
                <Col md={6} xs={6}>
                  <Button onClick={() => goBack()} block size="large">
                    Back
                  </Button>
                </Col>
                <Col md={6} xs={6}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                      Continue
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col sm={8}>
            <div className="sellerRegister-box2">
              <h4 className="sellerRegister-subHeading">3. Seller Details</h4>
              <div className="sellerRegister-text1">
                Here you can provide details of the seller. that includes the
                Full Name of the person, and his/her Citizenship country. You
                can select the country from the available options in the
                dropdown. <br />
                <b>Birth Country:</b> Select the country where you've born from
                the dropdown list. also select the DOB.
                <br />
                <br />
                <b>ID Proof: </b>Select the type of Proof which you'd like to
                submit as you ID proof from the available options. you'll have
                to upload a softcopy or photograph of the same in the upload
                Documents section. <br />
                <br />
                <b>Issue Country: </b> Select the country where the selected ID
                card has been issued. <br />
                <br />
                <b>Expiry Date:</b> Provide the Expiry date of the selected ID
                Proof.
                <br />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Step3;
