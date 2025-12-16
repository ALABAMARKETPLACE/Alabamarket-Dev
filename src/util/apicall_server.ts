import API from "@/config/API";

const GET_SERVER = async (
  url: string,
  params: Record<string, any> = {},
  signal: AbortSignal | null = null,
  token: string = ""
) => {
  try {
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

export { GET_SERVER };
