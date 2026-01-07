import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BicycleLoaderProps {
  size?: number;
  color?: string;
}

const BicycleLoader: React.FC<BicycleLoaderProps> = ({ 
  size = 106, 
  color = '#e1e1e1' 
}) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const frontWheelRef = useRef<HTMLDivElement>(null);
  const backWheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current || !frontWheelRef.current || !backWheelRef.current) return;

    const wheelTimeline = gsap.timeline({ repeat: -1 });
    
    wheelTimeline.to([frontWheelRef.current, backWheelRef.current], {
      rotation: 360,
      duration: 0.3,
      ease: 'none',
    });

    gsap.to(loaderRef.current, {
      y: -5,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(loaderRef.current, {
      rotation: -43,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      wheelTimeline.kill();
      gsap.killTweensOf(loaderRef.current);
    };
  }, []);

  const scale = size / 106;

  return (
    <div
      ref={loaderRef}
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size * 0.528}px`,
        transform: `scale(${scale}) rotate(-45deg)`,
        transformOrigin: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${color} 50px, transparent 0),
            linear-gradient(${color} 50px, transparent 0),
            linear-gradient(${color} 50px, transparent 0),
            linear-gradient(${color} 50px, transparent 0),
            radial-gradient(circle 14px, ${color} 100%, transparent 0)
          `,
          backgroundSize: '48px 15px, 15px 35px, 15px 35px, 25px 15px, 28px 28px',
          backgroundPosition: '25px 5px, 58px 20px, 25px 17px, 2px 37px, 76px 0px',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        ref={backWheelRef}
        className="absolute rounded-full"
        style={{
          width: '56px',
          height: '56px',
          border: `6px solid ${color}`,
          left: '-45px',
          top: '-10px',
          backgroundImage: `
            linear-gradient(${color} 64px, transparent 0),
            linear-gradient(${color} 66px, transparent 0),
            radial-gradient(circle 4px, ${color} 100%, transparent 0)
          `,
          backgroundSize: '40px 1px, 1px 40px, 8px 8px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        ref={frontWheelRef}
        className="absolute rounded-full"
        style={{
          width: '56px',
          height: '56px',
          border: `6px solid ${color}`,
          left: '25px',
          top: '60px',
          backgroundImage: `
            linear-gradient(${color} 64px, transparent 0),
            linear-gradient(${color} 66px, transparent 0),
            radial-gradient(circle 4px, ${color} 100%, transparent 0)
          `,
          backgroundSize: '40px 1px, 1px 40px, 8px 8px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};

export default BicycleLoader;