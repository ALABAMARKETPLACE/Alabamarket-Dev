"use Client"
import API from "@/config/API"
import { GET } from "@/util/apicall"
import { useEffect, useState } from "react"
import { notification, Pagination, Empty } from "antd";
import { Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";
import "../../orders/Style.scss"
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';

type producttype = { _id?: number; image: string; name: string; price: string; }
interface storeProduct {
    storeId: number;
    subCategory?: number;
    query?: string;
    page: number;
    take: number;
    instock: boolean;
    order: string
}
interface props {
    select: any[];
    changeData: (newSelect: any[]) => void;
}
const SimiliarProductSubstitution = ({ select, changeData }: props) => {

    const [notificationApi, contextHolder] = notification.useNotification();
    const [allProduct, setAllProduct] = useState<any>([])
    const [page, setPage] = useState<number>(1)
    const [take, setTake] = useState<number>(20)
    const [count, setCount] = useState<number>()
    const [category, setCategory] = useState<any>()
    const [searchInp, setSearchInp] = useState<string>()
    const [search, setSearch] = useState<string>()
    const [selectCategory, setSelectCategory] = useState<any>('')

    const { data: session }: any = useSession();
    const categories = async () => {
        try {
            const response: any = await GET(API.STORE_SEARCH_GETINFO)
            setCategory(response.data.category)
        } catch (error) {
            notificationApi.error({ message: `Ooops something went wrong...!` });
        }
    }

    const urls: storeProduct = {
        storeId: session?.user?.store_id,
        subCategory: selectCategory,
        query: search,
        page: page,
        take: take,
        instock: true,
        order: "DESC"
    }

    const getData = async () => {
        try {
            const response: any = await GET(API.PRODUCT_SEARCH_NEW_SINGLE, urls)
            setAllProduct(response)
            setCount(await response.meta.itemCount)
        } catch (error) {
            notificationApi.error({ message: `Ooops something went wrong...!` });
        }
    }
    useEffect(() => {
        getData()
    }, [page, search, selectCategory])

    useEffect(() => {
        categories()
    }, [])
    console.log(allProduct);

    return (
        <>
            {contextHolder}
            <h5>Select Similiar Product</h5>
            {allProduct.length == 0 ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: 'transparent' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div> : <div>
                <div className="d-flex mt-3 mb-3 searchInp">
                    <input placeholder="Search products" onInput={(e: any) => setSearchInp(e.target.value)}></input>
                    <button onClick={() => setSearch(searchInp)}>Search</button>
                </div>

                <div className="d-flex category">
                    <button className={`${selectCategory == "" ? 'active' : ''}`} name='all' onClick={() => setSelectCategory('')}>All</button>
                    {category?.map((item: any, index: number) => (
                        <button className={`${item._id == selectCategory ? 'active' : ''}`} key={index} name={item._id} onClick={(e: any) => setSelectCategory(e.target.name)}>{item.name}</button>
                    ))}
                </div>

                <Row md={5} className="productsList mt-3">
                    {allProduct.data?.length == 0 ? <Col style={{width:"100%"}}>
                        <div className="emptyImg"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                    </Col> :
                        allProduct?.data?.map((item: producttype, index: number) => (
                            <Col key={index} className="pb-1 pt-1 ps-1 pe-1">
                                <div>
                                    <img src={item.image} />
                                    <div>
                                        <h6>{item.name}</h6>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5>AED {item.price}</h5>
                                            <button value={item._id} onClick={(e: any) => {
                                                const isFind = select?.find((item: any) => item._id == e.target.value)
                                                if (!isFind) {
                                                    changeData([...select, item])
                                                }
                                            }}>Add</button>
                                        </div>
                                    </div>

                                </div>
                            </Col>
                        ))}
                </Row>
                <div className="d-flex justify-content-center mt-3 mb-3">
                    <Pagination
                        defaultPageSize={20}
                        defaultCurrent={1}
                        total={count ?? 0}
                        onChange={(page, pageSize) => {
                            setPage(page);
                            setTake(pageSize);
                        }} />
                </div>
            </div >}

        </>
    )

}

export default SimiliarProductSubstitution