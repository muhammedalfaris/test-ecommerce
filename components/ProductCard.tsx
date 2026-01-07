'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface ProductVariation {
  id: string;
  color: string;
  image_url: string;
  size?: string;
  price: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  brand_logo?: string;
  image_url: string;
  variations?: ProductVariation[];
  price?: number;
  sizes?: string[];
}

export default function ProductCard({ 
  id, 
  name, 
  image_url, 
  variations = [],
  sizes = []
}: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImage, setCurrentImage] = useState(image_url);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const colors = variations
    .map(v => ({ name: v.color, image: v.image_url }))
    .filter((v, i, a) => a.findIndex(x => x.name === v.name) === i);

  const availableSizes = selectedColor
    ? variations.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean)
    : sizes;

  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const nameEl = nameRef.current;
    const sizeEl = sizeRef.current;
    const colorEl = colorRef.current;
    const buttonEl = buttonRef.current;

    if (!card || !image || !nameEl) return;

    gsap.set([sizeEl, colorEl, buttonEl], { 
      opacity: 0,
      y: 10
    });

    const handleMouseEnter = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline();
      timelineRef.current = tl;
      
      tl.to(image, {
        y: -30,
        scale: 1.1,
        duration: 0.4,
        ease: 'power3.out'
      })

      .to(sizeEl, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.2')

      .to(colorEl, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.15')

      .to(buttonEl, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.15');
    };

    const handleMouseLeave = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline();
      timelineRef.current = tl;
      
      tl.to([buttonEl, colorEl, sizeEl], {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        stagger: 0.05
      })
      .to(image, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.inOut'
      }, '-=0.1');
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [availableSizes.length, colors.length]);

  const handleColorChange = (colorName: string, colorImage: string) => {
    setSelectedColor(colorName);
    setCurrentImage(colorImage);
    setSelectedSize('');
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.dismiss();
      toast.error('Please login to purchase', { duration: 3000 });
      router.push('/login');
      return;
    }

    let variationId = id;
    if (selectedColor && selectedSize) {
      const variation = variations.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      if (variation) {
        variationId = variation.id;
      }
    }

    setPurchasing(true);

    try {
      const response = await authAPI.purchaseProduct({
        product_id: variationId
      });

      const orderData = response.data.order;
      
      toast.success('Order placed successfully!');

      const queryParams = new URLSearchParams({
        orderId: orderData.id,
        productName: name,
        price: orderData.total_amount.toString(),
        imageUrl: currentImage,
        createdAt: new Date().toISOString(),
      });

      router.push(`/order-success?${queryParams.toString()}`);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative bg-[#2a2a2a] rounded-2xl overflow-hidden cursor-pointer h-[400px] flex flex-col"
    >
      <div className="relative flex-1 overflow-hidden">
        <img
          ref={imageRef}
          src={currentImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-4 space-y-3">
        <h3 ref={nameRef} className="text-white text-base font-bold uppercase tracking-wide">
          {name}
        </h3>

        {availableSizes.length > 0 && (
          <div ref={sizeRef} className="opacity-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-gray-300 text-xs uppercase tracking-wide">Size:</span>
              <span className="text-white text-xs font-semibold">
                {selectedSize || availableSizes[0]}
              </span>
            </div>
            <div className="flex gap-1.5">
              {availableSizes.map((size, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(size || '')}
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                    selectedSize === size || (!selectedSize && idx === 0)
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-gray-500 hover:border-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div ref={colorRef} className="opacity-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-gray-300 text-xs uppercase tracking-wide">Color:</span>
              <span className="text-white text-xs font-semibold capitalize">
                {selectedColor || colors[0].name}
              </span>
            </div>
            <div className="flex gap-1.5">
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorChange(color.name, color.image)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedColor === color.name || (!selectedColor && idx === 0)
                      ? 'border-white scale-110'
                      : 'border-gray-500 hover:border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: getColorValue(color.name),
                    boxShadow: selectedColor === color.name || (!selectedColor && idx === 0) 
                      ? '0 0 8px rgba(255,255,255,0.5)' 
                      : 'none'
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        <button
          ref={buttonRef}
          onClick={handleBuyNow}
          disabled={purchasing}
          className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-300 uppercase text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed opacity-0"
        >
          {purchasing ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}

function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#DC2626',
    'Blue': '#3B82F6',
    'Green': '#10B981',
    'Yellow': '#FBBF24',
    'Purple': '#A855F7',
    'Pink': '#EC4899',
    'Orange': '#F97316',
    'Gray': '#6B7280',
    'Brown': '#92400E',
  };
  
  return colorMap[colorName] || '#888888';
}