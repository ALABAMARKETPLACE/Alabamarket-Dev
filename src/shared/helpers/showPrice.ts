function showPrice(price: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
  }).format(Number(price));
}
export default showPrice;
