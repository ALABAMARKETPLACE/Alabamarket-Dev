"use client";
import React, { useState } from "react";
import { Container } from "react-bootstrap";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  notification,
  Modal,
  Spin,
  Space,
  Row,
  Col,
  Card,
  Tag,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileImageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { FiFileText, FiAlertCircle } from "react-icons/fi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { POST, PUT, DELETE, GET } from "@/util/apicall";
import API from "@/config/API";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import type { UploadFile } from "antd";
import "./style.scss";

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  content?: string;
  category?: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  author?: string;
  createdAt: string;
}

export default function ManageNewsPage() {
  const [form] = Form.useForm();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [videoFile, setVideoFile] = useState<UploadFile | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<UploadFile | null>(null);

  // Fetch all news
  const {
    data: newsListData,
    isLoading: isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryFn: async () => {
      const response = await GET(API.NEWS_AND_BLOGS_GETPGN, {
        page: 1,
        limit: 100,
      });
      return response as { data: NewsItem[] };
    },
    queryKey: ["manage_news"],
    retry: 2,
  });

  // Create/Update news mutation
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // FormData is serialized by the HTTP client
      const response = editingNews
        ? await PUT(
            API.NEWS_AND_BLOGS + editingNews.id,
            data as unknown as Record<string, unknown>,
          )
        : await POST(
            API.NEWS_AND_BLOGS,
            data as unknown as Record<string, unknown>,
          );
      return response;
    },
    onSuccess: () => {
      notificationApi.success({
        message: editingNews
          ? "News updated successfully"
          : "News created successfully",
      });
      form.resetFields();
      setImageFile(null);
      setVideoFile(null);
      setThumbnailFile(null);
      setEditingNews(null);
      setIsModalVisible(false);
      refetch();
    },
    onError: (error: Error | null) => {
      notificationApi.error({
        message: error?.message || "Failed to save news",
      });
    },
  });

  // Delete news mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await DELETE(API.NEWS_AND_BLOGS + id);
    },
    onSuccess: () => {
      notificationApi.success({ message: "News deleted successfully" });
      refetch();
    },
    onError: (error: Error | null) => {
      notificationApi.error({
        message: error?.message || "Failed to delete news",
      });
    },
  });

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      const formData = new FormData();
      formData.append("title", String(values.title));
      formData.append("description", String(values.description));
      formData.append("content", String(values.content || ""));
      formData.append("category", String(values.category || ""));
      formData.append("author", String(values.author || "Admin"));

      if (imageFile?.originFileObj) {
        formData.append("image", imageFile.originFileObj);
      }

      if (videoFile?.originFileObj) {
        formData.append("video", videoFile.originFileObj);
      }

      if (thumbnailFile?.originFileObj) {
        formData.append("thumbnail", thumbnailFile.originFileObj);
      }

      mutation.mutate(formData);
    } catch {
      notificationApi.error({ message: "Failed to process files" });
    }
  };

  const handleEdit = (news: NewsItem) => {
    setEditingNews(news);
    form.setFieldsValue({
      title: news.title,
      description: news.description,
      content: news.content,
      category: news.category,
      author: news.author,
    });
    setIsModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingNews(null);
    form.resetFields();
    setImageFile(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingNews(null);
    setImageFile(null);
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent auto-upload
    maxCount: 1,
  };

  return (
    <div className="manage-news-page">
      {contextHolder}
      <PageHeader
        title="Manage News & Updates"
        bredcume="Dashboard / Content / Manage News"
        icon={<FiFileText />}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          size="large"
          className="add-news-btn"
        >
          <span className="btn-text">Add New News</span>
          <span className="btn-text-mobile">Add</span>
        </Button>
      </PageHeader>

      <Container fluid className="news-container">
        {/* Add/Edit News Modal */}
        <Modal
          title={editingNews ? "Edit News" : "Add New News"}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
          className="news-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter news title" }]}
            >
              <Input placeholder="Enter news title" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={3} placeholder="Enter short description" />
            </Form.Item>

            <Form.Item label="Full Content" name="content">
              <Input.TextArea rows={5} placeholder="Enter full content" />
            </Form.Item>

            <Form.Item label="Category" name="category">
              <Select placeholder="Select category">
                <Select.Option value="News">News</Select.Option>
                <Select.Option value="Updates">Updates</Select.Option>
                <Select.Option value="Events">Events</Select.Option>
                <Select.Option value="Blog">Blog</Select.Option>
                <Select.Option value="Press Release">
                  Press Release
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Author" name="author">
              <Input placeholder="Author name (default: Admin)" />
            </Form.Item>

            <div className="upload-grid">
              <div className="upload-item">
                <Form.Item label="Featured Image">
                  <Upload
                    {...uploadProps}
                    accept="image/*"
                    fileList={imageFile ? [imageFile] : []}
                    onChange={(info) => setImageFile(info.fileList[0] || null)}
                  >
                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                  </Upload>
                </Form.Item>
              </div>

              <div className="upload-item">
                <Form.Item label="Video File">
                  <Upload
                    {...uploadProps}
                    accept="video/*"
                    fileList={videoFile ? [videoFile] : []}
                    onChange={(info) => setVideoFile(info.fileList[0] || null)}
                  >
                    <Button icon={<UploadOutlined />}>Upload Video</Button>
                  </Upload>
                </Form.Item>
              </div>

              <div className="upload-item">
                <Form.Item label="Video Thumbnail">
                  <Upload
                    {...uploadProps}
                    accept="image/*"
                    fileList={thumbnailFile ? [thumbnailFile] : []}
                    onChange={(info) =>
                      setThumbnailFile(info.fileList[0] || null)
                    }
                  >
                    <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                  </Upload>
                </Form.Item>
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
              >
                {editingNews ? "Update News" : "Create News"}
              </Button>
              <Button onClick={handleModalClose}>Cancel</Button>
            </div>
          </Form>
        </Modal>

        {/* News List */}
        <div className="news-list-section">
          <div className="news-list-header">
            <h2>News List</h2>
            {(newsListData?.data?.length ?? 0) > 0 && (
              <span className="news-count">
                {newsListData?.data?.length} articles
              </span>
            )}
          </div>

          {isFetching ? (
            <div className="news-loading">
              <Spin size="large" />
              <p>Loading news...</p>
            </div>
          ) : isError ? (
            <div className="news-error-state">
              <FiAlertCircle className="error-icon" />
              <h3>Unable to load news</h3>
              <p>
                {(error as Error)?.message ||
                  "There was a problem fetching the news list. Please check your connection and try again."}
              </p>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : newsListData?.data?.length === 0 ? (
            <div className="news-empty-state">
              <FileImageOutlined className="empty-icon" />
              <h3>No news articles yet</h3>
              <p>Get started by creating your first news article.</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
              >
                Add News
              </Button>
            </div>
          ) : (
            <Row gutter={[16, 16]} className="news-grid">
              {newsListData?.data?.map((news: NewsItem) => (
                <Col key={news.id} xl={6} lg={8} md={12} sm={12} xs={24}>
                  <Card
                    className="news-card"
                    hoverable
                    cover={
                      news.image || news.video ? (
                        <div className="news-card-cover">
                          {news.video ? (
                            <video
                              src={news.video}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={news.image}
                              alt={news.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="news-card-placeholder">
                          <FiFileText />
                        </div>
                      )
                    }
                    actions={[
                      <Tooltip title="Edit" key="edit">
                        <EditOutlined onClick={() => handleEdit(news)} />
                      </Tooltip>,
                      <Popconfirm
                        key={`delete-${news.id}`}
                        title="Delete News"
                        description="Are you sure you want to delete this news?"
                        onConfirm={() => deleteMutation.mutate(news.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete">
                          <DeleteOutlined style={{ color: "red" }} />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    <div className="news-card-content">
                      {news.category && <Tag color="blue">{news.category}</Tag>}
                      <h4 className="news-card-title">{news.title}</h4>
                      <p className="news-card-meta">
                        {news.author && `By ${news.author} • `}
                        {new Date(news.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>
    </div>
  );
}
