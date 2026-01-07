'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import gsap from 'gsap';

interface OrderDetails {
  id: string;
  product_name: string;
  variation_name?: string;
  price: number;
  original_price?: number;
  image_url: string;
  created_at: string;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const orderId = searchParams.get('orderId');
    const productName = searchParams.get('productName');
    const variationName = searchParams.get('variationName');
    const price = searchParams.get('price');
    const originalPrice = searchParams.get('originalPrice');
    const imageUrl = searchParams.get('imageUrl');
    const createdAt = searchParams.get('createdAt');

    if (orderId && productName && price && imageUrl) {
      setOrderDetails({
        id: orderId,
        product_name: productName,
        variation_name: variationName || undefined,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        image_url: imageUrl,
        created_at: createdAt || new Date().toISOString(),
      });
    }
  }, [isAuthenticated, router, searchParams]);

  useEffect(() => {
    if (orderDetails && logoRef.current && titleRef.current && dateRef.current && cardRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      .fromTo(
        dateRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        '-=0.2'
      )
      .fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      );
    }
  }, [orderDetails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).replace(',', ',');
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      <div ref={logoRef} className="mb-8">
        <div className="relative w-30 h-30">
          <Image
            src="/nlogo.png" 
            alt="Nike"
            fill
            sizes="40px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
      <h1 
        ref={titleRef}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-center"
      >
        Successfully Ordered!
      </h1>

      <p 
        ref={dateRef}
        className="text-gray-400 text-sm md:text-base mb-12"
      >
        {formatDate(orderDetails.created_at)}
      </p>

      <div 
        ref={cardRef}
        className="w-full max-w-2xl bg-[#1a1a1a] rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#c4f34a] to-[#9dc43a] rounded-xl flex items-center justify-center p-4">
            <img
              src={orderDetails.image_url}
              alt={orderDetails.product_name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-grow">
            <h2 className="text-white text-xl md:text-2xl font-semibold mb-2">
              {orderDetails.product_name}
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-4">
              {orderDetails.variation_name || 'Standard'}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="text-white text-xl md:text-2xl font-bold">
              ₹{orderDetails.price.toLocaleString('en-IN')}
            </div>
            {orderDetails.original_price && orderDetails.original_price > orderDetails.price && (
              <div className="text-gray-500 text-sm line-through">
                ₹{orderDetails.original_price.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Order ID</span>
            <span className="text-white font-mono">{orderDetails.id}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/')}
        className="mt-8 px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
      >
        Continue Shopping
      </button>
    </div>
  );
}