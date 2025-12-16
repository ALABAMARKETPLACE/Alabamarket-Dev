import { Col, Container, Row } from "react-bootstrap";
import IndividualSellerImg from "../../../../assets/images/profitimage.png";
import '../style.scss'
import { FaLongArrowAltRight } from "react-icons/fa";
import React from "react";
import API from "../../../../config/API";
import Image from "next/image";

const IndividualInfo = () => {
  const items = [
    {
      text: `Elevate your waitlisting experience with ${API.NAME}, designed for individuals seeking seamless and efficient service.`,
      color: API.COLOR,
    },
    {
      text: `Elevate your waitlisting experience with ${API.NAME}, designed for individuals seeking seamless and efficient service.`,
      color:API.COLOR,
    },
    {
      text: `${API.NAME} simplifies the waitlist process for coffee shops, restaurants, and services, ensuring a stress-free, organized approach to your daily schedule.`,
      color: API.COLOR,
    },
    {
      text: `Join the ${API.NAME} community and embrace a lifestyle enhancement tool that puts you in control, turning your wait times into opportunities for productivity and relaxation.`,
      color:API.COLOR,
    },
  ];

  return (
    <div className="Screen-box">
      <br />
      <Container>
        <Row>
          <Col md={6}>
            <div>
              <h4 className="sellerRegister-subHeading">
                Why choosing individual seller?
              </h4>
              <br />
              <div>
                {items.map((item, index) => (
                  <div key={index} className="sellerRegister-row">
                    <div>
                      <FaLongArrowAltRight color={item.color} size={20} />
                    </div>
                    &nbsp; &nbsp;
                    <div className="sellerRegister-text1">
                      {item.text} <br />
                      <br />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div>
            <Image
                src={IndividualSellerImg}
                alt="Description of the image"
                className="individualSellerPage-Box5"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default IndividualInfo;
