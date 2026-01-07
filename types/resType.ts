export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  brand_logo?: string;
  colors?: string[];
  sizes?: string[];
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: string;
  product_id?: string;
  color: string;
  size?: string;
  price: number;
  image_url: string;
}

export interface Order {
  id: string;
  total_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Failed';
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}

export interface VerifyResponse {
  otp: string;
  token?: {
    access: string;
  };
  user: boolean;
}

export interface RegisterResponse {
  token: {
    access: string;
  };
  user_id: string;
  name: string;
  phone_number: string;
  message: string;
}

export interface PurchaseResponse {
  message: string;
  order: {
    id: string;
    total_amount: number;
    payment_status: string;
  };
}

export interface OrdersResponse {
  count: number;
  orders: OrderItem[];
}

export interface APIProduct {
  id: string;
  name: string;
  product_images: Array<{
    product_image: string;
  }>;
  variation_colors: Array<{
    color_id: number;
    color_name: string;
    color_images: string[];
    status: boolean;
    sizes: Array<{
      size_id: number;
      variation_product_id: number;
      size_name: string;
      status: boolean;
      price: number | null;
    }>;
  }>;
  sale_price: number;
  mrp: number;
  new: boolean;
  discount: number;
  out_of_stock: boolean;
  slug: string;
}