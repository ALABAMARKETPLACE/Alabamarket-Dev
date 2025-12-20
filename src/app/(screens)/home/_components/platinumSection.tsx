"use client";

import Image, { StaticImageData } from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";
import platinumImage from "@/assets/images/postion1.jpg";

interface PlatinumSectionProps {
  products: any[];
  title?: string;
  image?: StaticImageData | string;
}

const MAX_ITEMS = 10;

function PlatinumSection({
  products = [],
  title = "Platinum Deals",
  image = platinumImage,
}: PlatinumSectionProps) {
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
    <section className="platinum-section container-fluid home-full-width">
      <div className="platinum-section__wrapper">
        <div className="platinum-section__content">
          <div className="platinum-section__header">
            <div className="platinum-section__title">{title}</div>
            <span
              role="button"
              tabIndex={0}
              className="platinum-section__see-more"
              style={{ color: "#FF5F15" }}
              onClick={() =>
                router.push(`/products/view?type=featured&position=1`)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  router.push(`/products/view?type=featured&position=1`);
                }
              }}
            >
              See More
            </span>
          </div>
          <div className="platinum-section__grid">
            {displayedProducts.map((product, index) => (
              <div
                className="platinum-section__card"
                key={
                  product?.id ??
                  product?._id ??
                  product?.slug ??
                  `platinum-${index}`
                }
              >
                <ProductItem item={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="platinum-section__media" aria-hidden>
          <div className="platinum-section__media-inner">
            <Image
              src={image}
              alt="Platinum spotlight"
              fill
              sizes="(max-width: 991px) 100vw, 260px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlatinumSection;
