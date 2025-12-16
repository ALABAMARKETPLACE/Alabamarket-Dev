import API from "@/config/API";
import { store } from "@/redux/store/store";
import { message } from "antd";
import { useSession } from "next-auth/react";

const GET = async (
  url: string,
  params: Record<string, any> = {},
  signal: AbortSignal | null = null
) => {
  try {
    const token: any = store.getState()?.Auth?.token ?? " ";
    const queryParams = new URLSearchParams(params).toString();
    const URL = queryParams ? url + `?${queryParams}` : url;
    const response = await fetch(API.BASE_URL + URL, {
      ...(signal && { signal }),
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const POST = async (
  url: string,
  body: Record<string, any> = {},
  signal: AbortSignal | null = null
) => {
  try {
    const token: any = store.getState()?.Auth?.token ?? " ";
    const response = await fetch(API.BASE_URL + url, {
      ...(signal && { signal }),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const PUT = async (
  url: string,
  body: Record<string, any>,
  signal: AbortSignal | null = null
) => {
  try {
    const token = store.getState()?.Auth?.token ?? " ";
    const response = await fetch(API.BASE_URL + url, {
      ...(signal && { signal }),
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const PATCH = async (
  url: string,
  body: Record<string, any>,
  signal: AbortSignal | null = null
) => {
  try {
    const token: any = store.getState()?.Auth?.token ?? " ";
    const response = await fetch(API.BASE_URL + url, {
      ...(signal && { signal }),
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
const EXCEL_UPLOAD = async (
  file: any,
  category: number,
  subCategory: number
) => {
  return new Promise(async (resolve, reject) => {
    // const user: any = Store.getState()?.User?.user;
    const token = store.getState()?.Auth?.token ?? " ";

    try {
      if (file) {
        message.loading({
          type: "loading",
          content: "Action in progress..",
          duration: 1,
        });
        const formDataFiles = new FormData();
        formDataFiles.append("file", file);
        formDataFiles.append("category", String(category));
        formDataFiles.append("subCategory", String(subCategory));
        const fileUpload = await fetch(
          `${API.BASE_URL}${API.PRODUCT_UPLOAD_EXCEL}`,
          {
            method: "POST",
            body: formDataFiles,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const response = await fileUpload.json();
        resolve(response);
      } else {
        reject("no file selected");
      }
    } catch (err) {
      reject(err);
    }
  });
};
const DELETE = async (url: string, signal: AbortSignal | null = null) => {
  try {
    const token = store.getState()?.Auth?.token ?? " ";
    const response = await fetch(API.BASE_URL + url, {
      ...(signal && { signal }),
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
const COMPRESS_IMAGE = async (file: File) => {
  try {
    if (!file) return Promise.reject(new Error("No Image Is selected.."));
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API.BASE_URL}${API.IMAGE_COMPRESS}`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response?.ok)
      return Promise.reject(
        new Error(data?.message ?? "Something went wrong..")
      );
    return { ...data, url: data.Location, status: true };
  } catch (err: any) {
    return Promise.reject(new Error(err.message));
  }
};
const UPLOAD_IMAGES = async (files: any[]) => {
  const token = store.getState()?.Auth?.token ?? " ";

  // const user: any = store.getState()?.User?.user;
  return new Promise(async (resolve, reject) => {
    try {
      if (files?.length) {
        message.loading({
          type: "loading",
          content: "Action in progress..",
          duration: 1,
        });
        const formDataFiles = new FormData();
        if (Array.isArray(files)) {
          for (const file of files) {
            formDataFiles.append("files", file);
          }
        }
        const fileUpload = await fetch(
          `${API.BASE_URL}${API.PRODUCT_UPLOAD_IMAGES}`,
          {
            method: "POST",
            body: formDataFiles,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const response = await fileUpload.json();
        resolve(response);
      } else {
        reject("no file selected");
      }
    } catch (err) {
      reject(err);
    }
  });
};
const DOCUMENT_UPLOAD = async (file: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (file) {
        message.loading({
          type: "loading",
          content: "Action in progress..",
          duration: 1,
        });
        const formDataFiles = new FormData();
        formDataFiles.append("file", file);
        const fileUpload = await fetch(`${API.BASE_URL}${API.FILE_UPLOAD}`, {
          method: "POST",
          body: formDataFiles,
        });
        if (fileUpload.ok) {
          const jsonResponse = await fileUpload.text();
          resolve(jsonResponse);
        } else {
          reject("Failed to upload file");
        }
      } else {
        reject("no file selected");
      }
    } catch (err) {
      reject(err);
    }
  });
};

const VIDEO_UPLOAD = async (file: File) => {
  try {
    if (!file) return Promise.reject(new Error("No video file selected"));

    // Check file size (max 100MB)
    const maxSize = 50 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return Promise.reject(
        new Error("Video file size must be less than 50MB")
      );
    }

    // Check file type
    const validTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      return Promise.reject(
        new Error("Please upload a valid video file (MP4, MOV, AVI, WEBM)")
      );
    }

    message.loading({
      type: "loading",
      content: "Uploading video...",
      duration: 0, // Keep loading until done
      key: "video-upload",
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API.BASE_URL}${API.VIDEO_UPLOAD}`, {
      method: "POST",
      body: formData,
    });

    message.destroy("video-upload");

    if (!response?.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to upload video";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return Promise.reject(new Error(errorMessage));
    }

    const data = await response.json();
    message.success("Video uploaded successfully!");
    return { ...data, url: data.url || data.Location, status: true };
  } catch (err: any) {
    message.destroy("video-upload");
    return Promise.reject(new Error(err.message));
  }
};

export {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  COMPRESS_IMAGE,
  DOCUMENT_UPLOAD,
  UPLOAD_IMAGES,
  EXCEL_UPLOAD,
  VIDEO_UPLOAD,
};
