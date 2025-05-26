
import { create } from "zustand";
import { v4 as uuid } from "uuid";

type Product = { id: string; name: string; price: number; brand: string; image: string };
type Category = { id: string; name: string; products: Product[] };

type Store = {
  categories: Category[];
  addCategory: (name: string) => void;
  addProduct: (categoryId: string, product: Product) => void;
};

export const useProductStore = create<Store>((set) => ({
  categories: [
    {
      id: "1",
      name: "Shoes",
      products: [
        { id: "p1", name: "Nike Air Jordan", price: 12000, brand: "Nike", image: "/nike.svg" },
        { id: "p2", name: "Nike Dunk Low", price: 8000, brand: "Nike", image: "/nike.svg" },
      ],
    },
    { id: "2", name: "T-shirt", products: [] },
  ],
  addCategory: (name) =>
    set((state) => ({
      categories: [...state.categories, { id: uuid(), name, products: [] }],
    })),
  addProduct: (categoryId, product) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, products: [...cat.products, product] } : cat
      ),
    })),
}));
