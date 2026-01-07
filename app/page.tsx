import { getNewProductsServer } from '@/lib/api-server';
import ProductGrid from '@/components/ProductGrid';
import { Product, APIProduct } from '@/types/resType';

function transformProduct(apiProduct: APIProduct): Product {
  const variations: Product['variations'] = [];
  const availableSizes = new Set<string>();

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
}

export default async function HomePage() {
  let products: Product[] = [];

  try {
    const response = await getNewProductsServer();
    
    const apiProducts: APIProduct[] = response.data || response;
    
    if (Array.isArray(apiProducts)) {
      products = apiProducts.map(transformProduct);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return <ProductGrid products={products} />;
}