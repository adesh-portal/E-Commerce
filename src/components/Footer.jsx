// components/AdvancedFooter.jsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Shield,
  Truck,
  RotateCcw,
  CreditCard,
  Star,
  Heart,
  Gift,
  Zap,
  Users,
  Award,
  ChevronUp,
  Send
} from 'lucide-react';

// Newsletter Subscription Algorithm
const useNewsletterAlgorithm = () => {
  const [subscriberCount, setSubscriberCount] = useState(12847);
  const [discount, setDiscount] = useState(10);
  
  useEffect(() => {
    // Simulate real-time subscriber count updates
    const interval = setInterval(() => {
      setSubscriberCount(prev => prev + Math.floor(Math.random() * 3));
    }, 15000);
    
    // Dynamic discount based on time and subscriber engagement
    const discountInterval = setInterval(() => {
      const hour = new Date().getHours();
      const isNightTime = hour > 20 || hour < 6;
      const baseDiscount = isNightTime ? 15 : 10;
      const bonusDiscount = subscriberCount % 1000 < 50 ? 5 : 0;
      setDiscount(baseDiscount + bonusDiscount);
    }, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(discountInterval);
    };
  }, [subscriberCount]);
  
  return { subscriberCount, discount };
};

// Customer Satisfaction Algorithm
const useCustomerSatisfaction = () => {
  const [metrics, setMetrics] = useState({
    rating: 4.8,
    reviews: 15420,
    satisfaction: 96,
    responseTime: 2.4
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        rating: Math.max(4.0, Math.min(5.0, prev.rating + (Math.random() - 0.5) * 0.02)),
        reviews: prev.reviews + Math.floor(Math.random() * 5),
        satisfaction: Math.max(90, Math.min(99, prev.satisfaction + (Math.random() - 0.5) * 2)),
        responseTime: Math.max(1.0, Math.min(5.0, prev.responseTime + (Math.random() - 0.5) * 0.2))
      }));
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};

