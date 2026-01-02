"use client";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import ProductItem from "@/components/productItem/page";
import { GET } from "@/util/apicall";
import API from "@/config/API";

type Props = {
  data: any;
};

function RelatedProducts({ data }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If backend already provides relatedProducts, use them
    if (Array.isArray(data?.relatedProducts) && data.relatedProducts.length > 0) {
      setSuggestions(data.relatedProducts);
      return;
    }

    // Otherwise, fetch suggestions based on category or tags
    const fetchSuggestions = async () => {
      if (!data?.categoryId && !data?.category_id) return;
      
      setLoading(true);
      try {
        const categoryId = data.categoryId || data.category_id;
        // Use the product search endpoint filtering by category
        // Exclude current product ID
        const url = `${API.PRODUCT_SEARCH_NEW_SINGLE}?take=8&category=${categoryId}`;
        const res: any = await GET(url, {});
        
        if (res?.status && Array.isArray(res?.data)) {
          // Filter out the current product from suggestions
          const currentId = String(data.id || data._id);
          const filtered = res.data.filter((item: any) => {
            const itemId = String(item.id || item._id);
            return itemId !== currentId;
          });
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related products", err);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      fetchSuggestions();
    }
  }, [data]);

  if (!loading && !suggestions.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="mb-3">You might also like...</h4>
      <Row>
        {suggestions.map((item: any) => (
          <Col
            sm="4"
            md="3"
            className="px-2 py-2 col-6 lg-25"
            key={item?._id ?? item?.id ?? item?.slug}
          >
            <ProductItem item={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default RelatedProducts;
