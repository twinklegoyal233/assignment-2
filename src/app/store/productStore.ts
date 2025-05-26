import { create } from "zustand";
import { v4 as uuid } from "uuid";

type Product = { 
  id: string; 
  name: string; 
  price: number; 
  brand: string; 
  image: string;
  discount?: { method: 'flat' | 'pct'; value: number; };
};

type Category = { id: string; name: string; products: Product[] };

type Store = {
  categories: Category[];
  addCategory: (name: string) => void;
  addProduct: (categoryId: string, product: Product) => void;
};

// Helper function to validate product pricing
const validateProductPrice = (product: Product): Product => {
  if (!product.discount || product.discount.value <= 0) {
    return product;
  }

  let isValidDiscount = true;
  let finalPrice = product.price;

  if (product.discount.method === 'pct') {
    // Percentage discount should not exceed 100%
    if (product.discount.value > 100) {
      isValidDiscount = false;
    } else {
      finalPrice = product.price - (product.price * product.discount.value) / 100;
    }
  } else {
    // Flat discount should not exceed price
    if (product.discount.value >= product.price) {
      isValidDiscount = false;
    } else {
      finalPrice = product.price - product.discount.value;
    }
  }

  // If discount is invalid or makes price <= 0, remove the discount
  if (!isValidDiscount || finalPrice <= 0) {
    console.warn(`Invalid discount for product ${product.name}. Discount removed.`);
    return {
      ...product,
      discount: undefined
    };
  }

  return product;
};

export const useProductStore = create<Store>((set) => ({
  categories: [
    {
      id: "1",
      name: "Shoes",
      products: [
        { 
          id: "p1", 
          name: "Nike Air Jordan", 
          price: 12000, 
          brand: "Nike", 
          image: "/nike.png",
          
        },
        { 
          id: "p2", 
          name: "Nike Dunk Low", 
          price: 8000, 
          brand: "Nike", 
          image: "/nike.png",
        },
      ],
    },
    { id: "2", name: "T-shirt", products: [] },
  ],
  
  addCategory: (name) =>
    set((state) => ({
      categories: [...state.categories, { id: uuid(), name, products: [] }],
    })),
    
  addProduct: (categoryId, product) => {
    const validatedProduct = validateProductPrice(product);
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId 
          ? { ...cat, products: [...cat.products, validatedProduct] } 
          : cat
      ),
    }));
  },
  
}));