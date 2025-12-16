import { Skeleton } from "antd";
import React from "react";
interface props {
  count?: number;
  size?: "sm" | "lg" | "md" | "xsm" | "xlg" | "xxlg";
  rows?: number;
  className?: string;
}
function generateArray(n: number) {
  return Array.from({ length: n }, (_, index) => index + 1);
}
function SkeletonLoading({ count, size, rows, className }: props) {
  const data = count ? generateArray(count) : [1, 2, 3];
  const row = rows ? generateArray(rows) : [1];
  return (
    <div className={`skeleton d-flex flex-column gap-3 ${className ?? ""}`}>
      {row.map((item, key) => (
        <div className="row gy-2 mb-2" key={key}>
          {data.map((item, index: number) => {
            return (
              <div
                className={`col-md-${
                  count == 2
                    ? "6"
                    : count == 3
                    ? "4"
                    : count == 1
                    ? "12"
                    : count == 4
                    ? "3"
                    : "4"
                }`}
                key={index}
              >
                <Skeleton.Button
                  active={true}
                  size={"large"}
                  shape={"square"}
                  block={true}
                  style={{
                    height:
                      size == "lg"
                        ? "300px"
                        : size == "sm"
                        ? "180px"
                        : size == "xlg"
                        ? "350px"
                        : size == "xsm"
                        ? "140px"
                        : size == "xxlg"
                        ? "500px"
                        : "230px",
                    width: "100%",
                    marginRight: 10,
                  }}
                ></Skeleton.Button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoading;
