export const formatRupee = (amount) => {
  if (isNaN(amount)) {
    throw new Error("Invalid number");
  }

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
