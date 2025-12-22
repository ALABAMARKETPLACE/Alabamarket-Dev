// Naira currency symbol: ₦
export const NAIRA_SYMBOL = "₦";

export const formatPriceWithNaira = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${NAIRA_SYMBOL}0.00`;
  return `${NAIRA_SYMBOL}${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default NAIRA_SYMBOL;
