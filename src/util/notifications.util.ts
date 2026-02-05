export const navigateNotification = (id: number, type: string) => {
  if (type == "order") {
    return `/user/orders/${id}`;
  } else {
    return "/";
  }
};

/**
 * Safely extract error message from various error formats
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return "Something went wrong";

  // If it's a string, return it directly
  if (typeof error === "string") return error;

  // If it's an object, try common error message properties
  if (typeof error === "object") {
    // Handle NextAuth errors
    if (error.name === "CredentialsSignin") {
      return "Invalid email or password";
    }

    // Try standard error message properties
    const message =
      error.message ||
      error.msg ||
      error.error ||
      error.detail ||
      error.description;

    if (message && typeof message === "string") {
      return message;
    }

    // If all else fails, check if toString is useful
    const stringified = String(error);
    if (stringified && stringified !== "[object Object]") {
      return stringified;
    }

    return "Something went wrong";
  }

  return String(error);
};
