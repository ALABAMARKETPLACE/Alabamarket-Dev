function showPrice(price: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
  })
    .format(Number(price))
    .replace("NGN", "₦");
}
export default showPrice;
