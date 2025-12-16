
import { Empty } from "antd"
import { Col, Row } from "react-bootstrap";
import { DeleteOutlined } from '@ant-design/icons';

import "../../orders/Style.scss"

interface items {
    _id: number;
    name: string;
    image: string;
    description: string;
}

const SelectedProductsSubstitution = ({ select, changeData, handleSubmit }: any) => {

    return (
        <div style={{ position: "sticky", top: "21px", overflow: "hidden" }}>
            <h5>Selected Products ({select.length})</h5>
            <Row md={1} className="px-4 subProductsList" >
                {select.length == 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                    select?.map((Item: items) => (
                        <Col key={Item._id} className="border-bottom p-2">
                            <Row className="py-2">
                                <Col md={2} className="d-flex justify-center align-items-center">
                                    <img src={Item.image} width='100%' />
                                </Col>
                                <Col md={9} className="d-flex justify-center align-items-center">
                                    <div>
                                        <h6>{Item.name}</h6>
                                        <p className="disc">{Item.description}</p>
                                    </div>
                                </Col>
                                <Col md={1} className="d-flex justify-center align-items-center">
                                    <DeleteOutlined className="closeBtn" onClick={() => {
                                        const deletedArray = select.filter((data: items) => Item._id != data._id)
                                        changeData(deletedArray)
                                    }} />
                                </Col>
                            </Row>
                        </Col>
                    ))}
            </Row>
            <button className="my-4 reqSubmitBtn" type="submit" onClick={handleSubmit} >Request Substitution</button>
        </div>
    )
}

export default SelectedProductsSubstitution     