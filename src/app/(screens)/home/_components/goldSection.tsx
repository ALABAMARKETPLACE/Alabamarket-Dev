"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "../../../../components/productItem/page";
import positionImage from "@/assets/images/position2.jpg";
import { TbArrowRight } from "react-icons/tb";

interface Product {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  [key: string]: unknown;
}

interface GoldSectionProps {
  products: Product[];
}

const PRIMARY_COUNT = 4;
const SECONDARY_COUNT = 4;

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

  if (!primaryProducts.length && !secondaryProducts.length) {
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
      <div
        className="gold-section__panel-title"
        style={{ display: "flex", alignItems: "center" }}
      >
        {title}
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
        <div className="gold-section__panel">
          {renderHeader("Golden Picks")}
          {secondaryProducts.length ? (
            renderGrid(secondaryProducts, "gold-secondary")
          ) : (
            <div className="gold-section__empty">No products available</div>
          )}
        </div>
        <div className="gold-section__panel gold-section__panel--media">
          <Image
            src={positionImage}
            alt="Gold highlights"
            fill
            sizes="(max-width: 991px) 100vw, 320px"
            priority={false}
            style={{ objectFit: "fill" }}
          />
        </div>
      </div>
    </section>
  );
}

export default GoldSection;
