# SmartShop - AI-Powered E-commerce Platform

A modern, feature-rich e-commerce application built with React and Node.js, featuring AI-powered product recommendations, dark mode, and a comprehensive user authentication system.

## 🚀 Features

- **AI-Powered Recommendations**: Intelligent product recommendation system using advanced algorithms
- **Dark Mode**: Toggle between light and dark themes with persistent preferences
- **User Authentication**: Complete login, registration, and dashboard system
- **Shopping Cart**: Full cart functionality with add/remove/update operations
- **Wishlist**: Save favorite products for later
- **Search & Filter**: Advanced product search with filtering capabilities
- **Responsive Design**: Mobile-first responsive UI using Tailwind CSS
- **Real-time Updates**: Live notifications and updates

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Icons**: Lucide React
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS with custom dark mode support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- MongoDB (local or cloud instance)

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Smart-WIth-AI-E-com
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory with the following:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. **Start the development server**
```bash
# For frontend
npm run dev

# For backend (in a separate terminal)
npm run server:dev
```

## 🔧 Available Scripts

- `npm run dev` - Start the Vite development server
- `npm run server:dev` - Start the backend server
- `npm run build` - Build the production version
- `npm run seed:products` - Seed the database with sample products

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # Business logic and services
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── routes/             # Backend route definitions
├── utils/              # Utility functions
└── styles/             # Custom CSS styles
```

## 🎨 Key Features Explained

### Recommendation Engine
The AI-powered recommendation system uses multiple factors to suggest relevant products:
- User behavior tracking (views, clicks, purchases)
- Product similarity (category, brand, price, rating)
- Popularity metrics
- Seasonal trends
- Price compatibility

### Dark Mode Implementation
- Theme preference stored in localStorage
- System preference detection
- Smooth transitions between themes
- Consistent color palette across both themes

### Authentication System
- JWT-based authentication
- Protected routes
- User dashboard with profile management
- Secure password handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact the project maintainers or open an issue in the repository.

---

Made with ❤️ using React, Node.js, and AI technologies"# E-Commerce" 
