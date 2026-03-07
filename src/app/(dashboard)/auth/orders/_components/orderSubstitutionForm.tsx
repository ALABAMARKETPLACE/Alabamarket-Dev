
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, notification } from 'antd';
import { Row, Col } from 'react-bootstrap';
import API from "@/config/API";
import { GET } from "@/util/apicall";

interface OrderSubstitutionFormProps {
    orderId: string;
    form: any;
}

const OrderSubstitutionForm: React.FC<OrderSubstitutionFormProps> = ({ orderId, form }) => {
    const [notificationApi, contextHolder] = notification.useNotification();
    const [orderProduct, setOrderProduct] = useState<any[]>([]);
    const [quantity, setQuantity] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const getOrderProduct = async () => {
        setLoading(true);
        try {
            if (!orderId) {
                setLoading(false);
                return;
            }
            const response: any = await GET(API.ORDER_GETONE_SELLER + `${orderId}`)

            if (response.data && response.data.orderItems) {
                setOrderProduct(response.data.orderItems);
            } else {
                notificationApi.warning({
                    message: 'No order items found',
                    description: 'There are no products in this order to substitute'
                });
            }
        } catch (error) {
            console.error("Error fetching order data:", error);
            notificationApi.error({
                message: 'Error fetching order data',
                description: 'Oops! Something went wrong while fetching order details.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrderProduct();
    }, [orderId]);


    const productOptions = orderProduct?.map((item: any) => ({
        value: item.id,
        label: item.name
    })) || [];

    const handleProductChange = (productId: number) => {
        const selectedProduct = orderProduct?.find(item => item.id === productId);
        if (selectedProduct) {
            setQuantity(selectedProduct.quantity);
            form.setFieldsValue({
                substituteQuantity: selectedProduct.quantity
            });
        }
    };
form.setFieldsValue({ orderId: orderId })

    return (
        <>
            {contextHolder}
            <Row style={{ width: "100%" }} className='mt-4'>
                <Col>
                    <Form.Item
                        name="orderItemId"
                        label="Select Product to Substitute"
                        rules={[{ required: true, message: 'Please select a product' }]}
                    >
                        <Select
                            placeholder="Select Product"
                            options={productOptions}
                            onChange={handleProductChange}
                            loading={loading}
                            disabled={loading || productOptions.length === 0}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Substitute Quantity"
                    >
                        <Input
                            disabled
                            value={quantity === 0 ? '' : quantity}
                        />
                    </Form.Item>
                </Col>

                <Col>
                    <Form.Item
                        name="availableQuantity"
                        label="Available Quantity"
                        rules={[{ required: true, message: 'Please enter available quantity' },
                            {
                                validator: (_, value) => {
                                  if (value && (isNaN(value) || value > quantity)) {
                                    return Promise.reject(`Number must be less than ${quantity} !`);
                                  }
                                  return Promise.resolve();
                                },
                              }
                              
                        ]}
                    >
                        <Input
                            type='number'
                            min={1}
                            disabled={quantity === 0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="remark"
                        label="Your Remark"
                        rules={[{ required: true, message: 'Please enter a remark' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="orderId"
                        hidden >
                        <Input value={orderId} />
                    </Form.Item>

                </Col>
            </Row>
        </>
    );
};

export default OrderSubstitutionForm;