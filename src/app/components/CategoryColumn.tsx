// components/CategoryColumn.tsx
import { Category } from "../types/index";
import ProductCard from "./ProductCard";

export default function CategoryColumn({ category }: { category: Category }) {
  return (
    <div className="bg-[#F8F8F8] p-4 rounded-[10px] min-h-[300px]">
      <h2 className="font-medium mb-4">{category.name}</h2>
      <div className="flex flex-col gap-4">
        {category.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
