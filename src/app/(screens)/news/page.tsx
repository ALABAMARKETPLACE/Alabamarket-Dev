"use client";
import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Input, Pagination, Empty, Spin, Button, Result } from "antd";
import { CalendarOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import NewsCard from "./_components/newsCard";
import { FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const pageSize = 12;

  const {
    data: newsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      const response = await GET(API.NEWS_AND_BLOGS, {
        page: currentPage,
        limit: pageSize,
      });
      const data = Array.isArray((response as { data?: unknown })?.data)
        ? (response as { data: NewsItem[] }).data
        : Array.isArray(response)
          ? (response as NewsItem[])
          : [];
      const total = (response as { total?: number })?.total ?? data.length;
      return { data, total } as NewsResponse;
    },
    queryKey: ["news_list", currentPage],
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const filteredNews = useMemo(() => {
    if (!newsData?.data) return [];
    return newsData.data.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [newsData, searchTerm]);

  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const otherNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="news-page">
      {/* Hero Header */}
      <div className="news-page-header">
        <Container fluid>
          <span className="news-header-badge">Latest Updates</span>
          <h1 className="news-page-title">News &amp; Updates</h1>
          <p className="news-page-subtitle">
            Stay informed with the latest news, announcements, and stories from
            Alaba Marketplace
          </p>
        </Container>
      </div>

      <Container fluid className="news-container">
        {/* Search */}
        <Row className="mb-5">
          <Col lg={7} className="mx-auto news-search-wrap">
            <Input
              placeholder="Search articles..."
              size="large"
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              suffix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              className="news-search"
            />
          </Col>
        </Row>

        {/* Loading */}
        {isLoading ? (
          <div className="news-loading-state">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <div className="news-error-state">
            <Result
              status="warning"
              title="Unable to load news"
              subTitle={
                (error as Error)?.message ||
                "We're having trouble fetching the latest news. Please try again."
              }
              extra={
                <Button
                  type="primary"
                  icon={<FiRefreshCw />}
                  onClick={() => refetch()}
                  loading={isFetching}
                  style={{ background: "#ff5f15", borderColor: "#ff5f15", borderRadius: 8 }}
                >
                  Try Again
                </Button>
              }
            />
          </div>
        ) : filteredNews.length > 0 ? (
          <>
            {/* Featured Article */}
            {featuredNews && (
              <Row className="mb-5">
                <Col xs={12}>
                  <p className="news-section-label">Top Story</p>
                  <div
                    className="featured-news-card"
                    onClick={() => router.push(`/news/${featuredNews.id}`)}
                  >
                    {/* Image side */}
                    <div className="featured-news-media">
                      {featuredNews.image || featuredNews.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredNews.image || featuredNews.thumbnail}
                          alt={featuredNews.title}
                          className="featured-news-image"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)",
                          }}
                        />
                      )}
                    </div>

                    {/* Content side */}
                    <div className="featured-news-content">
                      {featuredNews.category && (
                        <span className="featured-news-category">
                          {featuredNews.category}
                        </span>
                      )}
                      <h2 className="featured-news-title">
                        {featuredNews.title}
                      </h2>
                      <p className="featured-news-description">
                        {featuredNews.description?.substring(0, 200)}
                        {featuredNews.description &&
                        featuredNews.description.length > 200
                          ? "…"
                          : ""}
                      </p>
                      <div className="featured-news-meta">
                        <span>
                          <CalendarOutlined />
                          {new Date(featuredNews.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                        {featuredNews.author && (
                          <span>
                            <UserOutlined />
                            {featuredNews.author}
                          </span>
                        )}
                      </div>
                      <span className="featured-news-cta">
                        Read Full Story&nbsp;→
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {/* News Grid */}
            {otherNews.length > 0 && (
              <>
                <p className="news-section-label">More Articles</p>
                <p className="news-section-title">Latest News</p>
                <Row className="g-4">
                  {otherNews.map((news) => (
                    <Col key={news.id} lg={4} md={6} sm={12}>
                      <NewsCard news={news} />
                    </Col>
                  ))}
                </Row>
              </>
            )}

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
          <div className="news-empty-state">
            <Empty description="No articles found" />
          </div>
        )}
      </Container>
    </div>
  );
}
