// components/Header.tsx
"use client";
import { useRouter } from "next/navigation";
import { useModalStore } from "../store/modalstore";

export default function Header() {
  const router = useRouter();
const openAddCategory = useModalStore((state) => state.openAddCategory)
return (
  <div className="flex justify-between items-center mt-6">
    <h1 className="text-2xl font-semibold">Products</h1>
    <div className="flex gap-4">
      <button onClick={openAddCategory} className="bg-[#E1E7EB] px-6 py-2 font-semibold rounded-lg text-[#1F8CD0]">
        Add Category
      </button>
      <button onClick={() => router.push("/add-product")} className="bg-[#1F8CD0] text-white px-6 font-semibold rounded-lg py-2">
        Add Product
      </button>
    </div>
  </div>
);
}