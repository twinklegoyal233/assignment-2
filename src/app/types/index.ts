// types/index.ts
export type Product = {
  id: string;
  name: string;
  price: number;
  brand: string;
  image: string;
  discount?: {
    method: 'flat' | 'pct';
    value: number;
  };
};

  export type Category = {
    id: string;
    name: string;
    products: Product[];
  };
  