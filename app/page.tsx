'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

interface APIProduct {
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

interface ProductVariation {
  id: string;
  color: string;
  image_url: string;
  size?: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  brand_logo?: string;
  image_url: string;
  price: number;
  variations?: ProductVariation[];
  sizes?: string[];
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getNewProducts();
        
        // Transform API data to match component structure
        const transformedProducts: Product[] = response.data.map((apiProduct: APIProduct) => {
          const variations: ProductVariation[] = [];
          const availableSizes = new Set<string>();

          // Extract variations from variation_colors
          apiProduct.variation_colors.forEach((colorVariation) => {
            if (colorVariation.status && colorVariation.color_images.length > 0) {
              colorVariation.sizes.forEach((size) => {
                if (size.status && size.price) {
                  availableSizes.add(size.size_name);
                  variations.push({
                    id: size.variation_product_id.toString(),
                    color: colorVariation.color_name,
                    image_url: colorVariation.color_images[0],
                    size: size.size_name,
                    price: size.price
                  });
                }
              });
            }
          });

          return {
            id: apiProduct.id,
            name: apiProduct.name,
            image_url: apiProduct.product_images[0]?.product_image || '',
            price: apiProduct.sale_price,
            variations: variations,
            sizes: Array.from(availableSizes).sort()
          };
        });

        setProducts(transformedProducts);
      } catch (error: any) {
        toast.error('Failed to load products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Men's Jordan Shoes
          </h1>
          <p className="text-gray-400 text-lg">
            Discover the latest collection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brand_logo={product.brand_logo}
              image_url={product.image_url}
              variations={product.variations}
              price={product.price}
              sizes={product.sizes}
            />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
}