  // components/SpecialOfferBanner.jsx
  import React from 'react';

  const SpecialOfferBanner = ({ 
    title = "Limited Time Offer!",
    description = "Get 20% off on orders above ₹41,650. Use code: SAVE20",
    expiryText = "Expires in 2 days",
    buttonText = "Shop Now",
    onShopNow,
    bgGradient = "from-gray-900 to-gray-600"
  }) => {
    return (
      <div className={`mx-6 my-10 bg-gradient-to-r ${bgGradient} rounded-xl p-8 text-white shadow-lg`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl lg:text-3xl font-bold mb-3">{title}</h3>
            <p className="text-lg lg:text-xl opacity-90 mb-2">{description}</p>
            {expiryText && (
              <p className="text-sm opacity-75 mt-2">{expiryText}</p>
            )}
          </div>
          <div className="text-center lg:text-right">
            <button 
              onClick={onShopNow}
              className="bg-white text-[#e88330] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default SpecialOfferBanner;