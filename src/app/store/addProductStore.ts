import { create } from 'zustand';

export interface ProductFormData {
  name: string;
  category: string; 
  brand: string;
  image?: string;
  step?: number;
  priceInr?: number; 
  discount?: {
    method: 'pct' | 'flat';
    value: number;
  };
  variants?: {
    name: string; 
    values: string[];
  }[];
  combinations?: {
    [key: string]: {
      name: string;
      sku: string;
      quantity: number | null;
      inStock: boolean;
    };
  };
}

interface AddProductState {
  step: number;
  data: ProductFormData;
  updateData: (values: Partial<ProductFormData>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useAddProductStore = create<AddProductState>((set) => ({
  step: 0,
  data: {
    name: '',
    category: '',
    brand: '',
    image: '',
    priceInr: undefined,
    discount: {
      method: 'pct',
      value: 0,
    },
    variants: [],
    combinations: {},
  },
  updateData: (values) =>
    set((state) => ({
      data: {
        ...state.data,
        ...values,
     
        discount: values.discount
          ? { ...state.data.discount, ...values.discount }
          : state.data.discount,
      },
    })),
  setStep: (step) => set({ step }),
  reset: () =>
    set({
      step: 0,
      data: {
        name: '',
        category: '',
        brand: '',
        image: '',
        priceInr: undefined,
        discount: {
          method: 'pct',
          value: 0,
        },
        variants: [],
        combinations: {},
      },
    }),
}));
