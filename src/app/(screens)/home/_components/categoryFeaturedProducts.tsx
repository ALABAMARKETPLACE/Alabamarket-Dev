"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Col, Container, Row } from "react-bootstrap";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import ProductItem from "../../../../components/productItem/page";
import { GET } from "../../../../util/apicall";
import API from "../../../../config/API";
import { useRouter } from "next/navigation";
import Loading from "../../../../components/loading";
import "./categoryFeaturedProducts.scss";

interface CategoryFeaturedProductsProps {
  categories: any[];
}

function CategoryFeaturedProducts({
  categories,
}: CategoryFeaturedProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasScrollBar, setHasScrollBar] = useState(false);
  const [rightButtonClicked, setRightButtonClicked] = useState(false);
  const [selectedTags, setSelectedTags] = useState([
    { status: true, value: "ASC", title: "New" },
    { status: false, value: "ASC", title: "Price: High to Low" },
    { status: false, value: "ASC", title: "Price: Low to High" },
  ]);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Set the first category as selected by default
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Fetch products for the selected category and selected tag (sort/filter)
  const fetchProducts = useCallback(async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const categoryId = selectedCategory._id;
      // Determine price/order from selectedTags
      const price = selectedTags[1].status
        ? "DESC"
        : selectedTags[2].status
        ? "ASC"
        : "RAND";
      const order = selectedTags[0].value;

      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("take", "12");
      params.set("subCategory", categoryId);
      params.set("price", price);
      params.set("order", order);

      const response: any = await GET(
        `${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${params.toString()}`
      );
      if (response?.status) {
        const data = Array.isArray(response?.data) ? response?.data : [];
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products for category:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedTags]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedTags, fetchProducts]);
  // Handle tag click (filter/sort)
  const handleTagClick = (index: number) => {
    const newTags = [...selectedTags];
    const activeIndex = newTags.findIndex((item) => item.status);
    if (activeIndex !== -1 && activeIndex !== index) {
      newTags[activeIndex].status = false;
      newTags[activeIndex].value = "ASC";
    }
    newTags[index].status = !newTags[index].status;
    newTags[index].value = newTags[index].status ? "DESC" : "ASC";
    setSelectedTags(newTags);
  };

  const scroll = (ratio: number) => {
    if (ref.current) {
      const currentScrollLeft = ref.current.scrollLeft;
      ref.current.scrollLeft += ratio;

      if (ratio > 0 && !rightButtonClicked) {
        setRightButtonClicked(true);
      }

      if (ratio < 0 && rightButtonClicked && ref.current.scrollLeft <= 0) {
        setRightButtonClicked(false);
      }
    }
  };

  useEffect(() => {
    function updateState() {
      const el = ref.current;
      el &&
        setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width + 50);
    }
    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, [products]);

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
  };

  const handleSeeMore = () => {
    if (selectedCategory?._id) {
      const encodedId = window.btoa(selectedCategory._id);
      router.push(
        `/category/${
          selectedCategory?.slug || selectedCategory?._id
        }?id=${encodedId}&type=${encodeURIComponent(selectedCategory?.name)}`
      );
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Container fluid className="home-full-width category-featured-wrapper">
      {/* Category Selection Lines */}
      <div className="category-lines-section">
        <div className="category-lines-title">Shop by Category Lines</div>
        <div className="category-lines-scroll position-relative">
          <div className="category-lines-container">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`category-line-item ${
                  selectedCategory?._id === category._id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-line-image">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />
                </div>
                <div className="category-line-label">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products for Selected Category */}
      {selectedCategory && (
        <div className="category-products-section">
          <div className="section-header">
            <div className="section-title">
              Featured {selectedCategory.name} Products
            </div>
            <button className="see-more-btn" onClick={handleSeeMore}>
              View All
            </button>
          </div>

          {/* Tags/Filters (sync with /category page) */}
          <div style={{ marginBottom: 16 }}>
            {selectedTags.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: 8,
                  padding: "6px 14px",
                  borderRadius: 16,
                  background: tag.status ? "#ff6b35" : "#f5f5f5",
                  color: tag.status ? "#fff" : "#333",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  border: tag.status
                    ? "1.5px solid #ff6b35"
                    : "1.5px solid #eee",
                  transition: "all 0.2s",
                }}
                onClick={() => handleTagClick(i)}
              >
                {tag.title}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="loading-container">
              <Loading />
            </div>
          ) : products.length > 0 ? (
            <div className="products-scroll position-relative">
              <Row
                className="flex-parent mx-0 gap-2 gap-md-3 ps-2 ps-md-0"
                style={{
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                }}
                ref={ref}
              >
                {products.map((product, index) => (
                  <Col sm="4" md="3" className="col-6 px-0 lg-25" key={index}>
                    <ProductItem item={product} />
                  </Col>
                ))}
              </Row>

              {hasScrollBar ? (
                <>
                  {rightButtonClicked && (
                    <button
                      className="Horizontal-btn1 position-absolute slider-btn-left"
                      onClick={() => scroll(-800)}
                    >
                      <MdArrowBack />
                    </button>
                  )}
                  <button
                    className="Horizontal-btn2 slider-btn-right position-absolute"
                    onClick={() => scroll(800)}
                  >
                    <MdOutlineArrowForward />
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <div className="no-products">
              <p>No products available in this category</p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

export default CategoryFeaturedProducts;
