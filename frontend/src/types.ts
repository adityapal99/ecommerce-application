export type Product = {
  _id: string;
  name: string;
  price: number;
  sku?: string;
  image?: string;
};
export type CartItem = {
  _id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
};
export type Cart = { items: CartItem[]; total: number };
