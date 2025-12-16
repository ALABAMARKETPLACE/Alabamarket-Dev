const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
  }).format(amount);
};

export default formatPrice;
