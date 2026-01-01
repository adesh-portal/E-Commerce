// components/CategoryGrid.jsx
import React, { useState } from 'react';

const CategoryGrid = ({ onCategorySelect }) => {
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { id: 1, name: 'Electronics', image: '📱', color: 'bg-blue-50' },
    { id: 2, name: 'Fashion', image: '👕', color: 'bg-pink-50' },
    { id: 3, name: 'Home & Living', image: '🏠', color: 'bg-green-50' },
    { id: 4, name: 'Beauty', image: '💄', color: 'bg-purple-50' },
    { id: 5, name: 'Toys', image: '🧸', color: 'bg-yellow-50' },
    { id: 6, name: 'Shoes', image: '👟', color: 'bg-orange-50' },
  ];

  const extraCategories = [
    { id: 7, name: 'Kitchen', image: '🍳', color: 'bg-red-50' },
    { id: 8, name: 'Sports', image: '⚽', color: 'bg-blue-50' },
    { id: 9, name: 'Books', image: '📚', color: 'bg-indigo-50' },
  ];

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <h2 className="text-3xl font-bold text-center text-black mb-10">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`flex flex-col items-center ${category.color} hover:bg-gray-100 p-5 rounded-lg shadow-sm transition cursor-pointer transform hover:scale-105`}
            >
              <div className="w-24 h-24 flex items-center justify-center text-4xl rounded-full mb-4 bg-white shadow-sm">
                {category.image}
              </div>
              <span className="text-sm font-medium text-gray-800">{category.name}</span>
            </div>
          ))}

          {showAll && extraCategories.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`flex flex-col items-center ${category.color} hover:bg-gray-100 p-5 rounded-lg shadow-sm transition cursor-pointer transform hover:scale-105`}
            >
              <div className="w-24 h-24 flex items-center justify-center text-4xl rounded-full mb-4 bg-white shadow-sm">
                {category.image}
              </div>
              <span className="text-sm font-medium text-gray-800">{category.name}</span>
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mt-10">
            <button 
              onClick={() => setShowAll(true)}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
            >
              Show All Categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;