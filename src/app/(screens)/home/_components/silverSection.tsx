"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";
import { TbArrowRight } from "react-icons/tb";
import SectionBadge from "../../../../components/sectionBadge";

interface SilverSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
}

const TOTAL_ITEMS = 36;
const COLUMN_COUNTS = [12, 12, 12] as const;
const PANEL_TITLES = ["Silver Essentials", "Silver Spotlights", "Silver Finds"];

function SilverSection({ products = [] }: SilverSectionProps) {
  const router = useRouter();
  const silverProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products],
  );

  const columns = useMemo(() => {
    const limited = silverProducts.slice(0, TOTAL_ITEMS);
    const first = COLUMN_COUNTS[0] ?? 0;
    const second = (COLUMN_COUNTS[0] ?? 0) + (COLUMN_COUNTS[1] ?? 0);
    return [
      limited.slice(0, first),
      limited.slice(first, second),
      limited.slice(second, TOTAL_ITEMS),
    ];
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
                <SectionBadge
                  type="silver"
                  text="Silver"
                  className="homeSectionBadge"
                />
                <span className="homeSectionTitleText">
                  {PANEL_TITLES[index] ?? `Silver Picks ${index + 1}`}
                </span>
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
                See More <TbArrowRight />
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
