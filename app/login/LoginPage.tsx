'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import gsap from 'gsap';

type LoginStep = 'phone' | 'otp' | 'name';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);

  const phoneFormRef = useRef<HTMLDivElement>(null);
  const otpFormRef = useRef<HTMLDivElement>(null);
  const nameFormRef = useRef<HTMLDivElement>(null);
  const firstOtpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let currentRef: HTMLDivElement | null = null;

    if (step === 'phone' && phoneFormRef.current) {
      currentRef = phoneFormRef.current;
    } else if (step === 'otp' && otpFormRef.current) {
      currentRef = otpFormRef.current;
    } else if (step === 'name' && nameFormRef.current) {
      currentRef = nameFormRef.current;
    }

    if (currentRef) {
      gsap.fromTo(
        currentRef,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [step]);

  useEffect(() => {
    // Auto-focus first OTP input when step changes to 'otp'
    if (step === 'otp' && firstOtpInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        firstOtpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyUser(phoneNumber);
      const data = response.data;
      
      setReceivedOtp(data.otp);
      setIsExistingUser(data.user);
      
      toast.success(`OTP sent: ${data.otp}`, { duration: 5000 });
      setStep('otp');
      // Reset OTP when moving to OTP step
      setOtp(['', '', '', '']);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Check if all OTP digits are filled
    const allDigitsFilled = newOtp.every(digit => digit !== '');
    if (allDigitsFilled) {
      // Auto-submit OTP after a small delay
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }, 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      toast.error('Please enter complete OTP');
      return;
    }

    if (enteredOtp !== receivedOtp) {
      toast.error('Invalid OTP');
      return;
    }

    if (isExistingUser) {
      setLoading(true);
      try {
        const response = await authAPI.verifyUser(phoneNumber);
        const token = response.data.token.access;
        
        const { getUserFromToken } = await import('@/lib/token');
        const user = getUserFromToken(token);
        
        if (!user) {
          throw new Error('Failed to decode user token');
        }
        
        setCookie('access_token', token, 7);
        
        login(user);
        toast.success('Login successful!');
        router.push('/');
        router.refresh(); 
      } catch (error: any) {
        toast.error('Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      setStep('name');
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      toast.error('Please enter a valid name');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.registerUser({
        name: name.trim(),
        phone_number: phoneNumber,
      });
      
      const { token, user_id, name: userName, phone_number } = response.data;
      
      setCookie('access_token', token.access, 7);
      
      login({
        user_id,
        name: userName,
        phone_number,
      });
      
      toast.success('Registration successful!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute top-8 left-8 z-10">
        </div>
        
        <img 
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop"
          alt="Basketball player"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-8 left-8">
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
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="relative w-40 h-40">
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

          {step === 'phone' && (
            <div ref={phoneFormRef}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Log In
              </h1>
              
              <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter Phone"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div ref={otpFormRef}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Verify phone
              </h1>
              <p className="text-gray-400 text-sm">
                Enter the OTP sent to {phoneNumber.slice(0, 3)}***{phoneNumber.slice(-4)} 
                <button 
                  onClick={() => setStep('phone')}
                  className="ml-2 text-white hover:underline"
                >
                  ✏️
                </button>
              </p>
              
              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Enter OTP
                  </label>
                  <div className="flex gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        ref={index === 0 ? firstOtpInputRef : null}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full aspect-square px-4 py-3 bg-black border border-gray-700 rounded-md text-white text-center text-xl focus:outline-none focus:border-white transition-colors"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Received OTP: {receivedOtp}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 4}
                  className="w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </div>
          )}

          {step === 'name' && (
            <div ref={nameFormRef}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome, You are?
              </h1>
              
              <form onSubmit={handleNameSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Eg: John Matthew"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || name.trim().length < 2}
                  className="w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-12 flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaXTwitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}