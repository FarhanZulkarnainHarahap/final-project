// lib/utils/discount.ts

export interface DiscountType {
  id: string;
  value: number;
  discountType: "PERCENTAGE" | "FIXED";
  minPurchase: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
}

export const calculateDiscountPrice = (
  originalPrice: number,
  discount: DiscountType | null
) => {
  if (!discount)
    return {
      finalPrice: originalPrice,
      discountAmount: 0,
      discountLabel: null,
    };

  let discountAmount = 0;
  let discountLabel = "";

  if (discount.discountType === "PERCENTAGE") {
    discountAmount = (originalPrice * discount.value) / 100;
    if (discount.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
    }
    discountLabel = `${discount.value}% OFF`;
  } else if (discount.discountType === "FIXED") {
    discountAmount = discount.value;
    discountLabel = `Rp ${discount.value.toLocaleString()} OFF`;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);
  return { finalPrice, discountAmount, discountLabel };
};
