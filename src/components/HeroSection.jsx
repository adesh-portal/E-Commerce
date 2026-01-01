// components/HeroSection.jsx
import { useEffect, useRef, useState } from 'react';

const HeroSection = ({ onShopNow, onLearnMore, variant = 'classic' }) => {
  const titleRef = useRef(null);
  const [animate, setAnimate] = useState(false);
  const isElegant = variant === 'elegant';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimate(true);
            observer.disconnect(); // Run only once
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="@container">
      <div className="@[480px]:p-6">
        <div
          className={`flex min-h-[520px] flex-col gap-8 bg-cover bg-center bg-no-repeat @[480px]:gap-10 @[480px]:rounded-xl items-center justify-center p-6 relative ${isElegant ? 'bg-[#f8f5f1]' : 'bg-gray-800'}`}
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?fit=crop&w=1600&q=80')",
          }}
        >
          {/* Overlay */}
          <div className={`absolute inset-0 ${isElegant ? 'bg-white/60 @[480px]:rounded-xl' : 'bg-black/70 @[480px]:rounded-xl'}`}></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-6 text-center max-w-4xl mx-auto">
            {/* Title */}
            <h1
              ref={titleRef}
              className={`text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-6xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] bg-gradient-to-r ${isElegant ? 'from-[#e88330] via-[#976f4e] to-[#1b140e]' : 'from-cyan-400 via-purple-500 to-green-400'} bg-clip-text text-transparent mb-4 ${
                animate
                  ? 'animate-gradient animate-fadeUp'
                  : 'opacity-0 translate-y-6'
              }`}
            >
              Shop Smarter — Fixed Prices, Managed by AI
            </h1>

            {/* Subtitle */}
            <h2 className={`${isElegant ? 'text-[#1b140e]/80' : 'text-white/90'} text-base font-normal leading-relaxed @[480px]:text-lg @[480px]:font-normal @[480px]:leading-relaxed max-w-[700px] mx-auto mb-6`}>
              Discover a new way to shop with AI-powered pricing and personalized recommendations.
            </h2>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={onShopNow}
                className={`${isElegant ? 'bg-[#e88330] hover:bg-[#d67429]' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'} flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 text-white hover:scale-105 hover:shadow-lg transition-all text-base font-bold leading-normal tracking-[0.015em]`}
              >
                Shop Now
              </button>
              <button
                onClick={onLearnMore}
                className={`flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 ${isElegant ? 'bg-white text-[#1b140e] border border-[#f3ede7] hover:bg-[#f8f5f1]' : 'bg-black/60 text-white border border-white/50 hover:bg-black/80 backdrop-blur-sm'} transition-all text-base font-bold leading-normal tracking-[0.015em]`}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 5s ease-in-out forwards;
        }
        .animate-fadeUp {
          animation: fadeUp 1.2s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
