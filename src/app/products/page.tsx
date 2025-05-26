'use client';
import "../../app/global.css"
import Header from "../components/Header";
import CategoryColumn from "../components/CategoryColumn";
import { useProductStore } from "../store/productStore";

export default function ProductsPage() {
  const categories = useProductStore((state) => state.categories);

  return (
    <>
   
        <Header />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categories.map((cat) => (
            <CategoryColumn key={cat.id} category={cat} />
          ))}
        </div>
    </>
  );
}
