import { Popover } from "antd";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
const getCategoryId = (cid: any): string => {
  try {
    return window.atob(String(cid));
  } catch (err) {
    return "0";
  }
};
function containsId(arr: any[], id: string): boolean {
  return arr.some((item) => item._id == id);
}
function CateogreyList() {
  const navigation = useRouter();
  const { t } = useTranslation();
  const { data: User }: any = useSession();
  const Category = useSelector((state: any) => state?.Category?.categries);
  const [show, setShow] = useState(true);
  const searchParams = useSearchParams();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openStates, setOpenStates] = useState(
    Array.isArray(Category) ? Category.map((item: any) => false) : [false]
  );
  const [popOver, setPopover] = useState(false);
  const [popIndex, setPopIndex] = useState(100);
  const subcId = useMemo(() => {
    return getCategoryId(searchParams.get("id"));
  }, [searchParams.get("id")]);
  const controlNavbar = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  const onPopoverChange = (open: boolean, index: number) => {
    if (popOver == true || popIndex != index) {
      setOpenStates((state: boolean[]) => {
        return state?.map((value, i) => (i === index ? !value : value));
      });
    }
    setPopover(() => true);
    setPopIndex(() => index);
  };
  return (
    <div className={`Header-deskCateogrey container-fluid`}>
      <div className="Header-deskcat-2">
        {/* Sign Up Option - Only visible when user is not logged in */}
        {!User?.user ? (
          <div
            style={{ paddingRight: 10, paddingLeft: 5 }}
            className="Header-deskCatItem"
            onClick={() => navigation.push("/signup")}
          >
            <div style={{ marginRight: 10 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>BECOME A USER</div>
          </div>
        ) : null}
        {Category && Category.length
          ? Category.map((item: any, index: number) => {
              return (
                <Popover
                  key={index}
                  arrow={false}
                  placement="bottomRight"
                  trigger={"hover"}
                  // visible={openStates?.[index]}
                  // onVisibleChange={() => {
                  //   setOpenStates((state: boolean[]) => {
                  //     return state?.map((value, i) =>
                  //       i === index ? !value : value
                  //     );
                  //   });
                  // }}
                  open={openStates?.[index]}
                  onOpenChange={(open) => onPopoverChange(open, index)}
                  content={
                    <div style={{ width: "50vw" }}>
                      <Row>
                        <Col sm={7}>
                          <div className="Header-deskCatItemtxt1">
                            {item?.name}
                          </div>
                          <div className="Header-deskCatItemline" />
                          {item?.sub_categories?.length
                            ? item?.sub_categories?.map(
                                (sub: any, key: number) => {
                                  return (
                                    <Col key={key} sm={6}>
                                      <div
                                        className={`Header-deskCatItem3 ${
                                          subcId == sub?._id
                                            ? "text-color-primary1"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          setPopover(() => false);
                                          setPopIndex(() => index);
                                          setOpenStates((state: boolean[]) => {
                                            return Category?.map(() => false);
                                          });
                                          navigation.push(
                                            `/category/${
                                              sub?.slug
                                            }?id=${window.btoa(
                                              sub?._id
                                            )}&type=${encodeURIComponent(
                                              sub?.name
                                            )}`
                                          );
                                        }}
                                      >
                                        {sub.name}
                                      </div>
                                    </Col>
                                  );
                                }
                              )
                            : null}
                        </Col>
                        <Col sm={5}>
                          <div className="Header-deskCatItemBox">
                            <img
                              src={item?.image}
                              className="Header-deskCatItemImg"
                              alt=""
                            />
                            <br />
                            <div className="Header-deskCatItemtxt2">
                              {item?.description}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  }
                >
                  <div
                    className={`Header-deskCatItem ${
                      containsId(item?.sub_categories, subcId)
                        ? "text-color-primary1"
                        : ""
                    }`}
                  >
                    {item && item.name}
                  </div>
                </Popover>
              );
            })
          : null}
      </div>
    </div>
  );
}
export default CateogreyList;
