import API from "@/config/API";
import { store } from "@/redux/store/store";
import { message } from "antd";

const getFullUrl = (url: string): string => {
  if (!url) return "";
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = API.BASE_URL.endsWith("/")
      ? API.BASE_URL
      : `${API.BASE_URL}/`;
    return new URL(url, baseUrl).toString();
  } catch {
    const baseUrl = API.BASE_URL.endsWith("/")
      ? API.BASE_URL
      : `${API.BASE_URL}/`;
    return baseUrl + url;
  }
};

interface AuthState {
  Auth?: {
    token?: string;
  };
}
// comss
const GET = async (
  url: string,
  params: Record<string, unknown> = {},
  signal: AbortSignal | null = null,
  opts?: { token?: string; headers?: Record<string, string> },
) => {
  try {
    const state = store.getState() as AuthState;
    const token: string = opts?.token ?? state?.Auth?.token ?? " ";
    // Convert params to string-compatible format for URLSearchParams
    const cleanParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const queryParams = new URLSearchParams(cleanParams).toString();
    const URL = queryParams ? url + `?${queryParams}` : url;
    const response = await fetch(getFullUrl(URL), {
      ...(signal && { signal }),
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(opts?.headers ?? {}),
      },
    });
    if (!response.ok) {
      let messageText = "Something went wrong";
      try {
        const raw = await response.text();
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            messageText = parsed?.message || messageText;
          } catch {
            messageText = raw;
          }
        }
      } catch {}
      const error = new Error(messageText);
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const POST = async (
  url: string,
  body: Record<string, unknown> = {},
  signal: AbortSignal | null = null,
) => {
  try {
    const state = store.getState() as AuthState;
    const token: string = state?.Auth?.token ?? " ";
    const response = await fetch(getFullUrl(url), {
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
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const PUT = async (
  url: string,
  body: Record<string, unknown>,
  signal: AbortSignal | null = null,
) => {
  try {
    const state = store.getState() as AuthState;
    const token: string = state?.Auth?.token ?? " ";
    const response = await fetch(getFullUrl(url), {
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
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const PATCH = async (
  url: string,
  body: Record<string, unknown>,
  signal: AbortSignal | null = null,
) => {
  try {
    const state = store.getState() as AuthState;
    const token: string = state?.Auth?.token ?? " ";
    const response = await fetch(getFullUrl(url), {
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
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
const EXCEL_UPLOAD = async (
  file: File,
  category: number,
  subCategory: number,
) => {
  return new Promise(async (resolve, reject) => {
    // const user: any = Store.getState()?.User?.user;
    const state = store.getState();
    const token: string = (state as AuthState)?.Auth?.token ?? " ";

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
          },
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
const DELETE = async (
  url: string,
  signal: AbortSignal | null = null,
  body?: Record<string, any>,
) => {
  try {
    const state = store.getState();
    const token: string = (state as AuthState)?.Auth?.token ?? " ";
    const response = await fetch(getFullUrl(url), {
      ...(signal && { signal }),
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Something went wrong");
      (error as Error & { status?: number }).status = response.status;
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
    const state = store.getState();
    const token: string = (state as AuthState)?.Auth?.token ?? " ";

    const response = await fetch(`${API.BASE_URL}${API.IMAGE_COMPRESS}`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response?.ok)
      return Promise.reject(
        new Error(data?.message ?? "Something went wrong.."),
      );
    return { ...data, url: data.Location, status: true };
  } catch (err: unknown) {
    const error = err as Error;
    // Handle CORS errors
    if (
      error.message.includes("CORS") ||
      error.message.includes("Failed to fetch")
    ) {
      return Promise.reject(
        new Error(
          "Image upload service is unavailable. Please try again later.",
        ),
      );
    }
    return Promise.reject(new Error(error.message));
  }
};
const UPLOAD_IMAGES = async (files: File[]) => {
  const state = store.getState();
  const token: string = (state as AuthState)?.Auth?.token ?? " ";

  // const user: any = store.getState()?.User?.user 0;
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
          },
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
const DOCUMENT_UPLOAD = async (file: File) => {
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
        new Error("Video file size must be less than 50MB"),
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
        new Error("Please upload a valid video file (MP4, MOV, AVI, WEBM)"),
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
  } catch (err: unknown) {
    const error = err as Error;
    message.destroy("video-upload");
    return Promise.reject(new Error(error.message));
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