// Smart Support Routing Algorithm
const useSupportRouting = () => {
  const [queueStatus, setQueueStatus] = useState({
    estimatedWait: 3,
    agentsAvailable: 12,
    currentQueue: 8,
    averageResolution: 15
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const isPeakHours = hour >= 9 && hour <= 17;
      
      setQueueStatus(prev => ({
        estimatedWait: isPeakHours ? Math.max(1, prev.estimatedWait + Math.floor(Math.random() * 3 - 1)) : Math.max(1, 2),
        agentsAvailable: isPeakHours ? Math.max(8, 15 + Math.floor(Math.random() * 5 - 2)) : Math.max(3, 8),
        currentQueue: Math.max(0, prev.currentQueue + Math.floor(Math.random() * 6 - 3)),
        averageResolution: Math.max(5, Math.min(30, prev.averageResolution + Math.floor(Math.random() * 4 - 2)))
      }));
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);
  
  return queueStatus;
};

const AdvancedFooter = ({ 
  onSubscribeNewsletter, 
  onHelpSupport, 
  onAIAssistant,
  onSocialClick,
  darkMode = false 
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const { subscriberCount, discount } = useNewsletterAlgorithm();
  const satisfaction = useCustomerSatisfaction();
  const supportStatus = useSupportRouting();
  
  // Scroll to top visibility algorithm
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Smart newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || isSubscribing) return;
    
    setIsSubscribing(true);
    
    // Simulate API call with smart validation
    setTimeout(() => {
      setSubscribed(true);
      setIsSubscribing(false);
      setEmail('');
      
      if (onSubscribeNewsletter) {
        onSubscribeNewsletter({ 
          email, 
          discount, 
          timestamp: new Date().toISOString(),
          source: 'footer'
        });
      }
      
      // Reset after showing success
      setTimeout(() => setSubscribed(false), 5000);
    }, 2000);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const themeClasses = darkMode 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-100';
  
  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gray-50 border-gray-200';

  return (
    <>
      <footer className={`${themeClasses} border-t transition-all duration-300`}>
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info & Newsletter */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#e88330] to-[#d4771f] bg-clip-text text-transparent">
                  ShopSmart
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Your intelligent shopping companion powered by AI algorithms. 
                  Discover personalized products, dynamic pricing, and smart recommendations.
                </p>
              </div>
              
              {/* Smart Newsletter Subscription */}
              <div className={`${cardClasses} rounded-xl p-6 border`}>
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="text-[#e88330]" size={20} />
                  <h4 className="font-bold">Smart Newsletter</h4>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                    {discount}% OFF
                  </div>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Join {subscriberCount.toLocaleString()}+ smart shoppers getting personalized deals!
                </p>
                
                {!subscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email for AI-curated deals"
                        className={`w-full p-3 pr-12 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-[#e88330] focus:border-transparent transition-all`}
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubscribing}
                        className="absolute right-2 top-2 bg-[#e88330] text-white p-2 rounded-lg hover:bg-[#d4771f] transition-colors disabled:opacity-50"
                      >
                        {isSubscribing ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Shield size={12} className="text-green-600" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Secure</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-blue-600" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>AI-Powered</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift size={12} className="text-purple-600" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Exclusive Deals</span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="text-green-600 fill-current" size={24} />
                    </div>
                    <h4 className="font-bold text-green-600 mb-1">Welcome to the family!</h4>
                    <p className="text-sm text-gray-600">Your {discount}% discount code is on its way!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer Support */}
            <div>
              <h4 className="font-bold text-lg mb-4">Smart Support</h4>
              
              {/* Live Support Status */}
              <div className={`${cardClasses} rounded-lg p-4 border mb-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Support</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Wait Time:</span>
                    <span className="font-bold text-green-600">{supportStatus.estimatedWait} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Agents Online:</span>
                    <span className="font-bold">{supportStatus.agentsAvailable}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={onHelpSupport}
                  className={`w-full flex items-center justify-between p-3 ${cardClasses} border rounded-lg hover:border-[#e88330] transition-all group`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-[#e88330] group-hover:scale-110 transition-transform" size={20} />
                    <div className="text-left">
                      <div className="font-medium">Help Center</div>
                      <div className="text-xs text-gray-500">FAQs & Guides</div>
                    </div>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    24/7
                  </div>
                </button>
                
                <button 
                  onClick={() => onHelpSupport && onHelpSupport('phone')}
                  className={`w-full flex items-center justify-between p-3 ${cardClasses} border rounded-lg hover:border-green-500 transition-all group`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="text-green-600 group-hover:scale-110 transition-transform" size={20} />
                    <div className="text-left">
                      <div className="font-medium">Call Support</div>
                      <div className="text-xs text-gray-500">+1-800-SMART-SHOP</div>
                    </div>
                  </div>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Live
                  </div>
                </button>
              </div>
            </div>
            
            {/* Quick Links & Features */}
            <div>
              <h4 className="font-bold text-lg mb-4">Features</h4>
              
              {/* Customer Satisfaction Metrics */}
              <div className={`${cardClasses} rounded-lg p-4 border mb-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="text-yellow-500" size={20} />
                  <span className="font-medium">Customer Rating</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < Math.floor(satisfaction.rating) ? "text-yellow-400 fill-current" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <span className="font-bold">{satisfaction.rating.toFixed(1)}</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Reviews:</span>
                    <span className="font-bold">{satisfaction.reviews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Satisfaction:</span>
                    <span className="font-bold text-green-600">{satisfaction.satisfaction}%</span>
                  </div>
                </div>
              </div>
              
              {/* Service Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="text-blue-600" size={16} />
                  <span>Free Shipping over ₹41,650</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="text-green-600" size={16} />
                  <span>30-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="text-purple-600" size={16} />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="text-orange-600" size={16} />
                  <span>EMI Options Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Assistant & Social Section */}
        <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* AI Assistant */}
              <div className="flex-1">
                <button 
                  onClick={onAIAssistant}
                  className="group bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 hover:from-purple-700 hover:via-blue-700 hover:to-green-600 flex items-center justify-center w-full lg:w-auto px-8 py-4 rounded-xl text-white font-bold gap-3 hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
                >
                  <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                  <div className="text-left">
                    <div>Ask AI Shopping Assistant</div>
                    <div className="text-sm opacity-90 font-normal">Powered by advanced ML algorithms</div>
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    Beta
                  </div>
                </button>
              </div>
              
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Follow Us:
                </span>
                <div className="flex gap-3">
                  {[
                    { Icon: Facebook, color: 'hover:text-blue-600', platform: 'facebook' },
                    { Icon: Twitter, color: 'hover:text-blue-400', platform: 'twitter' },
                    { Icon: Instagram, color: 'hover:text-pink-600', platform: 'instagram' },
                    { Icon: Youtube, color: 'hover:text-red-600', platform: 'youtube' }
                  ].map(({ Icon, color, platform }) => (
                    <button
                      key={platform}
                      onClick={() => onSocialClick && onSocialClick(platform)}
                      className={`w-10 h-10 ${cardClasses} border rounded-lg flex items-center justify-center ${color} transition-all hover:scale-110 hover:shadow-md`}
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-4`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className={`flex items-center gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>© 2025 ShopSmart. All rights reserved.</span>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{subscriberCount.toLocaleString()} happy customers</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Privacy Policy
                </a>
                <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Terms of Service
                </a>
                <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#e88330] hover:bg-[#d4771f] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

export default AdvancedFooter;