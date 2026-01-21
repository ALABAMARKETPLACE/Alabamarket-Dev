"use Client";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import { useEffect, useState } from "react";
import { notification, Pagination, Empty } from "antd";
import { Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";
import "../../orders/Style.scss";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Image } from "antd";

type producttype = { _id: number; image: string; name: string; price: string };
interface storeProduct {
  storeId: number;
  subCategory?: number;
  query?: string;
  page: number;
  take: number;
  instock: boolean;
  order: string;
  [key: string]: unknown;
}
interface CategoryItem {
  _id: number | string;
  name: string;
}

interface ProductResponse {
  data: producttype[];
  meta: {
    itemCount: number;
  };
}

interface props {
  select: producttype[];
  changeData: (newSelect: producttype[]) => void;
}
const SimiliarProductSubstitution = ({ select, changeData }: props) => {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [allProduct, setAllProduct] = useState<ProductResponse | []>([]);
  const [page, setPage] = useState<number>(1);
  const [take, setTake] = useState<number>(20);
  const [count, setCount] = useState<number>();
  const [category, setCategory] = useState<CategoryItem[]>();
  const [searchInp, setSearchInp] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [selectCategory, setSelectCategory] = useState<string | number>("");

  const { data: session } = useSession() as {
    data: { user: { store_id: number } } | null;
  };

  useEffect(() => {
    const categories = async () => {
      try {
        const response: unknown = await GET(API.STORE_SEARCH_GETINFO);
        const data = response as { data: { category: CategoryItem[] } };
        setCategory(data.data.category);
      } catch {
        notificationApi.error({ message: `Ooops something went wrong...!` });
      }
    };
    categories();
  }, [notificationApi]);

  useEffect(() => {
    const getData = async () => {
      // Define urls inside the effect to avoid dependency issues
      const currentUrls: storeProduct = {
        storeId: session?.user?.store_id ?? 0,
        subCategory:
          typeof selectCategory === "number" ? selectCategory : undefined,
        query: search,
        page: page,
        take: take,
        instock: true,
        order: "DESC",
      };

      try {
        const response: unknown = await GET(
          API.PRODUCT_SEARCH_NEW_SINGLE,
          currentUrls,
        );
        const data = response as ProductResponse;
        setAllProduct(data);
        setCount(data.meta.itemCount);
      } catch {
        notificationApi.error({ message: `Ooops something went wrong...!` });
      }
    };
    getData();
  }, [
    page,
    search,
    selectCategory,
    session?.user?.store_id,
    take,
    notificationApi,
  ]);

  return (
    <>
      {contextHolder}
      <h5>Select Similiar Product</h5>
      {Array.isArray(allProduct) && allProduct.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      ) : (
        <div>
          <div className="d-flex mt-3 mb-3 searchInp">
            <input
              placeholder="Search products"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInp(e.target.value)
              }
            ></input>
            <button onClick={() => setSearch(searchInp)}>Search</button>
          </div>

          <div className="d-flex category">
            <button
              className={`${selectCategory == "" ? "active" : ""}`}
              name="all"
              onClick={() => setSelectCategory("")}
            >
              All
            </button>
            {category?.map((item: CategoryItem, index: number) => (
              <button
                className={`${item._id == selectCategory ? "active" : ""}`}
                key={index}
                name={String(item._id)}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  setSelectCategory(e.currentTarget.name)
                }
              >
                {item.name}
              </button>
            ))}
          </div>

          <Row md={5} className="productsList mt-3">
            {(Array.isArray(allProduct) ? [] : allProduct.data)?.length == 0 ? (
              <Col style={{ width: "100%" }}>
                <div className="emptyImg">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              </Col>
            ) : (
              (Array.isArray(allProduct) ? [] : allProduct.data)?.map(
                (item: producttype, index: number) => (
                  <Col key={index} className="pb-1 pt-1 ps-1 pe-1">
                    <div>
                      <Image src={item.image} alt={item.name} />
                      <div>
                        <h6>{item.name}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5>AED {item.price}</h5>
                          <button
                            value={item._id}
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                              const isFind = select?.find(
                                (p: producttype) =>
                                  p._id == Number(e.currentTarget.value),
                              );
                              if (!isFind) {
                                changeData([...select, item]);
                              }
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>
                ),
              )
            )}
          </Row>
          <div className="d-flex justify-content-center mt-3 mb-3">
            <Pagination
              defaultPageSize={20}
              defaultCurrent={1}
              total={count ?? 0}
              onChange={(page, pageSize) => {
                setPage(page);
                setTake(pageSize);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SimiliarProductSubstitution;
