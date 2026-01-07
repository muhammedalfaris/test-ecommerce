'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api-client';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import BicycleLoader from '@/components/Loader';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi'; // Added FiLogOut

interface OrderItem {
  id: string;
  product_name: string;
  variation_name?: string;
  price: number;
  original_price?: number;
  image_url: string;
  created_at: string;
  payment_status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { logout } = useAuthStore();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ordersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, router]);

const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await authAPI.getUserOrders();
    
    if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
      const formattedOrders = response.data.orders.map((order: { order_id: any; product_name: any; product_price: any; product_mrp: any; product_image: any; created_date: any; payment_status: any; }) => ({
        id: order.order_id,
        product_name: order.product_name,
        variation_name: '', 
        price: order.product_price,
        original_price: order.product_mrp,
        image_url: order.product_image,
        created_at: order.created_date,
        payment_status: order.payment_status || 'Completed' 
      }));
      
      setOrders(formattedOrders);
    } else {
      console.error('Unexpected response structure:', response.data);
      toast.error('Failed to load orders');
      setOrders([]);
    }
  } catch (error: any) {
    toast.error('Failed to load orders');
    console.error('Error fetching orders:', error);
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!loading && orders.length > 0) {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }

      ordersRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.5, 
              delay: index * 0.1,
              ease: 'power2.out' 
            }
          );
        }
      });
    }
  }, [loading, orders]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <BicycleLoader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            {/* Back Arrow Button */}
            <button
              onClick={() => router.back()}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            
            <h1 
              ref={titleRef}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              My Orders
            </h1>
          </div>
          
          {/* Desktop: No logout button */}
          {/* Mobile: Logout icon button */}
          <button
            onClick={handleLogout}
            className="md:hidden p-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
            aria-label="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-6">No orders yet</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id}
                ref={(el) => {
                  if (el) ordersRef.current[index] = el;
                }}
                className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 hover:bg-[#222] transition-colors duration-300"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#c4f34a] to-[#9dc43a] rounded-xl flex items-center justify-center p-6">
                    <img
                      src={order.image_url}
                      alt={order.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-grow">
                    <h2 className="text-white text-xl md:text-2xl font-semibold mb-2">
                      {order.product_name}
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base mb-3">
                      {order.variation_name || 'Standard'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right w-full md:w-auto">
                    <div className="text-white text-2xl md:text-3xl font-bold mb-1">
                      ₹{order.price.toLocaleString('en-IN')}
                    </div>
                    {order.original_price && order.original_price > order.price && (
                      <div className="text-gray-500 text-base line-through mb-2">
                        ₹{order.original_price.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      {order.payment_status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}