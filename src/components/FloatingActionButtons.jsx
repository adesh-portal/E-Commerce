// components/FloatingActionButtons.jsx
import React from 'react';
import { Image, Zap, MessageSquare, ArrowUp } from 'lucide-react';

const FloatingActionButtons = ({ 
  onImageSearch, 
  onQuickActions, 
  onChatSupport, 
  onScrollToTop,
  showScrollToTop = false 
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {showScrollToTop && (
        <button 
          onClick={onScrollToTop}
          className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          title="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
      
      <button 
        onClick={onChatSupport}
        className="w-14 h-14 bg-[#e88330] text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        title="AI Chat Support"
      >
        <MessageSquare size={24} />
      </button>
      
      <button 
        onClick={onImageSearch}
        className="w-14 h-14 bg-[#e88330] text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        title="Image Search"
      >
        <Image size={24} />
      </button>
      
      <button 
        onClick={onQuickActions}
        className="w-14 h-14 bg-white text-[#e88330] rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center border-2 border-[#e88330]"
        title="Quick Actions"
      >
        <Zap size={24} />
      </button>
    </div>
  );
};

export default FloatingActionButtons;