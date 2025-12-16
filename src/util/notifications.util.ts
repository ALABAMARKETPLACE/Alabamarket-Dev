export const navigateNotification = (id: number, type: string) => {
  if (type == "order") {
    return `/user/orders/${id}`;
  } else {
    return "/";
  }
};
