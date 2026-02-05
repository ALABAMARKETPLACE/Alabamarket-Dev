"use client";
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Input, Pagination, Empty, Spin, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import NewsCard from "./_components/newsCard";
import "./styles.scss";

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  content?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  views?: number;
}

interface NewsResponse {
  data: NewsItem[];
  total?: number;
  page?: number;
  limit?: number;
}

export default function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 12;

  const { data: newsData, isLoading } = useQuery({
    queryFn: async () => {
      const response = await GET(
        `${API.NEWS_AND_BLOGS_GETPGN}?page=${currentPage}&limit=${pageSize}`
      );
      return response as NewsResponse;
    },
    queryKey: ["news_list", currentPage],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter news based on search term
  const filteredNews = newsData?.data?.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="news-page">
      <PageHeader
        title="News & Updates"
        bredcume="Home / News & Updates"
      >
        <Button type="primary" href="/auth/news/manage">
          Manage News (Admin)
        </Button>
      </PageHeader>

      <Container fluid className="news-container">
        {/* Search Bar */}
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Input.Search
              placeholder="Search news..."
              size="large"
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="news-search"
            />
          </Col>
        </Row>

        {/* News Grid */}
        {isLoading ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : filteredNews.length > 0 ? (
          <>
            <Row className="g-4">
              {filteredNews.map((news) => (
                <Col key={news.id} lg={4} md={6} sm={12}>
                  <NewsCard news={news} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {newsData?.total && newsData.total > pageSize && (
              <div className="news-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={newsData.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="No news found" />
        )}
      </Container>
    </div>
  );
}
