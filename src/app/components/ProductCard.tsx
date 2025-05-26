// components/ProductCard.tsx
import { Product } from "../types/index";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
  const getFinalPrice = (
    price: number,
    discount?: { method: "flat" | "pct"; value: number }
  ) => {
    if (!discount || discount.value === 0) return price;
    return discount.method === "pct"
      ? price - (price * discount.value) / 100
      : price - discount.value;
  };

  const finalPrice = getFinalPrice(product.price, product.discount);
  const isDiscounted =
    product.discount && product.discount.value > 0;

  return (
    <div className="bg-white p-2 rounded-[10px] shadow-sm flex items-center gap-4">
      <Image
       src={product.image || '/fallbackImage.png'}
        alt="product image"
        width={84}
        height={84}
        className="rounded-lg object-contain"
      />
      <div>
        <h3 className="font-medium">{product.name}</h3>
        <div className="text-sm mb-2">
          <span className="font-semibold text-black">
            ₹{finalPrice.toLocaleString()}
          </span>
          {isDiscounted && (
            <span className="line-through text-gray-500 text-xs ml-2">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
        <span className="text-xs bg-[#ECF7FF] text-[#1F8CD0] px-2 py-1 rounded">
          {product.brand}
        </span>
      </div>
    </div>
  );
}
