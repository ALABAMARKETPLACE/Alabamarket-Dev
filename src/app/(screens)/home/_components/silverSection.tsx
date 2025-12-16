"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";

interface SilverSectionProps {
  products: any[];
}

const ITEMS_PER_COLUMN = 4;
const COLUMNS = 3;
const PANEL_TITLES = ["Silver Essentials", "Silver Spotlights", "Silver Finds"];

function SilverSection({ products = [] }: SilverSectionProps) {
  const router = useRouter();
  const silverProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  const columns = useMemo(() => {
    return Array.from({ length: COLUMNS }, (_, columnIndex) => {
      const start = columnIndex * ITEMS_PER_COLUMN;
      const end = start + ITEMS_PER_COLUMN;
      return silverProducts.slice(start, end);
    });
  }, [silverProducts]);

  const hasContent = columns.some((list) => list.length > 0);
  if (!hasContent) {
    return null;
  }

  const handleSeeMore = () =>
    router.push(`/products/view?type=featured&position=3`);

  return (
    <section className="silver-section container-fluid home-full-width">
      <div className="silver-section__wrapper">
        {columns.map((items, index) => (
          <div className="silver-section__panel" key={`silver-panel-${index}`}>
            <div className="silver-section__panel-header">
              <div className="silver-section__panel-title">
                {PANEL_TITLES[index] ?? `Silver Picks ${index + 1}`}
              </div>
              <span
                role="button"
                tabIndex={0}
                className="silver-section__see-more"
                onClick={handleSeeMore}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleSeeMore();
                  }
                }}
              >
                See More
              </span>
            </div>
            {items.length ? (
              <div className="silver-section__grid">
                {items.map((product, innerIndex) => (
                  <div
                    className="silver-section__card"
                    key={
                      product?.id ??
                      product?._id ??
                      product?.slug ??
                      `silver-${index}-${innerIndex}`
                    }
                  >
                    <ProductItem item={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="silver-section__empty">No silver items</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default SilverSection;


