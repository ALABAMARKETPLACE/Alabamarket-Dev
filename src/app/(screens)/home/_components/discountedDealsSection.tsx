"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";
import { TbArrowRight } from "react-icons/tb";

interface DiscountedDealsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  title?: string;
}

const MAX_ITEMS = 12; // Increased from 10 to fit new grid layout (6x2 or 4x3)

function DiscountedDealsSection({
  products = [],
  title = "Discounted Deals",
}: DiscountedDealsSectionProps) {
  const router = useRouter();
  const displayedProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
    }
    return products.slice(0, MAX_ITEMS);
  }, [products]);

  if (!displayedProducts.length) {
    return null;
  }

  return (
    <section className="discounted-section container-fluid home-full-width">
      <div className="discounted-section__wrapper">
        <div className="discounted-section__content">
          <div className="discounted-section__header">
            <div
              className="discounted-section__title"
              style={{ display: "flex", alignItems: "center" }}
            >
              {title}
            </div>
            <span
              role="button"
              tabIndex={0}
              className="discounted-section__see-more"
              onClick={() =>
                router.push(`/products/view?type=featured&position=discounted`)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  router.push(
                    `/products/view?type=featured&position=discounted`,
                  );
                }
              }}
            >
              See More <TbArrowRight />
            </span>
          </div>
          <div className="discounted-section__grid">
            {displayedProducts.map((product, index) => (
              <div
                className="discounted-section__card"
                key={
                  product?.id ??
                  product?._id ??
                  product?.slug ??
                  `discounted-${index}`
                }
              >
                <ProductItem item={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DiscountedDealsSection;
