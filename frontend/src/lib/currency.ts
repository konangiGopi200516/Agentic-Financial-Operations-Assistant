// Shared currency formatter — Indian Rupees (₹)
export const formatCurrency = (amount: number | string) => {
  const val = parseFloat(String(amount)) || 0;
  return `₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
