"use client";
import API from "@/config/API";
import API_ADMIN from "@/config/API_ADMIN";
import { GET } from "@/util/apicall";
import { useEffect, useState } from "react";
import { notification, Pagination, Empty } from "antd";
import { Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";
import "../../orders/Style.scss";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Image } from "antd";

type producttype = { _id: number; image: string; name: string; price?: string };

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
  isAdmin?: boolean;
}

const SimiliarProductSubstitution = ({ select, changeData, isAdmin }: props) => {
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
        const response: unknown = await GET(API_ADMIN.SUBCATEGORY_LIST, {
          take: 100,
          order: "ASC",
        });
        const data = response as { data: CategoryItem[] };
        setCategory(data.data);
      } catch {
        notificationApi.error({ message: `Ooops something went wrong...!` });
      }
    };
    categories();
  }, [notificationApi]);

  useEffect(() => {
    const getData = async () => {
      try {
        let response: unknown;

        if (isAdmin) {
          // Admin: search across all products in the platform
          // PRODUCT_SEARCH_NEW_MULTI returns store groups: { data: [{products:[{pid,image,name,retail_rate}]}], meta }
          const params: Record<string, unknown> = {
            query: search ?? "",
            page,
            take,
            order: "DESC",
          };
          if (selectCategory !== "") {
            params.subCategory = Number(selectCategory);
          }
          const raw = await GET(API.PRODUCT_SEARCH_NEW_MULTI, params) as any;
          // Flatten store groups into a single product list, normalising field names
          const storeGroups: any[] = Array.isArray(raw?.data) ? raw.data : [];
          const flatProducts: producttype[] = storeGroups.flatMap((store: any) =>
            (store.productList ?? store.products ?? []).map((p: any) => ({
              ...p, // preserve all original fields (pid, id, etc.) for fallback
              _id: p.pid ?? p._id ?? p.id,
              name: p.name,
              image: p.image,
              price: String(p.retail_rate ?? p.price ?? ""),
            }))
          );
          setAllProduct({ data: flatProducts, meta: { itemCount: raw?.meta?.itemCount ?? flatProducts.length } });
          setCount(raw?.meta?.itemCount ?? flatProducts.length);
          return;
        } else {
          // Seller: search within their own store only
          const params: Record<string, unknown> = {
            storeId: session?.user?.store_id ?? 0,
            query: search,
            page,
            take,
            instock: true,
            order: "DESC",
          };
          if (selectCategory !== "") {
            params.subCategory = Number(selectCategory);
          }
          response = await GET(API.PRODUCT_SEARCH_NEW_SINGLE, params);
          const data = response as ProductResponse;
          setAllProduct(data);
          setCount(data.meta.itemCount);
        }
      } catch {
        notificationApi.error({ message: `Ooops something went wrong...!` });
      }
    };
    getData();
  }, [isAdmin, page, search, selectCategory, session?.user?.store_id, take, notificationApi]);

  return (
    <>
      {contextHolder}
      <h5>Select {isAdmin ? "Replacement" : "Similar"} Product</h5>
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
                      <Image src={item.image} alt={item.name} preview={false} />
                      <div>
                        <h6>{item.name}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5>{item.price}</h5>
                          <button
                            type="button"
                            onClick={() => {
                              const rawId =
                                item._id ??
                                (item as any).pid ??
                                (item as any).id ??
                                (item as any).product_id;
                              const numId = Number(rawId);
                              if (isNaN(numId)) return;
                              const isFind = select?.find(
                                (p: producttype) => p._id === numId,
                              );
                              if (!isFind) {
                                changeData([...select, { ...item, _id: numId }]);
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
