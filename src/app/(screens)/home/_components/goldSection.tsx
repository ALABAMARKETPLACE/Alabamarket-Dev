"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";
import { TbArrowRight } from "react-icons/tb";
import SectionBadge from "../../../../components/sectionBadge";

interface Product {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  [key: string]: unknown;
}

interface GoldSectionProps {
  products: Product[];
}

const PRIMARY_COUNT = 12;
const SECONDARY_COUNT = 12;

function GoldSection({ products = [] }: GoldSectionProps) {
  const router = useRouter();
  const goldProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products],
  );

  const primaryProducts = goldProducts.slice(0, PRIMARY_COUNT);
  const secondaryProducts = goldProducts.slice(
    PRIMARY_COUNT,
    PRIMARY_COUNT + SECONDARY_COUNT,
  );

  if (!primaryProducts.length) {
    return null;
  }

  const renderGrid = (items: Product[], keyPrefix: string) => (
    <div className="gold-section__grid">
      {items.map((product, index) => (
        <div
          className="gold-section__card"
          key={
            product?.id ??
            product?._id ??
            product?.slug ??
            `${keyPrefix}-${index}`
          }
        >
          <ProductItem item={product} />
        </div>
      ))}
    </div>
  );

  const handleSeeMore = () =>
    router.push(`/products/view?type=featured&position=2`);

  const renderHeader = (title: string) => (
    <div className="gold-section__panel-header">
      <div className="gold-section__panel-title">
        <SectionBadge type="gold" text="Gold" className="homeSectionBadge" />
        <span className="homeSectionTitleText">{title}</span>
      </div>
      <span
        role="button"
        tabIndex={0}
        className="gold-section__see-more"
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
  );

  return (
    <section className="gold-section container-fluid home-full-width">
      <div className="gold-section__wrapper">
        <div className="gold-section__panel">
          {renderHeader("Gold Edition")}
          {primaryProducts.length ? (
            renderGrid(primaryProducts, "gold-primary")
          ) : (
            <div className="gold-section__empty">No products available</div>
          )}
        </div>
        {secondaryProducts.length > 0 && (
          <div className="gold-section__panel">
            {renderHeader("Golden Picks")}
            {renderGrid(secondaryProducts, "gold-secondary")}
          </div>
        )}
      </div>
    </section>
  );
}

export default GoldSection;
