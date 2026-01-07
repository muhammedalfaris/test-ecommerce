'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/resType';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }

    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('[data-product-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div ref={titleRef} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Men's Jordan Shoes
          </h1>
          <p className="text-gray-400 text-lg">
            Discover the latest collection
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {products.map((product) => (
            <div key={product.id} data-product-card>
              <ProductCard
                id={product.id}
                name={product.name}
                brand_logo={product.brand_logo}
                image_url={product.image_url}
                variations={product.variations}
                price={product.price}
                sizes={product.sizes}
              />
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
}

