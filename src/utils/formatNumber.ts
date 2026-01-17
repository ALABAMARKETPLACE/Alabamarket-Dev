export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = (value: number | string | undefined | null): string => {
   // This one ensures 2 decimal places if that's preferred for prices
   if (value === undefined || value === null) return "0.00";
   const num = typeof value === "string" ? parseFloat(value) : value;
   if (isNaN(num)) return "0.00";
   
   return num.toLocaleString("en-US", {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   });
}
