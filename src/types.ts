export interface Product {
  id: string;
  name: string;
  type: string;
  subcategory?: string;
  price: number;
  url: string;
  description?: string;
  isNew?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
